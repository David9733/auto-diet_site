/**
 * FDA API 프록시 - 식재료 검색
 * Next.js API Route (서버사이드)
 */

import { NextRequest, NextResponse } from 'next/server';
import { retryAsync, RETRY_PRESETS } from '@/utils/apiRetry';
import { getClientIdentifier, checkRateLimit, SERVER_RATE_LIMIT_PRESETS } from '@/utils/serverRateLimiter';

export async function GET(request: NextRequest) {
  try {
    // Rate Limit 체크
    const clientId = getClientIdentifier(request);
    const rateLimitResult = checkRateLimit(
      `fda-search:${clientId}`,
      SERVER_RATE_LIMIT_PRESETS.normal
    );
    
    if (!rateLimitResult.allowed && rateLimitResult.response) {
      return rateLimitResult.response;
    }
    
    const searchParams = request.nextUrl.searchParams;
    const keyword = searchParams.get('keyword');
    const pageNo = searchParams.get('pageNo') || '1';
    const numOfRows = searchParams.get('numOfRows') || '20';
    
    if (!keyword) {
      return NextResponse.json(
        { error: '검색 키워드가 필요합니다.' },
        { status: 400 }
      );
    }
    
    const API_KEY = process.env.FDA_API_KEY;
    
    if (!API_KEY) {
      return NextResponse.json(
        { error: 'FDA API 키가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }
    
    // FDA API 호출 (올바른 엔드포인트)
    const url = 'https://apis.data.go.kr/1471000/FoodNtrCpntDbInfo02/getFoodNtrCpntDbInq02';
    
    const params = new URLSearchParams({
      serviceKey: API_KEY,
      type: 'json',
      pageNo,
      numOfRows,
      FOOD_NM_KR: keyword,  // 식품명 파라미터
    });
    
    const fullUrl = `${url}?${params}`;
    console.log(`[FDA API] 검색 요청: ${keyword}`);
    console.log(`[FDA API] Full URL: ${fullUrl}`);
    
    // 재시도 로직 추가 (외부 공공 API는 불안정할 수 있음)
    const response = await retryAsync(
      () => fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      }),
      RETRY_PRESETS.normal // 외부 API는 일반 재시도
    );
    
    console.log(`[FDA API] 응답 상태: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[FDA API] 에러 응답: ${errorText.substring(0, 500)}`);
      return NextResponse.json(
        { error: `FDA API 요청 실패: ${response.status}`, details: errorText.substring(0, 200) },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    
    // API 응답 에러 체크
    if (data.header?.resultCode !== '00') {
      console.error('[FDA API] 에러:', data.header);
      return NextResponse.json(
        { error: data.header?.resultMsg || 'API 요청 실패' },
        { status: 400 }
      );
    }
    
    console.log(`[FDA API] 성공: ${data.body?.totalCount || 0}건`);
    
    // 첫 번째 아이템의 전체 구조 로깅
    if (data.body?.items && data.body.items.length > 0) {
      console.log(`[FDA API] 첫 번째 아이템 구조:`, JSON.stringify(data.body.items[0], null, 2));
    } else {
      console.log(`[FDA API] items 없음. body 구조:`, JSON.stringify(data.body, null, 2));
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('[FDA API] 예외 발생:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '알 수 없는 오류' },
      { status: 500 }
    );
  }
}















