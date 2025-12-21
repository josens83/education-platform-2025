/**
 * FocusTrap Component
 * Following Education Platform 2025 Design System
 *
 * Traps focus within a container for modal dialogs and overlays.
 *
 * Features:
 * - Traps Tab navigation within container
 * - Restores focus on unmount
 * - Auto-focuses first focusable element
 * - Escape key handling
 */

import React, { useRef, useEffect, useCallback } from 'react'

// Focusable element selectors
const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

export interface FocusTrapProps {
  /** Content to trap focus within */
  children: React.ReactNode
  /** Whether the focus trap is active */
  active?: boolean
  /** Callback when Escape is pressed */
  onEscape?: () => void
  /** Whether to auto-focus first element */
  autoFocus?: boolean
  /** Whether to restore focus on unmount */
  restoreFocus?: boolean
  /** Element to focus initially (selector or ref) */
  initialFocus?: string | React.RefObject<HTMLElement>
  /** Additional class names */
  className?: string
}

/**
 * FocusTrap component for modals and dialogs
 *
 * Usage:
 * ```tsx
 * <FocusTrap active={isOpen} onEscape={onClose}>
 *   <div role="dialog" aria-modal="true">
 *     <button>Close</button>
 *     <input type="text" />
 *   </div>
 * </FocusTrap>
 * ```
 */
export const FocusTrap: React.FC<FocusTrapProps> = ({
  children,
  active = true,
  onEscape,
  autoFocus = true,
  restoreFocus = true,
  initialFocus,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<Element | null>(null)

  // Get all focusable elements within the container
  const getFocusableElements = useCallback((): HTMLElement[] => {
    if (!containerRef.current) return []
    return Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)
    ).filter((el) => el.offsetParent !== null) // Filter out hidden elements
  }, [])

  // Focus the initial element
  const focusInitial = useCallback(() => {
    if (!autoFocus) return

    // Check for custom initial focus
    if (initialFocus) {
      if (typeof initialFocus === 'string') {
        const element = containerRef.current?.querySelector<HTMLElement>(initialFocus)
        if (element) {
          element.focus()
          return
        }
      } else if (initialFocus.current) {
        initialFocus.current.focus()
        return
      }
    }

    // Default: focus first focusable element
    const focusableElements = getFocusableElements()
    if (focusableElements.length > 0) {
      focusableElements[0].focus()
    }
  }, [autoFocus, initialFocus, getFocusableElements])

  // Handle Tab key navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!active) return

      // Handle Escape
      if (e.key === 'Escape' && onEscape) {
        e.preventDefault()
        onEscape()
        return
      }

      // Handle Tab
      if (e.key === 'Tab') {
        const focusableElements = getFocusableElements()
        if (focusableElements.length === 0) return

        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]

        // Shift+Tab from first element -> focus last
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
          return
        }

        // Tab from last element -> focus first
        if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
          return
        }
      }
    },
    [active, onEscape, getFocusableElements]
  )

  // Store previous focus and set up trap
  useEffect(() => {
    if (!active) return

    // Store the currently focused element
    previousActiveElement.current = document.activeElement

    // Focus initial element
    focusInitial()

    // Add event listener
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)

      // Restore focus on unmount
      if (restoreFocus && previousActiveElement.current instanceof HTMLElement) {
        previousActiveElement.current.focus()
      }
    }
  }, [active, focusInitial, handleKeyDown, restoreFocus])

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  )
}

FocusTrap.displayName = 'FocusTrap'

export default FocusTrap
