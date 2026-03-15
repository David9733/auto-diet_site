/**
 * katOnline API 프록시 - 온라인 도매시장 거래정보
 * Next.js API Route (서버사이드)
 * 
 * 목적: 브라우저에서 직접 호출 시 CORS/키노출 방지
 */

import { NextRequest, NextResponse } from 'next/server';
import { retryAsync, RETRY_PRESETS } from '@/utils/apiRetry';
import { getClientIdentifier, checkRateLimit, SERVER_RATE_LIMIT_PRESETS } from '@/utils/serverRateLimiter';

const BASE_URL = 'https://apis.data.go.kr/B552845/katOnline/trades';

/**
 * YYYY-MM-DD 형식 검증
 */
function isValidYmd(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export async function GET(request: NextRequest) {
  try {
    // Rate Limit 체크
    const clientId = getClientIdentifier(request);
    const rateLimitResult = checkRateLimit(
      `kat-trades:${clientId}`,
      SERVER_RATE_LIMIT_PRESETS.normal
    );
    
    if (!rateLimitResult.allowed && rateLimitResult.response) {
      return rateLimitResult.response;
    }
    
    const sp = request.nextUrl.searchParams;
    
    // 필수: 확정일자 (YYYY-MM-DD)
    const cfmtnYmd = sp.get('cfmtnYmd');
    
    if (!cfmtnYmd || !isValidYmd(cfmtnYmd)) {
      return NextResponse.json(
        { error: 'cfmtnYmd(YYYY-MM-DD) 파라미터가 필요합니다.' },
        { status: 400 }
      );
    }
    
    // 페이지네이션
    const pageNo = sp.get('pageNo') ?? '1';
    const numOfRows = sp.get('numOfRows') ?? '50';
    
    // 분류 코드 필터 (선택)
    const lclsfCd = sp.get('lclsfCd'); // 대분류
    const mclsfCd = sp.get('mclsfCd'); // 중분류
    const sclsfCd = sp.get('sclsfCd'); // 소분류
    
    // 서비스 키 (Decoding 키 사용 권장)
    const SERVICE_KEY = process.env.KAT_ONLINE_SERVICE_KEY;
    
    if (!SERVICE_KEY) {
      return NextResponse.json(
        {
          error: 'KAT_ONLINE_SERVICE_KEY가 설정되지 않았습니다. .env 파일을 확인해주세요.',
          code: 'KAT_ONLINE_KEY_MISSING',
        },
        { status: 500 }
      );
    }
    
    // URL 구성 (이중 인코딩 방지: serviceKey만 별도 처리)
    // 방법: encodeURIComponent로 한 번만 인코딩
    const params = new URLSearchParams({
      returnType: 'json',
      pageNo,
      numOfRows,
      'cond[cfmtn_ymd::EQ]': cfmtnYmd,
    });
    
    // 분류 필터 추가 (있는 경우만)
    if (lclsfCd) params.set('cond[onln_whsl_mrkt_lclsf_cd::EQ]', lclsfCd);
    if (mclsfCd) params.set('cond[onln_whsl_mrkt_mclsf_cd::EQ]', mclsfCd);
    if (sclsfCd) params.set('cond[onln_whsl_mrkt_sclsf_cd::EQ]', sclsfCd);
    
    // serviceKey는 별도로 인코딩 (이중 인코딩 방지)
    const url = `${BASE_URL}?serviceKey=${encodeURIComponent(SERVICE_KEY)}&${params.toString()}`;
    
    console.log(`[katOnline API] 거래정보 요청: ${cfmtnYmd}`);
    
    // 재시도 로직 추가
    const response = await retryAsync(
      () => fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-store', // 시세 데이터는 캐시하지 않음
      }),
      RETRY_PRESETS.normal
    );
    
    console.log(`[katOnline API] 응답 상태: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.error(`[katOnline API] 에러 응답:`, errorText.substring(0, 500));
      return NextResponse.json(
        { 
          error: `katOnline API 요청 실패: ${response.status}`, 
          code:
            response.status === 401 || response.status === 403
              ? 'KAT_ONLINE_UNAUTHORIZED'
              : 'KAT_ONLINE_HTTP_ERROR',
          details: errorText.substring(0, 200),
        },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    
    // API 응답 에러 체크 (resultCode: '0' 또는 '00' 모두 정상)
    const resultCode = data.response?.header?.resultCode;
    if (resultCode !== '00' && resultCode !== '0') {
      console.error('[katOnline API] 에러:', data.response?.header);
      return NextResponse.json(
        { error: data.response?.header?.resultMsg || 'API 요청 실패' },
        { status: 400 }
      );
    }
    
    const totalCount = data.response?.body?.totalCount || 0;
    console.log(`[katOnline API] 성공: ${totalCount}건`);
    
    // 단위 판별용: 첫 번째 아이템 로깅
    if (data.response?.body?.items?.item && data.response.body.items.item.length > 0) {
      const firstItem = data.response.body.items.item[0];
      console.log(`[katOnline API] 첫 번째 아이템 (단위 확인용):`, {
        품목명: firstItem.onln_whsl_mrkt_sclsf_nm,
        확정수량: firstItem.cfmtn_qty,
        평균가: firstItem.avgprc,
        최소가: firstItem.lwprc,
        최고가: firstItem.hgprc,
        날짜: firstItem.cfmtn_ymd,
      });
      
      // 수량 분석 (소수점 여부로 단위 추정)
      const qty = parseFloat(firstItem.cfmtn_qty);
      const hasDecimal = firstItem.cfmtn_qty.includes('.');
      console.log(`[katOnline API] 수량 분석: ${qty} (소수점: ${hasDecimal ? 'O → kg 가능성 높음' : 'X → 박스/묶음 가능성'})`);
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('[katOnline API] 예외 발생:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '알 수 없는 오류' },
      { status: 500 }
    );
  }
}
