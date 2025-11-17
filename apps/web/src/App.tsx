import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { initializeApi } from './lib/api';
import { useAuthStore } from './store/authStore';

// Pages (추후 생성 예정)
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import SubscriptionPage from './pages/SubscriptionPage';
import BooksPage from './pages/BooksPage';
import BookDetailPage from './pages/BookDetailPage';
import ReaderPage from './pages/ReaderPage';
import QuizPage from './pages/QuizPage';
import QuizResultPage from './pages/QuizResultPage';
import VocabularyPage from './pages/VocabularyPage';
import FlashcardsPage from './pages/FlashcardsPage';

// Layout
import Layout from './components/Layout';

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
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* 공개 라우트 */}
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />

        {/* 책 목록 및 상세는 공개 (프리미엄 모델) */}
        <Route path="books" element={<BooksPage />} />
        <Route path="books/:id" element={<BookDetailPage />} />

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
    </Routes>
  );
}

export default App;
