import { MenuItem, Meal, DayMealPlan, WeekMealPlan, StoreSettings, SnackMeal, MealType, CuisineType } from '@/types/meal';
import { 
  sampleRice, 
  sampleSoups, 
  sampleKimchi, 
  sampleVegetables, 
  sampleMeats, 
  sampleSides, 
  sampleSnacks,
  soupKimchiConflicts,
  ingredientConflictGroups,  specialMealSets,
  specialExtraSides
} from '@/data/sampleMenus';
import { 
  UsedMenuContext, 
  createEmptyUsedMenuContext, 
  filterAllowedMenus,
  isCheckableMenu,
  getWeekMenuNames
} from './menuDuplicationChecker';
import { allergenMapping } from './allergenValidator';
// FDA API 통합
import { 
  searchFoodByCategory, 
  prefetchAllCategories 
} from '@/services/fdaCategorySearch';
import { 
  getCachedFoodData, 
  loadFoodDataFromCache, 
  saveFoodDataToCache 
} from '@/data/foodDatabase';

const DAYS_KR = ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일'];

// 면 종류 판별 키워드
const NOODLE_KEYWORDS = ['면', '우동', '스파게티', '파스타', '국수', '라면', '짬뽕', '짜장', '칼국수', '수제비', '냉면', '쫄면', '라볶이'];

// API 사용 여부 설정 (전역 플래그)
// false: 하드코딩 식단 사용 (안정성) + FDA API는 영양 정보만
const USE_API = false;

/**
 * API 또는 캐시에서 카테고리별 메뉴 데이터 가져오기
 * 우선순위: 1) 로컬 캐시 2) FDA API 3) 백업 캐시 4) 샘플 데이터
 */
async function getMenuDataByCategory(
  category: 'rice' | 'soup' | 'side' | 'kimchi' | 'vegetable' | 'meat'
): Promise<MenuItem[]> {
  if (!USE_API) {
    // API 사용 안 함: 샘플 데이터 사용
    return getSampleDataByCategory(category);
  }

  // 1. 로컬 스토리지 캐시 확인
  const cached = loadFoodDataFromCache(category);
  if (cached && cached.length > 0) {
    console.log(`✅ ${category} 데이터 캐시에서 로드 (${cached.length}개)`);
    return cached;
  }

  try {
    // 2. FDA API 호출
    console.log(`🔄 ${category} 데이터 FDA API 호출 중...`);
    const menuItems = await searchFoodByCategory(category, 50);

    if (menuItems.length > 0) {
      // 성공: 캐시에 저장
      saveFoodDataToCache(category, menuItems, 24);
      console.log(`✅ ${category} 데이터 FDA API에서 로드 (${menuItems.length}개)`);
      return menuItems;
    }
  } catch (error) {
    console.warn(`⚠️ ${category} FDA API 호출 실패:`, error);
  }

  // 3. 백업: 하드코딩된 캐시 데이터
  const fallbackCache = getCachedFoodData(category);
  
  if (fallbackCache.length > 0) {
    console.log(`✅ ${category} 데이터 백업 캐시에서 로드 (${fallbackCache.length}개)`);
    return fallbackCache;
  }

  // 4. 최후의 수단: 샘플 데이터
  console.log(`⚠️ ${category} 샘플 데이터 사용`);
  return getSampleDataByCategory(category);
}

/**
 * 샘플 데이터 가져오기 (기존 방식)
 */
function getSampleDataByCategory(
  category: 'rice' | 'soup' | 'side' | 'kimchi' | 'vegetable' | 'meat'
): MenuItem[] {
  switch (category) {
    case 'rice':
      return sampleRice;
    case 'soup':
      return sampleSoups;
    case 'kimchi':
      return sampleKimchi;
    case 'vegetable':
      return sampleVegetables;
    case 'meat':
      return sampleMeats;
    case 'side':
      return sampleSides;
    default:
      return [];
  }
}

/**
 * 동기 방식으로 메뉴 데이터 가져오기 (기존 코드 호환용)
 * USE_API = false: 순수 샘플 데이터만 사용 (FDA API 연결 전 로직)
 */
function getMenuDataSync(
  category: 'rice' | 'soup' | 'side' | 'kimchi' | 'vegetable' | 'meat'
): MenuItem[] {
  if (!USE_API) {
    // API 사용 안 함: 순수 샘플 데이터만 (전에 했던 로직)
    return getSampleDataByCategory(category);
  }

  // API 사용: 캐시 → 하드코딩 → 샘플 순서
  const cached = loadFoodDataFromCache(category);
  if (cached && cached.length > 0) {
    return cached;
  }

  const fallbackCache = getCachedFoodData(category);
  if (fallbackCache.length > 0) {
    return fallbackCache;
  }

  return getSampleDataByCategory(category);
}

// 미니밥 메뉴 아이템
const MINI_RICE: MenuItem = {
  id: 'mini-rice',
  name: '미니밥',
  category: 'side',
  calories: 150,
  protein: 2.5,
  carbs: 32,
  fat: 0.5,
  sodium: 3,
  allergens: [],
  cost: 150,
  mainIngredients: ['쌀'],
};

// 메뉴가 면 종류인지 판별
function isNoodleMenu(item: MenuItem): boolean {
  return NOODLE_KEYWORDS.some(keyword => item.name.includes(keyword));
}

// 미니밥이 반찬에 있는지 확인
function hasMiniRice(sideDishes: MenuItem[]): boolean {
  return sideDishes.some(dish => dish.id === 'mini-rice');
}

// 미니밥 추가 (면 메뉴일 경우)
function addMiniRiceIfNeeded(rice: MenuItem, sideDishes: MenuItem[]): MenuItem[] {
  if (isNoodleMenu(rice) && !hasMiniRice(sideDishes)) {
    return [...sideDishes, { ...MINI_RICE }];
  }
  return sideDishes;
}

// 미니밥 제거 (밥 메뉴일 경우)
function removeMiniRiceIfNeeded(rice: MenuItem, sideDishes: MenuItem[]): MenuItem[] {
  if (!isNoodleMenu(rice) && hasMiniRice(sideDishes)) {
    return sideDishes.filter(dish => dish.id !== 'mini-rice');
  }
  return sideDishes;
}

/**
 * 가중치를 고려한 랜덤 아이템 선택
 * weight가 높을수록 선택될 확률이 높음
 */
function getRandomItem<T>(array: T[], exclude: T[] = []): T {
  const filtered = array.filter(item => !exclude.includes(item));
  if (filtered.length === 0) return array[Math.floor(Math.random() * array.length)];
  
  // MenuItem 타입인 경우 가중치 고려
  const hasWeight = filtered.every((item: any) => 'weight' in item || item.weight === undefined);
  
  if (hasWeight) {
    return getWeightedRandomItem(filtered as any) as T;
  }
  
  // 가중치 없으면 일반 랜덤
  return filtered[Math.floor(Math.random() * filtered.length)];
}

