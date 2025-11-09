/**
 * useQuiz Hook
 * Custom hook để tương tác với Quiz API
 */

import { useCallback, useState } from 'react';
import {
    createAndWaitQuiz,
    createQuiz,
    getQuizStatus
} from '../api/quizApi';
import {
    ApiException,
    QuizJobStatus,
    QuizRequest,
} from '../types/api';

interface UseQuizReturn {
  // State
  loading: boolean;
  error: string | null;
  jobId: string | null;
  status: QuizJobStatus | null;
  
  // Actions
  create: (data: QuizRequest) => Promise<string | null>;
  checkStatus: (jobId: string) => Promise<QuizJobStatus | null>;
  createAndWait: (data: QuizRequest) => Promise<QuizJobStatus | null>;
  reset: () => void;
}

export const useQuiz = (): UseQuizReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<QuizJobStatus | null>(null);

  /**
   * Tạo quiz mới
   */
  const create = useCallback(async (data: QuizRequest): Promise<string | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await createQuiz(data);
      setJobId(response.job_id);

      return response.job_id;
    } catch (err) {
      const errorMessage = err instanceof ApiException 
        ? err.message 
        : 'Failed to create quiz';
      setError(errorMessage);
      // Error already logged in apiClient
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Kiểm tra trạng thái quiz
   */
  const checkStatus = useCallback(async (jobId: string): Promise<QuizJobStatus | null> => {
    try {
      setLoading(true);
      setError(null);

      const statusData = await getQuizStatus(jobId);
      setStatus(statusData);
      setJobId(jobId);

      return statusData;
    } catch (err) {
      const errorMessage = err instanceof ApiException 
        ? err.message 
        : 'Failed to check quiz status';
      setError(errorMessage);
      // Error already logged in apiClient
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Tạo và chờ quiz hoàn thành
   */
  const createAndWait = useCallback(async (data: QuizRequest): Promise<QuizJobStatus | null> => {
    try {
      setLoading(true);
      setError(null);

      const result = await createAndWaitQuiz(data, (progressStatus) => {
        setStatus(progressStatus);
        setJobId(progressStatus.job_id);
      });

      setStatus(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof ApiException 
        ? err.message 
        : 'Failed to create and wait for quiz';
      setError(errorMessage);
      // Error already logged in apiClient
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setJobId(null);
    setStatus(null);
  }, []);

  return {
    loading,
    error,
    jobId,
    status,
    create,
    checkStatus,
    createAndWait,
    reset,
  };
};

export default useQuiz;
