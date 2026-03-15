/**
 * 영양 정보 보강 서비스
 * FDA API를 사용하여 하드코딩 식단의 영양 정보를 정확하게 업데이트
 * Supabase DB에 영구 저장하여 중복 API 호출 최소화
 */

import { MenuItem, Meal, DayMealPlan, WeekMealPlan, SnackMeal } from '@/types/meal';
import { fetchWithRetry, RETRY_PRESETS } from '@/utils/apiRetry';
import { getRateLimiter, RATE_LIMIT_PRESETS } from '@/utils/rateLimiter';
import { supabase } from '@/integrations/supabase/client';

const NUTRITION_CACHE_KEY = 'nutrition_cache_v1';
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24시간

interface NutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sodium: number;
  timestamp: number;
}

interface NutritionCache {
  [foodName: string]: NutritionData;
}

/**
 * 로컬 스토리지에서 영양 정보 캐시 로드
 */
function loadNutritionCache(): NutritionCache {
  if (typeof window === 'undefined') return {};
  
  try {
    const cached = localStorage.getItem(NUTRITION_CACHE_KEY);
    if (!cached) return {};
    
    const cache: NutritionCache = JSON.parse(cached);
    const now = Date.now();
    
    // 만료된 항목 제거
    Object.keys(cache).forEach(key => {
      if (now - cache[key].timestamp > CACHE_EXPIRY_MS) {
        delete cache[key];
      }
    });
    
    return cache;
  } catch (error) {
    console.error('영양 캐시 로드 실패:', error);
    return {};
  }
}

/**
 * 영양 정보 캐시 저장
 */
function saveNutritionCache(cache: NutritionCache): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(NUTRITION_CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error('영양 캐시 저장 실패:', error);
  }
}

/**
 * FDA API에서 영양 정보 가져오기
 */
async function fetchNutritionFromFDA(foodName: string): Promise<NutritionData | null> {
  try {
    // Rate Limit 체크
    const limiter = getRateLimiter();
    await limiter.waitAndAcquire('fda-nutrition-search', RATE_LIMIT_PRESETS.publicAPI);
    
    // API 호출 (파라미터명 수정: query → keyword) + 재시도 로직
    const response = await fetchWithRetry(
      `/api/fda/search?keyword=${encodeURIComponent(foodName)}&pageNo=1&numOfRows=1`,
      undefined,
      RETRY_PRESETS.fast // 공공 API는 빠른 재시도
    );
    
    if (!response.ok) {
      console.warn(`FDA API 요청 실패 (${foodName}):`, response.status);
      return null;
    }
    
    const data = await response.json();
    
    if (!data.body?.items || data.body.items.length === 0) {
      console.warn(`FDA API 결과 없음 (${foodName})`);
      return null;
    }
    
    const item = data.body.items[0];
    
    // 영양 정보 추출 (급식소 기준 1인분으로 변환)
    const nutrition = extractNutrition(item, foodName);
    
    return nutrition;
  } catch (error) {
    console.error(`FDA API 오류 (${foodName}):`, error);
    return null;
  }
}

/**
 * FDA API 응답에서 영양 정보 추출 및 1인분 변환
 */
function extractNutrition(fdaItem: any, foodName: string): NutritionData {
  // 100g 기준 영양 정보
  const calories100g = parseFloat(fdaItem.AMT_NUM1 || '0');
  const protein100g = parseFloat(fdaItem.AMT_NUM3 || '0');
  const fat100g = parseFloat(fdaItem.AMT_NUM4 || '0');
  const carbs100g = parseFloat(fdaItem.AMT_NUM5 || '0');
  const sodium100g = parseFloat(fdaItem.AMT_NUM13 || '0');
  
  // 급식소 기준 1인분 g수
  const servingSize = getCafeteriaServingSize(foodName);
  
  // 100g → 1인분 변환 배율
  const multiplier = servingSize / 100;
  
  return {
    calories: Math.round(calories100g * multiplier),
    protein: Math.round(protein100g * multiplier * 10) / 10,
    carbs: Math.round(carbs100g * multiplier * 10) / 10,
    fat: Math.round(fat100g * multiplier * 10) / 10,
    sodium: Math.round(sodium100g * multiplier),
    timestamp: Date.now(),
  };
}

