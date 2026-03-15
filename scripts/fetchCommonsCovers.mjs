import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import sharp from "sharp";

const ROOT = process.cwd();
const BLOG_DIR = path.join(ROOT, "src", "content", "blog");
const OUT_DIR = path.join(ROOT, "public", "blog-images", "covers");

function getSlugFromFilename(filename) {
  const base = filename.replace(/\.md$/, "");
  const maybe = base.replace(/^\d{4}-\d{2}-\d{2}-/, "");
  return maybe || base;
}

function listAllPosts() {
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".md"));
  return files
    .map((filename) => {
      const full = path.join(BLOG_DIR, filename);
      const raw = fs.readFileSync(full, "utf8");
      const parsed = matter(raw);
      const fm = parsed.data ?? {};
      const slug = getSlugFromFilename(filename);
      const title = String(fm.title ?? slug);
      const date = String(fm.date ?? filename.slice(0, 10));
      const tags = Array.isArray(fm.tags) ? fm.tags.map(String) : [];
      return { filename, full, slug, title, date, tags };
    })
    .sort((a, b) => b.date.localeCompare(a.date)); // 최신 순
}

// 첫 페이지는 "주제에 맞는 촬영 사진"으로 고정(Commons File 타이틀)
// - Commons File 페이지에 라이선스/저자 정보가 있으므로, 글 하단에 출처 링크를 자동으로 넣습니다.
const PREFERRED_FILES = {
  "ingredient-storage-expiration-guide": "File:Fruits and Vegetables in Refrigerator - 50838357566.jpg",
  "safe-thawing-cross-contamination": "File:Food-drink-kitchen-cutting-board (24326086625).jpg",
  "nutrition-balanced-meal-for-beginners": "File:Healthy salad bowl (42231145040).jpg",
  "recipe-search-and-adaptation-tips": "File:Cookbook stand in kitchen on counter with cutting board and knife with basil leaves (18501227740).jpg",
  "allergy-and-dietary-restrictions-guide": "File:Packaging of food products in Israel, April 2024 24.jpg",
  "grocery-checklist-and-budget-meal-prep": "File:Healthy Grocery Shopping (Unsplash).jpg",
  "fridge-organization-first-in-first-out": "File:Open refrigerator with food at night.jpg",
  "freezer-quality-and-freezer-burn": "File:Freezer cabinet with food.jpg",
  "leftovers-storage-and-reheating-safety": "File:Meal prep food container (43991880552).jpg",
  "protein-intake-realistic-strategies": "File:The protein meal.jpg",
};

const NEG = "-pdf -djvu -tif -tiff -ogg -webm -mp4 -mp3 -wav";

// slug -> 검색어(여러 개면 순차 시도)
const QUERIES = {
  "ingredient-storage-expiration-guide": [
    `refrigerator vegetables Unsplash ${NEG}`,
    `fridge vegetables Unsplash ${NEG}`,
    `refrigerator vegetables organized ${NEG}`,
    `fridge vegetables ${NEG}`,
  ],
  "safe-thawing-cross-contamination": [`cutting board kitchen hygiene ${NEG}`, `food safety kitchen ${NEG}`],
  "nutrition-balanced-meal-for-beginners": [`healthy salad bowl meal ${NEG}`, `balanced meal plate ${NEG}`],
  "recipe-search-and-adaptation-tips": [`cooking recipe notebook kitchen ${NEG}`, `cooking ingredients kitchen ${NEG}`],
  "allergy-and-dietary-restrictions-guide": [
    `supermarket label Unsplash ${NEG}`,
    `food label Unsplash ${NEG}`,
    `ingredients label package Unsplash ${NEG}`,
    `supermarket label reading ${NEG}`,
  ],
  "grocery-checklist-and-budget-meal-prep": [`grocery shopping basket produce ${NEG}`, `shopping cart produce ${NEG}`],
  "fridge-organization-first-in-first-out": [
    `organized fridge interior Unsplash ${NEG}`,
    `refrigerator interior Unsplash ${NEG}`,
    `organized fridge interior ${NEG}`,
    `refrigerator shelf ${NEG}`,
  ],
  "freezer-quality-and-freezer-burn": [`freezer frozen food storage ${NEG}`, `frozen food freezer ${NEG}`],
  "leftovers-storage-and-reheating-safety": [
    `leftovers container Unsplash ${NEG}`,
    `meal prep containers Unsplash ${NEG}`,
    `food storage containers Unsplash ${NEG}`,
    `leftovers food container ${NEG}`,
    `meal prep container ${NEG}`,
  ],
  "protein-intake-realistic-strategies": [`eggs chicken protein meal ${NEG}`, `high protein meal ${NEG}`],
};

