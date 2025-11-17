import { Link } from 'react-router-dom';

/**
 * 결제 취소 페이지
 * - 사용자가 Stripe Checkout에서 결제를 취소했을 때 보여지는 페이지
 */
export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        {/* 취소 아이콘 */}
        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-12 h-12 text-yellow-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* 제목 */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">결제가 취소되었습니다</h1>

        {/* 설명 */}
        <p className="text-gray-600 mb-2">
          결제 과정에서 취소하셨습니다.
        </p>
        <p className="text-gray-600 mb-8">
          언제든지 다시 구독하실 수 있습니다.
        </p>

        {/* 안내 메시지 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 text-left">
          <h3 className="font-semibold text-blue-900 mb-2">💡 알고 계셨나요?</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 7일 무료 체험으로 모든 기능을 먼저 경험해보세요</li>
            <li>• 언제든지 구독을 취소할 수 있습니다</li>
            <li>• 다양한 결제 방법을 지원합니다</li>
          </ul>
        </div>

        {/* 액션 버튼 */}
        <div className="space-y-3">
          <Link
            to="/subscription"
            className="block w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold"
          >
            다시 구독하기
          </Link>
          <Link
            to="/books"
            className="block w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-semibold"
          >
            무료 콘텐츠 둘러보기
          </Link>
          <Link
            to="/contact"
            className="block w-full text-primary-600 hover:text-primary-700 transition font-semibold text-sm"
          >
            궁금한 점이 있으신가요?
          </Link>
        </div>

        {/* 추가 정보 */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            결제와 관련하여 문의사항이 있으시면
            <br />
            고객센터로 연락 주시기 바랍니다.
          </p>
        </div>
      </div>
    </div>
  );
}