/**
 * Supabase DB에서 영양 정보 조회
 */
async function fetchNutritionFromDatabase(foodName: string): Promise<NutritionData | null> {
  try {
    const { data, error } = await supabase
      .from('nutrition_data')
      .select('calories, protein, carbs, fat, sodium')
      .eq('food_name', foodName)
      .maybeSingle();
    
    if (error || !data) {
      return null;
    }
    
    return {
      calories: data.calories,
      // numeric 컬럼은 런타임에서 number 또는 string으로 올 수 있어 Number()로 방어 처리
      protein: Number(data.protein),
      carbs: Number(data.carbs),
      fat: Number(data.fat),
      sodium: data.sodium,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.warn(`DB 조회 실패 (${foodName}):`, error);
    return null;
  }
}

/**
 * Supabase DB에 영양 정보 저장
 */
async function saveNutritionToDatabase(foodName: string, nutrition: NutritionData, fdaFoodCode?: string): Promise<void> {
  try {
    const servingSize = getCafeteriaServingSize(foodName);
    
    const { error } = await supabase
      .from('nutrition_data')
      .insert({
        food_name: foodName,
        calories: nutrition.calories,
        protein: nutrition.protein,
        carbs: nutrition.carbs,
        fat: nutrition.fat,
        sodium: nutrition.sodium,
        fda_food_code: fdaFoodCode,
        serving_size_g: servingSize,
      });
    
    if (error) {
      // UNIQUE 제약 조건 위반은 무시 (이미 다른 사용자가 저장)
      if (!error.message.includes('duplicate key') && !error.message.includes('unique')) {
        console.error(`DB 저장 실패 (${foodName}):`, error);
      }
    } else {
      console.log(`✅ DB 저장 완료: ${foodName}`);
    }
  } catch (error) {
    console.warn(`DB 저장 실패 (${foodName}):`, error);
  }
}

/**
 * 급식소 기준 1인분 g수 (카테고리별)
 */
function getCafeteriaServingSize(foodName: string): number {
  // 면류
  const noodleKeywords = ['면', '우동', '국수', '파스타', '스파게티', '짜장', '짬뽕', '라면', '냉면', '쫄면', '칼국수'];
  if (noodleKeywords.some(keyword => foodName.includes(keyword))) {
    return 300; // 면류 300g
  }
  
  // 죽
  if (foodName.includes('죽')) {
    return 250; // 죽 250g
  }
  
  // 국/탕/찌개
  const soupKeywords = ['국', '탕', '찌개', '전골', '곰탕', '설렁탕'];
  if (soupKeywords.some(keyword => foodName.includes(keyword))) {
    return 250; // 국물 250ml
  }
  
  // 김치/장아찌
  const kimchiKeywords = ['김치', '깍두기', '겉절이', '장아찌', '젓갈'];
  if (kimchiKeywords.some(keyword => foodName.includes(keyword))) {
    return 30; // 김치 30g
  }
  
  // 고기/생선
  const meatKeywords = ['고기', '불고기', '제육', '갈비', '삼겹', '닭', '생선', '구이', '조림', '찜'];
  if (meatKeywords.some(keyword => foodName.includes(keyword))) {
    return 80; // 고기 반찬 80g
  }
  
  // 채소/나물
  const vegetableKeywords = ['나물', '숙채', '무침', '샐러드', '채소', '쌈'];
  if (vegetableKeywords.some(keyword => foodName.includes(keyword))) {
    return 70; // 채소 반찬 70g
  }
  
  // 작은 반찬
  const sideKeywords = ['전', '부침', '볶음', '어묵', '계란', '두부', '감자'];
  if (sideKeywords.some(keyword => foodName.includes(keyword))) {
    return 50; // 작은 반찬 50g
  }
  
  // 밥 (기본값)
  return 210; // 밥 1공기 210g
}

/**
 * 단일 메뉴 아이템의 영양 정보 보강 (DB 우선)
 */
export async function enrichMenuItemNutrition(item: MenuItem): Promise<MenuItem> {
  // 🔒 방어 코드: 직접 입력한 메뉴는 보강하지 않음
  if (item.isCustom) {
    console.log(`🔒 직접 입력 메뉴 (${item.name}), 영양정보 보강 건너뜀`);
    return item;
  }
  
  // 1단계: Supabase DB 조회
  const dbNutrition = await fetchNutritionFromDatabase(item.name);
  
  if (dbNutrition) {
    // DB 히트 - API 호출 없음! ⚡
    return {
      ...item,
      calories: dbNutrition.calories,
      protein: dbNutrition.protein,
      carbs: dbNutrition.carbs,
      fat: dbNutrition.fat,
      sodium: dbNutrition.sodium,
    };
  }
  
  // 2단계: LocalStorage 캐시 확인 (DB 실패 시 fallback)
  const cache = loadNutritionCache();
  
  if (cache[item.name]) {
    // 캐시 히트
    const nutrition = cache[item.name];
    
    // DB에 비동기로 저장 (다음 사용자를 위해)
    saveNutritionToDatabase(item.name, nutrition).catch(() => {});
    
    return {
      ...item,
      calories: nutrition.calories,
      protein: nutrition.protein,
      carbs: nutrition.carbs,
      fat: nutrition.fat,
      sodium: nutrition.sodium,
    };
  }
  
  // 3단계: FDA API 호출 (DB, 캐시 모두 미스)
  const nutrition = await fetchNutritionFromFDA(item.name);
  
  if (nutrition) {
    // LocalStorage 캐시 저장 (즉시 사용)
    cache[item.name] = nutrition;
    saveNutritionCache(cache);
    
    // DB에 영구 저장 (비동기)
    saveNutritionToDatabase(item.name, nutrition).catch(() => {});
    
    return {
      ...item,
      calories: nutrition.calories,
      protein: nutrition.protein,
      carbs: nutrition.carbs,
      fat: nutrition.fat,
      sodium: nutrition.sodium,
    };
  }
  
  // FDA API 실패 - 기존 값 유지
  console.warn(`영양 정보 보강 실패 (${item.name}), 기존 값 유지`);
  return item;
}

/**
 * 식사(Meal)의 모든 메뉴 영양 정보 보강
 */
export async function enrichMealNutrition(meal: Meal): Promise<Meal> {
  console.log(`🔄 영양 정보 보강 중: ${meal.type}...`);
  
  // 병렬 처리
  const [enrichedRice, enrichedSoup, ...enrichedSideDishes] = await Promise.all([
    enrichMenuItemNutrition(meal.rice),
    enrichMenuItemNutrition(meal.soup),
    ...meal.sideDishes.map(dish => enrichMenuItemNutrition(dish)),
  ]);
  
  // 합계 재계산
  const allItems = [enrichedRice, enrichedSoup, ...enrichedSideDishes];
  const totalCalories = allItems.reduce((sum, item) => sum + item.calories, 0);
  const totalProtein = allItems.reduce((sum, item) => sum + item.protein, 0);
  const totalCarbs = allItems.reduce((sum, item) => sum + item.carbs, 0);
  const totalFat = allItems.reduce((sum, item) => sum + item.fat, 0);
  const totalSodium = allItems.reduce((sum, item) => sum + item.sodium, 0);
  const totalCost = allItems.reduce((sum, item) => sum + item.cost, 0);
  
  console.log(`✅ 영양 정보 보강 완료: ${meal.type} (${totalCalories} kcal)`);
  
  return {
    ...meal,
    rice: enrichedRice,
    soup: enrichedSoup,
    sideDishes: enrichedSideDishes,
    totalCalories,
    totalProtein,
    totalCarbs,
    totalFat,
    totalSodium,
    totalCost,
    // 경고 재계산
    hasNutritionWarning: totalSodium > 2000 || totalCalories > 900,
  };
}

/**
 * 하루 식단(DayMealPlan)의 모든 식사 영양 정보 보강
 */
export async function enrichDayNutrition(day: DayMealPlan): Promise<DayMealPlan> {
  const enrichedMeals = await Promise.all(
    day.meals.map(meal => enrichMealNutrition(meal))
  );
  
  return {
    ...day,
    meals: enrichedMeals,
  };
}

/**
 * 주간 식단(WeekMealPlan)의 모든 날짜 영양 정보 보강
 */
export async function enrichWeekNutrition(week: WeekMealPlan): Promise<WeekMealPlan> {
  console.log(`🍽️ 주간 식단 영양 정보 보강 시작...`);
  
  const enrichedDays = await Promise.all(
    week.days.map(day => enrichDayNutrition(day))
  );
  
  console.log(`✅ 주간 식단 영양 정보 보강 완료!`);
  
  return {
    ...week,
    days: enrichedDays,
  };
}

/**
 * 간식(SnackMeal) 영양 정보 보강
 */
export async function enrichSnackNutrition(snack: SnackMeal): Promise<SnackMeal> {
  const enrichedItems = await Promise.all(
    snack.items.map(item => enrichMenuItemNutrition(item))
  );
  
  const totalCalories = enrichedItems.reduce((sum, item) => sum + item.calories, 0);
  const totalCost = enrichedItems.reduce((sum, item) => sum + item.cost, 0);
  
  return {
    ...snack,
    items: enrichedItems,
    totalCalories,
    totalCost,
  };
}

/**
 * 영양 캐시 초기화 (개발/디버깅용)
 */
export function clearNutritionCache(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(NUTRITION_CACHE_KEY);
    console.log('✅ 영양 캐시 초기화 완료');
  } catch (error) {
    console.error('영양 캐시 초기화 실패:', error);
  }
}

