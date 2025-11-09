import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { createRoadmap, pollRoadmapStatus, type RoadmapJobStatus } from '../api';
import AppHeader from '../components/AppHeader';
import { colors } from '../constants/theme';
import type { Course } from '../services/localStorage';
import * as localStorage from '../services/localStorage';
import { useCourseStore, useQuizStore } from '../stores';

interface GenerateOptions {
  audienceLevel: 'beginner' | 'intermediate' | 'advanced';
  lessonCount: number;
  includeQuiz: boolean;
  quizPerLesson: number;
}

interface UploadDocumentProps {
  navigation: any;
}

export default function UploadDocument({ navigation }: UploadDocumentProps) {
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [options, setOptions] = useState<GenerateOptions>({
    audienceLevel: 'intermediate',
    lessonCount: 5,
    includeQuiz: true,
    quizPerLesson: 10,
  });

  // 🔥 Thêm state và hooks để load danh sách courses
  const [selectedTab, setSelectedTab] = useState<'active' | 'completed'>('active');
  const courses = useCourseStore((state) => state.courses);
  const quizResults = useQuizStore((state) => state.quizResults);
  const setCourses = useCourseStore((state) => state.setCourses);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    activeCourses: 0,
    averageScore: 0,
  });

  // Load courses when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadCourses();
    }, [quizResults])
  );

  const loadCourses = async () => {
    try {
      setLoading(true);
      const allCourses = await localStorage.getAllCourses();
      setCourses(allCourses);

      const totalQuizzes = quizResults.length;
      const activeCourses = allCourses.filter(c => c.status === 'active').length;
      const averageScore = quizResults.length > 0
        ? Math.round(quizResults.reduce((sum, r) => sum + r.score, 0) / quizResults.length)
        : 0;

      setStats({
        totalQuizzes,
        activeCourses,
        averageScore,
      });
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const activeCourses = courses.filter(c => c.status === 'active');
  const completedCourses = courses.filter(c => c.status === 'completed');
  const displayedCourses = selectedTab === 'active' ? activeCourses : completedCourses;

  const handleCoursePress = (course: Course) => {
    navigation.navigate('RoadmapDetail', {
      roadmap: course.roadmap,
      topic: course.topic,
      description: course.description,
      courseId: course.id,
    });
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập chủ đề học tập!');
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setStatusMessage('Đang khởi tạo...');

    try {
      // Convert audienceLevel to knowledge_level format
      const knowledgeLevelMap = {
        'beginner': 'Beginner' as const,
        'intermediate': 'Intermediate' as const,
        'advanced': 'Advanced' as const,
      };
      
      const knowledgeLevel = knowledgeLevelMap[options.audienceLevel];
      const studyTime = `${options.lessonCount} lessons`;
      
      setStatusMessage('Đang gửi yêu cầu đến AI...');
      
      // Chỉ tạo roadmap
      const roadmapResponse = await createRoadmap({
        topic: topic.trim(),
        time: studyTime,
        knowledge_level: knowledgeLevel,
      });

      setStatusMessage('Đang xử lý...');
      setProgress(20);

      // Poll roadmap status
      const roadmapResult = await pollRoadmapStatus(
        roadmapResponse.job_id,
        (status: RoadmapJobStatus) => {
          if (status.status === 'processing') {
            setProgress((prev) => Math.min(prev + 5, 90));
            setStatusMessage('AI đang tạo lộ trình học tập...');
          }
        },
        60,
        2000
      );

      if (roadmapResult.status === 'completed') {
        setProgress(100);
        setStatusMessage('Hoàn thành!');
        
        // Navigate to roadmap detail screen (không có resource)
        navigation.navigate('RoadmapDetail', {
          roadmap: roadmapResult.result,
          topic: topic.trim(),
          description: description.trim(),
          quizQuestionsPerLesson: options.quizPerLesson,
          knowledgeLevel,
          studyTime,
        });
        
        // Reset form
        setTopic('');
        setDescription('');
        setProgress(0);
        setStatusMessage('');
      } else {
        throw new Error(roadmapResult.error || 'Không thể tạo lộ trình học tập');
      }
    } catch (error: any) {
      console.error('Error generating roadmap:', error);
      setProgress(0);
      setStatusMessage('');
      
      Alert.alert(
        'Lỗi',
        error.message || 'Không thể tạo lộ trình học tập. Vui lòng thử lại.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#FFFFFF' }}>
      <AppHeader title="Khoá học với AI" />
      <ScrollView className="flex-1 px-6 pt-6">
        {/* Page Description */}
        {/* <View className="mb-6">
          <View className="flex-row items-center mb-2">
            <Ionicons name="bulb" size={28} color={colors.primary} />
            <Text className="text-2xl font-bold ml-2" style={{ color: '#0f172a' }}>
              Tạo lộ trình với AI
            </Text>
          </View>
          <Text className="text-base leading-6" style={{ color: '#64748b' }}>
            Nhập chủ đề bạn muốn học và AI sẽ tự động tạo lộ trình học tập hoàn chỉnh với bài giảng và bài kiểm tra.
          </Text>
        </View> */}

        {/* Input Form */}
        <View className="mb-6">
            <View className="flex-row items-center">
              <View className="flex-1 h-px" style={{ backgroundColor: '#e2e8f0' }} />
              <Text className="mx-4 text-sm font-semibold" style={{ color: '#94a3b8' }}>
                Tạo khoá học mới bằng AI
              </Text>
              <View className="flex-1 h-px" style={{ backgroundColor: '#e2e8f0' }} />
            </View>
          </View>
        <View
          className="rounded-2xl p-6 mb-6"
          style={{
            backgroundColor: '#FFFFFF',
            borderWidth: 1,
            borderColor: '#e2e8f0',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          {/* Topic Input */}
          <View className="mb-5">
            <View className="flex-row items-center mb-2">
              <Ionicons name="school-outline" size={20} color={colors.primary} />
              <Text className="text-sm font-semibold ml-2" style={{ color: '#64748b' }}>
                Chủ đề học tập <Text style={{ color: '#EF4444' }}>*</Text>
              </Text>
            </View>
            <TextInput
              style={{
                backgroundColor: '#F8FAFC',
                borderWidth: 1,
                borderColor: topic ? colors.primary : '#e2e8f0',
                color: '#0f172a',
                paddingHorizontal: 16,
                paddingTop: 12,
                paddingBottom: 12,
                borderRadius: 12,
                fontSize: 16,
                height: 48,
                includeFontPadding: false,
                textAlignVertical: 'center',
              }}
              placeholder="VD: Lập trình Python cơ bản"
              placeholderTextColor="#94a3b8"
              value={topic}
              onChangeText={setTopic}
              autoCapitalize="sentences"
              numberOfLines={1}
            />
          </View>

          {/* Description Input
          <View className="mb-5">
            <View className="flex-row items-center mb-2">
              <Ionicons name="document-text-outline" size={20} color={colors.secondary} />
              <Text className="text-sm font-semibold ml-2" style={{ color: '#64748b' }}>
                Mô tả chi tiết (tùy chọn)
              </Text>
            </View>
            <TextInput
              className="px-4 py-3 rounded-xl text-base"
              style={{
                backgroundColor: '#F8FAFC',
                borderWidth: 1,
                borderColor: description ? colors.secondary : '#e2e8f0',
                color: '#0f172a',
                minHeight: 100,
                textAlignVertical: 'top',
              }}
              placeholder="Thêm thông tin về những gì bạn muốn học..."
              placeholderTextColor="#94a3b8"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              autoCapitalize="sentences"
            />
          </View> */}

          {/* Options Section */}
          <View className="mb-5">
            <View className="flex-row items-center mb-3">
              <Ionicons name="settings-outline" size={20} color="#6366F1" />
              <Text className="text-base font-bold ml-2" style={{ color: '#0f172a' }}>
                Tùy chọn khoá học
              </Text>
            </View>

            {/* Lesson Count */}
            <View className="mb-4">
              <Text className="text-sm font-semibold mb-2" style={{ color: '#64748b' }}>
                Số bài học: {options.lessonCount}
              </Text>
              <View className="flex-row gap-2">
                {[3, 5, 7, 10].map((count) => (
                  <TouchableOpacity
                    key={count}
                    className="flex-1 py-3 rounded-xl items-center"
                    style={{
                      backgroundColor: options.lessonCount === count ? colors.accent : '#F8FAFC',
                      borderWidth: 1,
                      borderColor: options.lessonCount === count ? colors.accent : '#e2e8f0',
                    }}
                    onPress={() => setOptions({ ...options, lessonCount: count })}
                  >
                    <Text
                      className="text-sm font-semibold"
                      style={{ color: options.lessonCount === count ? '#FFFFFF' : '#64748b' }}
                    >
                      {count}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Quiz Toggle */}
            <TouchableOpacity
              className="flex-row items-center justify-between py-3 px-4 rounded-xl mb-3"
              style={{ backgroundColor: '#F8FAFC' }}
              onPress={() => setOptions({ ...options, includeQuiz: !options.includeQuiz })}
            >
              <View className="flex-row items-center flex-1">
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={options.includeQuiz ? colors.success : '#cbd5e1'}
                />
                <Text className="text-sm font-medium ml-3" style={{ color: '#0f172a' }}>
                  Thêm bài kiểm tra (Quiz)
                </Text>
              </View>
            </TouchableOpacity>

            {/* Quiz Count */}
            {options.includeQuiz && (
              <View className="ml-4">
                <Text className="text-sm font-semibold mb-2" style={{ color: '#64748b' }}>
                  Số câu hỏi mỗi bài: {options.quizPerLesson}
                </Text>
                <View className="flex-row gap-2">
                  {[5, 10, 15, 20].map((count) => (
                    <TouchableOpacity
                      key={count}
                      className="flex-1 py-2 rounded-lg items-center"
                      style={{
                        backgroundColor: options.quizPerLesson === count ? colors.secondary : '#F8FAFC',
                        borderWidth: 1,
                        borderColor: options.quizPerLesson === count ? colors.secondary : '#e2e8f0',
                      }}
                      onPress={() => setOptions({ ...options, quizPerLesson: count })}
                    >
                      <Text
                        className="text-xs font-semibold"
                        style={{ color: options.quizPerLesson === count ? '#FFFFFF' : '#64748b' }}
                      >
                        {count}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* Generate Button */}
          <TouchableOpacity
            className="py-4 rounded-xl items-center"
            style={{
              backgroundColor: colors.primary,
              opacity: isGenerating ? 0.7 : 1,
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 5,
            }}
            onPress={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <View className="items-center">
                <ActivityIndicator color="#FFFFFF" />
                <Text className="text-sm font-semibold mt-2" style={{ color: '#FFFFFF' }}>
                  {statusMessage} {progress}%
                </Text>
              </View>
            ) : (
              <View className="flex-row items-center">
                <Ionicons name="sparkles" size={20} color="#FFFFFF" />
                <Text className="text-base font-bold ml-2" style={{ color: '#FFFFFF' }}>
                  Tạo khoá học với AI
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Progress Bar */}
          {isGenerating && (
            <View className="mt-4">
              <View 
                className="h-2 rounded-full overflow-hidden"
                style={{ backgroundColor: '#E5E7EB' }}
              >
                <View 
                  className="h-full rounded-full"
                  style={{ 
                    backgroundColor: colors.accent,
                    width: `${progress}%`,
                  }}
                />
              </View>
              {statusMessage && (
                <Text className="text-xs text-center mt-2" style={{ color: '#64748b' }}>
                  {statusMessage}
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Features Info */}
        <View className="mb-8">
          <View className="flex-row items-center mb-4">
            <Ionicons name="sparkles" size={22} color="#A855F7" />
            <Text className="text-lg font-bold ml-2" style={{ color: '#0f172a' }}>
              AI sẽ tạo cho bạn
            </Text>
          </View>
          
          <View className="space-y-3">
            {[
              { icon: 'map-outline', color: '#3B82F6', title: 'Lộ trình học tập', desc: 'Cấu trúc bài học logic và chi tiết' },
              { icon: 'book-outline', color: '#10B981', title: 'Nội dung bài giảng', desc: 'Giải thích dễ hiểu, ví dụ sinh động' },
              { icon: 'help-circle-outline', color: '#F59E0B', title: 'Bài kiểm tra', desc: 'Câu hỏi trắc nghiệm đa dạng' },
              { icon: 'trending-up-outline', color: '#8B5CF6', title: 'Theo dõi tiến độ', desc: 'Thống kê và đánh giá kết quả' },
            ].map((feature, index) => (
              <View
                key={index}
                className="flex-row items-center p-4 rounded-xl"
                style={{ backgroundColor: '#F8FAFC' }}
              >
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: feature.color + '20' }}
                >
                  <Ionicons name={feature.icon as any} size={20} color={feature.color} />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold mb-0.5" style={{ color: '#0f172a' }}>
                    {feature.title}
                  </Text>
                  <Text className="text-xs" style={{ color: '#64748b' }}>
                    {feature.desc}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Divider */}
        {courses.length > 0 && (
          <View className="mb-6">
            <View className="flex-row items-center">
              <View className="flex-1 h-px" style={{ backgroundColor: '#e2e8f0' }} />
              <Text className="mx-4 text-sm font-semibold" style={{ color: '#94a3b8' }}>
                Các khoá học của bạn
              </Text>
              <View className="flex-1 h-px" style={{ backgroundColor: '#e2e8f0' }} />
            </View>
          </View>
        )}

        {/* Stats Overview */}
        {courses.length > 0 && (
          <View className="mb-4">
            <View className="flex-row gap-3">
              <View
                className="flex-1 p-4 rounded-2xl"
                style={{
                  backgroundColor: colors.primary + '10',
                  borderWidth: 1,
                  borderColor: colors.primary + '30',
                }}
              >
                <Ionicons name="trophy" size={24} color={colors.primary} />
                <Text className="text-2xl font-bold mt-2" style={{ color: colors.primary }}>
                  {stats.totalQuizzes}
                </Text>
                <Text className="text-xs" style={{ color: '#64748b' }}>
                  Bài hoàn thành
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
                <Ionicons name="time" size={24} color={colors.accent} />
                <Text className="text-2xl font-bold mt-2" style={{ color: colors.accent }}>
                  {stats.activeCourses}
                </Text>
                <Text className="text-xs" style={{ color: '#64748b' }}>
                  Đang học
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
                <Ionicons name="stats-chart" size={24} color={colors.success} />
                <Text className="text-2xl font-bold mt-2" style={{ color: colors.success }}>
                  {stats.averageScore}%
                </Text>
                <Text className="text-xs" style={{ color: '#64748b' }}>
                  Điểm TB
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Tab Selector */}
        {courses.length > 0 && (
          <View className="mb-4">
            <View
              className="flex-row p-1 rounded-xl"
              style={{ backgroundColor: '#F8FAFC' }}
            >
              <TouchableOpacity
                className="flex-1 py-3 rounded-lg items-center"
                style={{
                  backgroundColor: selectedTab === 'active' ? '#FFFFFF' : 'transparent',
                  shadowColor: selectedTab === 'active' ? '#000' : 'transparent',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: selectedTab === 'active' ? 2 : 0,
                }}
                onPress={() => setSelectedTab('active')}
              >
                <Text
                  className="text-sm font-semibold"
                  style={{ color: selectedTab === 'active' ? colors.primary : '#64748b' }}
                >
                  Đang học ({activeCourses.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 py-3 rounded-lg items-center"
                style={{
                  backgroundColor: selectedTab === 'completed' ? '#FFFFFF' : 'transparent',
                  shadowColor: selectedTab === 'completed' ? '#000' : 'transparent',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: selectedTab === 'completed' ? 2 : 0,
                }}
                onPress={() => setSelectedTab('completed')}
              >
                <Text
                  className="text-sm font-semibold"
                  style={{ color: selectedTab === 'completed' ? colors.primary : '#64748b' }}
                >
                  Hoàn thành ({completedCourses.length})
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Course List */}
        <View className="mb-6">
          {displayedCourses.map((course) => (
            <TouchableOpacity
              key={course.id}
              className="mb-4 p-5 rounded-2xl"
              style={{
                backgroundColor: '#FFFFFF',
                borderWidth: 1,
                borderColor: '#e2e8f0',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
              }}
              onPress={() => handleCoursePress(course)}
              activeOpacity={0.7}
            >
              {/* Course Header */}
              <View className="flex-row items-center mb-4">
                <View
                  className="w-12 h-12 rounded-xl items-center justify-center mr-4"
                  style={{ backgroundColor: course.color + '20' }}
                >
                  <Ionicons name={course.icon as any} size={24} color={course.color} />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-bold mb-1" style={{ color: '#0f172a' }}>
                    {course.title}
                  </Text>
                  <Text className="text-sm" style={{ color: '#64748b' }}>
                    {course.completedSubTopics.length}/{course.totalSubTopics} chủ đề
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
              </View>

              {/* Progress Bar */}
              <View className="mb-3">
                <View
                  className="h-2 rounded-full overflow-hidden"
                  style={{ backgroundColor: '#F1F5F9' }}
                >
                  <View
                    className="h-full rounded-full"
                    style={{
                      backgroundColor: course.color,
                      width: `${course.progress}%`,
                    }}
                  />
                </View>
                <Text className="text-xs mt-1 text-right" style={{ color: '#64748b' }}>
                  {course.progress}% hoàn thành
                </Text>
              </View>

              {/* Action Buttons */}
              <View className="flex-row gap-2">
                <TouchableOpacity
                  className="flex-1 py-2.5 rounded-lg flex-row items-center justify-center"
                  style={{ backgroundColor: course.color }}
                  onPress={() => handleCoursePress(course)}
                >
                  <MaterialCommunityIcons name="play" size={18} color="#FFFFFF" />
                  <Text className="text-sm font-semibold ml-1.5" style={{ color: '#FFFFFF' }}>
                    {course.status === 'completed' ? 'Xem lại' : 'Tiếp tục'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="px-4 py-2.5 rounded-lg"
                  style={{
                    backgroundColor: '#F8FAFC',
                    borderWidth: 1,
                    borderColor: '#e2e8f0',
                  }}
                  onPress={() => {
                    navigation.navigate("Statistics");
                  }}
                >
                  <Ionicons name="stats-chart-outline" size={18} color="#64748b" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}

          {/* Empty State */}
          {displayedCourses.length === 0 && !loading && courses.length > 0 && (
            <View className="items-center justify-center py-8">
              <View
                className="w-16 h-16 rounded-full items-center justify-center mb-3"
                style={{ backgroundColor: '#F8FAFC' }}
              >
                <Ionicons name="document-text-outline" size={32} color="#94a3b8" />
              </View>
              <Text className="text-sm font-semibold mb-1" style={{ color: '#64748b' }}>
                Chưa có khoá học nào
              </Text>
              <Text className="text-xs text-center" style={{ color: '#94a3b8' }}>
                {selectedTab === 'active' 
                  ? 'Tạo khóa học mới ở phía trên'
                  : 'Bạn chưa hoàn thành khóa học nào'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
