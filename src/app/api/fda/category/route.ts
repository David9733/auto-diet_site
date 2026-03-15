/**
 * FDA API 프록시 - 카테고리별 식재료 조회
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
      `fda-category:${clientId}`,
      SERVER_RATE_LIMIT_PRESETS.normal
    );
    
    if (!rateLimitResult.allowed && rateLimitResult.response) {
      return rateLimitResult.response;
    }
    
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const pageNo = searchParams.get('pageNo') || '1';
    const numOfRows = searchParams.get('numOfRows') || '100';
    
    if (!category) {
      return NextResponse.json(
        { error: '카테고리가 필요합니다.' },
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
      FOOD_CAT1_NM: category,  // 식품대분류명 파라미터
    });
    
    console.log(`[FDA API] 카테고리 조회: ${category}`);
    
    // 재시도 로직 추가
    const response = await retryAsync(
      () => fetch(`${url}?${params}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      }),
      RETRY_PRESETS.normal
    );
    
    if (!response.ok) {
      console.error(`[FDA API] 요청 실패: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: `FDA API 요청 실패: ${response.status}` },
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
    
    console.log(`[FDA API] 카테고리 조회 성공: ${data.body?.totalCount || 0}건`);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('[FDA API] 예외 발생:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '알 수 없는 오류' },
      { status: 500 }
    );
  }
}















