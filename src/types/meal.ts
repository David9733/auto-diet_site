export interface MenuItem {
  id: string;
  name: string;
  category: 'rice' | 'soup' | 'kimchi' | 'vegetable' | 'meat' | 'side';
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sodium: number;
  allergens: string[];
  cost: number;
  mainIngredients?: string[]; // 주재료 (중복 방지용)
  isCustom?: boolean; // 직접 입력 여부
  weight?: number; // 출현 빈도 가중치 (기본값: 1, 높을수록 자주 나옴)
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack_morning' | 'snack_afternoon' | 'snack_evening';

export type CuisineType = 'japanese' | 'chinese' | 'western' | 'snack';

export interface Meal {
  id: string;
  type: MealType;
  rice: MenuItem;
  soup: MenuItem;
  sideDishes: MenuItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalSodium: number;
  totalCost: number;
  allergens: string[];
  hasNutritionWarning: boolean;
  hasCostWarning: boolean;
  isSpecialMeal?: boolean; // 특별식 여부
  cuisineType?: CuisineType; // 특별식 종류
}

export interface SnackMeal {
  id: string;
  type: MealType;
  items: MenuItem[];
  totalCalories: number;
  totalCost: number;
}

export interface DayMealPlan {
  id: string;
  date: string;
  dayOfWeek: string;
  meals: Meal[];
  snacks?: SnackMeal[];
  isNotOperating?: boolean; // 운영안함 여부
}

export interface WeekMealPlan {
  id: string;
  weekNumber: number;
  startDate: string;
  endDate: string;
  days: DayMealPlan[];
}

export type MealCombination = 'breakfast_lunch' | 'lunch_dinner' | 'breakfast_dinner' | 'all';
export type SingleMealType = 'breakfast' | 'lunch' | 'dinner';

export interface StoreSettings {
  id: string;
  storeName: string;
  mealsPerDay: 1 | 2 | 3;
  mealCombination: MealCombination; // 2끼일 때 어떤 조합인지
  singleMealType: SingleMealType; // 1끼일 때 어떤 끼니인지
  daysPerWeek: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  sideDishCount: number;
  sideDishCountAuto?: boolean; // true면 예산/원가비율 기반으로 자동 결정
  servingCount: number;
  budgetPerMeal: number;
  costRatio: number;
  snackMorning: boolean;
  snackAfternoon: boolean;
  snackEvening: boolean;
  startDate?: string; // 시작 날짜
  watchAllergens?: string[]; // 주의 알레르기 목록
}
