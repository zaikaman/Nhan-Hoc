/**
 * Course Store với Persistence
 * Quản lý courses và tự động đồng bộ với localStorage service
 */

import { create } from 'zustand';
import { Course } from '../services/localStorage';
import { persist, PersistState } from './middleware/persist';

// State interface
interface CourseState {
  courses: Course[];
  activeCourseId: string | null;
  loading: boolean;
  error: string | null;
}

// Actions interface
interface CourseActions {
  setCourses: (courses: Course[]) => void;
  addCourse: (course: Course) => void;
  updateCourse: (courseId: string, updates: Partial<Course>) => void;
  deleteCourse: (courseId: string) => void;
  setActiveCourse: (courseId: string | null) => void;
  completeSubtopic: (courseId: string, subtopicId: string) => void;
  updateProgress: (courseId: string, progress: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

// Combined type
type CourseStore = CourseState & CourseActions & PersistState;

const initialState: CourseState = {
  courses: [],
  activeCourseId: null,
  loading: false,
  error: null,
};

/**
 * Course Store với persistence
 * Lưu trữ danh sách courses và trạng thái học tập
 */
export const useCourseStore = create<CourseStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      _hasHydrated: false,
      _rehydrate: async () => {},

      // Actions
      setCourses: (courses) =>
        set({ courses, error: null }),

      addCourse: (course) =>
        set((state) => ({
          courses: [course, ...state.courses],
        })),

      updateCourse: (courseId, updates) =>
        set((state) => ({
          courses: state.courses.map((c) =>
            c.id === courseId ? { ...c, ...updates } : c
          ),
        })),

      deleteCourse: (courseId) =>
        set((state) => ({
          courses: state.courses.filter((c) => c.id !== courseId),
          activeCourseId:
            state.activeCourseId === courseId ? null : state.activeCourseId,
        })),

      setActiveCourse: (courseId) =>
        set({ activeCourseId: courseId }),

      completeSubtopic: (courseId, subtopicId) =>
        set((state) => {
          const course = state.courses.find((c) => c.id === courseId);
          if (!course) return state;

          const completedSubTopics = [...course.completedSubTopics, subtopicId];
          const progress = Math.round(
            (completedSubTopics.length / course.totalSubTopics) * 100
          );

          return {
            courses: state.courses.map((c) =>
              c.id === courseId
                ? {
                    ...c,
                    completedSubTopics,
                    progress,
                    status: progress === 100 ? 'completed' : 'active',
                  }
                : c
            ),
          };
        }),

      updateProgress: (courseId, progress) =>
        set((state) => ({
          courses: state.courses.map((c) =>
            c.id === courseId
              ? {
                  ...c,
                  progress,
                  status: progress === 100 ? 'completed' : 'active',
                }
              : c
          ),
        })),

      setLoading: (loading) => set({ loading }),

      setError: (error) => set({ error }),

      reset: () => set(initialState),
    }),
    {
      name: '@course-store',
      partialize: (state) => ({
        courses: state.courses,
        activeCourseId: state.activeCourseId,
      }),
      version: 1,
    }
  )
);

// Selectors
export const selectCourses = (state: CourseStore) => state.courses;
export const selectActiveCourse = (state: CourseStore) => {
  const { courses, activeCourseId } = state;
  return courses.find((c) => c.id === activeCourseId) || null;
};
export const selectActiveCourses = (state: CourseStore) =>
  state.courses.filter((c) => c.status === 'active');
export const selectCompletedCourses = (state: CourseStore) =>
  state.courses.filter((c) => c.status === 'completed');
export const selectCourseById = (courseId: string) => (state: CourseStore) =>
  state.courses.find((c) => c.id === courseId);
