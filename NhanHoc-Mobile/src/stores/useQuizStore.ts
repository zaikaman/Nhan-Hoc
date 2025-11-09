/**
 * Quiz Store với Persistence
 * Quản lý kết quả quiz và lịch sử làm bài
 */

import { create } from 'zustand';
import { QuizResult } from '../services/localStorage';
import { persist, PersistState } from './middleware/persist';

// State interface
interface QuizState {
  quizResults: QuizResult[];
  currentQuiz: QuizResult | null;
  loading: boolean;
  error: string | null;
}

// Actions interface
interface QuizActions {
  setQuizResults: (results: QuizResult[]) => void;
  addQuizResult: (result: QuizResult) => void;
  setCurrentQuiz: (quiz: QuizResult | null) => void;
  getQuizResultsByCourse: (courseId: string) => QuizResult[];
  getQuizResultsBySubtopic: (courseId: string, subtopic: string) => QuizResult | null;
  deleteQuizResult: (quizId: string) => void;
  clearQuizResults: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

// Combined type
type QuizStore = QuizState & QuizActions & PersistState;

const initialState: QuizState = {
  quizResults: [],
  currentQuiz: null,
  loading: false,
  error: null,
};

/**
 * Quiz Store với persistence
 * Lưu trữ tất cả kết quả quiz
 */
export const useQuizStore = create<QuizStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      _hasHydrated: false,
      _rehydrate: async () => {},

      // Actions
      setQuizResults: (results) =>
        set({ quizResults: results, error: null }),

      addQuizResult: (result) =>
        set((state) => ({
          quizResults: [result, ...state.quizResults],
        })),

      setCurrentQuiz: (quiz) =>
        set({ currentQuiz: quiz }),

      getQuizResultsByCourse: (courseId) => {
        const state = get();
        return state.quizResults.filter((q) => q.courseId === courseId);
      },

      getQuizResultsBySubtopic: (courseId, subtopic) => {
        const state = get();
        return (
          state.quizResults.find(
            (q) => q.courseId === courseId && q.subtopic === subtopic
          ) || null
        );
      },

      deleteQuizResult: (quizId) =>
        set((state) => ({
          quizResults: state.quizResults.filter((q) => q.id !== quizId),
        })),

      clearQuizResults: () =>
        set({ quizResults: [], currentQuiz: null }),

      setLoading: (loading) => set({ loading }),

      setError: (error) => set({ error }),
    }),
    {
      name: '@quiz-store',
      partialize: (state) => ({
        quizResults: state.quizResults,
      }),
      version: 1,
    }
  )
);

// Selectors
export const selectQuizResults = (state: QuizStore) => state.quizResults;
export const selectCurrentQuiz = (state: QuizStore) => state.currentQuiz;
export const selectQuizStatistics = (state: QuizStore) => {
  const { quizResults } = state;
  const totalQuizzes = quizResults.length;
  const totalQuestions = quizResults.reduce((acc, q) => acc + q.totalQuestions, 0);
  const totalCorrect = quizResults.reduce((acc, q) => acc + q.score, 0);
  const averageScore = totalQuizzes > 0
    ? Math.round((totalCorrect / totalQuestions) * 100)
    : 0;

  return {
    totalQuizzes,
    totalQuestions,
    totalCorrect,
    averageScore,
  };
};