const REQUIRED_TITLE_WORDS = {
  "ingredient-storage-expiration-guide": ["refrigerator", "fridge"],
  "safe-thawing-cross-contamination": ["cutting", "board", "kitchen", "food"],
  "nutrition-balanced-meal-for-beginners": ["salad", "bowl", "meal", "plate"],
  "recipe-search-and-adaptation-tips": ["cooking", "kitchen", "ingredients", "recipe"],
  "allergy-and-dietary-restrictions-guide": ["unsplash", "label", "supermarket"],
  "grocery-checklist-and-budget-meal-prep": ["grocery", "shopping", "basket", "produce"],
  "fridge-organization-first-in-first-out": ["refrigerator", "fridge", "shelf", "interior"],
  "freezer-quality-and-freezer-burn": ["freezer", "frozen"],
  "leftovers-storage-and-reheating-safety": ["leftover", "container", "meal", "storage", "food"],
  "protein-intake-realistic-strategies": ["protein", "egg", "eggs", "chicken"],
};

const BANNED_TITLE_WORDS = {
  "ingredient-storage-expiration-guide": ["christmas", "souvenir", "magnet"],
  "fridge-organization-first-in-first-out": ["souvenir", "magnet"],
  "leftovers-storage-and-reheating-safety": ["waste", "barrel", "mcdonald", "trash"],
  "allergy-and-dietary-restrictions-guide": ["label 2014", "facts label 2014"], // 라벨 템플릿(사진 아님) 가능성 낮추기
};

function mdPathFromSlug(slug) {
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".md"));
  const found = files.find((f) => f.replace(/\.md$/, "").replace(/^\d{4}-\d{2}-\d{2}-/, "") === slug);
  if (!found) return null;
  return path.join(BLOG_DIR, found);
}

function categoryFromTags(tags = []) {
  const t = new Set(tags.map(String));
  if (t.has("영양") || t.has("식단") || t.has("탄단지") || t.has("단백질") || t.has("나트륨") || t.has("탄수화물")) return "nutrition";
  if (t.has("레시피") || t.has("조리팁") || t.has("응용") || t.has("에어프라이어") || t.has("팬요리")) return "recipe";
  if (t.has("알레르기") || t.has("식이제한") || t.has("글루텐") || t.has("유당") || t.has("견과") || t.has("라벨")) return "allergy";
  if (t.has("장보기") || t.has("예산") || t.has("밀프렙") || t.has("식비") || t.has("재고관리")) return "grocery";
  return "storage";
}

