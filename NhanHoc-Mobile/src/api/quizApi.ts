/**
 * Quiz API Service
 * Xử lý các API calls liên quan đến quiz generation
 */

import {
    JobCreateResponse,
    QuizJobStatus,
    QuizRequest,
} from '../types/api';
import apiClient from './apiClient';

const QUIZ_ENDPOINTS = {
  CREATE: '/api/quiz',
  STATUS: (jobId: string) => `/api/quiz/status/${jobId}`,
};

/**
 * Tạo quiz mới
 */
export const createQuiz = async (
  data: QuizRequest
): Promise<JobCreateResponse> => {
  return apiClient.post<JobCreateResponse>(QUIZ_ENDPOINTS.CREATE, data);
};

/**
 * Kiểm tra trạng thái quiz job
 */
export const getQuizStatus = async (
  jobId: string
): Promise<QuizJobStatus> => {
  return apiClient.get<QuizJobStatus>(QUIZ_ENDPOINTS.STATUS(jobId));
};

/**
 * Poll quiz status cho đến khi hoàn thành
 * @param jobId Job ID
 * @param onProgress Callback khi có progress
 * @param maxAttempts Số lần thử tối đa (default: 60)
 * @param interval Khoảng thời gian giữa các lần check (ms, default: 2000)
 */
export const pollQuizStatus = async (
  jobId: string,
  onProgress?: (status: QuizJobStatus) => void,
  maxAttempts: number = 60,
  interval: number = 2000
): Promise<QuizJobStatus> => {
  let attempts = 0;

  while (attempts < maxAttempts) {
    try {
      const status = await getQuizStatus(jobId);

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
        throw new Error('Timeout waiting for quiz completion');
      }

      // Chờ trước khi retry
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
  }

  throw new Error('Max polling attempts reached');
};

/**
 * Tạo quiz và chờ kết quả
 * Hàm tiện ích kết hợp create và poll
 */
export const createAndWaitQuiz = async (
  data: QuizRequest,
  onProgress?: (status: QuizJobStatus) => void
): Promise<QuizJobStatus> => {
  // Tạo job
  const createResponse = await createQuiz(data);

  // Poll cho đến khi hoàn thành
  const result = await pollQuizStatus(
    createResponse.job_id,
    onProgress
  );

  return result;
};

export default {
  createQuiz,
  getQuizStatus,
  pollQuizStatus,
  createAndWaitQuiz,
};
