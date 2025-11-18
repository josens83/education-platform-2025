# Premium Design System Guide
## English Education Platform - Linear/Stripe Style

이 문서는 영어 학습 플랫폼의 현대적이고 세련된 디자인 시스템을 설명합니다.

---

## 🎨 디자인 철학

**"Modern. Minimal. Delightful."**

우리의 디자인 시스템은 Linear, Stripe, Vercel과 같은 선도적인 웹 플랫폼에서 영감을 받아, 다음 원칙을 따릅니다:

- **미니멀리즘**: 불필요한 장식을 제거하고 본질에 집중
- **일관성**: 모든 컴포넌트가 통일된 디자인 언어를 사용
- **접근성**: 모든 사용자가 편하게 사용할 수 있는 UI
- **반응성**: 모든 기기에서 완벽하게 작동하는 반응형 디자인
- **성능**: 부드럽고 빠른 사용자 경험

---

## 🌈 컬러 시스템

### 디자인 토큰 (CSS Variables)

모든 색상은 CSS 변수로 정의되어 있어 다크 모드와 라이트 모드를 쉽게 전환할 수 있습니다.

```css
/* Light Mode */
--color-bg: 255, 255, 255;              /* 배경색 */
--color-text-primary: 17, 24, 39;       /* 주요 텍스트 */
--color-text-secondary: 75, 85, 99;     /* 보조 텍스트 */
--color-surface: 255, 255, 255;         /* 카드/패널 배경 */
--color-border: 229, 231, 235;          /* 테두리 */

/* Dark Mode */
--color-bg: 10, 10, 10;                 /* 어두운 배경 */
--color-text-primary: 250, 250, 250;    /* 밝은 텍스트 */
--color-surface: 24, 24, 24;            /* 어두운 표면 */
```

### Tailwind 클래스 사용

```jsx
{/* 디자인 토큰 사용 - 자동 다크 모드 대응 */}
<div className="bg-bg text-text-primary border border-border">
  <h1 className="text-text-primary">제목</h1>
  <p className="text-text-secondary">설명</p>
</div>
```

### 브랜드 컬러

**Primary (파란색 계열):**
- `primary-500`: #0ea5e9 - 주요 버튼, 링크
- `primary-600`: #0284c7 - Hover 상태
- `primary-700`: #0369a1 - Active 상태

**Accent (그라디언트용):**
- `accent.purple`: #a855f7
- `accent.blue`: #3b82f6
- `accent.cyan`: #06b6d4
- `accent.pink`: #ec4899

---

## ✨ 타이포그래피

### 폰트 패밀리

```css
/* 영문: Inter (modern sans-serif) */
/* 한글: Pretendard (한국형 Inter) */
font-family: 'Inter', 'Pretendard', -apple-system, sans-serif;
```

### 폰트 스케일

| 크기 | Tailwind | 사용 예시 |
|------|----------|-----------|
| 6xl-7xl | `text-6xl`, `text-7xl` | Hero 제목 |
| 4xl-5xl | `text-4xl`, `text-5xl` | Section 제목 |
| 2xl-3xl | `text-2xl`, `text-3xl` | 카드 제목 |
| xl | `text-xl` | 부제목 |
| base | `text-base` | 본문 |
| sm | `text-sm` | 보조 텍스트 |

### 타이포그래피 예시

```jsx
<h1 className="text-6xl md:text-7xl font-bold text-text-primary mb-6">
  영어 학습의 <span className="text-gradient">새로운 기준</span>
</h1>
<p className="text-xl md:text-2xl text-text-secondary leading-relaxed">
  Storytel 스타일의 이북 리더로 재미있게 영어를 배우세요
</p>
```

---

## 🔘 컴포넌트 스타일

### 버튼

**Primary Button:**
```jsx
<button className="btn-primary">
  무료로 시작하기
</button>
```

**Secondary Button:**
```jsx
<button className="btn-secondary">
  더 알아보기
</button>
```

**Ghost Button:**
```jsx
<button className="btn-ghost">
  취소
</button>
```

### 입력 필드