function buildQueriesForPost(post) {
  // Commons 검색어는 영문이 잘 먹혀서, 카테고리 기반으로 안전한 후보를 넓게 잡습니다.
  const baseNeg = NEG;
  const cat = categoryFromTags(post.tags);

  const templates = {
    storage: [
      `refrigerator food ${baseNeg}`,
      `food storage container kitchen ${baseNeg}`,
      `vegetables in refrigerator ${baseNeg}`,
      `freezer frozen food ${baseNeg}`,
    ],
    nutrition: [
      `healthy meal plate ${baseNeg}`,
      `healthy salad bowl ${baseNeg}`,
      `balanced diet meal ${baseNeg}`,
      `high protein meal ${baseNeg}`,
    ],
    recipe: [
      `cooking ingredients kitchen ${baseNeg}`,
      `cookbook kitchen counter ${baseNeg}`,
      `cutting board kitchen ${baseNeg}`,
      `home cooking kitchen ${baseNeg}`,
    ],
    allergy: [
      `food packaging label ${baseNeg}`,
      `nutrition label photo ${baseNeg}`,
      `ingredients label ${baseNeg}`,
      `supermarket shopping label ${baseNeg}`,
    ],
    grocery: [
      `grocery shopping basket produce ${baseNeg}`,
      `shopping cart produce ${baseNeg}`,
      `meal prep containers ${baseNeg}`,
      `grocery store produce ${baseNeg}`,
    ],
  };

  // PREFERRED가 없는 글은 이 템플릿으로 검색
  return templates[cat] ?? templates.storage;
}

// slug별로 더 주제에 맞는 쿼리를 앞에 추가(중복/엇나감 줄이기)
const SLUG_QUERIES = {
  "carb-timing-and-sugar-control": [`rice bowl meal ${NEG}`, `bread breakfast ${NEG}`, `fruit yogurt bowl ${NEG}`],
  "sodium-control-without-bland-food": [`soup bowl kitchen ${NEG}`, `kimchi side dish ${NEG}`, `salt seasoning kitchen ${NEG}`],
  "airfryer-consistency-routine": [`air fryer kitchen ${NEG}`, `airfryer food ${NEG}`],
  "seasoning-ratio-templates-korean": [`spices jars kitchen ${NEG}`, `soy sauce bottle kitchen ${NEG}`],
  "stew-depth-flavor-without-msg": [`soup pot stove ${NEG}`, `stew pot kitchen ${NEG}`],
  "vegetable-storage-by-type": [`vegetables in refrigerator bin ${NEG}`, `fresh vegetables fridge ${NEG}`],
  "meat-fish-30min-routine": [`raw meat kitchen prep ${NEG}`, `fish fillet kitchen ${NEG}`],
  "sauce-and-oil-storage-rancidity": [`olive oil bottle kitchen ${NEG}`, `cooking oil bottle ${NEG}`],
  "vegetable-intake-strategies": [`salad bowl vegetables ${NEG}`, `vegetable side dish ${NEG}`],
  "snack-strategy-prevent-binge": [`healthy snack ${NEG}`, `nuts fruit snack ${NEG}`, `yogurt fruit ${NEG}`],
  "pan-heat-control-no-burning": [`frying pan stove ${NEG}`, `saute pan kitchen ${NEG}`],
  "batch-cooking-standardization": [`commercial kitchen cooking ${NEG}`, `large pot kitchen ${NEG}`],
  "substitution-cheat-sheet": [`cooking ingredients assortment ${NEG}`, `kitchen ingredients ${NEG}`],
  "allergy-label-reading-examples": [`food packaging label ${NEG}`, `nutrition label photo ${NEG}`],
  "gluten-free-shopping-checklist": [`bread gluten free ${NEG}`, `grocery aisle bread ${NEG}`],
  "lactose-reduced-day-plan": [`soy milk carton ${NEG}`, `breakfast bowl ${NEG}`],
  "nut-free-baking-safety": [`baking ingredients kitchen ${NEG}`, `cookie tray kitchen ${NEG}`],
  "weekly-budget-templates": [`shopping cart supermarket ${NEG}`, `grocery receipt ${NEG}`],
  "meal-prep-workflow-90min": [`meal prep containers ${NEG}`, `meal prep kitchen counter ${NEG}`],
  "pantry-to-meal-3-formulas": [`pantry shelves food ${NEG}`, `kitchen pantry jars ${NEG}`],
  "bulk-buying-decision-guide": [`bulk food store aisle ${NEG}`, `shopping cart bulk ${NEG}`],
  "minimal-food-log-routine": [`food journal notebook ${NEG}`, `meal photo phone ${NEG}`],
  "balanced-meal-for-school-cafeteria": [`school cafeteria meal ${NEG}`, `cafeteria tray meal ${NEG}`],
};

