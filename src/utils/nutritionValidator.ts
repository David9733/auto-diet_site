import { Meal } from '@/types/meal';

export interface NutritionWarning {
  type: 'calories' | 'sodium' | 'protein' | 'carbs' | 'fat' | 'ratio';
  message: string;
  severity: 'warning' | 'error';
  value: number;
  limit: number;
  unit: string;
}

export interface NutritionValidationResult {
  isValid: boolean;
  warnings: NutritionWarning[];
}

// 영양 기준 (1끼 기준)
const NUTRITION_LIMITS = {
  calories: { min: 400, max: 900, unit: 'kcal' },
  sodium: { max: 1500, unit: 'mg' }, // 1끼 나트륨 권장량
  protein: { min: 15, max: 50, unit: 'g' },
  carbs: { min: 50, max: 150, unit: 'g' },
  fat: { min: 10, max: 35, unit: 'g' },
};

// 탄단지 비율 기준 (권장 비율)
const MACRO_RATIO_LIMITS = {
  carbs: { min: 45, max: 65 }, // 탄수화물 45-65%
  protein: { min: 10, max: 35 }, // 단백질 10-35%
  fat: { min: 20, max: 35 }, // 지방 20-35%
};

export function calculateMacroRatios(meal: Meal) {
  const totalMacroCalories = 
    (meal.totalCarbs * 4) + // 탄수화물 1g = 4kcal
    (meal.totalProtein * 4) + // 단백질 1g = 4kcal
    (meal.totalFat * 9); // 지방 1g = 9kcal

  if (totalMacroCalories === 0) {
    return { carbsRatio: 0, proteinRatio: 0, fatRatio: 0 };
  }

  return {
    carbsRatio: Math.round((meal.totalCarbs * 4 / totalMacroCalories) * 100),
    proteinRatio: Math.round((meal.totalProtein * 4 / totalMacroCalories) * 100),
    fatRatio: Math.round((meal.totalFat * 9 / totalMacroCalories) * 100),
  };
}

export function validateNutrition(meal: Meal): NutritionValidationResult {
  const warnings: NutritionWarning[] = [];

  // 칼로리 체크
  if (meal.totalCalories > NUTRITION_LIMITS.calories.max) {
    warnings.push({
      type: 'calories',
      message: `칼로리 초과 (${meal.totalCalories}/${NUTRITION_LIMITS.calories.max}kcal)`,
      severity: 'error',
      value: meal.totalCalories,
      limit: NUTRITION_LIMITS.calories.max,
      unit: 'kcal',
    });
  } else if (meal.totalCalories < NUTRITION_LIMITS.calories.min) {
    warnings.push({
      type: 'calories',
      message: `칼로리 부족 (${meal.totalCalories}/${NUTRITION_LIMITS.calories.min}kcal)`,
      severity: 'warning',
      value: meal.totalCalories,
      limit: NUTRITION_LIMITS.calories.min,
      unit: 'kcal',
    });
  }

  // 나트륨 체크
  if (meal.totalSodium > NUTRITION_LIMITS.sodium.max) {
    warnings.push({
      type: 'sodium',
      message: `나트륨 초과 (${meal.totalSodium}/${NUTRITION_LIMITS.sodium.max}mg)`,
      severity: meal.totalSodium > NUTRITION_LIMITS.sodium.max * 1.3 ? 'error' : 'warning',
      value: meal.totalSodium,
      limit: NUTRITION_LIMITS.sodium.max,
      unit: 'mg',
    });
  }

  // 단백질 체크
  if (meal.totalProtein < NUTRITION_LIMITS.protein.min) {
    warnings.push({
      type: 'protein',
      message: `단백질 부족 (${meal.totalProtein}/${NUTRITION_LIMITS.protein.min}g)`,
      severity: 'warning',
      value: meal.totalProtein,
      limit: NUTRITION_LIMITS.protein.min,
      unit: 'g',
    });
  }

  // 탄단지 비율 체크
  const ratios = calculateMacroRatios(meal);
  
  if (ratios.carbsRatio < MACRO_RATIO_LIMITS.carbs.min || ratios.carbsRatio > MACRO_RATIO_LIMITS.carbs.max) {
    warnings.push({
      type: 'ratio',
      message: `탄수화물 비율 ${ratios.carbsRatio}% (권장 ${MACRO_RATIO_LIMITS.carbs.min}-${MACRO_RATIO_LIMITS.carbs.max}%)`,
      severity: 'warning',
      value: ratios.carbsRatio,
      limit: MACRO_RATIO_LIMITS.carbs.max,
      unit: '%',
    });
  }

  if (ratios.fatRatio > MACRO_RATIO_LIMITS.fat.max) {
    warnings.push({
      type: 'ratio',
      message: `지방 비율 과다 ${ratios.fatRatio}% (권장 ${MACRO_RATIO_LIMITS.fat.max}% 이하)`,
      severity: 'warning',
      value: ratios.fatRatio,
      limit: MACRO_RATIO_LIMITS.fat.max,
      unit: '%',
    });
  }

  return {
    isValid: warnings.filter(w => w.severity === 'error').length === 0,
    warnings,
  };
}

export function getNutritionSummary(meal: Meal) {
  const ratios = calculateMacroRatios(meal);
  const validation = validateNutrition(meal);
  
  return {
    calories: meal.totalCalories,
    protein: meal.totalProtein,
    carbs: meal.totalCarbs,
    fat: meal.totalFat,
    sodium: meal.totalSodium,
    ratios,
    validation,
  };
}
