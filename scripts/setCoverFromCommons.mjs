import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import sharp from "sharp";

const ROOT = process.cwd();
const BLOG_DIR = path.join(ROOT, "src", "content", "blog");
const OUT_DIR = path.join(ROOT, "public", "blog-images", "covers");

function usage() {
  console.error("Usage: node scripts/setCoverFromCommons.mjs <slug> <File:Title.jpg>");
  process.exit(1);
}

const [slug, ...rest] = process.argv.slice(2);
const fileTitle = rest.join(" ").trim();
if (!slug || !fileTitle || !fileTitle.toLowerCase().startsWith("file:")) usage();

function mdPathFromSlug(slugValue) {
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".md"));
  const found = files.find((f) => f.replace(/\.md$/, "").replace(/^\d{4}-\d{2}-\d{2}-/, "") === slugValue);
  return found ? path.join(BLOG_DIR, found) : null;
}

function filePageUrl(title) {
  return `https://commons.wikimedia.org/wiki/${encodeURIComponent(title.replaceAll(" ", "_"))}`;
}

function filePathUrl(title, width = 1200) {
  const filename = title.replace(/^File:/i, "");
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(filename)}?width=${width}`;
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function downloadAndEnsureJpg(url, outJpgFile) {
  let lastErr = null;
  for (let attempt = 0; attempt < 6; attempt++) {
    const res = await fetch(url, { headers: { "User-Agent": "food-forge-pro/1.0" } });
    if (res.ok) {
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 30_000) throw new Error(`Downloaded file too small (${buf.length} bytes): ${url}`);
      await sharp(buf).jpeg({ quality: 86, mozjpeg: true }).toFile(outJpgFile);
      const len = fs.statSync(outJpgFile).size;
      if (len < 30_000) throw new Error(`Converted JPG too small (${len} bytes): ${outJpgFile}`);
      return len;
    }
    if (res.status === 429 || res.status >= 500) {
      lastErr = new Error(`Download failed: ${res.status} ${url}`);
      await sleep(800 * Math.pow(2, attempt));
      continue;
    }
    throw new Error(`Download failed: ${res.status} ${url}`);
  }
  throw lastErr ?? new Error(`Download failed: ${url}`);
}

function upsertAttribution(body, url) {
  const trimmed = body.trim();
  const re = /이미지 출처:\s*([^\n]+)/;
  if (re.test(trimmed)) return trimmed.replace(re, `이미지 출처: ${url}`) + "\n";
  return `${trimmed}\n\n---\n\n이미지 출처: ${url}\n`;
}

async function main() {
  const mdFile = mdPathFromSlug(slug);
  if (!mdFile) throw new Error(`Markdown not found for slug: ${slug}`);
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const outPath = path.join(OUT_DIR, `${slug}.jpg`);
  const page = filePageUrl(fileTitle);
  const file = filePathUrl(fileTitle, 1200);

  console.log(`[${slug}] downloading: ${fileTitle}`);
  const size = await downloadAndEnsureJpg(file, outPath);
  console.log(`[${slug}] saved (${size} bytes): ${path.relative(ROOT, outPath)}`);

  const raw = fs.readFileSync(mdFile, "utf8");
  const parsed = matter(raw);
  const fm = parsed.data ?? {};
  fm.coverImage = `/blog-images/covers/${slug}.jpg`;
  fm.coverAlt = fm.coverAlt || String(fm.title || slug);
  const nextBody = upsertAttribution(parsed.content, page);
  const nextRaw = matter.stringify(nextBody, fm);
  fs.writeFileSync(mdFile, nextRaw, "utf8");
  console.log(`[${slug}] markdown updated: ${path.relative(ROOT, mdFile)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


