import { useQuery } from 'react-query';
import { api } from '../../lib/api';
import { Link } from 'react-router-dom';

interface DashboardStats {
  overview: {
    totalUsers: number;
    totalBooks: number;
    totalChapters: number;
    totalQuizzes: number;
    activeSubscriptions: number;
  };
  recentUsers: Array<{
    id: number;
    username: string;
    email: string;
    full_name: string;
    role: string;
    created_at: string;
  }>;
  popularBooks: Array<{
    id: number;
    title: string;
    cover_image_url: string;
    learner_count: number;
    total_progress: number;
  }>;
  recentActivity: Array<{
    date: string;
    active_users: number;
    chapters_read: number;
  }>;
}

/**
 * 관리자 대시보드
 * - 전체 통계 overview
 * - 최근 활동
 * - 시스템 상태
 */
export default function AdminDashboardPage() {
  // 전체 사용자 수, 책 수, 챕터 수 등 통계 조회
  const { data: stats, isLoading } = useQuery<DashboardStats>('adminStats', async () => {
    return await api.getAdminStats();
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const overview = stats?.overview || {
    totalUsers: 0,
    totalBooks: 0,
    totalChapters: 0,
    totalQuizzes: 0,
    activeSubscriptions: 0,
  };

  const statCards = [
    {
      title: '전체 사용자',
      value: overview.totalUsers,
      icon: '👥',
      color: 'bg-blue-500',
      link: '/admin/users',
    },
    {
      title: '전체 책',
      value: overview.totalBooks,
      icon: '📚',
      color: 'bg-green-500',
      link: '/admin/books',
    },
    {
      title: '전체 챕터',
      value: overview.totalChapters,
      icon: '📝',
      color: 'bg-purple-500',
      link: '/admin/chapters',
    },
    {
      title: '전체 퀴즈',
      value: overview.totalQuizzes,
      icon: '❓',
      color: 'bg-orange-500',
      link: '/admin/quizzes',
    },
    {
      title: '활성 구독',
      value: overview.activeSubscriptions,
      icon: '💎',
      color: 'bg-pink-500',
      link: '/admin/subscriptions',
    },
  ];

  const recentUsers = stats?.recentUsers || [];
  const popularBooks = stats?.popularBooks || [];
  const recentActivity = stats?.recentActivity || [];

  return (
    <div>
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">관리자 대시보드</h1>
        <p className="text-gray-600 mt-2">플랫폼 전체 현황을 한눈에 확인하세요</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((card, index) => (
          <Link
            key={index}
            to={card.link}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{card.title}</p>
                <p className="text-3xl font-bold text-gray-900">{card.value}</p>
              </div>
              <div
                className={`${card.color} w-16 h-16 rounded-full flex items-center justify-center text-3xl`}
              >
                {card.icon}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* 최근 활동 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* 최근 가입 사용자 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">최근 가입 사용자</h2>
            <Link
              to="/admin/users"
              className="text-sm text-primary-600 hover:text-primary-800"
            >
              전체 보기 →
            </Link>
          </div>
          <div className="space-y-3">
            {recentUsers.length > 0 ? (
              recentUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {user.full_name || user.username}
                    </div>
                    <div className="text-sm text-gray-600">{user.email}</div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(user.created_at).toLocaleDateString('ko-KR')}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm text-center py-4">
                최근 가입 사용자가 없습니다
              </p>
            )}
          </div>
        </div>

        {/* 인기 책 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">인기 책</h2>
            <Link
              to="/admin/books"
              className="text-sm text-primary-600 hover:text-primary-800"
            >
              전체 보기 →
            </Link>
          </div>
          <div className="space-y-3">
            {popularBooks.length > 0 ? (
              popularBooks.map((book) => (
                <div
                  key={book.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="text-3xl">📚</div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{book.title}</div>
                    <div className="text-sm text-gray-600">
                      {book.learner_count}명 학습 중
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm text-center py-4">
                학습 데이터가 없습니다
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 최근 7일 활동 */}
      {recentActivity.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">최근 7일 활동</h2>
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {new Date(activity.date).toLocaleDateString('ko-KR')}
                  </div>
                  <div className="text-sm text-gray-600">
                    활성 사용자: {activity.active_users}명 | 읽은 챕터:{' '}
                    {activity.chapters_read}개
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 퀵 액션 */}
      <div className="bg-gradient-to-r from-primary-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
        <h2 className="text-xl font-bold mb-4">빠른 작업</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Link
            to="/admin/books"
            className="bg-white bg-opacity-20 hover:bg-opacity-30 transition rounded-lg p-4 text-center"
          >
            <div className="text-3xl mb-2">📚</div>
            <div className="text-sm">책 관리</div>
          </Link>
          <Link
            to="/admin/chapters"
            className="bg-white bg-opacity-20 hover:bg-opacity-30 transition rounded-lg p-4 text-center"
          >
            <div className="text-3xl mb-2">📝</div>
            <div className="text-sm">챕터 관리</div>
          </Link>
          <Link
            to="/admin/quizzes"
            className="bg-white bg-opacity-20 hover:bg-opacity-30 transition rounded-lg p-4 text-center"
          >
            <div className="text-3xl mb-2">❓</div>
            <div className="text-sm">퀴즈 관리</div>
          </Link>
          <Link
            to="/admin/audio"
            className="bg-white bg-opacity-20 hover:bg-opacity-30 transition rounded-lg p-4 text-center"
          >
            <div className="text-3xl mb-2">🎵</div>
            <div className="text-sm">오디오 관리</div>
          </Link>
          <Link
            to="/admin/users"
            className="bg-white bg-opacity-20 hover:bg-opacity-30 transition rounded-lg p-4 text-center"
          >
            <div className="text-3xl mb-2">👥</div>
            <div className="text-sm">사용자 관리</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
