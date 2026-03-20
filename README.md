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
이를 통해 생성된 최종 프롬프트를 Lovable에 입력하여 개발을 진행했습니다.
<details>
 <summary>ChatGPT 넣을 프롬프트 예시 전체 내용 보기</summary>

```text

나는 Next.js로 급식소 식단 자동화 웹 서비스를 만들려고 해.
서비스 이름은 "auto-diet"야.

아래 내용을 바탕으로 서비스 기획을 구체화해줘:

[서비스 개요]
- 급식소 관리자가 인원수, 예산, 운영 요일을 입력하면 주간 식단을 자동으로 생성해주는 웹 서비스

[핵심 기능]
1. 급식소 설정 기반 식단 자동 생성
   - 인원수, 예산, 운영 요일, 끼니 수 입력
   - 밥·국·반찬 조합 기반 한식 식단 구성
   - 같은 날 / 인접 일자 / 주간 / 월간 범위 메뉴 중복 방지

2. 외부 API 연동
   - 식약처 영양 DB API: 칼로리·나트륨·단백질 자동 반영
   - 한국농수산식품유통공사(KAT Online) API: 실시간 도매 시세 기반 원가 계산

3. 추가 기능
   - 개별 메뉴 재생성 및 커스텀 메뉴 직접 입력
   - 일식·중식·양식 특별식 설정
   - 알레르기 경고 표시
   - 식단 저장/불러오기 (Supabase DB)
   - CSV·PDF 형식 식단표 내보내기
   - AI 영양 균형 분석 및 개선 제안
   - 결제/구독 기능 (Toss Payments)

[필요 기술]
- Next.js (App Router) + TypeScript
- UI: Tailwind CSS + shadcn/ui
- 인증 및 DB: Supabase
- 외부 API: 식약처 Open API, KAT Online API
- 상태 관리: TanStack Query

다음 내용을 도와줘:
1. 이 서비스의 핵심 가치와 차별점을 정리해줘
2. UX 흐름에서 개선할 수 있는 부분이 있으면 제안해줘
3. 추가하면 좋을 기능이 있다면 제안해줘
4. 위 기술 스택이 이 서비스에 적합한지 검토해줘
5. 이 서비스를 개발할 때 주의할 기술적 포인트를 정리해줘

```

</details>
<details>
 <summary>lovable 넣을 프롬프트 예시 전체 내용 보기</summary>

```text

목표:
급식소 관리자가 주·월 단위 식단을 손쉽게 자동 생성하고,
영양 정보와 식재료 원가를 실시간으로 확인할 수 있는 웹 서비스를 만든다.

요구 기능:
- 급식소 설정(인원수, 예산, 운영 요일, 끼니 수)에 맞는 주간 식단 자동 생성
- 밥·국·반찬 조합 기반의 한식 식단 구성
- 같은 날 / 인접 일자 / 주간 / 월간 범위에서 메뉴 중복 방지
- 식약처 영양 DB API 연동으로 칼로리·나트륨·단백질 정보 자동 반영
- 한국농수산식품유통공사(KAT Online) API 연동으로 실시간 도매 시세 기반 원가 계산
- 개별 메뉴 재생성 및 직접 입력(커스텀 메뉴) 기능
- 일식·중식·양식 특별식 설정
- 간식(아침·오후·저녁) 추가 설정
- 알레르기 경고 표시
- 식단 저장/불러오기 (Supabase DB)
- CSV·PDF 형식으로 식단표 내보내기
- AI 영양 분석 (생성된 식단 균형 진단)
- 결제/구독 기능 (Toss Payments)

기술 방향:
- Next.js (App Router) + TypeScript
- UI: Tailwind CSS + shadcn/ui
- 인증 및 DB: Supabase
- 외부 API: 식약처 Open API, KAT Online API
- 상태 관리: TanStack Query (캐싱 포함)

추가 요구사항:
- 식단 생성 속도 우선: 하드코딩 데이터로 즉시 생성 후, 외부 API로 백그라운드 보강
- API 호출 최소화: 24시간 LocalStorage 캐싱
- 모바일 환경 대응 (급식소 현장 사용 고려)
- 로그아웃·세션 만료 시 진행 중 백그라운드 작업 안전하게 취소

```

</details>

---

## 아키텍처 / 데이터 흐름

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

## 핵심 구현 내용

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

## 기술 스택 및 선택 이유

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

## 트러블슈팅 / 개선 경험

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

## 로컬 실행 방법

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
