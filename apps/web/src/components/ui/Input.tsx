/**
 * Input Component
 * Following Education Platform 2025 Design System
 *
 * Features:
 * - Multiple sizes (sm, md, lg)
 * - Error and success states
 * - Icon support
 * - Label and helper text
 * - Accessibility compliant
 */

import React from 'react'

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Input size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Error state */
  error?: boolean
  /** Error message */
  errorMessage?: string
  /** Success state */
  success?: boolean
  /** Helper text */
  helperText?: string
  /** Label */
  label?: string
  /** Icon to display before input */
  leftIcon?: React.ReactNode
  /** Icon to display after input */
  rightIcon?: React.ReactNode
  /** Full width input */
  fullWidth?: boolean
}

/**
 * Input component with design system styles
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      size = 'md',
      error = false,
      errorMessage,
      success = false,
      helperText,
      label,
      leftIcon,
      rightIcon,
      fullWidth = true,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    // Generate unique ID if not provided
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`

    // Base classes
    const baseClasses =
      'border rounded-lg bg-background-paper text-text-primary placeholder:text-text-tertiary transition-all duration-normal focus:outline-none focus:ring-2'

    // Size classes
    const sizeClasses = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-3 text-base',
      lg: 'px-5 py-4 text-lg',
    }

    // State classes
    const stateClasses = error
      ? 'border-error focus:ring-error focus:border-error'
      : success
        ? 'border-success focus:ring-success focus:border-success'
        : 'border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-transparent'

    // Width classes
    const widthClasses = fullWidth ? 'w-full' : ''

    // Icon padding
    const iconPaddingClasses = leftIcon ? 'pl-11' : rightIcon ? 'pr-11' : ''

    // Combine all classes
    const inputClasses = `${baseClasses} ${sizeClasses[size]} ${stateClasses} ${widthClasses} ${iconPaddingClasses} ${className}`

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {/* Label */}
        {label && (
          <label htmlFor={inputId} className="mb-2 block text-sm font-medium text-text-primary">
            {label}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
              {leftIcon}
            </div>
          )}

          {/* Input */}
          <input ref={ref} id={inputId} className={inputClasses} {...props} />

          {/* Right Icon */}
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary">
              {rightIcon}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && errorMessage && (
          <p className="mt-2 flex items-center text-sm text-error">
            <svg className="mr-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            {errorMessage}
          </p>
        )}

        {/* Helper Text */}
        {!error && helperText && <p className="mt-2 text-sm text-text-secondary">{helperText}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
