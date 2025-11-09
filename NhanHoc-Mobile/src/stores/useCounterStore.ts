import { create } from 'zustand';

/**
 * Example TypeScript Zustand store template
 * Use this as reference for creating new stores
 */

// Define state interface
interface CounterState {
  count: number;
  loading: boolean;
  error: string | null;
}

// Define actions interface
interface CounterActions {
  increment: () => void;
  decrement: () => void;
  incrementBy: (amount: number) => void;
  reset: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

// Combine state and actions
type CounterStore = CounterState & CounterActions;

// Create store with full type safety
export const useCounterStore = create<CounterStore>((set) => ({
  // Initial state
  count: 0,
  loading: false,
  error: null,

  // Actions
  increment: () => set((state) => ({ count: state.count + 1 })),
  
  decrement: () => set((state) => ({ count: state.count - 1 })),
  
  incrementBy: (amount: number) => 
    set((state) => ({ count: state.count + amount })),
  
  reset: () => set({ count: 0, error: null }),
  
  setLoading: (loading: boolean) => set({ loading }),
  
  setError: (error: string | null) => set({ error }),
}));

// Export types for reuse
export type { CounterActions, CounterState, CounterStore };

