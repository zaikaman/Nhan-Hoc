import { useEffect, useRef } from 'react';
import { saveLearningActivity } from '../utils/indexedDB';

/**
 * Custom hook để tracking thời gian người dùng ở trên một trang
 * @param {string} topic - Chủ đề
 * @param {string} subtopic - Chủ đề con
 * @param {string} activityType - Loại hoạt động
 * @param {number} autoSaveInterval - Khoảng thời gian tự động lưu (ms), mặc định 60000 (60s)
 * @param {number} minDuration - Thời gian tối thiểu để lưu (s), mặc định 3s
 */
export const usePageTracking = (
  topic, 
  subtopic, 
  activityType, 
  autoSaveInterval = 60000,
  minDuration = 3
) => {
  const sessionStartTimeRef = useRef(null);
  const lastSaveTimeRef = useRef(null);

  useEffect(() => {
    // Khởi tạo thời gian bắt đầu
    sessionStartTimeRef.current = Date.now();
    lastSaveTimeRef.current = Date.now();

    // Hàm lưu dữ liệu tracking
    const saveTracking = async (duration) => {
      if (duration >= minDuration) {
        try {
          await saveLearningActivity({
            topic,
            subtopic,
            activityType,
            duration,
          });
          console.log(`✅ [${activityType}] Đã lưu ${duration}s - ${subtopic}`);
          return true;
        } catch (error) {
          console.error(`❌ Lỗi khi lưu ${activityType} analytics:`, error);
          return false;
        }
      }
      return false;
    };

    // Auto-save định kỳ
    const saveInterval = setInterval(async () => {
      if (lastSaveTimeRef.current) {
        const duration = Math.round((Date.now() - lastSaveTimeRef.current) / 1000);
        const saved = await saveTracking(duration);
        if (saved) {
          // Reset thời gian để đếm tiếp
          lastSaveTimeRef.current = Date.now();
        }
      }
    }, autoSaveInterval);

    // Lưu khi người dùng thoát trang
    const handleBeforeUnload = () => {
      if (lastSaveTimeRef.current) {
        const duration = Math.round((Date.now() - lastSaveTimeRef.current) / 1000);
        // Sử dụng sendBeacon để đảm bảo request được gửi khi thoát trang
        if (duration >= minDuration) {
          // Lưu đồng bộ vì đang thoát trang
          const data = {
            topic,
            subtopic,
            activityType,
            duration,
            timestamp: new Date().toISOString(),
            date: new Date().toISOString().split('T')[0],
          };
          
          // Lưu vào localStorage tạm thời
          const pendingActivities = JSON.parse(localStorage.getItem('pendingActivities') || '[]');
          pendingActivities.push(data);
          localStorage.setItem('pendingActivities', JSON.stringify(pendingActivities));
        }
      }
    };

    // Lưu khi tab bị ẩn (chuyển tab, minimize, v.v.)
    const handleVisibilityChange = async () => {
      if (document.hidden && lastSaveTimeRef.current) {
        const duration = Math.round((Date.now() - lastSaveTimeRef.current) / 1000);
        const saved = await saveTracking(duration);
        if (saved) {
          lastSaveTimeRef.current = Date.now();
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      clearInterval(saveInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      // Lưu lần cuối khi unmount
      if (lastSaveTimeRef.current) {
        const duration = Math.round((Date.now() - lastSaveTimeRef.current) / 1000);
        saveTracking(duration);
      }
    };
  }, [topic, subtopic, activityType, autoSaveInterval, minDuration]);

  // Trả về hàm để manually save nếu cần
  return {
    manualSave: async () => {
      if (lastSaveTimeRef.current) {
        const duration = Math.round((Date.now() - lastSaveTimeRef.current) / 1000);
        const saved = await saveLearningActivity({
          topic,
          subtopic,
          activityType,
          duration,
        });
        if (saved) {
          lastSaveTimeRef.current = Date.now();
        }
        return saved;
      }
      return false;
    }
  };
};

/**
 * Hook để xử lý các activity đang pending từ localStorage
 * Gọi ở component App hoặc component root
 */
export const usePendingActivities = () => {
  useEffect(() => {
    const processPendingActivities = async () => {
      try {
        const pendingActivities = JSON.parse(localStorage.getItem('pendingActivities') || '[]');
        
        if (pendingActivities.length > 0) {
          console.log(`📝 Đang xử lý ${pendingActivities.length} pending activities...`);
          
          for (const activity of pendingActivities) {
            try {
              await saveLearningActivity(activity);
              console.log(`✅ Đã lưu pending activity: ${activity.activityType} - ${activity.duration}s`);
            } catch (error) {
              console.error('❌ Lỗi khi lưu pending activity:', error);
            }
          }
          
          // Xóa pending activities sau khi lưu
          localStorage.removeItem('pendingActivities');
          console.log('✅ Đã xử lý xong tất cả pending activities');
        }
      } catch (error) {
        console.error('❌ Lỗi khi xử lý pending activities:', error);
      }
    };

    // Xử lý ngay khi mount
    processPendingActivities();
    
    // Xử lý định kỳ mỗi 30 giây
    const interval = setInterval(processPendingActivities, 30000);
    
    return () => clearInterval(interval);
  }, []);
};
