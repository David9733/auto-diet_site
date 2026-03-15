/**
 * 영양소 계산 엔진
 * 식재료 기반으로 음식의 영양 정보 계산
 */

import { Ingredient, NutritionPer100g } from '@/types/ingredient';
import { Recipe, RecipeIngredient } from '@/types/recipe';

/**
 * 영양소 합계 타입
 */
export interface NutritionSummary extends NutritionPer100g {
  // 추가 정보
  totalWeight: number;      // 총 중량(g)
  servingCount: number;     // 인분
  perServingWeight: number; // 1인분 중량(g)
}

/**
 * 식재료 중량에 따른 영양소 계산
 * @param ingredient 식재료 정보
 * @param amountGram 사용 중량(g)
 */
export function calculateIngredientNutrition(
  ingredient: Ingredient,
  amountGram: number
): NutritionPer100g {
  const ratio = amountGram / 100;
  const nutrition = ingredient.nutritionPer100g;
  
  return {
    calories: nutrition.calories * ratio,
    protein: nutrition.protein * ratio,
    fat: nutrition.fat * ratio,
    carbs: nutrition.carbs * ratio,
    sugars: nutrition.sugars * ratio,
    sodium: nutrition.sodium * ratio,
    cholesterol: nutrition.cholesterol * ratio,
    saturatedFat: nutrition.saturatedFat * ratio,
    transFat: nutrition.transFat * ratio,
    
    fiber: nutrition.fiber ? nutrition.fiber * ratio : undefined,
    calcium: nutrition.calcium ? nutrition.calcium * ratio : undefined,
    iron: nutrition.iron ? nutrition.iron * ratio : undefined,
    phosphorus: nutrition.phosphorus ? nutrition.phosphorus * ratio : undefined,
    potassium: nutrition.potassium ? nutrition.potassium * ratio : undefined,
    vitaminA: nutrition.vitaminA ? nutrition.vitaminA * ratio : undefined,
    vitaminC: nutrition.vitaminC ? nutrition.vitaminC * ratio : undefined,
    vitaminD: nutrition.vitaminD ? nutrition.vitaminD * ratio : undefined,
  };
}

/**
 * 레시피 전체 영양소 계산
 * @param recipe 레시피 정보
 * @param ingredients 식재료 맵 (ingredientId -> Ingredient)
 */
export function calculateRecipeNutrition(
  recipe: Recipe,
  ingredients: Map<string, Ingredient>
): NutritionSummary {
  const totalNutrition: NutritionSummary = {
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
    sugars: 0,
    sodium: 0,
    cholesterol: 0,
    saturatedFat: 0,
    transFat: 0,
    fiber: 0,
    calcium: 0,
    iron: 0,
    phosphorus: 0,
    potassium: 0,
    vitaminA: 0,
    vitaminC: 0,
    vitaminD: 0,
    totalWeight: 0,
    servingCount: recipe.servingCount,
    perServingWeight: recipe.servingSize,
  };
  
  // 각 식재료의 영양소 합산
  recipe.ingredients.forEach((recipeIngredient) => {
    const ingredient = ingredients.get(recipeIngredient.ingredientId);
    
    if (!ingredient) {
      console.warn(`식재료를 찾을 수 없음: ${recipeIngredient.ingredientId}`);
      return;
    }
    
    // 조리 손실률 적용
    const adjustedAmount = recipeIngredient.amountGram * 
      (1 - (recipeIngredient.cookingLoss || 0) / 100);
    
    const nutrition = calculateIngredientNutrition(ingredient, adjustedAmount);
    
    // 영양소 합산
    totalNutrition.calories += nutrition.calories;
    totalNutrition.protein += nutrition.protein;
    totalNutrition.fat += nutrition.fat;
    totalNutrition.carbs += nutrition.carbs;
    totalNutrition.sugars += nutrition.sugars;
    totalNutrition.sodium += nutrition.sodium;
    totalNutrition.cholesterol += nutrition.cholesterol;
    totalNutrition.saturatedFat += nutrition.saturatedFat;
    totalNutrition.transFat += nutrition.transFat;
    
    if (nutrition.fiber) totalNutrition.fiber! += nutrition.fiber;
    if (nutrition.calcium) totalNutrition.calcium! += nutrition.calcium;
    if (nutrition.iron) totalNutrition.iron! += nutrition.iron;
    if (nutrition.phosphorus) totalNutrition.phosphorus! += nutrition.phosphorus;
    if (nutrition.potassium) totalNutrition.potassium! += nutrition.potassium;
    if (nutrition.vitaminA) totalNutrition.vitaminA! += nutrition.vitaminA;
    if (nutrition.vitaminC) totalNutrition.vitaminC! += nutrition.vitaminC;
    if (nutrition.vitaminD) totalNutrition.vitaminD! += nutrition.vitaminD;
    
    totalNutrition.totalWeight += adjustedAmount;
  });
  
  return totalNutrition;
}

/**
 * 1인분 영양소 계산
 */
