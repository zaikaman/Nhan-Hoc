/**
 * Analytics API Client
 * Xử lý các request liên quan đến phân tích học tập
 */

import { getAllCourses, getAllQuizResults } from '../services/localStorage';
import { JobCreateResponse } from '../types/api';
import apiClient from './apiClient';

// Polling configuration
const POLLING_CONFIG = {
  MAX_ATTEMPTS: 60,
  INTERVAL: 2000, // 2 seconds
};

// Types cho Analytics
export interface LearningData {
  learning_activities: LearningActivity[];
  quiz_results: QuizAnalyticsResult[];
  time_spent: Record<string, number>; // topic -> seconds
  current_topics: string[];
}

export interface LearningActivity {
  id?: number;
  activityType: string;
  date: string; // ISO date
  topic: string;
  subtopic?: string;
  duration: number; // seconds
  timestamp: number;
  type?: 'quiz' | 'resource' | 'chat';
}

export interface QuizAnalyticsResult {
  topic: string;
  subtopic: string;
  score: number; // 0-100
  correct_answers: number;
  total_questions: number;
  time_spent: number;
  timestamp: number;
  passed: boolean;
  date: string; // ISO date
}

export interface ProgressMetrics {
  total_time_seconds: number;
  total_time_hours: number;
  avg_quiz_score: number;
  total_quizzes: number;
  passed_quizzes: number;
  topics_studied: number;
  topic_breakdown: Record<string, TopicBreakdown>;
  current_streak: number;
  total_activities: number;
}

export interface TopicBreakdown {
  time_spent: number; // seconds
  quizzes_taken: number;
  avg_score: number;
  passed: number;
}

export interface AIInsights {
  summary: string;
  strengths: Strength[];
  weaknesses: Weakness[];
  recommendations: Recommendation[];
  next_focus: string;
}

export interface Strength {
  area: string;
  score: number; // 1-10
  description: string;
}

export interface Weakness {
  area: string;
  score: number; // 1-10
  description: string;
  improvement_tips: string;
}

export interface Recommendation {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  action_items: string[];
}

export interface TopicInsights {
  mastery_level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' | 'Đang học';
  progress: number; // 0-100
  key_concepts_mastered?: string[];
  areas_to_improve?: string[];
  next_steps?: string[];
  stats: {
    total_time_minutes: number;
    quizzes_taken: number;
    avg_score: number;
  };
  message?: string;
  suggestions?: string[];
}

export interface StudyPlan {
  daily_plan: DailyPlan[];
  weekly_goals: string[];
  priority_topics: string[];
  tips: string[];
}

export interface DailyPlan {
  day: string;
  focus: string;
  activities: string[];
  estimated_time: string;
}

// Job status types
export interface AnalyticsJobStatus<T> {
  job_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
  result?: T;
  error?: string;
  completed_at?: string;
}

/**
 * Tạo analytics insights job
 */
const createInsightsJob = async (
  learningData: LearningData
): Promise<JobCreateResponse> => {
  console.log('🤖 Creating AI insights job...');
  return apiClient.post<JobCreateResponse>(
    '/api/analytics/insights',
    { learning_data: learningData }
  );
};

/**
 * Kiểm tra trạng thái insights job
 */
const getInsightsStatus = async (
  jobId: string
): Promise<AnalyticsJobStatus<AIInsights>> => {
  return apiClient.get<AnalyticsJobStatus<AIInsights>>(
    `/api/analytics/insights/status/${jobId}`
  );
};

/**
 * Poll insights job status
 */
const pollInsightsStatus = async (
  jobId: string,
  onProgress?: (status: AnalyticsJobStatus<AIInsights>) => void
): Promise<AnalyticsJobStatus<AIInsights>> => {
  let attempts = 0;

  while (attempts < POLLING_CONFIG.MAX_ATTEMPTS) {
    try {
      const status = await getInsightsStatus(jobId);

      if (onProgress) {
        onProgress(status);
      }

      if (status.status === 'completed' || status.status === 'failed') {
        return status;
      }

      await new Promise((resolve) => setTimeout(resolve, POLLING_CONFIG.INTERVAL));
      attempts++;
    } catch (error) {
      attempts++;

      if (attempts >= POLLING_CONFIG.MAX_ATTEMPTS) {
        throw new Error('Timeout waiting for insights completion');
      }

      await new Promise((resolve) => setTimeout(resolve, POLLING_CONFIG.INTERVAL));
    }
  }

  throw new Error('Max polling attempts reached');
};

