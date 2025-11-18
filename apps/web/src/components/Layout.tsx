import { Outlet, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { api } from '../lib/api';

/**
 * 메인 레이아웃 컴포넌트
 * - 헤더, 푸터, 네비게이션 포함
 * - 모든 페이지에 공통으로 적용
 */
export default function Layout() {
  const { isAuthenticated, user, clearAuth } = useAuthStore();

  const handleLogout = () => {
    api.logout();
    clearAuth();
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between">
            {/* 로고 */}
            <Link to="/" className="text-2xl font-bold text-primary-600">
              📚 English Platform
            </Link>

            {/* 네비게이션 */}
            <nav className="flex items-center gap-6">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    className="text-gray-700 hover:text-primary-600 transition"
                  >
                    대시보드
                  </Link>
                  <Link
                    to="/books"
                    className="text-gray-700 hover:text-primary-600 transition"
                  >
                    책 목록
                  </Link>
                  <Link
                    to="/vocabulary"
                    className="text-gray-700 hover:text-primary-600 transition"
                  >
                    단어장
                  </Link>
                  <Link
                    to="/subscription"
                    className="text-gray-700 hover:text-primary-600 transition"
                  >
                    구독
                  </Link>
                  <div className="flex items-center gap-4">
                    <Link
                      to="/profile"
                      className="text-gray-700 hover:text-primary-600 transition"
                    >
                      👤 {user?.username}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                    >
                      로그아웃
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-primary-600 transition"
                  >
                    로그인
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                  >
                    회원가입
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* 푸터 */}
      <footer className="bg-gray-50 border-t">
        <div className="container-custom py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* 회사 정보 */}
            <div>
              <h3 className="font-bold text-gray-900 mb-4">English Platform</h3>
              <p className="text-sm text-gray-600">
                구독형 영어 교육 콘텐츠 플랫폼
              </p>
            </div>

            {/* 서비스 */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">서비스</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/books" className="text-gray-600 hover:text-primary-600 transition">
                    책 목록
                  </Link>
                </li>
                <li>
                  <Link to="/subscription" className="text-gray-600 hover:text-primary-600 transition">
                    구독 플랜
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard" className="text-gray-600 hover:text-primary-600 transition">
                    대시보드
                  </Link>
                </li>
              </ul>
            </div>

            {/* 고객 지원 */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">고객 지원</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/faq" className="text-gray-600 hover:text-primary-600 transition">
                    자주 묻는 질문
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-gray-600 hover:text-primary-600 transition">
                    문의하기
                  </Link>
                </li>
              </ul>
            </div>

            {/* 법적 문서 */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">법적 문서</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/terms" className="text-gray-600 hover:text-primary-600 transition">
                    이용약관
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-gray-600 hover:text-primary-600 transition">
                    개인정보처리방침
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t pt-8 text-center text-gray-600 text-sm">
            <p>&copy; 2025 English Education Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