async function commonsSearch(query) {
  const url = new URL("https://commons.wikimedia.org/w/api.php");
  url.searchParams.set("action", "query");
  url.searchParams.set("list", "search");
  url.searchParams.set("srnamespace", "6"); // File:
  url.searchParams.set("srlimit", "50");
  url.searchParams.set("srsearch", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("origin", "*");

  const res = await fetch(url.toString(), { headers: { "User-Agent": "food-forge-pro/1.0" } });
  if (!res.ok) throw new Error(`Commons search failed: ${res.status}`);
  const json = await res.json();
  return json?.query?.search ?? [];
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function commonsSearchPaged(query, maxOffset = 250) {
  // Commons search 결과가 편향될 수 있어 offset을 이동하며 더 많은 후보를 확보합니다.
  for (let offset = 0; offset <= maxOffset; offset += 50) {
    const url = new URL("https://commons.wikimedia.org/w/api.php");
    url.searchParams.set("action", "query");
    url.searchParams.set("list", "search");
    url.searchParams.set("srnamespace", "6");
    url.searchParams.set("srlimit", "50");
    url.searchParams.set("sroffset", String(offset));
    url.searchParams.set("srsearch", query);
    url.searchParams.set("format", "json");
    url.searchParams.set("origin", "*");

    const res = await fetch(url.toString(), { headers: { "User-Agent": "food-forge-pro/1.0" } });
    if (!res.ok) throw new Error(`Commons search failed: ${res.status}`);
    const json = await res.json();
    const results = json?.query?.search ?? [];
    if (results.length > 0) return results;
  }
  return [];
}

function pickImageTitle(results) {
  // 제목 예: "File:Something.jpg"
  const jpg = results.find((r) => /\.jpe?g$/i.test(r.title));
  if (jpg?.title) return { title: jpg.title, ext: "jpg" };
  const png = results.find((r) => /\.png$/i.test(r.title));
  if (png?.title) return { title: png.title, ext: "png" };
  return null;
}

function pickImageTitleWithHint(results, requiredWords = [], bannedWords = []) {
  const words = (requiredWords ?? []).map((w) => w.toLowerCase());
  const banned = (bannedWords ?? []).map((w) => w.toLowerCase());
  const candidates = results
    .map((r) => r.title)
    .filter((t) => /\.(jpe?g|png)$/i.test(t))
    .filter((t) => (banned.length === 0 ? true : !banned.some((b) => t.toLowerCase().includes(b))))
    .filter((t) => (words.length === 0 ? true : words.some((w) => t.toLowerCase().includes(w))));

  if (candidates.length > 0) {
    const first = candidates[0];
    return { title: first };
  }

  // 힌트로 못 찾으면 확장: 그냥 이미지 확장자만이라도
  const fallback = results.map((r) => r.title).find((t) => /\.(jpe?g|png)$/i.test(t));
  return fallback ? { title: fallback } : null;
}

function pickUniqueImageTitle(results, { requiredWords = [], bannedWords = [], usedTitles = new Set() } = {}) {
  const words = (requiredWords ?? []).map((w) => w.toLowerCase());
  const banned = (bannedWords ?? []).map((w) => w.toLowerCase());

  const candidates = (results ?? [])
    .map((r) => r.title)
    .filter((t) => /\.(jpe?g|png)$/i.test(t))
    .filter((t) => (banned.length === 0 ? true : !banned.some((b) => t.toLowerCase().includes(b))))
    .filter((t) => (words.length === 0 ? true : words.some((w) => t.toLowerCase().includes(w))))
    .filter((t) => !usedTitles.has(t));

  if (candidates.length > 0) return candidates[0];

  // 힌트/중복을 못 만족하면, 확장: 중복만 피하고 확장자만 만족하는 후보
  const fallback = (results ?? [])
    .map((r) => r.title)
    .filter((t) => /\.(jpe?g|png)$/i.test(t))
    .filter((t) => (banned.length === 0 ? true : !banned.some((b) => t.toLowerCase().includes(b))))
    .find((t) => !usedTitles.has(t));

  return fallback ?? null;
}

function commonsFilePageUrl(fileTitle) {
  // fileTitle includes "File:..."
  return `https://commons.wikimedia.org/wiki/${encodeURIComponent(fileTitle.replaceAll(" ", "_"))}`;
}

function commonsFilePathUrl(fileTitle, width = 1200) {
  // Special:FilePath expects filename without "File:" prefix
  const filename = fileTitle.replace(/^File:/i, "");
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(filename)}?width=${width}`;
}

async function downloadTo(url, outFile) {
  const res = await fetch(url, { headers: { "User-Agent": "food-forge-pro/1.0" } });
  if (!res.ok) throw new Error(`Download failed: ${res.status} ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 50_000) throw new Error(`Downloaded file too small (${buf.length} bytes): ${url}`);
  fs.writeFileSync(outFile, buf);
  return buf.length;
}

