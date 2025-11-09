import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';

interface UploadButtonProps {
  navigation: any;
  onPress?: () => void;
}

export default function UploadButton({ navigation, onPress }: UploadButtonProps) {
  const [scaleAnim] = useState(new Animated.Value(1));

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      navigation.navigate('UploadDocument');
    }
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        style={{
          backgroundColor: '#5B9BD5',
          borderRadius: 24,
          padding: 24,
          shadowColor: '#5B9BD5',
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.4,
          shadowRadius: 20,
          elevation: 12,
        }}
      >
        {/* Header Section */}
        <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center flex-1">
              <View
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  padding: 12,
                  borderRadius: 16,
                }}
              >
                <MaterialCommunityIcons name="file-pdf-box" size={32} color="#FFFFFF" />
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-2xl font-bold mb-1" style={{ color: '#FFFFFF' }}>
                  Upload PDF
                </Text>
                <View className="flex-row items-center">
                  <View
                    style={{
                      backgroundColor: 'rgba(251, 191, 36, 0.3)',
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      borderRadius: 8,
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  >
                    <Ionicons name="sparkles" size={12} color="#FCD34D" />
                    <Text className="text-xs font-semibold ml-1" style={{ color: '#FCD34D' }}>
                      AI-Powered
                    </Text>
                  </View>
                </View>
              </View>
            </View>
            <View
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                padding: 10,
                borderRadius: 12,
              }}
            >
              <Ionicons name="arrow-forward" size={24} color="#FFFFFF" />
            </View>
          </View>

        {/* Footer Hint */}
        <View className="flex-row items-center justify-center">
          <Ionicons name="cloud-upload-outline" size={16} color="rgba(255, 255, 255, 0.7)" />
          <Text className="text-xs ml-2" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Nhấn để chọn file PDF của bạn
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}
