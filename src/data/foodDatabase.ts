/**
 * 식품 데이터베이스 캐시
 * API 실패 시 백업용 데이터 및 자주 사용하는 메뉴 캐시
 */

import { MenuItem } from '@/types/meal';

/**
 * 자주 사용하는 밥류 캐시 데이터
 */
export const cachedRice: MenuItem[] = [
  { 
    id: 'cache-r1', 
    name: '흰쌀밥', 
    category: 'rice', 
    calories: 300, 
    protein: 5, 
    carbs: 65, 
    fat: 1, 
    sodium: 5, 
    allergens: [], 
    cost: 300, 
    mainIngredients: ['쌀'] 
  },
  { 
    id: 'cache-r2', 
    name: '현미밥', 
    category: 'rice', 
    calories: 280, 
    protein: 6, 
    carbs: 58, 
    fat: 2, 
    sodium: 5, 
    allergens: [], 
    cost: 350, 
    mainIngredients: ['현미'] 
  },
  { 
    id: 'cache-r3', 
    name: '잡곡밥', 
    category: 'rice', 
    calories: 290, 
    protein: 7, 
    carbs: 60, 
    fat: 2, 
    sodium: 5, 
    allergens: [], 
    cost: 400, 
    mainIngredients: ['잡곡'] 
  },
  { 
    id: 'cache-r4', 
    name: '보리밥', 
    category: 'rice', 
    calories: 285, 
    protein: 6, 
    carbs: 59, 
    fat: 1.5, 
    sodium: 5, 
    allergens: [], 
    cost: 320, 
    mainIngredients: ['보리'] 
  },
];

/**
 * 자주 사용하는 국/찌개류 캐시 데이터
 */
export const cachedSoups: MenuItem[] = [
  { 
    id: 'cache-s1', 
    name: '된장찌개', 
    category: 'soup', 
    calories: 120, 
    protein: 8, 
    carbs: 10, 
    fat: 5, 
    sodium: 850, 
    allergens: ['대두'], 
    cost: 400, 
    mainIngredients: ['된장', '두부'] 
  },
  { 
    id: 'cache-s2', 
    name: '김치찌개', 
    category: 'soup', 
    calories: 150, 
    protein: 10, 
    carbs: 8, 
    fat: 8, 
    sodium: 950, 
    allergens: ['새우', '돼지고기'], 
    cost: 500, 
    mainIngredients: ['김치', '돼지고기'] 
  },
  { 
    id: 'cache-s3', 
    name: '미역국', 
    category: 'soup', 
    calories: 80, 
    protein: 6, 
    carbs: 5, 
    fat: 4, 
    sodium: 650, 
    allergens: [], 
    cost: 350, 
    mainIngredients: ['미역'] 
  },
  { 
    id: 'cache-s4', 
    name: '콩나물국', 
    category: 'soup', 
    calories: 70, 
    protein: 5, 
    carbs: 6, 
    fat: 2, 
    sodium: 600, 
    allergens: ['대두'], 
    cost: 300, 
    mainIngredients: ['콩나물'] 
  },
];

/**
 * 자주 사용하는 김치류 캐시 데이터
 */
export const cachedKimchi: MenuItem[] = [
  { 
    id: 'cache-k1', 
    name: '배추김치', 
    category: 'kimchi', 
    calories: 20, 
    protein: 2, 
    carbs: 4, 
    fat: 0, 
    sodium: 580, 
    allergens: ['새우'], 
    cost: 150, 
    mainIngredients: ['배추'] 
  },
  { 
    id: 'cache-k2', 
    name: '깍두기', 
    category: 'kimchi', 
    calories: 25, 
    protein: 1, 
    carbs: 5, 
    fat: 0, 
    sodium: 520, 
    allergens: ['새우'], 
    cost: 150, 
    mainIngredients: ['무'] 
  },
];

/**
 * 자주 사용하는 반찬류 캐시 데이터
 */
export const cachedSides: MenuItem[] = [
  { 
    id: 'cache-side1', 
    name: '시금치나물', 
    category: 'vegetable', 
    calories: 35, 
    protein: 3, 
    carbs: 4, 
    fat: 1, 
    sodium: 280, 
    allergens: [], 
    cost: 250, 
    mainIngredients: ['시금치'] 
  },
  { 
    id: 'cache-side2', 
    name: '콩나물무침', 
    category: 'vegetable', 
    calories: 40, 
    protein: 4, 
    carbs: 5, 
    fat: 1, 
    sodium: 320, 
    allergens: ['대두'], 
    cost: 200, 
    mainIngredients: ['콩나물'] 
  },
  { 
    id: 'cache-side3', 
    name: '불고기', 
    category: 'meat', 
    calories: 280, 
    protein: 22, 
    carbs: 8, 
    fat: 18, 
    sodium: 420, 
    allergens: ['쇠고기', '대두'], 
    cost: 700, 
    mainIngredients: ['소고기'] 
  },
  { 
    id: 'cache-side4', 
    name: '제육볶음', 
    category: 'meat', 
    calories: 250, 
    protein: 20, 
    carbs: 10, 
    fat: 15, 
    sodium: 480, 
    allergens: ['돼지고기'], 
    cost: 550, 
    mainIngredients: ['돼지고기'] 
  },
];

/**
 * 카테고리별로 캐시 데이터 가져오기
 */
export function getCachedFoodData(
  category: MenuItem['category']
): MenuItem[] {
  switch (category) {
    case 'rice':
      return cachedRice;
    case 'soup':
      return cachedSoups;
    case 'kimchi':
      return cachedKimchi;
    case 'vegetable':
    case 'meat':
    case 'side':
      return cachedSides;
    default:
      return [];
  }
}

/**
 * 모든 캐시 데이터 가져오기
 */
export function getAllCachedData(): MenuItem[] {
  return [
    ...cachedRice,
    ...cachedSoups,
    ...cachedKimchi,
    ...cachedSides,
  ];
}

/**
 * 이름으로 캐시 데이터 검색
 */
export function searchCachedData(searchTerm: string): MenuItem[] {
  const allData = getAllCachedData();
  const lowerSearch = searchTerm.toLowerCase();
  
  return allData.filter(item => 
    item.name.toLowerCase().includes(lowerSearch)
  );
}

/**
 * LocalStorage에 API 응답 캐시하기
 */
export function saveFoodDataToCache(
  key: string, 
  data: MenuItem[], 
  expiryHours: number = 24
): void {
  try {
    const cacheData = {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + (expiryHours * 60 * 60 * 1000),
    };
    
    localStorage.setItem(`food-cache-${key}`, JSON.stringify(cacheData));
  } catch (error) {
    console.warn('캐시 저장 실패:', error);
  }
}

/**
 * LocalStorage에서 캐시 데이터 가져오기
 */
export function loadFoodDataFromCache(key: string): MenuItem[] | null {
  try {
    const cached = localStorage.getItem(`food-cache-${key}`);
    
    if (!cached) return null;
    
    const cacheData = JSON.parse(cached);
    
    // 만료 체크
    if (Date.now() > cacheData.expiry) {
      localStorage.removeItem(`food-cache-${key}`);
      return null;
    }
    
    return cacheData.data;
  } catch (error) {
    console.warn('캐시 로드 실패:', error);
    return null;
  }
}

/**
 * 모든 캐시 데이터 삭제
 */
export function clearAllFoodCache(): void {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('food-cache-')) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.warn('캐시 삭제 실패:', error);
  }
}
