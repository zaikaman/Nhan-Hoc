import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Dimensions, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { AIInsights, getAnalyticsInsights } from '../api/analyticsApi';
import AppHeader from '../components/AppHeader';
import { colors } from '../constants/theme';
import { useInitializeStores } from '../hooks/useInitializeStores';
import { getLearningDataForAnalytics } from '../services/localStorage';
import { useCourseStore, useQuizStore } from '../stores';

const screenWidth = Dimensions.get('window').width;

// 🔥 Helper functions - Định nghĩa ngoài component để tránh lỗi
const calculateWeekData = (quizResults: any[]) => {
  const today = new Date();
  const last7Days = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    last7Days.push(date);
  }

  const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  
  return last7Days.map(date => {
    const dateStr = date.toISOString().split('T')[0];
    const dayQuizzes = quizResults.filter(result => {
      const resultDate = new Date(result.completedAt).toISOString().split('T')[0];
      return resultDate === dateStr;
    });

    const hours = (dayQuizzes.reduce((sum, q) => sum + q.totalQuestions, 0) / 60);
    
    return {
      day: dayNames[date.getDay()],
      hours: parseFloat(hours.toFixed(1)),
      exercises: dayQuizzes.length,
    };
  });
};

const calculateStreak = (quizResults: any[]) => {
  if (quizResults.length === 0) return 0;

  // Lấy các ngày unique đã làm quiz
  const uniqueDates = Array.from(new Set(
    quizResults.map(result => new Date(result.completedAt).toISOString().split('T')[0])
  )).sort().reverse();

  if (uniqueDates.length === 0) return 0;

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  // Kiểm tra xem có học hôm nay hoặc hôm qua không
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

export default function Statistics() {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');
  const [aiInsightsLoading, setAiInsightsLoading] = useState(false);
  const [aiInsights, setAiInsights] = useState<AIInsights | null>(null);
  
  // 🔥 Khởi tạo stores từ localStorage
  const { isInitialized } = useInitializeStores();
  
  // 🔥 Sử dụng Zustand stores - TỰ ĐỘNG CẬP NHẬT khi data thay đổi
  const courses = useCourseStore((state) => state.courses);
  const quizResults = useQuizStore((state) => state.quizResults);
  const hasHydrated = useCourseStore((state) => state._hasHydrated) && 
                      useQuizStore((state) => state._hasHydrated);

  // 🔥 Tính toán statistics từ Zustand stores - TỰ ĐỘNG RE-RENDER khi data thay đổi
  const statistics = useMemo(() => {
    // Tính tổng thời gian học (từ quiz - giả sử mỗi câu hỏi mất 1 phút)
    const totalTimeMinutes = quizResults.reduce((sum, result) => {
      return sum + result.totalQuestions;
    }, 0);
    const totalHours = totalTimeMinutes / 60;

    // Tổng số bài tập (quiz)
    const totalExercises = quizResults.length;

    // Điểm trung bình
    const avgScore = quizResults.length > 0
      ? Math.round(quizResults.reduce((sum, result) => sum + result.score, 0) / quizResults.length)
      : 0;

    // Subjects progress (từ courses)
    const subjects = courses.map(course => ({
      name: course.topic,
      progress: course.progress,
      color: course.color,
      icon: course.icon,
    }));

    // Study data per week (từ quiz results trong 7 ngày gần nhất)
    const weekData = calculateWeekData(quizResults);

    // Calculate streak
    const streak = calculateStreak(quizResults);

    return {
      totalHours,
      totalExercises,
      avgScore,
      subjects,
      studyData: { week: weekData },
      streak,
    };
  }, [courses, quizResults]); // 🔥 Tự động recalculate khi courses hoặc quizResults thay đổi

  const loadAIInsights = async () => {
    try {
      setAiInsightsLoading(true);
      const learningData = await getLearningDataForAnalytics();
      const insights = await getAnalyticsInsights(learningData);
      setAiInsights(insights);
    } catch (error) {
      console.error('Error loading AI insights:', error);
    } finally {
      setAiInsightsLoading(false);
    }
  };

  // 🔥 Lấy maxHours từ statistics
  const maxHours = Math.max(...statistics.studyData.week.map((d: any) => d.hours), 0.1);

  // 🔥 Hiển thị loading khi chưa hydrate hoặc chưa initialize xong
  if (!hasHydrated || !isInitialized) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: '#FFFFFF' }}>
        <AppHeader title="Thống kê" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text className="mt-4 text-base" style={{ color: '#64748b' }}>
            {!hasHydrated ? 'Đang khôi phục dữ liệu...' : 'Đang tải thống kê...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#FFFFFF' }}>
      <AppHeader title="Thống kê bằng AI" />
      
      <ScrollView className="flex-1">
        {/* Period Selector */}
        {/* <View className="px-6 pt-6 pb-4">
          <View
            className="flex-row p-1 rounded-xl"
            style={{ backgroundColor: '#F8FAFC' }}
          >
            {(['week', 'month', 'year'] as const).map((period) => (
              <TouchableOpacity
                key={period}
                className="flex-1 py-2.5 rounded-lg items-center"
                style={{
                  backgroundColor: selectedPeriod === period ? '#FFFFFF' : 'transparent',
                  shadowColor: selectedPeriod === period ? '#000' : 'transparent',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: selectedPeriod === period ? 2 : 0,
                }}
                onPress={() => setSelectedPeriod(period)}
              >
                <Text
                  className="text-sm font-semibold"
                  style={{ color: selectedPeriod === period ? colors.primary : '#64748b' }}
                >
                  {period === 'week' ? 'Tuần' : period === 'month' ? 'Tháng' : 'Năm'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View> */}

        {/* Summary Cards */}
        <View className="px-6 mb-6 pt-6">
          <View className="flex-row gap-3 mb-3">
            <View
              className="flex-1 p-4 rounded-2xl"
              style={{
                backgroundColor: colors.primary + '10',
                borderWidth: 1,
                borderColor: colors.primary + '30',
              }}
            >
              <Ionicons name="time" size={24} color={colors.primary} />
              <Text className="text-2xl font-bold mt-2" style={{ color: colors.primary }}>
                {statistics.totalHours.toFixed(1)}h
              </Text>
              <Text className="text-xs" style={{ color: '#64748b' }}>
                Thời gian học
              </Text>
            </View>

            <View
              className="flex-1 p-4 rounded-2xl"
              style={{
                backgroundColor: colors.accent + '10',
                borderWidth: 1,
                borderColor: colors.accent + '30',
              }}
            >
              <Ionicons name="checkmark-done" size={24} color={colors.accent} />
              <Text className="text-2xl font-bold mt-2" style={{ color: colors.accent }}>
                {statistics.totalExercises}
              </Text>
              <Text className="text-xs" style={{ color: '#64748b' }}>
                Bài tập
              </Text>
            </View>

            <View
              className="flex-1 p-4 rounded-2xl"
              style={{
                backgroundColor: colors.success + '10',
                borderWidth: 1,
                borderColor: colors.success + '30',
              }}
            >
              <Ionicons name="trophy" size={24} color={colors.success} />
              <Text className="text-2xl font-bold mt-2" style={{ color: colors.success }}>
                {statistics.avgScore}%
              </Text>
              <Text className="text-xs" style={{ color: '#64748b' }}>
                Điểm TB
              </Text>
            </View>
          </View>
        </View>

        {/* Study Time Chart */}
        <View className="px-6 mb-6">
          <View className="flex-row items-center mb-4">
            <Ionicons name="bar-chart" size={22} color="#3B82F6" />
            <Text className="text-lg font-bold ml-2" style={{ color: '#0f172a' }}>
              Thời gian học
            </Text>
          </View>
          
          <View
            className="p-5 rounded-2xl"
            style={{
              backgroundColor: '#FFFFFF',
              borderWidth: 1,
              borderColor: '#e2e8f0',
            }}
          >
            <View className="flex-row items-end justify-between" style={{ height: 180 }}>
              {statistics.studyData.week.map((data: any, index: number) => {
                const barHeight = (data.hours / maxHours) * 140;
                return (
                  <View key={index} className="items-center flex-1">
                    <View
                      className="w-full items-center justify-end"
                      style={{ height: 150 }}
                    >
                      <View
                        className="rounded-t-lg w-9"
                        style={{
                          height: barHeight,
                          backgroundColor: data.hours > 3 ? colors.primary : colors.secondary,
                        }}
                      />
                    </View>
                    <Text className="text-xs mt-2" style={{ color: '#64748b' }}>
                      {data.day}
                    </Text>
                    <Text className="text-xs font-bold" style={{ color: '#0f172a' }}>
                      {data.hours}h
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* Subject Progress */}
        <View className="px-6 mb-6">
          <View className="flex-row items-center mb-4">
            <Ionicons name="book" size={22} color="#8B5CF6" />
            <Text className="text-lg font-bold ml-2" style={{ color: '#0f172a' }}>
              Tiến độ theo môn
            </Text>
          </View>

          {statistics.subjects.map((subject: any, index: number) => (
            <View
              key={index}
              className="mb-3 p-4 rounded-2xl"
              style={{
                backgroundColor: '#FFFFFF',
                borderWidth: 1,
                borderColor: '#e2e8f0',
              }}
            >
              <View className="flex-row items-center mb-3">
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: subject.color + '20' }}
                >
                  <Ionicons name={subject.icon as any} size={20} color={subject.color} />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold" style={{ color: '#0f172a' }}>
                    {subject.name}
                  </Text>
                  <Text className="text-xs" style={{ color: '#64748b' }}>
                    {subject.progress}% hoàn thành
                  </Text>
                </View>
                <Text className="text-lg font-bold" style={{ color: subject.color }}>
                  {subject.progress}%
                </Text>
              </View>

              <View
                className="h-2 rounded-full overflow-hidden"
                style={{ backgroundColor: '#F1F5F9' }}
              >
                <View
                  className="h-full rounded-full"
                  style={{
                    backgroundColor: subject.color,
                    width: `${subject.progress}%`,
                  }}
                />
              </View>
            </View>
          ))}
        </View>

        {/* Learning Streak */}
        <View className="px-6 pb-4">
          <View className="flex-row items-center mb-4">
            <Ionicons name="flame" size={22} color="#EF4444" />
            <Text className="text-lg font-bold ml-2" style={{ color: '#0f172a' }}>
              Chuỗi học tập
            </Text>
          </View>

          <View
            className="p-6 rounded-2xl items-center"
            style={{
              backgroundColor: '#FEF2F2',
              borderWidth: 1,
              borderColor: '#FEE2E2',
            }}
          >
            <Ionicons name="flame" size={80} color="#EF4444" />
            <Text className="text-4xl font-bold mb-2" style={{ color: '#DC2626' }}>
              {statistics.streak} ngày
            </Text>
            <Text className="text-sm text-center" style={{ color: '#64748b' }}>
              {statistics.streak > 0 
                ? `Bạn đã học liên tục ${statistics.streak} ngày! Hãy tiếp tục phát huy!`
                : 'Hãy bắt đầu chuỗi học tập của bạn ngay hôm nay!'
              }
            </Text>
          </View>
        </View>

        {/* AI Driven Insights */}
        <View className="px-6 pb-8">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <Ionicons name="sparkles" size={22} color="#8B5CF6" />
              <Text className="text-lg font-bold ml-2" style={{ color: '#0f172a' }}>
                AI Insights
              </Text>
            </View>
            {!aiInsights && (
              <TouchableOpacity
                onPress={loadAIInsights}
                disabled={aiInsightsLoading}
                className="px-4 py-2 rounded-lg"
                style={{ backgroundColor: colors.primary }}
              >
                {aiInsightsLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text className="text-sm font-semibold" style={{ color: '#FFFFFF' }}>
                    Tạo đánh giá
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </View>

          {aiInsights ? (
            <View>
              {/* Summary */}
              <View
                className="p-4 rounded-2xl mb-3"
                style={{
                  backgroundColor: '#F0F9FF',
                  borderWidth: 1,
                  borderColor: '#BAE6FD',
                }}
              >
                <Text className="text-sm leading-6" style={{ color: '#0c4a6e' }}>
                  {aiInsights.summary}
                </Text>
              </View>

              {/* Strengths */}
              {aiInsights.strengths && aiInsights.strengths.length > 0 && (
                <View className="mb-3">
                  <Text className="text-base font-semibold mb-2" style={{ color: '#0f172a' }}>
                    💪 Điểm mạnh
                  </Text>
                  {aiInsights.strengths.map((strength, index) => (
                    <View
                      key={index}
                      className="p-3 rounded-xl mb-2"
                      style={{
                        backgroundColor: '#DCFCE7',
                        borderWidth: 1,
                        borderColor: '#BBF7D0',
                      }}
                    >
                      <View className="flex-row items-center justify-between mb-1">
                        <Text className="text-sm font-semibold" style={{ color: '#166534' }}>
                          {strength.area}
                        </Text>
                        <Text className="text-xs font-bold px-2 py-1 rounded-full" style={{ backgroundColor: '#86EFAC', color: '#166534' }}>
                          {strength.score}/10
                        </Text>
                      </View>
                      <Text className="text-xs" style={{ color: '#15803d' }}>
                        {strength.description}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Weaknesses */}
              {aiInsights.weaknesses && aiInsights.weaknesses.length > 0 && (
                <View className="mb-3">
                  <Text className="text-base font-semibold mb-2" style={{ color: '#0f172a' }}>
                    📈 Cần cải thiện
                  </Text>
                  {aiInsights.weaknesses.map((weakness, index) => (
                    <View
                      key={index}
                      className="p-3 rounded-xl mb-2"
                      style={{
                        backgroundColor: '#FEF3C7',
                        borderWidth: 1,
                        borderColor: '#FDE68A',
                      }}
                    >
                      <View className="flex-row items-center justify-between mb-1">
                        <Text className="text-sm font-semibold" style={{ color: '#92400e' }}>
                          {weakness.area}
                        </Text>
                        <Text className="text-xs font-bold px-2 py-1 rounded-full" style={{ backgroundColor: '#FCD34D', color: '#92400e' }}>
                          {weakness.score}/10
                        </Text>
                      </View>
                      <Text className="text-xs mb-1" style={{ color: '#a16207' }}>
                        {weakness.description}
                      </Text>
                      <Text className="text-xs font-semibold" style={{ color: '#78350f' }}>
                        💡 {weakness.improvement_tips}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Recommendations */}
              {aiInsights.recommendations && aiInsights.recommendations.length > 0 && (
                <View className="mb-3">
                  <Text className="text-base font-semibold mb-2" style={{ color: '#0f172a' }}>
                    🎯 Gợi ý
                  </Text>
                  {aiInsights.recommendations.map((rec, index) => (
                    <View
                      key={index}
                      className="p-3 rounded-xl mb-2"
                      style={{
                        backgroundColor: '#EDE9FE',
                        borderWidth: 1,
                        borderColor: '#DDD6FE',
                      }}
                    >
                      <View className="flex-row items-center justify-between mb-1">
                        <Text className="text-sm font-semibold flex-1" style={{ color: '#5b21b6' }}>
                          {rec.title}
                        </Text>
                        <Text 
                          className="text-xs font-bold px-2 py-1 rounded-full ml-2"
                          style={{ 
                            backgroundColor: rec.priority === 'high' ? '#FCA5A5' : rec.priority === 'medium' ? '#FCD34D' : '#93C5FD',
                            color: rec.priority === 'high' ? '#991B1B' : rec.priority === 'medium' ? '#92400E' : '#1E3A8A'
                          }}
                        >
                          {rec.priority === 'high' ? 'Cao' : rec.priority === 'medium' ? 'TB' : 'Thấp'}
                        </Text>
                      </View>
                      <Text className="text-xs mb-2" style={{ color: '#6b21a8' }}>
                        {rec.description}
                      </Text>
                      {rec.action_items && rec.action_items.length > 0 && (
                        <View>
                          {rec.action_items.map((action, idx) => (
                            <Text key={idx} className="text-xs mb-1" style={{ color: '#7c3aed' }}>
                              • {action}
                            </Text>
                          ))}
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              )}

              {/* Next Focus */}
              {aiInsights.next_focus && (
                <View
                  className="p-4 rounded-2xl"
                  style={{
                    backgroundColor: '#FFF7ED',
                    borderWidth: 1,
                    borderColor: '#FFEDD5',
                  }}
                >
                  <Text className="text-sm font-semibold mb-1" style={{ color: '#9a3412' }}>
                    🎓 Tiếp theo nên học
                  </Text>
                  <Text className="text-sm" style={{ color: '#c2410c' }}>
                    {aiInsights.next_focus}
                  </Text>
                </View>
              )}

              {/* Refresh Button */}
              <TouchableOpacity
                onPress={loadAIInsights}
                disabled={aiInsightsLoading}
                className="mt-3 p-3 rounded-xl items-center flex-row justify-center"
                style={{ backgroundColor: '#F1F5F9' }}
              >
                {aiInsightsLoading ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <>
                    <Ionicons name="refresh" size={16} color={colors.primary} />
                    <Text className="text-sm font-semibold ml-2" style={{ color: colors.primary }}>
                      Làm mới đánh giá
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View
              className="p-6 rounded-2xl items-center"
              style={{
                backgroundColor: '#F8FAFC',
                borderWidth: 1,
                borderColor: '#E2E8F0',
              }}
            >
              <Ionicons name="analytics-outline" size={60} color="#94A3B8" />
              <Text className="text-base font-semibold mt-3 mb-2" style={{ color: '#475569' }}>
                Phân tích AI về quá trình học
              </Text>
              <Text className="text-sm text-center mb-4" style={{ color: '#64748b' }}>
                AI sẽ phân tích dữ liệu học tập của bạn và đưa ra những insights hữu ích
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
