<img width="1344" height="483" alt="Image" src="https://github.com/user-attachments/assets/c8f1921c-69f0-4665-9c02-d213096feaee" />

# auto-diet 웹사이트

인원, 예산, 운영 요일만 입력하면 식단을 자동 생성하는 급식소 관리 서비스

---

## 프로젝트 개요

| 항목 | 내용 |
|------|------|
| **개발 기간** | 2025.12 |
| **프로젝트 유형** | 개인 프로젝트 |
| **핵심 기술** | Next.js, TypeScript, Supabase, TanStack Query, Tailwind CSS |
| **배포 링크** | [바로가기](https://auto-diet.vercel.app/) |

---


## 🎯 프로젝트 목적

"반복되는 식단 고민, 시스템이 짠다."

영양사가 매번 식단을 짜고 영양·원가를 따로 계산하는 반복 업무를 없애기 위해 개발한 식단 자동화 서비스입니다.<br>
식약처 영양 DB와 농수산식품유통공사 시세 데이터를 연동해 식단 생성부터 영양·원가 확인까지 자동화합니다.

| 구분 | 내용 |
|------|------|
| **기존 방식** | 영양사가 직접 메뉴를 선정하고, 영양 정보와 식재료 원가를 별도로 조회·계산 |
| **본 서비스** | 인원·예산·운영 요일을 입력하면 식단을 자동 생성하고, 영양 정보와 실시간 원가를 자동 반영 |
| **효과** | 반복적인 식단 작성·원가 계산 업무를 줄이고, 예산 초과·메뉴 중복 없는 식단을 빠르게 확보 |

---

## 🖥️ AI 활용 개발 방식

이 프로젝트는 **바이브 코딩(Vibe Coding)** 방식으로 개발했습니다.<br>
AI에게 원하는 결과를 설명하고 실행 결과를 보며 진행하는 방식입니다.

**사용 도구:** ChatGPT, Lovable, Cursor

**개발 흐름:**

1. ChatGPT와 기능 요구사항 및 기술 방향 논의·구체화
2. ChatGPT로 최종 프롬프트 작성
3. Lovable에서 초기 코드 생성
4. Lovable에서 동작 확인 및 수정 후 GitHub push
5. 로컬 clone 후 Cursor에서 세부 기능 구현 및 코드 수정
6. 실행하여 기능 동작 여부 확인
7. 오류 발생 시 문제 상황을 설명하고 수정 요청
8. 정상 작동할 때까지 반복 수정
9. 정상 동작 확인 후 성능 최적화 요청
10. 최종 동작 확인 후 배포

**개발자 역할**: 기능·기술·성능 요구사항 결정, 비즈니스 로직 설계, AI 결과물 검증 및 동작 판단<br>
**AI 역할**: 코드 작성, 오류 수정, 구조 설계 제안

---

## ✨ 주요 기능

- 설정 기반 1~4주 식단 자동 생성
- 범위 메뉴 중복 방지
- 칼로리·나트륨·단백질 자동 반영
- 실시간 시세 기반 원가 계산
- 메뉴 재생성, 특별식 설정
- AI 영양 균형 분석 및 개선 제안
- 알레르기 항목 포함 메뉴 경고 표시

---

## 🏗️ 초기 기획 프롬프트

프롬프트 작성에 특화된 ChatGPT를 활용해 개발용 프롬프트를 구체화했습니다.<br>
이를 통해 생성된 최종 프롬프트를 Lovable에 입력하여 개발을 진행했습니다.<br>
PRD 문서 기반 기획 - PRD → 프롬프트 변환 -  AI 기반 코드 생성
<details>
 <summary>ChatGPT 넣을 프롬프트 예시 전체 내용 보기</summary>

```text

당신은 시니어 프로덕트 매니저이자 풀스택 개발자입니다.

아래 PRD를 기반으로 실제 서비스 수준의 개발을 단계적으로 진행하세요.

이 프로젝트는 영양사를 위한 "식단 자동 생성 웹 서비스"입니다.

-------------------------------------
프로젝트명: AutoDiet Planner
-------------------------------------

1. 문제 정의 (Problem Statement)

영양사는 매주 또는 매월 식단을 직접 작성해야 합니다.
이 작업은 반복적이고 시간이 많이 들며 오류가 발생하기 쉽습니다.

문제점:
- 매번 밥, 국, 반찬 조합을 직접 구성해야 함
- 영양소를 수동으로 계산해야 함
- 알레르기 정보를 직접 확인해야 함
- 이전 식단을 효율적으로 재사용하기 어려움

핵심 문제:
반복적인 식단 작성 업무로 인해 시간과 효율이 크게 낭비됨

-------------------------------------

2. 해결책 (Solution)

사용자가 설정한 조건을 기반으로 식단을 자동 생성하는 웹 서비스를 개발합니다.

시스템 기능:
- 주간/월간 식단 자동 생성
- 영양소 및 알레르기 자동 검증
- 식재료 원가 기반 예산 계산
- 부분 재생성 기능 제공
- 식단 저장 및 재사용 기능

목표:
클릭 몇 번으로 1주~1달 식단을 자동 생성할 수 있도록 한다.

-------------------------------------

3. 핵심 기능 (Core Features)

3.1 자동 식단 생성

사용자 설정:
- 하루 2끼 또는 3끼
- 주 5일 또는 6일

각 식사 구성:
- 밥 1개
- 국 1개
- 반찬 4개

반찬 구성 규칙:
1. 김치류 또는 절임류 1개
2. 야채 반찬 1개
3. 고기 반찬 1개
4. 고기 또는 달걀/어묵 등 원가 반찬 1개

추가 반찬도 선택적으로 가능

요구사항:
- 동일 메뉴 반복 최소화
- 식단 다양성 유지

-------------------------------------

3.2 영양 및 알레르기 검증

- 칼로리 자동 계산
- 탄수화물 / 단백질 / 지방 비율 계산
- 알레르기 식재료 자동 탐지
- 기준을 벗어나는 식단 경고 표시

-------------------------------------

3.3 원가 및 예산 검증

사용자 입력:
- 식사 인원 수
- 1인 식사 가격
- 식재료 원가 비율 (예: 35%)

시스템 기능:
- 총 식재료 비용 계산
- 예산 초과 시 경고 표시

-------------------------------------

3.4 식단 히스토리 관리

- 식단 저장
- 수정 이력 관리
- 이전 식단 복사 기능
- PDF / Excel 다운로드

-------------------------------------

3.5 커스터마이징

사용자는 다음을 설정 가능:
- 하루 식사 횟수
- 주간 운영 일수
- 반찬 개수
- 반찬 구성 규칙
- 인원 수
- 원가 비율

-------------------------------------

3.6 부분 재생성 기능

사용자는 다음이 가능해야 함:
- 특정 반찬만 재생성
- 한 끼 전체 재생성
- 하루 전체 재생성

재생성 시:
- 영양 및 원가 자동 재계산

-------------------------------------

3.7 계정 시스템

- 회원가입 / 로그인
- 사용자별 설정 저장

-------------------------------------

4. 사용자 흐름 (User Flow)

1단계:
사용자 회원가입 및 로그인

2단계:
다음 설정 입력:
- 주 운영 일수
- 하루 식사 횟수
- 반찬 개수
- 인원 수
- 원가 비율

3단계:
식단 생성:
- 1주 / 2주 / 1달 선택 가능

4단계:
식단 검토 및 수정:
- 일부 재생성
- 전체 재생성

5단계:
저장 및 다운로드

-------------------------------------

5. 성공 지표 (Success Metrics)

- 식단 작성 시간 50% 이상 감소
- 예산 초과 발생 감소
- 사용자 만족도 향상
- 재사용률 증가

-------------------------------------

6. 지금 해야 할 작업 (Development Tasks)

Step 1:
전체 시스템 아키텍처 설계

Step 2:
데이터베이스 설계 (ERD)

Step 3:
백엔드 API 설계

Step 4:
프론트엔드 구조 설계 (React 또는 Flutter Web)

Step 5:
식단 자동 생성 로직 구현

-------------------------------------

중요:
- 단계별로 하나씩 진행할 것
- 절대 단계 건너뛰지 말 것
- 실제 서비스 수준으로 설계할 것

```

</details>
<details>
 <summary>lovable 넣을 프롬프트 예시 전체 내용 보기</summary>

```text

AutoDiet - 학교 급식 식단 자동생성 시스템 구축 프롬프트

프로젝트 개요

한국 학교 급식소 영양사를 위한 주간 식단 자동 생성 및 영양 관리 웹 애플리케이션을 만들어주세요.
배포 타겟: Vercel (Next.js App Router 기반)

기술 스택

프론트엔드

- Next.js 15+ (App Router, Server/Client Components)
- React 19+
- TypeScript 5+
- Tailwind CSS 3+ (커스텀 애니메이션: fade-in, slide-in, scale-in, shimmer)
- shadcn/ui (40개 이상 컴포넌트 사용)
- Lucide React (아이콘)
- GSAP (애니메이션)
- 폰트: Noto Sans KR (한글) + Inter (영문)

백엔드/데이터

- Supabase (PostgreSQL, Auth, Edge Functions)
- Next.js API Routes (외부 API 프록시 역할)
- OpenAI API (GPT-4o-mini, 식단 분석용)

외부 API

- 식약처(FDA) 공공 API: 식품 영양성분 데이터베이스
- katOnline API: 농수산물 도매시장 실시간 가격 조회
- 토스페이먼츠 API: 결제/구독 처리

라이브러리

- TanStack React Query 5+ (서버 상태 관리)
- React Hook Form 7+ + Zod (폼 유효성 검사)
- jsPDF + jsPDF AutoTable (PDF 내보내기)
- html2canvas (HTML → 이미지 변환)
- Remark + Remark GFM (블로그 마크다운 파싱)
- Gray Matter (마크다운 front matter)
- Sonner (토스트 알림)

---
데이터 모델 (TypeScript 타입)

// 식품 카테고리
type FoodCategory = 'rice' | 'soup' | 'kimchi' | 'vegetable' | 'meat' | 'side'

// 식사 유형
type MealType = 'breakfast' | 'lunch' | 'dinner'

// 특식 종류
type CuisineType = 'japanese' | 'chinese' | 'western' | 'snack'

// 메뉴 아이템
interface MenuItem {
  id: string
  name: string
  category: FoodCategory
  calories: number
  protein: number
  carbs: number
  fat: number
  sodium: number
  allergens: string[]
  cost: number
  mainIngredients?: string[]
  weight?: number  // 빈도 가중치 (1-30, 높을수록 자주 등장)
}

// 식사 (한 끼)
interface Meal {
  id: string
  type: MealType
  rice: MenuItem
  soup: MenuItem
  sideDishes: MenuItem[]
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
  totalSodium: number
  totalCost: number
  allergens: string[]
  hasNutritionWarning: boolean
  hasCostWarning: boolean
  isSpecialMeal?: boolean
  cuisineType?: CuisineType
}

// 하루 식단
interface DayMealPlan {
  id: string
  date: string
  dayOfWeek: string
  meals: Meal[]
  snacks?: SnackMeal[]
  isNotOperating?: boolean
}

// 주간 식단
interface WeekMealPlan {
  id: string
  weekNumber: number
  startDate: string
  endDate: string
  days: DayMealPlan[]
}

// 급식소 설정
interface StoreSettings {
  storeName: string
  mealsPerDay: 1 | 2 | 3
  mealCombination: string  // 어떤 식사 운영하는지
  daysPerWeek: number      // 1-7
  sideDishCount: number    // 반찬 개수
  servingCount: number     // 급식 인원수
  budgetPerMeal: number    // 1인당 식재료비 예산
  costRatio: number        // 예산 대비 허용 비율(%)
  snackMorning: boolean
  snackAfternoon: boolean
  snackEvening: boolean
  watchAllergens?: string[]  // 감시할 알레르기 항목들
}

---
페이지/라우트 구조

경로                       | 목적                                               | 인증 필요
/                          | 메인 홈 (웰컴스크린 + 식단 편집기 + 통계)          | 기능 사용 시 필요
/auth                      | 로그인/회원가입/비밀번호 찾기 (Google/Kakao OAuth) | 불필요
/blog                      | 정적 마크다운 블로그 (페이지네이션)                | 불필요
/blog/[slug]               | 블로그 포스트 상세                                 | 불필요
/contact                   | 문의하기                                           | 불필요
/privacy                   | 개인정보처리방침                                   | 불필요
/api/fda/search            | 식약처 API 프록시 (keyword, pageNo, numOfRows)     | 공개
/api/fda/category          | 카테고리별 식품 조회                               | 공개
/api/fda/detail            | 특정 식품 영양 상세 조회                           | 공개
/api/kat-online/trades     | 도매시장 가격 프록시                               | 공개
/api/toss/confirm          | 토스 결제 확인                                     | 공개
/api/toss/order            | 결제 주문 생성                                     | 공개
/api/toss/billing/issue    | 구독 빌링 발급                                     | 공개
/api/toss/billing/charge   | 구독 빌링 청구                                     | 공개

---
주요 컴포넌트

레이아웃
- Header: 전체 네비게이션, 로그인 상태 표시
- Providers: React Query + Tooltip Provider + Toast 설정

대시보드 (메인 페이지)
- WelcomeScreen: 신규 사용자 소개 및 CTA 버튼
- SettingsPanel: 급식소 설정 패널 (일일 식수, 예산, 알레르기 등)
- WeeklyMealPlan: 주간 식단 메인 뷰 (날짜별 컬럼)
- DayColumn: 하루 식단 컬럼
- MealCard: 한 끼 식단 카드 (밥, 국, 반찬)
- StatsCard: KPI 카드 (생성된 식단 수, 경고 수, 비용)

기능 다이얼로그
- SavedPlansDialog: 저장된 식단 불러오기
- HistoryDialog: 식단 히스토리 조회/불러오기
- ExportDialog: CSV/PDF 내보내기
- AIAnalysisDialog: AI 식단 분석 (OpenAI)
- AIAnalyticsDialog: 실시간 영양 분석
- AIAlternativeDialog: AI 대체 메뉴 제안
- CustomInputDialog: 커스텀 메뉴 직접 입력
- SpecialMealDialog: 특식 설정 (일식/중식/양식)

유효성/표시
- NutritionDetails: 영양 정보 상세
- CostDetails: 비용 상세 및 경고
- AllergenWarning: 알레르기 호환성 경고

---
핵심 비즈니스 로직

1. 식단 자동 생성 알고리즘 (mealGenerator.ts)

- 설정에 따른 1-4주 분량 식단 생성
- 중복 방지: 4주 단위로 메뉴 사용 이력 추적
- 가중치 랜덤 선택: MenuItem의 weight(1-30)에 비례한 확률로 선택
- 재료 충돌 감지: 국/김치 조합 충돌 방지
- 특식 처리: 일식(우동, 카레, 오므라이스), 중식(짜장면, 짬뽕), 양식 변형

2. 영양 정보 보강 (nutritionEnricher.ts)

- 식품명으로 식약처 API 검색
- 폴백 계층:
  a. Supabase 캐시 (24시간 TTL)
  b. localStorage 캐시 (24시간 TTL, 키: nutrition_cache_v1)
  c. 하드코딩된 샘플 데이터
- 영양 경고: 칼로리 >600kcal 또는 <200kcal, 나트륨 >1200mg

3. 식재료 비용 계산 (costEnricher.ts)

- 식품명 → 도매 상품명 매핑
- katOnline API로 실시간 가격 조회 (가격/kg → 가격/100g → 1인분 가격)
- 비용 경고: budgetPerMeal × costRatio% 초과 시 플래그

4. 알레르기 관리 (allergenValidator.ts)

- 각 MenuItem별 알레르기 하드코딩 매핑
- 밥+국+반찬 알레르기 누적 합산
- 사용자 watchAllergens 목록과 교차 검사

---
인증 (Supabase Auth)

- 이메일/비밀번호 회원가입 (이메일 인증 포함)
- OAuth: Google, Kakao
- 세션: localStorage 저장 (sb-*-auth-token)
- 로그아웃 시 모든 auth 토큰 완전 제거 (WebView 엣지케이스 포함)
- 기능 접근 시 requireAuth() 게이팅

---
Supabase 데이터베이스 테이블

-- 급식소 설정
store_settings (
  id, user_id, store_name, meals_per_day,
  days_per_week, side_dish_count, serving_count,
  budget_per_meal, cost_ratio, snack_morning,
  snack_afternoon, snack_evening, watch_allergens,
  created_at, updated_at
)

-- 저장된 식단 계획
meal_plans (
  id, user_id, name, week_data (JSONB),
  week_number, start_date, end_date,
  created_at, updated_at
)

-- 영양 정보 캐시 (식약처 API 절약)
nutrition_cache (
  id, food_name, nutrition_data (JSONB),
  expires_at, created_at
)

-- 비용 캐시 (도매시장 API 절약)
cost_cache (
  id, ingredient_name, price_per_kg,
  trade_date, expires_at, created_at
)

---
AI 분석 (Supabase Edge Function)

함수명: ai-analyze-nutrition

입력: 주간 식단 데이터 + 예산 + 알레르기 설정

출력 JSON 형식:
{
  "overallScore": 78,
  "summary": "영양 균형은 좋으나 나트륨이 다소 높습니다.",
  "nutritionAnalysis": {
    "calories": { "status": "적정", "message": "하루 평균 칼로리가 적정 범위입니다." },
    "sodium": { "status": "과다", "message": "나트륨 섭취량이 기준치를 초과합니다." },
    "protein": { "status": "부족", "message": "단백질 보충이 필요합니다." },
    "variety": { "status": "좋음", "message": "다양한 식품군이 균형 있게 구성되었습니다." }
  },
  "improvements": [
    { "priority": "high", "category": "영양", "suggestion": "저염 조리법 적용을 권장합니다." }
  ],
  "positives": ["다양한 채소 반찬 구성", "주 2회 이상 생선 제공"]
}

---
샘플 메뉴 데이터

600개 이상의 하드코딩된 메뉴 아이템 필요:
- 밥류: 흰쌀밥, 잡곡밥, 현미밥, 콩밥 등 (가중치 포함)
- 국류: 된장국, 미역국, 김치찌개, 부대찌개 등 50종+
- 김치류: 배추김치, 깍두기, 열무김치 등 15종+
- 나물/채소: 시금치무침, 콩나물무침, 도라지무침 등 80종+
- 육류: 불고기, 제육볶음, 닭갈비, 돈까스 등 60종+
- 기타 반찬: 계란말이, 두부조림, 어묵볶음 등 100종+

각 아이템에 calories, protein, carbs, fat, sodium, allergens, cost, weight 포함

---
UI/UX 요구사항

- 다크 모드 지원 (CSS 변수 기반)
- 모바일 퍼스트 반응형 디자인
- 한국어 UI 전체 (영어 혼용 최소화)
- 주간 식단을 날짜별 컬럼으로 표시
- 드래그 앤 드롭으로 메뉴 이동/교체
- 메뉴 카드 우클릭 컨텍스트 메뉴 (교체, 삭제, 복사 등)
- 식단 생성 시 로딩 애니메이션 (shimmer 효과)
- 영양 경고/비용 경고를 배지로 시각화

---
내보내기 기능

- CSV: 주간 식단 전체 (날짜, 메뉴명, 영양정보, 비용)
- PDF: A4 가로 형식, 인쇄 최적화된 주간 식단표

---
결제/구독 (토스페이먼츠)

- 일회성 결제 + 정기 구독 모두 지원
- 구독 플랜: 무료(제한적) / 프리미엄(전체 기능)
- 빌링키 발급 → 자동 청구 구조

---
환경 변수 목록

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
FDA_API_KEY=           # 식약처 공공데이터포털 API 키
KATONLINE_API_KEY=     # katOnline 도매시장 API 키
TOSS_SECRET_KEY=       # 토스페이먼츠 시크릿 키
NEXT_PUBLIC_TOSS_CLIENT_KEY=
OPENAI_API_KEY=        # Supabase Edge Function에서 사용
NEXT_PUBLIC_GA_ID=     # Google Analytics

---
추가 구현 사항

- Google Analytics 4 연동
- Google AdSense 연동
- SEO 최적화 (메타태그, OG 태그)
- 블로그 (/blog): /content/posts/ 폴더의 .md 파일들을 정적으로 렌더링
- 문의하기 폼 (/contact): 이메일 발송 연동

```

</details>

---

## 🔄 사용자 흐름

```
[사용자] 급식소 설정 입력
    ↓
[mealGenerator.ts] 하드코딩 데이터로 주간 식단 즉시 생성
    ↓
[WeeklyMealPlan UI] 식단 화면 즉시 표시
    ↓ (백그라운드 병렬 처리)
[nutritionEnricher.ts] 식약처 API → 칼로리·나트륨·단백질 업데이트
    ↓
[costEnricher.ts] KAT Online API → 실시간 원가 업데이트
    ↓
[Supabase DB] 식단 저장 (사용자 요청 시)
    ↓
[ExportDialog] CSV / PDF 다운로드
```

---

## 🔑 핵심 구현 내용

### 하이브리드 식단 생성 아키텍처

식단 생성 방식을 두 단계로 분리하여 **속도**와 **정확성**을 동시에 확보했습니다.

| 단계 | 역할 | 방식 |
|------|------|------|
| 1단계 (즉시) | 식단 구성 | 검증된 하드코딩 데이터 사용 |
| 2단계 (백그라운드) | 영양·원가 보강 | 식약처 API + KAT Online API |

```
식단 생성 클릭
  ↓ (즉시, ~0.8초)
하드코딩 메뉴 데이터로 식단 구성 → 화면 표시
  ↓ (백그라운드, ~2-3초)
식약처 API로 영양 정보 보강 → 화면 업데이트
  ↓ (백그라운드, 이어서)
KAT Online API로 원가 정보 보강 → 화면 업데이트
```

**초기 설계 문제**: 식단 생성 단계에서 FDA API를 직접 호출하니 생성 속도가 5~10초에 달했고, 키워드 기반 필터링으로 인해 식단 조합이 불안정했습니다.

**개선 방향**: 식단 생성은 안정성이 검증된 하드코딩 데이터로 처리하고, 정확도가 필요한 영양·원가 정보만 API에서 비동기로 가져오는 방식으로 구조를 분리했습니다.


### 백그라운드 작업 취소 토큰 패턴

로그아웃 또는 새 식단 생성 시, 이전 백그라운드 보강 작업의 결과가 화면을 덮어쓰는 문제를 방지하기 위해 `enrichJobIdRef`(취소 토큰)를 설계했습니다.

```typescript
// 새 생성마다 jobId 발급
const jobId = ++enrichJobIdRef.current;

// 백그라운드 작업 완료 시점에 취소 여부 확인
const canceled = () => jobId !== enrichJobIdRef.current || !userRef.current;
if (canceled()) return; // 이전 작업 결과 반영 차단
```


### 다단계 메뉴 중복 방지

같은 날·인접 일자·주간·월간 범위에서 반찬 메뉴 중복을 방지하는 로직을 설계했습니다.
(`src/utils/menuDuplicationChecker.ts`)

```
isMenuAllowed() 판단 순서:
1. 같은 날 중복 체크
2. 인접 일자(전날·다음날) 중복 체크
3. 같은 주 내 중복 체크
4. 인접 주차(전주·다음주) 중복 체크
5. 월간(4주) 누적 중복 체크
```

밥·국·김치류는 매일 등장하는 것이 자연스러우므로 중복 체크 대상에서 제외했습니다.


### 24시간 캐싱 전략

식약처 API는 무료 호출량 제한(1,000건/일)이 있어, LocalStorage에 24시간 캐시를 구성했습니다.
첫 호출 후 동일 메뉴는 캐시에서 즉시 반환하며, 로그인 시 LocalStorage → Supabase DB로 마이그레이션합니다.

```
API 호출 우선순위:
1. LocalStorage 캐시 (24시간 유효)
2. Supabase DB 캐시
3. 식약처 API 직접 호출
4. 하드코딩 기본값 (API 실패 시 fallback)
```


### 급식소 1인분 환산

식약처 API는 100g 기준 영양 정보를 제공합니다. 급식소 실제 제공량으로 변환하기 위해 메뉴 카테고리별 1인분 기준을 구성했습니다.

| 메뉴 종류 | 기준 제공량 |
|---------|-----------|
| 밥 | 210g |
| 국·찌개 | 250ml |
| 면류 | 300g |
| 육류 | 80g |
| 채소·나물 | 70g |
| 김치 | 30g |
| 전류 | 50g |

### 🎬 시연 영상
**식단 생성**
![Image](https://github.com/user-attachments/assets/e4838119-a857-4262-9c00-48544efd9e17)

**영양 분석**
![Image](https://github.com/user-attachments/assets/c8845490-adda-4327-ac4c-fc49a87c64ed)

**식단 변경**
![Image](https://github.com/user-attachments/assets/a70a80c5-e60b-4205-bef9-1dab62fb7599)
---

## 핵심 함수 테이블

| 함수 | 위치 | 설명 |
|------|------|------|
| `generateWeekMealPlan()` | `src/utils/mealGenerator.ts` | 1주치 식단 생성. 중복 방지 컨텍스트와 이전 주차 메뉴를 받아 처리 |
| `isMenuAllowed()` | `src/utils/menuDuplicationChecker.ts` | 5단계 중복 조건을 순차 검사하여 메뉴 허용 여부 반환 |
| `enrichWeekNutrition()` | `src/services/nutritionEnricher.ts` | 주간 식단의 모든 메뉴를 병렬로 영양 보강 처리 |
| `enrichWeekCost()` | `src/services/costEnricher.ts` | 주간 식단의 모든 메뉴를 KAT Online API로 원가 보강 처리 |
| `getCafeteriaServingSize()` | `src/services/nutritionEnricher.ts` | 메뉴명 기반으로 급식소 1인분 기준(g/ml) 반환 |
| `normalizeWeekPlans()` | `src/app/page.tsx` | 주차 순서 변경 시 weekNumber와 날짜를 일괄 재정렬 |
| `enrichDataInBackground()` | `src/app/page.tsx` | jobId 취소 토큰으로 이전 보강 작업 차단 후 영양→원가 순 보강 |

---

## 🛠️ 기술 스택 및 선택 이유

| 분류 | 기술 | 선택 이유 |
|------|------|---------|
| 프레임워크 | Next.js 16 (App Router) | API Route를 활용해 Toss Payments 등 서버 사이드 처리가 필요한 기능을 클라이언트와 분리하기 위해 선택 |
| 언어 | TypeScript | 식단·메뉴·영양 데이터 구조가 복잡하므로 타입 안전성 확보 |
| UI | Tailwind CSS + shadcn/ui | 빠른 UI 구성을 위한 유틸리티 CSS + 접근성 기반 컴포넌트 |
| 서버·인증·DB | Supabase | Auth·DB·Storage를 하나의 서비스로 통합 관리, 식단 저장 및 사용자 관리에 활용 |
| 서버 상태 관리 | TanStack Query v5 | API 캐싱·로딩 상태·에러 처리를 선언적으로 관리 |
| 외부 API 1 | 식약처 Open API | 국내 급식소 환경에 적합한 한국 식품 영양 정보 제공 |
| 외부 API 2 | KAT Online API | 한국농수산식품유통공사의 실시간 도매 시세 데이터 제공 |
| 결제 | Toss Payments | 국내 결제 환경 지원, 빌링키 기반 구독 결제 구현 |
| 내보내기 | jsPDF + html2canvas | 브라우저 기반 PDF 생성, 서버 의존 없이 식단표 다운로드 |
| 블로그 | Remark (Markdown) | 별도 CMS 없이 Markdown 파일로 블로그 운영 |

---

## 🔧 트러블슈팅 / 개선 경험

### 1. 식단 생성 속도 문제 → 하이브리드 아키텍처로 개선

**문제**: 식단 생성 시 모든 메뉴를 식약처 API에서 가져오도록 구현했더니 생성 시간이 5~10초에 달했고, 키워드 기반 필터링으로 인해 "잡곡밥 + 잡곡밥" 같은 이상한 조합이 생성되는 경우가 있었습니다.

**개선**: 식단 구성(밥·국·반찬 조합)은 검증된 하드코딩 데이터를 사용하고, 영양 정보만 API로 백그라운드에서 보강하는 방식으로 전환했습니다. 생성 속도는 즉시 수준으로 개선되었고, 식단 조합의 안정성도 확보했습니다.

---

### 2. 백그라운드 작업 경쟁 조건 문제 → 취소 토큰 패턴 도입

**문제**: 사용자가 식단 생성 후 로그아웃하거나 새로운 식단을 다시 생성하면, 이전 백그라운드 보강 작업이 완료되면서 새 화면을 이전 식단으로 덮어쓰는 버그가 발생했습니다.

**개선**: `enrichJobIdRef`를 이용한 취소 토큰 패턴을 구현했습니다. 새 작업이 시작될 때마다 ID를 증가시키고, 백그라운드 작업 완료 시점에 현재 ID와 비교하여 결과 반영 여부를 결정합니다.

---

### 3. API 호출량 초과 위험 → 다단계 캐싱 전략

**문제**: 식약처 API 무료 호출량이 1,000건/일로 제한되어 있어, 매번 식단 생성 시 API를 호출하면 한도 초과 위험이 있었습니다.

**개선**: LocalStorage에 24시간 캐시를 구성하고, 로그인 시 LocalStorage 데이터를 Supabase DB로 마이그레이션하는 흐름을 설계했습니다. API 실패 시에는 하드코딩 기본값으로 fallback하여 서비스가 중단되지 않도록 했습니다.

---

### 4. 모바일(카카오톡 인앱 브라우저) 로그아웃 오작동

**문제**: 모바일 카카오톡 인앱 브라우저에서 `signOut()` 이후 상태 반영이 늦어, 로그아웃 후에도 이전 사용자 데이터가 잠시 남아있는 현상이 있었습니다.

**개선**: `router.replace()` + `router.refresh()`를 조합하여 세션 상태를 강제로 동기화하고, 로그아웃 직후 클라이언트 상태(`weekPlans`, `showEditor` 등)를 즉시 초기화하도록 처리했습니다.


---

## 🚀  로컬 실행 방법

### 사전 요구 사항

- Node.js 18 이상
- Supabase 프로젝트 (Auth + DB)
- 식약처 Open API 키
- KAT Online API 키
- Toss Payments 키 (결제 기능 사용 시)

### 환경변수 설정

`.env.local` 파일을 생성하고 아래 항목을 입력합니다.

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_FDA_API_KEY=your_fda_api_key
TOSS_SECRET_KEY=your_toss_secret_key
NEXT_PUBLIC_TOSS_CLIENT_KEY=your_toss_client_key
```

### 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build
npm start
```

개발 서버: `http://localhost:3000`

### 주요 라이브러리 버전

`package.json` 참고: [package.json](./package.json)

---

## 🌱 향후 개선 계획

- [ ] AdSense 최종 승인 후 광고 배치

---

## 📎 참고자료

<details>
<summary>ERD 보기</summary>
<img width="1538" height="802" alt="Image" src="https://github.com/user-attachments/assets/1ae46629-e0e5-4159-bf46-22c90317c4f4" />
</details>
