import React, { useState, useEffect, useRef } from 'react';
import Vapi from '@vapi-ai/web';
import './vapiWidget.css';
import { Mic, Phone, PhoneOff, Loader as LoaderIcon } from 'lucide-react';
import { useVapiContext } from '../../hooks/useVapiContext';

const VapiWidget = () => {
  const [vapi, setVapi] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const [volume, setVolume] = useState(0);
  const [error, setError] = useState(null);
  
  const transcriptContainerRef = useRef(null);
  const { userContext, isContextReady } = useVapiContext();

  // Khởi tạo Vapi instance
  useEffect(() => {
    const publicKey = process.env.REACT_APP_VAPI_PUBLIC_KEY || '068bd402-6538-400c-86cc-1f0c32660e7f';
    
    console.log('🎤 Đang khởi tạo VAPI với public key:', publicKey);
    
    let vapiInstance = null;
    
    try {
      vapiInstance = new Vapi(publicKey);
      setVapi(vapiInstance);

      // Event listeners
      vapiInstance.on('call-start', () => {
        console.log('📞 Cuộc gọi bắt đầu');
        setIsConnected(true);
        setIsLoading(false);
        setError(null);
      });

      vapiInstance.on('call-end', () => {
        console.log('📴 Cuộc gọi kết thúc');
        setIsConnected(false);
        setIsSpeaking(false);
        setIsLoading(false);
        setVolume(0);
      });

      vapiInstance.on('speech-start', () => {
        console.log('🗣️ AI bắt đầu nói');
        setIsSpeaking(true);
      });

      vapiInstance.on('speech-end', () => {
        console.log('🤫 AI ngừng nói');
        setIsSpeaking(false);
      });

      vapiInstance.on('volume-level', (level) => {
        setVolume(level);
      });

      vapiInstance.on('message', (message) => {
        console.log('💬 Message nhận được:', message);
        
        if (message.type === 'transcript') {
          setTranscript(prev => [...prev, {
            role: message.role,
            text: message.transcript || message.transcriptType,
            timestamp: new Date().toISOString()
          }]);
        }
        
        if (message.type === 'function-call') {
          console.log('🔧 Function call:', message.functionCall);
        }
      });

      vapiInstance.on('error', (error) => {
        console.error('❌ Lỗi VAPI:', error);
        setError(error.message || 'Đã có lỗi xảy ra');
        setIsLoading(false);
        setIsConnected(false);
      });

      console.log('✅ VAPI đã được khởi tạo thành công');

    } catch (err) {
      console.error('❌ Lỗi khi khởi tạo VAPI:', err);
      setError('Không thể khởi tạo VAPI');
    }

    return () => {
      if (vapiInstance) {
        vapiInstance.stop();
      }
    };
  }, []);

  // Auto scroll transcript
  useEffect(() => {
    if (transcriptContainerRef.current) {
      transcriptContainerRef.current.scrollTop = transcriptContainerRef.current.scrollHeight;
    }
  }, [transcript]);

  const startCall = async () => {
    if (!vapi) {
      console.error('VAPI chưa sẵn sàng');
      setError('Đang khởi tạo VAPI...');
      return;
    }

    if (!isContextReady) {
      console.warn('Context chưa load xong, nhưng vẫn cho phép gọi');
    }

    setIsLoading(true);
    setError(null);
    setTranscript([]);

    try {
      console.log('🚀 Bắt đầu tạo assistant với context');
      console.log('📊 User context:', userContext);

      // Tạo context message để inject vào system prompt
      const userContextSummary = {
        userName: userContext.profile?.username || 'Bạn',
        totalTopics: userContext.analytics?.current_topics?.length || 0,
        currentTopics: userContext.analytics?.current_topics?.slice(0, 5).join(', ') || 'Chưa có',
        totalQuizzes: userContext.analytics?.quiz_results?.length || 0,
        averageScore: calculateAverageScore(userContext.analytics?.quiz_results),
        totalResources: userContext.resources?.length || 0,
        recentActivity: getLatestQuiz(userContext.analytics?.quiz_results)
      };

      console.log('📝 Context summary:', userContextSummary);

      // Tạo system message với context đầy đủ
      const systemMessage = `Bạn là trợ lý AI học tập thông minh và thân thiện của ${userContextSummary.userName}.

THÔNG TIN HỌC TẬP HIỆN TẠI CỦA NGƯỜI DÙNG:
- Tên: ${userContextSummary.userName}
- Số chủ đề đang học: ${userContextSummary.totalTopics}
- Các chủ đề: ${userContextSummary.currentTopics}
- Tổng số quiz đã làm: ${userContextSummary.totalQuizzes}
- Điểm trung bình: ${userContextSummary.averageScore}%
- Số tài liệu đã lưu: ${userContextSummary.totalResources}
- Hoạt động gần nhất: ${userContextSummary.recentActivity}

NHIỆM VỤ:
1. Chào hỏi người dùng bằng tên
2. Tư vấn học tập dựa trên dữ liệu thực tế ở trên
3. Trả lời câu hỏi về tiến độ học tập
4. Đề xuất chủ đề học tiếp theo
5. Động viên và khuyến khích

PHONG CÁCH:
- Trả lời bằng tiếng Việt
- Thân thiện, ngắn gọn (2-3 câu)
- Dựa vào dữ liệu thực tế, không bịa đặt
- Tập trung vào giải pháp cụ thể`;

      // Tạo transient (inline) assistant với context
      const assistantConfig = {
        name: "Trợ lý AI Học tập",
        model: {
          provider: "google",
          model: "gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: systemMessage
            }
          ],
          temperature: 0.7
        },
        voice: {
          provider: "openai",
          voiceId: "shimmer",
          model: "tts-1",
          speed: 1.0
        },
        firstMessage: `Xin chào ${userContextSummary.userName}! Tôi là trợ lý AI học tập của bạn. Tôi có thể giúp gì cho bạn hôm nay?`,
        transcriber: {
          provider: "deepgram",
          model: "nova-2",
          language: "vi"
        }
      };

      console.log('🤖 Tạo assistant config:', assistantConfig);

      // Gọi với inline assistant configuration
      await vapi.start(assistantConfig);

    } catch (err) {
      console.error('❌ Lỗi khi bắt đầu cuộc gọi:', err);
      setError(err.message || 'Không thể bắt đầu cuộc gọi');
      setIsLoading(false);
    }
  };

  const endCall = () => {
    if (vapi) {
      console.log('📴 Kết thúc cuộc gọi');
      vapi.stop();
      setTranscript([]);
    }
  };

  // Helper functions
  const calculateAverageScore = (quizResults) => {
    if (!quizResults || quizResults.length === 0) return 0;
    const total = quizResults.reduce((sum, quiz) => sum + (quiz.score || 0), 0);
    return Math.round(total / quizResults.length);
  };

  const getLatestQuiz = (quizResults) => {
    if (!quizResults || quizResults.length === 0) return 'Chưa có';
    const latest = quizResults[0];
    return `${latest.topic}/${latest.subtopic} - ${latest.score}%`;
  };

  return (
    <div className="vapi-widget-container">
      {/* Main Button */}
      {!isConnected ? (
        <button
          className={`vapi-main-button ${isLoading ? 'loading' : ''}`}
          onClick={startCall}
          disabled={isLoading || !isContextReady}
          title={!isContextReady ? 'Đang tải dữ liệu...' : 'Bắt đầu trò chuyện bằng giọng nói'}
        >
          {isLoading ? (
            <LoaderIcon size={24} className="spinning" />
          ) : (
            <Phone size={24} />
          )}
          <span>{isLoading ? 'Đang kết nối...' : 'Trò chuyện'}</span>
        </button>
      ) : (
        <div className="vapi-active-call">
          {/* Call Controls */}
          <div className="vapi-call-controls">
            <div className="vapi-status">
              <div className={`vapi-indicator ${isSpeaking ? 'speaking' : 'listening'}`}>
                <Mic size={20} />
              </div>
              <div className="vapi-status-text">
                {isSpeaking ? 'AI đang nói...' : 'Đang nghe...'}
              </div>
            </div>

            <button
              className="vapi-end-button"
              onClick={endCall}
              title="Kết thúc cuộc gọi"
            >
              <PhoneOff size={20} />
            </button>
          </div>

          {/* Volume Indicator */}
          <div className="vapi-volume-container">
            <div 
              className="vapi-volume-bar"
              style={{ width: `${volume * 100}%` }}
            />
          </div>

          {/* Transcript */}
          {transcript.length > 0 && (
            <div className="vapi-transcript" ref={transcriptContainerRef}>
              <div className="vapi-transcript-title">📝 Nội dung cuộc trò chuyện</div>
              {transcript.map((item, index) => (
                <div 
                  key={index} 
                  className={`vapi-transcript-item ${item.role}`}
                >
                  <div className="vapi-transcript-role">
                    {item.role === 'user' ? '👤 Bạn' : '🤖 AI'}
                  </div>
                  <div className="vapi-transcript-text">
                    {item.text}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="vapi-error">
          ⚠️ {error}
        </div>
      )}

      {/* Loading Context Indicator */}
      {!isContextReady && (
        <div className="vapi-context-loading">
          <LoaderIcon size={16} className="spinning" />
          <span>Đang tải dữ liệu người dùng...</span>
        </div>
      )}
    </div>
  );
};

export default VapiWidget;
