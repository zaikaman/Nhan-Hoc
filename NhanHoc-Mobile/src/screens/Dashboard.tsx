import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import ActionButton from '../components/ActionButton';
import CircularProgress from '../components/CircularProgress';
import { colors } from '../constants/theme';
import { useCourseStore, useQuizStore } from '../stores';
import { DrawerParamList } from '../types';

type DashboardScreenNavigationProp = BottomTabNavigationProp<DrawerParamList, 'Dashboard'>;

interface DashboardProps {
  navigation: DashboardScreenNavigationProp;
}

export default function Dashboard({ navigation }: DashboardProps) {
  // 🔥 Load data từ Zustand stores
  const courses = useCourseStore((state) => state.courses);
  const quizResults = useQuizStore((state) => state.quizResults);

  // Calculate statistics
  const activeCourses = courses.filter(c => c.status === 'active');
  const completedCourses = courses.filter(c => c.status === 'completed');
  const totalSubTopics = courses.reduce((sum, c) => sum + c.totalSubTopics, 0);
  const completedSubTopics = courses.reduce((sum, c) => sum + c.completedSubTopics.length, 0);
  const overallProgress = totalSubTopics > 0 ? Math.round((completedSubTopics / totalSubTopics) * 100) : 0;
  
  // Calculate study time (giả sử mỗi câu quiz = 1 phút)
  const totalMinutes = quizResults.reduce((sum, r) => sum + r.totalQuestions, 0);
  const totalHours = Math.round(totalMinutes / 60);
  
  // Calculate average score
  const averageScore = quizResults.length > 0
    ? Math.round(quizResults.reduce((sum, r) => sum + r.score, 0) / quizResults.length)
    : 0;

  // Calculate streak
  const calculateStreak = () => {
    if (quizResults.length === 0) return 0;
    
    const uniqueDates = Array.from(new Set(
      quizResults.map(r => new Date(r.completedAt).toISOString().split('T')[0])
    )).sort().reverse();
    
    if (uniqueDates.length === 0) return 0;
    
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) {
      return 0;
    }
    
    let streak = 1;
    for (let i = 0; i < uniqueDates.length - 1; i++) {
      const date1 = new Date(uniqueDates[i]);
      const date2 = new Date(uniqueDates[i + 1]);
      const diffDays = Math.floor((date1.getTime() - date2.getTime()) / (1000 * 3600 * 24));
      
      if (diffDays === 1) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const streak = calculateStreak();

  // Get current date info
  const now = new Date();
  const dayNumber = now.getDate();
  const dayName = now.toLocaleDateString('vi-VN', { weekday: 'long' });
  const monthYear = now.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });

  // Week status data - Calculate based on actual quiz results
  const getWeekStatus = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const weekDays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const colors_map = [colors.primary, colors.accent, colors.secondary, colors.primary, colors.accent];
    
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (dayOfWeek - i));
      const dateStr = date.toISOString().split('T')[0];
      
      const hasQuiz = quizResults.some(r => 
        new Date(r.completedAt).toISOString().split('T')[0] === dateStr
      );
      
      return {
        day: weekDays[i],
        completed: hasQuiz,
        color: hasQuiz ? colors_map[i % colors_map.length] : '#E2E8F0',
      };
    });
  };

  const weekStatus = getWeekStatus();

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#F8FAFC' }}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Blue Gradient Header with Border Radius */}
        <LinearGradient
          colors={[colors.primary, colors.secondary, colors.accent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingHorizontal: 24,
            paddingTop: 20,
            paddingBottom: 40,
            borderBottomLeftRadius: 40,
            borderBottomRightRadius: 40,
          }}
        >
          {/* Top Icons */}
          <View className="flex-row justify-center items-center mb-6">
            <Text 
              className="text-4xl font-bold" 
              style={{ 
                color: '#FFFFFF', 
                fontStyle: 'italic',
                letterSpacing: 2,
                textShadowColor: 'rgba(0, 0, 0, 0.3)',
                textShadowOffset: { width: 2, height: 2 },
                textShadowRadius: 4,
                fontWeight: '900',
                textAlign: 'center'
              }}
            >
              Nhàn Học
            </Text>
          </View>

          {/* Quick Action Card */}
          <View className="bg-white rounded-2xl p-4 flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: '#E0F2FE' }}>
                <Ionicons name="calendar" size={20} color={colors.primary} />
              </View>
              <Text className="text-sm font-semibold ml-3" style={{ color: '#1E293B' }}>
                Khoá học hôm nay
              </Text>
            </View>
            <TouchableOpacity 
              className="px-4 py-2 rounded-lg"
              style={{ backgroundColor: colors.accent }}
              onPress={() => navigation.navigate('UploadDocument')}
            >
              <Text className="text-sm font-bold" style={{ color: '#FFFFFF' }}>
                Bắt đầu
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Date Card */}
        <View className="mx-6 -mt-6 mb-6">
          <View 
            className="rounded-2xl p-5"
            style={{ 
              backgroundColor: '#FFFFFF',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 5,
            }}
          >
            <View className="flex-row justify-between items-center mb-4">
              <View className="flex-row items-center">
                <Text className="text-5xl font-bold mr-2" style={{ color: colors.primary }}>
                  {dayNumber}
                </Text>
                <View>
                  <Text className="text-xs font-semibold" style={{ color: '#64748B' }}>
                    {dayName}
                  </Text>
                  <Text className="text-xs" style={{ color: '#94A3B8' }}>
                    {monthYear}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#94A3B8" />
            </View>

            {/* This week status */}
            <Text className="text-xs font-semibold mb-2" style={{ color: '#64748B' }}>
              Trạng thái tuần này
            </Text>
            <View className="flex-row justify-between">
              {weekStatus.map((item, index) => (
                <View key={index} className="items-center">
                  <Text className="text-xs mb-2" style={{ color: '#64748B' }}>
                    {item.day}
                  </Text>
                  <View
                    className="w-8 h-8 rounded-full items-center justify-center"
                    style={{ backgroundColor: item.color }}
                  >
                    {item.completed && (
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Circular Stats */}
        <View className="px-6 mb-6">
          <View 
            className="rounded-2xl p-5 flex-row justify-around"
            style={{ 
              backgroundColor: '#FFFFFF',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <CircularProgress
              percentage={overallProgress}
              value={`${overallProgress}%`}
              label="Tiến độ"
              color={colors.primary}
              size={90}
            />
            <CircularProgress
              percentage={streak > 0 ? Math.min(streak * 10, 100) : 0}
              value={`${streak}`}
              label="Chuỗi ngày"
              color={colors.accent}
              size={90}
            />
            <CircularProgress
              percentage={averageScore}
              value={`${averageScore}%`}
              label="Điểm TB"
              color={colors.secondary}
              size={90}
            />
          </View>
        </View>

        {/* Action Buttons Grid */}
        <View className="px-6 mb-6">
          <View
            className="rounded-2xl p-5"
            style={{ 
              backgroundColor: '#FFFFFF',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            {/* Row 1 */}
            <View className="flex-row mb-6">
              <ActionButton
                icon={<Ionicons name="book" size={28} color={colors.primary} />}
                label="Khóa học"
                backgroundColor="#E0F2FE"
                onPress={() => navigation.navigate('UploadDocument')}
              />
              <ActionButton
                icon={<Ionicons name="stats-chart" size={28} color={colors.accent} />}
                label="Thống kê"
                backgroundColor="#CFFAFE"
                onPress={() => navigation.navigate('Statistics')}
              />
              <ActionButton
                icon={<Ionicons name="document-text" size={28} color={colors.secondary} />}
                label="Tài liệu"
                backgroundColor="#DBEAFE"
                onPress={() => navigation.navigate('UploadDocument')}
              />
            </View>

            {/* Row 2 */}
            <View className="flex-row">
              <ActionButton
                icon={<Ionicons name="bulb" size={28} color={colors.primary} />}
                label="Gợi ý"
                backgroundColor="#E0F2FE"
                onPress={() => navigation.navigate('Recommendations')}
              />
              <ActionButton
                icon={<Ionicons name="document-attach" size={28} color={colors.accent} />}
                label="PDF"
                backgroundColor="#CFFAFE"
                onPress={() => navigation.navigate('PdfAnalysis')}
              />
              <ActionButton
                icon={<Ionicons name="chatbubble-ellipses" size={28} color={colors.secondary} />}
                label="Chatbot"
                backgroundColor="#DBEAFE"
                onPress={() => navigation.navigate('Chat')}
              />
            </View>
          </View>
        </View>

        {/* Create Course Button */}
        <View className="px-6 mb-6">
          <TouchableOpacity
            className="rounded-2xl p-6 flex-row items-center justify-between"
            style={{
              backgroundColor: colors.primary,
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 12,
              elevation: 6,
            }}
            onPress={() => navigation.navigate('UploadDocument')}
            activeOpacity={0.8}
          >
            <View className="flex-row items-center flex-1">
              <View
                className="w-14 h-14 rounded-xl items-center justify-center mr-4"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
              >
                <Ionicons name="add-circle" size={32} color="#FFFFFF" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-bold mb-1" style={{ color: '#FFFFFF' }}>
                  Tạo khóa học mới
                </Text>
                <Text className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  AI sẽ tạo lộ trình học tập cho bạn
                </Text>
              </View>
            </View>
            <Ionicons name="sparkles" size={28} color="#FCD34D" />
          </TouchableOpacity>
        </View>

        {/* Course Summary - Using real data */}
        <View className="px-6 mb-8">
          <View className="flex-row items-center mb-4">
            <MaterialCommunityIcons name="book-open-page-variant" size={24} color={colors.primary} />
            <Text className="text-xl font-bold ml-2" style={{ color: '#0f172a' }}>
              Tổng quan khóa học
            </Text>
          </View>
          
          <View className="rounded-2xl p-5" style={{ backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0' }}>
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center">
                <View className="w-12 h-12 rounded-full items-center justify-center" style={{ backgroundColor: colors.primary }}>
                  <MaterialCommunityIcons name="school" size={24} color="#FFFFFF" />
                </View>
                <View className="ml-3">
                  <Text className="text-2xl font-bold" style={{ color: '#0f172a' }}>{activeCourses.length}</Text>
                  <Text className="text-sm" style={{ color: '#64748b' }}>Khóa học đang học</Text>
                </View>
              </View>
              <View className="items-end">
                <Text className="text-lg font-semibold" style={{ color: colors.accent }}>{overallProgress}%</Text>
                <Text className="text-xs" style={{ color: '#64748b' }}>Hoàn thành</Text>
              </View>
            </View>
            
            <View className="h-px mb-4" style={{ backgroundColor: '#E2E8F0' }} />
            
            <View className="flex-row justify-between">
              <View className="items-center flex-1">
                <Text className="text-xl font-bold" style={{ color: colors.secondary }}>{totalSubTopics}</Text>
                <Text className="text-xs" style={{ color: '#64748b' }}>Chủ đề</Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-xl font-bold" style={{ color: colors.accent }}>{quizResults.length}</Text>
                <Text className="text-xs" style={{ color: '#64748b' }}>Bài quiz</Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-xl font-bold" style={{ color: colors.success }}>{totalHours}h</Text>
                <Text className="text-xs" style={{ color: '#64748b' }}>Học tập</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
