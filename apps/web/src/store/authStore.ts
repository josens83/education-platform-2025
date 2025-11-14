import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@education-platform/api-client';
import { api } from '../lib/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
}

/**
 * 인증 상태 관리 스토어
 * - 사용자 정보 및 JWT 토큰 관리
 * - 로컬 스토리지에 영구 저장
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => {
        // API 클라이언트에 토큰 설정
        api.setToken(token);

        set({
          user,
          token,
          isAuthenticated: true,
        });
      },

      clearAuth: () => {
        // API 클라이언트 토큰 제거
        api.logout();

        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
