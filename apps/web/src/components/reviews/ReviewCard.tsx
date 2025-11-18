import { motion } from 'framer-motion';
import { FiThumbsUp, FiFlag, FiCheck } from 'react-icons/fi';
import RatingStars from './RatingStars';
import { useState } from 'react';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';

interface ReviewCardProps {
  review: {
    id: number;
    user_id: number;
    book_id: number;
    rating: number;
    title: string;
    content: string;
    reading_level?: string;
    helpfulness_score?: number;
    is_verified_purchase: boolean;
    created_at: string;
    user?: {
      username: string;
      role?: string;
    };
    book?: {
      title: string;
    };
    helpful_count?: number;
    user_helpful?: boolean;
  };
  showBookTitle?: boolean;
  onHelpfulUpdate?: () => void;
}

/**
 * Premium Review Card Component
 * - Glass morphism design
 * - Helpful voting system
 * - Verified purchase badge
 * - Report functionality
 */
export default function ReviewCard({ review, showBookTitle = false, onHelpfulUpdate }: ReviewCardProps) {
  const [isHelpful, setIsHelpful] = useState(review.user_helpful || false);
  const [helpfulCount, setHelpfulCount] = useState(review.helpful_count || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleHelpful = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (isHelpful) {
        // Remove helpful
        await api.client.delete(`/api/reviews/${review.id}/helpful`);
        setHelpfulCount(prev => Math.max(0, prev - 1));
        setIsHelpful(false);
        toast.success('도움됨 취소');
      } else {
        // Add helpful
        await api.client.post(`/api/reviews/${review.id}/helpful`);
        setHelpfulCount(prev => prev + 1);
        setIsHelpful(true);
        toast.success('도움됨 표시');
      }
      onHelpfulUpdate?.();
    } catch (error: any) {
      toast.error(error.response?.data?.message || '오류가 발생했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReport = async () => {
    const reason = prompt('신고 사유를 입력해주세요:');
    if (!reason || reason.trim().length < 5) {
      toast.error('신고 사유를 5자 이상 입력해주세요');
      return;
    }

    try {
      await api.client.post(`/api/reviews/${review.id}/report`, { reason: reason.trim() });
      toast.success('리뷰가 신고되었습니다');
    } catch (error: any) {
      toast.error(error.response?.data?.message || '신고 처리 중 오류가 발생했습니다');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return '오늘';
    if (diffInDays === 1) return '어제';
    if (diffInDays < 7) return `${diffInDays}일 전`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}주 전`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)}개월 전`;
    return `${Math.floor(diffInDays / 365)}년 전`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bento-item p-6 hover:shadow-smooth-lg transition-shadow"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            {/* User avatar */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center text-white font-bold">
              {review.user?.username?.[0]?.toUpperCase() || 'U'}
            </div>

            {/* User info */}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-text-primary">{review.user?.username || '익명'}</span>
                {review.is_verified_purchase && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-medium">
                    <FiCheck className="w-3 h-3" />
                    구매 인증
                  </span>
                )}
              </div>
              <div className="text-sm text-text-tertiary">{formatDate(review.created_at)}</div>
            </div>
          </div>

          {/* Rating */}
          <RatingStars rating={review.rating} size="sm" showLabel />
        </div>

        {/* Actions */}
        <button
          onClick={handleReport}
          className="p-2 rounded-lg hover:bg-surface-hover transition-colors text-text-tertiary hover:text-red-500"
          title="리뷰 신고"
        >
          <FiFlag className="w-4 h-4" />
        </button>
      </div>

      {/* Book title (optional) */}
      {showBookTitle && review.book && (
        <div className="mb-3 text-sm text-text-secondary">
          <span className="font-medium">{review.book.title}</span>에 대한 리뷰
        </div>
      )}

      {/* Review content */}
      <div className="mb-4">
        {review.title && (
          <h3 className="font-bold text-text-primary mb-2 text-lg">{review.title}</h3>
        )}
        <p className="text-text-secondary leading-relaxed whitespace-pre-wrap">{review.content}</p>
      </div>

      {/* Reading level badge */}
      {review.reading_level && (
        <div className="mb-4">
          <span className="inline-flex px-3 py-1 rounded-full bg-primary-500/10 text-primary-600 dark:text-primary-400 text-xs font-medium">
            {review.reading_level === 'too_easy' && '너무 쉬워요'}
            {review.reading_level === 'just_right' && '딱 좋아요'}
            {review.reading_level === 'challenging' && '도전적이에요'}
            {review.reading_level === 'too_difficult' && '너무 어려워요'}
          </span>
        </div>
      )}

      {/* Footer actions */}
      <div className="flex items-center gap-4 pt-4 border-t border-border">
        <button
          onClick={handleHelpful}
          disabled={isSubmitting}
          className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
            isHelpful
              ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400'
              : 'hover:bg-surface-hover text-text-tertiary hover:text-primary-600'
          } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <FiThumbsUp className={`w-4 h-4 transition-transform ${isHelpful ? 'fill-current' : 'group-hover:scale-110'}`} />
          <span className="text-sm font-medium">
            도움됨 {helpfulCount > 0 && `(${helpfulCount})`}
          </span>
        </button>
      </div>
    </motion.div>
  );
}
