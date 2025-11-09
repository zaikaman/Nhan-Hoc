/**
 * Chat API
 * API calls cho tính năng chat với AI
 */

import type { ChatJobResponse, ChatJobStatus, ChatMessage, UserContextData } from '../types/api';
import apiClient from './apiClient';

/**
 * Tạo chat job với AI
 */
export const createChatMessage = async (
  messages: ChatMessage[],
  userData?: UserContextData
): Promise<ChatJobResponse> => {
  try {
    console.log('📤 Creating chat message job...');
    console.log('💬 Messages:', messages.length);
    console.log('👤 Has user data:', !!userData);
    console.log('📝 User data:', userData);

    const response = await apiClient.post<ChatJobResponse>('/api/chat', {
      messages,
      userData: userData, // Backend expects 'userData', not 'user_data'
    });

    console.log('✅ Chat job created:', response.job_id);
    return response;
  } catch (error) {
    console.log('⚠️ Error creating chat message:', error);
    throw error;
  }
};

/**
 * Kiểm tra trạng thái của chat job
 */
export const getChatJobStatus = async (jobId: string): Promise<ChatJobStatus> => {
  try {
    const response = await apiClient.get<ChatJobStatus>(`/api/chat/status/${jobId}`);
    return response;
  } catch (error) {
    console.log('⚠️ Error getting chat job status:', error);
    throw error;
  }
};

/**
 * Poll chat job status cho đến khi hoàn thành
 */
export const pollChatJobStatus = async (
  jobId: string,
  onProgress?: (status: ChatJobStatus) => void,
  maxAttempts: number = 120,  // Tăng từ 60 lên 120 attempts (4 phút)
  intervalMs: number = 2000
): Promise<ChatJobStatus> => {
  console.log(`🔄 Polling chat job: ${jobId}`);
  
  // Đợi lâu hơn để backend khởi tạo job (Heroku có thể chậm)
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  let lastKnownStatus: ChatJobStatus | null = null;
  let consecutiveErrors = 0;
  let initial404Count = 0;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const status = await getChatJobStatus(jobId);
      
      // Reset error counter khi thành công
      consecutiveErrors = 0;
      lastKnownStatus = status;
      
      if (onProgress) {
        onProgress(status);
      }

      if (status.status === 'completed') {
        console.log('✅ Chat job completed!');
        return status;
      }

      if (status.status === 'failed') {
        console.log('⚠️ Chat job failed:', status.error);
        throw new Error(status.error || 'Chat job failed');
      }

      console.log(`⏳ Attempt ${attempt + 1}/${maxAttempts} - Status: ${status.status}`);
      
      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    } catch (error: any) {
      consecutiveErrors++;
      
      // Xử lý 404 ở những lần đầu tiên (Heroku in-memory storage issue)
      if (error?.statusCode === 404 && attempt < 10) {
        initial404Count++;
        console.log(`⏳ Attempt ${attempt + 1}: Job chưa ready (404 count: ${initial404Count}), đợi thêm...`);
        
        // Đợi lâu hơn ở những lần đầu vì Heroku có thể chậm
        const waitTime = attempt < 3 ? 3000 : 2000;
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      
      // Nếu job biến mất sau khi đã thấy nó processing (có thể do Heroku dyno restart)
      if (error?.statusCode === 404 && lastKnownStatus && lastKnownStatus.status === 'processing') {
        console.log('⚠️ Job không tìm thấy sau khi đang processing - có thể backend restart');
        console.log('🔄 Tiếp tục đợi... (có thể mất lâu hơn)');
        
        // Nếu có quá nhiều lỗi liên tiếp (>10), mới throw error
        if (consecutiveErrors > 10) {
          throw new Error('Job bị mất sau khi bắt đầu xử lý. Backend có thể đã restart.');
        }
        
        // Đợi lâu hơn trước khi retry
        await new Promise(resolve => setTimeout(resolve, 3000));
        continue;
      }
      
      // Nếu quá nhiều 404 liên tiếp (>15) thì mới throw error
      if (error?.statusCode === 404 && consecutiveErrors > 15) {
        throw new Error('Không thể tìm thấy job trên server. Vui lòng thử lại.');
      }
      
      // Với các lỗi khác (không phải 404), throw ngay
      if (error?.statusCode !== 404) {
        throw error;
      }
      
      // Tiếp tục retry với 404
      console.log(`⏳ Retrying... (consecutive errors: ${consecutiveErrors})`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  throw new Error('Chat job timed out - Backend có thể đang quá tải. Vui lòng thử lại.');
};

/**
 * Send message và đợi response (dùng async job pattern như roadmap/quiz)
 */
export const sendMessageAndWait = async (
  messages: ChatMessage[],
  userData?: UserContextData,
  onProgress?: (status: ChatJobStatus) => void
): Promise<string> => {
  try {
    console.log('📤 Creating chat job...');
    console.log('💬 Messages:', messages.length);
    console.log('👤 Has user data:', !!userData);

    // Tạo chat job
    const jobResponse = await createChatMessage(messages, userData);
    console.log('✅ Chat job created:', jobResponse.job_id);

    // Poll job status cho đến khi hoàn thành
    // Sử dụng thông số phù hợp với Heroku (in-memory storage có thể bị mất)
    const finalStatus = await pollChatJobStatus(
      jobResponse.job_id,
      onProgress,
      120,  // maxAttempts - tăng lên 120 (4 phút) để xử lý Heroku cold start
      2000 // intervalMs - 2 giây mỗi lần
    );

    if (!finalStatus.result) {
      throw new Error('Không nhận được phản hồi từ AI. Vui lòng thử lại.');
    }

    console.log('✅ Chat completed!');
    return finalStatus.result;
  } catch (error) {
    console.log('⚠️ Error in sendMessageAndWait:', error);
    throw error;
  }
};
