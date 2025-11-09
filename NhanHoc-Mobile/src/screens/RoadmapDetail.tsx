/**
 * RoadmapDetail Screen
 * Hiển thị chi tiết lộ trình học tập với UI đẹp mắt
 */

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createResource, pollResourceStatus } from '../api/resourceApi';
import AppHeader from '../components/AppHeader';
import { colors } from '../constants/theme';
import * as localStorage from '../services/localStorage';
import type { ResourceJobStatus, RoadmapResult, SubTopic } from '../types/api';

interface RoadmapDetailProps {
  route: {
    params: {
      roadmap: RoadmapResult;
      topic: string;
      description?: string;
      courseId?: string; // Nếu có thì đang xem course có sẵn, không thì tạo mới
      quizQuestionsPerLesson?: number; // Số câu hỏi mỗi bài quiz
      resource?: string; // Tài liệu học tập
      knowledgeLevel?: string;
      studyTime?: string;
    };
  };
  navigation: any;
}

export default function RoadmapDetail({ route, navigation }: RoadmapDetailProps) {
  const { 
    roadmap, 
    topic, 
    description = '', 
    courseId: existingCourseId, 
    quizQuestionsPerLesson = 10,
    resource,
    knowledgeLevel,
    studyTime,
  } = route.params;
  const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(new Set(['tuần 1']));
  const [completedSubTopics, setCompletedSubTopics] = useState<Set<string>>(new Set());
  const [courseId, setCourseId] = useState<string | null>(existingCourseId || null);
  const [questionsPerQuiz, setQuestionsPerQuiz] = useState<number>(quizQuestionsPerLesson);
  const [courseResource, setCourseResource] = useState<string | undefined>(resource);
  const [isLoadingResource, setIsLoadingResource] = useState(false);
  const [quizResults, setQuizResults] = useState<localStorage.QuizResult[]>([]);

  // Load quiz results khi có courseId
  useEffect(() => {
    const loadQuizResults = async () => {
      if (courseId) {
        try {
          const results = await localStorage.getCourseQuizResults(courseId);
          setQuizResults(results);
          console.log('📊 Loaded quiz results:', results.length);
        } catch (error) {
          console.error('Error loading quiz results:', error);
        }
      }
    };

    loadQuizResults();
  }, [courseId]);

  // Reload quiz results khi màn hình được focus (quay lại từ Quiz)
  useFocusEffect(
    React.useCallback(() => {
      const reloadQuizResults = async () => {
        if (courseId) {
          try {
            const results = await localStorage.getCourseQuizResults(courseId);
            setQuizResults(results);
            console.log('🔄 Reloaded quiz results:', results.length);
            
            // Cũng reload completed subtopics
            const course = await localStorage.getCourseById(courseId);
            if (course) {
              setCompletedSubTopics(new Set(course.completedSubTopics));
            }
          } catch (error) {
            console.error('Error reloading quiz results:', error);
          }
        }
      };

      reloadQuizResults();
    }, [courseId])
  );

  // Initialize course - tạo mới hoặc load từ database
  useEffect(() => {
    const initializeCourse = async () => {
      try {
        if (existingCourseId) {
          // Load course từ database
          const course = await localStorage.getCourseById(existingCourseId);
          if (course) {
            setCourseId(course.id);
            setCompletedSubTopics(new Set(course.completedSubTopics));
            setQuestionsPerQuiz(course.quizQuestionsPerLesson || 10);
            setCourseResource(course.resource); // Load resource nếu có
          }
        } else {
          // Tạo course mới (không có resource ban đầu)
          const newCourse = await localStorage.createCourse(
            topic, 
            description, 
            roadmap, 
            quizQuestionsPerLesson,
            undefined, // Không có resource lúc tạo
            knowledgeLevel,
            studyTime
          );
          setCourseId(newCourse.id);
          console.log('✅ New course created and saved:', newCourse.id);
        }
      } catch (error) {
        console.error('Error initializing course:', error);
        Alert.alert('Lỗi', 'Không thể lưu khoá học. Vui lòng thử lại.');
      }
    };

    initializeCourse();
  }, []);

  // Convert roadmap object to array
  const weeks = Object.entries(roadmap).map(([weekKey, weekData]) => ({
    weekKey,
    weekNumber: parseInt(weekKey.replace('tuần ', '')),
    title: weekData['chủ đề'],
    subtopics: weekData['các chủ đề con'],
  }));

  const toggleWeek = (weekKey: string) => {
    setExpandedWeeks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(weekKey)) {
        newSet.delete(weekKey);
      } else {
        newSet.add(weekKey);
      }
      return newSet;
    });
  };

  const toggleSubTopic = async (weekKey: string, subTopicTitle: string) => {
    if (!courseId) return;

    const key = `${weekKey}-${subTopicTitle}`;
    const isCurrentlyCompleted = completedSubTopics.has(key);

    // Update UI immediately
    setCompletedSubTopics((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });

    // Update database
    try {
      if (!isCurrentlyCompleted) {
        await localStorage.markSubTopicCompleted(courseId, weekKey, subTopicTitle);
        console.log('✅ Subtopic marked as completed:', key);
      }
    } catch (error) {
      console.error('Error updating subtopic:', error);
      // Rollback UI on error
      setCompletedSubTopics((prev) => {
        const newSet = new Set(prev);
        if (isCurrentlyCompleted) {
          newSet.delete(key);
        } else {
          newSet.add(key);
        }
        return newSet;
      });
    }
  };

  const getWeekProgress = (weekKey: string, subTopics: SubTopic[]) => {
    const completed = subTopics.filter((st) =>
      completedSubTopics.has(`${weekKey}-${st['chủ đề con']}`)
    ).length;
    return Math.round((completed / subTopics.length) * 100);
  };

  const getTotalProgress = () => {
    const totalSubTopics = weeks.reduce(
      (sum, week) => sum + week.subtopics.length,
      0
    );
    return Math.round((completedSubTopics.size / totalSubTopics) * 100);
  };

  // Kiểm tra xem subtopic đã có quiz result chưa
  const getQuizResultForSubtopic = (weekTitle: string, subtopic: string) => {
    return quizResults.find(
      (result) => result.weekTitle === weekTitle && result.subtopic === subtopic
    );
  };

  // Xem lại kết quả quiz
  const handleViewQuizResult = (subtopic: SubTopic, weekTitle: string, weekKey: string) => {
    const quizResult = getQuizResultForSubtopic(weekTitle, subtopic['chủ đề con']);
    
    if (!quizResult) {
      Alert.alert('Lỗi', 'Không tìm thấy kết quả quiz');
      return;
    }

    // Navigate to Quiz screen với kết quả có sẵn
    navigation.navigate('Quiz', {
      courseId,
      course: topic,
      topic: weekTitle,
      weekKey,
      subtopic: subtopic['chủ đề con'],
      description: subtopic['mô tả'],
      numQuestions: questionsPerQuiz,
      existingQuizResult: quizResult, // Pass kết quả có sẵn
    });
  };

  const handleStartQuiz = (subtopic: SubTopic, weekTitle: string, weekKey: string) => {
    if (!courseId) {
      Alert.alert('Lỗi', 'Không tìm thấy khoá học');
      return;
    }

    // Kiểm tra xem đã có quiz result chưa
    const existingResult = getQuizResultForSubtopic(weekTitle, subtopic['chủ đề con']);
    
    if (existingResult) {
      // Đã có kết quả, hỏi user muốn làm gì
      Alert.alert(
        'Đã hoàn thành',
        `Bạn đã làm quiz này và đạt ${existingResult.score}%. Bạn muốn làm gì?`,
        [
          {
            text: 'Xem lại kết quả',
            onPress: () => handleViewQuizResult(subtopic, weekTitle, weekKey),
          },
          {
            text: 'Làm lại',
            onPress: () => {
              navigation.navigate('Quiz', {
                courseId,
                course: topic,
                topic: weekTitle,
                weekKey,
                subtopic: subtopic['chủ đề con'],
                description: subtopic['mô tả'],
                numQuestions: questionsPerQuiz,
              });
            },
          },
          { text: 'Hủy', style: 'cancel' },
        ]
      );
      return;
    }

    // Chưa có kết quả, làm quiz mới
    navigation.navigate('Quiz', {
      courseId,
      course: topic,
      topic: weekTitle,
      weekKey,
      subtopic: subtopic['chủ đề con'],
      description: subtopic['mô tả'],
      numQuestions: questionsPerQuiz,
    });
  };

  const handleLoadResource = async () => {
    if (!courseId) {
      Alert.alert('Lỗi', 'Không tìm thấy khoá học');
      return;
    }

    if (courseResource) {
      // Đã có resource, hiển thị
      navigation.navigate('ViewResource', {
        resource: courseResource,
        topic: topic,
        courseId: courseId,
      });
      return;
    }

    setIsLoadingResource(true);

    try {
      // Tạo resource request
      const resourceResponse = await createResource({
        course: topic,
        knowledge_level: knowledgeLevel || 'Intermediate',
        description: description || `Học ${topic} từ cơ bản đến nâng cao`,
        time: studyTime || '5 lessons',
      });

      // Poll resource status
      const resourceResult = await pollResourceStatus(
        resourceResponse.job_id,
        (status: ResourceJobStatus) => {
          if (status.status === 'processing') {
            console.log('AI đang tạo tài liệu học tập...');
          }
        },
        60,
        2000
      );

      if (resourceResult.status === 'completed' && resourceResult.result) {
        // Cập nhật resource vào course
        const updatedCourse = await localStorage.updateCourseResource(
          courseId,
          resourceResult.result
        );
        
        if (updatedCourse) {
          setCourseResource(resourceResult.result);
          
          Alert.alert('Thành công', 'Đã tải tài liệu học tập!', [
            { text: 'Xem tài liệu', onPress: () => {
              navigation.navigate('ViewResource', {
                resource: resourceResult.result,
                topic: topic,
                courseId: courseId,
              });
            }},
            { text: 'Đóng', style: 'cancel' },
          ]);
        }
      } else {
        throw new Error(resourceResult.error || 'Không thể tạo tài liệu');
      }
    } catch (error: any) {
      console.error('Error loading resource:', error);
      Alert.alert('Lỗi', error.message || 'Không thể tải tài liệu. Vui lòng thử lại.');
    } finally {
      setIsLoadingResource(false);
    }
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#F8FAFC' }}>
      <AppHeader title="Lộ Trình Học Tập" />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Back Button */}
        <View className="px-6 pt-4 pb-2">
          <TouchableOpacity
            className="flex-row items-center"
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={20} color={colors.primary} />
            <Text className="text-sm font-medium ml-2" style={{ color: colors.primary }}>
              Quay lại
            </Text>
          </TouchableOpacity>
        </View>

        {/* Header Card */}
        <View className="px-6 pt-2 pb-4">
          <View
            className="rounded-2xl p-6"
            style={{
              backgroundColor: colors.primary,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <View className="flex-row items-center mb-3">
              <View
                className="w-12 h-12 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
              >
                <Ionicons name="school" size={24} color="#FFFFFF" />
              </View>
              <View className="flex-1">
                <Text className="text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.8)' }}>
                  CHỦ ĐỀ HỌC TẬP
                </Text>
                <Text className="text-xl font-bold" style={{ color: '#FFFFFF' }}>
                  {topic}
                </Text>
              </View>
            </View>

            {/* Overall Progress */}
            <View className="mt-4">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.9)' }}>
                  Tiến độ tổng quan
                </Text>
                <Text className="text-lg font-bold" style={{ color: '#FFFFFF' }}>
                  {getTotalProgress()}%
                </Text>
              </View>
              <View
                className="h-3 rounded-full overflow-hidden"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
              >
                <View
                  className="h-full rounded-full"
                  style={{
                    backgroundColor: '#FFFFFF',
                    width: `${getTotalProgress()}%`,
                  }}
                />
              </View>
            </View>

            {/* Stats */}
            <View className="flex-row mt-4 pt-4" style={{ borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)' }}>
              <View className="flex-1 items-center">
                <Text className="text-2xl font-bold" style={{ color: '#FFFFFF' }}>
                  {weeks.length}
                </Text>
                <Text className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>
                  Tuần học
                </Text>
              </View>
              <View className="flex-1 items-center">
                <Text className="text-2xl font-bold" style={{ color: '#FFFFFF' }}>
                  {weeks.reduce((sum, w) => sum + w.subtopics.length, 0)}
                </Text>
                <Text className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>
                  Chủ đề
                </Text>
              </View>
              <View className="flex-1 items-center">
                <Text className="text-2xl font-bold" style={{ color: '#FFFFFF' }}>
                  {completedSubTopics.size}
                </Text>
                <Text className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>
                  Hoàn thành
                </Text>
              </View>
            </View>

            {/* Load Resource Button */}
            <TouchableOpacity
              className="mt-4 rounded-xl p-3 flex-row items-center justify-center"
              style={{
                backgroundColor: courseResource ? 'rgba(255,255,255,0.2)' : '#FFFFFF',
                opacity: isLoadingResource ? 0.6 : 1,
              }}
              onPress={handleLoadResource}
              disabled={isLoadingResource}
            >
              <Ionicons
                name={courseResource ? 'document-text' : 'cloud-download'}
                size={20}
                color={courseResource ? '#FFFFFF' : colors.primary}
                style={{ marginRight: 8 }}
              />
              <Text
                className="font-semibold"
                style={{
                  color: courseResource ? '#FFFFFF' : colors.primary,
                }}
              >
                {isLoadingResource
                  ? 'Đang tải tài liệu...'
                  : courseResource
                  ? 'Xem tài liệu'
                  : 'Tải tài liệu'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Weekly Timeline */}
        <View className="px-6 pb-6">
          {weeks.map((week) => {
            const isExpanded = expandedWeeks.has(week.weekKey);
            const weekProgress = getWeekProgress(week.weekKey, week.subtopics);
            const isCompleted = weekProgress === 100;

            return (
              <View key={week.weekKey} className="mb-4">
                {/* Week Header */}
                <TouchableOpacity
                  className="rounded-2xl p-5"
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderWidth: 2,
                    borderColor: isCompleted ? '#10B981' : isExpanded ? colors.primary : '#E2E8F0',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 3,
                  }}
                  onPress={() => toggleWeek(week.weekKey)}
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-center">
                    {/* Week Number Badge */}
                    <View
                      className="w-14 h-14 rounded-2xl items-center justify-center mr-4"
                      style={{
                        backgroundColor: isCompleted
                          ? '#10B981'
                          : isExpanded
                          ? colors.primary
                          : '#F1F5F9',
                      }}
                    >
                      {isCompleted ? (
                        <Ionicons name="checkmark-circle" size={28} color="#FFFFFF" />
                      ) : (
                        <Text
                          className="text-xl font-bold"
                          style={{ color: isExpanded ? '#FFFFFF' : '#64748B' }}
                        >
                          {week.weekNumber}
                        </Text>
                      )}
                    </View>

                    {/* Week Info */}
                    <View className="flex-1 mr-3">
                      <Text className="text-xs font-semibold mb-1" style={{ color: '#64748B' }}>
                        TUẦN {week.weekNumber}
                      </Text>
                      <Text
                        className="text-base font-bold leading-5"
                        style={{ color: '#0F172A' }}
                        numberOfLines={2}
                      >
                        {week.title}
                      </Text>
                      <View className="flex-row items-center mt-2">
                        <Ionicons name="list-outline" size={14} color="#64748B" />
                        <Text className="text-xs ml-1" style={{ color: '#64748B' }}>
                          {week.subtopics.length} chủ đề
                        </Text>
                        <View className="w-1 h-1 rounded-full bg-gray-400 mx-2" />
                        <Text className="text-xs font-semibold" style={{ color: colors.primary }}>
                          {weekProgress}%
                        </Text>
                      </View>
                    </View>

                    {/* Expand Icon */}
                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={24}
                      color={isExpanded ? colors.primary : '#94A3B8'}
                    />
                  </View>

                  {/* Week Progress Bar */}
                  <View className="mt-4">
                    <View
                      className="h-2 rounded-full overflow-hidden"
                      style={{ backgroundColor: '#F1F5F9' }}
                    >
                      <View
                        className="h-full rounded-full"
                        style={{
                          backgroundColor: isCompleted ? '#10B981' : colors.primary,
                          width: `${weekProgress}%`,
                        }}
                      />
                    </View>
                  </View>
                </TouchableOpacity>

                {/* Sub Topics */}
                {isExpanded && (
                  <View className="mt-3 ml-4">
                    {week.subtopics.map((subTopic, subIndex) => {
                      const subTopicKey = `${week.weekKey}-${subTopic['chủ đề con']}`;
                      const isSubCompleted = completedSubTopics.has(subTopicKey);

                      return (
                        <View key={subIndex} className="mb-3">
                          {/* Timeline connector */}
                          {subIndex < week.subtopics.length - 1 && (
                            <View
                              className="absolute left-6 top-14 w-0.5"
                              style={{
                                height: 60,
                                backgroundColor: '#E2E8F0',
                              }}
                            />
                          )}

                          <View className="flex-row">
                            {/* Timeline dot */}
                            <View className="items-center mr-4">
                              <TouchableOpacity
                                className="w-12 h-12 rounded-full items-center justify-center"
                                style={{
                                  backgroundColor: isSubCompleted ? '#10B981' : '#F1F5F9',
                                  borderWidth: 2,
                                  borderColor: isSubCompleted ? '#10B981' : '#CBD5E1',
                                }}
                                onPress={() => toggleSubTopic(week.weekKey, subTopic['chủ đề con'])}
                              >
                                {isSubCompleted ? (
                                  <Ionicons name="checkmark" size={24} color="#FFFFFF" />
                                ) : (
                                  <Text className="text-lg font-bold" style={{ color: '#94A3B8' }}>
                                    {subIndex + 1}
                                  </Text>
                                )}
                              </TouchableOpacity>
                            </View>

                            {/* Sub Topic Card */}
                            <TouchableOpacity
                              className="flex-1 rounded-xl p-4 mb-2"
                              style={{
                                backgroundColor: '#FFFFFF',
                                borderWidth: 1,
                                borderColor: isSubCompleted ? '#10B981' : '#E2E8F0',
                                opacity: isSubCompleted ? 0.8 : 1,
                              }}
                              onPress={() => toggleSubTopic(week.weekKey, subTopic['chủ đề con'])}
                              activeOpacity={0.7}
                            >
                              <View className="flex-row items-start justify-between mb-2">
                                <Text
                                  className="text-sm font-bold flex-1 leading-5"
                                  style={{
                                    color: '#0F172A',
                                    textDecorationLine: isSubCompleted ? 'line-through' : 'none',
                                  }}
                                >
                                  {subTopic['chủ đề con']}
                                </Text>
                                <View
                                  className="px-2 py-1 rounded-md ml-2"
                                  style={{ backgroundColor: '#FEF3C7' }}
                                >
                                  <Text className="text-xs font-semibold" style={{ color: '#92400E' }}>
                                    ⏱️ {subTopic['thời gian']}
                                  </Text>
                                </View>
                              </View>
                              <Text className="text-xs leading-5 mb-3" style={{ color: '#64748B' }}>
                                {subTopic['mô tả']}
                              </Text>

                              {/* Quiz Button */}
                              {(() => {
                                const quizResult = getQuizResultForSubtopic(week.title, subTopic['chủ đề con']);
                                const hasQuizResult = !!quizResult;
                                
                                return (
                                  <TouchableOpacity
                                    className="flex-row items-center justify-center py-2 rounded-lg"
                                    style={{
                                      backgroundColor: hasQuizResult 
                                        ? (quizResult.score >= 70 ? '#10B981' + '20' : '#EF4444' + '20')
                                        : colors.primary + '15',
                                    }}
                                    onPress={() => handleStartQuiz(subTopic, week.title, week.weekKey)}
                                  >
                                    <Ionicons 
                                      name={hasQuizResult ? (quizResult.score >= 70 ? "checkmark-circle" : "refresh") : "school"} 
                                      size={16} 
                                      color={hasQuizResult 
                                        ? (quizResult.score >= 70 ? '#10B981' : '#EF4444')
                                        : colors.primary
                                      } 
                                    />
                                    <Text
                                      className="text-xs font-semibold ml-1"
                                      style={{ 
                                        color: hasQuizResult 
                                          ? (quizResult.score >= 70 ? '#10B981' : '#EF4444')
                                          : colors.primary
                                      }}
                                    >
                                      {hasQuizResult 
                                        ? `${quizResult.score}% - Xem lại`
                                        : 'Làm Quiz'
                                      }
                                    </Text>
                                  </TouchableOpacity>
                                );
                              })()}
                            </TouchableOpacity>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Completion CTA */}
        {getTotalProgress() === 100 && (
          <View className="px-6 pb-8">
            <View
              className="rounded-2xl p-6 items-center"
              style={{
                backgroundColor: '#10B981',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 12,
                elevation: 6,
              }}
            >
              <Ionicons name="trophy" size={48} color="#FFFFFF" />
              <Text className="text-xl font-bold mt-3" style={{ color: '#FFFFFF' }}>
                🎉 Chúc mừng!
              </Text>
              <Text className="text-sm text-center mt-2" style={{ color: 'rgba(255,255,255,0.9)' }}>
                Bạn đã hoàn thành lộ trình học tập!
              </Text>
              <TouchableOpacity
                className="mt-4 px-6 py-3 rounded-xl"
                style={{ backgroundColor: '#FFFFFF' }}
                onPress={() => navigation.goBack()}
              >
                <Text className="text-sm font-bold" style={{ color: '#10B981' }}>
                  Tạo lộ trình mới
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
