/**
 * Card Component
 * Following Education Platform 2025 Design System
 *
 * Features:
 * - Multiple variants (default, hover, interactive, glass)
 * - Padding options
 * - Micro-interactions
 */

import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Card variant */
  variant?: 'default' | 'hover' | 'interactive' | 'glass';
  /** Padding size */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Remove border */
  noBorder?: boolean;
}

/**
 * Card component with design system styles
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      padding = 'md',
      noBorder = false,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    // Base classes
    const baseClasses = 'rounded-xl transition-all';

    // Variant classes
    const variantClasses = {
      default: 'bg-background-paper border border-gray-200 dark:border-gray-700',
      hover: 'bg-background-paper border border-gray-200 dark:border-gray-700 hover:shadow-hover-lg hover:-translate-y-1 hover:border-primary-500/30 duration-slow ease-default',
      interactive: 'bg-background-paper border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-hover-lg hover:scale-[1.02] active:scale-100 duration-slow ease-default',
      glass: 'bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10',
    };

    // Padding classes
    const paddingClasses = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };

    // Border override
    const borderClass = noBorder ? '!border-0' : '';

    // Combine all classes
    const classes = `${baseClasses} ${variantClasses[variant]} ${paddingClasses[padding]} ${borderClass} ${className}`;

    return (
      <div ref={ref} className={classes} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

/**
 * Card Header Component
 */
export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`mb-4 ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

/**
 * Card Title Component
 */
export const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={`text-xl font-semibold text-text-primary ${className}`}
        {...props}
      >
        {children}
      </h3>
    );
  }
);

CardTitle.displayName = 'CardTitle';

/**
 * Card Description Component
 */
export const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={`text-sm text-text-secondary mt-1 ${className}`}
        {...props}
      >
        {children}
      </p>
    );
  }
);

CardDescription.displayName = 'CardDescription';

/**
 * Card Content Component
 */
export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div ref={ref} className={className} {...props}>
        {children}
      </div>
    );
  }
);

CardContent.displayName = 'CardContent';

/**
 * Card Footer Component
 */
export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardFooter.displayName = 'CardFooter';

export default Card;
