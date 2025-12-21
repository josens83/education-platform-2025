/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable dark mode via class strategy
  theme: {
    extend: {
      // ============================================
      // COLOR SYSTEM - Education Platform 2025
      // ============================================
      colors: {
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
      },

      // ============================================
      // TYPOGRAPHY
      // ============================================
      fontFamily: {
        sans: ['Pretendard Variable', 'Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'Roboto', 'sans-serif'],
        serif: ['Source Serif 4', 'Georgia', 'Cambria', 'Times New Roman', 'Times', 'serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },

      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],           // 12px
        sm: ['0.875rem', { lineHeight: '1.25rem' }],       // 14px
        base: ['1rem', { lineHeight: '1.5rem' }],          // 16px
        lg: ['1.125rem', { lineHeight: '1.75rem' }],       // 18px - Reading optimized
        xl: ['1.25rem', { lineHeight: '1.75rem' }],        // 20px
        '2xl': ['1.5rem', { lineHeight: '2rem' }],         // 24px
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],    // 30px
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],      // 36px
        '5xl': ['3rem', { lineHeight: '1' }],              // 48px
        '6xl': ['3.75rem', { lineHeight: '1' }],           // 60px
        '7xl': ['4.5rem', { lineHeight: '1' }],            // 72px
        // Reading-optimized size
        reading: ['1.125rem', { lineHeight: '1.75', letterSpacing: '-0.011em' }],
      },

      fontWeight: {
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
      },

      lineHeight: {
        none: '1',
        tight: '1.25',
        snug: '1.375',
        normal: '1.5',
        relaxed: '1.625',
        loose: '1.75',      // Reading optimized
        extraLoose: '2',
      },

      letterSpacing: {
        tighter: '-0.05em',
        tight: '-0.025em',
        normal: '0',
        wide: '0.025em',
        wider: '0.05em',
        widest: '0.1em',
        reading: '-0.011em',  // Reading optimized
      },

      // ============================================
      // SPACING
      // ============================================
      spacing: {
        // Base spacing (inherited from Tailwind)
        // Section spacing for layouts
        'section-tight': '3rem',      // 48px - Related sections
        'section-normal': '5rem',     // 80px - Normal sections
        'section-loose': '8rem',      // 128px - Topic transition
        'section-spacious': '12rem',  // 192px - Major transition
      },

      maxWidth: {
        'reading': '800px',    // Book reading area
        '65ch': '65ch',        // Optimal reading width
      },

      // ============================================
      // BORDER RADIUS
      // ============================================
      borderRadius: {
        none: '0',
        sm: '0.125rem',     // 2px
        DEFAULT: '0.375rem', // 6px
        md: '0.5rem',       // 8px
        lg: '0.75rem',      // 12px
        xl: '1rem',         // 16px
        '2xl': '1.5rem',    // 24px
        '3xl': '2rem',      // 32px
        full: '9999px',
      },

      // ============================================
      // SHADOWS
      // ============================================
      boxShadow: {
        // Subtle elevation
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',

        // Interactive shadows (for hover states)
        'hover-sm': '0 2px 4px 0 rgba(0, 0, 0, 0.08)',
        'hover-md': '0 8px 16px 0 rgba(0, 0, 0, 0.12)',
        'hover-lg': '0 12px 24px 0 rgba(0, 0, 0, 0.15)',
        'hover-xl': '0 20px 40px 0 rgba(0, 0, 0, 0.18)',

        // Inner shadows
        inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',

        // No shadow
        none: 'none',
      },

      // ============================================
      // TRANSITIONS
      // ============================================
      transitionDuration: {
        fastest: '75ms',
        faster: '100ms',
        fast: '150ms',
        normal: '250ms',
        slow: '350ms',
        slower: '500ms',
        slowest: '700ms',
      },

      transitionTimingFunction: {
        default: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
        linear: 'linear',
        in: 'cubic-bezier(0.4, 0.0, 1, 1)',
        out: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
        'in-out': 'cubic-bezier(0.4, 0.0, 0.2, 1)',
        bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        smooth: 'cubic-bezier(0.45, 0, 0.55, 1)',
      },

      // ============================================
      // ANIMATIONS
      // ============================================
      animation: {
        // Button interactions
        'button-hover': 'buttonHover 250ms cubic-bezier(0.4, 0.0, 0.2, 1)',
        'button-active': 'buttonActive 150ms cubic-bezier(0.4, 0.0, 0.2, 1)',

        // Card interactions
        'card-hover': 'cardHover 350ms cubic-bezier(0.4, 0.0, 0.2, 1)',

        // Page transitions
        'fade-in': 'fadeIn 500ms cubic-bezier(0.45, 0, 0.55, 1)',
        'slide-in-right': 'slideInRight 350ms cubic-bezier(0.4, 0.0, 0.2, 1)',

        // Loading animations
        'pulse': 'pulse 700ms cubic-bezier(0.4, 0.0, 0.2, 1) infinite',
        'spin': 'spin 700ms linear infinite',

        // Legacy animations (preserved for compatibility)
        'fade-in-slow': 'fadeIn 0.6s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'gradient-shift': 'gradientShift 8s ease infinite',
      },

      keyframes: {
        // Shimmer animation for Skeleton
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },

        // Button animations
        buttonHover: {
          '0%': { transform: 'translateY(0)', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' },
          '100%': { transform: 'translateY(-2px)', boxShadow: '0 8px 16px 0 rgba(0, 0, 0, 0.12)' },
        },
        buttonActive: {
          '0%': { transform: 'translateY(-2px)', boxShadow: '0 8px 16px 0 rgba(0, 0, 0, 0.12)' },
          '100%': { transform: 'translateY(0)', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' },
        },

        // Card animations
        cardHover: {
          '0%': { transform: 'scale(1)', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' },
          '100%': { transform: 'scale(1.02)', boxShadow: '0 12px 24px 0 rgba(0, 0, 0, 0.15)' },
        },

        // Page transition animations
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },

        // Loading animations
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        spin: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },

        // Legacy keyframes (preserved for compatibility)
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },

      // ============================================
      // Z-INDEX
      // ============================================
      zIndex: {
        dropdown: '1000',
        sticky: '1020',
        fixed: '1030',
        'modal-backdrop': '1040',
        modal: '1050',
        popover: '1060',
        tooltip: '1070',
      },

      // ============================================
      // BACKGROUND IMAGES (Legacy - preserved)
      // ============================================
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-linear-purple': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-linear-blue': 'linear-gradient(135deg, #667eea 0%, #4c9aff 100%)',
        'gradient-mesh': 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
      },

      // ============================================
      // BACKDROP BLUR
      // ============================================
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
