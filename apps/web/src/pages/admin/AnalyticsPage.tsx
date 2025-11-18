import { useQuery } from 'react-query';
import { api } from '../../lib/api';

/**
 * 관리자 분석 페이지
 * - 역할별 사용자 통계
 * - 퀴즈 성과 분석
 * - 월별 가입자 추이
 */
export default function AnalyticsPage() {
  // 역할별 사용자 통계
  const { data: usersByRole } = useQuery('users-by-role', async () => {
    const response = await api.client.get('/api/admin/stats/users-by-role');
    return response.data.data;
  });

  // 퀴즈 성과 통계
  const { data: quizPerformance } = useQuery('quiz-performance', async () => {
    const response = await api.client.get('/api/admin/stats/quiz-performance');
    return response.data.data;
  });

  // 월별 가입자 통계 (최근 6개월)
  const { data: monthlySignups } = useQuery('monthly-signups', async () => {
    const response = await api.client.get('/api/admin/stats/monthly-signups', {
      params: { months: 6 }
    });
    return response.data.data;
  });

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return '관리자';
      case 'teacher':
        return '선생님';
      case 'student':
        return '학생';
      default:
        return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-500';
      case 'teacher':
        return 'bg-blue-500';
      case 'student':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div>
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">분석</h1>
        <p className="text-gray-600 mt-2">플랫폼 상세 통계 및 분석 데이터</p>
      </div>

      {/* 역할별 사용자 분포 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">역할별 사용자 분포</h2>

        {usersByRole && usersByRole.length > 0 ? (
          <div className="space-y-4">
            {usersByRole.map((item: any) => {
              const total = usersByRole.reduce((sum: number, i: any) => sum + parseInt(i.count), 0);
              const percentage = ((parseInt(item.count) / total) * 100).toFixed(1);

              return (
                <div key={item.role}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded ${getRoleColor(item.role)}`}></div>
                      <span className="font-medium text-gray-900">{getRoleLabel(item.role)}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {item.count}명 ({percentage}%)
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${getRoleColor(item.role)}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}

            <div className="pt-4 border-t border-gray-200 mt-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-900">전체</span>
                <span className="font-bold text-gray-900">
                  {usersByRole.reduce((sum: number, i: any) => sum + parseInt(i.count), 0)}명
                </span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">데이터가 없습니다</p>
        )}
      </div>

      {/* 퀴즈 성과 분석 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">퀴즈 성과 분석</h2>

        {quizPerformance ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">전체 시도</div>
              <div className="text-2xl font-bold text-gray-900">
                {parseInt(quizPerformance.total_attempts || 0).toLocaleString()}
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">합격 시도</div>
              <div className="text-2xl font-bold text-green-600">
                {parseInt(quizPerformance.passed_attempts || 0).toLocaleString()}
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">평균 점수</div>
              <div className="text-2xl font-bold text-blue-600">
                {parseFloat(quizPerformance.avg_score || 0).toFixed(1)}점
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">합격률</div>
              <div className="text-2xl font-bold text-purple-600">
                {parseFloat(quizPerformance.pass_rate || 0).toFixed(1)}%
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">데이터가 없습니다</p>
        )}
      </div>

      {/* 월별 가입자 추이 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">월별 가입자 추이 (최근 6개월)</h2>

        {monthlySignups && monthlySignups.length > 0 ? (
          <div className="space-y-3">
            {monthlySignups.map((item: any) => {
              const maxSignups = Math.max(...monthlySignups.map((i: any) => parseInt(i.signups)));
              const percentage = (parseInt(item.signups) / maxSignups) * 100;

              return (
                <div key={item.month}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{item.month}</span>
                    <span className="text-sm text-gray-600">{item.signups}명</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="h-3 rounded-full bg-primary-600"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}

            <div className="pt-4 border-t border-gray-200 mt-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-900">평균</span>
                <span className="font-bold text-gray-900">
                  {(monthlySignups.reduce((sum: number, i: any) => sum + parseInt(i.signups), 0) / monthlySignups.length).toFixed(1)}명/월
                </span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">데이터가 없습니다</p>
        )}
      </div>

      {/* 추가 통계 안내 */}
      <div className="mt-6 bg-gradient-to-r from-primary-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
        <h3 className="text-lg font-bold mb-2">📊 더 많은 통계가 필요하신가요?</h3>
        <p className="text-sm opacity-90">
          차트 라이브러리 (Chart.js, Recharts 등)를 추가하여 시각화를 개선할 수 있습니다.
          현재는 기본 막대 그래프로 데이터를 표시하고 있습니다.
        </p>
      </div>
    </div>
  );
}
