/**
 * Supabase 로컬 스모크 테스트 (배포 전 점검용)
 *
 * 목적
 * - Supabase URL/키가 올바르게 주입됐는지(연결)
 * - anon(비로그인)으로 접근 가능한 테이블이 실제로 조회되는지
 * - RLS가 걸린 테이블에 anon이 쓰기 시도 시 차단되는지
 *
 * 실행 방법(Windows PowerShell)
 *   $env:NEXT_PUBLIC_SUPABASE_URL="https://...supabase.co"
 *   $env:NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="..."
 *   node scripts/supabaseSmokeTest.mjs
 *
 * 참고
 * - 이 프로젝트는 Next.js로 실행하므로 로컬에서는 `.env.local`에
 *   NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY 를 넣는 것이 정석입니다.
 *   (단, Cursor 보안 정책상 여기서 자동으로 .env.local 파일을 생성/쓰기 할 수는 없습니다.)
 */

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
// 이 프로젝트는 과거 문서 호환을 위해 PUBLISHABLE_KEY / ANON_KEY 모두 지원합니다.
const key =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function fail(message, extra) {
  console.error("❌", message);
  if (extra) console.error(extra);
  process.exit(1);
}

if (!url) fail("NEXT_PUBLIC_SUPABASE_URL 이 설정되지 않았습니다.");
if (!key) fail("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY 또는 NEXT_PUBLIC_SUPABASE_ANON_KEY 가 설정되지 않았습니다.");

// 보안: 키는 로그로 출력하지 않습니다.
console.log("🔎 Supabase Smoke Test");
console.log("- URL:", url);

const supabase = createClient(url, key);

const run = async () => {
  // 1) nutrition_data는 공유 캐시 테이블이므로 anon 조회가 가능해야 합니다.
  //    (RLS가 켜져 있어도 SELECT policy가 USING(true) 형태로 열려있는 구성을 기대)
  const nutritionRes = await supabase
    .from("nutrition_data")
    .select("food_name", { count: "exact" })
    .order("created_at", { ascending: false })
    .limit(1);

  console.log("\n[1] nutrition_data SELECT");
  console.log({
    ok: !nutritionRes.error,
    count: nutritionRes.count,
    sample: nutritionRes.data?.[0]?.food_name ?? null,
    error: nutritionRes.error?.message ?? null,
  });

  if (nutritionRes.error) {
    fail("nutrition_data 조회 실패: Supabase 연결/키/정책을 확인하세요.", nutritionRes.error);
  }

  // 2) store_settings는 user_id 기반 RLS라서 anon 조회 시 0건이 정상입니다.
  //    (테이블이 없거나 권한 문제가 있으면 error가 납니다.)
  const storeSelectRes = await supabase.from("store_settings").select("id").limit(1);

  console.log("\n[2] store_settings SELECT (anon) — 기대: ok=true, rows=0");
  console.log({
    ok: !storeSelectRes.error,
    rows: storeSelectRes.data?.length ?? 0,
    error: storeSelectRes.error?.message ?? null,
  });

  if (storeSelectRes.error) {
    fail("store_settings 조회 자체가 실패했습니다(테이블/권한/네트워크 점검 필요).", storeSelectRes.error);
  }

  // 3) store_settings INSERT는 anon에서 실패(= RLS 차단)가 정상입니다.
  const storeInsertRes = await supabase.from("store_settings").insert({
    store_name: "RLS_TEST_FROM_ANON",
  });

  console.log("\n[3] store_settings INSERT (anon) — 기대: error 존재(RLS 차단)");
  console.log({
    ok: !storeInsertRes.error,
    error: storeInsertRes.error?.message ?? null,
    code: storeInsertRes.error?.code ?? null,
  });

  if (!storeInsertRes.error) {
    fail(
      "예상과 다르게 anon INSERT가 성공했습니다. RLS 정책이 너무 열려있을 수 있으니 즉시 점검하세요."
    );
  }

  console.log("\n✅ 로컬 배포 전 Supabase 스모크 테스트 통과");
};

run().catch((e) => {
  fail("스모크 테스트 실행 중 예외 발생", e);
});












