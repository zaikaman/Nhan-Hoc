import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { DrawerContentComponentProps, DrawerContentScrollView } from '@react-navigation/drawer';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../constants/theme';

interface MenuItem {
  name: string;
  label: string;
  icon: React.ReactNode;
}

const menuItems: MenuItem[] = [
  {
    name: 'Dashboard',
    label: 'Trang chủ',
    icon: <Feather name="home" size={22} color={colors.primary} />,
  },
    {
    name: 'Profile',
    label: 'Hồ sơ',
    icon: <Feather name="user" size={22} color={colors.primary} />,
  },
  {
    name: 'UploadDocument',
    label: 'Upload Tài liệu',
    icon: <Ionicons name="cloud-upload-outline" size={22} color={colors.primary} />,
  },
  {
    name: 'Exercises',
    label: 'Bài tập & Kiểm tra',
    icon: <MaterialCommunityIcons name="file-document-edit-outline" size={22} color={colors.primary} />,
  },
  {
    name: 'Statistics',
    label: 'Thống kê',
    icon: <Ionicons name="stats-chart-outline" size={22} color={colors.primary} />,
  },
  {
    name: 'Settings',
    label: 'Cài đặt',
    icon: <Feather name="settings" size={22} color={colors.primary} />,
  },

];

export default function CustomDrawerContent(props: DrawerContentComponentProps) {
  const { state, navigation } = props;
  const currentRoute = state.routeNames[state.index];

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#FFFFFF' }}>
      <DrawerContentScrollView {...props} scrollEnabled={true}>
        {/* Header */}
        <View className="px-6 py-6 border-b" style={{ borderBottomColor: '#e2e8f0' }}>
          <View 
            className="w-16 h-16 rounded-full items-center justify-center mb-3"
            style={{ backgroundColor: colors.primary }}
          >
            <Text className="text-2xl font-bold" style={{ color: '#FFFFFF' }}>
              NH
            </Text>
          </View>
          <Text className="text-xl font-bold" style={{ color: '#0f172a' }}>
            Nhàn Học
          </Text>
          <Text className="text-sm mt-1" style={{ color: '#64748b' }}>
            Học tập thông minh với AI
          </Text>
        </View>

        {/* Menu Items */}
        <View className="py-4">
          {menuItems.map((item) => {
            const isActive = currentRoute === item.name;
            
            return (
              <TouchableOpacity
                key={item.name}
                className="flex-row items-center px-6 py-4"
                style={{
                  backgroundColor: isActive ? colors.primary + '10' : 'transparent',
                  borderLeftWidth: isActive ? 4 : 0,
                  borderLeftColor: colors.primary,
                }}
                onPress={() => navigation.navigate(item.name)}
              >
                <View className="w-8">{item.icon}</View>
                <Text
                  className="text-base font-semibold ml-3"
                  style={{
                    color: isActive ? colors.primary : '#64748b',
                  }}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </DrawerContentScrollView>

      {/* Footer */}
      <View className="px-6 py-4 border-t" style={{ borderTopColor: '#e2e8f0' }}>
        <TouchableOpacity
          className="flex-row items-center py-3"
          onPress={() => {
            // Handle logout
            navigation.navigate('Login');
          }}
        >
          <Feather name="log-out" size={22} color="#ef4444" />
          <Text className="text-base font-semibold ml-3" style={{ color: '#ef4444' }}>
            Đăng xuất
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
