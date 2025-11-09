/**
 * useRoadmap Hook
 * Custom hook để tương tác với Roadmap API
 */

import { useCallback, useState } from 'react';
import {
    createAndWaitRoadmap,
    createRoadmap,
    getRoadmapStatus
} from '../api/roadmapApi';
import {
    ApiException,
    RoadmapJobStatus,
    RoadmapRequest,
} from '../types/api';

interface UseRoadmapReturn {
  // State
  loading: boolean;
  error: string | null;
  jobId: string | null;
  status: RoadmapJobStatus | null;
  
  // Actions
  create: (data: RoadmapRequest) => Promise<string | null>;
  checkStatus: (jobId: string) => Promise<RoadmapJobStatus | null>;
  createAndWait: (data: RoadmapRequest) => Promise<RoadmapJobStatus | null>;
  reset: () => void;
}

export const useRoadmap = (): UseRoadmapReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<RoadmapJobStatus | null>(null);

  /**
   * Tạo roadmap mới
   */
  const create = useCallback(async (data: RoadmapRequest): Promise<string | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await createRoadmap(data);
      setJobId(response.job_id);

      return response.job_id;
    } catch (err) {
      const errorMessage = err instanceof ApiException 
        ? err.message 
        : 'Failed to create roadmap';
      setError(errorMessage);
      // Error is already logged in apiClient if ENABLE_API_LOGS is true
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Kiểm tra trạng thái roadmap
   */
  const checkStatus = useCallback(async (jobId: string): Promise<RoadmapJobStatus | null> => {
    try {
      setLoading(true);
      setError(null);

      const statusData = await getRoadmapStatus(jobId);
      setStatus(statusData);
      setJobId(jobId);

      return statusData;
    } catch (err) {
      const errorMessage = err instanceof ApiException 
        ? err.message 
        : 'Failed to check roadmap status';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Tạo và chờ roadmap hoàn thành
   */
  const createAndWait = useCallback(async (data: RoadmapRequest): Promise<RoadmapJobStatus | null> => {
    try {
      setLoading(true);
      setError(null);

      const result = await createAndWaitRoadmap(data, (progressStatus) => {
        setStatus(progressStatus);
        setJobId(progressStatus.job_id);
      });

      setStatus(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof ApiException 
        ? err.message 
        : 'Failed to create and wait for roadmap';
      setError(errorMessage);
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

export default useRoadmap;
