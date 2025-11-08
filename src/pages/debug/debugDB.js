import React, { useState, useEffect } from 'react';
import { getUserProfile, saveUserProfile, hasUserProfile } from '../../utils/indexedDB';
import './debugDB.css';

const DebugDBPage = () => {
  const [profile, setProfile] = useState(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [testName, setTestName] = useState('');
  const [logs, setLogs] = useState([]);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { message, type, timestamp }]);
  };

  const checkProfile = async () => {
    try {
      addLog('Đang kiểm tra profile...', 'info');
      const has = await hasUserProfile();
      setHasProfile(has);
      addLog(`Kết quả: ${has ? 'Có profile' : 'Chưa có profile'}`, 'success');
      
      if (has) {
        const prof = await getUserProfile();
        setProfile(prof);
        addLog(`Profile: ${JSON.stringify(prof)}`, 'success');
      }
    } catch (error) {
      addLog(`Lỗi: ${error.message}`, 'error');
    }
  };

  const saveProfile = async () => {
    try {
      addLog(`Đang lưu profile: ${testName}`, 'info');
      await saveUserProfile({ username: testName });
      addLog('Lưu thành công!', 'success');
      await checkProfile();
    } catch (error) {
      addLog(`Lỗi khi lưu: ${error.message}`, 'error');
    }
  };

  const clearDB = () => {
    addLog('Đang xóa database...', 'info');
    indexedDB.deleteDatabase('AILearningPlatformDB');
    addLog('Database đã được xóa! Hãy reload trang.', 'success');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  useEffect(() => {
    checkProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="debug-page">
      <h1>🔧 Debug IndexedDB</h1>
      
      <div className="debug-section">
        <h2>Trạng thái hiện tại</h2>
        <p><strong>Có profile:</strong> {hasProfile ? '✅ Có' : '❌ Không'}</p>
        {profile && (
          <div className="profile-info">
            <p><strong>Username:</strong> {profile.username}</p>
            <p><strong>Avatar Type:</strong> {profile.avatarType}</p>
            <p><strong>Created:</strong> {new Date(profile.createdAt).toLocaleString()}</p>
            <p><strong>Updated:</strong> {new Date(profile.updatedAt).toLocaleString()}</p>
          </div>
        )}
      </div>

      <div className="debug-section">
        <h2>Test thêm profile</h2>
        <input
          type="text"
          value={testName}
          onChange={(e) => setTestName(e.target.value)}
          placeholder="Nhập tên test..."
        />
        <button onClick={saveProfile} disabled={!testName}>
          💾 Lưu Profile
        </button>
      </div>

      <div className="debug-section">
        <h2>Actions</h2>
        <button onClick={checkProfile}>🔄 Refresh</button>
        <button onClick={clearDB} className="danger">
          🗑️ Xóa toàn bộ Database
        </button>
      </div>

      <div className="debug-section">
        <h2>Console Logs</h2>
        <div className="logs">
          {logs.map((log, index) => (
            <div key={index} className={`log-entry log-${log.type}`}>
              <span className="log-time">{log.timestamp}</span>
              <span className="log-message">{log.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DebugDBPage;
