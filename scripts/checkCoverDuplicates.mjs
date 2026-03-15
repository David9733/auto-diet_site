import fs from "node:fs";
import path from "node:path";

const BLOG_DIR = path.join(process.cwd(), "src", "content", "blog");

function getSlugFromFilename(filename) {
  const base = filename.replace(/\.md$/, "");
  const maybe = base.replace(/^\d{4}-\d{2}-\d{2}-/, "");
  return maybe || base;
}

function extractFrontmatterDate(raw) {
  const m = raw.match(/^date:\s*"?([^\n"]+)"?/m);
  return m ? m[1] : "";
}

function extractAttributionFileTitle(raw) {
  const m = raw.match(/이미지 출처:\s*(https:\/\/commons\.wikimedia\.org\/wiki\/[^\s]+)/);
  if (!m) return "";
  const part = m[1].split("/wiki/")[1];
  if (!part) return "";
  return decodeURIComponent(part).replaceAll("_", " ");
}

const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".md"));
const rows = files.map((f) => {
  const raw = fs.readFileSync(path.join(BLOG_DIR, f), "utf8");
  return {
    slug: getSlugFromFilename(f),
    date: extractFrontmatterDate(raw),
    source: extractAttributionFileTitle(raw),
  };
});

rows.sort((a, b) => b.date.localeCompare(a.date));

const groups = new Map();
for (const r of rows) {
  if (!r.source) continue;
  if (!groups.has(r.source)) groups.set(r.source, []);
  groups.get(r.source).push(r);
}

const duplicates = [...groups.entries()]
  .map(([source, items]) => ({ source, count: items.length, items }))
  .filter((g) => g.count > 1)
  .sort((a, b) => b.count - a.count);

console.log("Total posts:", rows.length);
console.log("Unique image sources:", groups.size);
console.log("Duplicate sources:", duplicates.length);
console.log("");

for (const d of duplicates) {
  console.log(`- ${d.count}x ${d.source}`);
  for (const it of d.items) {
    console.log(`  - ${it.date} ${it.slug}`);
  }
}


