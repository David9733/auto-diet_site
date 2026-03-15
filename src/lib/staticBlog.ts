import "server-only";

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import gfm from "remark-gfm";
import { cache } from "react";

export type StaticBlogPost = {
  slug: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  tags: string[];
  coverImage: string;
  coverAlt: string;
  contentMarkdown: string;
  contentHtml: string;
};

type FrontMatter = Partial<{
  title: string;
  description: string;
  date: string;
  tags: string[];
  coverImage: string;
  coverAlt: string;
}>;

const BLOG_DIR = path.join(process.cwd(), "src", "content", "blog");

function getSlugFromFilename(filename: string) {
  // e.g. 2025-12-27-ingredient-storage-expiration-guide.md -> ingredient-storage-expiration-guide
  const base = filename.replace(/\.md$/, "");
  const maybe = base.replace(/^\d{4}-\d{2}-\d{2}-/, "");
  return maybe || base;
}

function listMarkdownFiles() {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".md"))
    .sort()
    .reverse(); // 최신 파일(날짜 prefix)이 위로 오도록
}

async function markdownToHtml(markdown: string) {
  const processed = await remark().use(gfm).use(html, { sanitize: false }).process(markdown);
  return processed.toString();
}

export const getAllStaticBlogPosts = cache(async (): Promise<StaticBlogPost[]> => {
  const files = listMarkdownFiles();

  const posts = await Promise.all(
    files.map(async (filename) => {
      const full = path.join(BLOG_DIR, filename);
      const raw = fs.readFileSync(full, "utf8");
      const parsed = matter(raw);
      const fm = (parsed.data ?? {}) as FrontMatter;

      const slug = getSlugFromFilename(filename);
      const title = (fm.title ?? slug).toString();
      const description = (fm.description ?? "").toString();
      const date = (fm.date ?? filename.slice(0, 10)).toString();
      const tags = Array.isArray(fm.tags) ? fm.tags.map(String) : [];
      const coverImage = (fm.coverImage ?? "/blog-images/default.svg").toString();
      const coverAlt = (fm.coverAlt ?? title).toString();

      const contentMarkdown = parsed.content.trim();
      const contentHtml = await markdownToHtml(contentMarkdown);

      return {
        slug,
        title,
        description,
        date,
        tags,
        coverImage,
        coverAlt,
        contentMarkdown,
        contentHtml,
      } satisfies StaticBlogPost;
    })
  );

  // 날짜 최신순
  return posts.sort((a, b) => b.date.localeCompare(a.date));
});

export const getStaticBlogPostBySlug = cache(async (slug: string): Promise<StaticBlogPost | null> => {
  const all = await getAllStaticBlogPosts();
  return all.find((p) => p.slug === slug) ?? null;
});

export const getStaticBlogSlugs = cache(async () => {
  const all = await getAllStaticBlogPosts();
  return all.map((p) => p.slug);
});


