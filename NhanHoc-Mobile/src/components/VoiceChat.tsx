/**
 * Voice Chat Component
 * Tích hợp VAPI để trò chuyện bằng giọng nói với AI
 */

import { Ionicons } from '@expo/vector-icons';
import Vapi from '@vapi-ai/web';
import { Audio } from 'expo-av';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors } from '../constants/theme';
import { useVapiContext } from '../hooks/useVapiContext';

// VAPI Configuration
const VAPI_PUBLIC_KEY = '068bd402-6538-400c-86cc-1f0c32660e7f';

interface VoiceChatProps {
  onClose?: () => void;
}

interface TranscriptItem {
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export default function VoiceChat({ onClose }: VoiceChatProps) {
  const [vapi, setVapi] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [volume, setVolume] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const { userContext, isContextReady } = useVapiContext();
  const scrollViewRef = useRef<ScrollView>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Khởi tạo VAPI instance
  useEffect(() => {
    console.log('🎤 Đang khởi tạo VAPI với public key:', VAPI_PUBLIC_KEY);

    let vapiInstance: any = null;

    try {
      vapiInstance = new Vapi(VAPI_PUBLIC_KEY);
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

      vapiInstance.on('volume-level', (level: number) => {
        setVolume(level);
      });

      vapiInstance.on('message', (message: any) => {
        console.log('💬 Message nhận được:', message);

        if (message.type === 'transcript') {
          setTranscript((prev) => [
            ...prev,
            {
              role: message.role,
              text: message.transcript || message.transcriptType,
              timestamp: new Date().toISOString(),
            },
          ]);
        }

        if (message.type === 'function-call') {
          console.log('🔧 Function call:', message.functionCall);
        }
      });

      vapiInstance.on('error', (error: any) => {
        console.error('❌ Lỗi VAPI:', error);
        setError(error.message || 'Đã có lỗi xảy ra');
        setIsLoading(false);
        setIsConnected(false);
      });

      console.log('✅ VAPI đã được khởi tạo thành công');
    } catch (err: any) {
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
    if (transcript.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [transcript]);

  // Pulse animation for speaking indicator
  useEffect(() => {
    if (isSpeaking) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isSpeaking]);

  // Request microphone permissions
  const requestMicrophonePermission = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        setError('Cần cấp quyền microphone để sử dụng tính năng này');
        return false;
      }
      return true;
    } catch (err) {
      console.error('Lỗi khi xin quyền microphone:', err);
      return false;
    }
  };

  // Helper functions
  const calculateAverageScore = (quizResults: any[]) => {
    if (!quizResults || quizResults.length === 0) return 0;
    const total = quizResults.reduce((sum: number, quiz: any) => sum + (quiz.score || 0), 0);
    return Math.round(total / quizResults.length);
  };

  const getLatestQuiz = (quizResults: any[]) => {
    if (!quizResults || quizResults.length === 0) return 'Chưa có';
    const latest = quizResults[0];
    return `${latest.topic}/${latest.subtopic} - ${latest.score}%`;
  };

  const startCall = async () => {
    if (!vapi) {
      console.error('VAPI chưa sẵn sàng');
      setError('Đang khởi tạo VAPI...');
      return;
    }

    // Check microphone permission
    const hasPermission = await requestMicrophonePermission();
    if (!hasPermission) return;

    if (!isContextReady) {
      console.warn('Context chưa load xong, nhưng vẫn cho phép gọi');
    }

    setIsLoading(true);
    setError(null);
    setTranscript([]);

    try {
      console.log('🚀 Bắt đầu tạo assistant với context');
      console.log('📊 User context:', userContext);

      // Tạo context summary
      const courses = userContext.resources || [];
      const quizResults = userContext.analytics?.quiz_results || [];
      
      const userContextSummary = {
        userName: 'Bạn',
        totalCourses: courses.length,
        courseTopics: courses.slice(0, 5).map((c: any) => c.topic).join(', ') || 'Chưa có',
        totalQuizzes: quizResults.length,
        averageScore: calculateAverageScore(quizResults),
        recentActivity: getLatestQuiz(quizResults),
      };

      console.log('📝 Context summary:', userContextSummary);

      // Tạo system message với context đầy đủ
      const systemMessage = `Bạn là trợ lý AI học tập thông minh và thân thiện của ${userContextSummary.userName}.

THÔNG TIN HỌC TẬP HIỆN TẠI CỦA NGƯỜI DÙNG:
- Tên: ${userContextSummary.userName}
- Số khóa học đang học: ${userContextSummary.totalCourses}
- Các chủ đề: ${userContextSummary.courseTopics}
- Tổng số quiz đã làm: ${userContextSummary.totalQuizzes}
- Điểm trung bình: ${userContextSummary.averageScore}%
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
        name: 'Trợ lý AI Học tập',
        model: {
          provider: 'google',
          model: 'gemini-2.5-flash',
          messages: [
            {
              role: 'system',
              content: systemMessage,
            },
          ],
          temperature: 0.7,
        },
        voice: {
          provider: 'openai',
          voiceId: 'shimmer',
          model: 'tts-1',
          speed: 1.0,
        },
        firstMessage: `Xin chào ${userContextSummary.userName}! Tôi là trợ lý AI học tập của bạn. Tôi có thể giúp gì cho bạn hôm nay?`,
        transcriber: {
          provider: 'deepgram',
          model: 'nova-2',
          language: 'vi',
        },
      };

      console.log('🤖 Tạo assistant config:', assistantConfig);

      // Gọi với inline assistant configuration
      await vapi.start(assistantConfig);
    } catch (err: any) {
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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Trò chuyện bằng giọng nói</Text>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.text.dark} />
          </TouchableOpacity>
        )}
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {!isConnected ? (
          // Start Call Button
          <View style={styles.centerContainer}>
            <View style={styles.iconContainer}>
              <Ionicons name="mic" size={60} color={colors.primary} />
            </View>
            <Text style={styles.title}>Trò chuyện bằng giọng nói</Text>
            <Text style={styles.description}>
              AI sẽ giúp bạn học tập hiệu quả hơn dựa trên lộ trình và tiến độ của bạn
            </Text>

            {!isContextReady && (
              <View style={styles.contextLoading}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.contextLoadingText}>Đang tải dữ liệu người dùng...</Text>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.startButton,
                (!isContextReady || isLoading) && styles.startButtonDisabled,
              ]}
              onPress={startCall}
              disabled={isLoading || !isContextReady}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="call" size={24} color="#FFFFFF" />
                  <Text style={styles.startButtonText}>Bắt đầu trò chuyện</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          // Active Call
          <View style={styles.activeCall}>
            {/* Call Status */}
            <View style={styles.statusContainer}>
              <Animated.View
                style={[
                  styles.speakingIndicator,
                  isSpeaking && styles.speakingIndicatorActive,
                  { transform: [{ scale: pulseAnim }] },
                ]}
              >
                <Ionicons name="mic" size={40} color="#FFFFFF" />
              </Animated.View>
              <Text style={styles.statusText}>
                {isSpeaking ? 'AI đang nói...' : 'Đang nghe...'}
              </Text>
            </View>

            {/* Volume Bar */}
            <View style={styles.volumeContainer}>
              <View style={[styles.volumeBar, { width: `${volume * 100}%` }]} />
            </View>

            {/* Transcript */}
            {transcript.length > 0 && (
              <ScrollView
                ref={scrollViewRef}
                style={styles.transcript}
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.transcriptTitle}>📝 Nội dung cuộc trò chuyện</Text>
                {transcript.map((item, index) => (
                  <View
                    key={index}
                    style={[
                      styles.transcriptItem,
                      item.role === 'user' ? styles.transcriptUser : styles.transcriptAssistant,
                    ]}
                  >
                    <Text style={styles.transcriptRole}>
                      {item.role === 'user' ? '👤 Bạn' : '🤖 AI'}
                    </Text>
                    <Text style={styles.transcriptText}>{item.text}</Text>
                  </View>
                ))}
              </ScrollView>
            )}

            {/* End Call Button */}
            <TouchableOpacity style={styles.endButton} onPress={endCall}>
              <Ionicons name="call" size={24} color="#FFFFFF" />
              <Text style={styles.endButtonText}>Kết thúc cuộc gọi</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Error Display */}
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="warning" size={20} color="#EF4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.dark,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.dark,
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: colors.text.muted,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  contextLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  contextLoadingText: {
    fontSize: 12,
    color: colors.text.muted,
    marginLeft: 8,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  startButtonDisabled: {
    backgroundColor: '#E2E8F0',
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  activeCall: {
    flex: 1,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  speakingIndicator: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  speakingIndicatorActive: {
    backgroundColor: colors.primary,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.dark,
  },
  volumeContainer: {
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 24,
  },
  volumeBar: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  transcript: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  transcriptTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.dark,
    marginBottom: 12,
  },
  transcriptItem: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
  },
  transcriptUser: {
    backgroundColor: colors.primary + '20',
  },
  transcriptAssistant: {
    backgroundColor: '#FFFFFF',
  },
  transcriptRole: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.dark,
    marginBottom: 4,
  },
  transcriptText: {
    fontSize: 14,
    color: colors.text.dark,
  },
  endButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  endButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#EF4444',
  },
});
