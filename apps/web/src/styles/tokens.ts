/**
 * Design Tokens for Education Platform 2025
 *
 * 디자인 철학:
 * - 집중(Focus): 학습에 방해되지 않는 깔끔한 UI
 * - 따뜻함(Warmth): 차갑지 않은, 학습자를 환영하는 느낌
 * - 신뢰(Trust): 프리미엄 교육 서비스로서의 품질감
 * - 효율(Efficiency): 직관적인 네비게이션, 빠른 접근
 *
 * 레퍼런스: Notion, Duolingo, Linear, Readwise, Stripe
 */

// ============================================
// COLOR SYSTEM
// ============================================

export const colors = {
  // Primary - 학습과 성장을 상징하는 따뜻한 인디고
  primary: {
    50: '#EEF2FF',
    100: '#E0E7FF',
    200: '#C7D2FE',
    300: '#A5B4FC',
    400: '#818CF8',
    500: '#6366F1',  // Main CTA
    600: '#4F46E5',  // Active state
    700: '#4338CA',
    800: '#3730A3',
    900: '#312E81',
  },

  // Secondary - 따뜻함과 에너지를 주는 앰버
  secondary: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',  // Achievement badges
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },

  // Accent - 집중과 몰입을 위한 청록
  accent: {
    50: '#F0FDFA',
    100: '#CCFBF1',
    200: '#99F6E4',
    300: '#5EEAD4',
    400: '#2DD4BF',  // Completion, positive feedback
    500: '#14B8A6',
    600: '#0D9488',
    700: '#0F766E',
    800: '#115E59',
    900: '#134E4A',
  },

  // Neutrals - 순백이 아닌 부드러운 회색
  gray: {
    50: '#FAFAF9',
    100: '#F5F5F4',
    200: '#E7E5E4',
    300: '#D6D3D1',
    400: '#A8A29E',
    500: '#78716C',
    600: '#57534E',
    700: '#44403C',
    800: '#292524',
    900: '#1C1917',
  },

  // Background colors
  background: {
    light: '#FAFAF9',      // Main background (not pure white)
    paper: '#FFFFFF',      // Card background
    dark: '#0F0F0F',       // Dark mode base
    darkPaper: '#1A1A1A',  // Dark mode card
    darkElevated: '#262626', // Dark mode elevated surfaces
  },

  // Text colors
  text: {
    primary: '#18181B',      // Main text (not pure black)
    secondary: '#52525B',    // Secondary text
    tertiary: '#A1A1AA',     // Disabled/placeholder text
    inverse: '#FAFAFA',      // Text on dark backgrounds
  },

  // State colors
  success: {
    light: '#D1FAE5',
    DEFAULT: '#10B981',
    dark: '#047857',
  },
  warning: {
    light: '#FEF3C7',
    DEFAULT: '#F59E0B',
    dark: '#D97706',
  },
  error: {
    light: '#FEE2E2',
    DEFAULT: '#EF4444',
    dark: '#DC2626',
  },
  info: {
    light: '#DBEAFE',
    DEFAULT: '#3B82F6',
    dark: '#2563EB',
  },
} as const;

// ============================================
// TYPOGRAPHY
// ============================================

export const typography = {
  // Font families
  fontFamily: {
    sans: ['Pretendard Variable', 'Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'Roboto', 'sans-serif'],
    serif: ['Source Serif 4', 'Georgia', 'Cambria', 'Times New Roman', 'Times', 'serif'],
    mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
  },

  // Font sizes (using rem for accessibility)
  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px - Reading optimized
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
    '5xl': '3rem',      // 48px
    '6xl': '3.75rem',   // 60px
    '7xl': '4.5rem',    // 72px
  },

  // Font weights
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },

  // Line heights
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '1.75',      // Reading optimized
    extraLoose: '2',
  },

  // Letter spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
    reading: '-0.011em',  // Reading optimized
  },

  // Reading-optimized settings
  reading: {
    fontSize: '1.125rem',    // 18px
    lineHeight: '1.75',      // 28px
    letterSpacing: '-0.011em',
    maxWidth: '65ch',        // Optimal reading width
  },
} as const;

// ============================================
// SPACING
// ============================================

