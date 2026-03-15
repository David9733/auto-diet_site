/**
 * 한국농수산식품유통공사 온라인 도매시장 거래정보 API 타입 정의
 * Base URL: apis.data.go.kr/B552845/katOnline
 */

/**
 * 거래 정보 아이템
 */
export interface KatTradeItem {
  avgprc: string;                      // 평균가
  cfmtn_ymd: string;                   // 확정일자 (YYYY-MM-DD)
  onln_whsl_mrkt_lclsf_cd: string;     // 온라인도매시장 대분류 코드
  onln_whsl_mrkt_mclsf_cd: string;     // 온라인도매시장 중분류 코드
  onln_whsl_mrkt_sclsf_cd: string;     // 온라인도매시장 소분류 코드
  cfmtn_qty: string;                   // 확정수량
  onln_whsl_mrkt_lclsf_nm: string;     // 온라인도매시장 대분류명
  onln_whsl_mrkt_mclsf_nm: string;     // 온라인도매시장 중분류명
  onln_whsl_mrkt_sclsf_nm: string;     // 온라인도매시장 소분류명
  lwprc: string;                       // 최소가
  hgprc: string;                       // 최고가
}

/**
 * API 응답 래퍼
 */
export interface KatOnlineAPIResponse {
  response: {
    header: {
      resultCode: string;              // 응답 결과 코드
      resultMsg: string;               // 응답 결과 메시지
    };
    body: {
      dataType: string;                // 응답 데이터 타입
      numOfRows: number;               // 한 페이지 결과 수
      pageNo: number;                  // 페이지 번호
      totalCount: number;              // 전체 데이터 수
      items: {
        item: KatTradeItem[];          // 거래 정보 배열
      };
    };
  };
}

/**
 * 거래 정보 조회 파라미터
 */
export interface KatTradesParams {
  cfmtnYmd: string;                    // 확정일자 (YYYY-MM-DD) - 필수
  pageNo?: number;                     // 페이지 번호 (기본: 1)
  numOfRows?: number;                  // 한 페이지 결과 수 (기본: 50)
  lclsfCd?: string;                    // 대분류 코드
  mclsfCd?: string;                    // 중분류 코드
  sclsfCd?: string;                    // 소분류 코드
}

/**
 * 가격 정보 (파싱된 형태)
 */
export interface ParsedPriceInfo {
  itemName: string;                    // 품목명 (소분류명)
  categoryLarge: string;               // 대분류명
  categoryMedium: string;              // 중분류명
  date: string;                        // 확정일자
  avgPrice: number;                    // 평균가 (원)
  minPrice: number;                    // 최소가 (원)
  maxPrice: number;                    // 최고가 (원)
  quantity: number;                    // 확정수량
  
  // 메타데이터
  lclsfCd: string;                     // 대분류 코드
  mclsfCd: string;                     // 중분류 코드
  sclsfCd: string;                     // 소분류 코드
}
