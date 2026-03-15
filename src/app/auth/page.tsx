'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ChefHat, Mail, Lock, ArrowLeft, Loader2 } from 'lucide-react';
import { z } from 'zod';

const emailSchema = z.string().trim().email({ message: "올바른 이메일을 입력해주세요" });
const passwordSchema = z.string().min(6, { message: "비밀번호는 6자 이상이어야 합니다" });

type AuthMode = 'login' | 'signup' | 'forgot' | 'reset';

function AuthContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecoveryReady, setIsRecoveryReady] = useState(false);
  const [isRecoveryChecking, setIsRecoveryChecking] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isKakaoLoading, setIsKakaoLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string }>({});
  
  const { user, signIn, signUp, signInWithGoogle, signInWithKakao, resetPassword, updatePassword, signOut } = useAuth();
  const { toast } = useToast();

  /**
   * returnTo 파라미터로 로그인 후 돌아갈 경로를 지정합니다.
   * - 보안: 외부 URL(https://...)로 보내는 오픈 리다이렉트 방지를 위해
   *   반드시 "/"로 시작하는 내부 경로만 허용합니다.
   * - 안정성: /auth 자체로 되돌아가면 루프가 될 수 있어 "/"로 강제합니다.
   */
  const getSafeReturnTo = (value: string | null): string => {
    if (!value) return '/';
    if (!value.startsWith('/')) return '/';
    if (value.startsWith('//')) return '/';
    if (value.startsWith('/auth')) return '/';
    return value;
  };

  const returnTo = getSafeReturnTo(searchParams.get('returnTo'));
  const modeParam = searchParams.get('mode');

  useEffect(() => {
    /**
     * 비밀번호 재설정(=recovery) 링크 대응:
     * - Supabase 설정/버전에 따라 URL에 `code=...`(PKCE) 또는 hash 토큰이 포함됩니다.
     * - PKCE(`code`) 케이스에서는 `exchangeCodeForSession`을 호출해야 세션이 생기고,
     *   그 뒤에야 `updateUser({ password })`가 정상 동작합니다.
     *
     * 여기서 세션을 확실히 준비해두고, 준비 전에는 "비밀번호 재설정" 버튼을 막습니다.
     */
    const ensureRecoverySession = async () => {
      if (modeParam !== 'reset') {
        setIsRecoveryReady(false);
        setIsRecoveryChecking(false);
        return;
      }

      setIsRecoveryChecking(true);
      try {
        const code = searchParams.get('code');
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            throw error;
          }
        }

        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (!data?.session) {
          setIsRecoveryReady(false);
          toast({
            title: "재설정 세션이 없습니다",
            description: "재설정 링크가 만료되었거나 잘못되었습니다. 메일에서 링크를 다시 눌러주세요.",
            variant: "destructive",
          });
          return;
        }

        setIsRecoveryReady(true);
      } catch (e: any) {
        setIsRecoveryReady(false);
        toast({
          title: "비밀번호 재설정 준비 실패",
          description: e?.message ?? "다시 시도해주세요. 문제가 지속되면 새 재설정 메일을 요청해주세요.",
          variant: "destructive",
        });
      } finally {
        setIsRecoveryChecking(false);
      }
    };

    ensureRecoverySession();
  }, [modeParam, searchParams, toast]);

  useEffect(() => {
    /**
     * 중요한 예외 처리:
     * - 비밀번호 재설정 링크(= Supabase recovery flow)로 들어오면,
     *   Supabase가 "임시 세션"을 만들어 user가 잡힐 수 있습니다.
     * - 이때 user가 있다고 해서 홈으로 보내버리면, 재설정 화면이 즉시 사라져 버립니다(현재 버그).
     *
     * 따라서 mode=reset 인 동안에는 자동 리다이렉트를 하지 않습니다.
     */
    if (user && modeParam !== 'reset') {
      router.push(returnTo);
    }
  }, [user, router, returnTo, modeParam]);

  useEffect(() => {
    // URL의 mode 파라미터와 화면 상태를 항상 동기화합니다.
    // (기존 버그: reset -> login으로 URL을 바꿔도 mode state가 reset에 머물러 UI가 그대로 남을 수 있음)
    if (modeParam === 'login') setMode('login');
    else if (modeParam === 'signup') setMode('signup');
    else if (modeParam === 'forgot') setMode('forgot');
    else if (modeParam === 'reset') setMode('reset');
    else setMode('login');
  }, [modeParam]);

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};
    
    // reset 모드에서는 이메일 입력 UI가 없으므로 이메일 검증을 건너뜁니다.
    // (기존 버그: reset 모드에서 email="" 때문에 항상 검증 실패 → 버튼 눌러도 "아무 일도 없음"처럼 보임)
    if (mode !== 'reset') {
      const emailResult = emailSchema.safeParse(email);
      if (!emailResult.success) {
        newErrors.email = emailResult.error.errors[0].message;
      }
    }

    if (mode !== 'forgot') {
      const passwordResult = passwordSchema.safeParse(password);
      if (!passwordResult.success) {
        newErrors.password = passwordResult.error.errors[0].message;
      }
    }

    if (mode === 'signup' || mode === 'reset') {
      if (password !== confirmPassword) {
        newErrors.confirmPassword = '비밀번호가 일치하지 않습니다';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // validateForm() 내부에서 필드별 에러 메시지를 화면에 표시합니다.
    // 여기서 추가 토스트까지 띄우면 "조건이 뭔데?"처럼 혼란을 줄 수 있어 토스트는 생략합니다.
    if (!validateForm()) return;
    
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast({
              title: "로그인 실패",
              description: "이메일 또는 비밀번호가 올바르지 않습니다.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "로그인 실패",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "로그인 성공",
            description: "환영합니다!",
          });
          router.push(returnTo);
        }
      } else if (mode === 'signup') {
        const { error } = await signUp(email, password);
        if (error) {
          if (error.message.includes('User already registered')) {
            toast({
              title: "회원가입 실패",
              description: "이미 가입된 이메일입니다. 로그인해주세요.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "회원가입 실패",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "회원가입 완료",
            description: "이메일 인증 후 로그인해주세요.",
          });
          setMode('login');
        }
      } else if (mode === 'forgot') {
        const { error } = await resetPassword(email);
        if (error) {
          toast({
            title: "오류",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "이메일 전송 완료",
            description: "비밀번호 재설정 링크가 이메일로 전송되었습니다.",
          });
          setMode('login');
        }
      } else if (mode === 'reset') {
        if (!isRecoveryReady) {
          toast({
            title: "재설정 세션 준비 중입니다",
            description: "잠시 후 다시 시도해주세요. 계속 안되면 재설정 메일을 다시 요청해주세요.",
            variant: "destructive",
          });
          return;
        }

        const { error } = await updatePassword(password);
        if (error) {
          toast({
            title: "오류",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "비밀번호 변경 완료",
            description: "새 비밀번호로 로그인해주세요.",
          });
          /**
           * Supabase recovery flow에서는 비밀번호 변경 직후에도 세션이 살아있어
           * 사용자가 "갑자기 로그인 되어버린 것"처럼 느낄 수 있습니다.
           * UX 요구사항(새 비밀번호로 다시 로그인)과 문구에 맞춰,
           * 변경 완료 후에는 로그아웃시킨 뒤 로그인 화면으로 보냅니다.
           */
          try {
            await signOut();
          } catch {
            // ignore
          }
          router.replace('/auth?mode=login');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        toast({
          title: "Google 로그인 실패",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleKakaoSignIn = async () => {
    setIsKakaoLoading(true);
    try {
      const { error } = await signInWithKakao();
      if (error) {
        toast({
          title: "카카오 로그인 실패",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setIsKakaoLoading(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'login': return '로그인';
      case 'signup': return '회원가입';
      case 'forgot': return '비밀번호 찾기';
      case 'reset': return '비밀번호 재설정';
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case 'login': return '계정에 로그인하여 식단을 관리하세요';
      case 'signup': return '새 계정을 만들어 시작하세요';
      case 'forgot': return '가입한 이메일을 입력하세요';
      case 'reset': return '새 비밀번호를 입력하세요';
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl shadow-card border border-border/50 overflow-hidden animate-fade-in">
          {/* 헤더 */}
          <div className="p-8 text-center border-b border-border/50 bg-secondary/30">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary shadow-soft mb-4">
              <ChefHat className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold mb-1">{getTitle()}</h1>
            <p className="text-sm text-muted-foreground">{getSubtitle()}</p>
          </div>

          {/* 폼 */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {mode !== 'reset' && (
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  이메일
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="h-12"
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>
            )}

            {mode !== 'forgot' && (
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                  비밀번호
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-12"
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  비밀번호는 6자 이상이어야 합니다.
                </p>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>
            )}

            {(mode === 'signup' || mode === 'reset') && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                  비밀번호 확인
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-12"
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  위 비밀번호와 동일하게 입력해주세요.
                </p>
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                )}
              </div>
            )}

            <Button type="submit" className="w-full h-12" disabled={isLoading || isGoogleLoading || isKakaoLoading}>
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                getTitle()
              )}
            </Button>

            {mode === 'reset' && !isRecoveryReady && (
              <p className="text-sm text-muted-foreground">
                {isRecoveryChecking ? '재설정 정보를 확인하는 중입니다...' : '재설정 링크를 확인해주세요(만료/오류 가능).'}
              </p>
            )}

            {/* Google 로그인 버튼 - 로그인/회원가입 모드에서만 표시 */}
            {(mode === 'login' || mode === 'signup') && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">또는</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 gap-3"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading || isGoogleLoading || isKakaoLoading}
                >
                  {isGoogleLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Google로 계속하기
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 gap-3 bg-[#FEE500] hover:bg-[#FEE500]/90 border-[#FEE500] text-[#191919]"
                  onClick={handleKakaoSignIn}
                  disabled={isLoading || isGoogleLoading || isKakaoLoading}
                >
                  {isKakaoLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 3C6.48 3 2 6.58 2 11c0 2.85 1.89 5.35 4.72 6.77-.15.53-.96 3.45-1 3.61 0 .06.02.12.07.16.05.04.11.05.17.03.55-.08 3.2-2.11 3.7-2.47.75.11 1.54.17 2.34.17 5.52 0 10-3.58 10-8S17.52 3 12 3z"/>
                      </svg>
                      카카오로 계속하기
                    </>
                  )}
                </Button>
              </>
            )}

            {/* 하단 링크들 */}
            <div className="space-y-3 text-center text-sm">
              {mode === 'login' && (
                <>
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    비밀번호를 잊으셨나요?
                  </button>
                  <div className="text-muted-foreground">
                    계정이 없으신가요?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('signup')}
                      className="text-primary font-medium hover:underline"
                    >
                      회원가입
                    </button>
                  </div>
                </>
              )}

              {mode === 'signup' && (
                <div className="text-muted-foreground">
                  이미 계정이 있으신가요?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-primary font-medium hover:underline"
                  >
                    로그인
                  </button>
                </div>
              )}

              {(mode === 'forgot' || mode === 'reset') && (
                <button
                  type="button"
                  onClick={() => {
                    // reset 링크로 들어온 경우 URL에 mode=reset이 남아있으면 다시 reset으로 돌아가므로 URL도 함께 정리합니다.
                    if (modeParam === 'reset') router.replace('/auth?mode=login');
                    else setMode('login');
                  }}
                  className="flex items-center justify-center gap-2 text-muted-foreground hover:text-primary transition-colors mx-auto"
                >
                  <ArrowLeft className="w-4 h-4" />
                  로그인으로 돌아가기
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function Auth() {
  // Next.js App Router에서 useSearchParams()는 CSR bailout이 발생할 수 있어
  // 페이지 레벨에서 Suspense로 감싸야 빌드(prerender) 에러가 발생하지 않습니다.
  return (
    <Suspense
      fallback={
        <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
          <div className="text-sm text-muted-foreground">로딩 중...</div>
        </div>
      }
    >
      <AuthContent />
    </Suspense>
  );
}





