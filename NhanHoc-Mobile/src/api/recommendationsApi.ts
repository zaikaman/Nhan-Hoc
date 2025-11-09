/**
 * Recommendations API
 * API endpoints cho personalized recommendations system
 */

import apiClient from './apiClient';

export interface QuizResult {
  topic: string;
  subtopic: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  time_spent: number;
  timestamp: number;
  passed: boolean;
}

export interface LearningActivity {
  id?: number;
  activityType: string;
  topic: string;
  subtopic?: string;
  duration: number;
  timestamp: number;
  date: string;
}

export interface LearningData {
  learning_activities: LearningActivity[];
  quiz_results: QuizResult[];
  time_spent: Record<string, number>;
  current_topics: string[];
}

export interface NextTopic {
  topic: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  relevance_score: number;
  estimated_time?: string;
  prerequisites?: string[];
  benefits?: string[];
}

export interface Milestone {
  title: string;
  duration: string;
  description: string;
  topics?: string[];
  goals?: string[];
}

export interface LearningPath {
  title: string;
  description: string;
  total_duration: string;
  milestones: Milestone[];
}

export interface DifficultyAdjustment {
  current_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  recommended_difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  reason: string;
  adjustment_tips: string[];
}

export interface PerformanceMetrics {
  avg_score: number;
  total_quizzes: number;
  topics_studied: number;
  strong_topics: Array<{ topic: string; score: number }>;
  weak_topics: Array<{ topic: string; score: number }>;
  total_time_hours: number;
  topic_performance: Record<string, any>;
  recent_trend: string;
  recent_scores: number[];
}

export interface RecommendationsData {
  recommendations: {
    performance_summary: string;
    general_tips: string[];
  };
  next_topics: NextTopic[];
  learning_path: LearningPath;
  difficulty_adjustment: DifficultyAdjustment;
  performance: PerformanceMetrics;
  processing_time: number;
}

export interface RecommendationsResponse {
  status: 'success' | 'error';
  data: RecommendationsData;
  error?: string;
}

export interface JobResponse {
  job_id: string;
  status: 'pending' | 'completed' | 'failed';
  message?: string;
  result?: RecommendationsData;
  error?: string;
}

/**
 * Create recommendations job - returns job_id immediately
 */
export const createRecommendationsJob = async (
  learningData: LearningData
): Promise<string> => {
  try {
    console.log('📊 Creating recommendations job...');
    console.log('Learning data:', {
      activities: learningData.learning_activities.length,
      quizzes: learningData.quiz_results.length,
      topics: learningData.current_topics.length
    });

    const response = await apiClient.post<JobResponse>(
      '/api/recommendations/personalized',
      { learning_data: learningData },
      {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.job_id) {
      console.log('✅ Job created with ID:', response.job_id);
      return response.job_id;
    } else {
      throw new Error('Failed to create recommendations job');
    }
  } catch (error: any) {
    // console.error('❌ Error creating recommendations job:', error);
    throw error;
  }
};

/**
 * Get job status by job_id
 */
export const getJobStatus = async (jobId: string): Promise<JobResponse> => {
  try {
    const response = await apiClient.get<JobResponse>(
      `/api/recommendations/personalized/status/${jobId}`,
      {
        timeout: 10000,
      }
    );

    return response;
  } catch (error: any) {
    // console.error('❌ Error getting job status:', error);
    throw error;
  }
};

/**
 * Poll job status until completed or failed
 */
export const pollJobStatus = async (
  jobId: string,
  maxAttempts: number = 60,
  interval: number = 2000
): Promise<RecommendationsData> => {
  let attempts = 0;
  let consecutiveErrors = 0;
  const maxConsecutiveErrors = 3; // Cho phép tối đa 3 lỗi liên tiếp

  while (attempts < maxAttempts) {
    attempts++;
    console.log(`[Polling] Attempt ${attempts}/${maxAttempts} - Job ID: ${jobId}`);

    try {
      const jobData = await getJobStatus(jobId);
      console.log(`[Polling] Status: ${jobData.status}`);

      // Reset error counter on successful request
      consecutiveErrors = 0;

      if (jobData.status === 'completed' && jobData.result) {
        console.log('[Polling] ✅ Job completed!');
        return jobData.result; // RETURN IMMEDIATELY - Stop polling
      } else if (jobData.status === 'failed') {
        // console.error('[Polling] ❌ Job failed:', jobData.error);
        throw new Error(jobData.error || 'Job failed');
      }

      // Job is still pending, wait before next attempt
      console.log(`[Polling] Job still pending, waiting ${interval}ms...`);
      await new Promise(resolve => setTimeout(resolve, interval));
      
    } catch (error: any) {
      consecutiveErrors++;
      
      // Nếu lỗi là job không tồn tại và đã thử nhiều lần, dừng lại
      if (error?.message?.includes('Không tìm thấy job') || error?.statusCode === 404) {
        if (consecutiveErrors >= maxConsecutiveErrors) {
          console.log('[Polling] ⚠️ Job not found after multiple attempts, stopping...');
          throw new Error('Job không tồn tại hoặc đã bị xóa');
        }
      }
      
      // If we've exhausted all attempts, throw error
      if (attempts >= maxAttempts) {
        throw new Error('Polling timeout - job took too long to complete');
      }
      
      // Wait before retry (shorter interval for errors)
      console.log(`[Polling] ⚠️ Error occurred (${consecutiveErrors}/${maxConsecutiveErrors}), retrying in ${interval}ms...`);
      await new Promise(resolve => setTimeout(resolve, interval));
    }
  }

  throw new Error('Polling timeout - maximum attempts reached');
};

/**
 * Get personalized recommendations based on learning data
 * This function creates a job, polls for completion, and returns the result
 */
export const getPersonalizedRecommendations = async (
  learningData: LearningData
): Promise<RecommendationsData> => {
  try {
    console.log('📊 Fetching personalized recommendations...');
    
    // Step 1: Create job
    const jobId = await createRecommendationsJob(learningData);
    
    // Step 2: Poll for result
    const result = await pollJobStatus(jobId);
    
    console.log('✅ Recommendations received successfully');
    return result;
  } catch (error: any) {
    // console.error('❌ Error fetching recommendations:', error);
    throw error;
  }
};

/**
 * Get only next topics recommendations
 */
export const getNextTopics = async (
  learningData: LearningData
): Promise<NextTopic[]> => {
  try {
    const response = await apiClient.post<{ status: string; data: { next_topics: NextTopic[] } }>(
      '/api/recommendations/next-topics',
      { learning_data: learningData }
    );

    if (response.status === 'success' && response.data) {
      return response.data.next_topics;
    } else {
      throw new Error('Failed to get next topics');
    }
  } catch (error: any) {
    // console.error('❌ Error fetching next topics:', error);
    throw error;
  }
};

export default {
  getPersonalizedRecommendations,
  createRecommendationsJob,
  getJobStatus,
  pollJobStatus,
  getNextTopics,
};
