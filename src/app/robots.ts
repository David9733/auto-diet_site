import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/siteUrl";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // 검색 노출이 필요 없는 경로들(로그인/내부 API/테스트 페이지 등)
        disallow: ["/auth", "/api", "/test-fda", "/test-kat-online", "/variations"],
      },
    ],
    host: siteUrl,
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}


