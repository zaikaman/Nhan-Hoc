import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface LessonCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  status: 'completed' | 'in-progress' | 'not-started';
  statusColor: string;
  statusLabel: string;
  backgroundColor: string;
  onPress?: () => void;
}

export default function LessonCard({ 
  icon, 
  title, 
  subtitle, 
  status,
  statusColor,
  statusLabel,
  backgroundColor,
  onPress 
}: LessonCardProps) {
  return (
    <TouchableOpacity 
      className="p-4 rounded-xl flex-row items-center mb-3"
      style={{ 
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
      }}
      onPress={onPress}
    >
      <View 
        className="w-12 h-12 rounded-xl items-center justify-center mr-4"
        style={{ backgroundColor }}
      >
        {icon}
      </View>
      <View className="flex-1">
        <Text className="text-base font-semibold mb-1" style={{ color: '#0f172a' }}>
          {title}
        </Text>
        <Text className="text-xs" style={{ color: '#64748b' }}>
          {subtitle}
        </Text>
      </View>
      <View 
        className="px-3 py-1 rounded-full"
        style={{ backgroundColor: statusColor + '20' }}
      >
        <Text className="text-xs font-semibold" style={{ color: statusColor }}>
          {statusLabel}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
