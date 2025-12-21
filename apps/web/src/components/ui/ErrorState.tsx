/**
 * ErrorState Component
 * Following Education Platform 2025 Design System
 *
 * Features:
 * - Error message display
 * - Retry action
 * - Technical details (expandable in development)
 * - Accessibility compliant
 */

import React, { useState } from 'react'
import { Button } from './Button'

export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Error title */
  title?: string
  /** Error message */
  message?: string
  /** Technical error details (shown in dev mode) */
  error?: Error | null
  /** Retry callback */
  onRetry?: () => void
  /** Retry button loading state */
  retrying?: boolean
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
}

/**
 * ErrorState component for displaying error states
 */
export const ErrorState: React.FC<ErrorStateProps> = ({
  title = '오류가 발생했습니다',
  message = '데이터를 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
  error,
  onRetry,
  retrying = false,
  size = 'md',
  className = '',
  ...props
}) => {
  const [showDetails, setShowDetails] = useState(false)
  const isDev = import.meta.env.DEV

  // Size classes
  const sizeClasses = {
    sm: {
      container: 'py-8',
      icon: 'h-10 w-10',
      title: 'text-base',
      message: 'text-sm',
    },
    md: {
      container: 'py-12',
      icon: 'h-12 w-12',
      title: 'text-lg',
      message: 'text-base',
    },
    lg: {
      container: 'py-16',
      icon: 'h-16 w-16',
      title: 'text-xl',
      message: 'text-lg',
    },
  }

  const sizes = sizeClasses[size]

  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${sizes.container} ${className}`}
      role="alert"
      aria-live="assertive"
      {...props}
    >
      {/* Error Icon */}
      <div className="mb-4">
        <svg
          className={`${sizes.icon} text-error`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>

      {/* Title */}
      <h3 className={`font-semibold text-gray-900 dark:text-gray-100 ${sizes.title}`}>{title}</h3>

      {/* Message */}
      <p className={`mt-2 max-w-md text-gray-500 dark:text-gray-400 ${sizes.message}`}>{message}</p>

      {/* Actions */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        {onRetry && (
          <Button
            variant="primary"
            onClick={onRetry}
            loading={retrying}
            size={size === 'sm' ? 'sm' : 'md'}
          >
            다시 시도
          </Button>
        )}
        {isDev && error && (
          <Button
            variant="outline"
            onClick={() => setShowDetails(!showDetails)}
            size={size === 'sm' ? 'sm' : 'md'}
          >
            {showDetails ? '상세 정보 숨기기' : '상세 정보 보기'}
          </Button>
        )}
      </div>

      {/* Technical Details (Dev only) */}
      {isDev && error && showDetails && (
        <div className="mt-6 w-full max-w-2xl text-left">
          <div className="overflow-x-auto rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
            <p className="mb-2 font-mono text-sm text-error">
              {error.name}: {error.message}
            </p>
            {error.stack && (
              <pre className="whitespace-pre-wrap font-mono text-xs text-gray-600 dark:text-gray-400">
                {error.stack}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

ErrorState.displayName = 'ErrorState'

export default ErrorState
