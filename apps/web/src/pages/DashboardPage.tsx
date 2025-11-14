import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuthStore } from '../store/authStore';

/**
 * 대시보드 페이지
 * - 학습 통계 표시
 * - 최근 읽은 책 목록
 * - 학습 진도 요약
 */
export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  // 전체 학습 진도 조회
  const { data: allProgress, isLoading: progressLoading } = useQuery(
    'myAllProgress',
    () => api.getMyProgress()
  );

  // 책 목록 조회 (최근 읽은 책을 표시하기 위해)
  const { data: books } = useQuery('allBooks', () => api.getBooks());

  // 통계 계산
  const stats = {
    booksInProgress: 0,
    completedChapters: 0,
    totalTimeMinutes: 0,
  };

  if (allProgress) {
    // 학습 중인 책 수 (진행 중인 책의 고유 ID)
    const booksWithProgress = new Set(allProgress.map((p) => p.book_id));
    stats.booksInProgress = booksWithProgress.size;

    // 완료한 챕터 수
    stats.completedChapters = allProgress.filter((p) => p.is_completed).length;

    // 총 학습 시간 (초 → 분)
    const totalSeconds = allProgress.reduce((sum, p) => sum + (p.time_spent_seconds || 0), 0);
    stats.totalTimeMinutes = Math.round(totalSeconds / 60);
  }

  // 최근 읽은 책 (last_accessed_at 기준으로 정렬, 중복 제거)
  const recentBooks = allProgress
    ?.sort((a, b) => new Date(b.last_accessed_at).getTime() - new Date(a.last_accessed_at).getTime())
    .reduce((acc, progress) => {
      if (!acc.find((item) => item.book_id === progress.book_id)) {
        const book = books?.find((b) => b.id === progress.book_id);
        if (book) {
          // 해당 책의 모든 진도 가져오기
          const bookProgress = allProgress.filter((p) => p.book_id === progress.book_id);
          const completedChapters = bookProgress.filter((p) => p.is_completed).length;
          const totalChapters = bookProgress.length;
          const progressPercentage = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;

          acc.push({
            ...progress,
            book,
            completedChapters,
            totalChapters,
            progressPercentage,
          });
        }
      }
      return acc;
    }, [] as any[])
    .slice(0, 5); // 최근 5개만

  if (progressLoading) {
    return (
      <div className="container-custom py-8">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">대시보드를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">안녕하세요, {user?.username}님! 👋</h1>
        <p className="text-gray-600">오늘도 영어 학습을 시작해볼까요?</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-blue-100 text-sm font-medium">학습 중인 책</h3>
            <span className="text-3xl">📚</span>
          </div>
          <p className="text-4xl font-bold">{stats.booksInProgress}</p>
          <p className="text-blue-100 text-sm mt-1">권의 책을 읽고 있어요</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-green-100 text-sm font-medium">완료한 챕터</h3>
            <span className="text-3xl">✅</span>
          </div>
          <p className="text-4xl font-bold">{stats.completedChapters}</p>
          <p className="text-green-100 text-sm mt-1">개의 챕터를 완료했어요</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-purple-100 text-sm font-medium">학습 시간</h3>
            <span className="text-3xl">⏱️</span>
          </div>
          <p className="text-4xl font-bold">
            {stats.totalTimeMinutes < 60
              ? `${stats.totalTimeMinutes}분`
              : `${Math.floor(stats.totalTimeMinutes / 60)}시간 ${stats.totalTimeMinutes % 60}분`}
          </p>
          <p className="text-purple-100 text-sm mt-1">총 학습 시간</p>
        </div>
      </div>

      {/* 최근 읽은 책 */}
      {recentBooks && recentBooks.length > 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">최근 읽은 책</h2>
            <Link to="/books" className="text-primary-600 hover:text-primary-700 text-sm font-semibold">
              전체 보기 →
            </Link>
          </div>

          <div className="space-y-4">
            {recentBooks.map((item: any) => (
              <Link
                key={item.book.id}
                to={`/books/${item.book.id}`}
                className="block p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition group"
              >
                <div className="flex items-center gap-4">
                  {/* 책 표지 (아이콘) */}
                  <div className="w-16 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded flex items-center justify-center text-3xl flex-shrink-0">
                    📖
                  </div>

                  {/* 책 정보 */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition truncate">
                      {item.book.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">{item.book.author}</p>

                    {/* 진도 바 */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full transition-all"
                          style={{ width: `${item.progressPercentage}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-600 font-medium whitespace-nowrap">
                        {item.completedChapters} / {item.totalChapters}
                      </span>
                    </div>
                  </div>

                  {/* 진행률 */}
                  <div className="text-right flex-shrink-0">
                    <div className="text-2xl font-bold text-primary-600">{item.progressPercentage}%</div>
                    <div className="text-xs text-gray-500">완료</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        /* 학습 기록이 없을 때 */
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-2xl font-bold mb-2">아직 읽은 책이 없어요</h2>
          <p className="text-gray-600 mb-6">지금 바로 영어 학습을 시작해보세요!</p>
          <Link
            to="/books"
            className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold"
          >
            책 둘러보기 →
          </Link>
        </div>
      )}

      {/* 빠른 액션 */}
      <div className="grid md:grid-cols-2 gap-6">
        <Link
          to="/books"
          className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-2xl group-hover:scale-110 transition">
              📚
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition">
                책 둘러보기
              </h3>
              <p className="text-sm text-gray-600">새로운 책을 찾아보세요</p>
            </div>
          </div>
        </Link>

        <Link
          to="/profile"
          className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-2xl group-hover:scale-110 transition">
              👤
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition">
                학습 목표 설정
              </h3>
              <p className="text-sm text-gray-600">프로필에서 목표를 설정하세요</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
