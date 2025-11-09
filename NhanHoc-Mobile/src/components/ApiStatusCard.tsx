/**
 * API Status Component
 * Hiển thị trạng thái kết nối với backend API
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { API_BASE_URL } from '../config/api';
import { testConnection } from '../config/apiTest';
import { colors } from '../constants/theme';

export default function ApiStatusCard() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkConnection = async () => {
    setIsChecking(true);
    try {
      const connected = await testConnection();
      setIsConnected(connected);
      setLastCheck(new Date());
    } catch (error) {
      setIsConnected(false);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  const getStatusColor = () => {
    if (isConnected === null) return '#94A3B8';
    return isConnected ? colors.success : '#EF4444';
  };

  const getStatusText = () => {
    if (isConnected === null) return 'Chưa kiểm tra';
    return isConnected ? 'Đã kết nối' : 'Mất kết nối';
  };

  const getStatusIcon = () => {
    if (isConnected === null) return 'help-circle';
    return isConnected ? 'checkmark-circle' : 'close-circle';
  };

  return (
    <View
      className="rounded-2xl p-5 mb-6"
      style={{
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center flex-1">
          <View
            className="w-10 h-10 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: colors.primary + '20' }}
          >
            <Ionicons name="cloud-outline" size={20} color={colors.primary} />
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold" style={{ color: '#0f172a' }}>
              Trạng thái API
            </Text>
            <Text className="text-xs" style={{ color: '#64748b' }}>
              {API_BASE_URL}
            </Text>
          </View>
        </View>
      </View>

      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          {isChecking ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Ionicons
              name={getStatusIcon() as any}
              size={24}
              color={getStatusColor()}
            />
          )}
          <Text
            className="text-sm font-semibold ml-2"
            style={{ color: getStatusColor() }}
          >
            {isChecking ? 'Đang kiểm tra...' : getStatusText()}
          </Text>
        </View>

        <TouchableOpacity
          className="py-2 px-4 rounded-lg"
          style={{ backgroundColor: colors.primary }}
          onPress={checkConnection}
          disabled={isChecking}
        >
          <Text className="text-xs font-semibold" style={{ color: '#FFFFFF' }}>
            Kiểm tra
          </Text>
        </TouchableOpacity>
      </View>

      {lastCheck && (
        <Text className="text-xs" style={{ color: '#94A3B8' }}>
          Lần kiểm tra cuối: {lastCheck.toLocaleTimeString('vi-VN')}
        </Text>
      )}

      {isConnected === false && (
        <View
          className="mt-3 p-3 rounded-lg"
          style={{ backgroundColor: '#FEF2F2' }}
        >
          <Text className="text-xs" style={{ color: '#EF4444' }}>
            ⚠️ Không thể kết nối đến server. Vui lòng kiểm tra kết nối internet hoặc server có thể đang bảo trì.
          </Text>
        </View>
      )}
    </View>
  );
}
