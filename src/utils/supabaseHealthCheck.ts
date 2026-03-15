/**
 * Supabase 데이터베이스 연결 상태 확인 유틸리티
 */

import { supabase } from '@/integrations/supabase/client';

/**
 * 데이터베이스 연결 상태 확인
 * @returns Promise<boolean> - 연결 성공 여부
 */
export async function checkDatabaseConnection(): Promise<{
  connected: boolean;
  error?: string;
  details?: {
    url: string;
    authenticated: boolean;
    tablesAccessible: boolean;
  };
}> {
  try {
    // 1. Supabase 클라이언트 초기화 확인
    if (!supabase) {
      return {
        connected: false,
        error: 'Supabase 클라이언트가 초기화되지 않았습니다.',
      };
    }

    // 2. 현재 세션 확인
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    const isAuthenticated = !!sessionData?.session;

    // 3. 테이블 접근 테스트 (인증되지 않은 경우 RLS로 인해 빈 결과 반환)
    const { data: tablesData, error: tablesError } = await supabase
      .from('store_settings')
      .select('id')
      .limit(1);

    // 테이블 접근 가능 (에러가 없거나, RLS로 인한 빈 결과는 정상)
    const tablesAccessible = !tablesError || tablesError.code === 'PGRST116';

    // 환경변수에서 URL 가져오기 (Vite와 Next.js 모두 지원)
    const supabaseUrl = 
      process.env.NEXT_PUBLIC_SUPABASE_URL || 
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || 
      '';

    return {
      connected: true,
      details: {
        url: supabaseUrl,
        authenticated: isAuthenticated,
        tablesAccessible,
      },
    };
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
    };
  }
}

/**
 * 데이터베이스 스키마 확인
 * @returns 테이블 존재 여부
 */
export async function checkDatabaseSchema(): Promise<{
  hasStoreSetting: boolean;
  hasMealPlans: boolean;
  error?: string;
}> {
  try {
    // store_settings 테이블 확인
    const { error: storeError } = await supabase
      .from('store_settings')
      .select('id')
      .limit(1);

    // meal_plans 테이블 확인
    const { error: mealError } = await supabase
      .from('meal_plans')
      .select('id')
      .limit(1);

    return {
      hasStoreSetting: !storeError || storeError.code === 'PGRST116',
      hasMealPlans: !mealError || mealError.code === 'PGRST116',
    };
  } catch (error) {
    return {
      hasStoreSetting: false,
      hasMealPlans: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
    };
  }
}

/**
 * 개발 환경에서 데이터베이스 상태 로깅
 */
export async function logDatabaseStatus(): Promise<void> {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  console.log('🔍 Supabase 연결 상태 확인 중...');

  const connection = await checkDatabaseConnection();
  const schema = await checkDatabaseSchema();

  console.log('📊 데이터베이스 연결:', connection.connected ? '✅' : '❌');

  if (connection.details) {
    console.log('  • URL:', connection.details.url);
    console.log('  • 인증됨:', connection.details.authenticated ? '✅' : '❌');
    console.log('  • 테이블 접근:', connection.details.tablesAccessible ? '✅' : '❌');
  }

  if (connection.error) {
    console.error('  • 오류:', connection.error);
  }

  console.log('📋 스키마 확인:');
  console.log('  • store_settings:', schema.hasStoreSetting ? '✅' : '❌');
  console.log('  • meal_plans:', schema.hasMealPlans ? '✅' : '❌');

  if (schema.error) {
    console.error('  • 오류:', schema.error);
  }
}