/**
 * 가중치 기반 랜덤 선택
 */
function getWeightedRandomItem(items: MenuItem[]): MenuItem {
  // 가중치 합계 계산 (weight가 없으면 1로 간주)
  const totalWeight = items.reduce((sum, item) => sum + (item.weight || 1), 0);
  
  // 랜덤 값 생성 (0 ~ totalWeight)
  let random = Math.random() * totalWeight;
  
  // 누적 가중치로 선택
  for (const item of items) {
    const weight = item.weight || 1;
    random -= weight;
    if (random <= 0) {
      return item;
    }
  }
  
  // 안전장치: 마지막 아이템 반환
  return items[items.length - 1];
}

// 주재료 충돌 체크
function hasIngredientConflict(item1: MenuItem, item2: MenuItem): boolean {
  const ingredients1 = item1.mainIngredients || [];
  const ingredients2 = item2.mainIngredients || [];
  
  // 같은 주재료가 있는지 확인
  for (const ing1 of ingredients1) {
    for (const ing2 of ingredients2) {
      if (ing1 === ing2) return true;
      
      // 같은 충돌 그룹에 있는지 확인
      for (const group of ingredientConflictGroups) {
        if (group.includes(ing1) && group.includes(ing2)) return true;
      }
    }
  }
  return false;
}

// 알레르기 포함 여부 체크
function hasAllergen(menuItem: MenuItem, watchAllergens: string[]): boolean {
  if (!watchAllergens || watchAllergens.length === 0) {
    return false;
  }

  // NOTE:
  // - sampleMenus.ts의 일부 항목은 allergens가 비어 있을 수 있습니다.
  // - 사용자가 "알레르기 주의 설정"에서 선택한 식품이 식단에 들어가지 않도록,
  //   allergens 배열뿐 아니라 메뉴명/주재료(mainIngredients)까지 같이 검사합니다.
  const haystacks = [
    ...(menuItem.allergens || []),
    menuItem.name || "",
    ...((menuItem.mainIngredients as string[] | undefined) || []),
  ].filter(Boolean);

  return watchAllergens.some((watchAllergen) => {
    const relatedAllergens = allergenMapping[watchAllergen] || [watchAllergen];
    return haystacks.some((h) =>
      relatedAllergens.some((ra) => {
        if (!ra) return false;
        return h.includes(ra) || ra.includes(h);
      }),
    );
  });
}

// 알레르기가 있는 메뉴 필터링
function filterAllergenMenus<T extends MenuItem>(menus: T[], watchAllergens: string[] | undefined): T[] {
  if (!watchAllergens || watchAllergens.length === 0) {
    return menus;
  }

  const filtered = menus.filter((menu) => !hasAllergen(menu, watchAllergens));

  // 알레르기 설정은 "절대 포함되면 안 됨" 규칙이므로, 여기서는 절대 원본으로 되돌아가지 않습니다.
  // (선택 가능 목록이 0개가 되면, 데이터/메뉴 풀이 부족한 상태이므로 메뉴 데이터를 늘려야 합니다.)
  return filtered;
}

/**
 * FDA API 데이터 프리페치 (식단 생성 전 호출 권장)
 * 모든 카테고리 데이터를 미리 로드하여 캐시에 저장
 */
export async function prefetchFoodData(): Promise<void> {
  if (!USE_API) {
    console.log('⚠️ API 사용 비활성화됨');
    return;
  }

  console.log('🔄 FDA 음식 데이터 프리페치 시작...');
  
  try {
    // 모든 카테고리 데이터 한 번에 로드
    const allData = await prefetchAllCategories();
    
    // 각 카테고리별로 캐시에 저장
    saveFoodDataToCache('rice', allData.rice, 24);
    saveFoodDataToCache('soup', allData.soup, 24);
    saveFoodDataToCache('kimchi', allData.kimchi, 24);
    saveFoodDataToCache('vegetable', allData.vegetable, 24);
    saveFoodDataToCache('meat', allData.meat, 24);
    saveFoodDataToCache('side', allData.side, 24);
    
    console.log('✅ FDA 음식 데이터 프리페치 완료');
  } catch (error) {
    console.error('❌ FDA 데이터 프리페치 실패:', error);
  }
}

/**
 * 카테고리별 데이터 가져오기 (동기 버전 - 기존 코드와 호환)
 */
function getRiceData(): MenuItem[] {
  return getMenuDataSync('rice');
}

function getSoupData(): MenuItem[] {
  return getMenuDataSync('soup');
}

function getKimchiData(): MenuItem[] {
  return getMenuDataSync('kimchi');
}

// 새우 알레르기 선택 시에만 "새우젓 제외" 김치를 후보에 추가한다.
// 평소(새우 미선택)에는 이런 표기 메뉴가 식단에 등장하지 않게 하기 위함.
const KIMCHI_NO_SHRIMP_ONLY_WHEN_SELECTED: MenuItem[] = [
  // ⚠️ 주의: 알레르기 필터는 메뉴명 문자열도 검사합니다.
  // 이름에 '새우'가 들어가면(예: '새우젓') 새우 알레르기에서 오히려 제외되어 버리므로,
  // 표기는 '젓갈 제외'처럼 '새우' 단어가 들어가지 않게 합니다.
  // 확률(가중치) 조정: 새우 체크 시에는 이 대체 김치들 중에서도 배추/깍두기를 더 자주 노출
  { id: 'k8', name: '배추김치(젓갈 제외)', category: 'kimchi', calories: 18, protein: 1, carbs: 4, fat: 0, sodium: 520, allergens: [], cost: 170, mainIngredients: ['배추'], weight: 30 },
  { id: 'k9', name: '깍두기(젓갈 제외)', category: 'kimchi', calories: 22, protein: 1, carbs: 5, fat: 0, sodium: 480, allergens: [], cost: 160, mainIngredients: ['무'], weight: 30 },
  { id: 'k10', name: '열무김치(젓갈 제외)', category: 'kimchi', calories: 16, protein: 1, carbs: 3, fat: 0, sodium: 420, allergens: [], cost: 160, mainIngredients: ['열무'], weight: 4 },
];

function getVegetableData(): MenuItem[] {
  return getMenuDataSync('vegetable');
}

function getMeatData(): MenuItem[] {
  return getMenuDataSync('meat');
}

function getSideData(): MenuItem[] {
  return getMenuDataSync('side');
}

