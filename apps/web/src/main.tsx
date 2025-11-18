// Initialize Sentry FIRST (before any other imports)
import { initSentry } from './lib/sentry';
initSentry();

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

// React Query 클라이언트 설정 (성능 최적화)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 윈도우 포커스 시 자동 재요청 비활성화 (불필요한 네트워크 요청 방지)
      refetchOnWindowFocus: false,
      // 재시도 횟수 제한 (빠른 실패로 UX 개선)
      retry: 1,
      // 데이터가 신선한 것으로 간주되는 시간 (5분)
      staleTime: 5 * 60 * 1000,
      // 캐시 유지 시간 (30분) - 메모리에서 제거되기 전 시간
      cacheTime: 30 * 60 * 1000,
      // 백그라운드에서 자동으로 오래된 데이터 재요청
      refetchOnMount: 'always',
      // 네트워크 재연결 시 재요청
      refetchOnReconnect: true,
      // suspense mode 비활성화 (lazy loading과 충돌 방지)
      suspense: false,
    },
    mutations: {
      // 뮤테이션 재시도 비활성화 (중복 요청 방지)
      retry: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
          <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        </BrowserRouter>
        {/* React Query Devtools - 개발 환경에서만 표시 */}
        <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
      </QueryClientProvider>
    </HelmetProvider>
  </React.StrictMode>
);
