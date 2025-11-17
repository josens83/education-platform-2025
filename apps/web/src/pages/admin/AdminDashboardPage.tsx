import { useQuery } from 'react-query';
import { api } from '../../lib/api';

/**
 * 관리자 대시보드
 * - 전체 통계 overview
 * - 최근 활동
 * - 시스템 상태
 */
export default function AdminDashboardPage() {
  // 전체 사용자 수, 책 수, 챕터 수 등 통계 조회
  const { data: stats, isLoading } = useQuery('adminStats', async () => {
    // TODO: 실제 API 엔드포인트 구현 필요
    return {
      totalUsers: 0,
      totalBooks: 0,
      totalChapters: 0,
      totalQuizzes: 0,
      activeSubscriptions: 0,
      totalRevenue: 0,
    };
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: '전체 사용자',
      value: stats?.totalUsers || 0,
      icon: '👥',
      color: 'bg-blue-500',
    },
    {
      title: '전체 책',
      value: stats?.totalBooks || 0,
      icon: '📚',
      color: 'bg-green-500',
    },
    {
      title: '전체 챕터',
      value: stats?.totalChapters || 0,
      icon: '📝',
      color: 'bg-purple-500',
    },
    {
      title: '전체 퀴즈',
      value: stats?.totalQuizzes || 0,
      icon: '❓',
      color: 'bg-orange-500',
    },
    {
      title: '활성 구독',
      value: stats?.activeSubscriptions || 0,
      icon: '💎',
      color: 'bg-pink-500',
    },
    {
      title: '총 수익',
      value: `${(stats?.totalRevenue || 0).toLocaleString()}원`,
      icon: '💰',
      color: 'bg-yellow-500',
    },
  ];

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
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{card.title}</p>
                <p className="text-3xl font-bold text-gray-900">{card.value}</p>
              </div>
              <div className={`${card.color} w-16 h-16 rounded-full flex items-center justify-center text-3xl`}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 최근 활동 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 최근 가입 사용자 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">최근 가입 사용자</h2>
          <div className="space-y-3">
            <p className="text-gray-500 text-sm">데이터 로딩 중...</p>
          </div>
        </div>

        {/* 인기 책 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">인기 책</h2>
          <div className="space-y-3">
            <p className="text-gray-500 text-sm">데이터 로딩 중...</p>
          </div>
        </div>
      </div>

      {/* 퀵 액션 */}
      <div className="mt-8 bg-gradient-to-r from-primary-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
        <h2 className="text-xl font-bold mb-4">빠른 작업</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="bg-white bg-opacity-20 hover:bg-opacity-30 transition rounded-lg p-4 text-center">
            <div className="text-3xl mb-2">📚</div>
            <div className="text-sm">새 책 추가</div>
          </button>
          <button className="bg-white bg-opacity-20 hover:bg-opacity-30 transition rounded-lg p-4 text-center">
            <div className="text-3xl mb-2">❓</div>
            <div className="text-sm">퀴즈 생성</div>
          </button>
          <button className="bg-white bg-opacity-20 hover:bg-opacity-30 transition rounded-lg p-4 text-center">
            <div className="text-3xl mb-2">🎵</div>
            <div className="text-sm">오디오 업로드</div>
          </button>
          <button className="bg-white bg-opacity-20 hover:bg-opacity-30 transition rounded-lg p-4 text-center">
            <div className="text-3xl mb-2">👥</div>
            <div className="text-sm">사용자 관리</div>
          </button>
        </div>
      </div>
    </div>
  );
}
