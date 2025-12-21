# Project: English Education Platform

## 개요
영어 학습을 위한 종합 교육 플랫폼. 도서 리더, 어휘 학습, 퀴즈, 오디오 학습, 플래시카드 등 다양한 학습 도구를 제공합니다.

## 기술 스택
- **Frontend:** React 18 + TypeScript + Vite
- **Backend:** Node.js + Express
- **Database:** PostgreSQL
- **Styling:** Tailwind CSS
- **Auth:** JWT + 2FA (TOTP) + OAuth (Google/Kakao)
- **Error Tracking:** Sentry
- **State Management:** Zustand
- **Animation:** Framer Motion
- **Deployment:** Vercel (Frontend) / Railway (Backend)

## 프로젝트 구조
```
/
├── apps/
│   └── web/              # React Frontend (Vite)
│       ├── src/
│       │   ├── components/    # React 컴포넌트
│       │   │   ├── ui/        # 기본 UI 컴포넌트
│       │   │   └── features/  # 기능별 컴포넌트
│       │   ├── pages/         # 페이지 컴포넌트
│       │   ├── store/         # Zustand 스토어
│       │   ├── lib/           # 유틸리티 함수
│       │   ├── hooks/         # 커스텀 훅
│       │   └── types/         # TypeScript 타입
│       └── package.json
├── backend/               # Express Backend
│   ├── routes/           # API 라우트
│   ├── lib/              # 유틸리티
│   ├── middlewares/      # Express 미들웨어
│   └── __tests__/        # Jest 테스트
├── packages/              # 공유 패키지
│   ├── api-client/       # API 클라이언트
│   └── shared/           # 공유 타입/유틸리티
├── database/              # SQL 스키마
└── scripts/               # 유틸리티 스크립트
```

