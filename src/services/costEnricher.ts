/**
 * 원가 정보 보강 서비스
 * KAMIS(농산물유통정보) dailySalesList API로 하드코딩 식단의 원가 정보를 실시간 시세로 업데이트
 *
 * KAMIS productName은 "품목/품종(등급)" 형식(예: "소/등심(1등급)", "무/고랭지")으로 내려오므로,
 * 식재료명은 "/" 앞의 품목명(prefix)으로 매칭한다. 축산물(소/돼지/닭/계란/우유)도 도매(02)가 아니라
 * 소매(01)로만 조회되므로, 품목별로 도매 우선 → 없으면 소매로 폴백한다.
 */

import { MenuItem, Meal, DayMealPlan, WeekMealPlan } from '@/types/meal';
import { getKamisAPI } from './kamisAPI';
import { ParsedKamisPrice } from '@/types/kamis';

const COST_CACHE_KEY = 'cost_cache_v2';
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24시간

interface CostData {
  pricePerKg: number;       // 참고용 원가(kg 단위 품목 기준)
  pricePer100g: number;     // 원/100g
  date: string;
  timestamp: number;
  productno?: string;
  priceTrend?: 'up' | 'down' | 'flat';
}

interface CostCache {
  [itemName: string]: CostData;
}

interface IngredientTarget {
  prefix: string;     // productName의 "/" 앞부분과 매칭
  prefer?: string;    // 여러 품종 중 이 키워드가 포함된 것을 우선 선택
}

/**
 * 식재료명 → KAMIS 품목 prefix 매핑
 * 실제 dailySalesList 응답(2026-09-23 기준)으로 확인한 표기를 반영함
 */
const INGREDIENT_MAPPING: Record<string, IngredientTarget> = {
  // 곡류
  '쌀': { prefix: '쌀' },
  '현미': { prefix: '현미' },
  '보리': { prefix: '보리쌀' },

  // 서류
  '감자': { prefix: '감자' },
  '고구마': { prefix: '고구마' },

  // 채소류
  '양배추': { prefix: '양배추' },
  '배추': { prefix: '배추' },
  '무': { prefix: '무' },
  '당근': { prefix: '당근' },
  '양파': { prefix: '양파' },
  '대파': { prefix: '파', prefer: '대파' },
  '마늘': { prefix: '깐마늘(국산)' },
  '생강': { prefix: '생강' },
  '시금치': { prefix: '시금치' },
  '상추': { prefix: '상추' },
  '깻잎': { prefix: '깻잎' },
  '호박': { prefix: '호박' },
  '애호박': { prefix: '호박', prefer: '애호박' },
  '가지': { prefix: '가지' },
  '오이': { prefix: '오이' },
  '브로콜리': { prefix: '브로콜리' },
  '파프리카': { prefix: '파프리카' },

  // 과일류
  '사과': { prefix: '사과' },
  '배': { prefix: '배' },
  '포도': { prefix: '포도' },
  '복숭아': { prefix: '복숭아' },
  '수박': { prefix: '수박' },
  '참외': { prefix: '참외' },
  '바나나': { prefix: '바나나' },

  // 축산물 (소매(01)로만 조회됨) - 급식/불고기용으로 현실적인 저가 부위 지정 (등심은 스테이크용이라 제외)
  '소고기': { prefix: '소', prefer: '설도(1등급)' },
  '한우': { prefix: '소', prefer: '설도(1등급)' },
  '소갈비': { prefix: '소', prefer: '갈비(1등급)' },
  '돼지고기': { prefix: '돼지', prefer: '삼겹살' },
  '돈육': { prefix: '돼지', prefer: '삼겹살' },
  '돼지갈비': { prefix: '돼지', prefer: '갈비' },
  '등갈비': { prefix: '돼지', prefer: '갈비' },
  '닭고기': { prefix: '닭' },
  '닭': { prefix: '닭' },
  '닭가슴살': { prefix: '닭' }, // dailySalesList엔 부위별 세분류가 없어 육계(kg) 가격으로 대체
  '닭다리살': { prefix: '닭' },
  '닭안심': { prefix: '닭' },
  '돼지목살': { prefix: '돼지', prefer: '목심' },
  '계란': { prefix: '계란', prefer: '특란30구' },
  '달걀': { prefix: '계란', prefer: '특란30구' },
  '우유': { prefix: '우유' },

  // 버섯류
  '버섯': { prefix: '느타리버섯' }, // 요리에 "버섯"으로만 표기된 경우의 대표값
  '느타리버섯': { prefix: '느타리버섯' },
  '새송이버섯': { prefix: '새송이버섯' },
  '새송이': { prefix: '새송이버섯' },
  '팽이버섯': { prefix: '팽이버섯' },

  // 콩류
  '콩': { prefix: '콩', prefer: '흰 콩(국산)' },

  // 기타 채소 (추가 발견분)
  '미나리': { prefix: '미나리' },
  '방울토마토': { prefix: '방울토마토' },
  '토마토': { prefix: '토마토' },
  '부추': { prefix: '부추' },
  '열무': { prefix: '열무' },
  '파': { prefix: '파' },
  '풋고추': { prefix: '풋고추' },
  '고추': { prefix: '풋고추' },
  '피망': { prefix: '피망' },
  '총각무': { prefix: '무' }, // KAMIS에 총각무 별도 품종이 없어 무로 대체
  '들깨': { prefix: '들깨' },
  '찹쌀': { prefix: '찹쌀' },

  // 수산물
  '명태': { prefix: '명태' },
  '동태': { prefix: '명태' }, // 동태 = 냉동 명태, 같은 원물
  '고등어': { prefix: '고등어' },
  '미역': { prefix: '마른미역' },
  '바지락': { prefix: '바지락' },
  '새우': { prefix: '새우' },
  '새우젓': { prefix: '새우젓' },
  '낙지': { prefix: '낙지' },
  '전복': { prefix: '전복' },
  '홍합': { prefix: '홍합', prefer: '깐홍합' },
  '꽃게': { prefix: '꽃게' },
  '게': { prefix: '꽃게' },
  '갈치': { prefix: '갈치' },
  '오징어': { prefix: '물오징어' },
  '김': { prefix: '김' },
  '꽁치': { prefix: '꽁치' },
  '북어': { prefix: '북어' },
  '북어채': { prefix: '북어' },
  '멸치': { prefix: '마른멸치' },
  '조기': { prefix: '조기' },
  '삼치': { prefix: '삼치' },
};