function isRadishBasedKimchi(kimchi: MenuItem): boolean {
  const ings = (kimchi.mainIngredients || []) as string[];
  // 무 계열 김치(깍두기/동치미/총각김치 등)
  return ings.includes('무') || ings.includes('총각무');
}

function isSoupLikeName(name: string): boolean {
  const n = String(name ?? '').trim();
  if (!n) return false;

  // "국수"는 예외(국/탕류로 오인 방지)
  const withoutSpaces = n.replace(/\s+/g, '');
  if (withoutSpaces.includes('국수')) return false;

  // 반찬으로 추가될 때 어색한 국/탕/찌개/전골/스프/국물 계열
  if (withoutSpaces.includes('국물')) return true;
  return (
    withoutSpaces.endsWith('국') ||
    withoutSpaces.endsWith('탕') ||
    withoutSpaces.endsWith('찌개') ||
    withoutSpaces.endsWith('전골') ||
    withoutSpaces.endsWith('스프') ||
    withoutSpaces.endsWith('스튜')
  );
}

// 국/찌개에 맞는 김치 선택 (충돌 방지)
function getCompatibleKimchi(soup: MenuItem, rice: MenuItem, exclude: MenuItem[] = [], watchAllergens?: string[]): MenuItem {
  const baseKimchiData = getKimchiData();
  const kimchiData =
    watchAllergens?.includes('새우')
      ? [...baseKimchiData, ...KIMCHI_NO_SHRIMP_ONLY_WHEN_SELECTED]
      : baseKimchiData;
  const soupConflicts = soupKimchiConflicts[soup.name] || [];
  const riceConflicts = soupKimchiConflicts[rice.name] || [];
  const allConflicts = [...soupConflicts, ...riceConflicts];
  
  // 충돌하는 김치 제외 + 알레르기 필터링
  let availableKimchi = kimchiData.filter(k => 
    !allConflicts.includes(k.name) && 
    !exclude.includes(k) &&
    !hasIngredientConflict(k, soup) &&
    !hasIngredientConflict(k, rice)
  );
  
  // 알레르기 필터링 적용
  availableKimchi = filterAllergenMenus(availableKimchi, watchAllergens);

  // 급식 편성 룰(요청):
  // - 김치찌개/김치볶음밥 등 "김치" 메인 메뉴가 나오면 배추김치 대신 무김치(깍두기/총각김치 등)를 우선
  // - "깍두기"가 메인 메뉴(예: 깍두기볶음밥)로 나오면, 반찬 김치는 무김치가 아닌 것으로 선택
  //
  // 구현 방식:
  // 1) 알레르기/기본 충돌을 적용한 뒤, 컨텍스트(메인 메뉴) 기반으로 한 번 더 필터링
  // 2) 이 필터링으로 후보가 0개가 되면, 컨텍스트 필터만 완화(알레르기/기본 충돌은 유지)해서 랜덤 선택
  const soupName = soup.name || '';
  const riceName = rice.name || '';
  const hasKimchiMain = soupName.includes('김치') || riceName.includes('김치');
  const hasKkakdugiMain = soupName.includes('깍두기') || riceName.includes('깍두기');

  // 컨텍스트 적용 전 후보를 보관(알레르기/기본 충돌은 적용된 상태)
  const availableBeforeContext = availableKimchi;

  if (hasKkakdugiMain) {
    // 메인이 깍두기면 무계열 김치 금지
    availableKimchi = availableKimchi.filter(k => !isRadishBasedKimchi(k));
  } else if (hasKimchiMain) {
    // 메인이 김치면 무계열 김치 우선(배추김치 같은 "김치+김치" 느낌 방지)
    availableKimchi = availableKimchi.filter(k => isRadishBasedKimchi(k));
  }
  
  if (availableKimchi.length === 0) {
    // 컨텍스트 규칙으로 후보가 0개가 되었으면, 그 규칙만 완화해서(알레르기/기본 충돌 유지) 선택
    if (availableBeforeContext.length > 0) {
      return getRandomItem(availableBeforeContext);
    }
    // 기본적으로 첫 번째 김치 반환 (알레르기 없을 경우)
    const defaultKimchi = kimchiData.find(k => k.name.includes('김치')) || kimchiData[0];
    // 기본 김치도 알레르기가 있다면 알레르기 없는 다른 김치 찾기
    const safeKimchi = filterAllergenMenus(kimchiData, watchAllergens);
    // safeKimchi[0]로 고정하면(대개 동치미) 새우 알레르기 시 항상 같은 김치가 나오는 문제가 생김
    return safeKimchi.length > 0 ? getRandomItem(safeKimchi) : defaultKimchi;
  }
  
  return getRandomItem(availableKimchi);
}

// 기존 반찬들과 충돌하지 않는 반찬 선택
function getCompatibleDish<T extends MenuItem>(
  dishes: T[], 
  existingItems: MenuItem[], 
  exclude: T[] = [],
  watchAllergens?: string[]
): T {
  let compatible = dishes.filter(dish => {
    if (exclude.includes(dish)) return false;
    return !existingItems.some(existing => hasIngredientConflict(dish, existing));
  });
  
  // 알레르기 필터링 적용
  compatible = filterAllergenMenus(compatible, watchAllergens);
  
  if (compatible.length === 0) {
    // 알레르기 필터링만 적용한 목록에서 선택
    const allergenFiltered = filterAllergenMenus(dishes.filter(d => !exclude.includes(d)), watchAllergens);
    if (allergenFiltered.length > 0) return getRandomItem(allergenFiltered);
    return getRandomItem(dishes, exclude);
  }
  return getRandomItem(compatible);
}

function calculateTotals(rice: MenuItem, soup: MenuItem, sideDishes: MenuItem[]) {
  const allItems = [rice, soup, ...sideDishes];
  return {
    totalCalories: allItems.reduce((sum, item) => sum + item.calories, 0),
    totalProtein: allItems.reduce((sum, item) => sum + item.protein, 0),
    totalCarbs: allItems.reduce((sum, item) => sum + item.carbs, 0),
    totalFat: allItems.reduce((sum, item) => sum + item.fat, 0),
    totalSodium: allItems.reduce((sum, item) => sum + item.sodium, 0),
    totalCost: allItems.reduce((sum, item) => sum + item.cost, 0),
    allergens: [...new Set(allItems.flatMap(item => item.allergens))],
  };
}

function getTargetCost(settings: StoreSettings): number {
  const budget = Number(settings.budgetPerMeal || 0);
  const ratio = Number(settings.costRatio || 0);
  if (!Number.isFinite(budget) || !Number.isFinite(ratio) || budget <= 0 || ratio <= 0) return 0;
  return budget * (ratio / 100);
}

