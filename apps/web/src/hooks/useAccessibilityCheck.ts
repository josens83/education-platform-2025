/**
 * Accessibility Check Hook
 * Development-only accessibility checking using axe-core
 *
 * Features:
 * - Runtime accessibility violation detection
 * - Console logging of violations
 * - Only runs in development mode
 */

import { useEffect } from 'react'

interface AxeViolation {
  id: string
  impact: 'minor' | 'moderate' | 'serious' | 'critical'
  description: string
  nodes: Array<{
    html: string
    target: string[]
  }>
}

/**
 * Hook to check accessibility violations in development
 * Uses @axe-core/react when available
 *
 * Usage:
 * ```tsx
 * function App() {
 *   useAccessibilityCheck()
 *   return <YourApp />
 * }
 * ```
 */
export function useAccessibilityCheck(): void {
  useEffect(() => {
    // Only run in development
    if (import.meta.env.PROD) return

    // Dynamically import axe-core to avoid bundling in production
    const checkAccessibility = async () => {
      try {
        // @ts-expect-error - axe-core is an optional dependency
        const axe = await import('axe-core')
        const results = await axe.default.run()

        if (results.violations.length > 0) {
          console.group(
            '%c♿ Accessibility Violations Found',
            'color: #EF4444; font-weight: bold; font-size: 14px;'
          )

          results.violations.forEach((violation: AxeViolation) => {
            const impactColors = {
              minor: '#F59E0B',
              moderate: '#F97316',
              serious: '#EF4444',
              critical: '#DC2626',
            }

            console.group(
              `%c[${violation.impact.toUpperCase()}] ${violation.id}`,
              `color: ${impactColors[violation.impact]}; font-weight: bold;`
            )
            console.log('Description:', violation.description)
            console.log('Elements affected:')
            violation.nodes.forEach((node) => {
              console.log('  -', node.target.join(' > '))
              console.log('    HTML:', node.html)
            })
            console.groupEnd()
          })

          console.groupEnd()
        } else {
          console.log(
            '%c♿ No accessibility violations found!',
            'color: #10B981; font-weight: bold;'
          )
        }
      } catch {
        // axe-core not installed, skip check
        console.log(
          '%c♿ axe-core not installed. Run: npm install -D axe-core',
          'color: #6B7280; font-style: italic;'
        )
      }
    }

    // Delay check to allow DOM to settle
    const timeoutId = setTimeout(checkAccessibility, 1000)

    return () => clearTimeout(timeoutId)
  }, [])
}

export default useAccessibilityCheck