export function calculatePerServingNutrition(
  totalNutrition: NutritionSummary
): NutritionPer100g {
  const ratio = 1 / totalNutrition.servingCount;
  
  return {
    calories: totalNutrition.calories * ratio,
    protein: totalNutrition.protein * ratio,
    fat: totalNutrition.fat * ratio,
    carbs: totalNutrition.carbs * ratio,
    sugars: totalNutrition.sugars * ratio,
    sodium: totalNutrition.sodium * ratio,
    cholesterol: totalNutrition.cholesterol * ratio,
    saturatedFat: totalNutrition.saturatedFat * ratio,
    transFat: totalNutrition.transFat * ratio,
    
    fiber: totalNutrition.fiber ? totalNutrition.fiber * ratio : undefined,
    calcium: totalNutrition.calcium ? totalNutrition.calcium * ratio : undefined,
    iron: totalNutrition.iron ? totalNutrition.iron * ratio : undefined,
    phosphorus: totalNutrition.phosphorus ? totalNutrition.phosphorus * ratio : undefined,
    potassium: totalNutrition.potassium ? totalNutrition.potassium * ratio : undefined,
    vitaminA: totalNutrition.vitaminA ? totalNutrition.vitaminA * ratio : undefined,
    vitaminC: totalNutrition.vitaminC ? totalNutrition.vitaminC * ratio : undefined,
    vitaminD: totalNutrition.vitaminD ? totalNutrition.vitaminD * ratio : undefined,
  };
}

/**
 * 영양 경고 체크
 */
export interface NutritionWarning {
  type: 'calories' | 'protein' | 'sodium' | 'fat' | 'sugars';
  severity: 'low' | 'medium' | 'high';
  message: string;
  currentValue: number;
  threshold: number;
}

export function checkNutritionWarnings(
  nutrition: NutritionPer100g,
  mealType: 'breakfast' | 'lunch' | 'dinner'
): NutritionWarning[] {
  const warnings: NutritionWarning[] = [];
  
  // 급식 기준 (1끼)
  const standards = {
    breakfast: { calories: [450, 550], sodium: 800, protein: [15, 20] },
    lunch: { calories: [600, 800], sodium: 1000, protein: [20, 30] },
    dinner: { calories: [600, 800], sodium: 1000, protein: [20, 30] },
  };
  
  const standard = standards[mealType];
  
  // 칼로리 체크
  if (nutrition.calories < standard.calories[0]) {
    warnings.push({
      type: 'calories',
      severity: 'medium',
      message: `칼로리가 부족합니다 (권장: ${standard.calories[0]}kcal 이상)`,
      currentValue: nutrition.calories,
      threshold: standard.calories[0],
    });
  } else if (nutrition.calories > standard.calories[1]) {
    warnings.push({
      type: 'calories',
      severity: 'medium',
      message: `칼로리가 과다합니다 (권장: ${standard.calories[1]}kcal 이하)`,
      currentValue: nutrition.calories,
      threshold: standard.calories[1],
    });
  }
  
  // 나트륨 체크
  if (nutrition.sodium > standard.sodium) {
    warnings.push({
      type: 'sodium',
      severity: nutrition.sodium > standard.sodium * 1.3 ? 'high' : 'medium',
      message: `나트륨 함량이 높습니다 (권장: ${standard.sodium}mg 이하)`,
      currentValue: nutrition.sodium,
      threshold: standard.sodium,
    });
  }
  
  // 단백질 체크
  if (nutrition.protein < standard.protein[0]) {
    warnings.push({
      type: 'protein',
      severity: 'low',
      message: `단백질이 부족합니다 (권장: ${standard.protein[0]}g 이상)`,
      currentValue: nutrition.protein,
      threshold: standard.protein[0],
    });
  }
  
  // 당류 체크 (1끼 20g 이하 권장)
  if (nutrition.sugars > 20) {
    warnings.push({
      type: 'sugars',
      severity: 'medium',
      message: '당류 함량이 높습니다 (권장: 20g 이하)',
      currentValue: nutrition.sugars,
      threshold: 20,
    });
  }
  
  return warnings;
}

/**
 * 영양소 반올림 (소수점 처리)
 */
export function roundNutrition(nutrition: NutritionPer100g): NutritionPer100g {
  return {
    calories: Math.round(nutrition.calories),
    protein: Math.round(nutrition.protein * 10) / 10,
    fat: Math.round(nutrition.fat * 10) / 10,
    carbs: Math.round(nutrition.carbs * 10) / 10,
    sugars: Math.round(nutrition.sugars * 10) / 10,
    sodium: Math.round(nutrition.sodium),
    cholesterol: Math.round(nutrition.cholesterol),
    saturatedFat: Math.round(nutrition.saturatedFat * 10) / 10,
    transFat: Math.round(nutrition.transFat * 10) / 10,
    
    fiber: nutrition.fiber ? Math.round(nutrition.fiber * 10) / 10 : undefined,
    calcium: nutrition.calcium ? Math.round(nutrition.calcium) : undefined,
    iron: nutrition.iron ? Math.round(nutrition.iron * 10) / 10 : undefined,
    phosphorus: nutrition.phosphorus ? Math.round(nutrition.phosphorus) : undefined,
    potassium: nutrition.potassium ? Math.round(nutrition.potassium) : undefined,
    vitaminA: nutrition.vitaminA ? Math.round(nutrition.vitaminA) : undefined,
    vitaminC: nutrition.vitaminC ? Math.round(nutrition.vitaminC) : undefined,
    vitaminD: nutrition.vitaminD ? Math.round(nutrition.vitaminD * 10) / 10 : undefined,
  };
}















