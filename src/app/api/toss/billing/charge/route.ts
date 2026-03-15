/**
 * 정기결제(빌링) - 빌링키로 결제 승인(자동결제 승인) API
 *
 * - DB에 저장된 billing_keys를 기준으로 customerKey/billingKey를 가져옵니다.
 * - 토스 카드 자동결제 승인 API를 호출해 결제를 발생시키고,
 *   결과를 payment_orders/payments/subscription_charges에 기록합니다.
 *
 * 참고: 토스는 "스케줄링"을 제공하지 않으므로, 운영에서는 크론/큐로 이 API를 주기적으로 호출하는 구조가 됩니다.
 */

import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { requireUserAndClient } from '@/lib/serverAuth';
import { tossPost } from '@/lib/tossServer';

export const runtime = 'nodejs';

type Body =
  | { subscriptionId: string }
  | { billingKeyId: string; amount: number; orderName: string };

type TossBillingPayment = {
  paymentKey: string;
  orderId: string;
  orderName: string;
  status: string; // 예: DONE
  method?: string;
  requestedAt?: string;
  approvedAt?: string;
  vat?: number;
  suppliedAmount?: number;
  lastTransactionKey?: string;
  currency?: string;
  totalAmount?: number;
};

function makeOrderId(): string {
  return `sub_${randomBytes(16).toString('base64url')}`;
}

export async function POST(req: NextRequest) {
  try {
    const { user, supabase } = await requireUserAndClient(req);
    if (!user || !supabase) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const body = (await req.json()) as Body;

    let subscriptionId: string | null = null;
    let billingKeyId: string;
    let amount: number;
    let orderName: string;

    if ('subscriptionId' in body) {
      subscriptionId = String(body.subscriptionId ?? '').trim();
      if (!subscriptionId) {
        return NextResponse.json({ error: 'subscriptionId가 필요합니다.' }, { status: 400 });
      }

      const { data: sub, error: subErr } = await supabase
        .from('subscriptions')
        .select('id, user_id, billing_key_id, plan_name, amount, currency, status')
        .eq('id', subscriptionId)
        .maybeSingle();

      if (subErr) return NextResponse.json({ error: subErr.message }, { status: 500 });
      if (!sub || sub.user_id !== user.id) {
        return NextResponse.json({ error: '구독을 찾을 수 없습니다.' }, { status: 404 });
      }
      if (sub.status !== 'active') {
        return NextResponse.json({ error: '활성 구독만 결제할 수 있습니다.' }, { status: 400 });
      }

      billingKeyId = sub.billing_key_id;
      amount = sub.amount;
      orderName = sub.plan_name;
    } else {
      billingKeyId = String(body.billingKeyId ?? '').trim();
      amount = Number((body as any).amount);
      orderName = String((body as any).orderName ?? '').trim();

      if (!billingKeyId || !orderName) {
        return NextResponse.json({ error: 'billingKeyId/orderName이 필요합니다.' }, { status: 400 });
      }
      if (!Number.isFinite(amount) || amount <= 0) {
        return NextResponse.json({ error: 'amount는 1 이상이어야 합니다.' }, { status: 400 });
      }
    }

    const { data: bk, error: bkErr } = await supabase
      .from('billing_keys')
      .select('id, user_id, customer_key, billing_key, status')
      .eq('id', billingKeyId)
      .maybeSingle();

    if (bkErr) return NextResponse.json({ error: bkErr.message }, { status: 500 });
    if (!bk || bk.user_id !== user.id) {
      return NextResponse.json({ error: '빌링키를 찾을 수 없습니다.' }, { status: 404 });
    }
    if (bk.status !== 'active') {
      return NextResponse.json({ error: '활성 빌링키만 결제할 수 있습니다.' }, { status: 400 });
    }

    const orderId = makeOrderId();

    // 주문 레코드 생성
    const { data: order, error: ordErr } = await supabase
      .from('payment_orders')
      .insert({
        user_id: user.id,
        merchant_order_id: orderId,
        order_name: orderName,
        amount,
        currency: 'KRW',
        status: 'ready',
        metadata: subscriptionId ? { subscriptionId, type: 'billing' } : { type: 'billing' },
      })
      .select('id')
      .single();

    if (ordErr) return NextResponse.json({ error: ordErr.message }, { status: 500 });

    // 토스 자동결제 승인 API 호출 (billingKey는 path 파라미터)
    const toss = await tossPost<TossBillingPayment>(`/v1/billing/${encodeURIComponent(bk.billing_key)}`, {
      customerKey: bk.customer_key,
      amount,
      orderId,
      orderName,
    });

    // 결제 레코드 저장
    const { data: paymentRow, error: payErr } = await supabase
      .from('payments')
      .insert({
        user_id: user.id,
        order_id: order.id,
        toss_payment_key: toss.paymentKey,
        toss_transaction_id: toss.lastTransactionKey ?? null,
        status: 'approved',
        method: toss.method ?? null,
        requested_at: toss.requestedAt ?? null,
        approved_at: toss.approvedAt ?? null,
        vat: toss.vat ?? null,
        supplied_amount: toss.suppliedAmount ?? null,
        raw: toss as any,
      })
      .select('id')
      .single();

    if (payErr) return NextResponse.json({ error: payErr.message }, { status: 500 });

    // 주문 상태 갱신
    const { error: updErr } = await supabase
      .from('payment_orders')
      .update({ status: 'paid' })
      .eq('id', order.id);
    if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });

    // 구독 결제 이력 저장(선택)
    if (subscriptionId) {
      const { error: chErr } = await supabase.from('subscription_charges').insert({
        user_id: user.id,
        subscription_id: subscriptionId,
        payment_id: paymentRow.id,
        amount,
        status: 'approved',
        requested_at: toss.requestedAt ?? null,
        approved_at: toss.approvedAt ?? null,
        raw: toss as any,
      });
      if (chErr) return NextResponse.json({ error: chErr.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      orderId,
      paymentKey: toss.paymentKey,
      status: toss.status,
      paymentId: paymentRow.id,
      subscriptionId,
    });
  } catch (e) {
    const status = (e as any)?.status;
    const code = (e as any)?.code;
    return NextResponse.json(
      {
        error: e instanceof Error ? e.message : '알 수 없는 오류',
        code,
      },
      { status: typeof status === 'number' ? status : 500 }
    );
  }
}


