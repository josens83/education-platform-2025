import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { api } from '../lib/api';
import ThemeToggle from './ThemeToggle';
import { FiMenu, FiX, FiUser } from 'react-icons/fi';

/**
 * Premium Layout Component - Linear/Stripe Style
 * - Glass morphism header with blur effect
 * - Smooth animations and transitions
 * - Dark mode support with theme toggle
 * - Responsive mobile menu
 */
export default function Layout() {
  const { isAuthenticated, user, clearAuth } = useAuthStore();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    api.logout();
    clearAuth();
    setMobileMenuOpen(false);
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const navLinks = isAuthenticated
    ? [
        { to: '/dashboard', label: '대시보드' },
        { to: '/books', label: '책 목록' },
        { to: '/vocabulary', label: '단어장' },
        { to: '/subscription', label: '구독' },
      ]
    : [];

  return (
    <div className="min-h-screen flex flex-col bg-bg text-text-primary">
      {/* Premium Header with Glass Effect */}
      <header className="sticky top-0 z-50 bg-surface/80 dark:bg-surface/50 backdrop-blur-xl border-b border-border shadow-sm">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <span className="text-2xl">📚</span>
              <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                English Platform
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`
                    text-sm font-medium transition-colors duration-200
                    ${isActiveRoute(link.to)
                      ? 'text-primary-600'
                      : 'text-text-secondary hover:text-text-primary'
                    }
                  `}
                >
                  {link.label}
                </Link>
              ))}

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Auth Section */}
              {isAuthenticated ? (
                <div className="flex items-center gap-3 ml-2 pl-3 border-l border-border">
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-hover hover:bg-surface-hover/80 transition-all duration-200 group"
                  >
                    <FiUser className="w-4 h-4 text-text-secondary group-hover:text-primary-600 transition-colors" />
                    <span className="text-sm font-medium text-text-primary">{user?.username}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary bg-surface-hover hover:bg-surface-hover/80 rounded-xl transition-all duration-200"
                  >
                    로그아웃
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 ml-2">
                  <Link
                    to="/login"
                    className="btn-ghost text-sm py-2 px-4"
                  >
                    로그인
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary text-sm py-2 px-5"
                  >
                    회원가입
                  </Link>
                </div>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center gap-3">
              <ThemeToggle />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl bg-surface-hover hover:bg-surface-hover/80 transition-colors"
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? (
                  <FiX className="w-5 h-5 text-text-primary" />
                ) : (
                  <FiMenu className="w-5 h-5 text-text-primary" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-border bg-surface/95 backdrop-blur-xl"
            >
              <nav className="container-custom py-4 space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`
                      block px-4 py-3 rounded-xl text-sm font-medium transition-colors
                      ${isActiveRoute(link.to)
                        ? 'bg-primary-600 text-white'
                        : 'text-text-primary hover:bg-surface-hover'
                      }
                    `}
                  >
                    {link.label}
                  </Link>
                ))}

                {isAuthenticated ? (
                  <>
                    <Link
                      to="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-3 rounded-xl text-sm font-medium text-text-primary hover:bg-surface-hover transition-colors"
                    >
                      👤 {user?.username}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-text-primary hover:bg-surface-hover transition-colors"
                    >
                      로그아웃
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-3 rounded-xl text-sm font-medium text-text-primary hover:bg-surface-hover transition-colors"
                    >
                      로그인
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-3 rounded-xl text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                    >
                      회원가입
                    </Link>
                  </>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content with Smooth Transitions */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Premium Footer */}
      <footer className="bg-surface border-t border-border">
        <div className="container-custom py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Company Info */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">📚</span>
                <h3 className="font-bold text-text-primary">English Platform</h3>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">
                구독형 영어 교육 콘텐츠 플랫폼
              </p>
            </div>

            {/* Service Links */}
            <div>
              <h3 className="font-semibold text-text-primary mb-4">서비스</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link to="/books" className="text-text-secondary hover:text-primary-600 transition-colors">
                    책 목록
                  </Link>
                </li>
                <li>
                  <Link to="/subscription" className="text-text-secondary hover:text-primary-600 transition-colors">
                    구독 플랜
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard" className="text-text-secondary hover:text-primary-600 transition-colors">
                    대시보드
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h3 className="font-semibold text-text-primary mb-4">고객 지원</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link to="/faq" className="text-text-secondary hover:text-primary-600 transition-colors">
                    자주 묻는 질문
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-text-secondary hover:text-primary-600 transition-colors">
                    문의하기
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h3 className="font-semibold text-text-primary mb-4">법적 문서</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link to="/terms" className="text-text-secondary hover:text-primary-600 transition-colors">
                    이용약관
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-text-secondary hover:text-primary-600 transition-colors">
                    개인정보처리방침
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-8 text-center">
            <p className="text-sm text-text-tertiary">
              &copy; 2025 English Education Platform. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
