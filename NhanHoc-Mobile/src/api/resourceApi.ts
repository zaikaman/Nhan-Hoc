/**
 * Resource API Service
 * Xử lý các API calls liên quan đến resource generation
 */

import {
    JobCreateResponse,
    ResourceJobStatus,
    ResourceRequest,
} from '../types/api';
import apiClient from './apiClient';

const RESOURCE_ENDPOINTS = {
  CREATE: '/api/generate-resource',
  STATUS: (jobId: string) => `/api/generate-resource/status/${jobId}`,
};

/**
 * Tạo resource mới
 */
export const createResource = async (
  data: ResourceRequest
): Promise<JobCreateResponse> => {
  return apiClient.post<JobCreateResponse>(RESOURCE_ENDPOINTS.CREATE, data);
};

/**
 * Kiểm tra trạng thái resource job
 */
export const getResourceStatus = async (
  jobId: string
): Promise<ResourceJobStatus> => {
  return apiClient.get<ResourceJobStatus>(RESOURCE_ENDPOINTS.STATUS(jobId));
};

/**
 * Poll resource status cho đến khi hoàn thành
 * @param jobId Job ID
 * @param onProgress Callback khi có progress
 * @param maxAttempts Số lần thử tối đa (default: 60)
 * @param interval Khoảng thời gian giữa các lần check (ms, default: 2000)
 */
export const pollResourceStatus = async (
  jobId: string,
  onProgress?: (status: ResourceJobStatus) => void,
  maxAttempts: number = 60,
  interval: number = 2000
): Promise<ResourceJobStatus> => {
  let attempts = 0;

  while (attempts < maxAttempts) {
    try {
      const status = await getResourceStatus(jobId);

      // Gọi callback nếu có
      if (onProgress) {
        onProgress(status);
      }

      // Nếu đã hoàn thành hoặc failed, return ngay
      if (status.status === 'completed' || status.status === 'failed') {
        return status;
      }

      // Chờ trước khi check lại
      await new Promise((resolve) => setTimeout(resolve, interval));
      attempts++;
    } catch (error) {
      // Silently retry on error (common during job processing)
      attempts++;

      // Nếu đã hết số lần thử, throw error
      if (attempts >= maxAttempts) {
        throw new Error('Timeout waiting for resource completion');
      }

      // Chờ trước khi retry
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
  }

  throw new Error('Max polling attempts reached');
};

/**
 * Tạo resource và chờ kết quả
 * Hàm tiện ích kết hợp create và poll
 */
export const createAndWaitResource = async (
  data: ResourceRequest,
  onProgress?: (status: ResourceJobStatus) => void
): Promise<ResourceJobStatus> => {
  // Tạo job
  const createResponse = await createResource(data);

  // Poll cho đến khi hoàn thành
  const result = await pollResourceStatus(
    createResponse.job_id,
    onProgress
  );

  return result;
};

export default {
  createResource,
  getResourceStatus,
  pollResourceStatus,
  createAndWaitResource,
};