```jsx
<input
  type="text"
  className="input"
  placeholder="이메일을 입력하세요"
/>
```

### 카드 컴포넌트

**Premium Card (Hover Effect):**
```jsx
<div className="card-premium">
  <h3 className="text-xl font-semibold mb-3">제목</h3>
  <p className="text-text-secondary">설명</p>
</div>
```

**Glass Morphism Card:**
```jsx
<div className="card-glass-lg p-12">
  <h2 className="text-4xl font-bold">유리 효과 카드</h2>
</div>
```

**Bento Grid Item:**
```jsx
<div className="bento-item p-8">
  <h3 className="text-xl font-semibold">기능</h3>
  <p className="text-text-secondary">설명</p>
</div>
```

---

## 🎭 애니메이션

### Framer Motion 애니메이션

**Fade In:**
```jsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
>
  콘텐츠
</motion.div>
```

**Scroll Animation:**
```jsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.6 }}
>
  스크롤 시 나타나는 콘텐츠
</motion.div>
```

### Tailwind 애니메이션 클래스

```jsx
{/* Fade In */}
<div className="animate-fade-in">...</div>

{/* Slide Up */}
<div className="animate-slide-up">...</div>

{/* Float */}
<div className="animate-float">...</div>

{/* Glow Pulse */}
<div className="animate-glow-pulse">...</div>
```

---

## 🎨 특수 효과

### 그라디언트 배경 (Linear Style)

```jsx
<div className="relative overflow-hidden">
  {/* Gradient Spheres */}
  <div className="gradient-mesh-bg">
    <div className="gradient-sphere w-96 h-96 bg-gradient-to-r from-primary-500 to-purple-500 -top-48 -left-48" />
    <div className="gradient-sphere w-96 h-96 bg-gradient-to-r from-cyan-500 to-blue-500 top-1/2 -right-48" />
  </div>

  {/* Content */}
  <div className="relative z-10">
    ...
  </div>
</div>
```

### 텍스트 그라디언트

```jsx
<h1 className="text-gradient">
  그라디언트 텍스트
</h1>

<h2 className="text-gradient-purple">
  보라색 그라디언트
</h2>
```

### 글로우 효과

```jsx
<div className="glow-primary">
  Primary 글로우
</div>

<div className="glow-accent">
  Accent 글로우
</div>
```

---

## 🌓 다크 모드

### 구현 방법

다크 모드는 `useTheme` 훅과 `ThemeToggle` 컴포넌트로 관리됩니다.

```jsx
import { useTheme } from '../hooks/useTheme';
import ThemeToggle from '../components/ThemeToggle';

function MyComponent() {
  const { theme, isDark, setTheme } = useTheme();

  return (
    <div>
      <ThemeToggle /> {/* 3-way toggle (light/dark/system) */}
      <p>현재 테마: {theme}</p>
      <p>다크 모드 여부: {isDark ? 'Yes' : 'No'}</p>
    </div>
  );
}
```

### 다크 모드 대응 스타일

디자인 토큰을 사용하면 자동으로 다크 모드가 적용됩니다:

```jsx
{/* ✅ 권장: 디자인 토큰 사용 */}
<div className="bg-surface text-text-primary border border-border">
  자동으로 다크 모드 적용
</div>

{/* ❌ 비권장: 하드코딩 */}
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  수동 다크 모드 (유지보수 어려움)
</div>
```

---

## 📱 반응형 디자인

### 브레이크포인트

| 이름 | 크기 | Tailwind |
|------|------|----------|
| Mobile | < 640px | (기본) |
| Tablet | ≥ 640px | `sm:` |
| Desktop | ≥ 768px | `md:` |
| Large | ≥ 1024px | `lg:` |
| XL | ≥ 1280px | `xl:` |

### Bento 그리드

```jsx
<div className="grid-bento">
  {/* 모바일: 1열, 태블릿: 2열, 데스크톱: 3열 */}
  {items.map(item => (
    <div className="bento-item" key={item.id}>
      {item.content}
    </div>
  ))}
</div>
```