function getCostOptimizationTries(targetCost: number): number {
  // 목표가 클수록(예: 2만원×100%) 고가 메뉴 조합을 잡기 위해 탐색 횟수를 늘립니다.
  // 너무 느려지지 않도록 상한을 둡니다.
  const base = 24;
  const scale = Math.floor(targetCost / 1000); // 1,000원 당 +1
  return Math.max(18, Math.min(120, base + scale));
}

function getDesiredSideDishCount(settings: StoreSettings): number {
  // 반찬 수 규칙:
  // - settings.sideDishCount는 "김치 포함 총 반찬 개수"를 의미합니다.
  // - 수동 모드(자동 꺼짐): 사용자가 고른 값 그대로 생성되어야 합니다.
  // - 자동 모드: 기본 4개(김치+나물+메인+반찬)를 기준으로 목표 원가에 따라 가감합니다.
  const isAuto = !!settings.sideDishCountAuto;
  const baseRaw = isAuto ? 4 : Number(settings.sideDishCount || 4);
  // 반찬(밥/국 제외)은 최소 2개, 최대 8개까지만 허용합니다.
  const base = Math.max(2, Math.min(8, Math.round(baseRaw)));

  // 수동 모드면 예산/원가비율에 의해 반찬 수가 바뀌면 안 됩니다.
  if (!isAuto) return base;

  const targetCost = getTargetCost(settings);

  // 사용자가 원하는 룰:
  // - 목표 원가(예산×원가비율)가 높아지면 가짓수(반찬 수)도 늘려도 됨
  // - 너무 낮아지면 6개(총 6) 대신 5개(총 5)로 줄여도 됨
  // - 총 가짓수는 상황에 따라 4~10개까지 허용
  //   (밥/국 2개 + 반찬 최소 2개 = 총 4개부터 가능)
  //
  // 여기서는 "반찬 수"를 조절한다:
  // 기준점(요청): 1인 식비 예산 6,000원 × 원가비율 50% = 목표 원가 3,000원일 때
  // "밥/국 포함 총 6개 구성"이 나오도록(= 반찬 4개) 기준을 잡는다.
  //
  // - targetCost <= 1,800원: 반찬 1개 줄이기(총 5개 구성, 최소 3)
  // - targetCost >= 4,500원: 반찬 1개 늘리기(총 7개 구성)
  // - targetCost >= 7,000원: 반찬 2개 늘리기(총 8개 구성)
  // - targetCost >= 9,000원: 반찬 3개 늘리기(총 9개 구성)
  // - targetCost >= 12,000원: 반찬 4개 늘리기(총 10개 구성)
  let desired = base;

  if (targetCost > 0 && targetCost <= 1800) {
    desired = base - 1;
  } else if (targetCost >= 12000) {
    desired = base + 4;
  } else if (targetCost >= 9000) {
    desired = base + 3;
  } else if (targetCost >= 7000) {
    desired = base + 2;
  } else if (targetCost >= 4500) {
    desired = base + 1;
  }

  // 안전장치: 반찬은 최소 2개, 최대 8개(총 10개)까지만 허용
  return Math.max(2, Math.min(8, desired));
}

function scoreCost(totalCost: number, targetCost: number): number {
  const diff = Math.abs(totalCost - targetCost);
  const over = totalCost - targetCost;
  // "근사치"가 목표이므로 diff가 1순위.
  // 동률/유사할 때 살짝 "초과"를 덜 선호하도록 아주 작은 페널티만 추가합니다.
  return diff + (over > 0 ? over * 0.05 : 0);
}

function cloneUsedMenuContext(ctx: UsedMenuContext): UsedMenuContext {
  return {
    currentDayIndex: ctx.currentDayIndex,
    allDays: ctx.allDays,
    currentDayMenus: new Set<string>(Array.from(ctx.currentDayMenus)),
    prevWeekMenus: ctx.prevWeekMenus ? new Set<string>(Array.from(ctx.prevWeekMenus)) : undefined,
    nextWeekMenus: ctx.nextWeekMenus ? new Set<string>(Array.from(ctx.nextWeekMenus)) : undefined,
    monthMenus: ctx.monthMenus ? new Set<string>(Array.from(ctx.monthMenus)) : undefined,
  };
}

function commitUsedMenuContext(dst: UsedMenuContext, src: UsedMenuContext) {
  dst.currentDayIndex = src.currentDayIndex;
  dst.allDays = src.allDays;
  dst.currentDayMenus = new Set<string>(Array.from(src.currentDayMenus));
  dst.prevWeekMenus = src.prevWeekMenus ? new Set<string>(Array.from(src.prevWeekMenus)) : undefined;
  dst.nextWeekMenus = src.nextWeekMenus ? new Set<string>(Array.from(src.nextWeekMenus)) : undefined;
  dst.monthMenus = src.monthMenus ? new Set<string>(Array.from(src.monthMenus)) : undefined;
}

