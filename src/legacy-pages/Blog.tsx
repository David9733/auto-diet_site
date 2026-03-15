import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { BlogPost, getBlogPosts, upsertBlogPost } from "@/utils/blog";
import { BlogContent } from "@/components/blog/BlogContent";
import { ArrowLeft, BookOpenText, Plus, Save } from "lucide-react";

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" });
}

function getExcerpt(content: string) {
  const plain = content
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^>\s+/gm, "")
    .replace(/^\s*[-*]\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim();
  return plain.length > 140 ? `${plain.slice(0, 140)}…` : plain;
}

export default function Blog() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [tab, setTab] = useState<"list" | "write">("list");

  // 작성 폼 상태
  const [title, setTitle] = useState("식재료 보관/유통기한 가이드 (추가)");
  const [content, setContent] = useState(
    "## 새 글을 작성해보세요\n- 제목과 본문을 입력하고 저장하면 /blog/글주소 로 바로 공유할 수 있어요.\n\n> 팁: 본문은 간단한 마크다운(## 제목, - 목록, > 인용)을 지원합니다."
  );

  useEffect(() => {
    // /blog 진입 시: 유틸에서 자동 시드(기본 글)까지 보장
    setPosts(getBlogPosts());
  }, []);

  const selectedPreview = useMemo(() => {
    return {
      title: title.trim() || "(제목 없음)",
      content,
    };
  }, [title, content]);

  const handleSave = () => {
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle || !trimmedContent) {
      toast({
        title: "저장 실패",
        description: "제목과 본문을 모두 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    const saved = upsertBlogPost({ title: trimmedTitle, content: trimmedContent });
    setPosts(getBlogPosts());
    toast({
      title: "저장 완료",
      description: "글이 저장되었습니다.",
    });
    navigate(`/blog/${saved.slug}`);
  };

  return (
    <div className="min-h-screen gradient-hero">
      <Header onLogoClick={() => navigate("/")}>
        <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          홈
        </Button>
      </Header>

      <main className="container py-8 space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2">
              <BookOpenText className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-bold tracking-tight">블로그</h2>
              <Badge variant="secondary">정보성 컨텐츠</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              /blog 에서 글을 작성하고, 저장된 글은 브라우저에 보관됩니다(개인 PC 기준).
            </p>
          </div>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as "list" | "write")} className="w-full">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="list" className="gap-2">
              <BookOpenText className="w-4 h-4" />
              글 목록
            </TabsTrigger>
            <TabsTrigger value="write" className="gap-2">
              <Plus className="w-4 h-4" />
              글 작성
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-4 space-y-4">
            {posts.length === 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>아직 글이 없습니다</CardTitle>
                  <CardDescription>오른쪽 “글 작성”에서 첫 글을 작성해보세요.</CardDescription>
                </CardHeader>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {posts.map((p) => (
                  <Card key={p.slug} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">{p.title}</CardTitle>
                      <CardDescription>
                        작성일 {formatDate(p.createdAt)}
                        {p.updatedAt !== p.createdAt ? ` · 수정일 ${formatDate(p.updatedAt)}` : ""}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">{getExcerpt(p.content)}</p>
                      <div className="flex justify-end">
                        <Button onClick={() => navigate(`/blog/${p.slug}`)} className="gap-2">
                          <BookOpenText className="w-4 h-4" />
                          읽기
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="write" className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>글 작성</CardTitle>
                <CardDescription>
                  제목/본문을 입력한 뒤 저장하면, 글 상세 주소(`/blog/글슬러그`)로 접근할 수 있습니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium">제목</div>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="예) 식재료 보관/유통기한 가이드" />
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">본문</div>
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[240px]"
                    placeholder="정보성 컨텐츠를 작성해보세요."
                  />
                  <div className="text-xs text-muted-foreground">
                    지원: <span className="font-mono">##</span> 제목, <span className="font-mono">-</span> 목록,{" "}
                    <span className="font-mono">&gt;</span> 인용
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSave} className="gap-2">
                    <Save className="w-4 h-4" />
                    저장
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>미리보기</CardTitle>
                <CardDescription>실제 글 상세 페이지와 동일한 방식으로 렌더링됩니다.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">{selectedPreview.title}</h1>
                  <div className="text-xs text-muted-foreground mt-1">작성 전 미리보기</div>
                </div>
                <Separator />
                <BlogContent content={selectedPreview.content} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}


