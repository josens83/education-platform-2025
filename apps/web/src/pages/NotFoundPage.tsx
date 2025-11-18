import { Link } from 'react-router-dom';

/**
 * 404 Not Found 페이지
 * - 존재하지 않는 페이지에 접근했을 때 보여지는 페이지
 */
export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* 404 숫자 */}
        <h1 className="text-9xl font-bold text-primary-600 mb-4 animate-bounce">
          404
        </h1>

        {/* 제목 */}
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          페이지를 찾을 수 없습니다
        </h2>

        {/* 설명 */}
        <p className="text-gray-600 mb-8 text-lg">
          죄송합니다. 요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
        </p>

        {/* 일러스트레이션 */}
        <div className="mb-8">
          <svg
            className="w-64 h-64 mx-auto text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        {/* 액션 버튼 */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold"
          >
            홈으로 돌아가기
          </Link>
          <Link
            to="/books"
            className="px-8 py-3 bg-white text-primary-600 border-2 border-primary-600 rounded-lg hover:bg-primary-50 transition font-semibold"
          >
            책 둘러보기
          </Link>
        </div>

        {/* 도움말 링크 */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-gray-600 mb-4">도움이 필요하신가요?</p>
          <div className="flex flex-wrap gap-4 justify-center text-sm">
            <Link to="/faq" className="text-primary-600 hover:text-primary-700 font-semibold">
              자주 묻는 질문
            </Link>
            <span className="text-gray-300">•</span>
            <Link to="/contact" className="text-primary-600 hover:text-primary-700 font-semibold">
              문의하기
            </Link>
            <span className="text-gray-300">•</span>
            <Link to="/dashboard" className="text-primary-600 hover:text-primary-700 font-semibold">
              대시보드
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
