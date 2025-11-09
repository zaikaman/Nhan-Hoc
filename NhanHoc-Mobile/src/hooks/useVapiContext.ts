/**
 * Hook cung cấp context dữ liệu người dùng cho VAPI Agent
 * Tương tự như useVapiContext trong web app
 */

import { useEffect, useState } from 'react';
import * as localStorage from '../services/localStorage';

export interface UserContext {
  profile: any;
  analytics: any;
  resources: any[];
  conversations: any[];
}

export const useVapiContext = () => {
  const [userContext, setUserContext] = useState<UserContext>({
    profile: null,
    analytics: null,
    resources: [],
    conversations: []
  });
  const [isContextReady, setIsContextReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUserContext();
  }, []);

  const loadUserContext = async () => {
    try {
      console.log('📊 Bắt đầu load context cho VAPI...');
      setIsContextReady(false);

      // Load tất cả dữ liệu song song
      const [analytics, conversations, courses] = await Promise.all([
        localStorage.getUserContextData().catch((err: any) => {
          console.error('Lỗi khi load analytics:', err);
          return null;
        }),
        localStorage.getAllChatConversations().catch((err: any) => {
          console.error('Lỗi khi load conversations:', err);
          return [];
        }),
        localStorage.getAllCourses().catch((err: any) => {
          console.error('Lỗi khi load courses:', err);
          return [];
        })
      ]);

      const context = {
        profile: null, // Có thể thêm profile sau nếu cần
        analytics,
        resources: courses || [],
        conversations: (conversations || []).slice(0, 5) // Chỉ lấy 5 conversation gần nhất
      };

      console.log('✅ Context đã được load:', context);
      setUserContext(context);
      setIsContextReady(true);
      setError(null);

    } catch (err: any) {
      console.error('❌ Lỗi khi load user context:', err);
      setError(err.message);
      setIsContextReady(true); // Vẫn cho phép sử dụng dù có lỗi
    }
  };

  // Refresh context khi cần
  const refreshContext = () => {
    loadUserContext();
  };

  return {
    userContext,
    isContextReady,
    error,
    refreshContext
  };
};
