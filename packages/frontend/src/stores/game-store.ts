import { create } from 'zustand';
import apiClient from '../lib/api-client';

interface Problem {
  id: string;
  question: string;
  type: string;
  topic: string;
  difficulty: number;
  choices?: string[];
  hints: string[];
}

interface GameState {
  session: any | null;
  currentProblem: Problem | null;
  hintsUsed: number;
  startTime: number;
  score: number;
  streak: number;
  isLoading: boolean;

  startSession: (mode: string) => Promise<void>;
  endSession: () => Promise<void>;
  getNextProblem: () => Promise<void>;
  submitAnswer: (answer: string) => Promise<any>;
  getHint: () => Promise<string>;
  reset: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  session: null,
  currentProblem: null,
  hintsUsed: 0,
  startTime: 0,
  score: 0,
  streak: 0,
  isLoading: false,

  startSession: async (mode: string) => {
    try {
      set({ isLoading: true });

      const response = await apiClient.post('/api/game/session/start', {
        mode,
        deviceType: 'web',
      });

      set({
        session: response.data.data.session,
        streak: response.data.data.currentStreak,
        isLoading: false,
      });
    } catch (error) {
      console.error('Start session error:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  endSession: async () => {
    const { session } = get();
    if (!session) return;

    try {
      await apiClient.post(`/api/game/session/${session.id}/end`);
      set({ session: null, currentProblem: null });
    } catch (error) {
      console.error('End session error:', error);
    }
  },

  getNextProblem: async () => {
    try {
      set({ isLoading: true, hintsUsed: 0, startTime: Date.now() });

      const response = await apiClient.get('/api/game/problem/next');
      set({
        currentProblem: response.data.data,
        isLoading: false,
      });
    } catch (error) {
      console.error('Get next problem error:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  submitAnswer: async (answer: string) => {
    const { session, currentProblem, startTime, hintsUsed } = get();

    if (!session || !currentProblem) {
      throw new Error('No active session or problem');
    }

    const timeSpent = Math.floor((Date.now() - startTime) / 1000);

    try {
      const response = await apiClient.post('/api/game/problem/submit', {
        sessionId: session.id,
        problemId: currentProblem.id,
        answer,
        timeSpent,
        hintsUsed,
      });

      const { isCorrect, xpEarned, coinsEarned, didLevelUp } = response.data.data;

      if (isCorrect) {
        set((state) => ({
          score: state.score + xpEarned,
          streak: state.streak + 1,
        }));
      } else {
        set({ streak: 0 });
      }

      return response.data.data;
    } catch (error) {
      console.error('Submit answer error:', error);
      throw error;
    }
  },

  getHint: async () => {
    const { currentProblem, hintsUsed } = get();

    if (!currentProblem) {
      throw new Error('No current problem');
    }

    try {
      const response = await apiClient.get('/api/game/problem/hint', {
        params: {
          problemId: currentProblem.id,
          hintIndex: hintsUsed,
        },
      });

      set((state) => ({ hintsUsed: state.hintsUsed + 1 }));

      return response.data.data.hint;
    } catch (error) {
      console.error('Get hint error:', error);
      throw error;
    }
  },

  reset: () => {
    set({
      session: null,
      currentProblem: null,
      hintsUsed: 0,
      startTime: 0,
      score: 0,
      streak: 0,
    });
  },
}));