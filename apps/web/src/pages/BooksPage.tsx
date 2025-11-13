import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

/**
 * 책 목록 페이지
 * - API에서 책 목록을 가져와 표시
 * - 카테고리별 필터링
 */
export default function BooksPage() {
  const { data: books, isLoading, error } = useQuery('books', () => api.getBooks());

  if (isLoading) {
    return (
      <div className="container-custom py-8">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">책 목록을 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-custom py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600">책 목록을 불러오는데 실패했습니다.</p>
          <p className="text-sm text-red-500 mt-2">잠시 후 다시 시도해주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">책 목록</h1>
        <p className="text-gray-600">{books?.length || 0}권의 책</p>
      </div>

      {books && books.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <p className="text-gray-600 text-lg">아직 등록된 책이 없습니다.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {books?.map((book) => (
            <Link
              key={book.id}
              to={`/books/${book.id}`}
              className="bg-white rounded-xl shadow hover:shadow-lg transition group"
            >
              {/* 책 표지 */}
              <div className="h-64 bg-gradient-to-br from-primary-100 to-primary-200 rounded-t-xl overflow-hidden">
                {book.cover_image_url ? (
                  <img
                    src={book.cover_image_url}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl">
                    📚
                  </div>
                )}
              </div>

              {/* 책 정보 */}
              <div className="p-5">
                <h3 className="font-bold text-lg mb-1 group-hover:text-primary-600 transition line-clamp-2">
                  {book.title}
                </h3>
                <p className="text-gray-500 text-sm mb-2">{book.author}</p>

                {book.subtitle && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{book.subtitle}</p>
                )}

                {/* 난이도 & 학년 */}
                <div className="flex items-center gap-2 mb-3">
                  {book.difficulty_level && (
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      book.difficulty_level === 'beginner' ? 'bg-green-100 text-green-700' :
                      book.difficulty_level === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {book.difficulty_level === 'beginner' ? '초급' :
                       book.difficulty_level === 'intermediate' ? '중급' : '고급'}
                    </span>
                  )}
                  {book.target_grade && (
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                      {book.target_grade.includes('elementary') ? '초등' :
                       book.target_grade.includes('middle') ? '중등' :
                       book.target_grade.includes('high') ? '고등' : '성인'}
                    </span>
                  )}
                </div>

                {/* 예상 시간 */}
                {book.estimated_hours && (
                  <p className="text-xs text-gray-500">
                    ⏱️ 예상 학습 시간: {book.estimated_hours}시간
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
