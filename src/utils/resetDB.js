// Utility để reset IndexedDB - chỉ dùng khi cần thiết

export const resetDatabase = () => {
  return new Promise((resolve, reject) => {
    console.log('🗑️ Đang xóa database cũ...');
    
    const deleteRequest = indexedDB.deleteDatabase('AILearningPlatformDB');
    
    deleteRequest.onsuccess = () => {
      console.log('✅ Đã xóa database thành công');
      console.log('🔄 Vui lòng refresh trang để tạo database mới');
      resolve(true);
    };
    
    deleteRequest.onerror = (event) => {
      console.error('❌ Lỗi khi xóa database:', event);
      reject(event);
    };
    
    deleteRequest.onblocked = () => {
      console.warn('⚠️ Database bị chặn. Hãy đóng tất cả các tab khác của website.');
      alert('Vui lòng đóng tất cả các tab khác của website này và thử lại!');
    };
  });
};

// Chạy trong console: 
// import { resetDatabase } from './utils/resetDB'; resetDatabase().then(() => window.location.reload());
