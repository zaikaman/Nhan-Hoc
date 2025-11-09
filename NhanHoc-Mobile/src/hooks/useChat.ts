/**
 * useChat Hook
 * Hook để quản lý chat với AI
 * Implement polling logic giống web version
 */

import { useState } from 'react';
import { createChatMessage, getChatJobStatus } from '../api/chatApi';
import type { ChatJobStatus, ChatMessage, UserContextData } from '../types/api';

export const useChat = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pollingStatus, setPollingStatus] = useState<string>('');

  /**
   * Poll job status với logic giống web version
   * Xử lý 404 errors và retry logic cho Heroku
   */
  const pollJobStatus = async (
    jobId: string,
    onProgress?: (status: ChatJobStatus) => void
  ): Promise<string> => {
    const maxAttempts = 120; // 4 phút
    const interval = 2000; // 2 giây
    let attempts = 0;
    let initial404Count = 0;

    // Đợi trước khi bắt đầu poll (Heroku cần thời gian)
    console.log('[Chat Polling] Đợi backend khởi tạo job...');
    await new Promise(resolve => setTimeout(resolve, 1500));

    while (attempts < maxAttempts) {
      try {
        attempts++;
        console.log(`[Chat Polling] Lần thử ${attempts}/${maxAttempts} - Job ID: ${jobId}`);
        // Không cập nhật pollingStatus ở đây nữa - giữ "Đang trả lời..." cố định

        const status = await getChatJobStatus(jobId);
        
        if (onProgress) {
          onProgress(status);
        }

        console.log(`[Chat Polling] Trạng thái: ${status.status}`);

        if (status.status === 'completed') {
          console.log('[Chat Polling] ✅ Hoàn thành!');
          if (!status.result) {
            throw new Error('Không nhận được phản hồi từ AI');
          }
          return status.result;
        }

        if (status.status === 'failed') {
          console.log('[Chat Polling] ⚠️ Lỗi:', status.error);
          throw new Error(status.error || 'AI xử lý thất bại');
        }

        // Status là 'pending' hoặc 'processing', tiếp tục polling
        await new Promise(resolve => setTimeout(resolve, interval));

      } catch (err: any) {
        // Xử lý 404 - job chưa được tìm thấy (Heroku in-memory storage issue)
        if (err?.statusCode === 404) {
          initial404Count++;
          
          // Cho phép nhiều 404 ở đầu (Heroku cold start)
          if (attempts < 10) {
            console.log(`⏳ Job chưa ready (404 count: ${initial404Count}/${attempts})`);
            const waitTime = attempts < 3 ? 3000 : 2000;
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue;
          }
          
          // Sau 15 lần liên tiếp 404, throw error
          if (initial404Count > 15) {
            throw new Error('Không thể kết nối đến AI. Vui lòng thử lại sau.');
          }
          
          // Tiếp tục retry
          console.log(`🔄 Retry sau lỗi 404 (attempt ${attempts})`);
          await new Promise(resolve => setTimeout(resolve, 2000));
          continue;
        }

        // Lỗi khác không phải 404
        console.log('[Chat Polling] ⚠️ Lỗi:', err);
        
        // Nếu chưa đến max attempts, retry
        if (attempts < maxAttempts) {
          console.log(`🔄 Retry sau lỗi (attempt ${attempts})`);
          await new Promise(resolve => setTimeout(resolve, 2000));
          continue;
        }
        
        // Đã hết attempts
        throw err;
      }
    }

    throw new Error('AI đang quá tải. Vui lòng thử lại sau.');
  };

  /**
   * Send message và đợi AI response
   * Main function được component sử dụng
   */
  const sendMessage = async (
    messages: ChatMessage[],
    userData?: UserContextData,
    onProgress?: (status: ChatJobStatus) => void
  ): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    setPollingStatus('Đang trả lời...');

    try {
      // Bước 1: Tạo chat job
      console.log('[Chat Hook] 📤 Tạo chat job...');
      const jobResponse = await createChatMessage(messages, userData);
      const jobId = jobResponse.job_id;
      
      console.log('[Chat Hook] ✅ Job đã tạo:', jobId);
      // Giữ status "Đang trả lời..." trong suốt quá trình

      // Bước 2: Poll job status
      const result = await pollJobStatus(jobId, onProgress);

      setIsLoading(false);
      setPollingStatus('');
      return result;

    } catch (err: any) {
      console.log('[Chat Hook] ⚠️ Error:', err);
      // Chỉ log vào console, không hiển thị error message trên UI
      setIsLoading(false);
      setPollingStatus('');
      // Trả về null để component xử lý (hiển thị error message nhẹ nhàng hơn)
      return null;
    }
  };

  return {
    sendMessage,
    isLoading,
    error,
    pollingStatus, // Trạng thái polling để hiển thị cho user
  };
};
