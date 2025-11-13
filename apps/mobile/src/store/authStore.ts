import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '@education-platform/api-client';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => Promise<void>;
  clearAuth: () => Promise<void>;
  loadAuth: () => Promise<void>;
}

/**
 * 인증 상태 관리 스토어 (모바일)
 * - AsyncStorage를 사용하여 영구 저장
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  setAuth: async (user, token) => {
    try {
      await AsyncStorage.setItem('auth', JSON.stringify({ user, token }));
      set({ user, token, isAuthenticated: true });
    } catch (error) {
      console.error('Failed to save auth:', error);
    }
  },

  clearAuth: async () => {
    try {
      await AsyncStorage.removeItem('auth');
      set({ user: null, token: null, isAuthenticated: false });
    } catch (error) {
      console.error('Failed to clear auth:', error);
    }
  },

  loadAuth: async () => {
    try {
      const authData = await AsyncStorage.getItem('auth');
      if (authData) {
        const { user, token } = JSON.parse(authData);
        set({ user, token, isAuthenticated: true });
      }
    } catch (error) {
      console.error('Failed to load auth:', error);
    }
  },
}));
