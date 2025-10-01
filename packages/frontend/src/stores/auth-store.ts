import { create } from 'zustand';
import apiClient from '../lib/api-client';

interface User {
  id: string;
  email: string;
  username?: string; // Added for compatibility
  role: string;
  profile: any;
  studentProfile?: any;
  parentProfile?: any;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  error: null,

  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });

      const response = await apiClient.post('/api/auth/login', { email, password });
      const { user, accessToken, refreshToken } = response.data.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('userId', user.id);

      set({ user, isLoading: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  register: async (data: any) => {
    try {
      set({ isLoading: true, error: null });

      const response = await apiClient.post('/api/auth/register', data);
      const { user, accessToken, refreshToken } = response.data.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('userId', user.id);

      set({ user, isLoading: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  logout: async () => {
    try {
      await apiClient.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userId');
      set({ user: null, isLoading: false });
    }
  },

  loadUser: async () => {
    try {
      const token = localStorage.getItem('accessToken');

      if (!token) {
        set({ isLoading: false });
        return;
      }

      const response = await apiClient.get('/api/auth/me');
      set({ user: response.data.data, isLoading: false });
    } catch (error) {
      console.error('Load user error:', error);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      set({ user: null, isLoading: false });
    }
  },
}));

// Load user on app start
useAuthStore.getState().loadUser();