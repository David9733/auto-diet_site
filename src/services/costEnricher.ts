/**
 * 원가 정보 보강 서비스
 * katOnline API를 사용하여 하드코딩 식단의 원가 정보를 실시간 시세로 업데이트
 */

import { MenuItem, Meal, DayMealPlan, WeekMealPlan } from '@/types/meal';
import { getKatOnlineAPI } from './katOnlineAPI';

const COST_CACHE_KEY = 'cost_cache_v1';
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24시간

interface CostData {
  pricePerKg: number;       // 원/kg
  pricePer100g: number;     // 원/100g
  date: string;             // 조회 날짜
  timestamp: number;
}

interface CostCache {
  [itemName: string]: CostData;
}

/**
 * 식재료명 → katOnline 품목명 매핑
 * mainIngredients에서 katOnline API 품목명으로 변환
 */
const INGREDIENT_MAPPING: Record<string, string> = {
  // 곡류
  '쌀': '일반미',
  '현미': '현미',
  '잡곡': '잡곡',
  '보리': '보리',
  
  // 서류
  '감자': '감자',
  '고구마': '고구마',
  
  // 채소류
  '양배추': '양배추',
  '배추': '배추',
  '무': '무',
  '당근': '당근',
  '양파': '양파',
  '대파': '대파',
  '마늘': '마늘',
  '생강': '생강',
  '시금치': '시금치',
  '상추': '상추',
  '깻잎': '깻잎',
  '호박': '호박',
  '애호박': '애호박',
  '가지': '가지',
  '오이': '오이',
  '브로콜리': '브로콜리',
  '파프리카': '파프리카',
  '청경채': '청경채',
  
  // 과일류
  '사과': '사과',
  '배': '배',
  '포도': '포도',
  '복숭아': '복숭아',
  '자두': '자두',
  '수박': '수박',
  '참외': '참외',
  '딸기': '딸기',
  '바나나': '바나나',
  
  // 축산물 (국내산육류, 기타동물성산물)
  '소고기': '지육', // 한우 지육
  '한우': '지육',
  '돼지고기': '지육', // 돈육 지육
  '돈육': '지육',
  '닭고기': '닭',
  '닭': '닭',
  '계란': '계란',
  '달걀': '계란',
  
  // 수산물 (냉동/신선 해면어류)
  '명태': '명태',
  '고등어': '고등어',
  '갈치': '갈치',
  '오징어': '오징어',
  '조기': '조기',
  '삼치': '삼치',
};

/**
 * 로컬 스토리지에서 원가 캐시 로드
 */
function loadCostCache(): CostCache {
  if (typeof window === 'undefined') return {};
  
  try {
    const cached = localStorage.getItem(COST_CACHE_KEY);
    if (!cached) return {};
    
    const cache: CostCache = JSON.parse(cached);
    const now = Date.now();
    
    // 만료된 항목 제거
    Object.keys(cache).forEach(key => {
      if (now - cache[key].timestamp > CACHE_EXPIRY_MS) {
        delete cache[key];
      }
    });
    
    return cache;
  } catch (error) {
    console.error('원가 캐시 로드 실패:', error);
    return {};
  }
}

/**
 * 원가 캐시 저장
 */
function saveCostCache(cache: CostCache): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(COST_CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error('원가 캐시 저장 실패:', error);
  }
}

/**
 * 최근 거래 날짜 자동 찾기 (최대 30일 전까지)
 */
async function findRecentTradeDate(): Promise<string | null> {
  const katAPI = getKatOnlineAPI();
  const today = new Date();
  
  // 최근 30일 동안 거래 데이터가 있는 날짜 찾기
  for (let daysAgo = 0; daysAgo <= 30; daysAgo++) {
    const date = new Date(today);
    date.setDate(date.getDate() - daysAgo);
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
    
    try {
      // KatOnlineAPI.getTrades 내부에 Rate Limit + 재시도(fetchWithRetry)가 이미 포함되어 있어
      // 여기서는 중첩 재시도를 피하기 위해 단순 호출만 합니다.
      const response = await katAPI.getTrades({
        cfmtnYmd: dateStr,
        numOfRows: 1, // 최소 요청
      });
      
      const items = response.response?.body?.items?.item || [];
      if (items.length > 0) {
        console.log(`✅ 최근 거래 날짜 발견: ${dateStr}`);
        return dateStr;
      }
    } catch (error: any) {
      // 설정 문제(키 누락/권한)면 30일 루프를 도는 의미가 없으므로 즉시 종료
      const message = typeof error?.message === 'string' ? error.message : '';
      const code = error?.code;
      if (
        code === 'KAT_ONLINE_KEY_MISSING' ||
        code === 'KAT_ONLINE_UNAUTHORIZED' ||
        message.includes('KAT_ONLINE_SERVICE_KEY')
      ) {
        console.warn('⚠️ katOnline 설정 문제로 원가 보강을 건너뜁니다:', { code, message });
        return null;
      }

      // 그 외(거래 없음/일시적 오류)는 계속 시도
    }
  }
  
  console.warn('⚠️ 최근 30일 내 거래 데이터 없음');
  return null;
}

