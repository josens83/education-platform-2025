import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiBook, FiRefreshCw, FiStar } from 'react-icons/fi';
import { RiSparklingFill } from 'react-icons/ri';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface Book {
  id: number;
  title: string;
  author: string;
  category: string;
  level: string;
  description: string;
  cover_url?: string;
  aiReason?: string;
  aiPriority?: number;
  score?: number;
}

interface AIRecommendationsProps {
  type?: 'hybrid' | 'ai' | 'collaborative' | 'content' | 'popular';
  limit?: number;
}

/**
 * AI-Powered Book Recommendations
 *
 * 다양한 알고리즘을 사용한 책 추천 컴포넌트
 */
export default function AIRecommendations({
  type = 'hybrid',
  limit = 10,
}: AIRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [aiEnabled, setAiEnabled] = useState(false);
  const navigate = useNavigate();

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  useEffect(() => {
    loadRecommendations();
  }, [type, limit]);

  const loadRecommendations = async () => {
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${apiUrl}/api/ai/recommendations`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { type, limit },
      });

      if (response.data.success) {
        const data = response.data.recommendations;

        // AI 추천의 경우 특별한 처리
        if (data.books) {
          setRecommendations(data.books);
          setAiMessage(data.message);
          setAiEnabled(data.aiEnabled);
        } else {
          setRecommendations(data);
        }
      }
    } catch (error: any) {
      console.error('Failed to load recommendations:', error);
      toast.error('추천을 불러오는데 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeLabel = () => {
    switch (type) {
      case 'ai':
        return 'AI 개인화 추천';
      case 'collaborative':
        return '비슷한 학습자들이 읽은 책';
      case 'content':
        return '내 취향 기반 추천';
      case 'popular':
        return '인기 도서';
      case 'hybrid':
      default:
        return '맞춤 추천';
    }
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'ai':
        return <RiSparklingFill className="w-5 h-5" />;
      default:
        return <FiBook className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-500/10 rounded-lg text-primary-500">
            {getTypeIcon()}
          </div>
          <div>
            <h3 className="text-lg font-bold text-text-primary">
              {getTypeLabel()}
            </h3>
            {aiMessage && (
              <p className="text-sm text-text-secondary mt-1">{aiMessage}</p>
            )}
          </div>
        </div>

        <button
          onClick={loadRecommendations}
          disabled={isLoading}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
          title="새로고침"
        >
          <FiRefreshCw
            className={`w-5 h-5 text-text-secondary ${
              isLoading ? 'animate-spin' : ''
            }`}
          />
        </button>
      </div>

      {/* AI 추천 배지 */}
      {type === 'ai' && aiEnabled && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg"
        >
          <RiSparklingFill className="w-4 h-4 text-purple-500" />
          <span className="text-sm text-text-secondary">
            GPT-4가 분석한 개인 맞춤 추천입니다
          </span>
        </motion.div>
      )}

      {/* 로딩 상태 */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
            />
          ))}
        </div>
      )}

      {/* 추천 목록 */}
      {!isLoading && recommendations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.map((book, index) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => navigate(`/books/${book.id}`)}
              className="group relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:border-primary-500 hover:shadow-lg transition-all cursor-pointer"
            >
              {/* AI 우선순위 배지 */}
              {book.aiPriority && (
                <div className="absolute top-2 right-2 px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                  <FiStar className="w-3 h-3" />
                  {book.aiPriority}
                </div>
              )}

              {/* 책 정보 */}
              <div className="flex gap-4">
                {/* 커버 이미지 */}
                {book.cover_url ? (
                  <img
                    src={book.cover_url}
                    alt={book.title}
                    className="w-20 h-28 object-cover rounded-md"
                  />
                ) : (
                  <div className="w-20 h-28 bg-gradient-to-br from-primary-400 to-primary-600 rounded-md flex items-center justify-center">
                    <FiBook className="w-8 h-8 text-white" />
                  </div>
                )}

                {/* 제목 및 정보 */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-text-primary line-clamp-2 group-hover:text-primary-500 transition-colors">
                    {book.title}
                  </h4>
                  <p className="text-sm text-text-secondary mt-1">
                    {book.author}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <span className="px-2 py-1 bg-primary-500/10 text-primary-500 text-xs rounded-md">
                      {book.level}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-text-secondary text-xs rounded-md">
                      {book.category}
                    </span>
                  </div>
                </div>
              </div>

              {/* AI 추천 이유 */}
              {book.aiReason && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700"
                >
                  <div className="flex gap-2 text-xs">
                    <RiSparklingFill className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                    <p className="text-text-secondary italic">{book.aiReason}</p>
                  </div>
                </motion.div>
              )}

              {/* 점수 (하이브리드 추천) */}
              {book.score && !book.aiReason && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 text-xs text-text-secondary">
                    <FiStar className="w-3 h-3" />
                    <span>추천 점수: {Math.round(book.score)}</span>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* 빈 상태 */}
      {!isLoading && recommendations.length === 0 && (
        <div className="text-center py-12">
          <FiBook className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-text-secondary">
            아직 추천할 수 있는 책이 없습니다
          </p>
          <p className="text-sm text-text-secondary mt-2">
            책을 읽고 학습 기록을 쌓으면 더 정확한 추천을 받을 수 있습니다
          </p>
        </div>
      )}
    </div>
  );
}
