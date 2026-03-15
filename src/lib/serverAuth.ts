import { createClient } from '@supabase/supabase-js';
import type { NextRequest } from 'next/server';
import type { Database } from '@/integrations/supabase/types';

/**
 * 서버(Route Handler)에서 Supabase 인증을 확인하고,
 * 같은 JWT로 RLS가 적용된 DB 작업까지 수행할 수 있게 도와주는 유틸입니다.
 *
 * 클라이언트에서 `Authorization: Bearer <access_token>` 헤더를 보내면:
 * - `requireUserAndClient()`가 토큰을 검증(auth.getUser)
 * - 검증된 토큰을 global header로 설정한 Supabase client를 반환
 */

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`환경변수 ${name} 이(가) 설정되지 않았습니다.`);
  }
  return value;
}

function getBearerToken(req: NextRequest): string | null {
  const auth = req.headers.get('authorization') ?? req.headers.get('Authorization');
  if (!auth) return null;
  const [type, token] = auth.split(' ');
  if (type?.toLowerCase() !== 'bearer' || !token) return null;
  return token.trim();
}

export async function requireUserAndClient(req: NextRequest) {
  const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL');
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    '';

  if (!supabaseAnonKey) {
    throw new Error('환경변수 NEXT_PUBLIC_SUPABASE_ANON_KEY 이(가) 설정되지 않았습니다.');
  }

  const token = getBearerToken(req);
  if (!token) {
    return { user: null, supabase: null, token: null };
  }

  // 토큰 검증용 클라이언트(Authorization 미주입)
  const authClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await authClient.auth.getUser(token);
  if (error || !data?.user) {
    return { user: null, supabase: null, token: null };
  }

  // RLS가 적용된 DB 작업용 클라이언트(Authorization 주입)
  const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });

  return { user: data.user, supabase, token };
}