export const spacing = {
  // Base unit: 0.25rem (4px)
  px: '1px',
  0: '0',
  0.5: '0.125rem',   // 2px
  1: '0.25rem',      // 4px
  1.5: '0.375rem',   // 6px
  2: '0.5rem',       // 8px - Base unit
  2.5: '0.625rem',   // 10px
  3: '0.75rem',      // 12px
  3.5: '0.875rem',   // 14px
  4: '1rem',         // 16px
  5: '1.25rem',      // 20px
  6: '1.5rem',       // 24px
  7: '1.75rem',      // 28px
  8: '2rem',         // 32px
  9: '2.25rem',      // 36px
  10: '2.5rem',      // 40px
  11: '2.75rem',     // 44px
  12: '3rem',        // 48px
  14: '3.5rem',      // 56px
  16: '4rem',        // 64px
  20: '5rem',        // 80px
  24: '6rem',        // 96px
  28: '7rem',        // 112px
  32: '8rem',        // 128px
  36: '9rem',        // 144px
  40: '10rem',       // 160px
  44: '11rem',       // 176px
  48: '12rem',       // 192px
  52: '13rem',       // 208px
  56: '14rem',       // 224px
  60: '15rem',       // 240px
  64: '16rem',       // 256px
  72: '18rem',       // 288px
  80: '20rem',       // 320px
  96: '24rem',       // 384px

  // Section spacing (non-uniform for visual interest)
  section: {
    tight: '3rem',      // 48px - Related sections
    normal: '5rem',     // 80px - Normal sections
    loose: '8rem',      // 128px - Topic transition
    spacious: '12rem',  // 192px - Major transition
  },

  // Container widths
  container: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
    reading: '800px',    // Book reading area
  },
} as const;

// ============================================
// BORDER RADIUS
// ============================================

export const borderRadius = {
  none: '0',
  sm: '0.125rem',     // 2px
  DEFAULT: '0.375rem', // 6px
  md: '0.5rem',       // 8px
  lg: '0.75rem',      // 12px
  xl: '1rem',         // 16px
  '2xl': '1.5rem',    // 24px
  '3xl': '2rem',      // 32px
  full: '9999px',
} as const;

// ============================================
// SHADOWS
// ============================================

export const shadows = {
  // Subtle elevation
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',

  // Interactive shadows (for hover states)
  hover: {
    sm: '0 2px 4px 0 rgba(0, 0, 0, 0.08)',
    md: '0 8px 16px 0 rgba(0, 0, 0, 0.12)',
    lg: '0 12px 24px 0 rgba(0, 0, 0, 0.15)',
    xl: '0 20px 40px 0 rgba(0, 0, 0, 0.18)',
  },

  // Inner shadows
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',

  // No shadow
  none: 'none',
} as const;

// ============================================
// TRANSITIONS
// ============================================

export const transitions = {
  // Easing functions
  easing: {
    default: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0.0, 1, 1)',
    out: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    smooth: 'cubic-bezier(0.45, 0, 0.55, 1)',
  },

  // Duration
  duration: {
    fastest: '75ms',
    faster: '100ms',
    fast: '150ms',
    normal: '250ms',
    slow: '350ms',
    slower: '500ms',
    slowest: '700ms',
  },

  // Predefined transitions
  properties: {
    all: 'all',
    colors: 'background-color, border-color, color, fill, stroke',
    opacity: 'opacity',
    shadow: 'box-shadow',
    transform: 'transform',
  },
} as const;

// ============================================
// Z-INDEX
// ============================================

export const zIndex = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
} as const;

// ============================================
// BREAKPOINTS
// ============================================

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// ============================================
// ANIMATION PRESETS
// ============================================

export const animations = {
  // Button interactions
  button: {
    hover: {
      transform: 'translateY(-2px)',
      boxShadow: shadows.hover.md,
      transition: `all ${transitions.duration.normal} ${transitions.easing.default}`,
    },
    active: {
      transform: 'translateY(0)',
      boxShadow: shadows.sm,
      transition: `all ${transitions.duration.fast} ${transitions.easing.default}`,
    },
  },

  // Card interactions
  card: {
    hover: {
      transform: 'scale(1.02)',
      boxShadow: shadows.hover.lg,
      transition: `all ${transitions.duration.slow} ${transitions.easing.default}`,
    },
  },

  // Page transitions
  page: {
    fadeIn: {
      from: { opacity: 0, transform: 'translateY(20px)' },
      to: { opacity: 1, transform: 'translateY(0)' },
      duration: transitions.duration.slower,
      easing: transitions.easing.smooth,
    },
    slideInRight: {
      from: { opacity: 0, transform: 'translateX(20px)' },
      to: { opacity: 1, transform: 'translateX(0)' },
      duration: transitions.duration.slow,
      easing: transitions.easing.default,
    },
  },

  // Loading animations
  pulse: {
    keyframes: {
      '0%, 100%': { opacity: 1 },
      '50%': { opacity: 0.5 },
    },
    duration: transitions.duration.slowest,
  },

  spin: {
    keyframes: {
      from: { transform: 'rotate(0deg)' },
      to: { transform: 'rotate(360deg)' },
    },
    duration: transitions.duration.slowest,
  },
} as const;

// ============================================
// EXPORT TYPES
// ============================================

export type ColorToken = typeof colors;
export type TypographyToken = typeof typography;
export type SpacingToken = typeof spacing;
export type TransitionToken = typeof transitions;
export type AnimationToken = typeof animations;
