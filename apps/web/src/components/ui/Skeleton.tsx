/**
 * Skeleton Component
 * Following Education Platform 2025 Design System
 *
 * Features:
 * - Multiple variants (text, circular, rectangular)
 * - Shimmer animation
 * - Reduced motion support
 * - Composable skeleton patterns
 */

import React from 'react'

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Skeleton variant */
  variant?: 'text' | 'circular' | 'rectangular'
  /** Width (can be number for pixels or string for CSS value) */
  width?: number | string
  /** Height (can be number for pixels or string for CSS value) */
  height?: number | string
  /** Animation type */
  animation?: 'pulse' | 'shimmer' | 'none'
}

/**
 * Skeleton component for loading states
 */
export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      variant = 'rectangular',
      width,
      height,
      animation = 'pulse',
      className = '',
      style,
      ...props
    },
    ref
  ) => {
    // Base classes
    const baseClasses = 'bg-gray-200 dark:bg-gray-700'

    // Variant classes
    const variantClasses = {
      text: 'rounded',
      circular: 'rounded-full',
      rectangular: 'rounded-lg',
    }

    // Animation classes with reduced motion support
    const animationClasses = {
      pulse: 'animate-pulse motion-reduce:animate-none',
      shimmer:
        'relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent motion-reduce:before:animate-none',
      none: '',
    }

    // Combine all classes
    const classes = `${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`

    // Calculate style
    const computedStyle: React.CSSProperties = {
      width: typeof width === 'number' ? `${width}px` : width,
      height: typeof height === 'number' ? `${height}px` : height,
      ...style,
    }

    return <div ref={ref} className={classes} style={computedStyle} aria-hidden="true" {...props} />
  }
)

Skeleton.displayName = 'Skeleton'

/**
 * SkeletonText - Pre-configured skeleton for text content
 */
export interface SkeletonTextProps extends Omit<SkeletonProps, 'variant'> {
  /** Number of lines */
  lines?: number
  /** Last line width percentage */
  lastLineWidth?: number | string
}

export const SkeletonText: React.FC<SkeletonTextProps> = ({
  lines = 3,
  lastLineWidth = '60%',
  className = '',
  ...props
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {[...Array(lines)].map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          height={16}
          width={i === lines - 1 ? lastLineWidth : '100%'}
          {...props}
        />
      ))}
    </div>
  )
}

SkeletonText.displayName = 'SkeletonText'

/**
 * SkeletonCard - Pre-configured skeleton for card content
 */
export interface SkeletonCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Show image placeholder */
  hasImage?: boolean
  /** Image height */
  imageHeight?: number
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  hasImage = true,
  imageHeight = 200,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`overflow-hidden rounded-xl border border-gray-200 bg-background-paper dark:border-gray-700 ${className}`}
      {...props}
    >
      {hasImage && <Skeleton variant="rectangular" height={imageHeight} className="rounded-none" />}
      <div className="space-y-3 p-4">
        <Skeleton variant="text" height={24} width="70%" />
        <SkeletonText lines={2} />
        <div className="flex gap-2 pt-2">
          <Skeleton variant="rectangular" height={36} width={100} />
          <Skeleton variant="rectangular" height={36} width={80} />
        </div>
      </div>
    </div>
  )
}

SkeletonCard.displayName = 'SkeletonCard'

/**
 * SkeletonAvatar - Pre-configured skeleton for avatar
 */
export interface SkeletonAvatarProps extends Omit<SkeletonProps, 'variant'> {
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export const SkeletonAvatar: React.FC<SkeletonAvatarProps> = ({ size = 'md', ...props }) => {
  const sizeMap = {
    sm: 32,
    md: 40,
    lg: 48,
    xl: 64,
  }

  return <Skeleton variant="circular" width={sizeMap[size]} height={sizeMap[size]} {...props} />
}

SkeletonAvatar.displayName = 'SkeletonAvatar'

/**
 * SkeletonTable - Pre-configured skeleton for table
 */
export interface SkeletonTableProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Number of rows */
  rows?: number
  /** Number of columns */
  columns?: number
}

export const SkeletonTable: React.FC<SkeletonTableProps> = ({
  rows = 5,
  columns = 4,
  className = '',
  ...props
}) => {
  return (
    <div className={`space-y-3 ${className}`} {...props}>
      {/* Header */}
      <div className="flex gap-4 border-b border-gray-200 pb-2 dark:border-gray-700">
        {[...Array(columns)].map((_, i) => (
          <Skeleton key={i} variant="text" height={20} className="flex-1" />
        ))}
      </div>
      {/* Rows */}
      {[...Array(rows)].map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4">
          {[...Array(columns)].map((_, colIndex) => (
            <Skeleton key={colIndex} variant="text" height={16} className="flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

SkeletonTable.displayName = 'SkeletonTable'

export default Skeleton
