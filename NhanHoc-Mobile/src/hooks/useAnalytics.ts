/**
 * useAnalytics Hook
 * Custom hook để quản lý analytics và AI insights
 */

import { useCallback, useState } from 'react';
import {
    AIInsights,
    generateStudyPlan,
    getAnalyticsInsights,
    getAnalyticsOverview,
    getTopicInsights,
    ProgressMetrics,
    StudyPlan,
    TopicInsights,
} from '../api/analyticsApi';
import { getLearningDataForAnalytics } from '../services/localStorage';

export const useAnalytics = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Lấy metrics tổng quan
   */
  const fetchOverview = useCallback(async (): Promise<ProgressMetrics | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const learningData = await getLearningDataForAnalytics();
      const metrics = await getAnalyticsOverview(learningData);
      
      return metrics;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error fetching analytics overview:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Lấy AI insights
   */
  const fetchInsights = useCallback(async (): Promise<AIInsights | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const learningData = await getLearningDataForAnalytics();
      const insights = await getAnalyticsInsights(learningData);
      
      return insights;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error fetching AI insights:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Lấy insights cho một topic cụ thể
   */
  const fetchTopicInsights = useCallback(async (topicName: string): Promise<TopicInsights | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const learningData = await getLearningDataForAnalytics();
      const insights = await getTopicInsights(topicName, learningData);
      
      return insights;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error fetching topic insights:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Tạo study plan
   */
  const createStudyPlan = useCallback(async (): Promise<StudyPlan | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const learningData = await getLearningDataForAnalytics();
      const plan = await generateStudyPlan(learningData);
      
      return plan;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error generating study plan:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    fetchOverview,
    fetchInsights,
    fetchTopicInsights,
    createStudyPlan,
  };
};
