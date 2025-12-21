/**
 * Progress Bar Component
 * Following Education Platform 2025 Design System
 *
 * Features:
 * - Linear progress bar
 * - Circular progress indicator
 * - Animated transitions
 * - Multiple variants
 */

import React from 'react';

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Progress value (0-100) */
  value: number;
  /** Maximum value (default: 100) */
  max?: number;
  /** Size of the progress bar */
  size?: 'sm' | 'md' | 'lg';
  /** Color variant */
  variant?: 'primary' | 'secondary' | 'accent' | 'success';
  /** Show percentage text */
  showPercentage?: boolean;
  /** Label */
  label?: string;
}

/**
 * Linear Progress Bar Component
 */
export const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  (
    {
      value,
      max = 100,
      size = 'md',
      variant = 'primary',
      showPercentage = false,
      label,
      className = '',
      ...props
    },
    ref
  ) => {
    // Calculate percentage
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    // Size classes
    const sizeClasses = {
      sm: 'h-1',
      md: 'h-2',
      lg: 'h-3',
    };

    // Variant classes for the fill
    const variantClasses = {
      primary: 'bg-gradient-to-r from-primary-500 to-accent-400',
      secondary: 'bg-gradient-to-r from-secondary-400 to-secondary-500',
      accent: 'bg-gradient-to-r from-accent-400 to-accent-500',
      success: 'bg-gradient-to-r from-success to-accent-400',
    };

    return (
      <div ref={ref} className={className} {...props}>
        {/* Label and Percentage */}
        {(label || showPercentage) && (
          <div className="flex justify-between items-center mb-2">
            {label && (
              <span className="text-sm font-medium text-text-primary">
                {label}
              </span>
            )}
            {showPercentage && (
              <span className="text-sm font-medium text-text-secondary">
                {Math.round(percentage)}%
              </span>
            )}
          </div>
        )}

        {/* Progress Bar Container */}
        <div
          className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ${sizeClasses[size]}`}
        >
          {/* Progress Bar Fill */}
          <div
            className={`${sizeClasses[size]} ${variantClasses[variant]} rounded-full transition-all duration-slower ease-smooth`}
            style={{ width: `${percentage}%` }}
            role="progressbar"
            aria-valuenow={value}
            aria-valuemin={0}
            aria-valuemax={max}
          />
        </div>
      </div>
    );
  }
);

ProgressBar.displayName = 'ProgressBar';

/**
 * Circular Progress Indicator Props
 */
export interface CircularProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Progress value (0-100) */
  value: number;
  /** Maximum value (default: 100) */
  max?: number;
  /** Size of the circle */
  size?: number;
  /** Stroke width */
  strokeWidth?: number;
  /** Color variant */
  variant?: 'primary' | 'secondary' | 'accent' | 'success';
  /** Show percentage text in center */
  showPercentage?: boolean;
}

/**
 * Circular Progress Component
 */
export const CircularProgress = React.forwardRef<HTMLDivElement, CircularProgressProps>(
  (
    {
      value,
      max = 100,
      size = 120,
      strokeWidth = 8,
      variant = 'primary',
      showPercentage = true,
      className = '',
      ...props
    },
    ref
  ) => {
    // Calculate percentage and circle parameters
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    // Variant colors
    const variantColors = {
      primary: '#6366F1',
      secondary: '#FBBF24',
      accent: '#2DD4BF',
      success: '#10B981',
    };

    return (
      <div
        ref={ref}
        className={`relative inline-flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
        {...props}
      >
        {/* SVG Circle */}
        <svg
          className="transform -rotate-90"
          width={size}
          height={size}
        >
          {/* Background Circle */}
          <circle
            className="text-gray-200 dark:text-gray-700"
            strokeWidth={strokeWidth}
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />

          {/* Progress Circle */}
          <circle
            className="transition-all duration-slower ease-smooth"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            stroke={variantColors[variant]}
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
        </svg>

        {/* Percentage Text */}
        {showPercentage && (
          <span className="absolute text-lg font-semibold text-text-primary">
            {Math.round(percentage)}%
          </span>
        )}
      </div>
    );
  }
);

CircularProgress.displayName = 'CircularProgress';

export default ProgressBar;
