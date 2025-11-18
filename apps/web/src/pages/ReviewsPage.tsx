import { useState } from 'react';
import { useQuery } from 'react-query';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFilter, FiStar, FiTrendingUp, FiClock } from 'react-icons/fi';
import ReviewCard from '../components/reviews/ReviewCard';
import ReviewForm from '../components/reviews/ReviewForm';
import RatingStars from '../components/reviews/RatingStars';
import { api } from '../lib/api';
import toast from 'react-hot-toast';

/**
 * Premium Reviews Page
 * - Book-specific or platform-wide reviews
 * - Advanced filtering and sorting
 * - Write review modal
 * - Statistics overview
 */
export default function ReviewsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const bookId = searchParams.get('bookId') ? parseInt(searchParams.get('bookId')!) : null;
  const [sortBy, setSortBy] = useState<'recent' | 'helpful' | 'rating_high' | 'rating_low'>('recent');
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Fetch reviews
  const { data: reviewsData, isLoading, refetch } = useQuery(
    ['reviews', bookId, sortBy, filterRating, currentPage],
    async () => {
      const params: any = {
        page: currentPage,
        limit: pageSize,
        sort_by: sortBy,
      };

      if (bookId) {
        params.book_id = bookId;
      }

      if (filterRating) {
        params.min_rating = filterRating;
      }

      const response = await api.client.get('/api/reviews', { params });
      return response.data;
    }
  );

  // Fetch book details if bookId is provided
  const { data: bookData } = useQuery(
    ['book', bookId],
    async () => {
      if (!bookId) return null;
      const response = await api.client.get(`/api/books/${bookId}`);
      return response.data.data;
    },
    { enabled: !!bookId }
  );

  // Fetch review stats
  const { data: statsData } = useQuery(
    ['review-stats', bookId],
    async () => {
      const endpoint = bookId
        ? `/api/reviews/stats?book_id=${bookId}`
        : '/api/reviews/stats';
      const response = await api.client.get(endpoint);
      return response.data.data;
    }
  );

  const reviews = reviewsData?.data || [];
  const totalReviews = reviewsData?.pagination?.total || 0;
  const totalPages = Math.ceil(totalReviews / pageSize);

  const handleSortChange = (newSort: typeof sortBy) => {
    setSortBy(newSort);
    setCurrentPage(1);
  };

  const handleFilterRating = (rating: number | null) => {
    setFilterRating(rating);
    setCurrentPage(1);
  };

  const sortOptions = [
    { value: 'recent' as const, label: '최신순', icon: FiClock },
    { value: 'helpful' as const, label: '도움순', icon: FiTrendingUp },
    { value: 'rating_high' as const, label: '별점 높은순', icon: FiStar },
    { value: 'rating_low' as const, label: '별점 낮은순', icon: FiStar },
  ];

  return (
    <div className="min-h-screen bg-bg">
      {/* Background gradient */}
      <div className="gradient-mesh-bg">
        <div className="gradient-sphere w-96 h-96 bg-gradient-to-r from-primary-500 to-purple-500 -top-48 -right-48" />
        <div className="gradient-sphere w-96 h-96 bg-gradient-to-r from-cyan-500 to-blue-500 bottom-0 -left-48" />
      </div>

      <div className="relative container-custom py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-3">
            {bookId ? (
              <>
                <span className="text-gradient">{bookData?.title || '책'}</span> 리뷰
              </>
            ) : (
              <>플랫폼 <span className="text-gradient">전체 리뷰</span></>
            )}
          </h1>
          <p className="text-text-secondary text-lg">
            {totalReviews.toLocaleString()}개의 솔직한 리뷰를 확인해보세요
          </p>
        </motion.div>

        {/* Statistics Overview */}
        {statsData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card-glass p-6 mb-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Average rating */}
              <div className="text-center">
                <div className="text-5xl font-bold text-gradient mb-2">
                  {statsData.average_rating?.toFixed(1) || '0.0'}
                </div>
                <RatingStars rating={statsData.average_rating || 0} size="md" />
                <div className="text-sm text-text-tertiary mt-2">평균 별점</div>
              </div>

              {/* Rating distribution */}
              <div className="md:col-span-3">
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = statsData.rating_distribution?.[star] || 0;
                    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

                    return (
                      <button
                        key={star}
                        onClick={() => handleFilterRating(filterRating === star ? null : star)}
                        className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all ${
                          filterRating === star
                            ? 'bg-primary-500/10 ring-2 ring-primary-500'
                            : 'hover:bg-surface-hover'
                        }`}
                      >
                        <div className="flex items-center gap-1 w-16">
                          <FiStar className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm font-medium text-text-primary">{star}</span>
                        </div>
                        <div className="flex-1 h-2 bg-surface-hover rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400"
                          />
                        </div>
                        <span className="text-sm text-text-secondary w-16 text-right">
                          {count.toLocaleString()}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6"
        >
          {/* Sort options */}
          <div className="flex items-center gap-2 flex-wrap">
            <FiFilter className="w-5 h-5 text-text-tertiary" />
            {sortOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => handleSortChange(option.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    sortBy === option.value
                      ? 'bg-primary-500 text-white shadow-glow'
                      : 'bg-surface hover:bg-surface-hover text-text-secondary'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{option.label}</span>
                </button>
              );
            })}
          </div>

          {/* Write review button */}
          {bookId && (
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="btn-primary"
            >
              {showReviewForm ? '리뷰 작성 취소' : '리뷰 작성하기'}
            </button>
          )}
        </motion.div>

        {/* Review form */}
        <AnimatePresence>
          {showReviewForm && bookId && bookData && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8"
            >
              <ReviewForm
                bookId={bookId}
                bookTitle={bookData.title}
                onSuccess={() => {
                  setShowReviewForm(false);
                  refetch();
                }}
                onCancel={() => setShowReviewForm(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reviews list */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full"
            />
          </div>
        ) : reviews.length > 0 ? (
          <div className="space-y-6">
            {reviews.map((review: any, index: number) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ReviewCard
                  review={review}
                  showBookTitle={!bookId}
                  onHelpfulUpdate={refetch}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card-glass p-12 text-center"
          >
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-bold text-text-primary mb-2">아직 리뷰가 없습니다</h3>
            <p className="text-text-secondary mb-6">
              {bookId ? '첫 번째 리뷰를 작성해보세요!' : '다양한 책에 대한 리뷰를 기다리고 있어요'}
            </p>
            {bookId && (
              <button
                onClick={() => setShowReviewForm(true)}
                className="btn-primary"
              >
                리뷰 작성하기
              </button>
            )}
          </motion.div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center gap-2 mt-8"
          >
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg bg-surface hover:bg-surface-hover disabled:opacity-50 disabled:cursor-not-allowed text-text-primary font-medium transition-colors"
            >
              이전
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-10 h-10 rounded-lg font-medium transition-all ${
                      currentPage === pageNum
                        ? 'bg-primary-500 text-white shadow-glow'
                        : 'bg-surface hover:bg-surface-hover text-text-primary'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg bg-surface hover:bg-surface-hover disabled:opacity-50 disabled:cursor-not-allowed text-text-primary font-medium transition-colors"
            >
              다음
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
