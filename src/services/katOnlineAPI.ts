/**
 * 한국농수산식품유통공사 온라인 도매시장 거래정보 API 서비스
 * Next.js API Routes를 통해 서버사이드에서 호출
 */

import { 
  KatOnlineAPIResponse, 
  KatTradesParams, 
  KatTradeItem,
  ParsedPriceInfo 
} from '@/types/katOnline';
import { fetchWithRetry, RETRY_PRESETS } from '@/utils/apiRetry';
import { getRateLimiter, RATE_LIMIT_PRESETS } from '@/utils/rateLimiter';

export class KatOnlineAPI {
  private apiBaseUrl = '/api/kat-online';
  
  /**
   * 온라인 도매시장 거래정보 조회
   * @param params 거래정보 조회 파라미터
   */
  async getTrades(params: KatTradesParams): Promise<KatOnlineAPIResponse> {
    try {
      const searchParams = new URLSearchParams({
        cfmtnYmd: params.cfmtnYmd,
        pageNo: (params.pageNo ?? 1).toString(),
        numOfRows: (params.numOfRows ?? 50).toString(),
      });
      
      // 분류 코드 필터 (선택)
      if (params.lclsfCd) searchParams.set('lclsfCd', params.lclsfCd);
      if (params.mclsfCd) searchParams.set('mclsfCd', params.mclsfCd);
      if (params.sclsfCd) searchParams.set('sclsfCd', params.sclsfCd);
      
      // Rate Limit 체크
      const limiter = getRateLimiter();
      const numOfRows = params.numOfRows ?? 50;
      const cost = numOfRows > 100 ? 2 : 1; // 대량 조회는 토큰 2개
      await limiter.waitAndAcquire('kat-api-trades', RATE_LIMIT_PRESETS.publicAPI, cost);
      
      // 재시도 로직 추가
      const retryPreset = numOfRows > 200 ? RETRY_PRESETS.normal : RETRY_PRESETS.fast;
      const response = await fetchWithRetry(
        `${this.apiBaseUrl}/trades?${searchParams}`,
        undefined,
        retryPreset
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({} as any));
        const message = errorData?.error || `API 요청 실패: ${response.status}`;

        const err: any = new Error(message);
        err.status = response.status;
        err.code = errorData?.code;
        err.details = errorData;
        err.url = `${this.apiBaseUrl}/trades?${searchParams}`;

        // "키 미설정" 같은 설정 문제는 재시도해도 해결되지 않으므로 즉시 종료 표시
        if (
          err.code === 'KAT_ONLINE_KEY_MISSING' ||
          err.code === 'KAT_ONLINE_UNAUTHORIZED' ||
          (typeof message === 'string' && message.includes('KAT_ONLINE_SERVICE_KEY'))
        ) {
          err.nonRetryable = true;
        }

        throw err;
      }
      
      const data: KatOnlineAPIResponse = await response.json();
      
      // resultCode 체크 ('0' 또는 '00' 모두 정상)
      const resultCode = data.response?.header?.resultCode;
      if (resultCode !== '00' && resultCode !== '0') {
        throw new Error(data.response?.header?.resultMsg || 'API 응답 에러');
      }
      
      return data;
    } catch (error) {
      console.error('katOnline 거래정보 조회 실패:', error);
      throw error;
    }
  }
  
  /**
   * 거래정보 아이템을 파싱된 가격 정보로 변환
   * @param item 원본 거래정보 아이템
   */
  parsePriceInfo(item: KatTradeItem): ParsedPriceInfo {
    return {
      itemName: item.onln_whsl_mrkt_sclsf_nm,
      categoryLarge: item.onln_whsl_mrkt_lclsf_nm,
      categoryMedium: item.onln_whsl_mrkt_mclsf_nm,
      date: item.cfmtn_ymd,
      avgPrice: parseFloat(item.avgprc) || 0,
      minPrice: parseFloat(item.lwprc) || 0,
      maxPrice: parseFloat(item.hgprc) || 0,
      quantity: parseFloat(item.cfmtn_qty) || 0,
      lclsfCd: item.onln_whsl_mrkt_lclsf_cd,
      mclsfCd: item.onln_whsl_mrkt_mclsf_cd,
      sclsfCd: item.onln_whsl_mrkt_sclsf_cd,
    };
  }
  
  /**
   * 특정 품목의 최근 거래정보 조회
   * @param itemName 품목명 (소분류명)
   * @param date 확정일자 (YYYY-MM-DD)
   */
  async getItemPrice(itemName: string, date: string): Promise<ParsedPriceInfo | null> {
    try {
      const response = await this.getTrades({ cfmtnYmd: date, numOfRows: 100 });
      
      const items = response.response?.body?.items?.item || [];
      const matchedItem = items.find(
        item => item.onln_whsl_mrkt_sclsf_nm.includes(itemName)
      );
      
      if (!matchedItem) {
        console.warn(`품목 "${itemName}"의 거래정보를 찾을 수 없습니다.`);
        return null;
      }
      
      return this.parsePriceInfo(matchedItem);
    } catch (error) {
      console.error(`품목 "${itemName}" 가격 조회 실패:`, error);
      return null;
    }
  }
  
  /**
   * 여러 품목의 가격 정보 일괄 조회
   * @param itemNames 품목명 배열
   * @param date 확정일자 (YYYY-MM-DD)
   */
  async getMultipleItemPrices(
    itemNames: string[], 
    date: string
  ): Promise<Map<string, ParsedPriceInfo | null>> {
    const results = new Map<string, ParsedPriceInfo | null>();
    
    try {
      // 한 번의 API 호출로 모든 데이터 가져오기
      const response = await this.getTrades({ cfmtnYmd: date, numOfRows: 200 });
      const items = response.response?.body?.items?.item || [];
      
      // 각 품목명과 매칭
      itemNames.forEach(itemName => {
        const matchedItem = items.find(
          item => item.onln_whsl_mrkt_sclsf_nm.includes(itemName)
        );
        
        if (matchedItem) {
          results.set(itemName, this.parsePriceInfo(matchedItem));
        } else {
          results.set(itemName, null);
          console.warn(`품목 "${itemName}"의 거래정보를 찾을 수 없습니다.`);
        }
      });
      
      return results;
    } catch (error) {
      console.error('일괄 품목 가격 조회 실패:', error);
      // 실패 시 모든 항목을 null로
      itemNames.forEach(itemName => results.set(itemName, null));
      return results;
    }
  }
  
  /**
   * kg당 가격을 100g당 가격으로 환산
   * @param pricePerKg kg당 가격 (원/kg)
   */
  convertToPrice100g(pricePerKg: number): number {
    return Math.round(pricePerKg / 10);
  }
  
  /**
   * 품목 가격 정보를 100g 단가로 환산
   * (기본 가정: avgPrice는 원/kg)
   * @param priceInfo 가격 정보
   */
  getPricePer100g(priceInfo: ParsedPriceInfo): number {
    return this.convertToPrice100g(priceInfo.avgPrice);
  }
}

/**
 * katOnline API 싱글톤 인스턴스
 */
let katOnlineAPIInstance: KatOnlineAPI | null = null;

export function getKatOnlineAPI(): KatOnlineAPI {
  if (!katOnlineAPIInstance) {
    katOnlineAPIInstance = new KatOnlineAPI();
  }
  
  return katOnlineAPIInstance;
}

export default getKatOnlineAPI;