/**
 * Lấy dữ liệu học tập từ AsyncStorage
 * Convert từ format của app sang format cho API
 */
export const getLearningData = async (): Promise<LearningData> => {
  try {
    console.log('📊 Getting learning data from AsyncStorage...');
    
    // Lấy courses và quiz results từ localStorage
    const [courses, quizResults] = await Promise.all([
      getAllCourses(),
      getAllQuizResults()
    ]);

    // Convert quiz results sang format phù hợp
    const quiz_results: QuizAnalyticsResult[] = quizResults.map(result => ({
      topic: result.courseTopic,
      subtopic: result.subtopic,
      score: result.score,
      correct_answers: result.userAnswers.filter((answer, idx) => 
        answer === result.questions[idx]?.answerIndex
      ).length,
      total_questions: result.totalQuestions,
      time_spent: result.totalQuestions * 60, // Estimate 1 min per question
      timestamp: new Date(result.completedAt).getTime(),
      passed: result.score >= 70,
      date: result.completedAt
    }));

    // Tạo learning activities từ quiz history
    const learning_activities: LearningActivity[] = quizResults.map((result, index) => ({
      id: index,
      activityType: 'quiz_taken',
      date: result.completedAt,
      topic: result.courseTopic,
      subtopic: result.subtopic,
      duration: result.totalQuestions * 60, // Estimate 1 min per question
      timestamp: new Date(result.completedAt).getTime(),
      type: 'quiz' as const
    }));

    // Tính time spent theo topic
    const time_spent: Record<string, number> = {};
    courses.forEach(course => {
      const courseQuizzes = quizResults.filter(q => q.courseId === course.id);
      const totalTime = courseQuizzes.reduce((sum, q) => sum + (q.totalQuestions * 60), 0);
      if (totalTime > 0) {
        time_spent[course.topic] = totalTime;
      }
    });

    // Lấy danh sách topics
    const current_topics = Array.from(new Set(courses.map(c => c.topic)));

    const learningData: LearningData = {
      learning_activities,
      quiz_results,
      time_spent,
      current_topics
    };

    console.log('✅ Learning data prepared:', {
      activities: learningData.learning_activities.length,
      quizzes: learningData.quiz_results.length,
      topics: learningData.current_topics.length
    });

    return learningData;
  } catch (error) {
    console.error('❌ Error getting learning data:', error);
    // Return empty data if error
    return {
      learning_activities: [],
      quiz_results: [],
      time_spent: {},
      current_topics: []
    };
  }
};

/**
 * Lấy metrics tổng quan về tiến độ học tập
 */
export const getAnalyticsOverview = async (
  learningData: LearningData
): Promise<ProgressMetrics> => {
  try {
    console.log('📊 Getting analytics overview...');
    
    const response = await apiClient.post<{ status: string; data: ProgressMetrics }>(
      '/api/analytics/overview',
      { learning_data: learningData }
    );

    if (response.status === 'success') {
      console.log('✅ Analytics overview received');
      return response.data;
    }

    throw new Error('Failed to get analytics overview');
  } catch (error) {
    console.error('❌ Error getting analytics overview:', error);
    throw error;
  }
};

/**
 * Lấy AI-driven insights về quá trình học tập (với polling)
 */
