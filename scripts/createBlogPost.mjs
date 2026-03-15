import fs from "node:fs";
import path from "node:path";

function getArgValue(flag) {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return null;
  return process.argv[idx + 1] ?? null;
}

function slugify(input) {
  const trimmed = (input ?? "").trim();
  const normalized = trimmed
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return normalized || "post";
}

function today() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

const title = getArgValue("--title") || getArgValue("-t");
if (!title) {
  console.error("사용법: npm run blog:new -- --title \"제목\" [--description \"설명\"] [--tags \"a,b,c\"]");
  process.exit(1);
}

const description = getArgValue("--description") || "";
const tagsRaw = getArgValue("--tags") || "";
const tags = tagsRaw
  .split(",")
  .map((t) => t.trim())
  .filter(Boolean);

const date = today();
const slug = slugify(title);
const filename = `${date}-${slug}.md`;
const targetDir = path.join(process.cwd(), "src", "content", "blog");
const targetPath = path.join(targetDir, filename);

if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
if (fs.existsSync(targetPath)) {
  console.error(`이미 존재합니다: ${targetPath}`);
  process.exit(1);
}

const frontmatter = `---\n` +
  `title: "${title.replaceAll('"', '\\"')}"\n` +
  `description: "${description.replaceAll('"', '\\"')}"\n` +
  `date: "${date}"\n` +
  `tags: [${tags.map((t) => `"${t.replaceAll('"', '\\"')}"`).join(", ")}]\n` +
  `---\n\n`;

const body = `## 요약\n- (한 문장 요약)\n\n## 본문\n(여기에 정보성 컨텐츠를 작성하세요)\n\n## 체크리스트\n- [ ] (항목)\n`;

fs.writeFileSync(targetPath, frontmatter + body, "utf8");

console.log(`✅ 새 글 생성 완료: ${path.relative(process.cwd(), targetPath)}`);


