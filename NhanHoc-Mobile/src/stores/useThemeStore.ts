import { create } from 'zustand';
import { persist, PersistState } from './middleware/persist';

export type ThemeMode = 'light' | 'dark' | 'ocean' | 'sunset';

interface ThemeState {
  mode: ThemeMode;
}

interface ThemeActions {
  setTheme: (mode: ThemeMode) => void;
}

type ThemeStore = ThemeState & ThemeActions & PersistState;

/**
 * Theme Store với persistence
 * Theme sẽ được tự động lưu và restore từ AsyncStorage
 */
export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      mode: 'dark',
      _hasHydrated: false,
      _rehydrate: async () => {},
      setTheme: (mode) => set({ mode }),
    }),
    {
      name: '@theme-store',
      partialize: (state) => ({ mode: state.mode }),
      version: 1,
    }
  )
);
