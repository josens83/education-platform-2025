/**
 * Animation Utilities
 * Following Education Platform 2025 Design System
 *
 * Provides consistent animation presets that respect reduced motion preferences.
 * Works with Framer Motion or CSS transitions.
 */

import type { Variants, Transition } from 'framer-motion'

// ============================================
// DURATION CONSTANTS
// ============================================
export const duration = {
  fastest: 0.075, // 75ms
  faster: 0.1, // 100ms
  fast: 0.15, // 150ms
  normal: 0.25, // 250ms (default)
  slow: 0.35, // 350ms
  slower: 0.5, // 500ms
  slowest: 0.7, // 700ms
} as const

// ============================================
// EASING FUNCTIONS
// ============================================
export const easing = {
  default: [0.4, 0.0, 0.2, 1], // ease-in-out
  easeIn: [0.4, 0.0, 1, 1],
  easeOut: [0.0, 0.0, 0.2, 1],
  easeInOut: [0.4, 0.0, 0.2, 1],
  bounce: [0.68, -0.55, 0.265, 1.55],
  smooth: [0.45, 0, 0.55, 1],
} as const

// ============================================
// TRANSITION PRESETS
// ============================================
export const transition = {
  fast: {
    duration: duration.fast,
    ease: easing.default,
  },
  normal: {
    duration: duration.normal,
    ease: easing.default,
  },
  slow: {
    duration: duration.slow,
    ease: easing.default,
  },
  spring: {
    type: 'spring',
    stiffness: 400,
    damping: 30,
  },
  springBounce: {
    type: 'spring',
    stiffness: 300,
    damping: 20,
  },
} as const

// ============================================
// REDUCED MOTION VARIANTS
// ============================================

/**
 * Create animation variants that respect reduced motion
 */
export function createReducedMotionVariants(
  variants: Variants,
  prefersReducedMotion: boolean
): Variants {
  if (!prefersReducedMotion) return variants

  // Strip all transforms and use instant transitions
  const reducedVariants: Variants = {}

  for (const key in variants) {
    const variant = variants[key]
    if (typeof variant === 'object' && variant !== null) {
      reducedVariants[key] = {
        opacity: (variant as { opacity?: number }).opacity,
        transition: { duration: 0 },
      }
    }
  }

  return reducedVariants
}

/**
 * Create transition that respects reduced motion
 */
export function createReducedMotionTransition(
  baseTransition: Transition,
  prefersReducedMotion: boolean
): Transition {
  if (prefersReducedMotion) {
    return { duration: 0 }
  }
  return baseTransition
}

// ============================================
// COMMON ANIMATION VARIANTS
// ============================================

/**
 * Fade in animation variants
 */
export const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: duration.normal,
      ease: easing.easeOut,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: duration.fast,
      ease: easing.easeIn,
    },
  },
}

/**
 * Slide up animation variants
 */
export const slideUpVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: duration.normal,
      ease: easing.easeOut,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: duration.fast,
      ease: easing.easeIn,
    },
  },
}

/**
 * Slide in from right variants
 */
export const slideInRightVariants: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: duration.normal,
      ease: easing.easeOut,
    },
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: {
      duration: duration.fast,
      ease: easing.easeIn,
    },
  },
}

/**
 * Scale in animation variants
 */
export const scaleInVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: duration.normal,
      ease: easing.easeOut,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: duration.fast,
      ease: easing.easeIn,
    },
  },
}

/**
 * Stagger children animation variants
 */
export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
}

export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: duration.normal,
      ease: easing.easeOut,
    },
  },
}

// ============================================
// MODAL ANIMATION VARIANTS
// ============================================

/**
 * Modal backdrop variants
 */
export const modalBackdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: duration.fast },
  },
  exit: {
    opacity: 0,
    transition: { duration: duration.fast, delay: 0.1 },
  },
}

/**
 * Modal content variants
 */
export const modalContentVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: duration.normal,
      ease: easing.easeOut,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: {
      duration: duration.fast,
      ease: easing.easeIn,
    },
  },
}

// ============================================
// HOVER ANIMATION PRESETS
// ============================================

/**
 * Button hover animation props
 */
export const buttonHoverAnimation = {
  whileHover: { scale: 1.02, y: -2 },
  whileTap: { scale: 0.98 },
  transition: transition.fast,
}

/**
 * Card hover animation props
 */
export const cardHoverAnimation = {
  whileHover: { scale: 1.02, y: -4 },
  transition: transition.normal,
}

/**
 * Link hover animation props (subtle)
 */
export const linkHoverAnimation = {
  whileHover: { x: 2 },
  transition: transition.fast,
}

// ============================================
// CSS CLASS UTILITIES
// ============================================

/**
 * Get Tailwind classes for reduced motion support
 */
export function getMotionClasses(baseClasses: string): string {
  return `${baseClasses} motion-reduce:transform-none motion-reduce:transition-none`
}

/**
 * Common animation class combinations
 */
export const animationClasses = {
  fadeIn: 'animate-fade-in motion-reduce:animate-none',
  slideUp: 'animate-slide-up motion-reduce:animate-none',
  scaleIn: 'animate-scale-in motion-reduce:animate-none',
  pulse: 'animate-pulse motion-reduce:animate-none',
  spin: 'animate-spin motion-reduce:animate-none',
  hoverLift:
    'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md motion-reduce:transform-none',
  hoverScale: 'transition-all duration-200 hover:scale-105 motion-reduce:transform-none',
  activeShrink: 'active:scale-95 motion-reduce:transform-none',
} as const
