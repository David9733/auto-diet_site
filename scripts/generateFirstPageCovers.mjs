import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import sharp from "sharp";

const ROOT = process.cwd();
const BLOG_DIR = path.join(ROOT, "src", "content", "blog");
const OUT_DIR = path.join(ROOT, "public", "blog-images", "covers");

const POSTS_PER_PAGE = 10;

function getSlugFromFilename(filename) {
  const base = filename.replace(/\.md$/, "");
  const maybe = base.replace(/^\d{4}-\d{2}-\d{2}-/, "");
  return maybe || base;
}

function pickTheme(tags = []) {
  const t = new Set(tags.map(String));
  if (t.has("영양") || t.has("식단") || t.has("탄단지")) return { a: "#22c55e", b: "#16a34a", label: "영양" };
  if (t.has("레시피") || t.has("조리팁") || t.has("응용")) return { a: "#f59e0b", b: "#ef4444", label: "레시피" };
  if (t.has("알레르기") || t.has("식이제한") || t.has("글루텐") || t.has("유당") || t.has("견과"))
    return { a: "#a855f7", b: "#06b6d4", label: "알레르기" };
  if (t.has("장보기") || t.has("예산") || t.has("밀프렙")) return { a: "#14b8a6", b: "#0ea5e9", label: "장보기" };
  return { a: "#0ea5e9", b: "#1d4ed8", label: "보관" };
}

function escapeXml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function wrapKorean(text, maxCharsPerLine = 18, maxLines = 3) {
  const cleaned = String(text).trim();
  if (!cleaned) return [];

  // 공백 기준으로 우선 분리, 공백이 거의 없으면 글자 수로 잘라줌
  const words = cleaned.split(/\s+/g);
  const lines = [];
  let cur = "";

  const pushLine = () => {
    if (cur.trim()) lines.push(cur.trim());
    cur = "";
  };

  for (const w of words) {
    if ((cur + " " + w).trim().length <= maxCharsPerLine) {
      cur = (cur + " " + w).trim();
    } else {
      pushLine();
      if (w.length <= maxCharsPerLine) {
        cur = w;
      } else {
        // 긴 토큰은 강제로 자르기
        let rest = w;
        while (rest.length > maxCharsPerLine) {
          lines.push(rest.slice(0, maxCharsPerLine));
          rest = rest.slice(maxCharsPerLine);
          if (lines.length >= maxLines) break;
        }
        cur = rest;
      }
    }
    if (lines.length >= maxLines) break;
  }

  if (lines.length < maxLines) pushLine();
  return lines.slice(0, maxLines);
}

function makeSvg({ title, date, themeLabel, a, b }) {
  const titleLines = wrapKorean(title, 20, 3);
  const safeLines = titleLines.map(escapeXml);

  const y0 = 250;
  const lineHeight = 64;

  const titleTspans = safeLines
    .map((line, idx) => `<tspan x="120" y="${y0 + idx * lineHeight}">${line}</tspan>`)
    .join("");

  const safeDate = escapeXml(date);
  const safeLabel = escapeXml(themeLabel);

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${a}"/>
      <stop offset="1" stop-color="${b}"/>
    </linearGradient>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="rgba(0,0,0,0.18)"/>
    </filter>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect x="64" y="64" width="1072" height="502" rx="28" fill="rgba(255,255,255,0.14)" filter="url(#soft)"/>

  <g fill="#ffffff" opacity="0.95" font-family="system-ui, -apple-system, Segoe UI, sans-serif">
    <text x="120" y="170" font-size="28" font-weight="700" opacity="0.92">${safeLabel}</text>
    <text x="120" y="520" font-size="22" opacity="0.90">${safeDate}</text>
    <text font-size="56" font-weight="900" letter-spacing="-0.5">
      ${titleTspans}
    </text>
  </g>

  <g opacity="0.18" fill="#fff">
    <circle cx="980" cy="210" r="140"/>
    <circle cx="880" cy="420" r="90"/>
  </g>
</svg>`;
}

async function main() {
  if (!fs.existsSync(BLOG_DIR)) {
    console.error("블로그 폴더가 없습니다:", BLOG_DIR);
    process.exit(1);
  }

  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".md"));
  const posts = files
    .map((filename) => {
      const full = path.join(BLOG_DIR, filename);
      const raw = fs.readFileSync(full, "utf8");
      const parsed = matter(raw);
      const fm = parsed.data ?? {};
      const date = String(fm.date ?? filename.slice(0, 10));
      const slug = getSlugFromFilename(filename);
      const title = String(fm.title ?? slug);
      const tags = Array.isArray(fm.tags) ? fm.tags : [];
      return { filename, full, date, slug, title, tags };
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  const firstPage = posts.slice(0, POSTS_PER_PAGE);
  for (const p of firstPage) {
    const theme = pickTheme(p.tags);
    const svg = makeSvg({
      title: p.title,
      date: p.date,
      themeLabel: theme.label,
      a: theme.a,
      b: theme.b,
    });

    const outPath = path.join(OUT_DIR, `${p.slug}.jpg`);
    await sharp(Buffer.from(svg))
      .jpeg({ quality: 88, mozjpeg: true })
      .toFile(outPath);

    console.log("✅ cover generated:", path.relative(ROOT, outPath));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


