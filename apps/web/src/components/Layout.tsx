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
        <div className="container-custom py-8">
          <div className="text-center text-gray-600 text-sm">
            <p>&copy; 2024 English Education Platform. All rights reserved.</p>
            <p className="mt-2">구독형 영어 교육 콘텐츠 플랫폼</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