async function downloadAndEnsureJpg(filePathUrl, outJpgFile) {
  // Commons는 간헐적으로 429(rate limit)이 발생할 수 있어 재시도합니다.
  let lastErr = null;
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await fetch(filePathUrl, { headers: { "User-Agent": "food-forge-pro/1.0" } });
    if (res.ok) {
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 50_000) throw new Error(`Downloaded file too small (${buf.length} bytes): ${filePathUrl}`);

      // 어떤 포맷이 오든 JPG로 저장(커버 경로 고정)
      await sharp(buf).jpeg({ quality: 86, mozjpeg: true }).toFile(outJpgFile);
      const len = fs.statSync(outJpgFile).size;
      if (len < 50_000) throw new Error(`Converted JPG too small (${len} bytes): ${outJpgFile}`);
      return len;
    }

    // 429/5xx는 대기 후 재시도
    if (res.status === 429 || res.status >= 500) {
      lastErr = new Error(`Download failed: ${res.status} ${filePathUrl}`);
      await sleep(600 * Math.pow(2, attempt));
      continue;
    }

    throw new Error(`Download failed: ${res.status} ${filePathUrl}`);
  }

  throw lastErr ?? new Error(`Download failed: ${filePathUrl}`);

}

function upsertAttributionToMarkdown(body, filePageUrl) {
  const trimmed = body.trim();
  const re = /이미지 출처:\s*([^\n]+)/;
  if (re.test(trimmed)) {
    return trimmed.replace(re, `이미지 출처: ${filePageUrl}`) + "\n";
  }
  return `${trimmed}\n\n---\n\n이미지 출처: ${filePageUrl}\n`;
}

function shouldSkipBecauseAlreadyPhoto(mdFile, slug) {
  // 이미 coverImage가 /blog-images/covers/<slug>.jpg 이고 파일이 충분히 크면 스킵
  try {
    const raw = fs.readFileSync(mdFile, "utf8");
    const parsed = matter(raw);
    const fm = parsed.data ?? {};
    const desired = `/blog-images/covers/${slug}.jpg`;
    const cover = String(fm.coverImage ?? "");
    if (cover !== desired) return false;
    const outPath = path.join(OUT_DIR, `${slug}.jpg`);
    if (!fs.existsSync(outPath)) return false;
    const size = fs.statSync(outPath).size;
    return size >= 50_000;
  } catch {
    return false;
  }
}

function getFileTitleFromAttribution(markdownContent) {
  // e.g. 이미지 출처: https://commons.wikimedia.org/wiki/File:Something.jpg
  const m = String(markdownContent).match(/이미지 출처:\s*(https:\/\/commons\.wikimedia\.org\/wiki\/[^\s]+)/);
  if (!m) return null;
  const url = m[1];
  const part = url.split("/wiki/")[1];
  if (!part) return null;
  return decodeURIComponent(part).replaceAll("_", " "); // "File:..."
}

