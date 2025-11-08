import { useState, useEffect } from 'react';
import {
  getUserProfile,
  getAllResources,
  getAnalyticsData,
  getAllChatConversations
} from '../utils/indexedDB';

/**
 * Custom hook để lấy tất cả context dữ liệu người dùng cho VAPI Agent
 * Tương tự như getUserData() trong ChatBot nhưng đầy đủ hơn
 */
export const useVapiContext = () => {
  const [userContext, setUserContext] = useState({
    profile: null,
    roadmaps: {},
    quizStats: {},
    resources: [],
    analytics: null,
    conversations: []
  });
  const [isContextReady, setIsContextReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadUserContext();
  }, []);

  const loadUserContext = async () => {
    try {
      console.log('📊 Bắt đầu load context cho VAPI...');
      setIsContextReady(false);

      // Load tất cả dữ liệu song song
      const [profile, resources, analytics, conversations] = await Promise.all([
        getUserProfile().catch(err => {
          console.error('Lỗi khi load profile:', err);
          return null;
        }),
        getAllResources().catch(err => {
          console.error('Lỗi khi load resources:', err);
          return [];
        }),
        getAnalyticsData().catch(err => {
          console.error('Lỗi khi load analytics:', err);
          return {
            learning_activities: [],
            quiz_results: [],
            time_spent: {},
            current_topics: []
          };
        }),
        getAllChatConversations().catch(err => {
          console.error('Lỗi khi load conversations:', err);
          return [];
        })
      ]);

      // Load từ localStorage
      const roadmaps = JSON.parse(localStorage.getItem('roadmaps')) || {};
      const quizStats = JSON.parse(localStorage.getItem('quizStats')) || {};

      const context = {
        profile,
        roadmaps,
        quizStats,
        resources,
        analytics,
        conversations: conversations.slice(0, 5) // Chỉ lấy 5 conversation gần nhất
      };

      console.log('✅ Context đã được load:', context);
      setUserContext(context);
      setIsContextReady(true);
      setError(null);

    } catch (err) {
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