/**
 * 전체 거래 데이터 Map 타입
 */
type TradeDataMap = Map<string, CostData>;

/**
 * katOnline API에서 전체 거래 데이터 한 번에 조회
 * @param tradeDate 조회 날짜
 * @returns 품목명 → 가격 정보 Map
 */
async function fetchAllTradeData(tradeDate: string): Promise<TradeDataMap> {
  const katAPI = getKatOnlineAPI();
  const tradeDataMap = new Map<string, CostData>();
  
  try {
    console.log(`📦 전체 거래 데이터 조회 중... (${tradeDate})`);

    // KatOnlineAPI.getTrades 내부에 Rate Limit + 재시도(fetchWithRetry)가 이미 포함되어 있어
    // 여기서는 중첩 재시도를 피하기 위해 단순 호출만 합니다.
    // 한 번에 대량 조회 (500개)
    const response = await katAPI.getTrades({
      cfmtnYmd: tradeDate,
      numOfRows: 500,
    });
    
    const items = response.response?.body?.items?.item || [];
    console.log(`✅ 총 ${items.length}개 품목 데이터 수신`);
    
    // Map으로 변환
    items.forEach(item => {
      const itemName = item.onln_whsl_mrkt_sclsf_nm; // 소분류명
      const avgPrice = parseFloat(item.avgprc);
      
      if (!isNaN(avgPrice) && avgPrice > 0) {
        const pricePer100g = Math.round(avgPrice / 10); // kg → 100g
        
        tradeDataMap.set(itemName, {
          pricePerKg: avgPrice,
          pricePer100g,
          date: tradeDate,
          timestamp: Date.now(),
        });
      }
    });
    
    console.log(`✅ ${tradeDataMap.size}개 품목 가격 정보 저장 완료`);
    return tradeDataMap;
    
  } catch (error) {
    console.error('전체 거래 데이터 조회 실패:', error);
    return tradeDataMap; // 빈 Map 반환
  }
}

/**
 * 거래 데이터 Map에서 식재료 가격 조회
 * @param ingredientName 식재료명
 * @param tradeDataMap 전체 거래 데이터 Map
 */
function fetchCostFromTradeData(
  ingredientName: string,
  tradeDataMap: TradeDataMap
): CostData | null {
  // 매핑된 품목명 가져오기
  const mappedName = INGREDIENT_MAPPING[ingredientName];
  
  // 매핑이 null이면 katOnline에 없는 품목 (육류/해산물 등)
  if (mappedName === null) {
    return null;
  }
  
  // 매핑이 없으면 원래 이름 사용
  const searchName = mappedName || ingredientName;
  
  // Map에서 찾기 (정확한 일치)
  let costData = tradeDataMap.get(searchName);
  
  // 정확한 일치가 없으면 부분 일치 시도
  if (!costData) {
    for (const [itemName, data] of tradeDataMap.entries()) {
      if (itemName.includes(searchName) || searchName.includes(itemName)) {
        costData = data;
        console.log(`✅ "${ingredientName}" → "${itemName}" 매칭 성공`);
        break;
      }
    }
  }
  
  if (!costData) {
    console.warn(`⚠️ "${ingredientName}" (검색: ${searchName}) 가격 정보 없음`);
    return null;
  }
  
  return costData;
}

/**
 * 급식소 기준 1인분 g수 (카테고리별)
 */
function getServingSizeGram(menuName: string, category: string): number {
  // 면류
  if (category === 'rice' && ['면', '우동', '국수', '파스타', '스파게티', '짜장', '짬뽕', '라면', '냉면', '쫄면', '칼국수'].some(k => menuName.includes(k))) {
    return 300; // 면류 300g
  }
  
  // 밥
  if (category === 'rice') {
    return 210; // 밥 210g
  }
  
  // 국/탕/찌개
  if (category === 'soup') {
    return 250; // 국물 250ml
  }
  
  // 김치
  if (category === 'kimchi') {
    return 30; // 김치 30g
  }
  
  // 고기 반찬
  if (category === 'meat') {
    return 80; // 고기 반찬 80g
  }
  
  // 채소 반찬
  if (category === 'vegetable') {
    return 70; // 채소 반찬 70g
  }
  
  // 기타 반찬
  return 50; // 기본 50g
}

/**
 * 메뉴 아이템의 원가 계산
 * mainIngredients 기반으로 재료별 가격 합산
 */