function loadCostCache(): CostCache {
  if (typeof window === 'undefined') return {};

  try {
    const cached = localStorage.getItem(COST_CACHE_KEY);
    if (!cached) return {};

    const cache: CostCache = JSON.parse(cached);
    const now = Date.now();

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

function saveCostCache(cache: CostCache): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(COST_CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error('원가 캐시 저장 실패:', error);
  }
}

interface PriceEntry {
  parsed: ParsedKamisPrice;
  pricePer100g: number;
}

/** 품목 prefix → 가격 후보 목록 (도매/소매 각각 따로 보관) */
type PrefixIndex = Map<string, PriceEntry[]>;

interface KamisPriceIndex {
  wholesale: PrefixIndex;
  retail: PrefixIndex;
}

function prefixOf(productName: string): string {
  return productName.split('/')[0] || productName;
}

/**
 * KAMIS dailySalesList 전체 조회 후 품목 prefix 기준으로 색인화
 * (농산물/수산물은 도매+소매 모두, 축산물은 소매만 내려옴)
 */
async function fetchKamisPriceIndex(): Promise<KamisPriceIndex> {
  const kamisAPI = getKamisAPI();
  const wholesale: PrefixIndex = new Map();
  const retail: PrefixIndex = new Map();

  try {
    console.log('📦 KAMIS 전체 시세 조회 중...');
    const items = await kamisAPI.getDailySales();
    console.log(`✅ 총 ${items.length}개 품목 데이터 수신`);

    let skipped = 0;
    items.forEach(item => {
      // 항목 하나가 예상 못한 형식(예: 빈 필드가 문자열 대신 배열로 옴)이어도
      // 전체 색인이 무너지지 않도록 개별적으로 격리한다.
      try {
        const parsed = kamisAPI.parseDailySalesItem(item);
        if (!parsed.productName || parsed.price <= 0) return;

        const pricePer100g = kamisAPI.getPricePer100g(parsed);
        const entry: PriceEntry = { parsed, pricePer100g };
        const index = parsed.productClsCode === '02' ? wholesale : retail;
        const key = prefixOf(parsed.productName);

        const list = index.get(key) ?? [];
        list.push(entry);
        index.set(key, list);
      } catch {
        skipped++;
      }
    });
    if (skipped > 0) {
      console.warn(`⚠️ 형식이 예상과 달라 건너뛴 품목: ${skipped}개`);
    }

    console.log(`✅ 색인 완료 (도매 ${wholesale.size}개 품목, 소매 ${retail.size}개 품목)`);
    return { wholesale, retail };
  } catch (error) {
    console.error('KAMIS 시세 조회 실패:', error);
    return { wholesale, retail };
  }
}

function pickEntry(list: PriceEntry[], prefer?: string): PriceEntry {
  if (prefer) {
    const preferred = list.find(e => e.parsed.productName.includes(prefer));
    if (preferred) return preferred;
  }
  return list[0];
}

function fetchCostFromIndex(ingredientName: string, index: KamisPriceIndex): CostData | null {
  const target = INGREDIENT_MAPPING[ingredientName];
  const prefix = target?.prefix || ingredientName;

  const wholesaleList = index.wholesale.get(prefix);
  const retailList = index.retail.get(prefix);
  const list = wholesaleList?.length ? wholesaleList : retailList;

  if (!list || list.length === 0) {
    console.warn(`⚠️ "${ingredientName}" (검색: ${prefix}) 가격 정보 없음`);
    return null;
  }

  const { parsed, pricePer100g } = pickEntry(list, target?.prefer);
  console.log(`✅ "${ingredientName}" → "${parsed.productName}" 매칭 성공 (${wholesaleList?.length ? '도매' : '소매'})`);

  return {
    pricePerKg: parsed.price,
    pricePer100g,
    date: parsed.date,
    timestamp: Date.now(),
    productno: parsed.productno,
    priceTrend: parsed.direction,
  };
}

function getServingSizeGram(menuName: string, category: string): number {
  if (category === 'rice' && ['면', '우동', '국수', '파스타', '스파게티', '짜장', '짬뽕', '라면', '냉면', '쫄면', '칼국수'].some(k => menuName.includes(k))) {
    return 300;
  }
  // KAMIS 쌀 가격은 생쌀 기준이므로 지은 밥 1인분(210g)이 아닌 생쌀 무게(약 90g)로 계산
  if (category === 'rice') return 90;
  if (category === 'soup') return 250;
  if (category === 'kimchi') return 30;
  if (category === 'meat') return 80;
  if (category === 'vegetable') return 70;
  return 50;
}

function calculateMenuCost(
  item: MenuItem,
  index: KamisPriceIndex,
  cache: CostCache
): { cost: number; priceTrend?: 'up' | 'down' | 'flat' } | null {
  if (!item.mainIngredients || item.mainIngredients.length === 0) {
    return null;
  }

  let totalCost = 0;
  let foundAny = false;
  let trend: 'up' | 'down' | 'flat' | undefined;

  const servingSize = getServingSizeGram(item.name, item.category);
  const gramsPerIngredient = servingSize / item.mainIngredients.length;

  for (const ingredient of item.mainIngredients) {
    let costData = cache[ingredient];

    if (!costData) {
      costData = fetchCostFromIndex(ingredient, index) || undefined;
      if (costData) {
        cache[ingredient] = costData;
      }
    }

    if (costData) {
      const ingredientCost = costData.pricePer100g * (gramsPerIngredient / 100);
      totalCost += ingredientCost;
      foundAny = true;
      if (costData.priceTrend && !trend) {
        trend = costData.priceTrend;
      }
    }
  }

  return foundAny ? { cost: Math.round(totalCost), priceTrend: trend } : null;
}

// KAMIS 단위 표기 불일치(개/kg 혼용 등)로 인한 이상치를 걸러내는 배수 - 이 범위를 벗어나면 KAMIS 값을 신뢰하지 않음
const OUTLIER_MULTIPLIER = 3;

function enrichMenuItemCost(item: MenuItem, index: KamisPriceIndex, cache: CostCache): MenuItem {
  const result = calculateMenuCost(item, index, cache);

  if (result !== null) {
    const isOutlier =
      item.cost > 0 &&
      (result.cost > item.cost * OUTLIER_MULTIPLIER || result.cost < item.cost / OUTLIER_MULTIPLIER);

    if (isOutlier) {
      console.warn(`⚠️ ${item.name}: KAMIS 가격 ${result.cost}원이 하드코딩 ${item.cost}원과 ${OUTLIER_MULTIPLIER}배 이상 차이 - 이상치로 판단, 하드코딩 유지`);
      return item;
    }

    console.log(`✅ ${item.name}: ${item.cost}원 → ${result.cost}원 (시세 반영)`);
    return {
      ...item,
      cost: result.cost,
      priceTrend: result.priceTrend,
    };
  }

  console.log(`⚠️ ${item.name}: ${item.cost}원 (하드코딩 유지)`);
  return item;
}

function enrichMealCost(meal: Meal, index: KamisPriceIndex, cache: CostCache): Meal {
  console.log(`🔄 원가 보강 중: ${meal.type}...`);

  const enrichedRice = enrichMenuItemCost(meal.rice, index, cache);
  const enrichedSoup = enrichMenuItemCost(meal.soup, index, cache);
  const enrichedSideDishes = meal.sideDishes.map(dish => enrichMenuItemCost(dish, index, cache));

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

function enrichDayCost(day: DayMealPlan, index: KamisPriceIndex, cache: CostCache): DayMealPlan {
  const enrichedMeals = day.meals.map(meal => enrichMealCost(meal, index, cache));

  return {
    ...day,
    meals: enrichedMeals,
  };
}

/**
 * 주간 식단(WeekMealPlan)의 모든 날짜 원가 보강
 */
export async function enrichWeekCost(weekPlan: WeekMealPlan): Promise<WeekMealPlan> {
  console.log(`🔄 ${weekPlan.weekNumber}주차 원가 보강 시작 (KAMIS)...`);

  const index = await fetchKamisPriceIndex();

  if (index.wholesale.size === 0 && index.retail.size === 0) {
    console.warn('⚠️ KAMIS 시세 데이터가 없어 원가 보강 건너뜀');
    return weekPlan;
  }

  const cache = loadCostCache();

  const enrichedDays = weekPlan.days.map(day => enrichDayCost(day, index, cache));

  saveCostCache(cache);

  console.log(`✅ ${weekPlan.weekNumber}주차 원가 보강 완료`);

  return {
    ...weekPlan,
    days: enrichedDays,
  };
}
