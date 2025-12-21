/**
 * OptimizedImage Component
 * Following Education Platform 2025 Design System
 *
 * Optimized image component with lazy loading, blur placeholder,
 * and CLS prevention.
 *
 * Features:
 * - Native lazy loading
 * - Blur placeholder
 * - Aspect ratio preservation (CLS prevention)
 * - Error fallback
 * - Priority loading for LCP images
 */

import React, { useState, useRef, useEffect } from 'react'

export interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** Image source URL */
  src: string
  /** Alt text (required for accessibility) */
  alt: string
  /** Image width */
  width?: number
  /** Image height */
  height?: number
  /** Aspect ratio (e.g., "16/9", "4/3", "1/1") */
  aspectRatio?: string
  /** Whether this is an LCP image (above the fold) */
  priority?: boolean
  /** Placeholder type */
  placeholder?: 'blur' | 'empty' | 'skeleton'
  /** Blur data URL for placeholder */
  blurDataURL?: string
  /** Fallback image URL on error */
  fallbackSrc?: string
  /** Object fit style */
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'
  /** Callback when image loads */
  onLoad?: () => void
  /** Callback when image fails to load */
  onError?: () => void
}

/**
 * OptimizedImage component for performance-optimized images
 *
 * Usage:
 * ```tsx
 * // LCP image (hero, above the fold)
 * <OptimizedImage
 *   src="/hero.jpg"
 *   alt="Hero image"
 *   width={1200}
 *   height={600}
 *   priority
 * />
 *
 * // Regular lazy-loaded image with aspect ratio
 * <OptimizedImage
 *   src="/product.jpg"
 *   alt="Product"
 *   aspectRatio="4/3"
 *   placeholder="skeleton"
 * />
 * ```
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  aspectRatio,
  priority = false,
  placeholder = 'skeleton',
  blurDataURL,
  fallbackSrc = '/placeholder-image.svg',
  objectFit = 'cover',
  className = '',
  onLoad,
  onError,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  // Use Intersection Observer for custom lazy loading behavior
  useEffect(() => {
    if (priority || !imgRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Image is in viewport, browser will handle loading
            observer.disconnect()
          }
        })
      },
      { rootMargin: '50px' }
    )

    observer.observe(imgRef.current)

    return () => observer.disconnect()
  }, [priority])

  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  const handleError = () => {
    setHasError(true)
    onError?.()
  }

  // Calculate aspect ratio style
  const aspectRatioStyle = aspectRatio
    ? { aspectRatio }
    : width && height
      ? { aspectRatio: `${width}/${height}` }
      : undefined

  // Determine final src
  const imageSrc = hasError ? fallbackSrc : src

  // Placeholder element
  const renderPlaceholder = () => {
    if (isLoaded) return null

    switch (placeholder) {
      case 'blur':
        return blurDataURL ? (
          <img
            src={blurDataURL}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full scale-110 object-cover blur-lg"
          />
        ) : (
          <div className="absolute inset-0 animate-pulse bg-gray-200 dark:bg-gray-700" />
        )
      case 'skeleton':
        return <div className="absolute inset-0 animate-pulse bg-gray-200 dark:bg-gray-700" />
      case 'empty':
      default:
        return null
    }
  }

  return (
    <div className={`relative overflow-hidden ${className}`} style={aspectRatioStyle}>
      {/* Placeholder */}
      {renderPlaceholder()}

      {/* Image */}
      <img
        ref={imgRef}
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : undefined}
        decoding={priority ? 'sync' : 'async'}
        onLoad={handleLoad}
        onError={handleError}
        className={`h-full w-full transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} `}
        style={{ objectFit }}
        {...props}
      />
    </div>
  )
}

OptimizedImage.displayName = 'OptimizedImage'

export default OptimizedImage
