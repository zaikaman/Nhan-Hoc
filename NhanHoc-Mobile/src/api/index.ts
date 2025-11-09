/**
 * API Index
 * Export tất cả các API services
 */

export { default as apiClient } from './apiClient';
export { default as quizApi } from './quizApi';
export { default as recommendationsApi } from './recommendationsApi';
export { default as resourceApi } from './resourceApi';
export { default as roadmapApi } from './roadmapApi';

// Export individual functions for convenience
export * from './analyticsApi';
export * from './chatApi';
export * from './quizApi';
export * from './resourceApi';
export * from './roadmapApi';

// Export specific types and functions from recommendationsApi to avoid conflicts
export type {
    DifficultyAdjustment, LearningPath, Milestone, NextTopic, PerformanceMetrics,
    RecommendationsData,
    RecommendationsResponse
} from './recommendationsApi';

export { getNextTopics, getPersonalizedRecommendations } from './recommendationsApi';

// Export types
export * from '../types/api';

