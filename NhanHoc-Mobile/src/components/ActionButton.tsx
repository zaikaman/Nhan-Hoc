import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onPress?: () => void;
  badge?: boolean;
  backgroundColor?: string;
}

export default function ActionButton({
  icon,
  label,
  onPress,
  badge = false,
  backgroundColor = '#EEF2FF',
}: ActionButtonProps) {
  return (
    <TouchableOpacity
      className="items-center justify-center flex-1"
      style={{ minWidth: 100 }}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        className="w-16 h-16 rounded-2xl items-center justify-center mb-2 relative"
        style={{ backgroundColor }}
      >
        {icon}
        {badge && (
          <View
            className="absolute top-1 right-1 w-2 h-2 rounded-full"
            style={{ backgroundColor: '#EF4444' }}
          />
        )}
      </View>
      <Text className="text-xs text-center font-medium" style={{ color: '#1E293B' }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
