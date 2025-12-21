/**
 * SkipLink Component
 * Following Education Platform 2025 Design System
 *
 * Provides keyboard users a way to skip to main content.
 * Hidden by default, visible on focus.
 *
 * Features:
 * - Keyboard accessible
 * - High contrast when visible
 * - Smooth scroll to target
 */

import React from 'react'

export interface SkipLinkProps {
  /** Target element ID (without #) */
  targetId?: string
  /** Link text */
  children?: React.ReactNode
  /** Additional class names */
  className?: string
}

/**
 * SkipLink component for accessibility
 *
 * Usage:
 * ```tsx
 * // In your layout, at the very top of the body
 * <SkipLink targetId="main-content">메인 콘텐츠로 건너뛰기</SkipLink>
 *
 * // Later in the page
 * <main id="main-content">...</main>
 * ```
 */
export const SkipLink: React.FC<SkipLinkProps> = ({
  targetId = 'main-content',
  children = '메인 콘텐츠로 건너뛰기',
  className = '',
}) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const target = document.getElementById(targetId)
    if (target) {
      target.focus()
      target.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <a
      href={`#${targetId}`}
      onClick={handleClick}
      className={`sr-only text-sm font-medium transition-all duration-200 focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[9999] focus:rounded-lg focus:bg-primary-500 focus:px-4 focus:py-2 focus:text-white focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-2 ${className} `}
    >
      {children}
    </a>
  )
}

SkipLink.displayName = 'SkipLink'

export default SkipLink
