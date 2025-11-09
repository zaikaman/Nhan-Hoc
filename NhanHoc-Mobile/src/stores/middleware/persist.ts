/**
 * Zustand Persistence Middleware for AsyncStorage
 * Tự động đồng bộ state với AsyncStorage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { StateCreator } from 'zustand';

export interface PersistOptions<T> {
  name: string; // Storage key
  partialize?: (state: T) => Partial<T>; // Chọn state nào cần persist
  onRehydrateStorage?: (state: T) => void; // Callback sau khi restore
  version?: number; // Version để migrate data
  migrate?: (persistedState: any, version: number) => T; // Migration function
}

export interface PersistState {
  _hasHydrated: boolean;
  _rehydrate: () => Promise<void>;
}

/**
 * Persist middleware cho Zustand với AsyncStorage
 * 
 * @example
 * ```ts
 * export const useUserStore = create<UserStore>()(
 *   persist(
 *     (set) => ({
 *       user: null,
 *       setUser: (user) => set({ user }),
 *     }),
 *     {
 *       name: '@user-storage',
 *       partialize: (state) => ({ user: state.user }),
 *     }
 *   )
 * );
 * ```
 */
export const persist = <T extends object>(
  config: StateCreator<T & PersistState>,
  options: PersistOptions<T>
) => {
  return (set: any, get: any, api: any) => {
    const { name, partialize, onRehydrateStorage, version = 0, migrate } = options;

    // Load data from AsyncStorage
    const rehydrate = async () => {
      try {
        const stored = await AsyncStorage.getItem(name);
        if (stored) {
          const parsed = JSON.parse(stored);
          
          // Check version and migrate if needed
          const persistedState = parsed.state;
          const persistedVersion = parsed.version || 0;
          
          let finalState = persistedState;
          if (migrate && persistedVersion !== version) {
            finalState = migrate(persistedState, persistedVersion);
          }

          set({ ...finalState, _hasHydrated: true });
          
          if (onRehydrateStorage) {
            onRehydrateStorage(get());
          }
        } else {
          set({ _hasHydrated: true });
        }
      } catch (error) {
        console.error(`Error rehydrating ${name}:`, error);
        set({ _hasHydrated: true });
      }
    };

    // Initialize store
    const initialState = config(
      (partial: any) => {
        set(partial);
        
        // Save to AsyncStorage after each update
        const state = get();
        const stateToPersist = partialize ? partialize(state) : state;
        
        AsyncStorage.setItem(
          name,
          JSON.stringify({
            state: stateToPersist,
            version,
          })
        ).catch((error) => {
          console.error(`Error persisting ${name}:`, error);
        });
      },
      get,
      api
    );

    // Rehydrate on initialization
    rehydrate();

    return {
      ...initialState,
      _hasHydrated: false,
      _rehydrate: rehydrate,
    };
  };
};

/**
 * Helper để clear persisted data
 */
export const clearPersistedData = async (key: string) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Error clearing ${key}:`, error);
  }
};

/**
 * Helper để get persisted data
 */
export const getPersistedData = async <T>(key: string): Promise<T | null> => {
  try {
    const stored = await AsyncStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.state;
    }
    return null;
  } catch (error) {
    console.error(`Error getting ${key}:`, error);
    return null;
  }
};
