import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

interface VoiceIndicatorProps {
  isRecording: boolean;
  isSpeaking: boolean;
  volume?: number;
}

const VoiceIndicator: React.FC<VoiceIndicatorProps> = ({ 
  isRecording, 
  isSpeaking,
  volume = 0 
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isRecording || isSpeaking) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
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
  }, [isRecording, isSpeaking, pulseAnim]);

  if (!isRecording && !isSpeaking) return null;

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.dot,
          { transform: [{ scale: pulseAnim }] },
          isSpeaking ? styles.dotSpeaking : styles.dotRecording
        ]} 
      />
      <Text style={styles.text}>
        {isRecording ? '🎤 Đang nghe...' : '🔊 AI đang nói...'}
      </Text>
      
      {/* Volume Bar */}
      {volume > 0 && (
        <View style={styles.volumeBarContainer}>
          <View 
            style={[
              styles.volumeBar,
              { width: `${Math.min(volume * 100, 100)}%` }
            ]} 
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 16,
    marginHorizontal: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  dotRecording: {
    backgroundColor: '#ff4444',
  },
  dotSpeaking: {
    backgroundColor: '#4CAF50',
  },
  text: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    flex: 1,
  },
  volumeBarContainer: {
    width: 60,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    overflow: 'hidden',
    marginLeft: 8,
  },
  volumeBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
});

export default VoiceIndicator;
