import { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuthStore } from '../store/authStore';

/**
 * 대시보드 페이지
 * - 학습 스트릭, 통계, 성취 표시
 * - 최근 활동 및 추천
 */
export default function DashboardPage() {
  const { user } = useAuthStore();
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('week');

  // 학습 스트릭 조회
  const { data: streak, isLoading: streakLoading } = useQuery('learningStreak', () =>
    api.getLearningStreak()
  );

  // 통계 조회
  const { data: stats, isLoading: statsLoading } = useQuery(['statsOverview', period], () =>
    api.getStatsOverview(period)
  );

  // 성취 조회
  const { data: achievements, isLoading: achievementsLoading } = useQuery('achievements', () =>
    api.getAchievements()
  );

  // 최근 진행 중인 책
  const { data: recentProgress } = useQuery('recentProgress', async () => {
    const progress = await api.getMyProgress();
    return progress.slice(0, 3); // 최근 3개만
  });

  // 추천 책
  const { data: recommendedBooks } = useQuery('recommendedBooks', async () => {
    const books = await api.getBooks();
    return books.slice(0, 4); // 4개만
  });

  const isLoading = streakLoading || statsLoading || achievementsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">대시보드를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* 환영 메시지 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            안녕하세요, {user?.username}님! 👋
          </h1>
          <p className="text-gray-600 mt-2">오늘도 열심히 학습해봐요!</p>
        </div>

        {/* 스트릭 카드 */}
        {streak && (
          <div className="bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl shadow-lg p-6 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">🔥 학습 스트릭</h2>
                <p className="text-orange-100">
                  {streak.is_today_complete ? '오늘 학습 완료!' : '오늘 학습을 시작해보세요'}
                </p>
              </div>
              <div className="text-right">
                <div className="text-5xl font-bold">{streak.current_streak}</div>
                <div className="text-orange-100">연속 학습일</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-orange-400">
              <div>
                <div className="text-sm text-orange-100">최장 스트릭</div>
                <div className="text-2xl font-bold">{streak.longest_streak}일</div>
              </div>
              <div>
                <div className="text-sm text-orange-100">총 학습일</div>
                <div className="text-2xl font-bold">{streak.total_days}일</div>
              </div>
            </div>
          </div>
        )}

        {/* 기간 선택 */}
        <div className="flex items-center gap-4 mb-6">
          <h2 className="text-xl font-bold text-gray-900">학습 통계</h2>
          <div className="flex gap-2">
            {(['week', 'month', 'year'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  period === p
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {p === 'week' ? '주간' : p === 'month' ? '월간' : '연간'}
              </button>
            ))}
          </div>
        </div>

        {/* 통계 카드 */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-blue-600 text-3xl">📚</div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900">
                    {stats.summary.chapters_read}
                  </div>
                  <div className="text-sm text-gray-500">읽은 챕터</div>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                {stats.summary.chapters_completed}개 완료
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-green-600 text-3xl">⏱️</div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900">
                    {stats.summary.total_time_minutes}
                  </div>
                  <div className="text-sm text-gray-500">학습 시간 (분)</div>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                {Math.round(stats.summary.total_time_minutes / 60)}시간
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-purple-600 text-3xl">✅</div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900">
                    {stats.summary.quizzes_passed}
                  </div>
                  <div className="text-sm text-gray-500">합격 퀴즈</div>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                합격률 {stats.summary.quiz_pass_rate}%
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-yellow-600 text-3xl">📝</div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900">
                    {stats.summary.words_added}
                  </div>
                  <div className="text-sm text-gray-500">새로운 단어</div>
                </div>
              </div>
              <div className="text-xs text-gray-500">단어장에 추가됨</div>
            </div>
          </div>
        )}

        {/* 성취 배지 */}
        {achievements && achievements.achievements.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">🏆 최근 성취</h2>
              <span className="text-sm text-gray-500">
                {achievements.total_achievements}개 달성
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {achievements.achievements.slice(0, 6).map((achievement: any) => (
                <div
                  key={achievement.id}
                  className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4 text-center"
                >
                  <div className="text-3xl mb-2">🏅</div>
                  <div className="text-xs font-medium text-gray-900">
                    {achievement.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 최근 진행 중인 책 */}
        {recentProgress && recentProgress.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">📖 계속 읽기</h2>
            <div className="space-y-4">
              {recentProgress.map((progress: any) => (
                <Link
                  key={progress.id}
                  to={`/reader/${progress.chapter_id}`}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Chapter {progress.chapter_id}</div>
                    <div className="text-sm text-gray-500">
                      {progress.progress_percentage}% 완료
                    </div>
                  </div>
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ width: `${progress.progress_percentage}%` }}
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 추천 책 */}
        {recommendedBooks && recommendedBooks.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">✨ 추천 도서</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {recommendedBooks.map((book: any) => (
                <Link
                  key={book.id}
                  to={`/books/${book.id}`}
                  className="group block"
                >
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 h-full border border-blue-100 group-hover:shadow-md transition">
                    <div className="text-2xl mb-2">📚</div>
                    <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-primary-600 transition">
                      {book.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">{book.author}</p>
                    <div className="text-xs text-gray-500">{book.difficulty_level}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
