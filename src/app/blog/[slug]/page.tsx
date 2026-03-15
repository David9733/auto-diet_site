import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Home, Mail } from "lucide-react";
import { getStaticBlogPostBySlug, getStaticBlogSlugs } from "@/lib/staticBlog";
import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/siteUrl";

function formatDateTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const dynamicParams = false;
export const dynamic = "force-static";

export async function generateStaticParams() {
  const slugs = await getStaticBlogSlugs();
  return slugs.map((slug) => ({ slug }));
}

async function resolveParams<T extends Record<string, unknown>>(params: T | Promise<T>): Promise<T> {
  // Next 15/16에서는 Server Component의 params가 Promise로 전달되는 경우가 있어 안전하게 처리합니다.
  return await Promise.resolve(params);
}

export async function generateMetadata({ params }: { params: { slug: string } } | { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await resolveParams(params as { slug: string } | Promise<{ slug: string }>);
  const post = await getStaticBlogPostBySlug(slug);
  if (!post) return {};

  const siteUrl = getSiteUrl();
  const url = `${siteUrl}/blog/${post.slug}`;

  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: post.title,
      description: post.description,
      locale: "ko_KR",
      images: post.coverImage ? [{ url: `${siteUrl}${post.coverImage}` }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: post.coverImage ? [`${siteUrl}${post.coverImage}`] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } } | { params: Promise<{ slug: string }> }) {
  const { slug } = await resolveParams(params as { slug: string } | Promise<{ slug: string }>);
  const post = await getStaticBlogPostBySlug(slug);
  if (!post) return notFound();

  const siteUrl = getSiteUrl();
  const canonicalUrl = `${siteUrl}/blog/${post.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    mainEntityOfPage: canonicalUrl,
    author: { "@type": "Organization", name: "AutoDiet" },
    publisher: { "@type": "Organization", name: "AutoDiet" },
  };

  return (
    <div className="min-h-screen gradient-hero">
      <Header logoHref="/">
        <Button asChild variant="ghost" size="sm" className="gap-2">
          <Link href="/blog">
            <ArrowLeft className="w-4 h-4" />
            목록
          </Link>
        </Button>
        <Button asChild variant="ghost" size="sm" className="gap-2">
          <Link href="/contact">
            <Mail className="w-4 h-4" />
            문의
          </Link>
        </Button>
        <Button asChild variant="ghost" size="sm" className="gap-2">
          <Link href="/">
            <Home className="w-4 h-4" />
            홈
          </Link>
        </Button>
      </Header>

      <main className="container py-8 space-y-6">
        <Card>
          <CardHeader className="space-y-3">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="space-y-2">
                <CardTitle className="text-2xl">{post.title}</CardTitle>
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <span>발행 {formatDateTime(post.date)}</span>
                  {post.tags.length ? <span>· {post.tags.slice(0, 4).join(", ")}</span> : null}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Separator />
            {/* SEO: 구조화 데이터(Article) */}
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

            {/* 커버 이미지 */}
            <div className="overflow-hidden rounded-lg border bg-background">
              <img
                src={post.coverImage}
                alt={post.coverAlt}
                className="w-full max-h-[420px] object-cover"
                loading="eager"
              />
            </div>

            <div
              className="prose prose-sm sm:prose-base prose-zinc dark:prose-invert max-w-none break-words [&_p]:my-3 sm:[&_p]:my-4 [&_p]:leading-7 sm:[&_p]:leading-7 [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-xl sm:[&_h2]:text-2xl [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-lg sm:[&_h3]:text-xl [&_ul]:my-3 [&_ol]:my-3 [&_li]:my-1 [&_a]:break-all [&_a]:whitespace-normal [&_a]:[overflow-wrap:anywhere] [&_code]:break-words [&_code]:whitespace-normal [&_pre]:overflow-x-auto"
              dangerouslySetInnerHTML={{ __html: post.contentHtml }}
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}


