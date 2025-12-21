/**
 * usePrefersReducedMotion Hook
 * Detects user's motion preference for accessibility
 *
 * Features:
 * - Respects OS/browser reduced motion preference
 * - Real-time updates when preference changes
 * - SSR-safe with fallback
 */

import { useState, useEffect } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

/**
 * Hook to detect if user prefers reduced motion
 *
 * Usage:
 * ```tsx
 * function AnimatedComponent() {
 *   const prefersReducedMotion = usePrefersReducedMotion()
 *
 *   return (
 *     <motion.div
 *       animate={{
 *         opacity: 1,
 *         y: prefersReducedMotion ? 0 : 20
 *       }}
 *       transition={{
 *         duration: prefersReducedMotion ? 0 : 0.3
 *       }}
 *     />
 *   )
 * }
 * ```
 */
export function usePrefersReducedMotion(): boolean {
  // Default to false (allow motion) for SSR
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(() => {
    // Check if window is available (SSR-safe)
    if (typeof window === 'undefined') return false
    return window.matchMedia(QUERY).matches
  })

  useEffect(() => {
    const mediaQueryList = window.matchMedia(QUERY)

    // Handler for preference changes
    const listener = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches)
    }

    // Modern browsers
    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener('change', listener)
    } else {
      // Legacy support
      mediaQueryList.addListener(listener)
    }

    // Cleanup
    return () => {
      if (mediaQueryList.removeEventListener) {
        mediaQueryList.removeEventListener('change', listener)
      } else {
        mediaQueryList.removeListener(listener)
      }
    }
  }, [])

  return prefersReducedMotion
}

export default usePrefersReducedMotion
