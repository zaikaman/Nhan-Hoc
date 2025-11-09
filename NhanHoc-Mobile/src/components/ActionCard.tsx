import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

interface ActionCardProps {
  icon: React.ReactNode;
  label: string;
  onPress?: () => void;
}

export default function ActionCard({ icon, label, onPress }: ActionCardProps) {
  return (
    <TouchableOpacity 
      className="flex-1 min-w-[45%] p-4 rounded-xl items-center"
      style={{ 
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#e2e8f0'
      }}
      onPress={onPress}
    >
      {icon}
      <Text className="text-sm font-semibold mt-2" style={{ color: '#0f172a' }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
