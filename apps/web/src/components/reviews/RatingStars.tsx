import { motion } from 'framer-motion';
import { FiStar } from 'react-icons/fi';

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  showLabel?: boolean;
}

/**
 * Premium Rating Stars Component
 * - Animated star ratings with Linear/Stripe style
 * - Interactive mode for input
 * - Display mode for showing ratings
 */
export default function RatingStars({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onRatingChange,
  showLabel = false,
}: RatingStarsProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const handleClick = (newRating: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(newRating);
    }
  };

  const getRatingLabel = (rating: number) => {
    if (rating >= 4.5) return '최고예요';
    if (rating >= 3.5) return '좋아요';
    if (rating >= 2.5) return '보통이에요';
    if (rating >= 1.5) return '별로예요';
    return '아쉬워요';
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxRating }, (_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= Math.round(rating);
          const isPartiallyFilled = starValue > rating && starValue - 1 < rating;

          return (
            <motion.button
              key={index}
              type="button"
              onClick={() => handleClick(starValue)}
              disabled={!interactive}
              className={`relative ${sizeClasses[size]} ${
                interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'
              } transition-transform`}
              whileHover={interactive ? { scale: 1.1 } : {}}
              whileTap={interactive ? { scale: 0.95 } : {}}
            >
              {/* Background star */}
              <FiStar
                className={`absolute inset-0 ${sizeClasses[size]} text-border transition-colors`}
                strokeWidth={1.5}
              />

              {/* Filled star */}
              {isFilled && (
                <motion.div
                  initial={interactive ? { scale: 0 } : false}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                >
                  <FiStar
                    className={`absolute inset-0 ${sizeClasses[size]} text-yellow-500 fill-yellow-500`}
                    strokeWidth={1.5}
                  />
                </motion.div>
              )}

              {/* Partially filled star (for decimal ratings) */}
              {isPartiallyFilled && (
                <div className="absolute inset-0 overflow-hidden" style={{ width: `${(rating % 1) * 100}%` }}>
                  <FiStar
                    className={`${sizeClasses[size]} text-yellow-500 fill-yellow-500`}
                    strokeWidth={1.5}
                  />
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {showLabel && (
        <span className="text-sm font-medium text-text-secondary">
          {rating.toFixed(1)} · {getRatingLabel(rating)}
        </span>
      )}
    </div>
  );
}
