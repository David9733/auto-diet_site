/**
 * 식재료 (Ingredient) 타입 정의
 * 식약처 영양성분 DB 기반
 */

export interface NutritionPer100g {
  calories: number;        // 에너지(kcal)
  protein: number;         // 단백질(g)
  fat: number;             // 지방(g)
  carbs: number;          // 탄수화물(g)
  sugars: number;         // 당류(g)
  sodium: number;         // 나트륨(mg)
  cholesterol: number;    // 콜레스테롤(mg)
  saturatedFat: number;   // 포화지방산(g)
  transFat: number;       // 트랜스지방(g)
  fiber?: number;         // 식이섬유(g)
  calcium?: number;       // 칼슘(mg)
  iron?: number;          // 철분(mg)
  phosphorus?: number;    // 인(mg)
  potassium?: number;     // 칼륨(mg)
  vitaminA?: number;      // 비타민A(μgRAE)
  vitaminC?: number;      // 비타민C(mg)
  vitaminD?: number;      // 비타민D(μg)
}

export interface Ingredient {
  id: string;
  fdaCode: string;              // 식약처 식품코드 (FOOD_CD)
  name: string;                 // 식품명 (FOOD_NM_KR)
  category: string;             // 식품군 (FOOD_GROUP_NM)
  
  // 100g당 영양성분 (식약처 표준)
  nutritionPer100g: NutritionPer100g;
  
  // 알레르기 정보
  allergens: string[];
  
  // 가격 정보 (수동 관리)
  unitPricePer100g: number;     // 100g당 가격(원)
  
  // 메타데이터
  source: 'FDA_API' | 'CUSTOM';  // 데이터 출처
  animalPlant?: string;          // 동물성/식물성
  makerName?: string;            // 제조사명
  servingSize?: number;          // 1회 제공량(g)
  lastUpdated: string;           // 마지막 업데이트 일시
  
  // 검색 최적화
  searchKeywords?: string[];     // 검색용 키워드
}

/**
 * 식약처 API 원본 응답 타입
 */
export interface FDANutritionResponse {
  NUM?: string;                 // 번호
  FOOD_CD: string;              // 식품코드
  FOOD_NM_KR: string;           // 식품명
  
  // 데이터베이스 분류
  DB_GRP_CM?: string;           // DB 그룹 코드
  DB_GRP_NM?: string;           // DB 그룹명 (음식/식품)
  DB_CLASS_CM?: string;         // DB 분류 코드
  DB_CLASS_NM?: string;         // DB 분류명 (품목대표/상용제품)
  
  // 식품 분류
  FOOD_OR_CD?: string;          // 식품 유형 코드
  FOOD_OR_NM?: string;          // 식품 유형명
  FOOD_CAT1_CD?: string;        // 식품 대분류 코드
  FOOD_CAT1_NM?: string;        // 식품 대분류명
  FOOD_CAT2_CD?: string;        // 식품 중분류 코드
  FOOD_CAT2_NM?: string;        // 식품 중분류명
  FOOD_CAT3_CD?: string;        // 식품 소분류 코드
  FOOD_CAT3_NM?: string;        // 식품 소분류명
  FOOD_REF_CD?: string;         // 식품 참조 코드
  FOOD_REF_NM?: string;         // 식품 참조명
  
  SERVING_SIZE?: string;        // 기준량 (예: "100g")
  
  // 영양성분 (AMT_NUM1~157)
  AMT_NUM1?: string;            // 에너지(kcal)
  AMT_NUM2?: string;            // 수분(g)
  AMT_NUM3?: string;            // 단백질(g)
  AMT_NUM4?: string;            // 지방(g)
  AMT_NUM5?: string;            // 탄수화물(g)
  AMT_NUM6?: string;            // 당류(g)
  AMT_NUM7?: string;            // 식이섬유(g)
  AMT_NUM8?: string;            // 회분(g)
  AMT_NUM9?: string;            // 칼슘(mg)
  AMT_NUM10?: string;           // 철분(mg)
  AMT_NUM11?: string;           // 인(mg)
  AMT_NUM12?: string;           // 칼륨(mg)
  AMT_NUM13?: string;           // 나트륨(mg)
  AMT_NUM14?: string;           // 비타민A(μgRAE)
  AMT_NUM15?: string;           // 레티놀(μg)
  AMT_NUM16?: string;           // 베타카로틴(μg)
  AMT_NUM17?: string;           // 비타민D(μg)
  AMT_NUM18?: string;           // 비타민E(mg)
  AMT_NUM19?: string;           // 비타민K(μg)
  AMT_NUM20?: string;           // 비타민B1(mg)
  AMT_NUM21?: string;           // 비타민B2(mg)
  AMT_NUM22?: string;           // 니아신(mg)
  AMT_NUM23?: string;           // 비타민C(mg)
  AMT_NUM24?: string;           // 총 지방산(g)
  AMT_NUM25?: string;           // 트랜스지방산(g)
  // ... 기타 AMT_NUM26~157
  
  // 메타데이터
  SUB_REF_CM?: string;          // 출처 코드
  SUB_REF_NAME?: string;        // 출처명
  MAKER_NM?: string | null;     // 제조사명
  ITEM_REPORT_NO?: string;      // 품목제조보고번호
  RESEARCH_YMD?: string;        // 데이터생성일자
  UPDATE_DATE?: string;         // 데이터수정일자
  CRT_MTH_CD?: string;          // 생성방법 코드
  CRT_MTH_NM?: string;          // 생성방법명
  Z10500?: string;              // 1회 분량
  [key: string]: string | null | undefined;  // 동적 AMT_NUM 필드
}

/**
 * 식약처 API 응답 래퍼
 */
export interface FDAAPIResponse {
  header: {
    resultCode: string;
    resultMsg: string;
  };
  body: {
    pageNo: number;
    totalCount: number;
    numOfRows: number;
    items: FDANutritionResponse[];
  };
}















