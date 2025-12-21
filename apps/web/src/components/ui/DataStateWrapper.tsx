/**
 * DataStateWrapper Component
 * Following Education Platform 2025 Design System
 *
 * A utility component that handles loading, error, empty, and success states
 * for data fetching components.
 *
 * Features:
 * - Automatic state detection
 * - Customizable loading/error/empty components
 * - TypeScript generics for type safety
 */

import React from 'react'
import { Skeleton, SkeletonCard, SkeletonTable } from './Skeleton'
import { EmptyState, EmptyStateProps } from './EmptyState'
import { ErrorState, ErrorStateProps } from './ErrorState'

export interface DataStateWrapperProps<T> {
  /** Data to display */
  data: T | null | undefined
  /** Loading state */
  isLoading: boolean
  /** Error object */
  error?: Error | null
  /** Retry callback for error state */
  onRetry?: () => void
  /** Is retry in progress */
  retrying?: boolean
  /** Check if data is empty (default: checks array length or null/undefined) */
  isEmpty?: (data: T) => boolean
  /** Custom loading component */
  loadingComponent?: React.ReactNode
  /** Loading skeleton type */
  loadingType?: 'card' | 'table' | 'list' | 'custom'
  /** Number of skeleton items to show */
  loadingCount?: number
  /** Empty state props */
  emptyProps?: Partial<EmptyStateProps>
  /** Error state props */
  errorProps?: Partial<ErrorStateProps>
  /** Children render function */
  children: (data: T) => React.ReactNode
  /** Optional className for wrapper */
  className?: string
}

/**
 * DataStateWrapper - Handles all data fetching states
 */
export function DataStateWrapper<T>({
  data,
  isLoading,
  error,
  onRetry,
  retrying = false,
  isEmpty,
  loadingComponent,
  loadingType = 'card',
  loadingCount = 3,
  emptyProps,
  errorProps,
  children,
  className = '',
}: DataStateWrapperProps<T>): React.ReactElement {
  // Check if data is empty
  const checkEmpty = (d: T): boolean => {
    if (isEmpty) return isEmpty(d)
    if (Array.isArray(d)) return d.length === 0
    if (d === null || d === undefined) return true
    if (typeof d === 'object') return Object.keys(d).length === 0
    return false
  }

  // Loading State
  if (isLoading) {
    if (loadingComponent) {
      return <div className={className}>{loadingComponent}</div>
    }

    return (
      <div className={className}>
        {loadingType === 'card' && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(loadingCount)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}
        {loadingType === 'table' && <SkeletonTable rows={loadingCount} />}
        {loadingType === 'list' && (
          <div className="space-y-4">
            {[...Array(loadingCount)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton variant="circular" width={48} height={48} />
                <div className="flex-1 space-y-2">
                  <Skeleton variant="text" height={20} width="60%" />
                  <Skeleton variant="text" height={16} width="40%" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Error State
  if (error) {
    return (
      <div className={className}>
        <ErrorState error={error} onRetry={onRetry} retrying={retrying} {...errorProps} />
      </div>
    )
  }

  // Empty State
  if (!data || checkEmpty(data)) {
    return (
      <div className={className}>
        <EmptyState
          title={emptyProps?.title || '데이터가 없습니다'}
          description={emptyProps?.description}
          action={emptyProps?.action}
          icon={emptyProps?.icon}
          {...emptyProps}
        />
      </div>
    )
  }

  // Success State
  return <div className={className}>{children(data)}</div>
}

DataStateWrapper.displayName = 'DataStateWrapper'

export default DataStateWrapper
