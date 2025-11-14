import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import type { SubscriptionPlan } from '@education-platform/api-client';

/**
 * 구독 관리 페이지
 * - 구독 플랜 목록 및 선택
 * - 현재 구독 상태 표시
 * - 구독/취소 기능
 */
export default function SubscriptionPage() {
  const queryClient = useQueryClient();

  // 구독 플랜 목록 조회
  const { data: plans, isLoading: plansLoading } = useQuery(
    'subscriptionPlans',
    () => api.getSubscriptionPlans()
  );

  // 내 구독 정보 조회
  const { data: subscription, isLoading: subscriptionLoading } = useQuery(
    'mySubscription',
    () => api.getMySubscription()
  );

  // 구독 생성 mutation
  const createSubscriptionMutation = useMutation(
    (planId: number) => api.createSubscription(planId),
    {
      onSuccess: () => {
        toast.success('구독이 완료되었습니다! 🎉');
        queryClient.invalidateQueries('mySubscription');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || '구독에 실패했습니다.');
      },
    }
  );

  // 구독 취소 mutation
  const cancelSubscriptionMutation = useMutation(
    () => api.cancelSubscription(),
    {
      onSuccess: () => {
        toast.success('구독이 취소되었습니다.');
        queryClient.invalidateQueries('mySubscription');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || '구독 취소에 실패했습니다.');
      },
    }
  );

  const handleSubscribe = (planId: number, planName: string) => {
    if (confirm(`${planName} 플랜을 구독하시겠습니까?`)) {
      createSubscriptionMutation.mutate(planId);
    }
  };

  const handleCancel = () => {
    if (confirm('정말 구독을 취소하시겠습니까?')) {
      cancelSubscriptionMutation.mutate();
    }
  };

  // 현재 구독 중인 플랜 찾기
  const currentPlan = plans?.find((p) => p.id === subscription?.plan_id);

  // 플랜별 badge 색상
  const getPlanBadgeColor = (billingCycle: string) => {
    switch (billingCycle) {
      case 'trial':
        return 'bg-gray-100 text-gray-700';
      case 'monthly':
        return 'bg-blue-100 text-blue-700';
      case 'annual':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // 결제 주기 텍스트
  const getBillingCycleText = (billingCycle: string) => {
    switch (billingCycle) {
      case 'trial':
        return '무료 체험';
      case 'monthly':
        return '월간 구독';
      case 'annual':
        return '연간 구독';
      default:
        return billingCycle;
    }
  };

  // features 파싱 (JSON string이면 파싱)
  const parseFeatures = (features: any): string[] => {
    if (!features) return [];
    if (Array.isArray(features)) return features;
    if (typeof features === 'string') {
      try {
        const parsed = JSON.parse(features);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  if (plansLoading || subscriptionLoading) {
    return (
      <div className="container-custom py-8">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">구독 정보를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">구독 관리</h1>
        <p className="text-gray-600">플랜을 선택하고 영어 학습을 시작하세요!</p>
      </div>

      {/* 현재 구독 상태 */}
      {subscription && subscription.status === 'active' && currentPlan && (
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold">{currentPlan.name}</h2>
                <span className="px-3 py-1 bg-white/20 backdrop-blur rounded-full text-sm font-semibold">
                  활성 구독
                </span>
              </div>
              <p className="text-primary-100 mb-4">
                {currentPlan.description || '프리미엄 영어 학습 콘텐츠를 이용하실 수 있습니다.'}
              </p>
              <div className="flex items-center gap-6 text-sm">
                <div>
                  <span className="opacity-75">시작일:</span>{' '}
                  <span className="font-semibold">{new Date(subscription.start_date).toLocaleDateString()}</span>
                </div>
                {subscription.end_date && (
                  <div>
                    <span className="opacity-75">만료일:</span>{' '}
                    <span className="font-semibold">{new Date(subscription.end_date).toLocaleDateString()}</span>
                  </div>
                )}
                <div>
                  <span className="opacity-75">자동 갱신:</span>{' '}
                  <span className="font-semibold">{subscription.auto_renew ? '활성' : '비활성'}</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleCancel}
              disabled={cancelSubscriptionMutation.isLoading}
              className="px-6 py-3 bg-white/20 backdrop-blur text-white border-2 border-white rounded-lg hover:bg-white/30 transition font-semibold disabled:opacity-50"
            >
              {cancelSubscriptionMutation.isLoading ? '처리 중...' : '구독 취소'}
            </button>
          </div>
        </div>
      )}

      {/* 구독 플랜 목록 */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6">구독 플랜</h2>

        {!plans || plans.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <p className="text-gray-500">현재 이용 가능한 구독 플랜이 없습니다.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans
              .filter((plan) => plan.is_active)
              .map((plan: SubscriptionPlan) => {
                const features = parseFeatures(plan.features);
                const isCurrentPlan = currentPlan?.id === plan.id;
                const isSubscribed = subscription?.status === 'active';

                return (
                  <div
                    key={plan.id}
                    className={`bg-white rounded-xl shadow-lg overflow-hidden ${
                      isCurrentPlan ? 'ring-2 ring-primary-500' : ''
                    }`}
                  >
                    {/* 플랜 헤더 */}
                    <div className="p-6 border-b border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-bold">{plan.name}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPlanBadgeColor(plan.billing_cycle)}`}>
                          {getBillingCycleText(plan.billing_cycle)}
                        </span>
                      </div>
                      {plan.description && (
                        <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
                      )}

                      {/* 가격 */}
                      <div className="mb-2">
                        {plan.price === 0 ? (
                          <div className="text-3xl font-bold text-gray-900">무료</div>
                        ) : (
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold text-gray-900">
                              {plan.price.toLocaleString()}원
                            </span>
                            <span className="text-gray-500">
                              / {plan.billing_cycle === 'annual' ? '년' : '월'}
                            </span>
                          </div>
                        )}
                      </div>

                      {plan.trial_days && plan.trial_days > 0 && (
                        <p className="text-xs text-primary-600 font-medium">
                          ✨ {plan.trial_days}일 무료 체험 포함
                        </p>
                      )}
                    </div>

                    {/* 플랜 features */}
                    <div className="p-6">
                      {features.length > 0 ? (
                        <ul className="space-y-3 mb-6">
                          {features.map((feature, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <span className="text-green-600 mt-0.5">✓</span>
                              <span className="text-gray-700">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="mb-6 text-sm text-gray-500">
                          기본 기능이 포함되어 있습니다.
                        </div>
                      )}

                      {/* 구독 버튼 */}
                      {isCurrentPlan ? (
                        <div className="px-4 py-3 bg-primary-50 text-primary-600 rounded-lg text-center font-semibold text-sm">
                          현재 플랜
                        </div>
                      ) : (
                        <button
                          onClick={() => handleSubscribe(plan.id, plan.name)}
                          disabled={createSubscriptionMutation.isLoading || (isSubscribed && !isCurrentPlan)}
                          className="w-full px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {createSubscriptionMutation.isLoading
                            ? '처리 중...'
                            : isSubscribed
                            ? '플랜 변경하기'
                            : '구독하기'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* 안내 메시지 */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="text-3xl">💳</div>
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">결제 정보</h3>
            <p className="text-sm text-blue-800 mb-2">
              현재 실제 결제 기능은 구현되지 않았습니다. 구독 버튼을 클릭하면 구독 상태만 변경됩니다.
            </p>
            <p className="text-sm text-blue-700">
              실제 서비스에서는 Stripe, Toss Payments 등의 결제 게이트웨이가 연동될 예정입니다.
            </p>
          </div>
        </div>
      </div>

      {/* 빠른 링크 */}
      <div className="mt-8 text-center">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold"
        >
          ← 대시보드로 돌아가기
        </Link>
      </div>
    </div>
  );
}
