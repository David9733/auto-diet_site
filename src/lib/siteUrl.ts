/**
 * 사이트의 절대 URL(https://도메인)을 결정합니다.
 *
 * - 운영(Production)에서는 반드시 올바른 도메인을 반환해야 sitemap/rss/OG/canonical이 정상 동작합니다.
 * - NEXT_PUBLIC_SITE_URL을 가장 우선으로 사용하고,
 * - Vercel 환경이라면 VERCEL_URL(프로토콜 없는 호스트)을 https://로 보정해 사용합니다.
 * - 개발환경에서는 로컬 기본값(http://localhost:3000)을 사용합니다.
 */
export function getSiteUrl(): string {
  // 1) 사용자가 명시한 도메인(권장)
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");

  // 2) Vercel이 제공하는 배포 URL(보통 프로토콜 없음)
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel}`.replace(/\/$/, "");

  // 3) 최후 fallback: 로컬 기본값
  // - 로컬에서 `next build`는 NODE_ENV=production으로 동작하므로,
  //   여기서 throw 하면 개발/CI가 쉽게 깨질 수 있습니다.
  // - 실제 배포에서는 반드시 NEXT_PUBLIC_SITE_URL(또는 VERCEL_URL)이 세팅되어야
  //   sitemap/rss/OG/canonical이 올바른 도메인을 사용합니다.
  // 배포 도메인을 기본값으로 둬서, 환경변수 누락 시에도 canonical/OG/sitemap/rss가 깨지지 않게 합니다.
  // (Vercel은 기본적으로 https를 사용하므로 https 기준이 SEO에 더 안전합니다.)
  return "https://auto-diet.vercel.app";
}


