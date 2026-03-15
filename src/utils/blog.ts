export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  content: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
};

const STORAGE_KEY = "ffp_blog_posts_v1";

function isBrowser() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function safeJsonParse<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export function slugify(input: string) {
  // 한글/영문/숫자/공백/하이픈 위주로 간단하게 정리
  const trimmed = input.trim();
  const normalized = trimmed
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "") // 문자/숫자/공백/하이픈만 남김 (유니코드 지원)
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return normalized || "post";
}

export const DEFAULT_STORAGE_GUIDE_POST: Omit<BlogPost, "id" | "createdAt" | "updatedAt"> = {
  slug: "ingredient-storage-expiration-guide",
  title: "식재료 보관/유통기한 가이드: 안전하고 낭비 없이 쓰는 기본 원칙",
  content: `## 왜 ‘보관’이 중요할까요?
식재료는 **온도·습도·공기·시간**에 따라 품질과 안전성이 크게 달라집니다. 같은 재료라도 보관 방법을 조금만 바꾸면 음식물 쓰레기를 줄이고, 맛을 더 오래 유지할 수 있어요.

## 유통기한 vs 소비기한(또는 품질유지기한)
- 유통기한: **판매가 가능한 기간**(매장에서 진열/판매 기준)
- 소비기한(또는 품질유지기한): **권장 섭취 기간**에 가까운 개념

> 주의: 표기된 날짜보다 더 중요한 건 **보관 상태**입니다. 냄새, 색, 점액(미끈거림), 곰팡이, 포장 팽창 등 변질 신호가 있으면 날짜와 무관하게 폐기하세요.

## 냉장고 기본 구역별 보관 팁
- 문쪽 선반: 온도 변동이 커서 **소스/음료/가공식품** 위주
- 중간 선반: 비교적 온도가 일정 → **반찬/유제품/조리된 음식**
- 아래 칸(야채칸): 습도 유지 → **채소/과일**(일부 과일은 실온 권장)

## 채소/과일 보관(신선도 유지 핵심)
- 잎채소(상추, 시금치 등): 씻은 뒤 물기를 제거하고 **키친타월로 감싸 밀폐 용기**에 보관
- 버섯: 물에 오래 닿으면 쉽게 무르므로 **종이봉투/키친타월**로 감싸 습기 조절
- 딸기/베리류: 씻지 말고 **마른 상태로 밀폐**, 먹기 직전에 세척
- 바나나/토마토: 저온에서 풍미가 떨어질 수 있어 **실온**이 더 나은 경우가 많습니다(상황에 따라 냉장 가능)

## 육류/생선(위생이 최우선)
구매 후 시간이 지날수록 세균이 증식할 수 있으니, 가능하면 **당일 또는 다음 날 조리**를 권장합니다.
- 소분: 1회 조리량으로 **지퍼백/용기**에 나눠 냉동
- 교차오염 방지: 생고기/생선은 **아래 칸**에 보관(핏물이 흐르지 않도록 2중 포장)
- 해동 원칙: 실온 해동보다 **냉장 해동**이 안전
  - 급할 때: 밀봉 후 **찬물 해동**
  - 전자레인지 해동: 부분적으로 익을 수 있어 **바로 조리할 때만** 사용

## 남은 음식/조리된 음식 보관
- 완전히 식힌 뒤 보관(단, 너무 오래 상온에 두지 않기)
- 가능한 한 **얕은 용기**에 담아 빨리 식히기
- 보관 기간이 길어질수록 풍미/식감이 떨어지므로 **‘언제 만들었는지’ 라벨**을 붙이면 좋습니다.

## “버려야 하는” 변질 신호 체크리스트
- 포장이 빵빵하게 부풀어 오름(가스 발생)
- 시큼한 냄새, 암모니아 냄새, 썩는 냄새
- 표면 점액/끈적임이 심해짐
- 색이 비정상적으로 변함(회색/녹색/검은 반점 등)
- 곰팡이(일부만 제거해도 내부에 퍼져 있을 수 있음)

## 한 줄 요약
보관은 ‘감’이 아니라 **규칙**입니다. “소분-밀봉-빠른 냉각-안전 해동-교차오염 차단”만 지켜도 안전성과 만족도가 확 올라갑니다.

## 추가로 알아두면 좋은 실전 팁
- 라벨링: 개봉/조리/냉동 날짜를 적어두면 “언제까지 먹어야 하지?” 고민이 줄어듭니다.
- 냉동은 ‘품질 유지’가 핵심: 냉동하면 부패 속도는 느려지지만, **수분 손실/냄새 배임**으로 식감이 떨어질 수 있어요. 지퍼백으로 최대한 공기를 빼서 냉동하세요.
- 냄새 강한 재료(파, 마늘, 김치 등): 반드시 **이중 밀폐**해서 다른 재료에 냄새가 배지 않게 합니다.
- 계란: 문쪽 선반보다 온도 변화가 적은 안쪽 칸이 유리한 경우가 많습니다. 깨진 계란은 섭취하지 마세요.

## 자주 묻는 질문(FAQ)
### 해동한 고기를 다시 얼려도 되나요?
가능은 하지만 권장하지 않습니다. 특히 실온에 오래 두었다면 위험할 수 있어요. 부득이하면 **완전히 익혀서(가열 조리 후) 냉동**하는 쪽이 상대적으로 안전합니다.

### 곰팡이가 ‘일부만’ 생겼는데 떼고 먹어도 되나요?
재료에 따라 다르지만, 일반적으로는 권장하지 않습니다. 곰팡이는 눈에 보이는 부분 외에도 내부로 퍼져 있을 수 있습니다.

> 면책: 이 글은 일반적인 정보 제공 목적이며, 개인 건강 상태/식품 상태에 따라 달라질 수 있습니다. 의심될 때는 섭취하지 않는 것이 가장 안전합니다.
`,
};