function getExistingCoverFileTitle(mdFile) {
  try {
    const raw = fs.readFileSync(mdFile, "utf8");
    const parsed = matter(raw);
    return getFileTitleFromAttribution(parsed.content);
  } catch {
    return null;
  }
}

async function main() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const posts = listAllPosts();
  const keepFirstN = Number(process.env.KEEP_FIRST_N || "0");
  const usedTitles = new Set();

  // 1) 이미 들어있는 출처들을 모두 모아 중복을 감지/회피할 수 있게 합니다.
  for (const p of posts) {
    const existing = getExistingCoverFileTitle(p.full);
    if (existing) usedTitles.add(existing);
  }

  // 2) 상위 N개(사용자가 만족하는 1~2페이지)는 유지하고, 그 이미지를 "고정 사용"으로 간주합니다.
  const keepSlugs = new Set(posts.slice(0, Math.max(0, keepFirstN)).map((p) => p.slug));

  // 3) 이제부터는 keepSlugs를 제외한 글들만 "중복 없는 이미지"로 재선택합니다.
  for (const p of posts) {
    const slug = p.slug;
    const mdFile = p.full;

    if (keepSlugs.has(slug)) {
      console.log(`[${slug}] keep (page 1~2)`);
      continue;
    }

    let fileTitle = PREFERRED_FILES[slug] ?? null;
    let results = [];

    // 1) first-page처럼 선호 파일이 있으면 그대로 사용
    if (fileTitle) {
      console.log(`\n[${slug}] using preferred Commons file: ${fileTitle}`);
    } else {
      // 2) 없으면: 태그 기반 템플릿 쿼리로 검색
      const queryList = [
        ...(SLUG_QUERIES[slug] ?? []),
        ...(QUERIES[slug] ?? []),
        ...buildQueriesForPost(p),
      ];
      const hint = REQUIRED_TITLE_WORDS[slug] ?? [];
      const banned = BANNED_TITLE_WORDS[slug] ?? [];

      for (const q of queryList) {
        console.log(`\n[${slug}] searching Commons: ${q}`);
        results = await commonsSearchPaged(q, 250);
        const picked = pickUniqueImageTitle(results, { requiredWords: hint, bannedWords: banned, usedTitles });
        if (picked) {
          fileTitle = picked;
          break;
        }
      }

      if (!fileTitle) {
        console.log(`[${slug}] debug titles:`, results.slice(0, 10).map((r) => r.title));
        throw new Error(`No suitable image (jpg/png) found for slug: ${slug}`);
      }
    }

    const filePage = commonsFilePageUrl(fileTitle);
    const filePath = commonsFilePathUrl(fileTitle, 1200);
    const outPath = path.join(OUT_DIR, `${slug}.jpg`);

    console.log(`[${slug}] downloading: ${fileTitle}`);
    const size = await downloadAndEnsureJpg(filePath, outPath);
    console.log(`[${slug}] saved (${size} bytes): ${path.relative(ROOT, outPath)}`);
    usedTitles.add(fileTitle);
    // Commons rate-limit 회피용 짧은 딜레이
    await sleep(350);

    // frontmatter 업데이트 + attribution 라인 추가
    const raw = fs.readFileSync(mdFile, "utf8");
    const parsed = matter(raw);
    const fm = parsed.data ?? {};
    fm.coverImage = `/blog-images/covers/${slug}.jpg`;
    fm.coverAlt = fm.coverAlt || String(fm.title || slug);

    const nextBody = upsertAttributionToMarkdown(parsed.content, filePage);
    const nextRaw = matter.stringify(nextBody, fm);
    fs.writeFileSync(mdFile, nextRaw, "utf8");
    console.log(`[${slug}] markdown updated: ${path.relative(ROOT, mdFile)}`);
  }

  console.log("\n✅ Done: all covers replaced/verified with Wikimedia Commons photos");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


