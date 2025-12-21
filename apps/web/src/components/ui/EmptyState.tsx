/**
 * EmptyState Component
 * Following Education Platform 2025 Design System
 *
 * Features:
 * - Customizable icon, title, description
 * - Optional action button
 * - Multiple sizes
 * - Accessibility compliant
 */

import React from 'react'
import { Button, ButtonProps } from './Button'

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Icon to display */
  icon?: React.ReactNode
  /** Title text */
  title: string
  /** Description text */
  description?: string
  /** Action button props */
  action?: {
    label: string
    onClick: () => void
    variant?: ButtonProps['variant']
  }
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
}

/**
 * EmptyState component for when there's no data to display
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  size = 'md',
  className = '',
  ...props
}) => {
  // Size classes
  const sizeClasses = {
    sm: {
      container: 'py-8',
      icon: 'h-10 w-10',
      title: 'text-base',
      description: 'text-sm',
    },
    md: {
      container: 'py-12',
      icon: 'h-12 w-12',
      title: 'text-lg',
      description: 'text-base',
    },
    lg: {
      container: 'py-16',
      icon: 'h-16 w-16',
      title: 'text-xl',
      description: 'text-lg',
    },
  }

  const sizes = sizeClasses[size]

  // Default icon (folder with question mark)
  const defaultIcon = (
    <svg
      className={`${sizes.icon} text-gray-400`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 11v2m0 4h.01" />
    </svg>
  )

  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${sizes.container} ${className}`}
      role="status"
      aria-label={title}
      {...props}
    >
      <div className="mb-4">{icon || defaultIcon}</div>
      <h3 className={`font-semibold text-gray-900 dark:text-gray-100 ${sizes.title}`}>{title}</h3>
      {description && (
        <p className={`mt-2 max-w-sm text-gray-500 dark:text-gray-400 ${sizes.description}`}>
          {description}
        </p>
      )}
      {action && (
        <Button
          variant={action.variant || 'primary'}
          onClick={action.onClick}
          className="mt-6"
          size={size === 'sm' ? 'sm' : 'md'}
        >
          {action.label}
        </Button>
      )}
    </div>
  )
}

EmptyState.displayName = 'EmptyState'

export default EmptyState
