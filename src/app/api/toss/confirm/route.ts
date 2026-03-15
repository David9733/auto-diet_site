/**
 * 단건결제 - 결제 승인(confirm) API
 *
 * successUrl로 리다이렉트된 뒤, 클라이언트가 paymentKey/orderId/amount를 전달하면
 * 서버에서 토스 결제 승인 API(/v1/payments/confirm)를 호출하고,
 * 결과를 DB(payment_orders/payments)에 기록합니다.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireUserAndClient } from '@/lib/serverAuth';
import { tossPost } from '@/lib/tossServer';

export const runtime = 'nodejs';

type Body = {
  paymentKey: string;
  orderId: string;
  amount: number;
  testCode?: string; // 테스트 에러 재현용(원하면)
};

type TossPayment = {
  paymentKey: string;
  orderId: string;
  orderName: string;
  status: string; // 예: DONE
  method?: string; // 예: 카드
  requestedAt?: string;
  approvedAt?: string;
  vat?: number;
  suppliedAmount?: number;
  lastTransactionKey?: string;
};

export async function POST(req: NextRequest) {
  try {
    const { user, supabase } = await requireUserAndClient(req);
    if (!user || !supabase) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const body = (await req.json()) as Body;
    const paymentKey = String(body.paymentKey ?? '').trim();
    const orderId = String(body.orderId ?? '').trim();
    const amount = Number(body.amount);

    if (!paymentKey || !orderId) {
      return NextResponse.json({ error: 'paymentKey/orderId가 필요합니다.' }, { status: 400 });
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: 'amount가 올바르지 않습니다.' }, { status: 400 });
    }

    // DB에 저장해둔 주문을 찾아 금액 변조를 방지합니다.
    const { data: order, error: orderErr } = await supabase
      .from('payment_orders')
      .select('id, user_id, merchant_order_id, order_name, amount, status')
      .eq('merchant_order_id', orderId)
      .maybeSingle();

    if (orderErr) return NextResponse.json({ error: orderErr.message }, { status: 500 });
    if (!order || order.user_id !== user.id) {
      return NextResponse.json({ error: '주문을 찾을 수 없습니다.' }, { status: 404 });
    }
    if (order.amount !== amount) {
      return NextResponse.json(
        { error: '결제 금액이 일치하지 않습니다. 결제를 중단합니다.' },
        { status: 400 }
      );
    }

    // 토스 결제 승인(Confirm) API 호출
    const toss = await tossPost<TossPayment>(
      '/v1/payments/confirm',
      { paymentKey, orderId, amount },
      body.testCode ? { testCode: body.testCode } : undefined
    );

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

    return NextResponse.json({
      ok: true,
      paymentId: paymentRow.id,
      paymentKey: toss.paymentKey,
      orderId: toss.orderId,
      status: toss.status,
      orderName: toss.orderName,
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


