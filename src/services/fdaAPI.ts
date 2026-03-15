/**
 * 식품의약품안전처 식품영양성분DB API 서비스
 * Next.js API Routes를 통해 서버사이드에서 호출
 */

import { FDAAPIResponse, FDANutritionResponse } from '@/types/ingredient';
import { fetchWithRetry, RETRY_PRESETS } from '@/utils/apiRetry';
import { getRateLimiter, RATE_LIMIT_PRESETS } from '@/utils/rateLimiter';

export class FDANutritionAPI {
  private apiBaseUrl = '/api/fda';
  
  /**
   * 식재료 검색
   * @param keyword 검색 키워드 (식품명)
   * @param pageNo 페이지 번호 (기본: 1)
   * @param numOfRows 한 페이지 결과 수 (기본: 20)
   */
  async searchIngredients(
    keyword: string, 
    pageNo: number = 1, 
    numOfRows: number = 20
  ): Promise<FDANutritionResponse[]> {
    try {
      const params = new URLSearchParams({
        keyword,
        pageNo: pageNo.toString(),
        numOfRows: numOfRows.toString(),
      });
      
      // Rate Limit 체크
      const limiter = getRateLimiter();
      await limiter.waitAndAcquire('fda-api-search', RATE_LIMIT_PRESETS.publicAPI);
      
      // 재시도 로직 추가
      const response = await fetchWithRetry(
        `${this.apiBaseUrl}/search?${params}`,
        undefined,
        RETRY_PRESETS.fast
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API 요청 실패: ${response.status}`);
      }
      
      const data: FDAAPIResponse = await response.json();
      
      return data.body?.items || [];
    } catch (error) {
      console.error('식재료 검색 실패:', error);
      throw error;
    }
  }
  
  /**
   * 식재료 상세 조회
   * @param foodCode 식품코드
   */
  async getIngredientDetail(foodCode: string): Promise<FDANutritionResponse | null> {
    try {
      const params = new URLSearchParams({
        foodCode,
      });
      
      // Rate Limit 체크
      const limiter = getRateLimiter();
      await limiter.waitAndAcquire('fda-api-detail', RATE_LIMIT_PRESETS.publicAPI);
      
      // 재시도 로직 추가
      const response = await fetchWithRetry(
        `${this.apiBaseUrl}/detail?${params}`,
        undefined,
        RETRY_PRESETS.fast
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API 요청 실패: ${response.status}`);
      }
      
      const data: FDAAPIResponse = await response.json();
      
      return data.body?.items?.[0] || null;
    } catch (error) {
      console.error('식재료 상세 조회 실패:', error);
      throw error;
    }
  }
  
  /**
   * 카테고리별 식재료 조회
   * @param category 식품군명
   * @param pageNo 페이지 번호
   * @param numOfRows 한 페이지 결과 수
   */
  async getIngredientsByCategory(
    category: string,
    pageNo: number = 1,
    numOfRows: number = 100
  ): Promise<FDANutritionResponse[]> {
    try {
      const params = new URLSearchParams({
        category,
        pageNo: pageNo.toString(),
        numOfRows: numOfRows.toString(),
      });
      
      // Rate Limit 체크 (대량 조회는 토큰 2개 소비)
      const limiter = getRateLimiter();
      const cost = numOfRows > 50 ? 2 : 1;
      await limiter.waitAndAcquire('fda-api-category', RATE_LIMIT_PRESETS.publicAPI, cost);
      
      // 재시도 로직 추가
      const response = await fetchWithRetry(
        `${this.apiBaseUrl}/category?${params}`,
        undefined,
        RETRY_PRESETS.fast
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API 요청 실패: ${response.status}`);
      }
      
      const data: FDAAPIResponse = await response.json();
      
      return data.body?.items || [];
    } catch (error) {
      console.error('카테고리별 식재료 조회 실패:', error);
      throw error;
    }
  }
  
  /**
   * 여러 식재료 일괄 조회
   * @param keywords 검색 키워드 배열
   */
  async searchMultipleIngredients(keywords: string[]): Promise<Map<string, FDANutritionResponse[]>> {
    const results = new Map<string, FDANutritionResponse[]>();
    
    try {
      const promises = keywords.map(keyword => 
        this.searchIngredients(keyword, 1, 10)
          .then(items => ({ keyword, items }))
          .catch(error => {
            console.error(`"${keyword}" 검색 실패:`, error);
            return { keyword, items: [] };
          })
      );
      
      const responses = await Promise.all(promises);
      
      responses.forEach(({ keyword, items }) => {
        results.set(keyword, items);
      });
      
      return results;
    } catch (error) {
      console.error('일괄 식재료 조회 실패:', error);
      throw error;
    }
  }
}

/**
 * FDA API 싱글톤 인스턴스
 */
let fdaAPIInstance: FDANutritionAPI | null = null;

export function getFDAAPI(): FDANutritionAPI {
  if (!fdaAPIInstance) {
    fdaAPIInstance = new FDANutritionAPI();
  }
  
  return fdaAPIInstance;
}

export default getFDAAPI;















