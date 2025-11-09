import { useCallback, useEffect, useState } from 'react';
import vapiService, { UserContext } from '../services/vapiService';

export interface TranscriptMessage {
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  type?: 'voice';
}

export interface UseVapiOptions {
  userContext: UserContext;
  onTranscript?: (message: TranscriptMessage) => void;
}

export const useVapi = ({ userContext, onTranscript }: UseVapiOptions) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Khởi tạo event listeners
  useEffect(() => {
    const vapi = vapiService.getVapi();
    if (!vapi) return;

    // Event: Call started
    const handleCallStart = () => {
      console.log('📞 Cuộc gọi bắt đầu');
      setIsConnected(true);
      setIsLoading(false);
      setError(null);
    };

    // Event: Call ended
    const handleCallEnd = () => {
      console.log('📴 Cuộc gọi kết thúc');
      setIsConnected(false);
      setIsSpeaking(false);
      setIsLoading(false);
      setVolume(0);
    };

    // Event: Speech start
    const handleSpeechStart = () => {
      console.log('🗣️ AI bắt đầu nói');
      setIsSpeaking(true);
    };

    // Event: Speech end
    const handleSpeechEnd = () => {
      console.log('🤫 AI ngừng nói');
      setIsSpeaking(false);
    };

    // Event: Volume level
    const handleVolumeLevel = (level: number) => {
      setVolume(level);
    };

    // Event: Message (transcript)
    const handleMessage = (message: any) => {
      console.log('💬 Message nhận được:', message);

      if (message.type === 'transcript' && onTranscript) {
        onTranscript({
          role: message.role,
          text: message.transcript || message.transcriptType || '',
          timestamp: new Date().toISOString(),
          type: 'voice'
        });
      }

      if (message.type === 'function-call') {
        console.log('🔧 Function call:', message.functionCall);
      }
    };

    // Event: Error
    const handleError = (err: any) => {
      console.error('❌ Lỗi VAPI:', err);
      setError(err.message || 'Đã có lỗi xảy ra');
      setIsLoading(false);
      setIsConnected(false);
    };

    // Register event listeners
    vapi.on('call-start', handleCallStart);
    vapi.on('call-end', handleCallEnd);
    vapi.on('speech-start', handleSpeechStart);
    vapi.on('speech-end', handleSpeechEnd);
    vapi.on('volume-level', handleVolumeLevel);
    vapi.on('message', handleMessage);
    vapi.on('error', handleError);

    // Cleanup
    return () => {
      vapi.removeListener('call-start', handleCallStart);
      vapi.removeListener('call-end', handleCallEnd);
      vapi.removeListener('speech-start', handleSpeechStart);
      vapi.removeListener('speech-end', handleSpeechEnd);
      vapi.removeListener('volume-level', handleVolumeLevel);
      vapi.removeListener('message', handleMessage);
      vapi.removeListener('error', handleError);
    };
  }, [onTranscript]);

  // Start call
  const startCall = useCallback(async () => {
    const vapi = vapiService.getVapi();
    if (!vapi) {
      setError('VAPI chưa sẵn sàng');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('🚀 Bắt đầu tạo assistant với context');
      const assistantConfig = vapiService.createAssistantConfig(userContext);
      console.log('🤖 Tạo assistant config:', assistantConfig);

      await vapi.start(assistantConfig);
    } catch (err: any) {
      console.error('❌ Lỗi khi bắt đầu cuộc gọi:', err);
      setError(err.message || 'Không thể bắt đầu cuộc gọi');
      setIsLoading(false);
    }
  }, [userContext]);

  // End call
  const endCall = useCallback(() => {
    const vapi = vapiService.getVapi();
    if (vapi) {
      console.log('📴 Kết thúc cuộc gọi');
      vapi.stop();
    }
  }, []);

  return {
    isConnected,
    isSpeaking,
    isLoading,
    volume,
    error,
    startCall,
    endCall
  };
};
