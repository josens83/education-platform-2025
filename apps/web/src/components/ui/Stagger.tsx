/**
 * Stagger Animation Component
 * Following Education Platform 2025 Design System
 *
 * Wrapper component for staggered animations of child elements
 */

import React from 'react';
import { useInView, usePrefersReducedMotion } from '../../hooks/useAnimation';

export interface StaggerProps {
  /** Children to animate (should be an array) */
  children: React.ReactNode;
  /** Delay between each child animation in milliseconds */
  staggerDelay?: number;
  /** Initial delay before first animation in milliseconds */
  initialDelay?: number;
  /** Animation duration for each child in milliseconds */
  duration?: number;
  /** Animation type */
  animation?: 'fade' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'scale';
  /** Trigger animation only once */
  once?: boolean;
  /** Custom className for container */
  className?: string;
}

/**
 * Stagger component
 * Animates children with staggered timing
 */
export const Stagger: React.FC<StaggerProps> = ({
  children,
  staggerDelay = 100,
  initialDelay = 0,
  duration = 350,
  animation = 'fade',
  once = true,
  className = '',
}) => {
  const { ref, isInView, hasBeenInView } = useInView({ threshold: 0.1 });
  const prefersReducedMotion = usePrefersReducedMotion();

  // Determine if element should be visible
  const shouldShow = once ? hasBeenInView : isInView;

  // Get transform and opacity based on animation type
  const getAnimationStyle = (index: number, show: boolean) => {
    const delay = initialDelay + index * staggerDelay;

    // Skip animation if user prefers reduced motion
    if (prefersReducedMotion) {
      return {
        opacity: 1,
        transform: 'none',
      };
    }

    const baseStyle = {
      opacity: show ? 1 : 0,
      transition: `opacity ${duration}ms cubic-bezier(0.4, 0.0, 0.2, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.4, 0.0, 0.2, 1) ${delay}ms`,
    };

    switch (animation) {
      case 'fade':
        return {
          ...baseStyle,
          transform: 'none',
        };
      case 'slide-up':
        return {
          ...baseStyle,
          transform: show ? 'translateY(0)' : 'translateY(20px)',
        };
      case 'slide-down':
        return {
          ...baseStyle,
          transform: show ? 'translateY(0)' : 'translateY(-20px)',
        };
      case 'slide-left':
        return {
          ...baseStyle,
          transform: show ? 'translateX(0)' : 'translateX(20px)',
        };
      case 'slide-right':
        return {
          ...baseStyle,
          transform: show ? 'translateX(0)' : 'translateX(-20px)',
        };
      case 'scale':
        return {
          ...baseStyle,
          transform: show ? 'scale(1)' : 'scale(0.95)',
        };
      default:
        return baseStyle;
    }
  };

  // Convert children to array
  const childArray = React.Children.toArray(children);

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className={className}>
      {childArray.map((child, index) => (
        <div key={index} style={getAnimationStyle(index, shouldShow)}>
          {child}
        </div>
      ))}
    </div>
  );
};

export default Stagger;
