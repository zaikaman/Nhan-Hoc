/**
 * User Store với Persistence
 * Quản lý thông tin người dùng và tự động lưu vào AsyncStorage
 */

import { create } from 'zustand';
import { persist, PersistState } from './middleware/persist';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  googleId?: string;
  studyStreak: number;
  totalPoints: number;
  level: number;
  joinedAt: string;
}

export interface UserPreferences {
  language: string;
  notificationsEnabled: boolean;
  dailyGoal: number; // minutes per day
  reminderTime?: string;
}

// State interface
interface UserState {
  user: User | null;
  preferences: UserPreferences;
  isAuthenticated: boolean;
}

// Actions interface
interface UserActions {
  setUser: (user: User | null) => void;
  updateUser: (updates: Partial<User>) => void;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  incrementStreak: () => void;
  addPoints: (points: number) => void;
  logout: () => void;
}

// Combined type
type UserStore = UserState & UserActions & PersistState;

// Default preferences
const defaultPreferences: UserPreferences = {
  language: 'vi',
  notificationsEnabled: true,
  dailyGoal: 30,
};

/**
 * User Store với tự động persistence
 * Data sẽ được lưu vào AsyncStorage với key '@user-store'
 */
export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      preferences: defaultPreferences,
      isAuthenticated: false,
      _hasHydrated: false,
      _rehydrate: async () => {},

      // Actions
      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      updatePreferences: (preferences) =>
        set((state) => ({
          preferences: { ...state.preferences, ...preferences },
        })),

      incrementStreak: () =>
        set((state) => ({
          user: state.user
            ? { ...state.user, studyStreak: state.user.studyStreak + 1 }
            : null,
        })),

      addPoints: (points) =>
        set((state) => ({
          user: state.user
            ? { ...state.user, totalPoints: state.user.totalPoints + points }
            : null,
        })),

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          preferences: defaultPreferences,
        }),
    }),
    {
      name: '@user-store',
      // Chỉ persist user và preferences, không persist methods
      partialize: (state) => ({
        user: state.user,
        preferences: state.preferences,
        isAuthenticated: state.isAuthenticated,
      }),
      version: 1,
    }
  )
);

// Selectors cho performance
export const selectUser = (state: UserStore) => state.user;
export const selectIsAuthenticated = (state: UserStore) => state.isAuthenticated;
export const selectPreferences = (state: UserStore) => state.preferences;
export const selectHasHydrated = (state: UserStore) => state._hasHydrated;
