/**
 * KAMIS API 프록시 - 최근 가격추이 조회(상품 기준)
 * Next.js API Route (서버사이드)
 */

import { NextRequest, NextResponse } from 'next/server';
import { retryAsync, RETRY_PRESETS } from '@/utils/apiRetry';
import { getClientIdentifier, checkRateLimit, SERVER_RATE_LIMIT_PRESETS } from '@/utils/serverRateLimiter';

const BASE_URL = 'http://www.kamis.or.kr/service/price/xml.do';

export async function GET(request: NextRequest) {
  try {
    const clientId = getClientIdentifier(request);
    const rateLimitResult = checkRateLimit(
      `kamis-price-trend:${clientId}`,
      SERVER_RATE_LIMIT_PRESETS.normal
    );

    if (!rateLimitResult.allowed && rateLimitResult.response) {
      return rateLimitResult.response;
    }

    const sp = request.nextUrl.searchParams;
    const productno = sp.get('productno');
    const regday = sp.get('regday'); // 선택, YYYY-MM-DD

    if (!productno) {
      return NextResponse.json(
        { error: 'productno 파라미터가 필요합니다.' },
        { status: 400 }
      );
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
      action: 'recentlyPriceTrendList',
      p_productno: productno,
      p_cert_id: certId,
      p_cert_key: certKey,
      p_returntype: 'json',
    });

    if (regday) params.set('p_regday', regday);

    const url = `${BASE_URL}?${params.toString()}`;

    console.log(`[KAMIS API] 가격추이 요청: productno=${productno}`);

    const response = await retryAsync(
      () => fetch(url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      }),
      RETRY_PRESETS.fast
    );

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

    return NextResponse.json({ price: items });
  } catch (error) {
    console.error('[KAMIS API] 예외 발생:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '알 수 없는 오류' },
      { status: 500 }
    );
  }
}
