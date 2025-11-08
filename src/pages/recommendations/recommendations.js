import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAnalyticsData } from '../../utils/indexedDB';
import API_CONFIG from '../../config/api';
import Header from '../../components/header/header';
import { 
  TrendingUp, 
  Target, 
  BookOpen, 
  Zap, 
  Award,
  ChevronRight,
  Clock,
  Brain,
  Lightbulb,
  Star,
  BarChart
} from 'lucide-react';
import './recommendations.css';

const RecommendationsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [learningPath, setLearningPath] = useState(null);
  const [nextTopics, setNextTopics] = useState([]);
  const [difficultyAdjustment, setDifficultyAdjustment] = useState(null);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);

      // Lấy dữ liệu analytics từ IndexedDB
      const analyticsData = await getAnalyticsData();
      
      console.log('📊 Analytics Data:', analyticsData);

      // Kiểm tra nếu không có dữ liệu
      if (
        analyticsData.learning_activities.length === 0 && 
        analyticsData.quiz_results.length === 0
      ) {
        console.warn('⚠️ Không có dữ liệu để tạo recommendations');
        setLoading(false);
        return;
      }

      // Gọi API để tạo recommendations job
      const response = await fetch(`${API_CONFIG.baseURL}/api/recommendations/personalized`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ learning_data: analyticsData }),
      });

      if (!response.ok) {
        throw new Error('Không thể tạo recommendations job');
      }

      const result = await response.json();
      const { job_id } = result;
      console.log(`[Recommendations] Job đã tạo - ID: ${job_id}`);

      // Polling để kiểm tra trạng thái
      await pollRecommendationsStatus(job_id);

    } catch (err) {
      console.error('❌ Lỗi khi load recommendations:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  // Hàm polling để kiểm tra trạng thái recommendations job
  const pollRecommendationsStatus = async (jobId, maxAttempts = 60, interval = 2000) => {
    let attempts = 0;

    const checkStatus = async () => {
      try {
        attempts++;
        console.log(`[Recommendations Polling] Lần thử ${attempts}/${maxAttempts} - Job ID: ${jobId}`);

        const response = await fetch(`${API_CONFIG.baseURL}/api/recommendations/personalized/status/${jobId}`);
        
        if (!response.ok) {
          throw new Error('Không thể kiểm tra trạng thái job');
        }

        const jobData = await response.json();
        console.log(`[Recommendations Polling] Trạng thái: ${jobData.status}`);

        if (jobData.status === 'completed') {
          console.log('[Recommendations Polling] ✅ Hoàn thành!');

          const result = jobData.result;
          setRecommendations(result.recommendations);
          setLearningPath(result.learning_path);
          setNextTopics(result.next_topics);
          setDifficultyAdjustment(result.difficulty_adjustment);
          setLoading(false);
          return true;
        }
        else if (jobData.status === 'failed') {
          console.error('[Recommendations Polling] ❌ Lỗi:', jobData.error);
          setError(jobData.error || 'Có lỗi xảy ra khi tạo recommendations');
          setLoading(false);
          return true;
        }
        else if (attempts >= maxAttempts) {
          console.error('[Recommendations Polling] ⏱️ Timeout');
          setError('Quá trình xử lý mất quá nhiều thời gian. Vui lòng thử lại sau.');
          setLoading(false);
          return true;
        }

        // Tiếp tục polling
        setTimeout(checkStatus, interval);
        return false;

      } catch (error) {
        console.error('[Recommendations Polling] Lỗi khi kiểm tra trạng thái:', error);

        if (attempts >= maxAttempts) {
          setError('Không thể kết nối đến server. Vui lòng kiểm tra kết nối và thử lại.');
          setLoading(false);
          return true;
        }

        setTimeout(checkStatus, interval);
        return false;
      }
    };

    await checkStatus();
  };

  useEffect(() => {
    loadRecommendations();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high':
        return <Zap size={20} color="#ff6b6b" />;
      case 'medium':
        return <Target size={20} color="#ffd93d" />;
      case 'low':
        return <BookOpen size={20} color="#6bcf7f" />;
      default:
        return <BookOpen size={20} />;
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 'high':
        return 'Ưu tiên cao';
      case 'medium':
        return 'Ưu tiên trung bình';
      case 'low':
        return 'Ưu tiên thấp';
      default:
        return 'Bình thường';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner':
        return '#6bcf7f';
      case 'intermediate':
        return '#ffd93d';
      case 'advanced':
        return '#ff6b6b';
      case 'expert':
        return '#a855f7';
      default:
        return '#667eea';
    }
  };

  const getDifficultyText = (difficulty) => {
    switch (difficulty) {
      case 'beginner':
        return 'Cơ bản';
      case 'intermediate':
        return 'Trung bình';
      case 'advanced':
        return 'Nâng cao';
      case 'expert':
        return 'Chuyên gia';
      default:
        return difficulty;
    }
  };

  if (loading) {
    return (
      <div className="recommendations-container">
        <Header />
        <div className="loading-state">
          <div className="loading-spinner">🤖</div>
          <h2>AI đang phân tích dữ liệu của bạn...</h2>
          <p>Vui lòng đợi trong giây lát</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="recommendations-container">
        <Header />
        <div className="error-state">
          <h2>❌ Có lỗi xảy ra</h2>
          <p>{error}</p>
          <button className="retry-button" onClick={loadRecommendations}>
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!recommendations && !learningPath && !nextTopics.length) {
    return (
      <div className="recommendations-container">
        <Header />
        <div className="empty-state">
          <div className="empty-state-icon">🎯</div>
          <h2>Chưa có dữ liệu để tạo recommendations</h2>
          <p>Hãy bắt đầu học tập và làm quiz để AI có thể phân tích và đưa ra gợi ý phù hợp với bạn!</p>
          <Link to="/topic" className="cta-button">
            <BookOpen size={20} />
            Bắt đầu học ngay
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="recommendations-container">
      <Header />
      
      <div className="recommendations-header">
        <div className="header-content">
          <h1>
            <Brain className="header-icon" size={40} />
            Gợi ý học tập cá nhân hóa
          </h1>
          <p>AI đã phân tích dữ liệu của bạn và đưa ra những gợi ý phù hợp nhất</p>
        </div>
      </div>

      {/* Performance Summary */}
      {recommendations?.performance_summary && (
        <div className="performance-summary">
          <div className="summary-icon">📊</div>
          <div className="summary-content">
            <h3>Tình hình học tập của bạn</h3>
            <p>{recommendations.performance_summary}</p>
          </div>
        </div>
      )}

      {/* Next Topics to Study */}
      {nextTopics && nextTopics.length > 0 && (
        <section className="next-topics-section">
          <div className="section-header">
            <h2>
              <TrendingUp size={28} />
              Chủ đề tiếp theo dành cho bạn
            </h2>
            <p>Dựa trên performance và sở thích của bạn</p>
          </div>

          <div className="topics-grid">
            {nextTopics.map((topic, index) => (
              <div key={index} className="topic-card" data-priority={topic.priority}>
                <div className="topic-card-header">
                  <div className="topic-title">
                    <h3>{topic.topic}</h3>
                    <span className={`priority-badge ${topic.priority}`}>
                      {getPriorityIcon(topic.priority)}
                      {getPriorityText(topic.priority)}
                    </span>
                  </div>
                  <div className="relevance-score">
                    <Star size={16} fill="#ffd93d" color="#ffd93d" />
                    <span>{topic.relevance_score}/10</span>
                  </div>
                </div>

                <p className="topic-reason">{topic.reason}</p>

                {topic.prerequisites && topic.prerequisites.length > 0 && (
                  <div className="prerequisites">
                    <strong>📚 Kiến thức cần có:</strong>
                    <ul>
                      {topic.prerequisites.map((prereq, idx) => (
                        <li key={idx}>{prereq}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {topic.estimated_time && (
                  <div className="estimated-time">
                    <Clock size={16} />
                    <span>Thời gian ước tính: {topic.estimated_time}</span>
                  </div>
                )}

                {topic.benefits && topic.benefits.length > 0 && (
                  <div className="benefits">
                    <strong>✨ Lợi ích:</strong>
                    <ul>
                      {topic.benefits.map((benefit, idx) => (
                        <li key={idx}>{benefit}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <Link to="/topic" className="start-learning-btn">
                  Bắt đầu học
                  <ChevronRight size={18} />
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recommended Learning Path */}
      {learningPath && (
        <section className="learning-path-section">
          <div className="section-header">
            <h2>
              <Target size={28} />
              Lộ trình học tập đề xuất
            </h2>
            <p>{learningPath.description}</p>
          </div>

          {learningPath.milestones && learningPath.milestones.length > 0 && (
            <div className="milestones-timeline">
              {learningPath.milestones.map((milestone, index) => (
                <div key={index} className="milestone-item">
                  <div className="milestone-marker">
                    <div className="marker-number">{index + 1}</div>
                    {index < learningPath.milestones.length - 1 && (
                      <div className="marker-line"></div>
                    )}
                  </div>
                  
                  <div className="milestone-content">
                    <h3>{milestone.title}</h3>
                    
                    {milestone.duration && (
                      <div className="milestone-duration">
                        <Clock size={16} />
                        <span>{milestone.duration}</span>
                      </div>
                    )}

                    <p className="milestone-description">{milestone.description}</p>

                    {milestone.topics && milestone.topics.length > 0 && (
                      <div className="milestone-topics">
                        <strong>📖 Chủ đề:</strong>
                        <div className="topics-list">
                          {milestone.topics.map((topic, idx) => (
                            <span key={idx} className="topic-tag">{topic}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {milestone.goals && milestone.goals.length > 0 && (
                      <div className="milestone-goals">
                        <strong>🎯 Mục tiêu:</strong>
                        <ul>
                          {milestone.goals.map((goal, idx) => (
                            <li key={idx}>{goal}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {learningPath.total_duration && (
            <div className="path-summary">
              <Award size={24} color="#ffd93d" />
              <div>
                <strong>Thời gian hoàn thành dự kiến:</strong>
                <span>{learningPath.total_duration}</span>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Difficulty Adjustment */}
      {difficultyAdjustment && (
        <section className="difficulty-section">
          <div className="section-header">
            <h2>
              <BarChart size={28} />
              Điều chỉnh độ khó
            </h2>
            <p>Để tối ưu hóa quá trình học tập của bạn</p>
          </div>

          <div className="difficulty-card">
            <div className="current-level">
              <span className="level-label">Trình độ hiện tại</span>
              <span 
                className="level-badge"
                style={{ backgroundColor: getDifficultyColor(difficultyAdjustment.current_level) }}
              >
                {getDifficultyText(difficultyAdjustment.current_level)}
              </span>
            </div>

            <div className="level-arrow">→</div>

            <div className="recommended-level">
              <span className="level-label">Độ khó đề xuất</span>
              <span 
                className="level-badge"
                style={{ backgroundColor: getDifficultyColor(difficultyAdjustment.recommended_difficulty) }}
              >
                {getDifficultyText(difficultyAdjustment.recommended_difficulty)}
              </span>
            </div>
          </div>

          {difficultyAdjustment.reason && (
            <div className="difficulty-reason">
              <Lightbulb size={20} />
              <p>{difficultyAdjustment.reason}</p>
            </div>
          )}

          {difficultyAdjustment.adjustment_tips && difficultyAdjustment.adjustment_tips.length > 0 && (
            <div className="adjustment-tips">
              <h4>💡 Gợi ý điều chỉnh:</h4>
              <ul>
                {difficultyAdjustment.adjustment_tips.map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* General Recommendations */}
      {recommendations?.general_tips && recommendations.general_tips.length > 0 && (
        <section className="general-tips-section">
          <div className="section-header">
            <h2>
              <Lightbulb size={28} />
              Lời khuyên chung
            </h2>
          </div>

          <div className="tips-grid">
            {recommendations.general_tips.map((tip, index) => (
              <div key={index} className="tip-card">
                <div className="tip-icon">💡</div>
                <p>{tip}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Call to Action */}
      <div className="cta-section">
        <h3>Sẵn sàng tiếp tục học tập?</h3>
        <p>Bắt đầu với một trong những chủ đề được đề xuất phía trên!</p>
        <div className="cta-buttons">
          <Link to="/topic" className="primary-cta">
            <BookOpen size={20} />
            Chọn chủ đề học
          </Link>
          <Link to="/analytics" className="secondary-cta">
            <BarChart size={20} />
            Xem Analytics
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RecommendationsPage;
