'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

/**
 * 빌링(카드 등록) 성공 리다이렉트 페이지
 *
 * requestBillingAuth() 성공 시 successUrl로 이동하며
 * `customerKey`, `authKey` 쿼리 파라미터가 전달됩니다.
 * 이 페이지는 authKey를 서버로 보내 billingKey를 발급/저장합니다.
 */
function TestTossBillingSuccessContent() {
  const router = useRouter();
  const sp = useSearchParams();
  const { session, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<any>(null);
  const [authMissing, setAuthMissing] = useState(false);

  useEffect(() => {
    const customerKey = sp.get('customerKey');
    const authKey = sp.get('authKey');

    async function run() {
      try {
        // 로그인 세션이 초기 로딩 중일 수 있으니, 로딩이 끝날 때까지 기다립니다.
        if (authLoading) return;

        if (!session?.access_token) {
          // 로그인 상태가 아니면 토스트 대신 안내 UI를 보여줍니다.
          setAuthMissing(true);
          return;
        }
        if (!customerKey || !authKey) {
          throw new Error('customerKey/authKey가 없습니다.');
        }

        // 개발 모드(StrictMode) / 새로고침 등으로 동일 authKey가 중복 처리되는 것을 방지합니다.
        // authKey는 일회성 키라서 같은 값으로 두 번 발급 요청하면 실패할 수 있습니다.
        const storageKey = `toss.billing.issue.done:${customerKey}:${authKey}`;
        try {
          if (typeof window !== 'undefined') {
            const cached = window.sessionStorage.getItem(storageKey);
            if (cached) {
              setResult(JSON.parse(cached));
              return;
            }
          }
        } catch {
          // sessionStorage가 막힌 환경일 수 있어 무시
        }

        const res = await fetch('/api/toss/billing/issue', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ customerKey, authKey }),
        });
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json?.error || '빌링키 발급 실패');
        }
        setResult(json);

        try {
          if (typeof window !== 'undefined') {
            window.sessionStorage.setItem(storageKey, JSON.stringify(json));
          }
        } catch {
          // 무시
        }
      } catch (e) {
        toast({
          title: '빌링키 처리 실패',
          description: e instanceof Error ? e.message : '알 수 없는 오류',
          variant: 'destructive',
        });
      } finally {
        if (!authLoading) setLoading(false);
      }
    }

    run();
  }, [authLoading, sp, session?.access_token, toast]);

  return (
    <div className="mx-auto w-full max-w-3xl p-6 space-y-6">
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>카드 등록 완료 (빌링키 저장)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              빌링키 발급/저장 중...
            </div>
          ) : authMissing ? (
            <div className="space-y-3 text-sm">
              <div className="text-muted-foreground">
                로그인 세션을 불러오지 못했습니다. 로그인 후 다시 시도해 주세요.
              </div>
              <Button
                onClick={() =>
                  router.push(`/auth?returnTo=${encodeURIComponent(`/test-toss/billing/success?${sp.toString()}`)}`)
                }
              >
                로그인으로 이동
              </Button>
            </div>
          ) : result ? (
            <div className="space-y-2 text-sm">
              <div>billingKeyId(DB): <span className="font-mono">{result.billingKeyId}</span></div>
              <div>billingKey: <span className="font-mono break-all">{result.billingKey}</span></div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">처리 결과가 없습니다.</div>
          )}

          <div className="flex gap-2">
            <Button onClick={() => router.push('/test-toss')}>테스트 페이지로</Button>
            <Button variant="outline" onClick={() => router.push('/')}>홈으로</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function TestTossBillingSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-3xl p-6">
          <div className="text-sm text-muted-foreground">로딩 중...</div>
        </div>
      }
    >
      <TestTossBillingSuccessContent />
    </Suspense>
  );
}