## 명령어
### Frontend (apps/web)
- `npm run dev` - 개발 서버 (http://localhost:5173)
- `npm run build` - 프로덕션 빌드
- `npm run typecheck` - TypeScript 검사
- `npm run lint` - ESLint 검사
- `npm run verify` - typecheck + lint + build

### Backend (backend)
- `npm run dev` - 개발 서버 (http://localhost:3000)
- `npm test` - Jest 테스트
- `npm run lint` - ESLint 검사

### Root
- `npm run dev` - 개발 서버 (Frontend + Backend 동시)
- `npm run build` - Frontend 빌드
- `npm run test` - 전체 테스트
- `npm run format` - Prettier 포맷팅
- `npm run format:check` - 포맷팅 검사

## 코딩 컨벤션
- 함수형 컴포넌트 + React Hooks 사용
- 절대 경로 import 사용 (@/로 시작)
- TypeScript strict mode (일부 완화)
- 한국어 주석 OK, 변수명은 영어
- Tailwind CSS 유틸리티 클래스 사용

---

## UI/UX 규칙

### 반응형 디자인 (Mobile-First 필수)
```tsx
// ✅ 올바른 순서 (Mobile-First)
className="w-full md:w-1/2 lg:w-1/3"
className="text-sm md:text-base lg:text-lg"
className="p-4 md:p-6 lg:p-8"

// ❌ 잘못된 순서
className="w-1/3 md:w-1/2 sm:w-full"
```

### 브레이크포인트
| 브레이크포인트 | 크기 | 용도 |
|---------------|------|------|
| 기본 | < 640px | 모바일 |
| sm | 640px+ | 큰 모바일 |
| md | 768px+ | 태블릿 |
| lg | 1024px+ | 데스크톱 |
| xl | 1280px+ | 큰 데스크톱 |

### 터치 타겟
- 버튼/링크 최소 크기: 44x44px (`min-h-11 min-w-11`)
- 터치 요소 간 간격: 최소 8px

---

## 디자인 토큰

### 색상 시스템
```tsx
// ✅ Tailwind 토큰 사용
className="bg-primary-500 text-white"        // 메인 CTA
className="bg-secondary-400"                  // 성취 배지
className="bg-accent-400"                     // 긍정 피드백
className="bg-gray-50"                        // 배경
className="text-gray-900"                     // 본문 텍스트
className="text-gray-500"                     // 보조 텍스트

// 상태 색상
className="bg-success text-white"            // 성공
className="bg-warning text-gray-900"         // 경고
className="bg-error text-white"              // 에러
className="bg-info text-white"               // 정보

// ❌ 하드코딩 금지
className="bg-[#6366F1]"                     // 직접 색상값 사용 금지
className="bg-blue-500"                       // 의미 없는 색상 금지
```

### 간격 규칙
```tsx
// 관련 요소 사이: 작은 간격
className="gap-2"    // 8px - 아이콘과 텍스트
className="gap-4"    // 16px - 폼 필드들

// 그룹 사이: 중간 간격
className="gap-6"    // 24px - 카드들
className="gap-8"    // 32px - 섹션 내 그룹

// 섹션 사이: 큰 간격
className="py-12"    // 48px - 섹션
className="py-16"    // 64px - 주요 섹션
```

### 그림자 사용
```tsx
// 평면 요소
className="shadow-sm"     // 카드 기본

// 상호작용 요소
className="shadow-md hover:shadow-lg"  // 호버 시 강조

// 모달/팝업
className="shadow-xl"     // 떠있는 요소
```

---

## 상태 구현 필수

모든 데이터 페칭 컴포넌트에 4가지 상태 구현:

```tsx
// 1. 로딩 상태 - Skeleton 사용
function ProductList() {
  const { data, isLoading, error } = useQuery(...)

  if (isLoading) {
    return (
      <div className="grid gap-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-lg" />
        ))}
      </div>
    )
  }

  // 2. 에러 상태 - 재시도 버튼 포함
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-error mb-4">데이터를 불러오는데 실패했습니다</p>
        <Button onClick={() => refetch()}>다시 시도</Button>
      </div>
    )
  }

  // 3. 빈 상태 - 안내 메시지 + CTA
  if (!data?.length) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">등록된 상품이 없습니다</p>
        <Button>상품 추가하기</Button>
      </div>
    )
  }

  // 4. 성공 상태
  return <div>{data.map(item => <ProductCard key={item.id} {...item} />)}</div>
}
```

---

## 애니메이션 규칙

### 기본 Duration
```tsx
// 빠른 피드백 (버튼 클릭, 토글)
className="duration-150"   // 150ms

// 일반 전환 (호버, 상태 변화)
className="duration-200"   // 200ms - 기본값
className="duration-300"   // 300ms

// 복잡한 전환 (모달, 페이지)
className="duration-500"   // 500ms
```

### Easing 함수
```tsx
// 등장 (fade in, slide in)
className="ease-out"

// 퇴장 (fade out, slide out)
className="ease-in"

// 상태 변화 (색상, 크기)
className="ease-in-out"
```

### 호버/클릭 피드백
```tsx
// 버튼 호버
className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"

// 버튼 클릭
className="active:scale-95"

// 카드 호버
className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
```

### Reduced Motion 지원 필수
```tsx
// 시스템 설정 존중
className="motion-reduce:transform-none motion-reduce:transition-none"

// Framer Motion 사용 시
const prefersReducedMotion = useReducedMotion()
<motion.div
  animate={{ opacity: 1, y: prefersReducedMotion ? 0 : 20 }}
/>
```

---

## 접근성 필수 (WCAG 2.1 AA)

### 시맨틱 HTML
```tsx
// ✅ 올바른 사용
<nav>...</nav>
<main>...</main>
<article>...</article>
<button onClick={...}>클릭</button>

// ❌ 잘못된 사용
<div onClick={...}>클릭</div>
```

### 이미지 alt 텍스트
```tsx
// ✅ 의미 있는 설명
<img src="..." alt="사용자 프로필 사진" />

// ✅ 장식적 이미지
<img src="..." alt="" role="presentation" />

// ❌ 불충분한 설명
<img src="..." alt="이미지" />
```

### 폼 접근성
```tsx
// ✅ label 연결 필수
<label htmlFor="email">이메일</label>
<input id="email" type="email" aria-describedby="email-hint" />
<span id="email-hint" className="text-sm text-gray-500">
  업무용 이메일을 입력하세요
</span>

// 에러 상태
<input aria-invalid={!!error} aria-describedby="email-error" />
<span id="email-error" role="alert" className="text-error">
  {error}
</span>
```

### 키보드 네비게이션
```tsx
// 포커스 표시 필수 (제거 금지)
className="focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"

// Skip Link (레이아웃에 포함)
<a href="#main-content" className="sr-only focus:not-sr-only">
  메인 콘텐츠로 건너뛰기
</a>
```

### 색상 대비
- 일반 텍스트: 4.5:1 이상
- 큰 텍스트 (18px+): 3:1 이상
- UI 컴포넌트: 3:1 이상

---

## 성능 최적화

### Core Web Vitals 목표
- **LCP** (Largest Contentful Paint): < 2.5초
- **INP** (Interaction to Next Paint): < 200ms
- **CLS** (Cumulative Layout Shift): < 0.1

### 이미지 최적화
```tsx
// LCP 이미지는 priority 추가
<img src="..." alt="..." loading="eager" fetchPriority="high" />

// 나머지 이미지는 lazy loading
<img src="..." alt="..." loading="lazy" />

// 크기 명시로 CLS 방지
<img src="..." alt="..." width={400} height={300} className="aspect-[4/3]" />
```

### 코드 스플리팅
```tsx
// 페이지별 lazy loading
const Dashboard = lazy(() => import('./pages/Dashboard'))

// Suspense로 로딩 상태 처리
<Suspense fallback={<PageSkeleton />}>
  <Dashboard />
</Suspense>
```

### 리스트 렌더링
```tsx
// 긴 리스트는 가상화 사용
import { useVirtualizer } from '@tanstack/react-virtual'

// 또는 무한 스크롤
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery(...)
```

---

## 컴포넌트 가이드

### 기존 컴포넌트 재사용 (필수)
```tsx
// @/components/ui 에서 import
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Skeleton'

// 새 컴포넌트 생성 전 기존 컴포넌트 확인!
```

### 버튼 Variants
```tsx
<Button variant="primary">메인 액션</Button>
<Button variant="secondary">보조 액션</Button>
<Button variant="outline">덜 중요한 액션</Button>
<Button variant="ghost">최소 강조</Button>
<Button variant="destructive">삭제/위험</Button>
```

### 카드 패턴
```tsx
<Card className="p-6">
  <Card.Header>
    <Card.Title>제목</Card.Title>
    <Card.Description>설명</Card.Description>
  </Card.Header>
  <Card.Content>내용</Card.Content>
  <Card.Footer>액션</Card.Footer>
</Card>
```

---

## 환경 변수
### Frontend (.env)
- `VITE_API_URL` - Backend API URL
- `VITE_VAPID_PUBLIC_KEY` - Push 알림용
- `VITE_SENTRY_DSN` - Sentry DSN
- `VITE_GA_ID` - Google Analytics ID

### Backend (.env)
- `DATABASE_URL` - PostgreSQL 연결 문자열
- `JWT_SECRET` - JWT 서명 키
- `GOOGLE_CLIENT_ID/SECRET` - Google OAuth
- `KAKAO_CLIENT_ID/SECRET` - Kakao OAuth

## 주의사항
- API 키는 .env 파일에만 저장 (절대 커밋 금지)
- 배포 전 빌드 검증 필수
- `forceConsistentCasingInFileNames: true` 설정으로 파일명 대소문자 일관성 유지
- 데이터베이스 연결 풀 설정 최적화됨 (서버리스 환경 고려)

## CI/CD
- GitHub Actions: `.github/workflows/ci.yml`
- Pre-commit hook: lint-staged로 변경 파일만 검사
- Pre-push hook: 전체 typecheck + build

---

## AI 프롬프트 가이드

### 컴포넌트 요청 템플릿
```
## 작업
[컴포넌트명] 컴포넌트를 만들어주세요.

## 기능 요구사항
- [기능 1]
- [기능 2]

## UI/UX 요구사항
- 상태: 로딩, 성공, 에러, 빈 상태 모두 구현
- 반응형: 모바일 우선 (기본 → md → lg)
- 애니메이션: 호버/클릭 피드백
- 접근성: WCAG 2.1 AA

## 사용할 컴포넌트
@/components/ui에서: Button, Card, Input 등
```

### 수정 요청 패턴
```
// ❌ 모호한 요청
"이거 좀 더 예쁘게 해줘"

// ✅ 구체적인 요청
"버튼의 패딩을 px-4에서 px-6으로 늘리고,
 호버 시 그림자를 shadow-md에서 shadow-lg로 변경해줘"
```