export const getAnalyticsInsights = async (
  learningData: LearningData,
  onProgress?: (status: AnalyticsJobStatus<AIInsights>) => void
): Promise<AIInsights> => {
  try {
    console.log('🤖 Getting AI insights...');
    
    // Tạo job
    const createResponse = await createInsightsJob(learningData);
    console.log('✅ Insights job created:', createResponse.job_id);

    // Poll cho đến khi hoàn thành
    const result = await pollInsightsStatus(createResponse.job_id, onProgress);

    if (result.status === 'completed' && result.result) {
      console.log('✅ AI insights received');
      return result.result;
    }

    if (result.status === 'failed') {
      throw new Error(result.error || 'Failed to get AI insights');
    }

    throw new Error('Failed to get AI insights');
  } catch (error) {
    console.error('❌ Error getting AI insights:', error);
    throw error;
  }
};

/**
 * Lấy insights chi tiết cho một topic cụ thể
 */
export const getTopicInsights = async (
  topicName: string,
  learningData: LearningData,
  onProgress?: (status: AnalyticsJobStatus<TopicInsights>) => void
): Promise<TopicInsights> => {
  try {
    console.log(`📚 Getting insights for topic: ${topicName}`);
    
    // Tạo job
    const createResponse = await apiClient.post<JobCreateResponse>(
      `/api/analytics/topic/${encodeURIComponent(topicName)}`,
      { learning_data: learningData }
    );
    console.log('✅ Topic insights job created:', createResponse.job_id);

    // Poll cho đến khi hoàn thành
    let attempts = 0;
    while (attempts < POLLING_CONFIG.MAX_ATTEMPTS) {
      try {
        const status = await apiClient.get<AnalyticsJobStatus<TopicInsights>>(
          `/api/analytics/topic/status/${createResponse.job_id}`
        );

        if (onProgress) {
          onProgress(status);
        }

        if (status.status === 'completed' && status.result) {
          console.log('✅ Topic insights received');
          return status.result;
        }

        if (status.status === 'failed') {
          throw new Error(status.error || 'Failed to get topic insights');
        }

        await new Promise((resolve) => setTimeout(resolve, POLLING_CONFIG.INTERVAL));
        attempts++;
      } catch (error) {
        attempts++;
        if (attempts >= POLLING_CONFIG.MAX_ATTEMPTS) {
          throw new Error('Timeout waiting for topic insights');
        }
        await new Promise((resolve) => setTimeout(resolve, POLLING_CONFIG.INTERVAL));
      }
    }

    throw new Error('Failed to get topic insights');
  } catch (error) {
    console.error('❌ Error getting topic insights:', error);
    throw error;
  }
};

/**
 * Tạo study plan dựa trên phân tích
 */
export const generateStudyPlan = async (
  learningData: LearningData,
  onProgress?: (status: AnalyticsJobStatus<StudyPlan>) => void
): Promise<StudyPlan> => {
  try {
    console.log('📝 Generating study plan...');
    
    // Tạo job
    const createResponse = await apiClient.post<JobCreateResponse>(
      '/api/analytics/study-plan',
      { learning_data: learningData }
    );
    console.log('✅ Study plan job created:', createResponse.job_id);

    // Poll cho đến khi hoàn thành
    let attempts = 0;
    while (attempts < POLLING_CONFIG.MAX_ATTEMPTS) {
      try {
        const status = await apiClient.get<AnalyticsJobStatus<StudyPlan>>(
          `/api/analytics/study-plan/status/${createResponse.job_id}`
        );

        if (onProgress) {
          onProgress(status);
        }

        if (status.status === 'completed' && status.result) {
          console.log('✅ Study plan received');
          return status.result;
        }

        if (status.status === 'failed') {
          throw new Error(status.error || 'Failed to generate study plan');
        }

        await new Promise((resolve) => setTimeout(resolve, POLLING_CONFIG.INTERVAL));
        attempts++;
      } catch (error) {
        attempts++;
        if (attempts >= POLLING_CONFIG.MAX_ATTEMPTS) {
          throw new Error('Timeout waiting for study plan');
        }
        await new Promise((resolve) => setTimeout(resolve, POLLING_CONFIG.INTERVAL));
      }
    }

    throw new Error('Failed to generate study plan');
  } catch (error) {
    console.error('❌ Error generating study plan:', error);
    throw error;
  }
};
