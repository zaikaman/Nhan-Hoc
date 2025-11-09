/**
 * Learning Path Service (DEPRECATED)
 * 
 * ⚠️ File này đã được thay thế bởi cấu trúc API mới trong src/api/
 * 
 * Vui lòng sử dụng:
 * - src/api/roadmapApi.ts cho roadmap/learning path
 * - src/api/quizApi.ts cho quiz generation
 * - src/hooks/useRoadmap.ts và useQuiz.ts cho React components
 * 
 * Xem API_INTEGRATION_NEW.md để biết cách migrate
 */

// Re-export từ API mới để maintain backward compatibility
export {
    getQuizStatus as checkJobStatus, getRoadmapStatus as checkRoadmapStatus,
    // Roadmap functions (renamed)
    createRoadmap as generateLearningPath,
    // Quiz functions
    createQuiz as generateQuiz, pollQuizStatus as pollJobStatus, pollRoadmapStatus as pollRoadmapJobStatus, type JobStatus,
    type QuizJobStatus,
    // Types
    type QuizQuestion,
    type QuizResult as QuizResponse, type RoadmapJobStatus
} from '../api';

// Legacy types for backward compatibility
export interface GenerateCourseRequest {
  topic: string;
  description?: string;
  audienceLevel: 'beginner' | 'intermediate' | 'advanced';
  lessonCount: number;
  includeQuiz: boolean;
  quizPerLesson?: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  level: string;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  order: number;
  quiz?: any;
}

// Helper function để convert từ new API format sang old format
export const convertRoadmapRequest = (
  newRequest: GenerateCourseRequest
) => {
  return {
    topic: newRequest.topic,
    time: `${newRequest.lessonCount} lessons`,
    knowledge_level: newRequest.audienceLevel === 'beginner' ? 'Beginner' :
                     newRequest.audienceLevel === 'intermediate' ? 'Intermediate' : 'Advanced',
  };
};

/**
 * @deprecated Sử dụng roadmapApi.getCourses() thay thế
 */
export const getCourses = async (): Promise<Course[]> => {
  console.warn('getCourses() is deprecated. Use roadmapApi from src/api instead');
  return [];
};

/**
 * @deprecated Sử dụng roadmapApi.getCourseDetail() thay thế
 */
export const getCourseDetail = async (courseId: string): Promise<Course | null> => {
  console.warn('getCourseDetail() is deprecated. Use roadmapApi from src/api instead');
  return null;
};

