'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

/**
 * 테스트 전용 토스페이먼츠 개발 페이지
 *
 * - 기존 화면/플로우에 영향을 주지 않도록 별도 라우트로 격리합니다.
 * - 결제 기능(단건/정기)은 다음 단계에서 추가하고, 지금은 인증과 DB 설계를 위한 기반 화면만 제공합니다.
 */
export default function TestTossPaymentsPage() {
  const router = useRouter();
  const { user, session, loading, signOut } = useAuth();
  const { toast } = useToast();

  const returnTo = '/test-toss';
  const authUrl = useMemo(() => `/auth?returnTo=${encodeURIComponent(returnTo)}`, []);

  const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY ?? '';

  const [orderName, setOrderName] = useState('테스트 결제');
  const [amount, setAmount] = useState<number>(1000);
  const [payLoading, setPayLoading] = useState(false);

  const [billingLoading, setBillingLoading] = useState(false);
  const [chargeLoading, setChargeLoading] = useState(false);
  const [subCreating, setSubCreating] = useState(false);
  const [billingKeys, setBillingKeys] = useState<
    Array<{ id: string; customer_key: string; billing_key: string; card_company: string | null; created_at: string }>
  >([]);
  const [selectedBillingKeyId, setSelectedBillingKeyId] = useState<string>('');

  const [planName, setPlanName] = useState('테스트 구독');
  const [subAmount, setSubAmount] = useState<number>(4900);
  const [subscriptions, setSubscriptions] = useState<
    Array<{ id: string; plan_name: string; amount: number; status: string; created_at: string }>
  >([]);
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState<string>('');

  useEffect(() => {
    // 로그인하지 않은 상태면 /auth로 유도합니다.
    // 자동으로 밀어버리면(redirect) 사용자가 맥락을 잃을 수 있어 안내 UI를 먼저 보여줍니다.
  }, []);

  const reloadBillingKeys = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('billing_keys')
      .select('id, customer_key, billing_key, card_company, created_at')
      .order('created_at', { ascending: false });
    const list = (data as any) ?? [];
    setBillingKeys(list);
    if (!selectedBillingKeyId && list.length > 0) {
      setSelectedBillingKeyId(list[0].id);
    }
  };

  const reloadSubscriptions = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('subscriptions')
      .select('id, plan_name, amount, status, created_at')
      .order('created_at', { ascending: false });
    const list = (data as any) ?? [];
    setSubscriptions(list);
    if (!selectedSubscriptionId && list.length > 0) {
      setSelectedSubscriptionId(list[0].id);
    }
  };

  useEffect(() => {
    // 로그인 상태면 내 빌링키 목록을 불러옵니다(RLS로 사용자 데이터만 조회됨)
    if (!user) return;
    void reloadBillingKeys();
    void reloadSubscriptions();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          세션 확인 중...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto w-full max-w-3xl p-6 space-y-6">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>테스트 결제 구역 (토스페이먼츠)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              이 페이지는 정기결제/구독결제 개발을 위한 테스트 전용 구역입니다.
              결제 관련 데이터는 사용자 단위로 분리 저장되므로, 먼저 로그인해 주세요.
            </p>
            <div className="flex gap-2">
              <Button onClick={() => router.push(authUrl)}>로그인/회원가입</Button>
              <Button variant="outline" onClick={() => router.push('/')}>
                홈으로
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl p-6 space-y-6">
      {/* 토스페이먼츠 SDK (결제창/빌링) */}
      <Script src="https://js.tosspayments.com/v2/standard" strategy="afterInteractive" />

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>테스트 결제 구역 (토스페이먼츠)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm">
            <div className="text-muted-foreground">로그인 사용자</div>
            <div className="font-medium">{user.email ?? user.id}</div>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <Button
              variant="outline"
              onClick={async () => {
                await signOut();
                // 로그아웃 후에는 로그인 화면이 아니라 소개(메인) 페이지로 이동
                router.push('/');
              }}
            >
              로그아웃
            </Button>
            <Separator orientation="vertical" className="h-10" />
            <div className="text-xs text-muted-foreground">
              클라이언트 키는 <code>NEXT_PUBLIC_TOSS_CLIENT_KEY</code> 에서 읽습니다.
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 단건결제(결제창) */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>단건결제 (기존 결제창, SDK v2)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="orderName">주문명</Label>
              <Input
                id="orderName"
                value={orderName}
                onChange={(e) => setOrderName(e.target.value)}
                placeholder="예: 토스 프라임 구독"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">금액(원)</Label>
              <Input
                id="amount"
                type="number"
                min={1}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
              />
            </div>
          </div>

          <Button
            disabled={payLoading}
            onClick={async () => {
              if (!session?.access_token) {
                toast({ title: '로그인이 필요합니다.' });
                router.push(authUrl);
                return;
              }
              if (!clientKey) {
                toast({
                  title: '환경변수 누락',
                  description: 'NEXT_PUBLIC_TOSS_CLIENT_KEY 를 설정해 주세요.',
                  variant: 'destructive',
                });
                return;
              }
              if (!(window as any).TossPayments) {
                toast({
                  title: 'SDK 로딩 중',
                  description: '잠시 후 다시 시도해 주세요. (토스 SDK가 아직 로딩되지 않았습니다)',
                });
                return;
              }

              setPayLoading(true);
              try {
                // 1) 서버에 주문 생성(금액 변조 방지용)
                const orderRes = await fetch('/api/toss/order', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session.access_token}`,
                  },
                  body: JSON.stringify({ orderName, amount }),
                });
                const orderJson = await orderRes.json();
                if (!orderRes.ok) {
                  throw new Error(orderJson?.error || '주문 생성 실패');
                }

                const orderId = orderJson.orderId as string;

                // 2) 결제창 띄우기 (Redirect 방식)
                const tossPayments = (window as any).TossPayments(clientKey);
                const payment = tossPayments.payment({ customerKey: user.id });

                await payment.requestPayment({
                  method: 'CARD',
                  amount: { currency: 'KRW', value: amount },
                  orderId,
                  orderName,
                  successUrl: `${window.location.origin}/test-toss/success`,
                  failUrl: `${window.location.origin}/test-toss/fail`,
                  customerEmail: user.email ?? undefined,
                  customerName: user.email ? user.email.split('@')[0] : '사용자',
                  card: {
                    useEscrow: false,
                    useCardPoint: false,
                    useAppCardOnly: false,
                  },
                });
              } catch (err) {
                toast({
                  title: '결제 요청 실패',
                  description: err instanceof Error ? err.message : '알 수 없는 오류',
                  variant: 'destructive',
                });
              } finally {
                setPayLoading(false);
              }
            }}
          >
            {payLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : '카드 결제하기(결제창)'}
          </Button>

          <p className="text-sm text-muted-foreground">
            흐름: 주문 생성(서버) → 결제창 요청(SDK) → successUrl에서 결제 승인(confirm API) → DB 기록
          </p>
        </CardContent>
      </Card>

      {/* 자동결제(빌링키) */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>정기결제 준비 (빌링키 발급: requestBillingAuth)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <Button
            variant="secondary"
            disabled={billingLoading}
            onClick={async () => {
              if (!session?.access_token) {
                toast({ title: '로그인이 필요합니다.' });
                router.push(authUrl);
                return;
              }
              if (!clientKey) {
                toast({
                  title: '환경변수 누락',
                  description: 'NEXT_PUBLIC_TOSS_CLIENT_KEY 를 설정해 주세요.',
                  variant: 'destructive',
                });
                return;
              }
              if (!(window as any).TossPayments) {
                toast({
                  title: 'SDK 로딩 중',
                  description: '잠시 후 다시 시도해 주세요. (토스 SDK가 아직 로딩되지 않았습니다)',
                });
                return;
              }

              setBillingLoading(true);
              try {
                // 문서 흐름: payment.requestBillingAuth → successUrl에 customerKey/authKey 전달
                const tossPayments = (window as any).TossPayments(clientKey);
                const payment = tossPayments.payment({ customerKey: user.id });

                await payment.requestBillingAuth({
                  method: 'CARD',
                  successUrl: `${window.location.origin}/test-toss/billing/success`,
                  failUrl: `${window.location.origin}/test-toss/billing/fail`,
                  customerEmail: user.email ?? undefined,
                  customerName: user.email ? user.email.split('@')[0] : '사용자',
                });
              } catch (err) {
                toast({
                  title: '카드 등록 요청 실패',
                  description: err instanceof Error ? err.message : '알 수 없는 오류',
                  variant: 'destructive',
                });
              } finally {
                setBillingLoading(false);
              }
            }}
          >
            {billingLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : '카드 등록하기(빌링)'}
          </Button>

          <div className="space-y-2">
            <div className="text-sm font-medium">내 빌링키 목록</div>
            {billingKeys.length === 0 ? (
              <div className="text-sm text-muted-foreground">아직 발급된 빌링키가 없습니다.</div>
            ) : (
              <div className="space-y-2">
                {billingKeys.map((k) => (
                  <div key={k.id} className="rounded-md border border-border/60 p-3 text-sm">
                    <div className="text-muted-foreground">billingKey(마스킹 없이 저장됨: 서버 DB)</div>
                    <div className="font-mono break-all">{k.billing_key}</div>
                    <div className="mt-2 grid gap-1 text-xs text-muted-foreground">
                      <div>cardCompany: {k.card_company ?? '-'}</div>
                      <div>createdAt: {new Date(k.created_at).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => {
                void reloadBillingKeys();
                void reloadSubscriptions();
              }}
            >
              목록 새로고침
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            카드 등록 성공 시 `/test-toss/billing/success`에서 authKey/customerKey로 빌링키 발급 API를 호출하고,
            결과를 DB의 `billing_keys` 테이블에 저장합니다.
          </p>
        </CardContent>
      </Card>

      {/* 구독 생성 + 1회 청구(테스트) */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>정기결제 테스트 (구독 생성 + 1회 청구)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {billingKeys.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              먼저 위에서 빌링키(카드 등록)를 발급해야 구독 결제를 테스트할 수 있습니다.
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>사용할 빌링키</Label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                    value={selectedBillingKeyId}
                    onChange={(e) => setSelectedBillingKeyId(e.target.value)}
                  >
                    {billingKeys.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.card_company ?? 'CARD'} · {k.id.slice(0, 8)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>구독명</Label>
                  <Input value={planName} onChange={(e) => setPlanName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>구독 금액(원)</Label>
                  <Input
                    type="number"
                    min={1}
                    value={subAmount}
                    onChange={(e) => setSubAmount(Number(e.target.value))}
                  />
                </div>
              </div>

              <Button
                disabled={subCreating}
                onClick={async () => {
                  if (!user) return;
                  if (!selectedBillingKeyId) {
                    toast({ title: '빌링키를 선택해 주세요.' });
                    return;
                  }
                  if (!planName.trim()) {
                    toast({ title: '구독명을 입력해 주세요.' });
                    return;
                  }
                  if (!Number.isFinite(subAmount) || subAmount <= 0) {
                    toast({ title: '구독 금액이 올바르지 않습니다.' });
                    return;
                  }

                  setSubCreating(true);
                  try {
                    const { data, error } = await supabase
                      .from('subscriptions')
                      .insert({
                        user_id: user.id,
                        billing_key_id: selectedBillingKeyId,
                        plan_name: planName.trim(),
                        amount: subAmount,
                        currency: 'KRW',
                        interval_unit: 'month',
                        interval_count: 1,
                        status: 'active',
                      })
                      .select('id')
                      .single();

                    if (error) throw error;

                    toast({ title: '구독 생성 완료' });
                    await reloadSubscriptions();

                    if (data?.id) {
                      router.push(`/test-toss/subscription/success?subscriptionId=${encodeURIComponent(data.id)}`);
                    }
                  } catch (e) {
                    toast({
                      title: '구독 생성 실패',
                      description: e instanceof Error ? e.message : '알 수 없는 오류',
                      variant: 'destructive',
                    });
                  } finally {
                    setSubCreating(false);
                  }
                }}
              >
                {subCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : '구독 생성'}
              </Button>

              <Separator />

              <div className="space-y-2">
                <div className="text-sm font-medium">내 구독 목록</div>
                {subscriptions.length === 0 ? (
                  <div className="text-sm text-muted-foreground">아직 생성된 구독이 없습니다.</div>
                ) : (
                  <div className="space-y-2">
                    <select
                      className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                      value={selectedSubscriptionId}
                      onChange={(e) => setSelectedSubscriptionId(e.target.value)}
                    >
                      {subscriptions.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.plan_name} · {s.amount.toLocaleString()}원 · {s.status}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  disabled={chargeLoading || !selectedSubscriptionId}
                  onClick={async () => {
                    if (!session?.access_token) {
                      toast({ title: '로그인이 필요합니다.' });
                      router.push(authUrl);
                      return;
                    }
                    if (!selectedSubscriptionId) return;

                    setChargeLoading(true);
                    try {
                      const res = await fetch('/api/toss/billing/charge', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          Authorization: `Bearer ${session.access_token}`,
                        },
                        body: JSON.stringify({ subscriptionId: selectedSubscriptionId }),
                      });
                      const json = await res.json();
                      if (!res.ok) throw new Error(json?.error || '청구 실패');
                      toast({ title: '청구 성공', description: `paymentKey: ${json.paymentKey}` });
                    } catch (e) {
                      toast({
                        title: '청구 실패',
                        description: e instanceof Error ? e.message : '알 수 없는 오류',
                        variant: 'destructive',
                      });
                    } finally {
                      setChargeLoading(false);
                    }
                  }}
                >
                  {chargeLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : '구독 1회 청구(테스트)'}
                </Button>
              </div>

              <p className="text-sm text-muted-foreground">
                이 버튼은 서버에서 토스 자동결제 승인 API를 호출해서 실제 결제(테스트 승인)를 발생시키고,
                DB에 주문/결제/구독청구 이력을 남깁니다.
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


