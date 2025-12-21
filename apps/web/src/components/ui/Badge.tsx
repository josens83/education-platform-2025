/**
 * Badge Component
 * Following Education Platform 2025 Design System
 *
 * Features:
 * - Multiple variants (primary, secondary, accent, success, warning, error)
 * - Multiple sizes (sm, md, lg)
 * - Optional icon
 * - Achievement badges for gamification
 */

import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Badge variant */
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'info';
  /** Badge size */
  size?: 'sm' | 'md' | 'lg';
  /** Icon to display before text */
  icon?: React.ReactNode;
  /** Dot indicator */
  dot?: boolean;
}

/**
 * Badge component with design system styles
 */
export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      icon,
      dot = false,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    // Base classes
    const baseClasses = 'inline-flex items-center font-medium rounded-full transition-all';

    // Variant classes
    const variantClasses = {
      primary: 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200',
      secondary: 'bg-secondary-100 text-secondary-800 dark:bg-secondary-900 dark:text-secondary-200',
      accent: 'bg-accent-100 text-accent-800 dark:bg-accent-900 dark:text-accent-200',
      success: 'bg-success-light text-success-dark',
      warning: 'bg-warning-light text-warning-dark',
      error: 'bg-error-light text-error-dark',
      info: 'bg-info-light text-info-dark',
    };

    // Size classes
    const sizeClasses = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-3 py-1 text-sm',
      lg: 'px-4 py-1.5 text-base',
    };

    // Combine all classes
    const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

    return (
      <span ref={ref} className={classes} {...props}>
        {/* Dot indicator */}
        {dot && (
          <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5" />
        )}

        {/* Icon */}
        {icon && <span className="mr-1">{icon}</span>}

        {/* Children */}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

/**
 * Achievement Badge Component
 * For gamification features (streaks, milestones, etc.)
 */
export interface AchievementBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Achievement title */
  title: string;
  /** Achievement description */
  description?: string;
  /** Badge icon */
  icon: React.ReactNode;
  /** Badge color variant */
  variant?: 'gold' | 'silver' | 'bronze' | 'primary';
  /** Locked state */
  locked?: boolean;
}

export const AchievementBadge = React.forwardRef<HTMLDivElement, AchievementBadgeProps>(
  (
    {
      title,
      description,
      icon,
      variant = 'primary',
      locked = false,
      className = '',
      ...props
    },
    ref
  ) => {
    // Variant classes
    const variantClasses = {
      gold: 'bg-gradient-to-br from-secondary-300 to-secondary-500',
      silver: 'bg-gradient-to-br from-gray-300 to-gray-400',
      bronze: 'bg-gradient-to-br from-orange-300 to-orange-500',
      primary: 'bg-gradient-to-br from-primary-400 to-primary-600',
    };

    const containerClasses = locked
      ? 'opacity-50 grayscale cursor-not-allowed'
      : 'cursor-pointer hover:scale-105 transition-transform duration-normal';

    return (
      <div
        ref={ref}
        className={`${containerClasses} ${className}`}
        {...props}
      >
        {/* Badge Icon */}
        <div
          className={`w-16 h-16 rounded-full ${variantClasses[variant]} flex items-center justify-center text-white shadow-lg mb-2`}
        >
          <div className="text-2xl">{icon}</div>
        </div>

        {/* Badge Info */}
        <div className="text-center">
          <h4 className="font-semibold text-text-primary text-sm">
            {locked ? '🔒' : ''} {title}
          </h4>
          {description && (
            <p className="text-xs text-text-secondary mt-1">{description}</p>
          )}
        </div>
      </div>
    );
  }
);

AchievementBadge.displayName = 'AchievementBadge';

export default Badge;
