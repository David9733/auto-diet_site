/**
 * 단건결제 - 주문 생성 API
 *
 * 클라이언트에서 결제창(requestPayment)을 띄우기 전에,
 * 서버(DB)에 orderId/amount/orderName을 저장해서
 * 결제 과정에서 금액이 변조되지 않았는지 검증할 수 있게 합니다.
 */

import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { requireUserAndClient } from '@/lib/serverAuth';

export const runtime = 'nodejs';

type Body = {
  orderName: string;
  amount: number;
  metadata?: Record<string, any>;
};

function makeOrderId(): string {
  // 토스 orderId 규칙: 6~64자, 영문/숫자/특수문자(- _ =) 허용
  // base64url은 -,_만 사용하므로 안전합니다.
  return `ord_${randomBytes(16).toString('base64url')}`; // 길이 약 26자
}

export async function POST(req: NextRequest) {
  try {
    const { user, supabase } = await requireUserAndClient(req);
    if (!user || !supabase) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const body = (await req.json()) as Body;
    const orderName = String(body.orderName ?? '').trim();
    const amount = Number(body.amount);

    if (!orderName) {
      return NextResponse.json({ error: 'orderName이 필요합니다.' }, { status: 400 });
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: 'amount는 1 이상이어야 합니다.' }, { status: 400 });
    }

    const orderId = makeOrderId();

    const { data, error } = await supabase
      .from('payment_orders')
      .insert({
        user_id: user.id,
        merchant_order_id: orderId,
        order_name: orderName,
        amount,
        currency: 'KRW',
        status: 'ready',
        metadata: body.metadata ?? {},
      })
      .select('id, merchant_order_id, order_name, amount, currency, status')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      orderId: data.merchant_order_id,
      orderName: data.order_name,
      amount: data.amount,
      currency: data.currency,
      status: data.status,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : '알 수 없는 오류' },
      { status: 500 }
    );
  }
}


