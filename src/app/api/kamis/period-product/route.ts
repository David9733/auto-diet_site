/**
 * KAMIS API 프록시 - 축산물 기간별 가격정보 (action=periodProductList)
 * 축산물(소/돼지/닭/계란/우유)은 dailySalesList가 아니라 이 액션으로 조회해야 함
 * (KAMIS 문서: 축산물데이터는 축평원에서 받아옴)
 *
 * 주의: 정확한 응답 필드는 KAMIS 문서에 명시되어 있지 않아 최대한 방어적으로 처리함.
 * /test-kamis 페이지에서 raw 응답을 확인해 필요 시 파싱을 보정할 것.
 */

import { NextRequest, NextResponse } from 'next/server';
import { retryAsync, RETRY_PRESETS } from '@/utils/apiRetry';
import { getClientIdentifier, checkRateLimit, SERVER_RATE_LIMIT_PRESETS } from '@/utils/serverRateLimiter';

const BASE_URL = 'http://www.kamis.or.kr/service/price/xml.do';

function isValidYmd(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function defaultDateRange(): { startday: string; endday: string } {
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const fmt = (d: Date) => d.toISOString().split('T')[0];
  return { startday: fmt(weekAgo), endday: fmt(today) };
}

export async function GET(request: NextRequest) {
  try {
    const clientId = getClientIdentifier(request);
    const rateLimitResult = checkRateLimit(
      `kamis-period-product:${clientId}`,
      SERVER_RATE_LIMIT_PRESETS.normal
    );

    if (!rateLimitResult.allowed && rateLimitResult.response) {
      return rateLimitResult.response;
    }

    const sp = request.nextUrl.searchParams;
    const itemcode = sp.get('itemcode');
    const kindcode = sp.get('kindcode');
    const productrankcode = sp.get('productrankcode');

    if (!itemcode || !kindcode) {
      return NextResponse.json(
        { error: 'itemcode/kindcode 파라미터가 필요합니다.' },
        { status: 400 }
      );
    }

    const { startday: defaultStart, endday: defaultEnd } = defaultDateRange();
    const startday = sp.get('startday');
    const endday = sp.get('endday');

    const finalStartday = startday && isValidYmd(startday) ? startday : defaultStart;
    const finalEndday = endday && isValidYmd(endday) ? endday : defaultEnd;

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
      action: 'periodProductList',
      p_itemcode: itemcode,
      p_kindcode: kindcode,
      p_startday: finalStartday,
      p_endday: finalEndday,
      p_cert_id: certId,
      p_cert_key: certKey,
      p_returntype: 'json',
    });

    if (productrankcode) params.set('p_productrankcode', productrankcode);

    const url = `${BASE_URL}?${params.toString()}`;

    console.log(`[KAMIS API] 축산물 가격 요청: itemcode=${itemcode} kindcode=${kindcode}`);

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

    // 응답 필드가 문서로 확인되지 않았으므로 raw 데이터도 함께 내려서 /test-kamis에서 확인 가능하게 함
    return NextResponse.json({ price: items, _raw: data });
  } catch (error) {
    console.error('[KAMIS API] 예외 발생:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '알 수 없는 오류' },
      { status: 500 }
    );
  }
}
