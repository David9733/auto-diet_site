-- TossPayments 결제/구독(정기결제) 개발을 위한 기본 스키마
--
-- 설계 목표
-- - 단건결제(결제위젯/결제창)와 정기결제(빌링키 기반)를 모두 지원
-- - 주문(order)과 결제(payment)를 분리해서 상태/이력을 안정적으로 추적
-- - 빌링키(billing_key)는 민감정보이므로 사용자 단위 RLS로 접근 제한
-- - 구독(subscription)과 구독 청구(subscription_charges)를 분리해서 "이번 달 청구 실패/재시도" 같은 케이스를 기록
--
-- 참고
-- - 이 프로젝트는 이미 public.update_updated_at_column() 트리거 함수를 사용하고 있습니다.
-- - 서버(Edge Function/Route Handler)에서 service role 키를 쓰는 경우 RLS를 우회할 수 있습니다.

-- 1) (선택) 프로필 테이블: auth.users의 최소 보완용
CREATE TABLE IF NOT EXISTS public.profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete own profiles" ON public.profiles;

CREATE POLICY "Users can view own profiles"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profiles"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profiles"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own profiles"
ON public.profiles FOR DELETE
USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 2) 주문(merchant_order_id = 토스페이먼츠 orderId에 대응)
CREATE TABLE IF NOT EXISTS public.payment_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  merchant_order_id text NOT NULL UNIQUE,
  order_name text NOT NULL,
  amount integer NOT NULL CHECK (amount >= 0),
  currency text NOT NULL DEFAULT 'KRW',
  status text NOT NULL DEFAULT 'created'
    CHECK (status IN ('created', 'ready', 'paid', 'canceled', 'failed')),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payment_orders_user_id ON public.payment_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_orders_merchant_order_id ON public.payment_orders(merchant_order_id);

ALTER TABLE public.payment_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own payment_orders" ON public.payment_orders;
DROP POLICY IF EXISTS "Users can insert own payment_orders" ON public.payment_orders;
DROP POLICY IF EXISTS "Users can update own payment_orders" ON public.payment_orders;
DROP POLICY IF EXISTS "Users can delete own payment_orders" ON public.payment_orders;

CREATE POLICY "Users can view own payment_orders"
ON public.payment_orders FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payment_orders"
ON public.payment_orders FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own payment_orders"
ON public.payment_orders FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own payment_orders"
ON public.payment_orders FOR DELETE
USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_payment_orders_updated_at ON public.payment_orders;
CREATE TRIGGER update_payment_orders_updated_at
  BEFORE UPDATE ON public.payment_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 3) 결제(토스페이먼츠 paymentKey 등 저장)
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id uuid NOT NULL REFERENCES public.payment_orders(id) ON DELETE CASCADE,
  toss_payment_key text UNIQUE,
  toss_transaction_id text,
  status text NOT NULL DEFAULT 'created'
    CHECK (status IN ('created', 'requested', 'approved', 'canceled', 'failed')),
  method text,
  requested_at timestamptz,
  approved_at timestamptz,
  canceled_at timestamptz,
  vat integer,
  supplied_amount integer,
  raw jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can insert own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can update own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can delete own payments" ON public.payments;

CREATE POLICY "Users can view own payments"
ON public.payments FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payments"
ON public.payments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own payments"
ON public.payments FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own payments"
ON public.payments FOR DELETE
USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_payments_updated_at ON public.payments;
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 4) 빌링키(정기결제 핵심)
CREATE TABLE IF NOT EXISTS public.billing_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_key text NOT NULL,
  billing_key text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'revoked')),
  card_company text,
  card_number_masked text,
  card_type text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_billing_keys_user_customer_key
  ON public.billing_keys(user_id, customer_key);
CREATE INDEX IF NOT EXISTS idx_billing_keys_user_id ON public.billing_keys(user_id);

ALTER TABLE public.billing_keys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own billing_keys" ON public.billing_keys;
DROP POLICY IF EXISTS "Users can insert own billing_keys" ON public.billing_keys;
DROP POLICY IF EXISTS "Users can update own billing_keys" ON public.billing_keys;
DROP POLICY IF EXISTS "Users can delete own billing_keys" ON public.billing_keys;

CREATE POLICY "Users can view own billing_keys"
ON public.billing_keys FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own billing_keys"
ON public.billing_keys FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own billing_keys"
ON public.billing_keys FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own billing_keys"
ON public.billing_keys FOR DELETE
USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_billing_keys_updated_at ON public.billing_keys;
CREATE TRIGGER update_billing_keys_updated_at
  BEFORE UPDATE ON public.billing_keys
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 5) 구독(플랜/주기/상태)
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  billing_key_id uuid NOT NULL REFERENCES public.billing_keys(id) ON DELETE RESTRICT,
  plan_name text NOT NULL,
  amount integer NOT NULL CHECK (amount >= 0),
  currency text NOT NULL DEFAULT 'KRW',
  interval_unit text NOT NULL DEFAULT 'month'
    CHECK (interval_unit IN ('day', 'week', 'month', 'year')),
  interval_count integer NOT NULL DEFAULT 1 CHECK (interval_count >= 1),
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'paused', 'canceled')),
  started_at timestamptz NOT NULL DEFAULT now(),
  current_period_start timestamptz,
  current_period_end timestamptz,
  next_billing_at timestamptz,
  canceled_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_billing_key_id ON public.subscriptions(billing_key_id);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can update own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can delete own subscriptions" ON public.subscriptions;

CREATE POLICY "Users can view own subscriptions"
ON public.subscriptions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions"
ON public.subscriptions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions"
ON public.subscriptions FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own subscriptions"
ON public.subscriptions FOR DELETE
USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 6) 구독 청구 이력(매 회차 결제 기록)
CREATE TABLE IF NOT EXISTS public.subscription_charges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id uuid NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  payment_id uuid REFERENCES public.payments(id) ON DELETE SET NULL,
  amount integer NOT NULL CHECK (amount >= 0),
  status text NOT NULL DEFAULT 'created'
    CHECK (status IN ('created', 'requested', 'approved', 'failed', 'canceled')),
  scheduled_at timestamptz,
  requested_at timestamptz,
  approved_at timestamptz,
  raw jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscription_charges_user_id ON public.subscription_charges(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_charges_subscription_id ON public.subscription_charges(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_charges_payment_id ON public.subscription_charges(payment_id);

ALTER TABLE public.subscription_charges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own subscription_charges" ON public.subscription_charges;
DROP POLICY IF EXISTS "Users can insert own subscription_charges" ON public.subscription_charges;
DROP POLICY IF EXISTS "Users can update own subscription_charges" ON public.subscription_charges;
DROP POLICY IF EXISTS "Users can delete own subscription_charges" ON public.subscription_charges;

CREATE POLICY "Users can view own subscription_charges"
ON public.subscription_charges FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription_charges"
ON public.subscription_charges FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription_charges"
ON public.subscription_charges FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own subscription_charges"
ON public.subscription_charges FOR DELETE
USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_subscription_charges_updated_at ON public.subscription_charges;
CREATE TRIGGER update_subscription_charges_updated_at
  BEFORE UPDATE ON public.subscription_charges
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();


