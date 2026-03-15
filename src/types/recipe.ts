/**
 * 레시피 (Recipe) 타입 정의
 * 음식과 식재료를 연결하는 중간 테이블
 */

export interface RecipeIngredient {
  id: string;
  recipeId: string;             // 소속된 레시피 ID
  ingredientId: string;         // 식재료 ID
  ingredientName: string;       // 식재료명 (조회 최적화용)
  
  // 사용량
  amountGram: number;           // 사용 중량(g)
  
  // 메타데이터
  isEssential: boolean;         // 필수 재료 여부
  substituteIds?: string[];     // 대체 가능 식재료 ID 목록
  notes?: string;               // 비고 (예: "다진 상태", "볶은 후" 등)
  
  // 조리 정보
  preparationMethod?: string;   // 조리 방법
  cookingLoss?: number;         // 조리 손실률 (%)
}

export interface Recipe {
  id: string;
  foodId: string;               // 이 레시피가 만드는 음식 ID
  name: string;                 // 레시피명 (예: "표준 된장찌개", "매운 된장찌개")
  
  // 레시피 구성
  ingredients: RecipeIngredient[];
  
  // 분량 정보
  servingSize: number;          // 1인분 기준량(g)
  servingCount: number;         // 만들어지는 인분
  
  // 조리 정보
  cookingTime?: number;         // 조리 시간(분)
  difficulty?: 'easy' | 'medium' | 'hard';  // 난이도
  cookingMethod?: string;       // 조리 방법 설명
  
  // 메타데이터
  isDefault: boolean;           // 기본 레시피 여부
  source?: string;              // 레시피 출처
  author?: string;              // 작성자
  createdAt: string;            // 생성일
  updatedAt: string;            // 수정일
  
  // 계산된 값 (캐시용)
  cachedNutrition?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    sodium: number;
  };
  cachedCost?: number;
}

/**
 * 레시피 템플릿 (관리자용)
 */
export interface RecipeTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  baseRecipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>;
  tags: string[];
  isPublic: boolean;
}