/**
 * 영양 캐시 상태 확인 (개발/디버깅용)
 */
export function getNutritionCacheStatus(): { total: number; items: string[] } {
  const cache = loadNutritionCache();
  const items = Object.keys(cache);
  
  return {
    total: items.length,
    items: items.slice(0, 10), // 처음 10개만
  };
}

/**
 * LocalStorage → Supabase DB 마이그레이션
 * 기존 캐시 데이터를 DB로 이전
 */
export async function migrateLocalStorageToDatabase(): Promise<{ success: number; failed: number; skipped: number }> {
  const stats = { success: 0, failed: 0, skipped: 0 };
  
  if (typeof window === 'undefined') {
    console.warn('서버 환경에서는 마이그레이션 불가');
    return stats;
  }
  
  try {
    const cache = loadNutritionCache();
    const foodNames = Object.keys(cache);
    
    if (foodNames.length === 0) {
      console.log('마이그레이션할 캐시 데이터 없음');
      return stats;
    }
    
    console.log(`🔄 ${foodNames.length}개 항목 마이그레이션 시작...`);
    
    for (const foodName of foodNames) {
      const nutrition = cache[foodName];
      
      // 이미 DB에 있는지 확인
      const existing = await fetchNutritionFromDatabase(foodName);
      
      if (existing) {
        stats.skipped++;
        continue;
      }
      
      // DB에 저장
      try {
        await saveNutritionToDatabase(foodName, nutrition);
        stats.success++;
      } catch (error) {
        console.error(`마이그레이션 실패: ${foodName}`, error);
        stats.failed++;
      }
    }
    
    console.log(`✅ 마이그레이션 완료:`, stats);
    return stats;
    
  } catch (error) {
    console.error('마이그레이션 오류:', error);
    return stats;
  }
}

/**
 * DB 통계 조회 (개발/디버깅용)
 */
export async function getDatabaseNutritionStats(): Promise<{ total: number; recent: string[] }> {
  try {
    const { data, error, count } = await supabase
      .from('nutrition_data')
      .select('food_name', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) {
      console.error('DB 통계 조회 실패:', error);
      return { total: 0, recent: [] };
    }
    
    return {
      total: count || 0,
      recent: data?.map(item => item.food_name) || [],
    };
  } catch (error) {
    console.error('DB 통계 조회 오류:', error);
    return { total: 0, recent: [] };
  }
}
