/**
 * KAMIS(농산물유통정보) API 서비스
 * Next.js API Routes를 통해 서버사이드에서 호출
 */

import {
  KamisDailySalesResponse,
  KamisDailySalesItem,
  KamisPriceTrendResponse,
  KamisPeriodProductResponse,
  KamisPeriodProductItem,
  ParsedKamisPrice,
} from '@/types/kamis';
import { fetchWithRetry, RETRY_PRESETS } from '@/utils/apiRetry';
import { getRateLimiter, RATE_LIMIT_PRESETS } from '@/utils/rateLimiter';

/**
 * KAMIS 가격 필드는 "61,487" 처럼 쉼표가 포함된 문자열로 내려오는 게 보통이지만,
 * 값이 없는 필드는 문자열 대신 빈 배열(`[]`)로 내려오는 경우가 있어 방어적으로 처리한다.
 */
function parseKamisNumber(value: unknown): number {
  if (typeof value !== 'string' || !value) return 0;
  const cleaned = value.replace(/,/g, '').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

function toErrorWithCode(response: Response, errorData: any): Error & { status?: number; code?: string } {
  const message = errorData?.error || `API 요청 실패: ${response.status}`;
  const err: any = new Error(message);
  err.status = response.status;
  err.code = errorData?.code;
  if (
    err.code === 'KAMIS_KEY_MISSING' ||
    err.code === 'KAMIS_UNAUTHORIZED' ||
    (typeof message === 'string' && message.includes('KAMIS_CERT'))
  ) {
    err.nonRetryable = true;
  }
  return err;
}

export class KamisAPI {
  private apiBaseUrl = '/api/kamis';

  /**
   * 최근일자 도·소매가격정보(상품 기준) 전체 조회
   */
  async getDailySales(): Promise<KamisDailySalesItem[]> {
    const limiter = getRateLimiter();
    await limiter.waitAndAcquire('kamis-daily-sales', RATE_LIMIT_PRESETS.publicAPI, 2);

    const response = await fetchWithRetry(
      `${this.apiBaseUrl}/daily-sales`,
      undefined,
      RETRY_PRESETS.normal
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({} as any));
      throw toErrorWithCode(response, errorData);
    }

    const data: KamisDailySalesResponse = await response.json();
    return data.price || [];
  }

  /**
   * 최근 가격추이 조회(상품 기준)
   */
  async getPriceTrend(productno: string, regday?: string) {
    const limiter = getRateLimiter();
    await limiter.waitAndAcquire('kamis-price-trend', RATE_LIMIT_PRESETS.fast);

    const params = new URLSearchParams({ productno });
    if (regday) params.set('regday', regday);

    const response = await fetchWithRetry(
      `${this.apiBaseUrl}/price-trend?${params}`,
      undefined,
      RETRY_PRESETS.fast
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({} as any));
      throw toErrorWithCode(response, errorData);
    }

    const data: KamisPriceTrendResponse = await response.json();
    return data.price || [];
  }

  /**
   * 축산물(소/돼지/닭/계란/우유) 가격 조회
   */
  async getLivestockPrice(
    itemcode: string,
    kindcode: string,
    productrankcode?: string
  ): Promise<KamisPeriodProductItem[]> {
    const limiter = getRateLimiter();
    await limiter.waitAndAcquire('kamis-period-product', RATE_LIMIT_PRESETS.fast);

    const params = new URLSearchParams({ itemcode, kindcode });
    if (productrankcode) params.set('productrankcode', productrankcode);

    const response = await fetchWithRetry(
      `${this.apiBaseUrl}/period-product?${params}`,
      undefined,
      RETRY_PRESETS.fast
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({} as any));
      throw toErrorWithCode(response, errorData);
    }

    const data: KamisPeriodProductResponse = await response.json();
    return data.price || [];
  }

  /**
   * dailySalesList 아이템을 파싱된 가격 정보로 변환
   */
  parseDailySalesItem(item: KamisDailySalesItem): ParsedKamisPrice {
    const direction: ParsedKamisPrice['direction'] =
      item.direction === '1' ? 'up' : item.direction === '0' ? 'down' : 'flat';

    return {
      productno: item.productno,
      productName: item.productName || item.item_name || '',
      categoryName: item.category_name,
      unit: item.unit,
      date: item.lastest_day || '',
      price: parseKamisNumber(item.dpr1),
      direction,
      changeRate: parseKamisNumber(item.value),
      productClsCode: item.product_cls_code,
    };
  }

  /**
   * 단위 문자열을 해석해서 100g당 가격으로 환산
   * (예: "1kg" → price/10, "100g" → price 그대로, "1개"/"10개" 등은 환산 불가 → 원본 유지)
   * 단위를 알 수 없으면 kg 가정 폴백(price/10)
   */
  getPricePer100g(priceInfo: ParsedKamisPrice): number {
    const unit = (priceInfo.unit || '').trim();

    const kgMatch = unit.match(/^(\d*\.?\d+)\s*kg$/i);
    if (kgMatch) {
      const kg = parseFloat(kgMatch[1]) || 1;
      const gramTotal = kg * 1000;
      return Math.round((priceInfo.price / gramTotal) * 100);
    }

    const gMatch = unit.match(/^(\d*\.?\d+)\s*g$/i);
    if (gMatch) {
      const g = parseFloat(gMatch[1]) || 100;
      return Math.round((priceInfo.price / g) * 100);
    }

    // 단위를 못 알아보는 경우(개/구/마리 등) - kg 가정 폴백
    return Math.round(priceInfo.price / 10);
  }
}

/**
 * KAMIS API 싱글톤 인스턴스
 */
let kamisAPIInstance: KamisAPI | null = null;

export function getKamisAPI(): KamisAPI {
  if (!kamisAPIInstance) {
    kamisAPIInstance = new KamisAPI();
  }
  return kamisAPIInstance;
}

export default getKamisAPI;
