/**
 * FDA API 응답 데이터를 Ingredient 타입으로 변환
 */

import { Ingredient, FDANutritionResponse, NutritionPer100g } from '@/types/ingredient';

/**
 * 안전한 숫자 파싱 (빈 문자열, null, undefined 처리)
 */
function parseNumber(value: string | undefined | null, defaultValue: number = 0): number {
  if (!value || value === '' || value === '-') return defaultValue;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * 식품명에서 알레르기 유발물질 감지
 */
export function detectAllergens(fdaData: FDANutritionResponse): string[] {
  const allergens: string[] = [];
  const name = fdaData.FOOD_NM_KR?.toLowerCase() || '';
  
  // 알레르기 유발 식재료 키워드 매핑
  const allergenKeywords: Record<string, string[]> = {
    '달걀': ['계란', '난', '에그', '달걀'],
    '우유': ['우유', '유', '치즈', '버터', '크림'],
    '대두': ['두부', '콩', '된장', '간장', '대두', '청국장'],
    '밀': ['밀', '밀가루', '면', '빵', '글루텐'],
    '고등어': ['고등어', '갈치'],
    '새우': ['새우', '크릴'],
    '돼지고기': ['돼지', '삼겹살', '목살', '등심', '베이컨', '햄'],
    '닭고기': ['닭', '치킨'],
    '쇠고기': ['소고기', '쇠고기', '소', '우육', '갈비', '등심'],
    '오징어': ['오징어', '문어'],
    '게': ['게', '크랩'],
    '조개류': ['조개', '바지락', '홍합', '굴'],
  };
  
  // 식품명에서 알레르기 키워드 검색
  Object.entries(allergenKeywords).forEach(([allergen, keywords]) => {
    if (keywords.some(keyword => name.includes(keyword))) {
      allergens.push(allergen);
    }
  });
  
  return [...new Set(allergens)]; // 중복 제거
}

/**
 * 식품 카테고리 정규화
 */
function normalizeCategory(fdaData: FDANutritionResponse): string {
  // FOOD_CAT1_NM (식품 대분류명) 사용
  const category = fdaData.FOOD_CAT1_NM || fdaData.DB_GRP_NM || '기타';
  
  const categoryMap: Record<string, string> = {
    '밥류': '밥류',
    '죽류': '죽류',
    '국 및 탕류': '국/탕',
    '찌개 및 전골류': '찌개/전골',
    '면 및 만두류': '면/만두',
    '볶음류': '볶음',
    '조림류': '조림',
    '구이류': '구이',
    '전·적 및 부침류': '전/부침',
    '찜류': '찜',
    '튀김류': '튀김',
    '나물·숙채류': '나물',
    '생채·무침류': '생채',
    '김치류': '김치',
    '젓갈류': '젓갈',
    '장아찌·절임류': '절임',
    '장류': '장류',
    '양념류': '양념',
    '한과류': '한과',
    '음료 및 차류': '음료',
  };
  
  for (const [key, value] of Object.entries(categoryMap)) {
    if (category.includes(key)) return value;
  }
  
  return category;
}

/**
 * FDA API 응답 → NutritionPer100g 변환
 * AMT_NUM 필드 매핑:
 * AMT_NUM1: 에너지(kcal)
 * AMT_NUM2: 수분(g)
 * AMT_NUM3: 단백질(g)
 * AMT_NUM4: 지방(g)
 * AMT_NUM5: 탄수화물(g)
 * AMT_NUM6: 당류(g)
 * AMT_NUM7: 식이섬유(g)
 * AMT_NUM9: 칼슘(mg)
 * AMT_NUM10: 철분(mg)
 * AMT_NUM11: 인(mg)
 * AMT_NUM12: 칼륨(mg)
 * AMT_NUM13: 나트륨(mg)
 * AMT_NUM14: 비타민A(μgRAE)
 * AMT_NUM17: 비타민D(μg)
 * AMT_NUM23: 비타민C(mg)
 * AMT_NUM24: 총 지방산(g)
 * AMT_NUM25: 트랜스지방산(g)
 */
function mapNutrition(fdaData: FDANutritionResponse): NutritionPer100g {
  // 포화지방산 계산 (총 지방 - 불포화지방)
  const totalFat = parseNumber(fdaData.AMT_NUM4);
  const transFat = parseNumber(fdaData.AMT_NUM25);
  // 간단하게 총 지방의 30%를 포화지방으로 추정 (정확한 값은 별도 필드 필요)
  const saturatedFat = totalFat * 0.3;
  
  return {
    calories: parseNumber(fdaData.AMT_NUM1),      // 에너지
    protein: parseNumber(fdaData.AMT_NUM3),       // 단백질
    fat: parseNumber(fdaData.AMT_NUM4),           // 지방
    carbs: parseNumber(fdaData.AMT_NUM5),         // 탄수화물
    sugars: parseNumber(fdaData.AMT_NUM6),        // 당류
    sodium: parseNumber(fdaData.AMT_NUM13),       // 나트륨
    cholesterol: 0,                               // 콜레스테롤 (별도 필드 없음)
    saturatedFat: saturatedFat,                   // 포화지방 (추정값)
    transFat: transFat,                           // 트랜스지방
    
    // 추가 영양소
    fiber: fdaData.AMT_NUM7 ? parseNumber(fdaData.AMT_NUM7) : undefined,       // 식이섬유
    calcium: fdaData.AMT_NUM9 ? parseNumber(fdaData.AMT_NUM9) : undefined,     // 칼슘
    iron: fdaData.AMT_NUM10 ? parseNumber(fdaData.AMT_NUM10) : undefined,      // 철분
    phosphorus: fdaData.AMT_NUM11 ? parseNumber(fdaData.AMT_NUM11) : undefined, // 인
    potassium: fdaData.AMT_NUM12 ? parseNumber(fdaData.AMT_NUM12) : undefined,  // 칼륨
    vitaminA: fdaData.AMT_NUM14 ? parseNumber(fdaData.AMT_NUM14) : undefined,   // 비타민A
    vitaminC: fdaData.AMT_NUM23 ? parseNumber(fdaData.AMT_NUM23) : undefined,   // 비타민C
    vitaminD: fdaData.AMT_NUM17 ? parseNumber(fdaData.AMT_NUM17) : undefined,   // 비타민D
  };
}

/**
 * FDA API 응답 → Ingredient 타입 변환
 */
export function mapFDAResponseToIngredient(fdaData: FDANutritionResponse): Ingredient {
  const allergens = detectAllergens(fdaData);
  const category = normalizeCategory(fdaData);
  
  return {
    id: `fda-${fdaData.FOOD_CD}`,
    fdaCode: fdaData.FOOD_CD,
    name: fdaData.FOOD_NM_KR,
    category: category,
    
    nutritionPer100g: mapNutrition(fdaData),
    
    allergens,
    
    // 가격 정보는 별도 관리 필요 (기본값 0)
    unitPricePer100g: 0,
    
    // 메타데이터
    source: 'FDA_API',
    animalPlant: fdaData.FOOD_OR_NM,  // 음식 유형 (가정식/외식)
    makerName: fdaData.MAKER_NM || undefined,
    servingSize: fdaData.SERVING_SIZE ? parseNumber(fdaData.SERVING_SIZE.replace(/[^0-9.]/g, '')) : undefined,
    lastUpdated: new Date().toISOString(),
    
    // 검색 키워드 (검색 최적화용)
    searchKeywords: [
      fdaData.FOOD_NM_KR,
      category,
      fdaData.FOOD_REF_NM || '',
      ...(fdaData.MAKER_NM ? [fdaData.MAKER_NM] : []),
    ].filter(Boolean),
  };
}

/**
 * 여러 FDA 응답 데이터를 일괄 변환
 */
export function mapFDAResponsesToIngredients(
  fdaDataList: FDANutritionResponse[]
): Ingredient[] {
  return fdaDataList.map(mapFDAResponseToIngredient);
}

/**
 * 식재료명 정규화 (검색 정확도 향상)
 */
export function normalizeIngredientName(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, ' ')  // 중복 공백 제거
    .replace(/[()]/g, '')   // 괄호 제거
    .toLowerCase();
}

/**
 * 검색 키워드 생성
 */
export function generateSearchKeywords(name: string, category: string): string[] {
  const keywords = new Set<string>();
  
  keywords.add(name);
  keywords.add(normalizeIngredientName(name));
  keywords.add(category);
  
  // 일반적인 별칭 추가
  const aliases: Record<string, string[]> = {
    '두부': ['순두부', '연두부', '부침두부'],
    '돼지고기': ['삼겹살', '목살', '앞다리살'],
    '소고기': ['쇠고기', '우육', '등심', '안심'],
    '김치': ['배추김치', '포기김치'],
  };
  
  Object.entries(aliases).forEach(([key, values]) => {
    if (name.includes(key)) {
      values.forEach(v => keywords.add(v));
    }
  });
  
  return Array.from(keywords);
}















