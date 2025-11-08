import React, { useState, useEffect } from 'react';
import { hasUserProfile, saveUserProfile } from './utils/indexedDB';
import { usePendingActivities } from './hooks/usePageTracking';
import WelcomeModal from './components/welcomeModal/welcomeModal';
import Loader from './components/loader/loader';
import VapiWidget from './components/vapiWidget/vapiWidget';

const AppWrapper = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);

  // Xử lý pending activities từ localStorage
  usePendingActivities();

  useEffect(() => {
    checkUserProfile();
  }, []);

  const checkUserProfile = async () => {
    try {
      console.log('🔍 Đang kiểm tra user profile...');
      const hasProfile = await hasUserProfile();
      console.log('✅ Kết quả kiểm tra user profile:', hasProfile);
      setShowWelcome(!hasProfile);
      setLoading(false);
    } catch (error) {
      console.error('❌ Lỗi khi kiểm tra user profile:', error);
      setShowWelcome(false); // Nếu có lỗi, không hiển thị modal
      setLoading(false);
    }
  };

  const handleWelcomeSubmit = async (username) => {
    try {
      console.log('💾 Đang lưu user profile:', username);
      await saveUserProfile({ username });
      console.log('✅ Đã lưu user profile thành công');
      setShowWelcome(false);
      // Reload lại để kiểm tra
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error('❌ Lỗi khi lưu user profile:', error);
      alert('Có lỗi xảy ra. Vui lòng thử lại!');
    }
  };

  if (loading) {
    return <Loader>Đang tải...</Loader>;
  }

  return (
    <>
      {showWelcome && <WelcomeModal onSubmit={handleWelcomeSubmit} />}
      {children}
      {/* VAPI Voice Agent Widget - Hiển thị trên toàn bộ app */}
      <VapiWidget />
    </>
  );
};

export default AppWrapper;
