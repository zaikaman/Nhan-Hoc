import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ApiStatusCard from '../components/ApiStatusCard';
import AppHeader from '../components/AppHeader';
import { colors } from '../constants/theme';

export default function Settings() {
  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#FFFFFF' }}>
      <AppHeader title="Cài đặt" />
      <ScrollView className="flex-1 px-6 pt-4">
        {/* API Status Section */}
        <View className="mb-4">
          <View className="flex-row items-center mb-3">
            <Ionicons name="server-outline" size={22} color={colors.primary} />
            <Text className="text-lg font-bold ml-2" style={{ color: '#0f172a' }}>
              Kết nối Server
            </Text>
          </View>
          <ApiStatusCard />
        </View>

        {/* Other Settings */}
        <View className="mb-4">
          <View className="flex-row items-center mb-3">
            <Ionicons name="settings-outline" size={22} color={colors.secondary} />
            <Text className="text-lg font-bold ml-2" style={{ color: '#0f172a' }}>
              Cài đặt khác
            </Text>
          </View>
          <Text style={{ color: '#64748b' }}>
            Các tính năng đang được phát triển...
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

