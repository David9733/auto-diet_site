import { Meal, MenuItem } from '@/types/meal';

// 한국 식품 알레르기 유발물질 22종(식품표시법) 기반
// - UI에서 사용자에게 보여지는 표기는 아래 name을 그대로 사용합니다.
// - SettingsPanel에서도 이 순서(한 줄 11개) 그대로 노출됩니다.
export const COMMON_ALLERGENS = [
  { id: 'egg', name: '알류(가금류)', icon: '🥚' },
  { id: 'milk', name: '우유', icon: '🥛' },
  { id: 'buckwheat', name: '메밀', icon: '🌾' },
  { id: 'peanut', name: '땅콩', icon: '🥜' },
  { id: 'soybean', name: '대두', icon: '🌱' },
  { id: 'wheat', name: '밀', icon: '🌾' },
  { id: 'pine_nut', name: '잣', icon: '🌲' },
  { id: 'walnut', name: '호두', icon: '🟤' },
  { id: 'crab', name: '게', icon: '🦀' },
  { id: 'shrimp', name: '새우', icon: '🦐' },
  { id: 'squid', name: '오징어', icon: '🦑' },
  { id: 'mackerel', name: '고등어', icon: '🐟' },
  { id: 'shellfish', name: '조개류', icon: '🦪' },
  { id: 'oyster', name: '굴', icon: '🦪' },
  { id: 'abalone', name: '전복', icon: '🦪' },
  { id: 'mussel', name: '홍합', icon: '🦪' },
  { id: 'peach', name: '복숭아', icon: '🍑' },
  { id: 'tomato', name: '토마토', icon: '🍅' },
  { id: 'chicken', name: '닭고기', icon: '🐔' },
  { id: 'pork', name: '돼지고기', icon: '🐷' },
  { id: 'beef', name: '쇠고기', icon: '🐄' },
  { id: 'sulfite', name: '아황산류', icon: '⚗️' },
] as const;

export interface AllergenWarning {
  allergen: string;
  menuItems: string[];
  severity: 'high' | 'medium';
}

export interface AllergenValidationResult {
  hasWarning: boolean;
  warnings: AllergenWarning[];
  allAllergens: string[];
}

// 알레르기 유발물질 매핑 (메뉴 데이터의 알레르기 표기와 매칭)
export const allergenMapping: Record<string, string[]> = {
  '알류(가금류)': ['알류', '달걀', '계란', '메추리알', '난백', '난황'],
  '우유': ['우유'],
  '메밀': ['메밀'],
  '땅콩': ['땅콩'],
  '대두': ['대두', '두부', '순두부'],
  '밀': ['밀'],
  '잣': ['잣'],
  '호두': ['호두'],
  '고등어': ['고등어'],
  '게': ['게'],
  '새우': ['새우'],
  '돼지고기': ['돼지고기'],
  '복숭아': ['복숭아'],
  '토마토': ['토마토'],
  '아황산류': ['아황산', '아황산염', '메타중아황산', '설파이트', 'sulfite'],
  '닭고기': ['닭고기'],
  '쇠고기': ['쇠고기'],
  // 현장 데이터에서 연체류(낙지/쭈꾸미/문어 등)로 표기되는 경우가 있어 함께 묶어서 제외합니다.
  '오징어': ['오징어', '낙지', '쭈꾸미', '문어', '연체류'],
  '조개류': ['조개', '바지락', '재첩', '모시조개', '조개류'],
  '굴': ['굴'],
  '홍합': ['홍합'],
  '전복': ['전복'],
};

export function validateAllergens(
  meal: Meal,
  watchAllergens: string[]
): AllergenValidationResult {
  const warnings: AllergenWarning[] = [];
  const allAllergens = meal.allergens;

  // 각 주의 알레르기에 대해 검사
  for (const watchAllergen of watchAllergens) {
    const relatedAllergens = allergenMapping[watchAllergen] || [watchAllergen];
    
    // 해당 알레르기를 포함하는 메뉴 아이템 찾기
    const affectedItems: string[] = [];
    const allItems = [meal.rice, meal.soup, ...meal.sideDishes];
    
    for (const item of allItems) {
      // mealGenerator 쪽과 동일하게: allergens + 메뉴명 + 주재료까지 포함하여 검사
      const haystacks = [
        ...(item.allergens || []),
        item.name || "",
        ...((item.mainIngredients as string[] | undefined) || []),
      ].filter(Boolean);

      const hasAllergen = haystacks.some((h) =>
        relatedAllergens.some((ra) => h.includes(ra) || ra.includes(h)),
      );
      if (hasAllergen) {
        affectedItems.push(item.name);
      }
    }

    if (affectedItems.length > 0) {
      warnings.push({
        allergen: watchAllergen,
        menuItems: affectedItems,
        severity: 'high',
      });
    }
  }

  return {
    hasWarning: warnings.length > 0,
    warnings,
    allAllergens,
  };
}

export function getAllergensFromMeal(meal: Meal): string[] {
  return meal.allergens;
}

export function getWatchedAllergenInfo(allergenName: string) {
  return COMMON_ALLERGENS.find(a => a.name === allergenName);
}
