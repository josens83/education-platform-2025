import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { initializeApi } from './lib/api';
import { useAuthStore } from './store/authStore';

// Layout (eager load as it's always needed)
import Layout from './components/Layout';

// Lazy-loaded pages for code splitting
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const SubscriptionPage = lazy(() => import('./pages/SubscriptionPage'));
const BooksPage = lazy(() => import('./pages/BooksPage'));
const BookDetailPage = lazy(() => import('./pages/BookDetailPage'));
const ReaderPage = lazy(() => import('./pages/ReaderPage'));
const QuizPage = lazy(() => import('./pages/QuizPage'));
const QuizResultPage = lazy(() => import('./pages/QuizResultPage'));
const VocabularyPage = lazy(() => import('./pages/VocabularyPage'));
const FlashcardsPage = lazy(() => import('./pages/FlashcardsPage'));

// Legal and support pages
const TermsOfServicePage = lazy(() => import('./pages/TermsOfServicePage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const FAQPage = lazy(() => import('./pages/FAQPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));

// Payment pages
const PaymentSuccessPage = lazy(() => import('./pages/PaymentSuccessPage'));
const PaymentCancelPage = lazy(() => import('./pages/PaymentCancelPage'));

// Auth pages
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));

// Error pages
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const ServerErrorPage = lazy(() => import('./pages/ServerErrorPage'));

// Admin pages
const AdminLayout = lazy(() => import('./components/AdminLayout'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const BookManagementPage = lazy(() => import('./pages/admin/BookManagementPage'));
const ChapterManagementPage = lazy(() => import('./pages/admin/ChapterManagementPage'));
const AudioManagementPage = lazy(() => import('./pages/admin/AudioManagementPage'));
const QuizManagementPage = lazy(() => import('./pages/admin/QuizManagementPage'));
const UserManagementPage = lazy(() => import('./pages/admin/UserManagementPage'));
const AnalyticsPage = lazy(() => import('./pages/admin/AnalyticsPage'));

/**
 * Loading fallback component
 */
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600">로딩 중...</p>
      </div>
    </div>
  );
}

/**
 * 보호된 라우트 컴포넌트
 * - 인증되지 않은 사용자는 로그인 페이지로 리다이렉트
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

/**
 * 메인 앱 컴포넌트
 */
function App() {
  useEffect(() => {
    // API 클라이언트 초기화
    initializeApi();
  }, []);

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
      <Route path="/" element={<Layout />}>
        {/* 공개 라우트 */}
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />

        {/* 책 목록 및 상세는 공개 (프리미엄 모델) */}
        <Route path="books" element={<BooksPage />} />
        <Route path="books/:id" element={<BookDetailPage />} />

        {/* 법적 문서 및 고객 지원 - 공개 */}
        <Route path="terms" element={<TermsOfServicePage />} />
        <Route path="privacy" element={<PrivacyPolicyPage />} />
        <Route path="faq" element={<FAQPage />} />
        <Route path="contact" element={<ContactPage />} />

        {/* 결제 관련 페이지 - 공개 */}
        <Route path="subscription/success" element={<PaymentSuccessPage />} />
        <Route path="subscription/cancel" element={<PaymentCancelPage />} />

        {/* 비밀번호 재설정 - 공개 */}
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />

        {/* 보호된 라우트 - 인증 필요 */}
        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="subscription"
          element={
            <ProtectedRoute>
              <SubscriptionPage />
            </ProtectedRoute>
          }
        />

        {/* 챕터 읽기는 로그인 필수 (나중에 구독 체크 추가 예정) */}
        <Route
          path="reader/:chapterId"
          element={
            <ProtectedRoute>
              <ReaderPage />
            </ProtectedRoute>
          }
        />

        {/* 퀴즈는 로그인 필수 */}
        <Route
          path="quiz/:quizId"
          element={
            <ProtectedRoute>
              <QuizPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="quiz/:quizId/result"
          element={
            <ProtectedRoute>
              <QuizResultPage />
            </ProtectedRoute>
          }
        />

        {/* 단어장은 로그인 필수 */}
        <Route
          path="vocabulary"
          element={
            <ProtectedRoute>
              <VocabularyPage />
            </ProtectedRoute>
          }
        />

        {/* 플래시카드는 로그인 필수 */}
        <Route
          path="flashcards"
          element={
            <ProtectedRoute>
              <FlashcardsPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* 관리자 라우트 - 관리자 전용 레이아웃 */}
      <Route
        path="admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="books" element={<BookManagementPage />} />
        <Route path="chapters" element={<ChapterManagementPage />} />
        <Route path="audio" element={<AudioManagementPage />} />
        <Route path="quizzes" element={<QuizManagementPage />} />
        <Route path="users" element={<UserManagementPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
      </Route>

      {/* 에러 페이지 */}
      <Route path="/error" element={<ServerErrorPage />} />

      {/* 404 페이지 - 모든 매칭되지 않는 경로 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
    </Suspense>
  );
}

export default App;
