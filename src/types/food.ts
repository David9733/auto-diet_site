/**
 * 음식 (Food) 타입 정의
 * UI에 표시되는 메뉴 단위
 */

import { Recipe } from './recipe';

export type FoodCategory = 
  | 'rice'       // 밥류
  | 'soup'       // 국/찌개류
  | 'main'       // 주메뉴
  | 'side'       // 반찬
  | 'kimchi'     // 김치류
  | 'dessert'    // 후식
  | 'snack';     // 간식

export interface Food {
  id: string;
  name: string;                 // 음식명 (예: "된장찌개", "불고기")
  category: FoodCategory;
  
  // 레시피 정보
  defaultRecipeId: string;      // 기본 레시피 ID
  alternativeRecipeIds?: string[];  // 대체 레시피 ID 목록
  
  // 설명
  description?: string;
  imageUrl?: string;
  
  // 메타데이터
  tags?: string[];              // 검색용 태그 (예: "한식", "매운맛", "어린이급식")
  season?: string[];            // 제철 정보 (예: ["봄", "여름"])
  popularity?: number;          // 인기도 점수
  
  // 알레르기 정보 (레시피에서 자동 계산)
  allergens: string[];
  
  // 영양 정보 (레시피에서 자동 계산)
  nutritionInfo?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    sodium: number;
    fiber?: number;
  };
  
  // 비용 정보 (레시피에서 자동 계산)
  estimatedCost?: number;       // 1인분 예상 원가
  
  // 관리 정보
  isActive: boolean;            // 활성화 여부
  createdAt: string;
  updatedAt: string;
  createdBy?: string;           // 생성자
}

/**
 * 식단에 사용되는 음식 (레시피 적용됨)
 */
export interface MealFood extends Food {
  selectedRecipeId: string;     // 선택된 레시피 ID
  recipe: Recipe;               // 실제 레시피 데이터
  servingCount: number;         // 제공 인원
  
  // 계산된 영양 정보
  totalNutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    sodium: number;
    fiber?: number;
  };
  
  // 계산된 비용
  totalCost: number;
  
  // 경고
  hasNutritionWarning: boolean;
  hasCostWarning: boolean;
  warningMessages?: string[];
}

/**
 * 음식 검색 필터
 */
export interface FoodSearchFilter {
  category?: FoodCategory[];
  excludeAllergens?: string[];
  tags?: string[];
  season?: string;
  maxCalories?: number;
  maxCost?: number;
  keyword?: string;
}















