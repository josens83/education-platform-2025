import { Link } from 'react-router-dom';

/**
 * 500 서버 에러 페이지
 * - 서버 내부 오류 발생 시 표시
 */
export default function ServerErrorPage() {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* 에러 아이콘 */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full mb-4">
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
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-6xl font-bold text-gray-900 mb-4">500</h1>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">서버 오류가 발생했습니다</h2>
          <p className="text-xl text-gray-600 mb-8">
            죄송합니다. 서버에서 일시적인 문제가 발생했습니다.
            <br />
            잠시 후 다시 시도해 주세요.
          </p>
        </div>

        {/* 액션 버튼들 */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <button
            onClick={handleReload}
            className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold shadow-md hover:shadow-lg"
          >
            페이지 새로고침
          </button>
          <Link
            to="/"
            className="px-8 py-3 bg-white text-primary-600 border-2 border-primary-600 rounded-lg hover:bg-primary-50 transition font-semibold shadow-md hover:shadow-lg"
          >
            홈으로 돌아가기
          </Link>
        </div>

        {/* 도움말 */}
        <div className="bg-white rounded-xl shadow-lg p-6 text-left">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">문제가 계속되나요?</h3>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <svg
                className="w-6 h-6 text-primary-600 mr-3 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>브라우저 캐시를 삭제하고 다시 시도해보세요</span>
            </li>
            <li className="flex items-start">
              <svg
                className="w-6 h-6 text-primary-600 mr-3 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>몇 분 후 다시 접속해보세요</span>
            </li>
            <li className="flex items-start">
              <svg
                className="w-6 h-6 text-primary-600 mr-3 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>
                문제가 지속되면{' '}
                <Link to="/contact" className="text-primary-600 hover:text-primary-700 font-semibold">
                  고객센터
                </Link>
                로 문의해주세요
              </span>
            </li>
          </ul>
        </div>

        {/* 기술 지원 정보 */}
        <div className="mt-8 text-sm text-gray-500">
          <p>오류 코드: 500 - Internal Server Error</p>
          <p className="mt-1">시간: {new Date().toLocaleString('ko-KR')}</p>
        </div>
      </div>
    </div>
  );
}
