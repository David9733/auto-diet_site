import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signInWithGoogle = async () => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    return { data, error };
  };

  const signInWithKakao = async () => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: redirectUrl,
      },
    });
    return { data, error };
  };

  const signOut = async () => {
    /**
     * 로그아웃 안정화
     * - 카카오톡 인앱(WebView)에서 signOut 직후 세션/스토리지 반영이 늦거나 실패하는 케이스가 있어
     *   "서버 로그아웃" + "로컬 세션 강제 정리" + "상태 즉시 null" 조합으로 방어합니다.
     */
    let firstError: unknown = null;

    // 1) 기본 signOut(서버 revoke + 로컬 정리까지 포함하는 기본 동작)
    try {
      const { error } = await supabase.auth.signOut();
      if (error) firstError = error;
    } catch (e) {
      firstError = e;
    }

    // 2) 혹시 남아있을 수 있는 로컬 세션을 한 번 더 강제 제거(모바일 WebView 방어)
    try {
      await supabase.auth.signOut({ scope: 'local' });
    } catch {
      // ignore
    }

    // 3) 스토리지에 남은 Supabase 세션 키를 방어적으로 제거
    if (typeof window !== 'undefined') {
      const clearSupabaseKeys = (storage: Storage) => {
        try {
          const keys = Object.keys(storage);
          for (const k of keys) {
            // Supabase JS 기본 storageKey 패턴: sb-<project-ref>-auth-token
            if (k.startsWith('sb-') && k.endsWith('-auth-token')) storage.removeItem(k);
          }
        } catch {
          // ignore (스토리지 접근이 막힌 환경일 수 있음)
        }
      };

      try {
        clearSupabaseKeys(window.localStorage);
      } catch {
        // ignore
      }
      try {
        clearSupabaseKeys(window.sessionStorage);
      } catch {
        // ignore
      }
    }

    // 4) UI가 즉시 로그아웃 상태로 반영되도록 상태를 직접 초기화
    setSession(null);
    setUser(null);
    setLoading(false);

    return { error: firstError as any };
  };

  const resetPassword = async (email: string) => {
    const redirectUrl = `${window.location.origin}/auth?mode=reset`;
    
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    return { data, error };
  };

  const updatePassword = async (newPassword: string) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });
    return { data, error };
  };

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithKakao,
    signOut,
    resetPassword,
    updatePassword,
  };
}
