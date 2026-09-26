/**
 * KAMIS(농산물유통정보) Open API 타입 정의
 * Base URL: www.kamis.or.kr/service/price/xml.do
 */

/**
 * 최근일자 도·소매가격정보(상품 기준) - action=dailySalesList
 */
export interface KamisDailySalesItem {
  product_cls_code: string;   // 구분코드 (01: 소매, 02: 도매)
  product_cls_name: string;   // 구분명
  category_code: string;      // 부류코드
  category_name: string;      // 부류명
  productno: string;          // 품목코드 (가격추이 조회 시 재사용)
  lastest_day?: string;        // 최근조사일 (실제 응답 필드명, YYYY-MM-DD)
  productName: string;        // 품목명 (형식: "품목/품종(등급)", 예: "소/등심(1등급)")
  item_name?: string;          // 품목명(중복 필드)
  unit: string;                // 단위
  day1: string;                // "당일" 같은 상대 표현 (날짜 아님 - 실제 날짜는 lastest_day)
  dpr1: string;                // 최근 조사가격 (쉼표 포함, 예: "61,487")
  day2: string;                // 1일 전 조사일
  dpr2: string;                // 1일 전 가격
  day3: string;                // 1개월 전 조사일
  dpr3: string;                // 1개월 전 가격
  day4: string;                // 1년 전 조사일
  dpr4: string;                // 1년 전 가격
  direction: string;           // 등락 방향 (0: 하락, 1: 상승, 2: 보합)
  value: string;                // 등락률
  result_code?: string;
}

export interface KamisDailySalesResponse {
  condition?: unknown;
  price: KamisDailySalesItem[];
}

/**
 * 최근 가격추이 조회(상품 기준) - action=recentlyPriceTrendList
 */
export interface KamisPriceTrendItem {
  yyyy: string;
  d40: string;
  d30: string;
  d20: string;
  d10: string;
  d0: string;
  mx: string; // 최고가
  mn: string; // 최저가
}

export interface KamisPriceTrendResponse {
  condition?: unknown;
  price: KamisPriceTrendItem[];
}

/**
 * 축산물 코드표(정적 데이터) 아이템 - action=periodProductList 호출에 사용
 */
export interface KamisLivestockCode {
  itemName: string;          // 품목명 (예: 소)
  kindName: string;          // 품종명 (예: 등심)
  rankName: string;          // 등급명 (예: 1등급, ''=전체)
  itemCode: string;          // 품목코드
  kindCode: string;          // 품종코드
  productRankCode: string;   // 등급코드
}

/**
 * 축산물 기간별 가격정보 - action=periodProductList
 * (KAMIS 문서에 응답 필드가 명시되어 있지 않아 방어적으로 넓게 정의,
 *  실제 응답 확인 후 /test-kamis에서 보정 필요)
 */
export interface KamisPeriodProductItem {
  itemname?: string;
  kindname?: string;
  productrankcode?: string;
  regday?: string;
  yyyy?: string;
  price?: string;
  marketname?: string;
  countyname?: string;
  unit?: string;
  [key: string]: unknown; // 문서 미확인 필드 방어
}

export interface KamisPeriodProductResponse {
  condition?: unknown;
  price: KamisPeriodProductItem[];
}

/**
 * 파싱된 가격 정보 (앱 내부용)
 */
export interface ParsedKamisPrice {
  productno: string;
  productName: string;
  categoryName: string;
  unit: string;
  date: string;                          // day1
  price: number;                         // dpr1 (숫자)
  direction: 'up' | 'down' | 'flat';
  changeRate: number;                    // value (숫자, %)
  productClsCode: '01' | '02' | string;  // 01: 소매, 02: 도매
}
