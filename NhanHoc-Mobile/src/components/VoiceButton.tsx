import { Mic, MicOff } from 'lucide-react-native';
import React from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';

interface VoiceButtonProps {
  isConnected: boolean;
  isLoading: boolean;
  onStart: () => void;
  onStop: () => void;
  disabled?: boolean;
}

const VoiceButton: React.FC<VoiceButtonProps> = ({ 
  isConnected, 
  isLoading, 
  onStart, 
  onStop,
  disabled = false
}) => {
  const handlePress = () => {
    if (isConnected) {
      onStop();
    } else {
      onStart();
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isConnected && styles.buttonActive,
        (disabled || isLoading) && styles.buttonDisabled
      ]}
      onPress={handlePress}
      disabled={disabled || isLoading}
      activeOpacity={0.7}
    >
      {isLoading ? (
        <ActivityIndicator color={isConnected ? "#fff" : "#666"} size="small" />
      ) : isConnected ? (
        <MicOff size={24} color="#fff" />
      ) : (
        <Mic size={24} color="#666" />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonActive: {
    backgroundColor: '#ff4444',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});

export default VoiceButton;