function calculateMenuCost(
  item: MenuItem,
  tradeDataMap: TradeDataMap,
  cache: CostCache
): number | null {
  if (!item.mainIngredients || item.mainIngredients.length === 0) {
    return null; // 재료 정보 없으면 하드코딩 값 유지
  }
  
  let totalCost = 0;
  let foundAny = false;
  
  const servingSize = getServingSizeGram(item.name, item.category);
  
  // 재료가 여러 개면 균등 분배 (예: ['쌀', '콩나물'] → 각 105g씩)
  const gramsPerIngredient = servingSize / item.mainIngredients.length;
  
  for (const ingredient of item.mainIngredients) {
    // 캐시 확인
    let costData = cache[ingredient];
    
    // 캐시 미스 - Map에서 찾기
    if (!costData) {
      costData = fetchCostFromTradeData(ingredient, tradeDataMap) || undefined;
      
      if (costData) {
        cache[ingredient] = costData;
      }
    }
    
    if (costData) {
      // 100g당 가격 × (g수 / 100)
      const ingredientCost = costData.pricePer100g * (gramsPerIngredient / 100);
      totalCost += ingredientCost;
      foundAny = true;
    }
  }
  
  return foundAny ? Math.round(totalCost) : null;
}

/**
 * 단일 메뉴 아이템의 원가 보강
 */
function enrichMenuItemCost(
  item: MenuItem,
  tradeDataMap: TradeDataMap,
  cache: CostCache
): MenuItem {
  const calculatedCost = calculateMenuCost(item, tradeDataMap, cache);
  
  if (calculatedCost !== null) {
    console.log(`✅ ${item.name}: ${item.cost}원 → ${calculatedCost}원 (시세 반영)`);
    return {
      ...item,
      cost: calculatedCost,
    };
  }
  
  // 실패 - 기존 하드코딩 값 유지
  console.log(`⚠️ ${item.name}: ${item.cost}원 (하드코딩 유지)`);
  return item;
}

/**
 * 식사(Meal)의 모든 메뉴 원가 보강
 */
function enrichMealCost(
  meal: Meal,
  tradeDataMap: TradeDataMap,
  cache: CostCache
): Meal {
  console.log(`🔄 원가 보강 중: ${meal.type}...`);
  
  // 동기 처리 (Map에서 찾기만 하므로 빠름)
  const enrichedRice = enrichMenuItemCost(meal.rice, tradeDataMap, cache);
  const enrichedSoup = enrichMenuItemCost(meal.soup, tradeDataMap, cache);
  const enrichedSideDishes = meal.sideDishes.map(dish => 
    enrichMenuItemCost(dish, tradeDataMap, cache)
  );
  
  // 합계 재계산
  const allItems = [enrichedRice, enrichedSoup, ...enrichedSideDishes];
  const totalCost = allItems.reduce((sum, item) => sum + item.cost, 0);
  
  console.log(`✅ 원가 보강 완료: ${meal.type} (${totalCost}원)`);
  
  return {
    ...meal,
    rice: enrichedRice,
    soup: enrichedSoup,
    sideDishes: enrichedSideDishes,
    totalCost,
  };
}

/**
 * 하루 식단(DayMealPlan)의 모든 식사 원가 보강
 */
function enrichDayCost(
  day: DayMealPlan,
  tradeDataMap: TradeDataMap,
  cache: CostCache
): DayMealPlan {
  const enrichedMeals = day.meals.map(meal => 
    enrichMealCost(meal, tradeDataMap, cache)
  );
  
  return {
    ...day,
    meals: enrichedMeals,
  };
}

/**
 * 주간 식단(WeekMealPlan)의 모든 날짜 원가 보강
 */
export async function enrichWeekCost(weekPlan: WeekMealPlan): Promise<WeekMealPlan> {
  console.log(`🔄 ${weekPlan.weekNumber}주차 원가 보강 시작...`);
  
  // 1. 최근 거래 날짜 찾기
  const tradeDate = await findRecentTradeDate();
  
  if (!tradeDate) {
    console.warn('⚠️ 거래 날짜를 찾을 수 없어 원가 보강 건너뜀');
    return weekPlan;
  }
  
  console.log(`📅 원가 기준 날짜: ${tradeDate}`);
  
  // 2. 전체 거래 데이터 한 번에 조회 (API 1번만!)
  const tradeDataMap = await fetchAllTradeData(tradeDate);
  
  if (tradeDataMap.size === 0) {
    console.warn('⚠️ 거래 데이터가 없어 원가 보강 건너뜀');
    return weekPlan;
  }
  
  // 3. 캐시 로드
  const cache = loadCostCache();
  
  // 4. 각 날짜별 원가 보강 (Map에서 찾기만 하므로 빠름)
  const enrichedDays = weekPlan.days.map(day => 
    enrichDayCost(day, tradeDataMap, cache)
  );
  
  // 5. 캐시 저장
  saveCostCache(cache);
  
  console.log(`✅ ${weekPlan.weekNumber}주차 원가 보강 완료`);
  
  return {
    ...weekPlan,
    days: enrichedDays,
  };
}















