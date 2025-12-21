/**
 * FadeIn Animation Component
 * Following Education Platform 2025 Design System
 *
 * Wrapper component for fade-in animations
 */

import React from 'react';
import { useInView, usePrefersReducedMotion } from '../../hooks/useAnimation';

export interface FadeInProps {
  /** Children to animate */
  children: React.ReactNode;
  /** Animation delay in milliseconds */
  delay?: number;
  /** Animation duration in milliseconds */
  duration?: number;
  /** Trigger animation only once */
  once?: boolean;
  /** Y offset for slide effect */
  yOffset?: number;
  /** Custom className */
  className?: string;
}

/**
 * FadeIn component
 * Fades in and optionally slides up when element enters viewport
 */
export const FadeIn: React.FC<FadeInProps> = ({
  children,
  delay = 0,
  duration = 500,
  once = true,
  yOffset = 20,
  className = '',
}) => {
  const { ref, isInView, hasBeenInView } = useInView({ threshold: 0.1 });
  const prefersReducedMotion = usePrefersReducedMotion();

  // Determine if element should be visible
  const shouldShow = once ? hasBeenInView : isInView;

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
        transform: shouldShow ? 'translateY(0)' : `translateY(${yOffset}px)`,
        transition: `opacity ${duration}ms cubic-bezier(0.45, 0, 0.55, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.45, 0, 0.55, 1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

export default FadeIn;
