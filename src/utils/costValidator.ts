import { Meal, StoreSettings } from '@/types/meal';

export interface CostWarning {
  type: 'over_budget' | 'high_ratio' | 'expensive_item';
  message: string;
  severity: 'warning' | 'error';
}

export interface CostBreakdown {
  rice: number;
  soup: number;
  sideDishes: number;
  total: number;
}

export interface CostValidationResult {
  isValid: boolean;
  warnings: CostWarning[];
  breakdown: CostBreakdown;
  budgetLimit: number;
  actualRatio: number;
  targetRatio: number;
  perServing: number;
}

export function validateCost(meal: Meal, settings: StoreSettings): CostValidationResult {
  const warnings: CostWarning[] = [];
  
  const breakdown: CostBreakdown = {
    rice: meal.rice.cost,
    soup: meal.soup.cost,
    sideDishes: meal.sideDishes.reduce((sum, d) => sum + d.cost, 0),
    total: meal.totalCost,
  };

  // budgetLimit = 1인당 예상 식재료비 (1인 식비 예산 × 원가 비율)
  const budgetLimit = settings.budgetPerMeal * (settings.costRatio / 100);
  
  // actualRatio = 실제 원가 비율 (1인당 실제 원가 / 1인 식비 예산 × 100)
  const actualRatio = settings.budgetPerMeal > 0 
    ? Math.round((meal.totalCost / settings.budgetPerMeal) * 100) 
    : 0;
  
  // perServing = 1인당 식재료비 (meal.totalCost는 이미 1인분 기준)
  const perServing = meal.totalCost;

  // 예산 초과 체크
  if (meal.totalCost > budgetLimit) {
    const overAmount = meal.totalCost - budgetLimit;
    const overPercent = Math.round((overAmount / budgetLimit) * 100);
    
    if (overPercent > 30) {
      warnings.push({
        type: 'over_budget',
        message: `원가 ${overPercent}% 초과 (${overAmount.toLocaleString()}원 초과)`,
        severity: 'error',
      });
    } else {
      warnings.push({
        type: 'over_budget',
        message: `원가 ${overPercent}% 초과 (${overAmount.toLocaleString()}원 초과)`,
        severity: 'warning',
      });
    }
  }

  // 원가비율 체크
  if (actualRatio > settings.costRatio + 10) {
    warnings.push({
      type: 'high_ratio',
      message: `원가비율 ${actualRatio}% (목표 ${settings.costRatio}%)`,
      severity: actualRatio > settings.costRatio + 20 ? 'error' : 'warning',
    });
  }

  // 고가 메뉴 아이템 체크
  const expensiveThreshold = budgetLimit * 0.4; // 예산의 40% 이상인 단일 메뉴
  const allItems = [meal.rice, meal.soup, ...meal.sideDishes];
  const expensiveItems = allItems.filter(item => item.cost > expensiveThreshold);
  
  if (expensiveItems.length > 0) {
    warnings.push({
      type: 'expensive_item',
      message: `고가 메뉴: ${expensiveItems.map(i => i.name).join(', ')}`,
      severity: 'warning',
    });
  }

  return {
    isValid: warnings.filter(w => w.severity === 'error').length === 0,
    warnings,
    breakdown,
    budgetLimit,
    actualRatio,
    targetRatio: settings.costRatio,
    perServing,
  };
}

export function getCostSummary(meal: Meal, settings: StoreSettings) {
  return validateCost(meal, settings);
}
