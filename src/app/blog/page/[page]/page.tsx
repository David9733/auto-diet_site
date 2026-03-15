import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, BookOpenText, Mail } from "lucide-react";
import { getAllStaticBlogPosts } from "@/lib/staticBlog";
import { BLOG_POSTS_PER_PAGE } from "@/lib/blogConfig";

export const dynamicParams = false;
export const dynamic = "force-static";

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" });
}

export async function generateStaticParams() {
  const posts = await getAllStaticBlogPosts();
  const totalPages = Math.max(1, Math.ceil(posts.length / BLOG_POSTS_PER_PAGE));

  // page 1은 /blog로 제공하므로, 여기서는 2..N만 생성
  return Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p >= 2)
    .map((page) => ({ page: String(page) }));
}

async function resolveParams<T extends Record<string, unknown>>(params: T | Promise<T>): Promise<T> {
  return await Promise.resolve(params);
}

export default async function BlogPagedPage({ params }: { params: { page: string } } | { params: Promise<{ page: string }> }) {
  const { page: pageParam } = await resolveParams(params as { page: string } | Promise<{ page: string }>);
  const page = Number(pageParam);
  if (!Number.isFinite(page) || page < 2) return notFound();

  const posts = await getAllStaticBlogPosts();
  const totalPages = Math.max(1, Math.ceil(posts.length / BLOG_POSTS_PER_PAGE));
  if (page > totalPages) return notFound();

  const start = (page - 1) * BLOG_POSTS_PER_PAGE;
  const paged = posts.slice(start, start + BLOG_POSTS_PER_PAGE);

  return (
    <div className="min-h-screen gradient-hero">
      <Header logoHref="/">
        <Button asChild variant="ghost" size="sm" className="gap-2">
          <Link href="/">
            <ArrowLeft className="w-4 h-4" />
            홈
          </Link>
        </Button>
        <Button asChild variant="ghost" size="sm" className="gap-2">
          <Link href="/contact">
            <Mail className="w-4 h-4" />
            문의
          </Link>
        </Button>
      </Header>

      <main className="container py-8 space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2">
              <BookOpenText className="w-5 h-5 text-primary" />
              <h1 className="text-2xl font-bold tracking-tight">블로그</h1>
              <span className="text-sm text-muted-foreground">페이지 {page}</span>
            </div>
          </div>
        </div>

        <Separator />

        {paged.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>표시할 글이 없습니다</CardTitle>
              <CardDescription>페이지가 비어 있습니다.</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paged.map((p) => (
                <Card key={p.slug} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{p.title}</CardTitle>
                    <CardDescription>
                      {p.date ? `발행 ${formatDate(p.date)}` : null}
                      {p.tags.length ? ` · ${p.tags.slice(0, 3).join(", ")}` : null}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="overflow-hidden rounded-lg border bg-background">
                      <img
                        src={p.coverImage}
                        alt={p.coverAlt}
                        className="h-44 w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    {p.description ? <p className="text-sm text-muted-foreground">{p.description}</p> : null}
                    <div className="flex justify-end">
                      <Button asChild className="gap-2">
                        <Link href={`/blog/${p.slug}`}>
                          <BookOpenText className="w-4 h-4" />
                          읽기
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex items-center justify-center gap-2 flex-wrap">
              {page > 1 ? (
                <Button asChild variant="outline">
                  <Link href={page - 1 === 1 ? "/blog" : `/blog/page/${page - 1}`}>이전</Link>
                </Button>
              ) : null}
              <div className="text-sm text-muted-foreground">
                {page} / {totalPages}
              </div>
              {page < totalPages ? (
                <Button asChild variant="outline">
                  <Link href={`/blog/page/${page + 1}`}>다음</Link>
                </Button>
              ) : null}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}


