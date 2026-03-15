/**
 * FDA API 카테고리별 식품 검색 서비스
 */

import { MenuItem } from '@/types/meal';
import { FDAAPIResponse, FDANutritionResponse } from '@/types/ingredient';
import { convertMultipleFDAToMenuItems } from '@/utils/fdaToMenuItem';
import { fetchWithRetry, RETRY_PRESETS } from '@/utils/apiRetry';
import { getRateLimiter, RATE_LIMIT_PRESETS } from '@/utils/rateLimiter';

/**
 * 카테고리별 검색 키워드 매핑 (한식 중심 + 다양성)
 * 특별식(중식/일식/양식)은 별도로 필터링
 */
const CATEGORY_KEYWORDS: Record<MenuItem['category'], string[]> = {
  rice: ['밥', '죽', '비빔밥', '덮밥', '국수', '칼국수', '잔치국수', '수제비'],  // 한식 면류 포함
  soup: ['국', '탕', '찌개', '전골', '곰탕', '설렁탕', '갈비탕', '추어탕'],
  kimchi: ['김치', '깍두기', '겉절이', '장아찌', '젓갈'],
  vegetable: ['나물', '숙채', '무침', '채소', '쌈', '샐러드'],  // 샐러드는 한식에도 있음
  meat: ['고기', '불고기', '제육', '갈비', '삼겹', '닭', '생선', '구이', '조림', '찜', '편육'],
  side: ['전', '부침', '볶음', '어묵', '계란', '두부', '감자', '튀김'],  // 한식 튀김 포함 (야채튀김 등)
};

/**
 * 특별식 전용 키워드 (일반 식단에서 제외)
 * 이 키워드들은 자동으로 필터링됨
 */
const SPECIAL_FOOD_KEYWORDS = {
  chinese: ['짜장', '짬뽕', '탕수육', '마파두부', '칠리', '깐풍', '양장피'],
  japanese: ['우동', '라면', '돈까스', '초밥', '사시미', '가츠', '오뎅', '오코노미야키'],
  western: ['파스타', '스파게티', '피자', '스테이크', '리조또', '그라탕', '오믈렛'],
  snack: ['떡볶이', '순대', '튀김', '김밥', '핫도그', '어묵꼬치'],
};

/**
 * FDA API 검색 (프록시 경유)
 */
async function searchFDAAPI(keyword: string, pageSize: number = 100): Promise<FDANutritionResponse[]> {
  try {
    // Rate Limit 체크
    const limiter = getRateLimiter();
    await limiter.waitAndAcquire('fda-category-search', RATE_LIMIT_PRESETS.publicAPI);
    
    // 재시도 로직 추가
    const response = await fetchWithRetry(
      `/api/fda/search?keyword=${encodeURIComponent(keyword)}&numOfRows=${pageSize}`,
      undefined,
      RETRY_PRESETS.fast
    );
    
    if (!response.ok) {
      throw new Error(`FDA API 요청 실패: ${response.status}`);
    }
    
    const data: FDAAPIResponse = await response.json();
    
    if (!data.body?.items || data.body.items.length === 0) {
      return [];
    }
    
    return data.body.items;
  } catch (error) {
    console.error(`FDA API 검색 실패 (${keyword}):`, error);
    return [];
  }
}

/**
 * 외국 음식 키워드 체크 (중식/일식/양식/분식)
 */
function isForeignFood(foodName: string): boolean {
  const allSpecialKeywords = [
    ...SPECIAL_FOOD_KEYWORDS.chinese,
    ...SPECIAL_FOOD_KEYWORDS.japanese,
    ...SPECIAL_FOOD_KEYWORDS.western,
    ...SPECIAL_FOOD_KEYWORDS.snack,
  ];
  
  return allSpecialKeywords.some(keyword => foodName.includes(keyword));
}

/**
 * 카테고리별 식품 검색 (한식 중심 + 다양성)
 */
export async function searchFoodByCategory(
  category: MenuItem['category'],
  maxResults: number = 100  // 결과 수 증가 (50 → 100)
): Promise<MenuItem[]> {
  const keywords = CATEGORY_KEYWORDS[category];
  
  if (!keywords || keywords.length === 0) {
    console.warn(`카테고리 키워드가 없습니다: ${category}`);
    return [];
  }
  
  // 더 많은 키워드로 병렬 검색 (3개 → 5개)
  const searchPromises = keywords.slice(0, 5).map(keyword => 
    searchFDAAPI(keyword, Math.ceil(maxResults / 5))
  );
  
  const results = await Promise.all(searchPromises);
  const allFDAItems = results.flat();
  
  // MenuItem으로 변환
  const menuItems = convertMultipleFDAToMenuItems(allFDAItems);
  
  // 카테고리 필터링 (변환 과정에서 카테고리가 잘못 매핑될 수 있음)
  let filteredItems = menuItems.filter(item => item.category === category);
  
  // 외국 음식 제거 (특별식만)
  filteredItems = filteredItems.filter(item => !isForeignFood(item.name));
  
  // 중복 제거 (같은 이름)
  const uniqueItems = Array.from(
    new Map(filteredItems.map(item => [item.name, item])).values()
  );
  
  console.log(`✅ [${category}] 검색 결과: ${uniqueItems.length}개 (필터링 전: ${menuItems.length}개)`);
  
  // 결과 제한
  return uniqueItems.slice(0, maxResults);
}

/**
 * 특정 키워드로 식품 검색
 */
export async function searchFoodByKeyword(
  keyword: string,
  maxResults: number = 20
): Promise<MenuItem[]> {
  const fdaItems = await searchFDAAPI(keyword, maxResults);
  return convertMultipleFDAToMenuItems(fdaItems);
}

/**
 * 모든 카테고리 데이터 미리 로드
 */
export async function prefetchAllCategories(): Promise<{
  rice: MenuItem[];
  soup: MenuItem[];
  kimchi: MenuItem[];
  vegetable: MenuItem[];
  meat: MenuItem[];
  side: MenuItem[];
}> {
  console.log('🔄 모든 카테고리 데이터 로딩 중...');
  
  const [rice, soup, kimchi, vegetable, meat, side] = await Promise.all([
    searchFoodByCategory('rice', 30),
    searchFoodByCategory('soup', 30),
    searchFoodByCategory('kimchi', 20),
    searchFoodByCategory('vegetable', 30),
    searchFoodByCategory('meat', 30),
    searchFoodByCategory('side', 30),
  ]);
  
  console.log('✅ 카테고리 데이터 로드 완료:', {
    rice: rice.length,
    soup: soup.length,
    kimchi: kimchi.length,
    vegetable: vegetable.length,
    meat: meat.length,
    side: side.length,
  });
  
  return { rice, soup, kimchi, vegetable, meat, side };
}















