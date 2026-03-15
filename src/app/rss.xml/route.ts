import { getAllStaticBlogPosts } from "@/lib/staticBlog";
import { getSiteUrl } from "@/lib/siteUrl";

function escapeXml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export async function GET() {
  const siteUrl = getSiteUrl();
  const posts = await getAllStaticBlogPosts();
  const feedUrl = `${siteUrl}/rss.xml`;
  const blogUrl = `${siteUrl}/blog`;

  // RSS가 너무 커지지 않도록 최근 N개만 노출 (원하면 숫자 변경)
  const limited = posts.slice(0, 30);

  const items = limited
    .map((p) => {
      const url = `${siteUrl}/blog/${p.slug}`;
      return `
  <item>
    <title>${escapeXml(p.title)}</title>
    <link>${escapeXml(url)}</link>
    <guid>${escapeXml(url)}</guid>
    <pubDate>${new Date(p.date).toUTCString()}</pubDate>
    <description>${escapeXml(p.description || "")}</description>
  </item>`;
    })
    .join("\n");

  const lastBuildDate =
    limited.length > 0 ? new Date(limited[0].date).toUTCString() : new Date().toUTCString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml("AutoDiet 블로그")}</title>
    <link>${escapeXml(blogUrl)}</link>
    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />
    <description>${escapeXml("AutoDiet 정보성 컨텐츠(정적 파일 기반) RSS")}</description>
    <language>ko-KR</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}


