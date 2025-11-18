import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { FiUsers, FiCheckCircle, FiTrendingUp, FiAward } from 'react-icons/fi';
import { api } from '../../lib/api';
import StatCard from '../../components/analytics/StatCard';
import LineChart from '../../components/analytics/LineChart';
import BarChart from '../../components/analytics/BarChart';

/**
 * Premium Analytics Dashboard
 * - Role-based user statistics
 * - Quiz performance analysis
 * - Monthly signup trends
 * - Interactive charts with Linear/Stripe style
 */
export default function AnalyticsPage() {
  // 역할별 사용자 통계
  const { data: usersByRole, isLoading: loadingUsers } = useQuery('users-by-role', async () => {
    const response = await api.client.get('/api/admin/stats/users-by-role');
    return response.data.data;
  });

  // 퀴즈 성과 통계
  const { data: quizPerformance, isLoading: loadingQuiz } = useQuery('quiz-performance', async () => {
    const response = await api.client.get('/api/admin/stats/quiz-performance');
    return response.data.data;
  });

  // 월별 가입자 통계 (최근 6개월)
  const { data: monthlySignups, isLoading: loadingSignups } = useQuery('monthly-signups', async () => {
    const response = await api.client.get('/api/admin/stats/monthly-signups', {
      params: { months: 6 }
    });
    return response.data.data;
  });

  const getRoleLabel = (role: string) => {
    const labels: { [key: string]: string } = {
      admin: '관리자',
      teacher: '선생님',
      student: '학생',
    };
    return labels[role] || role;
  };

  const getRoleColor = (role: string) => {
    const colors: { [key: string]: string } = {
      admin: 'rgb(239, 68, 68)', // red-500
      teacher: 'rgb(59, 130, 246)', // blue-500
      student: 'rgb(34, 197, 94)', // green-500
    };
    return colors[role] || 'rgb(107, 114, 128)'; // gray-500
  };

  // Prepare data for charts
  const userRoleData = usersByRole?.map((item: any) => ({
    label: getRoleLabel(item.role),
    value: parseInt(item.count),
    color: getRoleColor(item.role),
  })) || [];

  const signupTrendData = monthlySignups?.map((item: any) => ({
    label: item.month.slice(5), // Show only MM-DD
    value: parseInt(item.signups),
  })) || [];

  const totalUsers = userRoleData.reduce((sum, item) => sum + item.value, 0);
  const avgSignups = signupTrendData.length > 0
    ? Math.round(signupTrendData.reduce((sum, item) => sum + item.value, 0) / signupTrendData.length)
    : 0;

  return (
    <div className="min-h-screen bg-bg">
      {/* Background gradient */}
      <div className="gradient-mesh-bg">
        <div className="gradient-sphere w-96 h-96 bg-gradient-to-r from-cyan-500 to-blue-500 -top-48 -right-48" />
        <div className="gradient-sphere w-96 h-96 bg-gradient-to-r from-purple-500 to-pink-500 bottom-0 -left-48" />
      </div>

      <div className="relative container-custom py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-3">
            플랫폼 <span className="text-gradient">분석 대시보드</span>
          </h1>
          <p className="text-text-secondary text-lg">
            실시간 통계와 성과 지표를 한눈에 확인하세요
          </p>
        </motion.div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="전체 사용자"
            value={totalUsers}
            suffix="명"
            icon={FiUsers}
            color="from-blue-500 to-cyan-500"
            loading={loadingUsers}
          />

          <StatCard
            title="퀴즈 시도"
            value={quizPerformance?.total_attempts || 0}
            suffix="회"
            icon={FiCheckCircle}
            color="from-green-500 to-emerald-500"
            loading={loadingQuiz}
          />

          <StatCard
            title="평균 점수"
            value={quizPerformance ? parseFloat(quizPerformance.avg_score || 0).toFixed(1) : '0.0'}
            suffix="점"
            icon={FiAward}
            color="from-purple-500 to-pink-500"
            loading={loadingQuiz}
          />

          <StatCard
            title="합격률"
            value={quizPerformance ? parseFloat(quizPerformance.pass_rate || 0).toFixed(1) : '0.0'}
            suffix="%"
            icon={FiTrendingUp}
            color="from-orange-500 to-red-500"
            loading={loadingQuiz}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Role Distribution Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bento-item p-6"
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-text-primary mb-2">역할별 사용자 분포</h2>
              <p className="text-text-secondary">플랫폼 사용자의 역할 분석</p>
            </div>

            {loadingUsers ? (
              <div className="flex items-center justify-center py-20">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full"
                />
              </div>
            ) : userRoleData.length > 0 ? (
              <BarChart data={userRoleData} height={300} horizontal />
            ) : (
              <div className="flex items-center justify-center py-20 text-text-tertiary">
                데이터가 없습니다
              </div>
            )}

            {/* Summary */}
            {!loadingUsers && userRoleData.length > 0 && (
              <div className="mt-6 pt-6 border-t border-border">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-text-primary">전체 사용자</span>
                  <span className="text-2xl font-bold text-gradient">
                    {totalUsers.toLocaleString()}명
                  </span>
                </div>
              </div>
            )}
          </motion.div>

          {/* Quiz Performance */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bento-item p-6"
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-text-primary mb-2">퀴즈 성과 분석</h2>
              <p className="text-text-secondary">전체 퀴즈 시도 및 합격 현황</p>
            </div>

            {loadingQuiz ? (
              <div className="flex items-center justify-center py-20">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full"
                />
              </div>
            ) : quizPerformance ? (
              <div className="space-y-4">
                {/* Pass rate progress */}
                <div className="card-glass p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-text-secondary">합격률</span>
                    <span className="text-2xl font-bold text-gradient">
                      {parseFloat(quizPerformance.pass_rate || 0).toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-4 bg-surface-hover rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${quizPerformance.pass_rate || 0}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
                    />
                  </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="card-glass p-4">
                    <div className="text-sm text-text-tertiary mb-1">전체 시도</div>
                    <div className="text-2xl font-bold text-text-primary">
                      {parseInt(quizPerformance.total_attempts || 0).toLocaleString()}
                    </div>
                  </div>

                  <div className="card-glass p-4">
                    <div className="text-sm text-text-tertiary mb-1">합격 시도</div>
                    <div className="text-2xl font-bold text-green-500">
                      {parseInt(quizPerformance.passed_attempts || 0).toLocaleString()}
                    </div>
                  </div>

                  <div className="card-glass p-4">
                    <div className="text-sm text-text-tertiary mb-1">평균 점수</div>
                    <div className="text-2xl font-bold text-blue-500">
                      {parseFloat(quizPerformance.avg_score || 0).toFixed(1)}
                    </div>
                  </div>

                  <div className="card-glass p-4">
                    <div className="text-sm text-text-tertiary mb-1">최고 점수</div>
                    <div className="text-2xl font-bold text-purple-500">
                      {parseFloat(quizPerformance.max_score || 0).toFixed(1)}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-20 text-text-tertiary">
                데이터가 없습니다
              </div>
            )}
          </motion.div>
        </div>

        {/* Monthly Signups Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bento-item p-6"
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-text-primary mb-2">월별 가입자 추이</h2>
            <p className="text-text-secondary">최근 6개월간 신규 가입자 현황</p>
          </div>

          {loadingSignups ? (
            <div className="flex items-center justify-center py-20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full"
              />
            </div>
          ) : signupTrendData.length > 0 ? (
            <>
              <LineChart
                data={signupTrendData}
                color="rgb(99, 102, 241)"
                height={250}
                showGrid
                showPoints
              />

              {/* Summary stats */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card-glass p-4">
                  <div className="text-sm text-text-tertiary mb-1">전체 가입자</div>
                  <div className="text-2xl font-bold text-text-primary">
                    {signupTrendData.reduce((sum, item) => sum + item.value, 0).toLocaleString()}명
                  </div>
                </div>

                <div className="card-glass p-4">
                  <div className="text-sm text-text-tertiary mb-1">월 평균 가입</div>
                  <div className="text-2xl font-bold text-primary-600">
                    {avgSignups.toLocaleString()}명
                  </div>
                </div>

                <div className="card-glass p-4">
                  <div className="text-sm text-text-tertiary mb-1">최고 기록</div>
                  <div className="text-2xl font-bold text-green-500">
                    {Math.max(...signupTrendData.map(item => item.value)).toLocaleString()}명
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center py-20 text-text-tertiary">
              데이터가 없습니다
            </div>
          )}
        </motion.div>

        {/* Premium CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 card-glass p-8 text-center bg-gradient-to-r from-primary-500/10 to-purple-500/10 border-primary-500/20"
        >
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-2xl font-bold text-text-primary mb-2">프리미엄 분석 대시보드</h3>
          <p className="text-text-secondary max-w-2xl mx-auto">
            Linear/Stripe 스타일의 현대적인 차트와 인터랙티브한 데이터 시각화로
            플랫폼 성과를 한눈에 파악하세요. 모든 데이터는 실시간으로 업데이트됩니다.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
