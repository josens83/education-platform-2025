/**
 * Animation Hooks
 * Following Education Platform 2025 Design System
 *
 * Utility hooks for managing animations and transitions
 */

import { useState, useEffect, useRef } from 'react';

/**
 * Hook to detect when an element enters the viewport
 * Useful for scroll-triggered animations
 */
export function useInView(options: IntersectionObserverInit = {}) {
  const [isInView, setIsInView] = useState(false);
  const [hasBeenInView, setHasBeenInView] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const inView = entry.isIntersecting;
        setIsInView(inView);

        // Once it's been in view, keep track
        if (inView && !hasBeenInView) {
          setHasBeenInView(true);
        }
      },
      {
        threshold: 0.1,
        ...options,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [hasBeenInView, options]);

  return { ref, isInView, hasBeenInView };
}

/**
 * Hook for delayed animations
 * Useful for staggered animations
 */
export function useDelayedAnimation(delay: number = 0) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return isReady;
}

/**
 * Hook for managing animation states
 */
export function useAnimationState(initialState: string = 'idle') {
  const [state, setState] = useState(initialState);
  const [isAnimating, setIsAnimating] = useState(false);

  const animate = (newState: string, duration: number = 300) => {
    setIsAnimating(true);
    setState(newState);

    setTimeout(() => {
      setIsAnimating(false);
    }, duration);
  };

  return {
    state,
    setState,
    isAnimating,
    animate,
  };
}

/**
 * Hook to check if user prefers reduced motion
 */
export function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}

/**
 * Hook for counting animations (used for gamification)
 */
export function useCountUp(
  end: number,
  duration: number = 2000,
  start: number = 0,
  shouldStart: boolean = true
) {
  const [count, setCount] = useState(start);

  useEffect(() => {
    if (!shouldStart) return;

    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);

      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentCount = start + (end - start) * easeOut;

      setCount(Math.floor(currentCount));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, start, shouldStart]);

  return count;
}

/**
 * Hook for spring animations
 */
export function useSpring(target: number, config = { stiffness: 170, damping: 26 }) {
  const [value, setValue] = useState(target);
  const velocity = useRef(0);

  useEffect(() => {
    let animationFrame: number;
    const spring = () => {
      const delta = target - value;
      const acceleration = delta * (config.stiffness / 100);
      velocity.current = (velocity.current + acceleration) * (config.damping / 100);
      const newValue = value + velocity.current;

      setValue(newValue);

      if (Math.abs(delta) > 0.01 || Math.abs(velocity.current) > 0.01) {
        animationFrame = requestAnimationFrame(spring);
      }
    };

    animationFrame = requestAnimationFrame(spring);
    return () => cancelAnimationFrame(animationFrame);
  }, [target, value, config.stiffness, config.damping]);

  return value;
}