export function getBlogPosts(): BlogPost[] {
  if (!isBrowser()) return [];

  const parsed = safeJsonParse<BlogPost[]>(localStorage.getItem(STORAGE_KEY));
  const posts = Array.isArray(parsed) ? parsed : [];

  // 최초 진입 시: 기본 정보성 게시글을 시드로 넣어, /blog가 항상 “컨텐츠 있음” 상태가 되도록 보장
  if (posts.length === 0) {
    const now = new Date().toISOString();
    const seeded: BlogPost = {
      id: `seed-${DEFAULT_STORAGE_GUIDE_POST.slug}`,
      slug: DEFAULT_STORAGE_GUIDE_POST.slug,
      title: DEFAULT_STORAGE_GUIDE_POST.title,
      content: DEFAULT_STORAGE_GUIDE_POST.content,
      createdAt: now,
      updatedAt: now,
    };
    const next = [seeded];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return next;
  }

  // 최신 글이 위로 오도록 정렬
  return [...posts].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  const posts = getBlogPosts();
  return posts.find((p) => p.slug === slug);
}

export function upsertBlogPost(input: { slug?: string; title: string; content: string }): BlogPost {
  if (!isBrowser()) {
    // SSR에서 호출되면 위험하니, 최소 동작을 위해 메모리상으로만 생성 형태를 반환
    const now = new Date().toISOString();
    const slug = input.slug ?? `${Date.now()}-${slugify(input.title)}`;
    return {
      id: `tmp-${slug}`,
      slug,
      title: input.title,
      content: input.content,
      createdAt: now,
      updatedAt: now,
    };
  }

  const now = new Date().toISOString();
  const prev = getBlogPosts();

  const desiredSlug = input.slug ?? `${Date.now()}-${slugify(input.title)}`;
  const existing = prev.find((p) => p.slug === desiredSlug);

  let next: BlogPost[];
  let saved: BlogPost;

  if (existing) {
    saved = {
      ...existing,
      title: input.title,
      content: input.content,
      updatedAt: now,
    };
    next = prev.map((p) => (p.slug === desiredSlug ? saved : p));
  } else {
    saved = {
      id: `post-${desiredSlug}`,
      slug: desiredSlug,
      title: input.title,
      content: input.content,
      createdAt: now,
      updatedAt: now,
    };
    next = [saved, ...prev];
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return saved;
}

export function deleteBlogPost(slug: string) {
  if (!isBrowser()) return;
  const prev = getBlogPosts();
  const next = prev.filter((p) => p.slug !== slug);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}


