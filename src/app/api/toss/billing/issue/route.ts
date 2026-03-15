/**
 * 정기결제(빌링) - 빌링키 발급 API
 *
 * 결제창에서 requestBillingAuth()가 성공하면
 * successUrl로 `customerKey`, `authKey`가 전달됩니다.
 * 이 값을 서버에서 토스 빌링키 발급 API로 교환해서 billingKey를 얻고,
 * DB(billing_keys)에 저장합니다.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireUserAndClient } from '@/lib/serverAuth';
import { tossPost } from '@/lib/tossServer';

export const runtime = 'nodejs';

type Body = {
  customerKey: string;
  authKey: string;
};

type TossBillingIssueResponse = {
  customerKey: string;
  billingKey: string;
  cardCompany?: string;
  cardNumber?: string;
  card?: {
    number?: string;
    cardType?: string;
  };
};

export async function POST(req: NextRequest) {
  try {
    const { user, supabase } = await requireUserAndClient(req);
    if (!user || !supabase) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const body = (await req.json()) as Body;
    const customerKey = String(body.customerKey ?? '').trim();
    const authKey = String(body.authKey ?? '').trim();

    if (!customerKey || !authKey) {
      return NextResponse.json({ error: 'customerKey/authKey가 필요합니다.' }, { status: 400 });
    }

    // 안전장치: 우리 서비스의 customerKey는 user.id(uuid)를 사용합니다.
    if (customerKey !== user.id) {
      return NextResponse.json({ error: 'customerKey가 올바르지 않습니다.' }, { status: 400 });
    }

    // 먼저 기존 billing_keys가 있는지 확인합니다.
    // (중복 호출/재시도 시 토스 쪽 authKey가 이미 소모되어 실패할 수 있으므로, DB에 이미 저장된 값이 있으면 재사용)
    const { data: existingBefore, error: exBeforeErr } = await supabase
      .from('billing_keys')
      .select('id, billing_key, created_at')
      .eq('customer_key', customerKey)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (exBeforeErr) return NextResponse.json({ error: exBeforeErr.message }, { status: 500 });

    /**
     * 문서 흐름(결제창 연동):
     * - successUrl로 받은 authKey/customerKey로 빌링키 발급 요청
     *
     * 주의:
     * - 토스 API 버전에 따라 엔드포인트/응답이 다를 수 있습니다.
     * - 일반적으로 /v1/billing/authorizations/issue 를 사용합니다.
     */
    let toss: TossBillingIssueResponse | null = null;
    try {
      toss = await tossPost<TossBillingIssueResponse>('/v1/billing/authorizations/issue', {
        customerKey,
        authKey,
      });
    } catch (e) {
      // authKey가 일회성이어서 중복 호출/새로고침 등으로 실패할 수 있습니다.
      // 이 경우 DB에 기존 billingKey가 있으면 "이미 처리됨"으로 성공 응답을 내려 UX를 안정화합니다.
      if (existingBefore?.id && existingBefore.billing_key) {
        return NextResponse.json({
          ok: true,
          billingKeyId: existingBefore.id,
          billingKey: existingBefore.billing_key,
          reused: true,
          note: '이미 발급/저장된 빌링키를 재사용했습니다.',
        });
      }
      throw e;
    }

    const billingKey = toss?.billingKey;
    if (!billingKey) {
      return NextResponse.json({ error: '빌링키 발급 응답이 올바르지 않습니다.' }, { status: 500 });
    }

    const cardCompany = toss?.cardCompany ?? null;
    const cardNumberMasked = toss?.cardNumber ?? toss?.card?.number ?? null;
    const cardType = toss?.card?.cardType ?? null;

    // 다중 카드 지원:
    // - 같은 customerKey로 여러 billingKey를 저장할 수 있어야 하므로 항상 INSERT 합니다.
    // - billing_key 자체는 UNIQUE라서 동일 billingKey를 다시 저장하려 하면 DB 에러가 날 수 있습니다.
    //   그 경우(중복)에는 기존 레코드를 찾아 반환합니다.
    const { data: inserted, error: insErr } = await supabase
      .from('billing_keys')
      .insert({
        user_id: user.id,
        customer_key: customerKey,
        billing_key: billingKey,
        status: 'active',
        card_company: cardCompany,
        card_number_masked: cardNumberMasked,
        card_type: cardType,
      })
      .select('id')
      .single();

    if (insErr) {
      // billing_key unique 충돌 등: 이미 저장된 billingKey일 수 있습니다.
      const { data: existingSame, error: sameErr } = await supabase
        .from('billing_keys')
        .select('id, billing_key')
        .eq('billing_key', billingKey)
        .limit(1)
        .maybeSingle();
      if (!sameErr && existingSame?.id) {
        return NextResponse.json({
          ok: true,
          billingKeyId: existingSame.id,
          billingKey: existingSame.billing_key,
          reused: true,
          note: '이미 저장된 billingKey를 재사용했습니다.',
        });
      }
      return NextResponse.json({ error: insErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, billingKeyId: inserted.id, billingKey });
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


