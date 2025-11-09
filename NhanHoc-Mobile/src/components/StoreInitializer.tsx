/**
 * Component để khởi tạo stores khi app start
 * Đặt component này ở root level của app
 */

import React, { useEffect } from 'react';
import { useInitializeStores } from '../hooks/useInitializeStores';

interface StoreInitializerProps {
  children: React.ReactNode;
}

export const StoreInitializer: React.FC<StoreInitializerProps> = ({ children }) => {
  const { isInitialized, error } = useInitializeStores();

  useEffect(() => {
    if (error) {
      console.error('Store initialization error:', error);
    }
  }, [error]);

  // Render children ngay lập tức, không cần đợi initialization
  // Vì stores đã có persistence middleware, data sẽ được restore từ AsyncStorage
  return <>{children}</>;
};
