/**
 * VisuallyHidden Component
 * Following Education Platform 2025 Design System
 *
 * Hides content visually while keeping it accessible to screen readers.
 *
 * Features:
 * - Content hidden from visual users
 * - Accessible to screen readers
 * - Can optionally become visible on focus
 */

import React from 'react'

export interface VisuallyHiddenProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Content to hide visually */
  children: React.ReactNode
  /** If true, becomes visible when focused */
  focusable?: boolean
  /** HTML element to render as */
  as?: keyof JSX.IntrinsicElements
}

/**
 * VisuallyHidden component for screen reader only content
 *
 * Usage:
 * ```tsx
 * // Icon button with accessible label
 * <button>
 *   <Icon />
 *   <VisuallyHidden>Close menu</VisuallyHidden>
 * </button>
 *
 * // Skip link that appears on focus
 * <VisuallyHidden focusable>
 *   <a href="#main">Skip to main content</a>
 * </VisuallyHidden>
 * ```
 */
export const VisuallyHidden: React.FC<VisuallyHiddenProps> = ({
  children,
  focusable = false,
  as: Component = 'span',
  className = '',
  ...props
}) => {
  const baseClasses = focusable ? 'sr-only focus:not-sr-only' : 'sr-only'

  return (
    // @ts-expect-error - Dynamic component type
    <Component className={`${baseClasses} ${className}`} {...props}>
      {children}
    </Component>
  )
}

VisuallyHidden.displayName = 'VisuallyHidden'

export default VisuallyHidden