### 반응형 타이포그래피

```jsx
<h1 className="text-4xl md:text-6xl lg:text-7xl font-bold">
  모바일 4xl, 태블릿 6xl, 데스크톱 7xl
</h1>
```

---

## 🎯 사용 가이드라인

### DO's ✅

- ✅ 디자인 토큰 (`bg-bg`, `text-text-primary`) 사용
- ✅ 일관된 간격 (4px 단위: `p-4`, `gap-6`, `mb-8`)
- ✅ 부드러운 애니메이션 (duration-200~600)
- ✅ Rounded corners (xl: `rounded-xl`, 2xl: `rounded-2xl`)
- ✅ 접근성 고려 (ARIA labels, focus states)

### DON'Ts ❌

- ❌ 하드코딩된 색상 (`bg-white dark:bg-black`)
- ❌ Magic numbers (`width: 342px`)
- ❌ 과도한 애니메이션 (사용자 경험 저해)
- ❌ 일관성 없는 border-radius
- ❌ 접근성 무시 (낮은 대비, 키보드 탐색 불가)

---

## 📦 컴포넌트 라이브러리

### 이미 구현된 컴포넌트

- ✅ `ThemeToggle` - 다크/라이트/시스템 모드 전환
- ✅ `Layout` - 글래스모피즘 헤더, 반응형 네비게이션
- ✅ `HomePage` - Bento 그리드, 그라디언트 배경, CTA
- ✅ `SEO` - Meta tags 관리

### 유틸리티 클래스

```css
.text-balance        /* 텍스트 밸런싱 */
.container-custom    /* max-w-7xl + 패딩 */
.transition-smooth   /* 부드러운 전환 */
.glass               /* 글래스모피즘 효과 */
.scrollbar-hide      /* 스크롤바 숨김 */
```

---

## 🚀 빠른 시작

### 1. 새 페이지 만들기

```jsx
import { motion } from 'framer-motion';
import SEO from '../components/SEO';

export default function MyPage() {
  return (
    <>
      <SEO title="페이지 제목" description="페이지 설명" />

      <div className="bg-bg text-text-primary min-h-screen">
        {/* Hero Section */}
        <section className="container-custom py-24">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl font-bold text-text-primary mb-6"
          >
            제목 <span className="text-gradient">강조</span>
          </motion.h1>
        </section>

        {/* Content */}
        <section className="container-custom py-20">
          <div className="grid-bento">
            {/* Cards */}
          </div>
        </section>
      </div>
    </>
  );
}
```

### 2. 새 컴포넌트 만들기

```jsx
export function MyCard({ title, description }) {
  return (
    <div className="card-premium group">
      <h3 className="text-xl font-semibold text-text-primary mb-3">
        {title}
      </h3>
      <p className="text-text-secondary leading-relaxed">
        {description}
      </p>
    </div>
  );
}
```

---

## 📚 참고 자료

**영감을 받은 사이트:**
- [Linear](https://linear.app) - 다크 모드, 그라디언트, 미니멀리즘
- [Stripe](https://stripe.com) - 타이포그래피, 마이크로 인터랙션
- [Vercel](https://vercel.com) - 그리드 레이아웃, 애니메이션
- [Notion](https://notion.so) - 클린 디자인, 사용성

**기술 스택:**
- [Tailwind CSS](https://tailwindcss.com) - 유틸리티 CSS 프레임워크
- [Framer Motion](https://www.framer.com/motion/) - 애니메이션 라이브러리
- [React Icons](https://react-icons.github.io/react-icons/) - 아이콘

---

## 🎨 색상 팔레트 참조

### Light Mode
```
Background:    #FFFFFF
Surface:       #FFFFFF
Text Primary:  #111827
Text Secondary:#4B5563
Border:        #E5E7EB
```

### Dark Mode
```
Background:    #0A0A0A
Surface:       #181818
Text Primary:  #FAFAFA
Text Secondary:#A3A3A3
Border:        #27272A
```

---

**Last Updated:** 2025-11-18
**Version:** 2.0.0 - Premium Design System
