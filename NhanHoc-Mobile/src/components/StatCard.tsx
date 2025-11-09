import React from 'react';
import { Text, View } from 'react-native';

interface StatCardProps {
  value: string | number;
  label: string;
  color: string;
}

export default function StatCard({ value, label, color }: StatCardProps) {
  return (
    <View 
      className="flex-1 p-4 rounded-2xl"
      style={{ 
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#e2e8f0'
      }}
    >
      <Text className="text-3xl font-bold mb-1" style={{ color }}>{value}</Text>
      <Text className="text-xs" style={{ color: '#64748b' }}>{label}</Text>
    </View>
  );
}
