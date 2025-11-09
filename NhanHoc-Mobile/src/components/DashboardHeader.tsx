import { Feather, Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../constants/theme';

interface DashboardHeaderProps {
  userName?: string;
  onProfilePress?: () => void;
}

export default function DashboardHeader({ userName = 'Học viên', onProfilePress }: DashboardHeaderProps) {
  return (
    <View className="flex-row justify-between items-center mb-6">
      <View className="flex-row items-center">
        <View>
          <Text className="text-sm" style={{ color: '#64748b' }}>Xin chào,</Text>
          <Text className="text-2xl font-bold" style={{ color: '#0f172a' }}>{userName}</Text>
        </View>
        <Ionicons name="hand-right" size={24} color="#FBBF24" style={{ marginLeft: 8 }} />
      </View>
      
      <TouchableOpacity 
        className="w-12 h-12 rounded-full items-center justify-center"
        style={{ 
          backgroundColor: colors.primary,
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 3,
        }}
        onPress={onProfilePress}
      >
        <Feather name="user" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}
