import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../lib/api';

/**
 * 결제 성공 페이지
 * - Stripe Checkout에서 리다이렉트된 후 보여지는 페이지
 */
export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setError('결제 세션 ID가 없습니다.');
        setIsVerifying(false);
        return;
      }

      try {
        // 결제 세션 상태 확인
        await api.getCheckoutSession(sessionId);
        setIsVerifying(false);
      } catch (err: any) {
        console.error('결제 검증 오류:', err);
        setError('결제 검증 중 오류가 발생했습니다.');
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [sessionId]);

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">결제 확인 중...</h2>
          <p className="text-gray-600">잠시만 기다려 주세요.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-12 h-12 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">결제 확인 실패</h1>
          <p className="text-gray-600 mb-8">{error}</p>

          <div className="space-y-3">
            <Link
              to="/subscription"
              className="block w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold"
            >
              구독 페이지로 돌아가기
            </Link>
            <Link
              to="/contact"
              className="block w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-semibold"
            >
              고객센터 문의
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        {/* 성공 아이콘 */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
          <svg
            className="w-12 h-12 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        {/* 제목 */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">결제가 완료되었습니다! 🎉</h1>

        {/* 설명 */}
        <p className="text-gray-600 mb-2">
          프리미엄 구독이 활성화되었습니다.
        </p>
        <p className="text-gray-600 mb-8">
          이제 모든 학습 콘텐츠를 제한 없이 이용하실 수 있습니다.
        </p>

        {/* 액션 버튼 */}
        <div className="space-y-3">
          <Link
            to="/dashboard"
            className="block w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold"
          >
            학습 시작하기
          </Link>
          <Link
            to="/books"
            className="block w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-semibold"
          >
            책 둘러보기
          </Link>
          <Link
            to="/subscription"
            className="block w-full text-primary-600 hover:text-primary-700 transition font-semibold text-sm"
          >
            구독 관리
          </Link>
        </div>

        {/* 추가 정보 */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            결제 내역은 이메일로 발송되었습니다.
            <br />
            궁금한 사항이 있으시면 고객센터로 문의해 주세요.
          </p>
        </div>
      </div>
    </div>
  );
}
