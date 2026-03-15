'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type SubscriptionRow = {
  id: string;
  plan_name: string;
  amount: number;
  currency: string;
  interval_unit: string;
  interval_count: number;
  status: string;
  created_at: string;
};

function SubscriptionSuccessContent() {
  const router = useRouter();
  const sp = useSearchParams();
  const { user, session, loading } = useAuth();
  const { toast } = useToast();

  const returnTo = useMemo(() => {
    const path = `/test-toss/subscription/success?${sp.toString()}`;
    return path.startsWith('/auth') ? '/test-toss' : path;
  }, [sp]);

  const subscriptionId = sp.get('subscriptionId');

  const [fetching, setFetching] = useState(true);
  const [sub, setSub] = useState<SubscriptionRow | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push(`/auth?returnTo=${encodeURIComponent(returnTo)}`);
      return;
    }
    if (!subscriptionId) {
      setFetching(false);
      return;
    }

    let cancelled = false;

    const run = async () => {
      setFetching(true);
      try {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('id, plan_name, amount, currency, interval_unit, interval_count, status, created_at')
          .eq('id', subscriptionId)
          .maybeSingle();

        if (cancelled) return;

        if (error) {
          toast({
            title: '구독 조회 실패',
            description: error.message,
            variant: 'destructive',
          });
          setSub(null);
          return;
        }
        setSub((data as any) ?? null);
      } finally {
        if (!cancelled) setFetching(false);
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [loading, router, subscriptionId, toast, user, returnTo]);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-3xl p-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          세션 확인 중...
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl p-6 space-y-6">
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>정기구독 등록 완료</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!subscriptionId ? (
            <div className="text-sm text-muted-foreground">
              subscriptionId가 없습니다. 구독 생성 페이지로 돌아가 다시 시도해 주세요.
            </div>
          ) : fetching ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              구독 정보 불러오는 중...
            </div>
          ) : sub ? (
            <div className="space-y-2 text-sm">
              <div>
                구독 ID: <span className="font-mono break-all">{sub.id}</span>
              </div>
              <div>구독명: {sub.plan_name}</div>
              <div>
                금액: {sub.amount.toLocaleString()} {sub.currency}
              </div>
              <div>
                주기: {sub.interval_count} {sub.interval_unit}
              </div>
              <div>상태: {sub.status}</div>
              <div>생성일: {new Date(sub.created_at).toLocaleString()}</div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              구독 정보를 찾지 못했습니다. RLS 정책상 본인 구독만 조회됩니다.
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button onClick={() => router.push('/test-toss')}>테스트 페이지로</Button>
            <Button
              variant="secondary"
              disabled={!session?.access_token || !subscriptionId}
              onClick={async () => {
                if (!session?.access_token || !subscriptionId) return;
                try {
                  const res = await fetch('/api/toss/billing/charge', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${session.access_token}`,
                    },
                    body: JSON.stringify({ subscriptionId }),
                  });
                  const json = await res.json();
                  if (!res.ok) throw new Error(json?.error || '청구 실패');
                  toast({ title: '구독 1회 청구 성공', description: `paymentKey: ${json.paymentKey}` });
                } catch (e) {
                  toast({
                    title: '구독 1회 청구 실패',
                    description: e instanceof Error ? e.message : '알 수 없는 오류',
                    variant: 'destructive',
                  });
                }
              }}
            >
              바로 1회 청구(테스트)
            </Button>
            <Button variant="outline" onClick={() => router.push('/')}>
              홈으로
            </Button>
          </div>

          <div className="text-xs text-muted-foreground">
            이 페이지는 테스트용입니다. 운영에서는 구독 생성/청구를 서버에서 더 엄격하게 검증하고, 스케줄러로 주기 결제를 호출하는 구조를 권장합니다.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SubscriptionSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-3xl p-6">
          <div className="text-sm text-muted-foreground">로딩 중...</div>
        </div>
      }
    >
      <SubscriptionSuccessContent />
    </Suspense>
  );
}


