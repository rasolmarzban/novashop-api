import { create } from 'zustand';
import type { LoginResponse } from '../types/auth';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;

  setTokens: (tokens: LoginResponse) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),

  isAuthenticated: Boolean(localStorage.getItem('accessToken')),

  setTokens: ({ accessToken, refreshToken }) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);

    set({
      accessToken,
      refreshToken,
      isAuthenticated: true,
    });
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    set({
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
  },
}));