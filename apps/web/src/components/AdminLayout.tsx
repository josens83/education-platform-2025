import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useEffect } from 'react';

/**
 * 관리자 전용 레이아웃
 * - 사이드바 네비게이션
 * - 관리자 권한 체크
 */
export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  // 관리자 권한 체크
  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'teacher')) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/admin', label: '대시보드', icon: '📊' },
    { path: '/admin/books', label: '책 관리', icon: '📚' },
    { path: '/admin/chapters', label: '챕터 관리', icon: '📝' },
    { path: '/admin/quizzes', label: '퀴즈 관리', icon: '❓' },
    { path: '/admin/audio', label: '오디오 관리', icon: '🎵' },
    { path: '/admin/users', label: '사용자 관리', icon: '👥' },
    { path: '/admin/analytics', label: '분석', icon: '📈' },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* 사이드바 */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        {/* 로고 */}
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold">관리자 패널</h1>
          <p className="text-sm text-gray-400 mt-1">{user?.username}</p>
        </div>

        {/* 네비게이션 */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    isActive(item.path)
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* 하단 액션 */}
        <div className="p-4 border-t border-gray-800 space-y-2">
          <Link
            to="/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 transition"
          >
            <span className="text-xl">🏠</span>
            <span>사용자 페이지로</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-red-600 transition"
          >
            <span className="text-xl">🚪</span>
            <span>로그아웃</span>
          </button>
        </div>
      </aside>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
