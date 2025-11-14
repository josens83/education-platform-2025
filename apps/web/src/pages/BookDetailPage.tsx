import { useQuery } from 'react-query';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuthStore } from '../store/authStore';

/**
 * 책 상세 페이지
 * - 책 정보 표시
 * - 챕터 목록
 * - 학습 진도 표시
 */
export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const bookId = parseInt(id || '0');

  const { data: book, isLoading: bookLoading } = useQuery(
    ['book', bookId],
    () => api.getBook(bookId),
    { enabled: !!bookId }
  );

  const { data: chapters, isLoading: chaptersLoading } = useQuery(
    ['chapters', bookId],
    () => api.getBookChapters(bookId),
    { enabled: !!bookId }
  );

  // 학습 진도 조회 (로그인한 경우에만)
  const { data: progressList } = useQuery(
    ['progress', bookId],
    () => api.getMyProgress(bookId),
    { enabled: isAuthenticated && !!bookId }
  );

  // 챕터별 진도 매핑
  const progressMap = new Map(
    progressList?.map((p) => [p.chapter_id, p]) || []
  );

  // 완료한 챕터 수 계산
  const completedCount = progressList?.filter((p) => p.is_completed).length || 0;
  const totalChapters = chapters?.length || 0;
  const progressPercentage = totalChapters > 0 ? Math.round((completedCount / totalChapters) * 100) : 0;

  // 마지막 읽은 챕터 찾기 (완료되지 않았고 진행 중인 챕터)
  const lastReadProgress = progressList
    ?.filter((p) => !p.is_completed && p.progress_percentage < 100)
    ?.sort((a, b) => new Date(b.last_accessed_at).getTime() - new Date(a.last_accessed_at).getTime())[0];
  const lastReadChapter = chapters?.find((c) => c.id === lastReadProgress?.chapter_id);

  if (bookLoading || chaptersLoading) {
    return (
      <div className="container-custom py-8">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">책 정보를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="container-custom py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600">책을 찾을 수 없습니다.</p>
          <Link to="/books" className="text-primary-600 hover:underline mt-2 inline-block">
            책 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      {/* 뒤로 가기 */}
      <Link
        to="/books"
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        ← 책 목록으로
      </Link>

      <div className="max-w-5xl mx-auto">
        {/* 책 정보 */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="md:flex">
            {/* 책 표지 */}
            <div className="md:w-1/3 bg-gradient-to-br from-primary-100 to-primary-200">
              {book.cover_image_url ? (
                <img
                  src={book.cover_image_url}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-96 flex items-center justify-center text-8xl">
                  📚
                </div>
              )}
            </div>

            {/* 책 설명 */}
            <div className="p-8 md:w-2/3">
              <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
              {book.subtitle && (
                <p className="text-lg text-gray-600 mb-4">{book.subtitle}</p>
              )}
              <p className="text-gray-500 mb-6">by {book.author}</p>

              {/* 태그들 */}
              <div className="flex items-center gap-2 mb-6">
                {book.difficulty_level && (
                  <span className={`text-sm px-3 py-1 rounded-full ${
                    book.difficulty_level === 'beginner' ? 'bg-green-100 text-green-700' :
                    book.difficulty_level === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {book.difficulty_level === 'beginner' ? '초급' :
                     book.difficulty_level === 'intermediate' ? '중급' : '고급'}
                  </span>
                )}
                {book.target_grade && (
                  <span className="text-sm px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
                    {book.target_grade.includes('elementary') ? '초등' :
                     book.target_grade.includes('middle') ? '중등' :
                     book.target_grade.includes('high') ? '고등' : '성인'}
                  </span>
                )}
              </div>

              <p className="text-gray-700 mb-6 leading-relaxed">{book.description}</p>

              {/* 정보 */}
              <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                {book.estimated_hours && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">⏱️ 예상 시간:</span>
                    <span className="font-semibold">{book.estimated_hours}시간</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">📑 챕터 수:</span>
                  <span className="font-semibold">{chapters?.length || 0}개</span>
                </div>
              </div>

              {/* 진도 표시 (로그인한 경우) */}
              {isAuthenticated && progressList && progressList.length > 0 && (
                <div className="mb-6 p-4 bg-primary-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-primary-900">학습 진도</span>
                    <span className="text-sm font-semibold text-primary-600">
                      {completedCount} / {totalChapters} 챕터 완료
                    </span>
                  </div>
                  <div className="w-full bg-white rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* 읽기 버튼 */}
              {chapters && chapters.length > 0 && (
                isAuthenticated ? (
                  lastReadChapter ? (
                    // 이어서 읽기 버튼
                    <Link
                      to={`/reader/${lastReadChapter.id}`}
                      className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold"
                    >
                      📖 이어서 읽기 (Chapter {lastReadChapter.chapter_number})
                    </Link>
                  ) : (
                    // 처음 읽기 버튼
                    <Link
                      to={`/reader/${chapters[0].id}`}
                      className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold"
                    >
                      읽기 시작 →
                    </Link>
                  )
                ) : (
                  // 로그인 필요
                  <div>
                    <Link
                      to="/login"
                      state={{ from: `/reader/${chapters[0].id}` }}
                      className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold"
                    >
                      로그인하고 읽기 →
                    </Link>
                    <p className="text-sm text-gray-500 mt-2">
                      💡 책을 읽으려면 로그인이 필요합니다
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* 챕터 목록 */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6">챕터 목록</h2>

          {chapters && chapters.length === 0 ? (
            <p className="text-gray-500 text-center py-8">아직 챕터가 없습니다.</p>
          ) : (
            <div className="space-y-3">
              {chapters?.map((chapter) => {
                const progress = progressMap.get(chapter.id);
                const isCompleted = progress?.is_completed || false;
                const isInProgress = progress && !progress.is_completed && progress.progress_percentage > 0;

                return (
                  <Link
                    key={chapter.id}
                    to={isAuthenticated ? `/reader/${chapter.id}` : '/login'}
                    state={!isAuthenticated ? { from: `/reader/${chapter.id}` } : undefined}
                    className={`block p-4 border rounded-lg hover:border-primary-500 hover:bg-primary-50 transition group ${
                      isCompleted ? 'border-green-200 bg-green-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-sm font-semibold text-gray-500">
                            Chapter {chapter.chapter_number}
                          </span>
                          {chapter.estimated_minutes && (
                            <span className="text-xs text-gray-400">
                              ⏱️ {chapter.estimated_minutes}분
                            </span>
                          )}
                          {isCompleted && (
                            <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded font-semibold">
                              ✓ 완료
                            </span>
                          )}
                          {isInProgress && !isCompleted && (
                            <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded">
                              📖 읽는 중
                            </span>
                          )}
                          {!isAuthenticated && (
                            <span className="text-xs px-2 py-0.5 bg-primary-100 text-primary-700 rounded">
                              🔒 로그인 필요
                            </span>
                          )}
                        </div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition">
                          {chapter.title}
                        </h3>
                      </div>
                      <div className="text-gray-400 group-hover:text-primary-600 transition">
                        {isCompleted ? '✓' : '→'}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
