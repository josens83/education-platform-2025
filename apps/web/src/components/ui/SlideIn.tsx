/**
 * SlideIn Animation Component
 * Following Education Platform 2025 Design System
 *
 * Wrapper component for slide-in animations
 */

import React from 'react';
import { useInView, usePrefersReducedMotion } from '../../hooks/useAnimation';

export interface SlideInProps {
  /** Children to animate */
  children: React.ReactNode;
  /** Direction to slide from */
  direction?: 'left' | 'right' | 'up' | 'down';
  /** Animation delay in milliseconds */
  delay?: number;
  /** Animation duration in milliseconds */
  duration?: number;
  /** Trigger animation only once */
  once?: boolean;
  /** Slide offset distance */
  offset?: number;
  /** Custom className */
  className?: string;
}

/**
 * SlideIn component
 * Slides in from specified direction when element enters viewport
 */
export const SlideIn: React.FC<SlideInProps> = ({
  children,
  direction = 'left',
  delay = 0,
  duration = 350,
  once = true,
  offset = 20,
  className = '',
}) => {
  const { ref, isInView, hasBeenInView } = useInView({ threshold: 0.1 });
  const prefersReducedMotion = usePrefersReducedMotion();

  // Determine if element should be visible
  const shouldShow = once ? hasBeenInView : isInView;

  // Calculate transform based on direction
  const getTransform = () => {
    if (shouldShow) return 'translate(0, 0)';

    switch (direction) {
      case 'left':
        return `translateX(-${offset}px)`;
      case 'right':
        return `translateX(${offset}px)`;
      case 'up':
        return `translateY(-${offset}px)`;
      case 'down':
        return `translateY(${offset}px)`;
      default:
        return 'translate(0, 0)';
    }
  };

  // Skip animation if user prefers reduced motion
  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={className}
      style={{
        opacity: shouldShow ? 1 : 0,
        transform: getTransform(),
        transition: `opacity ${duration}ms cubic-bezier(0.4, 0.0, 0.2, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.4, 0.0, 0.2, 1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

export default SlideIn;
