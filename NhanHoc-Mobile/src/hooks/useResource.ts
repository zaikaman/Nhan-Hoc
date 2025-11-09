/**
 * useResource Hook
 * Custom hook để tương tác với Resource API
 */

import { useCallback, useState } from 'react';
import {
    createAndWaitResource,
    createResource,
    getResourceStatus
} from '../api/resourceApi';
import {
    ApiException,
    ResourceJobStatus,
    ResourceRequest,
} from '../types/api';

interface UseResourceReturn {
  // State
  loading: boolean;
  error: string | null;
  jobId: string | null;
  status: ResourceJobStatus | null;
  
  // Actions
  create: (data: ResourceRequest) => Promise<string | null>;
  checkStatus: (jobId: string) => Promise<ResourceJobStatus | null>;
  createAndWait: (data: ResourceRequest) => Promise<ResourceJobStatus | null>;
  reset: () => void;
}

export const useResource = (): UseResourceReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<ResourceJobStatus | null>(null);

  /**
   * Tạo resource mới
   */
  const create = useCallback(async (data: ResourceRequest): Promise<string | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await createResource(data);
      setJobId(response.job_id);

      return response.job_id;
    } catch (err) {
      const errorMessage = err instanceof ApiException 
        ? err.message 
        : 'Failed to create resource';
      setError(errorMessage);
      // Error already logged in apiClient
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Kiểm tra trạng thái resource
   */
  const checkStatus = useCallback(async (jobId: string): Promise<ResourceJobStatus | null> => {
    try {
      setLoading(true);
      setError(null);

      const statusData = await getResourceStatus(jobId);
      setStatus(statusData);
      setJobId(jobId);

      return statusData;
    } catch (err) {
      const errorMessage = err instanceof ApiException 
        ? err.message 
        : 'Failed to check resource status';
      setError(errorMessage);
      // Error already logged in apiClient
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Tạo và chờ resource hoàn thành
   */
  const createAndWait = useCallback(async (data: ResourceRequest): Promise<ResourceJobStatus | null> => {
    try {
      setLoading(true);
      setError(null);

      const result = await createAndWaitResource(data, (progressStatus) => {
        setStatus(progressStatus);
        setJobId(progressStatus.job_id);
      });

      setStatus(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof ApiException 
        ? err.message 
        : 'Failed to create and wait for resource';
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

export default useResource;
