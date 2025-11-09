import { Feather, Ionicons } from '@expo/vector-icons';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../components/AppHeader';
import { colors } from '../constants/theme';

type RootStackParamList = {
  Login: undefined;
  Main: undefined;
  Settings: undefined;
};

type TabParamList = {
  Dashboard: undefined;
  Statistics: undefined;
  UploadDocument: undefined;
  Exercises: undefined;
  Profile: undefined;
};

type ProfileScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Profile'>,
  NativeStackNavigationProp<RootStackParamList>
>;

interface ProfileProps {
  navigation: ProfileScreenNavigationProp;
}

export default function Profile({ navigation }: ProfileProps) {
  const user = {
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@email.com',
    avatar: 'https://ui-avatars.com/api/?name=Nguyen+Van+A&background=26648E&color=fff&size=200',
    joinDate: '15/01/2025',
    stats: {
      coursesCreated: 12,
      coursesCompleted: 8,
      totalStudyTime: 45,
      averageScore: 87,
      streak: 15,
    },
  };

  const achievements = [
    { icon: 'flag-outline', iconColor: '#3B82F6', title: 'Người Mới', description: 'Hoàn thành khóa học đầu tiên', unlocked: true },
    { icon: 'flame', iconColor: '#EF4444', title: 'Nhiệt Huyết', description: 'Học 7 ngày liên tục', unlocked: true },
    { icon: 'star', iconColor: '#FBBF24', title: 'Học Giỏi', description: 'Đạt điểm trung bình >85%', unlocked: true },
    { icon: 'book', iconColor: '#8B5CF6', title: 'Đa Năng', description: 'Tạo 10+ khóa học', unlocked: true },
    { icon: 'trophy', iconColor: '#F59E0B', title: 'Chuyên Gia', description: 'Hoàn thành 20+ khóa học', unlocked: false },
    { icon: 'diamond', iconColor: '#06B6D4', title: 'Tinh Túy', description: 'Đạt 100% tất cả bài tập', unlocked: false },
  ];

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement logout logic
            console.log('Logging out...');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#FFFFFF' }}>
      <AppHeader title="Hồ sơ" />
      
      <ScrollView className="flex-1">
        {/* Profile Header */}
        <View className="px-6 pt-6 pb-8 items-center">
          <View
            className="w-28 h-28 rounded-full mb-4"
            style={{
              borderWidth: 4,
              borderColor: colors.accent,
              shadowColor: colors.accent,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 5,
            }}
          >
            <Image
              source={{ uri: user.avatar }}
              className="w-full h-full rounded-full"
            />
          </View>
          
          <Text className="text-2xl font-bold mb-1" style={{ color: '#0f172a' }}>
            {user.name}
          </Text>
          <Text className="text-base mb-2" style={{ color: '#64748b' }}>
            {user.email}
          </Text>
          <View className="flex-row items-center">
            <Ionicons name="calendar-outline" size={14} color="#94a3b8" />
            <Text className="text-sm ml-1" style={{ color: '#94a3b8' }}>
              Tham gia từ {user.joinDate}
            </Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View className="px-6 mb-6">
          <View className="flex-row gap-3 mb-3">
            <View
              className="flex-1 p-4 rounded-2xl items-center"
              style={{
                backgroundColor: '#F8FAFC',
                borderWidth: 1,
                borderColor: '#e2e8f0',
              }}
            >
              <Text className="text-3xl font-bold mb-1" style={{ color: colors.primary }}>
                {user.stats.coursesCreated}
              </Text>
              <Text className="text-xs text-center" style={{ color: '#64748b' }}>
                Khóa học
              </Text>
            </View>

            <View
              className="flex-1 p-4 rounded-2xl items-center"
              style={{
                backgroundColor: '#F8FAFC',
                borderWidth: 1,
                borderColor: '#e2e8f0',
              }}
            >
              <Text className="text-3xl font-bold mb-1" style={{ color: colors.accent }}>
                {user.stats.coursesCompleted}
              </Text>
              <Text className="text-xs text-center" style={{ color: '#64748b' }}>
                Hoàn thành
              </Text>
            </View>

            <View
              className="flex-1 p-4 rounded-2xl items-center"
              style={{
                backgroundColor: '#F8FAFC',
                borderWidth: 1,
                borderColor: '#e2e8f0',
              }}
            >
              <Text className="text-3xl font-bold mb-1" style={{ color: colors.warning }}>
                {user.stats.streak}
              </Text>
              <Text className="text-xs text-center" style={{ color: '#64748b' }}>
                Ngày liên tục
              </Text>
            </View>
          </View>

          <View className="flex-row gap-3">
            <View
              className="flex-1 p-4 rounded-2xl items-center"
              style={{
                backgroundColor: '#F8FAFC',
                borderWidth: 1,
                borderColor: '#e2e8f0',
              }}
            >
              <Text className="text-2xl font-bold mb-1" style={{ color: colors.success }}>
                {user.stats.averageScore}%
              </Text>
              <Text className="text-xs text-center" style={{ color: '#64748b' }}>
                Điểm TB
              </Text>
            </View>

            <View
              className="flex-1 p-4 rounded-2xl items-center"
              style={{
                backgroundColor: '#F8FAFC',
                borderWidth: 1,
                borderColor: '#e2e8f0',
              }}
            >
              <Text className="text-2xl font-bold mb-1" style={{ color: colors.secondary }}>
                {user.stats.totalStudyTime}h
              </Text>
              <Text className="text-xs text-center" style={{ color: '#64748b' }}>
                Học tập
              </Text>
            </View>
          </View>
        </View>

        {/* Achievements */}
        <View className="px-6 mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <Ionicons name="trophy" size={24} color="#F59E0B" />
              <Text className="text-xl font-bold ml-2" style={{ color: '#0f172a' }}>
                Thành tựu
              </Text>
            </View>
            <Text className="text-sm" style={{ color: '#64748b' }}>
              4/6 đã mở khóa
            </Text>
          </View>

          <View className="flex-row flex-wrap gap-3">
            {achievements.map((achievement, index) => (
              <View
                key={index}
                className="p-4 rounded-2xl"
                style={{
                  width: '48%',
                  backgroundColor: achievement.unlocked ? '#FFFFFF' : '#F8FAFC',
                  borderWidth: 1,
                  borderColor: achievement.unlocked ? colors.accent + '30' : '#e2e8f0',
                  opacity: achievement.unlocked ? 1 : 0.6,
                }}
              >
                <View className="mb-2">
                  <Ionicons 
                    name={achievement.icon as any} 
                    size={32} 
                    color={achievement.unlocked ? achievement.iconColor : '#94a3b8'} 
                  />
                </View>
                <Text className="text-sm font-bold mb-1" style={{ color: '#0f172a' }}>
                  {achievement.title}
                </Text>
                <Text className="text-xs" style={{ color: '#64748b' }}>
                  {achievement.description}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View className="px-6 pb-8">
          <TouchableOpacity
            className="flex-row items-center p-4 rounded-xl mb-3"
            style={{
              backgroundColor: '#F8FAFC',
              borderWidth: 1,
              borderColor: '#e2e8f0',
            }}
          >
            <View
              className="w-10 h-10 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: colors.primary + '20' }}
            >
              <Feather name="edit" size={18} color={colors.primary} />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold" style={{ color: '#0f172a' }}>
                Chỉnh sửa hồ sơ
              </Text>
              <Text className="text-xs" style={{ color: '#64748b' }}>
                Cập nhật thông tin cá nhân
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center p-4 rounded-xl mb-3"
            style={{
              backgroundColor: '#F8FAFC',
              borderWidth: 1,
              borderColor: '#e2e8f0',
            }}
            onPress={() => navigation.navigate('Settings')}
          >
            <View
              className="w-10 h-10 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: colors.secondary + '20' }}
            >
              <Feather name="settings" size={18} color={colors.secondary} />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold" style={{ color: '#0f172a' }}>
                Cài đặt
              </Text>
              <Text className="text-xs" style={{ color: '#64748b' }}>
                Tùy chỉnh ứng dụng
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center p-4 rounded-xl"
            style={{
              backgroundColor: '#FEE2E2',
              borderWidth: 1,
              borderColor: '#FECACA',
            }}
            onPress={handleLogout}
          >
            <View
              className="w-10 h-10 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: '#FFFFFF' }}
            >
              <Feather name="log-out" size={18} color="#EF4444" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold" style={{ color: '#EF4444' }}>
                Đăng xuất
              </Text>
              <Text className="text-xs" style={{ color: '#DC2626' }}>
                Thoát khỏi tài khoản
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
