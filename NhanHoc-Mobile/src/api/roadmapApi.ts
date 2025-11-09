/**
 * Roadmap API Service
 * Xử lý các API calls liên quan đến roadmap/learning path
 */

import {
    JobCreateResponse,
    RoadmapJobStatus,
    RoadmapRequest,
} from '../types/api';
import apiClient from './apiClient';

const ROADMAP_ENDPOINTS = {
  CREATE: '/api/roadmap',
  STATUS: (jobId: string) => `/api/roadmap/status/${jobId}`,
};

/**
 * Tạo roadmap mới
 */
export const createRoadmap = async (
  data: RoadmapRequest
): Promise<JobCreateResponse> => {
  return apiClient.post<JobCreateResponse>(ROADMAP_ENDPOINTS.CREATE, data);
};

/**
 * Kiểm tra trạng thái roadmap job
 */
export const getRoadmapStatus = async (
  jobId: string
): Promise<RoadmapJobStatus> => {
  return apiClient.get<RoadmapJobStatus>(ROADMAP_ENDPOINTS.STATUS(jobId));
};

/**
 * Poll roadmap status cho đến khi hoàn thành
 * @param jobId Job ID
 * @param onProgress Callback khi có progress
 * @param maxAttempts Số lần thử tối đa (default: 60)
 * @param interval Khoảng thời gian giữa các lần check (ms, default: 2000)
 */
export const pollRoadmapStatus = async (
  jobId: string,
  onProgress?: (status: RoadmapJobStatus) => void,
  maxAttempts: number = 60,
  interval: number = 2000
): Promise<RoadmapJobStatus> => {
  let attempts = 0;

  while (attempts < maxAttempts) {
    try {
      const status = await getRoadmapStatus(jobId);

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
        throw new Error('Timeout waiting for roadmap completion');
      }

      // Chờ trước khi retry
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
  }

  throw new Error('Max polling attempts reached');
};

/**
 * Tạo roadmap và chờ kết quả
 * Hàm tiện ích kết hợp create và poll
 */
export const createAndWaitRoadmap = async (
  data: RoadmapRequest,
  onProgress?: (status: RoadmapJobStatus) => void
): Promise<RoadmapJobStatus> => {
  // Tạo job
  const createResponse = await createRoadmap(data);

  // Poll cho đến khi hoàn thành
  const result = await pollRoadmapStatus(
    createResponse.job_id,
    onProgress
  );

  return result;
};

export default {
  createRoadmap,
  getRoadmapStatus,
  pollRoadmapStatus,
  createAndWaitRoadmap,
};