// 특별식 메뉴 생성 (밥, 국, 반찬 구조)
export function generateSpecialMeal(
  type: 'breakfast' | 'lunch' | 'dinner',
  cuisineType: CuisineType,
  settings: StoreSettings
): Meal {
  const mealSets = specialMealSets[cuisineType];
  if (!mealSets || mealSets.length === 0) {
    // 폴백: 일반 식사 생성
    return generateMeal(type, settings);
  }

  const watchAllergens = settings.watchAllergens;
  const desiredSideDishCount = getDesiredSideDishCount(settings);
  
  // 알레르기가 없는 특별식 세트 필터링
  let availableSets = mealSets;
  if (watchAllergens && watchAllergens.length > 0) {
    availableSets = mealSets.filter(set => {
      // 세트 내 모든 메뉴 아이템 체크
      const allItems = [set.rice, set.soup, ...set.sideDishes];
      return !allItems.some(item => hasAllergen(item, watchAllergens));
    });
    
    // 알레르기 필터링 후 선택 가능한 세트가 없으면 일반 식사로 대체
    if (availableSets.length === 0) {
      return generateMeal(type, settings);
    }
  }

  const targetCost = getTargetCost(settings);
  const tries = targetCost > 0 ? getCostOptimizationTries(targetCost) : 1;
  const tolerance = targetCost > 0 ? Math.max(200, Math.round(targetCost * 0.03)) : 0;

  const buildFromSet = (set: (typeof availableSets)[number]) => {
    const rice = { ...set.rice };
    const soup = { ...set.soup };

    // 기본 세트 반찬
    const baseSideDishes = set.sideDishes.map(dish => ({ ...dish }));
    const usedItems: MenuItem[] = [rice, soup, ...baseSideDishes];

    // 예산/원가비율이 높아지면(또는 사용자가 반찬 수를 크게 잡으면) 특별식도 반찬 가짓수 증가
    // 특별식은 카테고리별로 분위기가 달라서,
    // "추가 반찬"도 해당 특별식 카테고리 내 후보에서만 채웁니다.
    // (필요 시에만 아주 마지막 폴백으로 공용 반찬을 사용)
    const cuisineExtraPoolRaw: MenuItem[] = [ ...((specialExtraSides as any)[cuisineType] || []) ];
    const cuisineExtraPool = filterAllergenMenus(
      cuisineExtraPoolRaw.filter((i) => !isSoupLikeName(i.name)),
      watchAllergens
    );
    const fallbackExtraPool = filterAllergenMenus(
      [...getSideData(), ...getVegetableData()].filter((i) => !isSoupLikeName(i.name)),
      watchAllergens
    );

    while (baseSideDishes.length < desiredSideDishCount) {
      // 1) 특별식 전용 추가 반찬에서 먼저 채움
      const candidates = cuisineExtraPool.filter((s) => !usedItems.some((u) => hasIngredientConflict(s, u)));
      const poolToUse = candidates.length > 0 ? candidates : cuisineExtraPool;

      // 2) 전용 풀로 더 이상 못 채우면(알레르기/충돌로 0개), 최후 폴백으로 공용 반찬 사용
      const finalPool = poolToUse.length > 0 ? poolToUse : fallbackExtraPool;
      const finalCandidates = finalPool.filter((s) => !usedItems.some((u) => hasIngredientConflict(s, u)));
      const picked = getCompatibleDish(
        finalCandidates.length > 0 ? finalCandidates : finalPool,
        usedItems,
        baseSideDishes,
        watchAllergens
      );
      baseSideDishes.push({ ...picked });
      usedItems.push(picked);
    }

    // 면 메뉴일 경우 미니밥 자동 추가
    const finalSideDishes = addMiniRiceIfNeeded(rice, baseSideDishes);
    const totals = calculateTotals(rice, soup, finalSideDishes);
    const costLimit = settings.budgetPerMeal * (settings.costRatio / 100);

    return {
      id: `meal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      rice,
      soup,
      sideDishes: finalSideDishes,
      ...totals,
      hasNutritionWarning: totals.totalSodium > 2000 || totals.totalCalories > 900,
      hasCostWarning: totals.totalCost > costLimit,
      isSpecialMeal: true,
      cuisineType,
    } as Meal;
  };

  // 목표 원가(예산×원가비율)에 근사하도록 "여러 번 생성 → 최적 후보 채택"
  let bestMeal = buildFromSet(getRandomItem(availableSets));
  if (targetCost > 0) {
    let bestScore = scoreCost(bestMeal.totalCost, targetCost);
    for (let i = 0; i < tries; i++) {
      const candidateMeal = buildFromSet(getRandomItem(availableSets));
      const s = scoreCost(candidateMeal.totalCost, targetCost);
      if (s < bestScore) {
        bestMeal = candidateMeal;
        bestScore = s;
        if (Math.abs(candidateMeal.totalCost - targetCost) <= tolerance) break;
      }
    }
  }
  
  return bestMeal;
}

export function generateMeal(
  type: 'breakfast' | 'lunch' | 'dinner',
  settings: StoreSettings,
  menuContext?: UsedMenuContext
): Meal {
  // 목표 원가(예산×원가비율)에 최대한 근사하도록 "여러 번 생성 → 최적 후보 채택"을 적용합니다.
  // 단, 주간 중복 방지 컨텍스트가 있는 경우에만 의미가 있으므로 컨텍스트를 복제/커밋하는 방식으로 구현합니다.
  const targetCost = getTargetCost(settings);
  if (!menuContext || targetCost <= 0) {
    return generateMealRaw(type, settings, menuContext);
  }

  const tries = getCostOptimizationTries(targetCost);
  const tolerance = Math.max(200, Math.round(targetCost * 0.03)); // 3% 이내면 충분히 근사치로 판단

  let bestMeal: Meal | null = null;
  let bestCtx: UsedMenuContext | null = null;
  let bestScore = Infinity;

  for (let i = 0; i < tries; i++) {
    const trialCtx = cloneUsedMenuContext(menuContext);
    const trialMeal = generateMealRaw(type, settings, trialCtx);
    const s = scoreCost(trialMeal.totalCost, targetCost);

    if (s < bestScore) {
      bestScore = s;
      bestMeal = trialMeal;
      bestCtx = trialCtx;
      if (Math.abs(trialMeal.totalCost - targetCost) <= tolerance) break;
    }
  }

  if (bestMeal && bestCtx) {
    commitUsedMenuContext(menuContext, bestCtx);
    return bestMeal;
  }

  return generateMealRaw(type, settings, menuContext);
}

function generateMealRaw(
  type: 'breakfast' | 'lunch' | 'dinner',
  settings: StoreSettings,
  menuContext?: UsedMenuContext
): Meal {
  const ctx = menuContext || createEmptyUsedMenuContext();
  const watchAllergens = settings.watchAllergens;
  const desiredSideDishCount = getDesiredSideDishCount(settings);
  
  // FDA 데이터 또는 샘플 데이터 가져오기
  const riceData = getRiceData();
  const soupData = getSoupData();
  const kimchiData = getKimchiData();
  const vegetableData = getVegetableData();
  const meatData = getMeatData();
  const sideData = getSideData();
  
  // 중복 방지를 적용한 메뉴 필터링 + 알레르기 필터링
  let allowedRice = filterAllowedMenus(
    riceData,
    ctx.currentDayIndex,
    ctx.allDays,
    ctx.currentDayMenus,
    ctx.prevWeekMenus,
    ctx.nextWeekMenus,
    ctx.monthMenus
  );
  allowedRice = filterAllergenMenus(allowedRice, watchAllergens);
  const rice = getRandomItem(allowedRice.length > 0 ? allowedRice : filterAllergenMenus(riceData, watchAllergens));
  
  // 밥 선택 후 currentDayMenus에 추가
  if (isCheckableMenu(rice)) {
    ctx.currentDayMenus.add(rice.name);
  }
  
  let allowedSoups = filterAllowedMenus(
    soupData,
    ctx.currentDayIndex,
    ctx.allDays,
    ctx.currentDayMenus,
    ctx.prevWeekMenus,
    ctx.nextWeekMenus,
    ctx.monthMenus
  );
  allowedSoups = filterAllergenMenus(allowedSoups, watchAllergens);
  const soup = getRandomItem(allowedSoups.length > 0 ? allowedSoups : filterAllergenMenus(soupData, watchAllergens));
  
  if (isCheckableMenu(soup)) {
    ctx.currentDayMenus.add(soup.name);
  }
  
  const sideDishes: MenuItem[] = [];
  const usedItems: MenuItem[] = [rice, soup];
  
  // 김치류 - 국/밥과 충돌하지 않는 것 선택 + 알레르기 필터링
  const kimchi = getCompatibleKimchi(soup, rice, [], watchAllergens);
  sideDishes.push(kimchi);
  usedItems.push(kimchi);
  if (isCheckableMenu(kimchi)) {
    ctx.currentDayMenus.add(kimchi.name);
  }

  // 반찬 수 규칙(사용자 요구):
  // - settings.sideDishCount는 "김치 포함 총 반찬 개수"다.
  //   예) 2개 = 김치 1 + 기타 1, 3개 = 김치 1 + 기타 2 ...
  //
  // 따라서 최소 2개부터 허용하고, 2개일 때는 '김치 + 메인'만 구성한다.

  // 야채/메인/추가반찬을 뽑을 때 공통으로 쓰는 "중복/알레르기/충돌" 안전 선택기
  const pickUniqueCategoryItem = <T extends MenuItem>(opts: {
    data: T[];
    baseCandidates: T[];
    labelForError: string;
  }): T => {
    const stage1 = filterAllergenMenus(
      filterAllowedMenus(
        opts.baseCandidates,
        ctx.currentDayIndex,
        ctx.allDays,
        ctx.currentDayMenus,
        ctx.prevWeekMenus,
        ctx.nextWeekMenus,
        ctx.monthMenus
      ),
      watchAllergens
    );
    if (stage1.length > 0) return getRandomItem(stage1);

    // 중복 금지는 유지하되, 재료 충돌(같은 재료군)만 완화해서 후보를 넓힙니다.
    const stage2 = filterAllergenMenus(
      filterAllowedMenus(
        opts.data,
        ctx.currentDayIndex,
        ctx.allDays,
        ctx.currentDayMenus,
        ctx.prevWeekMenus,
        ctx.nextWeekMenus,
        ctx.monthMenus
      ),
      watchAllergens
    );
    if (stage2.length > 0) return getRandomItem(stage2);

    throw new Error(`${opts.labelForError} 메뉴를 월간/주간/일간 중복 없이 선택할 수 없습니다. 반찬 풀을 늘리거나 조건을 완화해주세요.`);
  };

  const meat = pickUniqueCategoryItem({
    data: meatData,
    baseCandidates: meatData.filter(m => !usedItems.some(used => hasIngredientConflict(m, used))),
    labelForError: '메인/단백질',
  });
  sideDishes.push(meat);
  usedItems.push(meat);
  if (isCheckableMenu(meat)) {
    ctx.currentDayMenus.add(meat.name);
  }

  // 3개 이상일 때만 '나물/채소'를 추가해서 균형을 맞춥니다.
  // (2개 구성일 때는 김치+메인만 요구됨)
  if (desiredSideDishCount >= 3) {
    const vegetable = pickUniqueCategoryItem({
      data: vegetableData,
      baseCandidates: vegetableData.filter(v => !usedItems.some(used => hasIngredientConflict(v, used))),
      labelForError: '나물/채소',
    });
    sideDishes.push(vegetable);
    usedItems.push(vegetable);
    if (isCheckableMenu(vegetable)) {
      ctx.currentDayMenus.add(vegetable.name);
    }
  }
  
  // 반찬 추가 (가짓수 조절)
  // - 최소: 2개(김치+메인)
  // - 3개: 김치+메인+나물/채소
  // - 4개 이상: 위 구성 + 추가 반찬(side)로 채움
  while (sideDishes.length < desiredSideDishCount) {
    // 국/탕/찌개/전골/스프/국물 같은 메뉴가 "반찬"으로 하나 더 붙으면 어색하므로 제외
    const baseCandidates = sideData
      .filter((s) => !isSoupLikeName(s.name))
      .filter((s) => !usedItems.some((used) => hasIngredientConflict(s, used)));

    const allowedSidesStage1 = filterAllergenMenus(
      filterAllowedMenus(
        baseCandidates,
        ctx.currentDayIndex,
        ctx.allDays,
        ctx.currentDayMenus,
        ctx.prevWeekMenus,
        ctx.nextWeekMenus,
        ctx.monthMenus
      ),
      watchAllergens
    );

    const allowedSidesStage2 =
      allowedSidesStage1.length > 0
        ? allowedSidesStage1
        : filterAllergenMenus(
            filterAllowedMenus(
              sideData.filter((s) => !isSoupLikeName(s.name)),
              ctx.currentDayIndex,
              ctx.allDays,
              ctx.currentDayMenus,
              ctx.prevWeekMenus,
              ctx.nextWeekMenus,
              ctx.monthMenus
            ),
            watchAllergens
          );

    if (allowedSidesStage2.length === 0) {
      throw new Error('추가 반찬을 월간/주간/일간 중복 없이 채울 수 없습니다. 반찬 풀을 늘리거나 조건을 완화해주세요.');
    }

    const side = getRandomItem(allowedSidesStage2);
    sideDishes.push(side);
    usedItems.push(side);
    if (isCheckableMenu(side)) {
      ctx.currentDayMenus.add(side.name);
    }
  }

  // 면 메뉴일 경우 미니밥 자동 추가
  const finalSideDishes = addMiniRiceIfNeeded(rice, sideDishes);

  const totals = calculateTotals(rice, soup, finalSideDishes);
  
  const costLimit = settings.budgetPerMeal * (settings.costRatio / 100);
  const hasCostWarning = totals.totalCost > costLimit;
  const hasNutritionWarning = totals.totalSodium > 2000 || totals.totalCalories > 900;

  return {
    id: `meal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    rice,
    soup,
    sideDishes: finalSideDishes,
    ...totals,
    hasNutritionWarning,
    hasCostWarning,
  };
}

export function generateSnack(type: MealType, watchAllergens?: string[]): SnackMeal {
  const availableSnacks = filterAllergenMenus(sampleSnacks, watchAllergens);
  const snacksToUse = availableSnacks.length > 0 ? availableSnacks : sampleSnacks;
  
  const items = [getRandomItem(snacksToUse), getRandomItem(snacksToUse)];
  const uniqueItems = Array.from(new Set(items.map(i => i.id))).map(
    id => items.find(i => i.id === id)!
  );
  
  return {
    id: `snack-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    items: uniqueItems,
    totalCalories: uniqueItems.reduce((sum, item) => sum + item.calories, 0),
    totalCost: uniqueItems.reduce((sum, item) => sum + item.cost, 0),
  };
}

export function generateSingleSnackItem(watchAllergens?: string[]): MenuItem {
  const availableSnacks = filterAllergenMenus(sampleSnacks, watchAllergens);
  return getRandomItem(availableSnacks.length > 0 ? availableSnacks : sampleSnacks);
}

export function generateDayMealPlan(
  date: string,
  dayOfWeek: string,
  settings: StoreSettings,
  menuContext?: UsedMenuContext
): DayMealPlan {
  const meals: Meal[] = [];
  const ctx = menuContext || createEmptyUsedMenuContext();
  
  // 끼니 조합에 따라 생성할 끼니 결정
  let mealTypes: ('breakfast' | 'lunch' | 'dinner')[];
  if (settings.mealsPerDay === 1) {
    // 1끼: singleMealType에 따라 선택
    mealTypes = [settings.singleMealType || 'lunch'];
  } else if (settings.mealsPerDay === 2) {
    // 2끼: mealCombination에 따라 선택
    if (settings.mealCombination === 'breakfast_lunch') {
      mealTypes = ['breakfast', 'lunch'];
    } else if (settings.mealCombination === 'breakfast_dinner') {
      mealTypes = ['breakfast', 'dinner'];
    } else {
      mealTypes = ['lunch', 'dinner'];
    }
  } else {
    mealTypes = ['breakfast', 'lunch', 'dinner'];
  }
  
  mealTypes.forEach(type => {
    meals.push(generateMeal(type, settings, ctx));
  });

  const snacks: SnackMeal[] = [];
  if (settings.snackMorning) {
    snacks.push(generateSnack('snack_morning', settings.watchAllergens));
  }
  if (settings.snackAfternoon) {
    snacks.push(generateSnack('snack_afternoon', settings.watchAllergens));
  }
  if (settings.snackEvening) {
    snacks.push(generateSnack('snack_evening', settings.watchAllergens));
  }

  return {
    id: `day-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    date,
    dayOfWeek,
    meals,
    snacks: snacks.length > 0 ? snacks : undefined,
  };
}

function getDayOfWeek(date: Date): string {
  const dayIndex = date.getDay();
  // 일요일(0)을 6으로, 나머지는 -1
  const koreanDayIndex = dayIndex === 0 ? 6 : dayIndex - 1;
  return DAYS_KR[koreanDayIndex];
}

export function generateWeekMealPlan(
  weekNumber: number,
  settings: StoreSettings,
  startDate: Date = new Date(),
  prevWeekPlan?: WeekMealPlan,
  nextWeekPlan?: WeekMealPlan,
  monthMenus?: Set<string>
): WeekMealPlan {
  const days: DayMealPlan[] = [];
  
  // 인접 주차 메뉴 수집
  const prevWeekMenus = prevWeekPlan ? getWeekMenuNames(prevWeekPlan) : undefined;
  const nextWeekMenus = nextWeekPlan ? getWeekMenuNames(nextWeekPlan) : undefined;
  
  // 시작 날짜 설정
  const actualStartDate = settings.startDate ? new Date(settings.startDate) : startDate;
  // 주차에 따라 시작일 조정
  const weekOffset = (weekNumber - 1) * 7;
  const adjustedStartDate = new Date(actualStartDate);
  adjustedStartDate.setDate(adjustedStartDate.getDate() + weekOffset);
  
  for (let i = 0; i < settings.daysPerWeek; i++) {
    const date = new Date(adjustedStartDate);
    date.setDate(date.getDate() + i);
    
    // 메뉴 컨텍스트 생성
    const menuContext: UsedMenuContext = {
      currentDayIndex: i,
      allDays: days, // 이미 생성된 날들
      currentDayMenus: new Set<string>(),
      prevWeekMenus,
      nextWeekMenus,
      monthMenus,
    };
    
    days.push(generateDayMealPlan(
      date.toISOString().split('T')[0],
      getDayOfWeek(date),
      settings,
      menuContext
    ));
  }

  const endDate = new Date(adjustedStartDate);
  endDate.setDate(endDate.getDate() + settings.daysPerWeek - 1);

  return {
    id: `week-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    weekNumber,
    startDate: adjustedStartDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    days,
  };
}

export function regenerateMeal(
  meal: Meal,
  settings: StoreSettings
): Meal {
  // 특별식인 경우 해당 카테고리로 재생성
  if (meal.isSpecialMeal && meal.cuisineType) {
    return generateSpecialMeal(meal.type as 'breakfast' | 'lunch' | 'dinner', meal.cuisineType, settings);
  }
  return generateMeal(meal.type as 'breakfast' | 'lunch' | 'dinner', settings);
}

export function regenerateRice(meal: Meal, settings: StoreSettings): Meal {
  // 특별식인 경우 해당 카테고리 메뉴로 재생성
  if (meal.isSpecialMeal && meal.cuisineType) {
    return generateSpecialMeal(meal.type as 'breakfast' | 'lunch' | 'dinner', meal.cuisineType, settings);
  }

  const watchAllergens = settings.watchAllergens;
  
  // FDA 데이터 또는 샘플 데이터 가져오기 (한식만)
  const riceData = getRiceData();
  
  // 알레르기 필터링 적용
  const availableRice = filterAllergenMenus(riceData, watchAllergens);
  const newRice = getRandomItem(availableRice.length > 0 ? availableRice : riceData, [meal.rice]);
  
  // 면 → 밥: 미니밥 제거, 밥 → 면: 미니밥 추가
  let newSideDishes = removeMiniRiceIfNeeded(newRice, meal.sideDishes);
  newSideDishes = addMiniRiceIfNeeded(newRice, newSideDishes);
  
  const totals = calculateTotals(newRice, meal.soup, newSideDishes);
  const costLimit = settings.budgetPerMeal * (settings.costRatio / 100);
  
  return {
    ...meal,
    rice: newRice,
    sideDishes: newSideDishes,
    ...totals,
    hasCostWarning: totals.totalCost > costLimit,
    hasNutritionWarning: totals.totalSodium > 2000 || totals.totalCalories > 900,
  };
}

export function regenerateSoup(meal: Meal, settings: StoreSettings): Meal {
  // 특별식인 경우 해당 카테고리 메뉴로 재생성
  if (meal.isSpecialMeal && meal.cuisineType) {
    return generateSpecialMeal(meal.type as 'breakfast' | 'lunch' | 'dinner', meal.cuisineType, settings);
  }

  const watchAllergens = settings.watchAllergens;
  
  // FDA 데이터 또는 샘플 데이터 가져오기 (한식만)
  const soupData = getSoupData();
  
  // 알레르기 필터링 적용
  const availableSoups = filterAllergenMenus(soupData, watchAllergens);
  const newSoup = getRandomItem(availableSoups.length > 0 ? availableSoups : soupData, [meal.soup]);
  
  // 새 국에 맞는 김치 다시 선택 (알레르기 필터링 포함)
  const kimchiIndex = meal.sideDishes.findIndex(d => d.category === 'kimchi');
  const newSideDishes = [...meal.sideDishes];
  if (kimchiIndex >= 0) {
    newSideDishes[kimchiIndex] = getCompatibleKimchi(newSoup, meal.rice, [], watchAllergens);
  }
  
  const totals = calculateTotals(meal.rice, newSoup, newSideDishes);
  const costLimit = settings.budgetPerMeal * (settings.costRatio / 100);
  
  return {
    ...meal,
    soup: newSoup,
    sideDishes: newSideDishes,
    ...totals,
    hasCostWarning: totals.totalCost > costLimit,
    hasNutritionWarning: totals.totalSodium > 2000 || totals.totalCalories > 900,
  };
}

export function regenerateSnackItem(snack: SnackMeal, watchAllergens?: string[]): SnackMeal {
  const availableSnacks = filterAllergenMenus(sampleSnacks, watchAllergens);
  const snacksToUse = availableSnacks.length > 0 ? availableSnacks : sampleSnacks;
  
  const newItems = [getRandomItem(snacksToUse), getRandomItem(snacksToUse)];
  const uniqueItems = Array.from(new Set(newItems.map(i => i.id))).map(
    id => newItems.find(i => i.id === id)!
  );
  
  return {
    ...snack,
    items: uniqueItems,
    totalCalories: uniqueItems.reduce((sum, item) => sum + item.calories, 0),
    totalCost: uniqueItems.reduce((sum, item) => sum + item.cost, 0),
  };
}

export function regenerateSingleSnackItem(snack: SnackMeal, itemIndex: number, watchAllergens?: string[]): SnackMeal {
  const availableSnacks = filterAllergenMenus(sampleSnacks, watchAllergens);
  const snacksToUse = availableSnacks.length > 0 ? availableSnacks : sampleSnacks;
  
  const newItem = getRandomItem(snacksToUse, [snack.items[itemIndex]]);
  const newItems = [...snack.items];
  newItems[itemIndex] = newItem;
  
  return {
    ...snack,
    items: newItems,
    totalCalories: newItems.reduce((sum, item) => sum + item.calories, 0),
    totalCost: newItems.reduce((sum, item) => sum + item.cost, 0),
  };
}

export function regenerateSideDish(
  meal: Meal,
  dishIndex: number,
  settings: StoreSettings
): Meal {
  // 특별식인 경우 해당 카테고리 메뉴로 재생성
  if (meal.isSpecialMeal && meal.cuisineType) {
    return generateSpecialMeal(meal.type as 'breakfast' | 'lunch' | 'dinner', meal.cuisineType, settings);
  }

  const watchAllergens = settings.watchAllergens;
  const category = meal.sideDishes[dishIndex].category;
  const usedItems: MenuItem[] = [meal.rice, meal.soup, ...meal.sideDishes.filter((_, i) => i !== dishIndex)];
  
  // FDA 데이터 또는 샘플 데이터 가져오기 (한식만)
  const vegetableData = getVegetableData();
  const meatData = getMeatData();
  const sideData = getSideData();
  
  let newDish: MenuItem;
  
  switch (category) {
    case 'kimchi':
      newDish = getCompatibleKimchi(meal.soup, meal.rice, [meal.sideDishes[dishIndex]], watchAllergens);
      break;
    case 'vegetable':
      newDish = getCompatibleDish(vegetableData, usedItems, [meal.sideDishes[dishIndex]], watchAllergens);
      break;
    case 'meat':
      newDish = getCompatibleDish(meatData, usedItems, [meal.sideDishes[dishIndex]], watchAllergens);
      break;
    default:
      // 반찬 재생성에서도 "국/탕/국물" 계열은 추가 반찬으로 어색하므로 제외
      newDish = getCompatibleDish(
        sideData.filter((s) => !isSoupLikeName(s.name)),
        usedItems,
        [meal.sideDishes[dishIndex]],
        watchAllergens
      );
  }
  
  const newSideDishes = [...meal.sideDishes];
  newSideDishes[dishIndex] = newDish;
  
  const totals = calculateTotals(meal.rice, meal.soup, newSideDishes);
  const costLimit = settings.budgetPerMeal * (settings.costRatio / 100);
  
  return {
    ...meal,
    sideDishes: newSideDishes,
    ...totals,
    hasCostWarning: totals.totalCost > costLimit,
    hasNutritionWarning: totals.totalSodium > 2000 || totals.totalCalories > 900,
  };
}

// 반찬 추가
export function addSideDish(meal: Meal, settings: StoreSettings): Meal {
  const watchAllergens = settings.watchAllergens;
  const usedItems: MenuItem[] = [meal.rice, meal.soup, ...meal.sideDishes];
  
  // FDA 데이터 또는 샘플 데이터 가져오기 (한식만)
  const sideData = getSideData();
  
  // 반찬 추가에서도 "국/탕/국물" 계열은 제외
  const newDish = getCompatibleDish(
    sideData.filter((s) => !isSoupLikeName(s.name)),
    usedItems,
    [],
    watchAllergens
  );
  const newSideDishes = [...meal.sideDishes, newDish];
  
  const totals = calculateTotals(meal.rice, meal.soup, newSideDishes);
  const costLimit = settings.budgetPerMeal * (settings.costRatio / 100);
  
  return {
    ...meal,
    sideDishes: newSideDishes,
    ...totals,
    hasCostWarning: totals.totalCost > costLimit,
    hasNutritionWarning: totals.totalSodium > 2000 || totals.totalCalories > 900,
  };
}

// 반찬 삭제
export function removeSideDish(meal: Meal, dishIndex: number, settings: StoreSettings): Meal {
  if (meal.sideDishes.length <= 1) {
    // 최소 1개는 유지
    return meal;
  }
  
  const newSideDishes = meal.sideDishes.filter((_, index) => index !== dishIndex);
  const totals = calculateTotals(meal.rice, meal.soup, newSideDishes);
  const costLimit = settings.budgetPerMeal * (settings.costRatio / 100);
  
  return {
    ...meal,
    sideDishes: newSideDishes,
    ...totals,
    hasCostWarning: totals.totalCost > costLimit,
    hasNutritionWarning: totals.totalSodium > 2000 || totals.totalCalories > 900,
  };
}

// 식사 총합 재계산 (직접 입력 후 사용)
export function recalculateMealTotals(meal: Meal, settings: StoreSettings): Meal {
  const totals = calculateTotals(meal.rice, meal.soup, meal.sideDishes);
  const costLimit = settings.budgetPerMeal * (settings.costRatio / 100);
  
  return {
    ...meal,
    ...totals,
    hasCostWarning: totals.totalCost > costLimit,
    hasNutritionWarning: totals.totalSodium > 2000 || totals.totalCalories > 900,
  };
}
