/**
 * FDA API 응답을 MenuItem 형식으로 변환
 */

import { MenuItem } from '@/types/meal';
import { FDANutritionResponse } from '@/types/ingredient';

/**
 * 숫자 파싱 (문자열 → 숫자)
 */
function parseNumber(value: string | undefined | null): number {
  if (!value || value === '' || value === 'N') return 0;
  const parsed = parseFloat(value.replace(/,/g, ''));
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * 카테고리 매핑: FDA 카테고리 → MenuItem 카테고리
 */
function mapFDACategory(fdaCategory: string | undefined): MenuItem['category'] {
  if (!fdaCategory) return 'side';
  
  const categoryMap: Record<string, MenuItem['category']> = {
    // 밥류
    '밥류': 'rice',
    '죽류': 'rice',
    '면 및 만두류': 'rice',
    
    // 국/찌개류
    '국 및 탕류': 'soup',
    '찌개 및 전골류': 'soup',
    
    // 김치류
    '김치류': 'kimchi',
    '장아찌·절임류': 'kimchi',
    
    // 채소류
    '나물·숙채류': 'vegetable',
    '생채·무침류': 'vegetable',
    
    // 고기류
    '구이류': 'meat',
    '조림류': 'meat',
    '볶음류': 'meat',
    '찜류': 'meat',
    
    // 반찬류
    '전·적 및 부침류': 'side',
    '튀김류': 'side',
    '젓갈류': 'side',
  };
  
  // 매핑 찾기
  for (const [key, value] of Object.entries(categoryMap)) {
    if (fdaCategory.includes(key)) {
      return value;
    }
  }
  
  return 'side'; // 기본값
}

/**
 * 알레르기 정보 추출
 */
function extractAllergens(fdaData: FDANutritionResponse): string[] {
  const allergens: string[] = [];
  const foodName = fdaData.FOOD_NM_KR.toLowerCase();
  
  // 음식 이름에서 알레르기 유발 식품 감지
  const allergenKeywords: Record<string, string[]> = {
    '대두': ['두부', '콩', '된장', '청국장', '간장'],
    '우유': ['우유', '치즈', '버터', '요구르트', '크림'],
    '계란': ['계란', '달걀', '에그', '오믈렛'],
    '돼지고기': ['돼지', '삼겹살', '목살', '제육'],
    '쇠고기': ['소고기', '쇠고기', '불고기', '갈비'],
    '닭고기': ['닭', '치킨', '닭고기'],
    '새우': ['새우', '젓갈'],
    '오징어': ['오징어', '낙지', '문어'],
    '고등어': ['고등어', '꽁치', '삼치'],
    '밀': ['밀가루', '면', '빵', '국수', '파스타'],
    '땅콩': ['땅콩', '피넛'],
  };
  
  for (const [allergen, keywords] of Object.entries(allergenKeywords)) {
    if (keywords.some(keyword => foodName.includes(keyword))) {
      allergens.push(allergen);
    }
  }
  
  return allergens;
}

/**
 * 주재료 추출 (식품명에서 추출)
 */
function extractMainIngredients(fdaData: FDANutritionResponse): string[] {
  const foodName = fdaData.FOOD_NM_KR;
  const ingredients: string[] = [];
  
  // 언더스코어로 분리된 재료 추출 (예: "된장찌개_두부" → ["된장", "두부"])
  const parts = foodName.split('_');
  if (parts.length > 1) {
    // 첫 번째는 요리명, 나머지는 주재료
    ingredients.push(...parts.slice(1));
  }
  
  // 괄호 안의 재료 추출 (예: "비빔밥(소고기)" → ["소고기"])
  const bracketMatch = foodName.match(/\((.*?)\)/);
  if (bracketMatch) {
    ingredients.push(bracketMatch[1]);
  }
  
  // 기본 재료 키워드
  const mainIngredientKeywords = [
    '쌀', '현미', '잡곡', '보리',
    '두부', '콩나물', '된장', '김치',
    '돼지고기', '소고기', '닭고기',
    '새우', '오징어', '고등어',
    '시금치', '무', '배추', '호박',
  ];
  
  for (const keyword of mainIngredientKeywords) {
    if (foodName.includes(keyword)) {
      ingredients.push(keyword);
    }
  }
  
  return [...new Set(ingredients)]; // 중복 제거
}

/**
 * 급식소 표준 1인분 기준 (g 또는 ml)
 */
const CAFETERIA_SERVING_SIZE: Record<MenuItem['category'], number> = {
  rice: 210,        // 밥 1공기
  soup: 250,        // 국/찌개 1그릇
  meat: 80,         // 고기 반찬
  vegetable: 70,    // 채소 반찬
  side: 50,         // 작은 반찬
  kimchi: 30,       // 김치
};

/**
 * 급식소 기준 1인분 그램수 가져오기
 * 면류는 예외 처리 (300g)
 */
function getCafeteriaServingSize(
  category: MenuItem['category'],
  foodName: string
): number {
  // 면류 체크
  const noodleKeywords = [
    '면', '우동', '국수', '파스타', '스파게티',
    '짜장', '짬뽕', '라면', '냉면', '쫄면', '칼국수'
  ];
  
  const isNoodle = noodleKeywords.some(keyword => foodName.includes(keyword));
  
  if (isNoodle) {
    return 300; // 면류는 300g
  }
  
  return CAFETERIA_SERVING_SIZE[category];
}

/**
 * 예상 원가 계산 (급식소 1인분 기준)
 * 실제로는 재료비 DB가 필요하지만, 여기서는 간단히 추정
 */
function estimateCost(
  fdaData: FDANutritionResponse, 
  category: MenuItem['category'],
  servingSize: number
): number {
  // 카테고리별 기본 원가 (100g 기준, 원)
  const baseCostsPer100g: Record<MenuItem['category'], number> = {
    rice: 140,      // 밥류 (100g당 140원)
    soup: 160,      // 국/찌개 (100g당 160원)
    kimchi: 500,    // 김치 (100g당 500원, 30g면 150원)
    vegetable: 350, // 채소 (100g당 350원, 70g면 245원)
    meat: 750,      // 고기 (100g당 750원, 80g면 600원)
    side: 600,      // 반찬 (100g당 600원, 50g면 300원)
  };
  
  const costPer100g = baseCostsPer100g[category];
  const multiplier = servingSize / 100;
  let cost = costPer100g * multiplier;
  
  // 단백질 기반 보정 (단백질이 높으면 원가도 높음)
  const protein = parseNumber(fdaData.AMT_NUM3);
  if (protein > 15) {
    cost *= 1.3;
  } else if (protein > 10) {
    cost *= 1.15;
  }
  
  return Math.round(cost);
}

/**
 * FDA API 응답 → MenuItem 변환 (급식소 1인분 기준)
 */
export function convertFDAToMenuItem(fdaData: FDANutritionResponse): MenuItem {
  const category = mapFDACategory(fdaData.FOOD_CAT1_NM);
  const foodName = fdaData.FOOD_NM_KR;
  
  // 급식소 표준 1인분 그램수
  const servingSize = getCafeteriaServingSize(category, foodName);
  
  // 100g → 급식소 1인분 변환 배수
  const multiplier = servingSize / 100;
  
  return {
    id: `fda-${fdaData.FOOD_CD}`,
    name: foodName,
    category,
    
    // 급식소 1인분 기준 영양소 (100g 기준 × 배수)
    calories: Math.round(parseNumber(fdaData.AMT_NUM1) * multiplier),    // 에너지(kcal)
    protein: Math.round(parseNumber(fdaData.AMT_NUM3) * multiplier * 10) / 10,     // 단백질(g)
    carbs: Math.round(parseNumber(fdaData.AMT_NUM5) * multiplier * 10) / 10,       // 탄수화물(g)
    fat: Math.round(parseNumber(fdaData.AMT_NUM4) * multiplier * 10) / 10,         // 지방(g)
    sodium: Math.round(parseNumber(fdaData.AMT_NUM13) * multiplier),     // 나트륨(mg)
    
    // 메타 정보
    allergens: extractAllergens(fdaData),
    mainIngredients: extractMainIngredients(fdaData),
    cost: estimateCost(fdaData, category, servingSize),
  };
}

/**
 * 여러 FDA 응답을 MenuItem 배열로 변환
 */
export function convertMultipleFDAToMenuItems(fdaDataList: FDANutritionResponse[]): MenuItem[] {
  return fdaDataList
    .map(convertFDAToMenuItem)
    .filter(item => {
      // 유효한 영양 정보가 있는 항목만 포함
      return item.calories > 0 || item.protein > 0 || item.carbs > 0;
    });
}















