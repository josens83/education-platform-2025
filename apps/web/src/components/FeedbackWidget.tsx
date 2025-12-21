/**
 * FeedbackWidget Component
 * Following Education Platform 2025 Design System
 *
 * In-app feedback collection widget for gathering user insights.
 *
 * Features:
 * - Floating action button trigger
 * - Text feedback with optional rating
 * - Screenshot option (optional)
 * - Sends to API or stores locally
 * - Accessible and mobile-friendly
 */

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from './ui/Button'
import { FocusTrap } from './ui/FocusTrap'

// Feedback rating options
const RATINGS = ['😡', '😕', '😐', '🙂', '😍'] as const
type Rating = (typeof RATINGS)[number] | null

export interface FeedbackWidgetProps {
  /** API endpoint to send feedback */
  endpoint?: string
  /** Position of the widget */
  position?: 'bottom-right' | 'bottom-left'
  /** Primary color for the button */
  accentColor?: string
  /** Custom trigger button */
  customTrigger?: React.ReactNode
  /** Callback after feedback is submitted */
  onSubmit?: (feedback: FeedbackData) => void
  /** Whether to show rating selector */
  showRating?: boolean
  /** Placeholder text */
  placeholder?: string
}

export interface FeedbackData {
  message: string
  rating: Rating
  page: string
  timestamp: string
  userAgent: string
}

/**
 * FeedbackWidget component for collecting user feedback
 *
 * Usage:
 * ```tsx
 * // Basic usage
 * <FeedbackWidget endpoint="/api/feedback" />
 *
 * // With callback
 * <FeedbackWidget
 *   onSubmit={(data) => console.log('Feedback:', data)}
 *   showRating
 * />
 * ```
 */
export const FeedbackWidget: React.FC<FeedbackWidgetProps> = ({
  endpoint = '/api/feedback',
  position = 'bottom-right',
  showRating = true,
  placeholder = '개선 아이디어, 버그, 불편한 점 등을 알려주세요',
  onSubmit,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [rating, setRating] = useState<Rating>(null)
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')

  // Position classes
  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
  }

  const handleSubmit = async () => {
    if (!message.trim()) return

    setStatus('submitting')

    const feedbackData: FeedbackData = {
      message: message.trim(),
      rating,
      page: window.location.pathname,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    }

    try {
      // Call custom onSubmit if provided
      if (onSubmit) {
        onSubmit(feedbackData)
      }

      // Send to endpoint
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedbackData),
      })

      if (!response.ok) throw new Error('Failed to submit feedback')

      setStatus('success')

      // Reset after 2 seconds
      setTimeout(() => {
        setIsOpen(false)
        setStatus('idle')
        setMessage('')
        setRating(null)
      }, 2000)
    } catch (err) {
      console.error('Feedback submission error:', err)
      setStatus('error')

      // Store locally as fallback
      const stored = JSON.parse(localStorage.getItem('pendingFeedback') || '[]')
      stored.push(feedbackData)
      localStorage.setItem('pendingFeedback', JSON.stringify(stored))

      // Reset error state after 3 seconds
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    setStatus('idle')
  }

  return (
    <>
      {/* Trigger Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className={`fixed ${positionClasses[position]} z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary-500 text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-2 active:scale-95`}
        aria-label="피드백 보내기"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </motion.button>

      {/* Feedback Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
              onClick={handleClose}
              aria-hidden="true"
            />

            {/* Modal */}
            <FocusTrap active={isOpen} onEscape={handleClose}>
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={`fixed ${position === 'bottom-right' ? 'bottom-20 right-4' : 'bottom-20 left-4'} z-50 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="feedback-title"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
                  <h3
                    id="feedback-title"
                    className="font-semibold text-gray-900 dark:text-gray-100"
                  >
                    피드백 보내기
                  </h3>
                  <button
                    onClick={handleClose}
                    className="rounded-lg p-1 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                    aria-label="닫기"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Content */}
                <div className="p-4">
                  {status === 'success' ? (
                    <div className="py-4 text-center">
                      <div className="mb-2 text-4xl">✅</div>
                      <p className="font-medium text-green-600 dark:text-green-400">
                        감사합니다! 피드백이 전송되었습니다.
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Rating (optional) */}
                      {showRating && (
                        <div className="mb-4">
                          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            이 페이지는 어떠신가요?
                          </label>
                          <div className="flex justify-center gap-2">
                            {RATINGS.map((emoji) => (
                              <button
                                key={emoji}
                                onClick={() => setRating(rating === emoji ? null : emoji)}
                                className={`rounded-lg p-2 text-2xl transition-all ${rating === emoji ? 'scale-110 bg-primary-100 dark:bg-primary-900' : 'hover:bg-gray-100 dark:hover:bg-gray-700'} `}
                                aria-label={`${emoji} 선택`}
                                aria-pressed={rating === emoji}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Message */}
                      <div className="mb-4">
                        <label
                          htmlFor="feedback-message"
                          className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          의견을 남겨주세요
                        </label>
                        <textarea
                          id="feedback-message"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder={placeholder}
                          rows={4}
                          className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                        />
                      </div>

                      {/* Error message */}
                      {status === 'error' && (
                        <p className="mb-4 text-sm text-error">
                          전송에 실패했습니다. 나중에 다시 시도해주세요.
                        </p>
                      )}

                      {/* Submit Button */}
                      <Button
                        onClick={handleSubmit}
                        loading={status === 'submitting'}
                        disabled={!message.trim()}
                        fullWidth
                      >
                        보내기
                      </Button>
                    </>
                  )}
                </div>
              </motion.div>
            </FocusTrap>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

FeedbackWidget.displayName = 'FeedbackWidget'

export default FeedbackWidget
