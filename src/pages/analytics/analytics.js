import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { getAnalyticsData } from '../../utils/indexedDB';
import API_CONFIG from '../../config/api';
import Header from '../../components/header/header';
import './analytics.css';

const AnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [insights, setInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      // Lấy dữ liệu từ IndexedDB
      const data = await getAnalyticsData();
      
      console.log('📊 Analytics Data từ IndexedDB:', data);
      console.log('- Learning Activities:', data.learning_activities.length);
      console.log('- Quiz Results:', data.quiz_results.length);
      console.log('- Time Spent:', data.time_spent);
      console.log('- Topics:', data.current_topics);
      
      // Kiểm tra nếu không có dữ liệu
      if (
        data.learning_activities.length === 0 && 
        data.quiz_results.length === 0
      ) {
        console.warn('⚠️ Không có dữ liệu analytics');
        setAnalyticsData(null);
        setLoading(false);
        return;
      }

      console.log('✅ Có dữ liệu! Đang gọi API overview...');

      // Gọi API để tính metrics
      const overviewResponse = await fetch(`${API_CONFIG.baseURL}/api/analytics/overview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ learning_data: data }),
      });

      if (!overviewResponse.ok) {
        throw new Error('Không thể tải analytics overview');
      }

      const overviewResult = await overviewResponse.json();
      
      console.log('✅ Overview Result:', overviewResult);
      
      setAnalyticsData({
        raw: data,
        metrics: overviewResult.data,
      });

      // Tự động load insights sau khi có data
      loadInsights(data);

    } catch (err) {
      console.error('❌ Lỗi khi load analytics:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadInsights = async (data) => {
    try {
      setInsightsLoading(true);

      const insightsResponse = await fetch(`${API_CONFIG.baseURL}/api/analytics/insights`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ learning_data: data }),
      });

      if (!insightsResponse.ok) {
        throw new Error('Không thể tải AI insights');
      }

      const insightsResult = await insightsResponse.json();
      setInsights(insightsResult.data);

    } catch (err) {
      console.error('Lỗi khi load insights:', err);
    } finally {
      setInsightsLoading(false);
    }
  };

  // Chuẩn bị dữ liệu cho charts
  const prepareChartData = () => {
    if (!analyticsData) return null;

    const { metrics, raw } = analyticsData;

    // Time spent by topic - từ topic_breakdown
    const timeSpentData = Object.entries(metrics.topic_breakdown || {}).map(([topic, data]) => ({
      topic: topic.length > 15 ? topic.substring(0, 15) + '...' : topic,
      hours: parseFloat((data.time_spent / 3600).toFixed(1)), // Convert seconds to hours
    }));

    // Quiz performance - từ raw quiz_results
    const quizPerformanceData = (raw.quiz_results || []).slice(-10).map((quiz, index) => ({
      attempt: `#${index + 1}`,
      score: parseFloat(quiz.score.toFixed(1)),
      topic: quiz.topic,
    }));

    // Topics distribution
    const topicsData = Object.entries(metrics.topic_breakdown || {}).map(([topic, data]) => ({
      name: topic.length > 20 ? topic.substring(0, 20) + '...' : topic,
      value: parseFloat((data.time_spent / 3600).toFixed(1)), // Hours
    }));

    return {
      timeSpent: timeSpentData,
      quizPerformance: quizPerformanceData,
      topics: topicsData,
    };
  };

  const chartData = prepareChartData();

  // Colors cho charts - match với theme
  const COLORS = ['#667eea', '#764ba2', '#4facfe', '#00f2fe', '#43e97b', '#38f9d7', '#fa709a', '#fee140'];

  // Custom tooltip style
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'rgba(21, 22, 39, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '8px',
          padding: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)'
        }}>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', margin: '0 0 8px 0', fontSize: '12px' }}>{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color, margin: '4px 0', fontSize: '14px', fontWeight: '600' }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="analytics-container">
        <Header />
        <div className="loading-state">
          <div className="insights-loading-spinner">⏳</div>
          <h2>Đang tải analytics...</h2>
          <p>Vui lòng đợi trong giây lát</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-container">
        <Header />
        <div className="error-state">
          <h2>❌ Có lỗi xảy ra</h2>
          <p>{error}</p>
          <button className="cta-button" onClick={loadAnalytics}>
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="analytics-container">
        <Header />
        <div className="empty-state">
          <div className="empty-state-icon">📊</div>
          <h2>Chưa có dữ liệu analytics</h2>
          <p>Bắt đầu học và làm quiz để xem phân tích chi tiết về tiến trình học tập của bạn!</p>
          <Link to="/topic" className="cta-button">
            Bắt đầu học ngay
          </Link>
        </div>
      </div>
    );
  }

  // Backend trả về metrics trực tiếp, không có nested overview
  const metrics = analyticsData.metrics || {};
  const overview = {
    total_study_time_hours: metrics.total_time_hours || 0,
    average_quiz_score: metrics.avg_quiz_score || 0,
    total_quizzes: metrics.total_quizzes || 0,
    pass_rate: metrics.total_quizzes > 0 
      ? Math.round((metrics.passed_quizzes / metrics.total_quizzes) * 100)
      : 0,
    topics_studied: metrics.topics_studied || 0,
    learning_streak_days: metrics.current_streak || 0,
  };

  return (
    <div className="analytics-container">
      <Header />
      
      <div className="analytics-header">
        <h1>📊 Learning Analytics</h1>
        <p>Phân tích chi tiết về tiến trình học tập của bạn với AI insights</p>
      </div>

      {/* Overview Statistics */}
      <div className="overview-section">
        <div className="stat-card" style={{'--gradient': 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'}}>
          <div className="stat-card-header">
            <h3>Tổng thời gian học</h3>
            <span className="stat-icon">⏱️</span>
          </div>
          <div className="stat-value">{overview.total_study_time_hours}</div>
          <div className="stat-label">giờ</div>
        </div>

        <div className="stat-card" style={{'--gradient': 'linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)'}}>
          <div className="stat-card-header">
            <h3>Điểm trung bình</h3>
            <span className="stat-icon">📈</span>
          </div>
          <div className="stat-value">{overview.average_quiz_score}%</div>
          <div className="stat-label">trên {overview.total_quizzes} quiz</div>
          {overview.pass_rate >= 70 && (
            <div className="stat-trend positive">
              ✓ {overview.pass_rate}% đạt yêu cầu
            </div>
          )}
        </div>

        <div className="stat-card" style={{'--gradient': 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)'}}>
          <div className="stat-card-header">
            <h3>Chủ đề đã học</h3>
            <span className="stat-icon">📚</span>
          </div>
          <div className="stat-value">{overview.topics_studied}</div>
          <div className="stat-label">chủ đề</div>
        </div>

        <div className="stat-card" style={{'--gradient': 'linear-gradient(90deg, #fa709a 0%, #fee140 100%)'}}>
          <div className="stat-card-header">
            <h3>Chuỗi học liên tiếp</h3>
            <span className="stat-icon">🔥</span>
          </div>
          <div className="stat-value">{overview.learning_streak_days}</div>
          <div className="stat-label">ngày</div>
          {overview.learning_streak_days >= 3 && (
            <div className="stat-trend positive">
              Tuyệt vời! Tiếp tục phát huy!
            </div>
          )}
        </div>
      </div>

      {/* Charts and Sidebar Layout */}
      <div className="analytics-sidebar-layout">
        <div className="analytics-main-content">
          {/* Quiz Performance Chart */}
          {chartData?.quizPerformance?.length > 0 && (
            <div className="chart-card">
              <h2>📊 Kết quả Quiz gần đây</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData.quizPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                  <XAxis dataKey="attempt" stroke="rgba(255, 255, 255, 0.6)" />
                  <YAxis domain={[0, 100]} stroke="rgba(255, 255, 255, 0.6)" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#667eea" 
                    strokeWidth={3}
                    name="Điểm số (%)"
                    dot={{ fill: '#667eea', r: 5 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Time Spent Chart */}
          {chartData?.timeSpent?.length > 0 && (
            <div className="chart-card">
              <h2>⏱️ Thời gian học theo chủ đề</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.timeSpent}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                  <XAxis dataKey="topic" stroke="rgba(255, 255, 255, 0.6)" />
                  <YAxis stroke="rgba(255, 255, 255, 0.6)" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="hours" fill="url(#colorGradient)" name="Giờ học" radius={[8, 8, 0, 0]} />
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#667eea" />
                      <stop offset="100%" stopColor="#764ba2" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Activity by Week - Temporarily disabled (no data from backend) */}
          {/* {chartData?.activityByWeek?.length > 0 && (
            <div className="chart-card">
              <h2>📅 Hoạt động theo tuần</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.activityByWeek}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                  <XAxis dataKey="week" stroke="rgba(255, 255, 255, 0.6)" />
                  <YAxis stroke="rgba(255, 255, 255, 0.6)" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="activities" fill="url(#activityGradient)" name="Số hoạt động" radius={[8, 8, 0, 0]} />
                  <defs>
                    <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#43e97b" />
                      <stop offset="100%" stopColor="#38f9d7" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )} */}
        </div>

        <div className="analytics-sidebar-content">
          {/* Topics Distribution Pie Chart */}
          {chartData?.topics?.length > 0 && (
            <div className="chart-card">
              <h2>📚 Phân bố thời gian</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData.topics}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.topics.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Learning Patterns */}
          {insights?.learning_patterns && (
            <div className="learning-patterns-card">
              <h2>🎯 Learning Patterns</h2>
              
              <div className="pattern-item">
                <span className="pattern-icon">📅</span>
                <div className="pattern-content">
                  <h4>Tần suất học tập</h4>
                  <p>{insights.learning_patterns.study_frequency}</p>
                </div>
              </div>

              {insights.learning_patterns.preferred_study_times && (
                <div className="pattern-item">
                  <span className="pattern-icon">⏰</span>
                  <div className="pattern-content">
                    <h4>Thời gian ưa thích</h4>
                    <p>{insights.learning_patterns.preferred_study_times}</p>
                  </div>
                </div>
              )}

              {insights.learning_patterns.learning_style && (
                <div className="pattern-item">
                  <span className="pattern-icon">🎨</span>
                  <div className="pattern-content">
                    <h4>Phong cách học tập</h4>
                    <p>{insights.learning_patterns.learning_style}</p>
                  </div>
                </div>
              )}

              {insights.learning_patterns.consistency_score !== undefined && (
                <div className="pattern-item">
                  <span className="pattern-icon">⭐</span>
                  <div className="pattern-content">
                    <h4>Điểm nhất quán</h4>
                    <p>{insights.learning_patterns.consistency_score}/10</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Predictions */}
          {insights?.predictions && (
            <div className="predictions-card">
              <h3>🔮 Dự đoán AI</h3>
              
              {insights.predictions.completion_time && (
                <div className="prediction-item">
                  <h4>Thời gian hoàn thành</h4>
                  <p>{insights.predictions.completion_time}</p>
                </div>
              )}

              {insights.predictions.success_probability !== undefined && (
                <div className="prediction-item">
                  <h4>Xác suất thành công</h4>
                  <p>{insights.predictions.success_probability}%</p>
                </div>
              )}

              {insights.predictions.potential_challenges?.length > 0 && (
                <div className="prediction-item">
                  <h4>Thách thức tiềm ẩn</h4>
                  <ul className="challenges-list">
                    {insights.predictions.potential_challenges.map((challenge, index) => (
                      <li key={index}>{challenge}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* AI Insights Section */}
      <div className="insights-section">
        <h2>🤖 AI-Driven Insights</h2>
        
        {insightsLoading ? (
          <div className="insights-loading">
            <div className="insights-loading-spinner">🔄</div>
            <p>AI đang phân tích learning patterns của bạn...</p>
          </div>
        ) : insights ? (
          <>
            {/* Strengths & Weaknesses */}
            {(insights.strengths?.length > 0 || insights.weaknesses?.length > 0) && (
              <div className="strength-weakness-grid">
                <div className="sw-column">
                  <h3>💪 Điểm mạnh</h3>
                  {insights.strengths?.map((strength, index) => (
                    <div key={index} className="strength-card">
                      <h4>
                        <span>{strength.area}</span>
                        <span className="score-badge high">{strength.score}/10</span>
                      </h4>
                      <p>{strength.description}</p>
                    </div>
                  ))}
                  {insights.strengths?.length === 0 && (
                    <p style={{ color: 'rgba(255, 255, 255, 0.5)', textAlign: 'center', padding: '2rem' }}>
                      Chưa đủ dữ liệu để phân tích
                    </p>
                  )}
                </div>

                <div className="sw-column">
                  <h3>🎯 Cần cải thiện</h3>
                  {insights.weaknesses?.map((weakness, index) => (
                    <div key={index} className="weakness-card">
                      <h4>
                        <span>{weakness.area}</span>
                        <span className={`score-badge ${weakness.score >= 6 ? 'medium' : 'low'}`}>
                          {weakness.score}/10
                        </span>
                      </h4>
                      <p>{weakness.description}</p>
                      {weakness.improvement_tips && (
                        <div className="improvement-tips">
                          <strong>💡 Gợi ý: </strong>
                          {weakness.improvement_tips}
                        </div>
                      )}
                    </div>
                  ))}
                  {insights.weaknesses?.length === 0 && (
                    <p style={{ color: 'rgba(255, 255, 255, 0.5)', textAlign: 'center', padding: '2rem' }}>
                      Chưa đủ dữ liệu để phân tích
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {insights.recommendations?.length > 0 && (
              <div className="recommendations-section">
                <h3>💡 Khuyến nghị cá nhân hóa</h3>
                <div className="recommendations-list">
                  {insights.recommendations.map((rec, index) => (
                    <div key={index} className={`recommendation-card ${rec.priority}`}>
                      <div className="recommendation-header">
                        <h4>{rec.title}</h4>
                        <span className={`priority-badge ${rec.priority}`}>
                          {rec.priority === 'high' ? 'Cao' : rec.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                        </span>
                      </div>
                      <p>{rec.description}</p>
                      {rec.action_items?.length > 0 && (
                        <div className="action-items">
                          <h5>Hành động cụ thể:</h5>
                          <ul>
                            {rec.action_items.map((action, idx) => (
                              <li key={idx}>{action}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Motivation Message */}
            {insights.motivation_message && (
              <div className="motivation-message">
                <div className="motivation-icon">✨</div>
                <p>{insights.motivation_message}</p>
              </div>
            )}
          </>
        ) : (
          <p style={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.5)', padding: '2rem' }}>
            Chưa có AI insights. Hãy tiếp tục học tập để nhận được phân tích chi tiết!
          </p>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;
