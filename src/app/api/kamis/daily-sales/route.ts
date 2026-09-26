/**
 * KAMIS API 프록시 - 최근일자 도·소매가격정보(상품 기준)
 * Next.js API Route (서버사이드)
 *
 * 목적: 브라우저에서 직접 호출 시 CORS/키노출 방지
 */

import { NextRequest, NextResponse } from 'next/server';
import { retryAsync, RETRY_PRESETS } from '@/utils/apiRetry';
import { getClientIdentifier, checkRateLimit, SERVER_RATE_LIMIT_PRESETS } from '@/utils/serverRateLimiter';

const BASE_URL = 'http://www.kamis.or.kr/service/price/xml.do';

export async function GET(request: NextRequest) {
  try {
    // Rate Limit 체크
    const clientId = getClientIdentifier(request);
    const rateLimitResult = checkRateLimit(
      `kamis-daily-sales:${clientId}`,
      SERVER_RATE_LIMIT_PRESETS.normal
    );

    if (!rateLimitResult.allowed && rateLimitResult.response) {
      return rateLimitResult.response;
    }

    const certId = process.env.KAMIS_CERT_ID;
    const certKey = process.env.KAMIS_CERT_KEY;

    if (!certId || !certKey) {
      return NextResponse.json(
        {
          error: 'KAMIS_CERT_ID/KAMIS_CERT_KEY가 설정되지 않았습니다. .env.local 파일을 확인해주세요.',
          code: 'KAMIS_KEY_MISSING',
        },
        { status: 500 }
      );
    }

    const params = new URLSearchParams({
      action: 'dailySalesList',
      p_cert_id: certId,
      p_cert_key: certKey,
      p_returntype: 'json',
    });

    const url = `${BASE_URL}?${params.toString()}`;

    console.log('[KAMIS API] 최근일자 도소매가격 요청');

    const response = await retryAsync(
      () => fetch(url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        cache: 'no-store', // 시세 데이터는 캐시하지 않음
      }),
      RETRY_PRESETS.normal
    );

    console.log(`[KAMIS API] 응답 상태: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.error('[KAMIS API] 에러 응답:', errorText.substring(0, 500));
      return NextResponse.json(
        {
          error: `KAMIS API 요청 실패: ${response.status}`,
          code: response.status === 401 || response.status === 403 ? 'KAMIS_UNAUTHORIZED' : 'KAMIS_HTTP_ERROR',
          details: errorText.substring(0, 200),
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // KAMIS 결과 코드: 배열이 바로 오거나 { data: { error_code, item } } 형태로 올 수 있어 방어적으로 처리
    const resultCode = data?.data?.error_code ?? data?.result_code;
    if (resultCode && resultCode !== '000') {
      console.error('[KAMIS API] 에러:', resultCode);
      return NextResponse.json(
        {
          error: 'KAMIS API 요청 실패',
          code: resultCode === '900' ? 'KAMIS_UNAUTHORIZED' : 'KAMIS_API_ERROR',
        },
        { status: 400 }
      );
    }

    const items = Array.isArray(data) ? data : data?.price ?? data?.data?.item ?? [];
    console.log(`[KAMIS API] 성공: ${items.length}건`);

    return NextResponse.json({ price: items });
  } catch (error) {
    console.error('[KAMIS API] 예외 발생:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '알 수 없는 오류' },
      { status: 500 }
    );
  }
}
