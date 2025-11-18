import { motion } from 'framer-motion';
import { useState } from 'react';
import RatingStars from './RatingStars';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';

interface ReviewFormProps {
  bookId: number;
  bookTitle: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

/**
 * Premium Review Form Component
 * - Interactive star rating selection
 * - Multi-field review submission
 * - Reading level assessment
 * - Validation and error handling
 */
export default function ReviewForm({ bookId, bookTitle, onSuccess, onCancel }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [readingLevel, setReadingLevel] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (rating === 0) {
      toast.error('별점을 선택해주세요');
      return;
    }

    if (content.trim().length < 10) {
      toast.error('리뷰 내용을 10자 이상 입력해주세요');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.client.post('/api/reviews', {
        book_id: bookId,
        rating,
        title: title.trim() || null,
        content: content.trim(),
        reading_level: readingLevel || null,
      });

      toast.success('리뷰가 등록되었습니다');

      // Reset form
      setRating(0);
      setTitle('');
      setContent('');
      setReadingLevel('');

      onSuccess?.();
    } catch (error: any) {
      toast.error(error.response?.data?.message || '리뷰 등록에 실패했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  const readingLevels = [
    { value: 'too_easy', label: '너무 쉬워요', emoji: '😊' },
    { value: 'just_right', label: '딱 좋아요', emoji: '👍' },
    { value: 'challenging', label: '도전적이에요', emoji: '💪' },
    { value: 'too_difficult', label: '너무 어려워요', emoji: '😓' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bento-item p-6"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">리뷰 작성</h2>
          <p className="text-text-secondary">
            <span className="font-medium text-primary-600">{bookTitle}</span>에 대한 솔직한 리뷰를 남겨주세요
          </p>
        </div>

        {/* Rating selection */}
        <div>
          <label className="block text-sm font-semibold text-text-primary mb-3">
            별점 평가 <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-4">
            <RatingStars
              rating={rating}
              interactive
              onRatingChange={setRating}
              size="lg"
            />
            {rating > 0 && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-2xl font-bold text-gradient"
              >
                {rating}.0
              </motion.span>
            )}
          </div>
        </div>

        {/* Title (optional) */}
        <div>
          <label htmlFor="review-title" className="block text-sm font-semibold text-text-primary mb-2">
            리뷰 제목 (선택)
          </label>
          <input
            id="review-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="리뷰를 한 줄로 요약해주세요"
            maxLength={100}
            className="input-premium w-full"
          />
        </div>

        {/* Content */}
        <div>
          <label htmlFor="review-content" className="block text-sm font-semibold text-text-primary mb-2">
            리뷰 내용 <span className="text-red-500">*</span>
          </label>
          <textarea
            id="review-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="이 책은 어땠나요? 다른 학습자들에게 도움이 될 만한 내용을 자유롭게 작성해주세요. (최소 10자)"
            rows={6}
            maxLength={2000}
            className="input-premium w-full resize-none"
          />
          <div className="mt-2 text-sm text-text-tertiary text-right">
            {content.length} / 2000자
          </div>
        </div>

        {/* Reading level */}
        <div>
          <label className="block text-sm font-semibold text-text-primary mb-3">
            난이도 평가 (선택)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {readingLevels.map((level) => (
              <button
                key={level.value}
                type="button"
                onClick={() => setReadingLevel(level.value === readingLevel ? '' : level.value)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  readingLevel === level.value
                    ? 'border-primary-500 bg-primary-500/10 shadow-glow'
                    : 'border-border hover:border-primary-500/50 hover:bg-surface-hover'
                }`}
              >
                <div className="text-2xl mb-1">{level.emoji}</div>
                <div className={`text-sm font-medium ${
                  readingLevel === level.value ? 'text-primary-600' : 'text-text-secondary'
                }`}>
                  {level.label}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting || rating === 0 || content.trim().length < 10}
            className="btn-primary flex-1"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                />
                등록 중...
              </span>
            ) : (
              '리뷰 등록'
            )}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="btn-secondary flex-1"
            >
              취소
            </button>
          )}
        </div>

        {/* Guidelines */}
        <div className="card-glass p-4 text-sm text-text-secondary">
          <p className="font-semibold text-text-primary mb-2">📝 리뷰 작성 가이드</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>책의 내용, 난이도, 학습 효과 등을 솔직하게 작성해주세요</li>
            <li>스포일러가 포함될 수 있으니 주의해주세요</li>
            <li>욕설, 비방, 광고성 내용은 삭제될 수 있습니다</li>
            <li>도움이 되는 리뷰는 다른 학습자들에게 큰 도움이 됩니다</li>
          </ul>
        </div>
      </form>
    </motion.div>
  );
}
