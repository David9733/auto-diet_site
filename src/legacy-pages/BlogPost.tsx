import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BlogContent } from "@/components/blog/BlogContent";
import { BlogPost as BlogPostType, deleteBlogPost, getBlogPostBySlug, getBlogPosts } from "@/utils/blog";
import { ArrowLeft, Home, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [post, setPost] = useState<BlogPostType | null>(null);

  useEffect(() => {
    if (!slug) return;
    // 유틸에서 최초 시드가 보장되므로, 바로 조회
    setPost(getBlogPostBySlug(slug) ?? null);
  }, [slug]);

  const exists = useMemo(() => {
    if (!slug) return false;
    return getBlogPosts().some((p) => p.slug === slug);
  }, [slug]);

  const handleDelete = () => {
    if (!slug) return;
    if (!exists) return;

    deleteBlogPost(slug);
    toast({ title: "삭제 완료", description: "글이 삭제되었습니다." });
    navigate("/blog");
  };

  if (!slug) {
    return (
      <div className="min-h-screen gradient-hero">
        <Header onLogoClick={() => navigate("/")}>
          <Button variant="ghost" size="sm" onClick={() => navigate("/blog")} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            목록
          </Button>
        </Header>
        <main className="container py-8">
          <Card>
            <CardHeader>
              <CardTitle>잘못된 접근</CardTitle>
              <CardDescription>글 주소가 올바르지 않습니다.</CardDescription>
            </CardHeader>
          </Card>
        </main>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen gradient-hero">
        <Header onLogoClick={() => navigate("/")}>
          <Button variant="ghost" size="sm" onClick={() => navigate("/blog")} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            목록
          </Button>
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="gap-2">
            <Home className="w-4 h-4" />
            홈
          </Button>
        </Header>
        <main className="container py-8">
          <Card>
            <CardHeader>
              <CardTitle>글을 찾을 수 없습니다</CardTitle>
              <CardDescription>삭제되었거나 존재하지 않는 글입니다.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-end">
              <Button onClick={() => navigate("/blog")}>글 목록으로</Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero">
      <Header onLogoClick={() => navigate("/")}>
        <Button variant="ghost" size="sm" onClick={() => navigate("/blog")} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          목록
        </Button>
        <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="gap-2">
          <Home className="w-4 h-4" />
          홈
        </Button>
      </Header>

      <main className="container py-8 space-y-6">
        <Card>
          <CardHeader className="space-y-3">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="space-y-2">
                <CardTitle className="text-2xl">{post.title}</CardTitle>
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="secondary">정보성 컨텐츠</Badge>
                  <span>작성 {formatDateTime(post.createdAt)}</span>
                  {post.updatedAt !== post.createdAt ? <span>· 수정 {formatDateTime(post.updatedAt)}</span> : null}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handleDelete} className="gap-2">
                  <Trash2 className="w-4 h-4" />
                  삭제
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Separator />
            <BlogContent content={post.content} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}


