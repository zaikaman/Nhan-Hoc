import React, { useState, useEffect } from 'react';
import { 
  getAllLearningActivities, 
  getAllQuizResults,
  calculateTimeSpentByTopic,
  getAnalyticsData 
} from '../../utils/indexedDB';
import Header from '../../components/header/header';
import './trackingDebug.css';

const TrackingDebugPage = () => {
  const [activities, setActivities] = useState([]);
  const [quizResults, setQuizResults] = useState([]);
  const [timeSpent, setTimeSpent] = useState({});
  const [analyticsData, setAnalyticsData] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const loadData = async () => {
    try {
      const [acts, quizzes, time, analytics] = await Promise.all([
        getAllLearningActivities(),
        getAllQuizResults(),
        calculateTimeSpentByTopic(),
        getAnalyticsData()
      ]);

      setActivities(acts);
      setQuizResults(quizzes);
      setTimeSpent(time);
      setAnalyticsData(analytics);
      
      console.log('🔄 Đã refresh data:', {
        activities: acts.length,
        quizzes: quizzes.length,
        topics: Object.keys(time).length
      });
    } catch (error) {
      console.error('❌ Lỗi khi load data:', error);
    }
  };

  useEffect(() => {
    loadData();
    
    if (autoRefresh) {
      const interval = setInterval(loadData, 5000); // Refresh mỗi 5 giây
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const getTotalTime = () => {
    return Object.values(timeSpent).reduce((sum, time) => sum + time, 0);
  };

  const getActivityTypeLabel = (type) => {
    const labels = {
      'view_resource': '📖 Xem tài liệu',
      'quiz': '📝 Làm quiz',
      'chat_session': '💬 Chat với AI',
      'view_roadmap': '🗺️ Xem roadmap',
    };
    return labels[type] || type;
  };

  return (
    <div className="tracking-debug-page">
      <Header />
      
      <div className="debug-container">
        <div className="debug-header">
          <h1>🔍 Tracking Debug Dashboard</h1>
          <div className="debug-controls">
            <label className="auto-refresh-toggle">
              <input 
                type="checkbox" 
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
              />
              <span>Auto-refresh (5s)</span>
            </label>
            <button onClick={loadData} className="refresh-btn">
              🔄 Refresh ngay
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="debug-stats">
          <div className="stat-box">
            <h3>⏱️ Tổng thời gian học</h3>
            <div className="stat-value">{formatDuration(getTotalTime())}</div>
            <div className="stat-detail">{getTotalTime()} giây</div>
          </div>
          
          <div className="stat-box">
            <h3>📊 Hoạt động</h3>
            <div className="stat-value">{activities.length}</div>
            <div className="stat-detail">lần ghi nhận</div>
          </div>
          
          <div className="stat-box">
            <h3>📝 Quiz đã làm</h3>
            <div className="stat-value">{quizResults.length}</div>
            <div className="stat-detail">bài kiểm tra</div>
          </div>
          
          <div className="stat-box">
            <h3>📚 Chủ đề</h3>
            <div className="stat-value">{Object.keys(timeSpent).length}</div>
            <div className="stat-detail">topics tracked</div>
          </div>
        </div>

        {/* Time by Topic */}
        <div className="debug-section">
          <h2>⏱️ Thời gian theo chủ đề</h2>
          <div className="time-list">
            {Object.entries(timeSpent)
              .sort(([, a], [, b]) => b - a)
              .map(([topic, seconds]) => (
                <div key={topic} className="time-item">
                  <span className="topic-name">{topic}</span>
                  <div className="time-bar-container">
                    <div 
                      className="time-bar" 
                      style={{ 
                        width: `${(seconds / getTotalTime()) * 100}%` 
                      }}
                    ></div>
                  </div>
                  <span className="time-value">{formatDuration(seconds)}</span>
                </div>
              ))}
            {Object.keys(timeSpent).length === 0 && (
              <p className="empty-message">Chưa có dữ liệu thời gian học</p>
            )}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="debug-section">
          <h2>📊 Hoạt động gần đây ({activities.length})</h2>
          <div className="activities-table">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Thời gian</th>
                  <th>Loại</th>
                  <th>Chủ đề</th>
                  <th>Chi tiết</th>
                  <th>Thời lượng</th>
                </tr>
              </thead>
              <tbody>
                {activities
                  .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                  .slice(0, 50)
                  .map((activity, index) => (
                    <tr key={activity.id || index}>
                      <td>{index + 1}</td>
                      <td className="timestamp">
                        {new Date(activity.timestamp).toLocaleString('vi-VN')}
                      </td>
                      <td className="activity-type">
                        {getActivityTypeLabel(activity.activityType)}
                      </td>
                      <td className="topic">{activity.topic}</td>
                      <td className="subtopic">{activity.subtopic}</td>
                      <td className="duration">{formatDuration(activity.duration)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {activities.length === 0 && (
              <p className="empty-message">Chưa có hoạt động nào được ghi nhận</p>
            )}
          </div>
        </div>

        {/* Quiz Results */}
        <div className="debug-section">
          <h2>📝 Kết quả Quiz ({quizResults.length})</h2>
          <div className="quiz-table">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Thời gian</th>
                  <th>Chủ đề</th>
                  <th>Điểm số</th>
                  <th>Kết quả</th>
                  <th>Thời lượng</th>
                </tr>
              </thead>
              <tbody>
                {quizResults
                  .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                  .map((quiz, index) => (
                    <tr key={quiz.id || index}>
                      <td>{index + 1}</td>
                      <td className="timestamp">
                        {new Date(quiz.timestamp).toLocaleString('vi-VN')}
                      </td>
                      <td className="topic">{quiz.topic}</td>
                      <td className="score">
                        {quiz.score.toFixed(1)}%
                      </td>
                      <td>
                        <span className={`result-badge ${quiz.passed ? 'passed' : 'failed'}`}>
                          {quiz.passed ? '✅ Đạt' : '❌ Chưa đạt'}
                        </span>
                      </td>
                      <td className="duration">{formatDuration(quiz.timeSpent || 0)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {quizResults.length === 0 && (
              <p className="empty-message">Chưa có kết quả quiz nào</p>
            )}
          </div>
        </div>

        {/* Raw Analytics Data */}
        <div className="debug-section">
          <h2>🔧 Raw Analytics Data</h2>
          <pre className="json-display">
            {JSON.stringify(analyticsData, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default TrackingDebugPage;
