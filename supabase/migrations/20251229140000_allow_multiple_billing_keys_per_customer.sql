-- Allow multiple billing keys per customer (multi-card support)
--
-- 이전 설계에서는 (user_id, customer_key)를 UNIQUE로 잡아서
-- 한 고객당 1개의 billingKey만 저장할 수 있었습니다.
-- 고객이 여러 카드를 등록할 수 있도록 UNIQUE 인덱스를 제거합니다.

DROP INDEX IF EXISTS public.uq_billing_keys_user_customer_key;

-- 조회 성능을 위해 일반 인덱스로 대체합니다.
CREATE INDEX IF NOT EXISTS idx_billing_keys_user_customer_key
  ON public.billing_keys(user_id, customer_key);


