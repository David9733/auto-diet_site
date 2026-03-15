'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

/**
 * 단건결제 성공 리다이렉트 페이지
 *
 * 토스 결제창에서 결제가 완료되면 successUrl로 이동하면서
 * `paymentKey`, `orderId`, `amount`가 쿼리 파라미터로 전달됩니다.
 *
 * 이 페이지는 해당 값을 서버 `/api/toss/confirm`으로 전달해
 * 결제 승인 및 DB 기록을 완료합니다.
 */
function TestTossSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const paymentKey = searchParams.get('paymentKey');
    const orderId = searchParams.get('orderId');
    const amountStr = searchParams.get('amount');
    const amount = amountStr ? Number(amountStr) : NaN;

    async function run() {
      try {
        if (!session?.access_token) {
          throw new Error('로그인이 필요합니다.');
        }
        if (!paymentKey || !orderId || !Number.isFinite(amount)) {
          throw new Error('결제 결과 파라미터가 올바르지 않습니다.');
        }

        const res = await fetch('/api/toss/confirm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ paymentKey, orderId, amount }),
        });
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json?.error || '결제 승인 실패');
        }
        setResult(json);
      } catch (e) {
        toast({
          title: '결제 처리 실패',
          description: e instanceof Error ? e.message : '알 수 없는 오류',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }

    run();
  }, [searchParams, session?.access_token, toast]);

  return (
    <div className="mx-auto w-full max-w-3xl p-6 space-y-6">
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>결제 성공 처리</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              결제 승인 및 DB 기록 중...
            </div>
          ) : result ? (
            <div className="space-y-2 text-sm">
              <div>orderId: <span className="font-mono">{result.orderId}</span></div>
              <div>paymentKey: <span className="font-mono break-all">{result.paymentKey}</span></div>
              <div>status: <span className="font-mono">{result.status}</span></div>
              <div>orderName: {result.orderName}</div>
              <div>paymentId(DB): <span className="font-mono">{result.paymentId}</span></div>
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

export default function TestTossSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-3xl p-6">
          <div className="text-sm text-muted-foreground">로딩 중...</div>
        </div>
      }
    >
      <TestTossSuccessContent />
    </Suspense>
  );
}


