/**
 * API Configuration
 * Cấu hình kết nối đến backend API
 */

// Base URL của API trên Heroku
export const API_BASE_URL = 'https://nhanhoc-ca30a6361738.herokuapp.com';

// API Endpoints - Được tổ chức theo module
export const API_ENDPOINTS = {
  // Health check
  HEALTH: '/',
  
  // Roadmap endpoints
  ROADMAP: {
    CREATE: '/api/roadmap',
    STATUS: (jobId: string) => `/api/roadmap/status/${jobId}`,
  },
  
  // Quiz endpoints
  QUIZ: {
    CREATE: '/api/quiz',
    STATUS: (jobId: string) => `/api/quiz/status/${jobId}`,
  },
  
  // Resource endpoints
  RESOURCE: {
    CREATE: '/api/generate-resource',
    STATUS: (jobId: string) => `/api/generate-resource/status/${jobId}`,
  },
  
  // Chat endpoints
  CHAT: {
    CREATE: '/api/chat',
    STATUS: (jobId: string) => `/api/chat/status/${jobId}`,
  },
  
  // Analytics endpoints
  ANALYTICS: {
    OVERVIEW: '/api/analytics/overview',
    INSIGHTS: '/api/analytics/insights',
    INSIGHTS_STATUS: (jobId: string) => `/api/analytics/insights/status/${jobId}`,
    TOPIC: (topicName: string) => `/api/analytics/topic/${topicName}`,
    STUDY_PLAN: '/api/analytics/study-plan',
  },
  
  // Recommendations endpoints
  RECOMMENDATIONS: {
    CREATE: '/api/recommendations/personalized',
    STATUS: (jobId: string) => `/api/recommendations/personalized/status/${jobId}`,
    NEXT_TOPICS: '/api/recommendations/next-topics',
    LEARNING_PATH: '/api/recommendations/learning-path',
    DIFFICULTY: '/api/recommendations/difficulty',
  },
  
  // Legacy endpoints (deprecated - sẽ được loại bỏ sau)
  COURSES: '/api/courses',
  COURSE_DETAIL: (id: string) => `/api/courses/${id}`,
  LEARNING_PATH: '/api/learning-path',
  GENERATE_COURSE: '/api/generate-course',
  
  // User endpoints (future implementation)
  USER_PROFILE: '/api/user/profile',
  USER_PROGRESS: '/api/user/progress',
  
  // Auth endpoints (future implementation)
  AUTH_LOGIN: '/api/auth/login',
  AUTH_REGISTER: '/api/auth/register',
  AUTH_REFRESH: '/api/auth/refresh',
};

// Timeout configuration
export const API_TIMEOUT = 30000; // 30 seconds

// Polling configuration
export const POLLING_CONFIG = {
  MAX_ATTEMPTS: 60, // Số lần thử tối đa
  INTERVAL: 2000, // 2 giây giữa mỗi lần check
};
