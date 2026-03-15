import { getAllStaticBlogPosts } from "@/lib/staticBlog";
import { BLOG_POSTS_PER_PAGE } from "@/lib/blogConfig";
import { getSiteUrl } from "@/lib/siteUrl";

function escapeXml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function toDateOnly(isoLike: string) {
  // sitemap lastmod는 YYYY-MM-DD 또는 W3C Datetime을 허용합니다.
  // 구글/도구들이 가장 안정적으로 파싱하는 YYYY-MM-DD 형태로 통일합니다.
  const d = new Date(isoLike);
  if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  // 이미 YYYY-MM-DD 형태면 그대로 사용
  if (/^\d{4}-\d{2}-\d{2}$/.test(isoLike)) return isoLike;
  return new Date().toISOString().slice(0, 10);
}

type UrlEntry = {
  loc: string;
  lastmod: string;
  changefreq?: "daily" | "weekly" | "monthly" | "yearly";
  priority?: number;
};

export async function GET() {
  const siteUrl = getSiteUrl();
  const today = new Date().toISOString().slice(0, 10);

  const posts = await getAllStaticBlogPosts();
  const totalPages = Math.max(1, Math.ceil(posts.length / BLOG_POSTS_PER_PAGE));

  // robots.txt에서 막아둔 경로(/auth, /api, 테스트/베리에이션)는 사이트맵에서 제외합니다.
  const staticEntries: UrlEntry[] = [
    { loc: `${siteUrl}/`, lastmod: today, changefreq: "weekly", priority: 1.0 },
    { loc: `${siteUrl}/blog`, lastmod: today, changefreq: "weekly", priority: 0.8 },
    { loc: `${siteUrl}/contact`, lastmod: today, changefreq: "yearly", priority: 0.3 },
    { loc: `${siteUrl}/privacy`, lastmod: today, changefreq: "yearly", priority: 0.2 },
  ];

  const blogListPages: UrlEntry[] =
    totalPages <= 1
      ? []
      : Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((p) => p >= 2)
          .map((page) => ({
            loc: `${siteUrl}/blog/page/${page}`,
            lastmod: today,
            changefreq: "weekly" as const,
            priority: 0.4,
          }));

  const blogPosts: UrlEntry[] = posts.map((p) => ({
    loc: `${siteUrl}/blog/${p.slug}`,
    lastmod: toDateOnly(p.date),
    changefreq: "monthly",
    priority: 0.7,
  }));

  const all = [...staticEntries, ...blogListPages, ...blogPosts];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${all
    .map((u) => {
      const changefreq = u.changefreq ? `\n    <changefreq>${u.changefreq}</changefreq>` : "";
      const priority = typeof u.priority === "number" ? `\n    <priority>${u.priority.toFixed(1)}</priority>` : "";
      return `  <url>\n    <loc>${escapeXml(u.loc)}</loc>\n    <lastmod>${escapeXml(u.lastmod)}</lastmod>${changefreq}${priority}\n  </url>`;
    })
    .join("\n")}\n</urlset>\n`;

  return new Response(xml, {
    headers: {
      // charset을 명시해서 구글/도구들이 포맷을 오해하지 않게 합니다.
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}


