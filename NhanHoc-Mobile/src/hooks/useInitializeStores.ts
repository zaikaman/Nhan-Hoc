/**
 * Hook để khởi tạo và đồng bộ dữ liệu từ localStorage vào Zustand stores
 */

import { useEffect, useState } from 'react';
import { getAllCourses, getAllQuizResults } from '../services/localStorage';
import { useCourseStore, useQuizStore } from '../stores';

export const useInitializeStores = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setCourses = useCourseStore((state) => state.setCourses);
  const setQuizResults = useQuizStore((state) => state.setQuizResults);
  const coursesHydrated = useCourseStore((state) => state._hasHydrated);
  const quizHydrated = useQuizStore((state) => state._hasHydrated);

  useEffect(() => {
    // Chỉ load sau khi stores đã hydrate từ AsyncStorage
    if (!coursesHydrated || !quizHydrated) {
      return;
    }

    const initializeStores = async () => {
      try {
        console.log('🔄 Initializing stores from localStorage...');
        
        // Load courses từ localStorage
        const courses = await getAllCourses();
        console.log(`✅ Loaded ${courses.length} courses`);
        setCourses(courses);

        // Load quiz results từ localStorage
        const quizResults = await getAllQuizResults();
        console.log(`✅ Loaded ${quizResults.length} quiz results`);
        setQuizResults(quizResults);

        setIsInitialized(true);
        console.log('✅ Stores initialized successfully');
      } catch (err) {
        console.error('❌ Error initializing stores:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    initializeStores();
  }, [coursesHydrated, quizHydrated, setCourses, setQuizResults]);

  return { isInitialized, error };
};
