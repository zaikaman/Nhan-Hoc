/**
 * Quiz Screen
 * Màn hình làm bài quiz với UI cải tiến
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../components/AppHeader';
import { colors } from '../constants/theme';
import { useQuiz } from '../hooks/useQuiz';
import * as localStorage from '../services/localStorage';
import { useCourseStore, useQuizStore } from '../stores';

// Backend returns English keys
interface QuizQuestionData {
  question: string;
  options: string[];
  answerIndex: string | number; // Backend returns string, we need number
  reason: string;
}

interface QuizScreenProps {
  route: {
    params: {
      courseId: string;
      course: string;
      topic: string;
      weekKey: string;
      subtopic: string;
      description: string;
      numQuestions?: number; // Số câu hỏi trong quiz
      existingQuizResult?: any; // Kết quả quiz có sẵn (để xem lại)
    };
  };
  navigation: any;
}

export default function Quiz({ route, navigation }: QuizScreenProps) {
  const { 
    courseId, 
    course, 
    topic, 
    weekKey, 
    subtopic, 
    description, 
    numQuestions = 10,
    existingQuizResult 
  } = route.params;
  const { createAndWait } = useQuiz();
  
  // 🔥 Thêm Zustand stores
  const addQuizResult = useQuizStore((state) => state.addQuizResult);
  const updateCourse = useCourseStore((state) => state.updateCourse);

  const [questions, setQuestions] = useState<QuizQuestionData[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isGenerating, setIsGenerating] = useState(!existingQuizResult); // Không generate nếu có kết quả sẵn

  useEffect(() => {
    if (existingQuizResult) {
      // Load kết quả có sẵn
      console.log('📊 Loading existing quiz result:', existingQuizResult);
      setQuestions(existingQuizResult.questions);
      setSelectedAnswers(existingQuizResult.userAnswers);
      setShowResults(true);
      setIsGenerating(false);
    } else {
      // Generate quiz mới
      generateQuiz();
    }
  }, []);

  const generateQuiz = async () => {
    setIsGenerating(true);

    try {
      const result = await createAndWait({
        course,
        topic,
        subtopic,
        description,
        num_questions: numQuestions,
      });

      if (result?.status === 'completed' && result.result?.questions) {
        const rawQuestions = result.result.questions;
        
        // Normalize data: convert answerIndex from string to number
        const normalizedQuestions: QuizQuestionData[] = rawQuestions.map((q: any) => ({
          question: q.question,
          options: q.options,
          answerIndex: typeof q.answerIndex === 'string' ? parseInt(q.answerIndex) : q.answerIndex,
          reason: q.reason,
        }));
        
        setQuestions(normalizedQuestions);
        setSelectedAnswers(new Array(normalizedQuestions.length).fill(null));
      } else {
        console.error('Quiz generation failed:', result);
        Alert.alert('Lỗi', 'Không thể tạo quiz. Vui lòng thử lại.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      console.error('Quiz generation error:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi tạo quiz.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }

    setIsGenerating(false);
  };

  const handleSelectAnswer = (answerIndex: number) => {
    if (showResults) return;

    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    const unanswered = selectedAnswers.filter((a) => a === null).length;

    if (unanswered > 0) {
      Alert.alert(
        'Chưa hoàn thành',
        `Bạn còn ${unanswered} câu chưa trả lời. Bạn có muốn nộp bài không?`,
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Nộp bài', onPress: () => saveAndShowResults() },
        ]
      );
    } else {
      await saveAndShowResults();
    }
  };

  const saveAndShowResults = async () => {
    try {
      console.log('💾 Bắt đầu lưu kết quả quiz...');
      console.log('📊 Course ID:', courseId);
      console.log('📚 Course:', course);
      console.log('📖 Topic:', topic);
      console.log('📝 Subtopic:', subtopic);
      console.log('❓ Total questions:', questions.length);
      console.log('✍️ Selected answers:', selectedAnswers);

      // Lưu kết quả quiz vào database
      const quizQuestions = questions.map(q => ({
        question: q.question,
        options: q.options,
        answerIndex: typeof q.answerIndex === 'number' ? q.answerIndex : parseInt(q.answerIndex as string),
        reason: q.reason,
      }));

      console.log('📝 Quiz questions prepared:', quizQuestions.length);

      const savedResult = await localStorage.saveQuizResult(
        courseId,
        course,
        topic,
        subtopic,
        quizQuestions,
        selectedAnswers
      );

      console.log('✅ Quiz result saved:', savedResult);
      console.log('💯 Score:', savedResult.score, '%');

      // 🔥 CẬP NHẬT ZUSTAND STORE NGAY LẬP TỨC
      addQuizResult(savedResult);
      console.log('✅ Zustand QuizStore updated');

      // Mark subtopic as completed
      await localStorage.markSubTopicCompleted(courseId, weekKey, subtopic);
      console.log('✅ Subtopic marked as completed');

      // 🔥 CẬP NHẬT COURSE PROGRESS trong Zustand
      const updatedCourse = await localStorage.getCourseById(courseId);
      if (updatedCourse) {
        updateCourse(courseId, {
          completedSubTopics: updatedCourse.completedSubTopics,
          progress: updatedCourse.progress,
          status: updatedCourse.status,
        });
        console.log('✅ Zustand CourseStore updated');
      }

      setShowResults(true);
      console.log('✅ Quiz result saved successfully - Total:', savedResult.totalQuestions, 'Score:', savedResult.score);
    } catch (error) {
      console.error('❌ Error saving quiz result:', error);
      Alert.alert('Lỗi', 'Không thể lưu kết quả. Vui lòng thử lại.');
    }
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q, index) => {
      if (selectedAnswers[index] === q.answerIndex) {
        correct++;
      }
    });
    return correct;
  };

  const handleRetry = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers(new Array(questions.length).fill(null));
    setShowResults(false);
  };

  if (isGenerating) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: '#F8FAFC' }}>
        <AppHeader title="Đang tạo Quiz..." />
        
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

        <View className="flex-1 items-center justify-center px-6">
          <View
            className="w-20 h-20 rounded-full items-center justify-center mb-6"
            style={{ backgroundColor: colors.primary + '20' }}
          >
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
          <Text className="text-lg font-bold text-center mb-2" style={{ color: '#0F172A' }}>
            Đang tạo câu hỏi...
          </Text>
          <Text className="text-sm text-center" style={{ color: '#64748B' }}>
            Vui lòng đợi trong giây lát
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (questions.length === 0) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: '#F8FAFC' }}>
        <AppHeader title="Quiz" />
        
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

        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="alert-circle" size={64} color="#EF4444" />
          <Text className="text-lg font-bold text-center mt-4 mb-2" style={{ color: '#0F172A' }}>
            Không thể tải quiz
          </Text>
          <TouchableOpacity
            className="mt-4 px-6 py-3 rounded-xl"
            style={{ backgroundColor: colors.primary }}
            onPress={() => navigation.goBack()}
          >
            <Text className="text-sm font-bold" style={{ color: '#FFFFFF' }}>
              Quay lại
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (showResults) {
    const score = calculateScore();
    const percentage = Math.round((score / questions.length) * 100);
    const passed = percentage >= 70;

    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: '#F8FAFC' }}>
        <AppHeader title="Kết Quả" />
        
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

          {/* Results Card */}
          <View className="px-6 pt-2 pb-4">
            <View
              className="rounded-2xl p-6 items-center"
              style={{
                backgroundColor: passed ? '#10B981' : '#EF4444',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 12,
                elevation: 8,
              }}
            >
              <Ionicons
                name={passed ? 'trophy' : 'close-circle'}
                size={64}
                color="#FFFFFF"
              />
              <Text className="text-2xl font-bold mt-4" style={{ color: '#FFFFFF' }}>
                {passed ? 'Xuất sắc!' : 'Cần cố gắng thêm'}
              </Text>
              <Text className="text-5xl font-bold mt-4" style={{ color: '#FFFFFF' }}>
                {percentage}%
              </Text>
              <Text className="text-sm mt-2" style={{ color: 'rgba(255,255,255,0.9)' }}>
                {score}/{questions.length} câu đúng
              </Text>
            </View>
          </View>

          {/* Answer Review */}
          <View className="px-6 pb-6">
            <Text className="text-lg font-bold mb-4" style={{ color: '#0F172A' }}>
              Chi tiết đáp án
            </Text>

            {questions.map((question, qIndex) => {
              const userAnswer = selectedAnswers[qIndex];
              const correctAnswer = question.answerIndex;
              const isCorrect = userAnswer === correctAnswer;

              return (
                <View
                  key={qIndex}
                  className="mb-4 rounded-2xl overflow-hidden"
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderWidth: 2,
                    borderColor: isCorrect ? '#10B981' : '#EF4444',
                  }}
                >
                  {/* Question Header */}
                  <View
                    className="p-4 flex-row items-center"
                    style={{
                      backgroundColor: isCorrect ? '#10B981' : '#EF4444',
                    }}
                  >
                    <View className="w-8 h-8 rounded-full items-center justify-center mr-3" style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}>
                      <Text className="text-sm font-bold" style={{ color: '#FFFFFF' }}>
                        {qIndex + 1}
                      </Text>
                    </View>
                    <Text className="text-sm font-bold flex-1" style={{ color: '#FFFFFF' }}>
                      {question.question}
                    </Text>
                    <Ionicons
                      name={isCorrect ? 'checkmark-circle' : 'close-circle'}
                      size={24}
                      color="#FFFFFF"
                    />
                  </View>

                  {/* Answers */}
                  <View className="p-4">
                    {question.options.map((answer: string, aIndex: number) => {
                      const isUserAnswer = userAnswer === aIndex;
                      const isCorrectAnswer = correctAnswer === aIndex;

                      return (
                        <View
                          key={aIndex}
                          className="mb-2 p-3 rounded-xl flex-row items-center"
                          style={{
                            backgroundColor: isCorrectAnswer
                              ? '#D1FAE5'
                              : isUserAnswer
                              ? '#FEE2E2'
                              : '#F1F5F9',
                            borderWidth: 1,
                            borderColor: isCorrectAnswer
                              ? '#10B981'
                              : isUserAnswer
                              ? '#EF4444'
                              : '#E2E8F0',
                          }}
                        >
                          <View
                            className="w-6 h-6 rounded-full items-center justify-center mr-3"
                            style={{
                              backgroundColor: isCorrectAnswer
                                ? '#10B981'
                                : isUserAnswer
                                ? '#EF4444'
                                : '#94A3B8',
                            }}
                          >
                            {isCorrectAnswer ? (
                              <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                            ) : isUserAnswer ? (
                              <Ionicons name="close" size={16} color="#FFFFFF" />
                            ) : (
                              <Text className="text-xs font-bold" style={{ color: '#FFFFFF' }}>
                                {String.fromCharCode(65 + aIndex)}
                              </Text>
                            )}
                          </View>
                          <Text
                            className="text-sm flex-1"
                            style={{
                              color: isCorrectAnswer || isUserAnswer ? '#0F172A' : '#64748B',
                              fontWeight: isCorrectAnswer || isUserAnswer ? '600' : '400',
                            }}
                          >
                            {answer}
                          </Text>
                        </View>
                      );
                    })}

                    {/* Explanation */}
                    <View className="mt-3 p-3 rounded-xl" style={{ backgroundColor: '#FEF3C7' }}>
                      <View className="flex-row items-start mb-2">
                        <Ionicons name="bulb" size={16} color="#92400E" style={{ marginTop: 2 }} />
                        <Text className="text-xs font-bold ml-2" style={{ color: '#92400E' }}>
                          GIẢI THÍCH
                        </Text>
                      </View>
                      <Text className="text-sm leading-5" style={{ color: '#78350F' }}>
                        {question.reason}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Action Buttons */}
          <View className="px-6 pb-8 gap-3">
            <TouchableOpacity
              className="rounded-xl py-4 items-center"
              style={{ backgroundColor: colors.primary }}
              onPress={handleRetry}
            >
              <Text className="text-base font-bold" style={{ color: '#FFFFFF' }}>
                Làm lại
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="rounded-xl py-4 items-center"
              style={{ backgroundColor: '#F1F5F9' }}
              onPress={() => navigation.goBack()}
            >
              <Text className="text-base font-bold" style={{ color: '#64748B' }}>
                Quay lại
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Quiz Questions View
  const currentQuestion = questions[currentQuestionIndex];
  const userAnswer = selectedAnswers[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  // Safety check: if no current question, show error
  if (!currentQuestion || !currentQuestion.options) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: '#F8FAFC' }}>
        <AppHeader title="Quiz" />
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="alert-circle" size={64} color="#EF4444" />
          <Text className="text-lg font-bold text-center mt-4 mb-2" style={{ color: '#0F172A' }}>
            Dữ liệu quiz không hợp lệ
          </Text>
          <TouchableOpacity
            className="mt-4 px-6 py-3 rounded-xl"
            style={{ backgroundColor: colors.primary }}
            onPress={() => navigation.goBack()}
          >
            <Text className="text-sm font-bold" style={{ color: '#FFFFFF' }}>
              Quay lại
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#F8FAFC' }}>
      <AppHeader title={`Câu ${currentQuestionIndex + 1}/${questions.length}`} />

      {/* Back Button */}
      <View className="px-6 pt-4 pb-2">
        <TouchableOpacity
          className="flex-row items-center"
          onPress={() => {
            Alert.alert(
              'Thoát quiz?',
              'Bạn có chắc chắn muốn thoát? Tiến trình của bạn sẽ không được lưu.',
              [
                { text: 'Hủy', style: 'cancel' },
                { text: 'Thoát', style: 'destructive', onPress: () => navigation.goBack() },
              ]
            );
          }}
        >
          <Ionicons name="arrow-back" size={20} color={colors.primary} />
          <Text className="text-sm font-medium ml-2" style={{ color: colors.primary }}>
            Quay lại
          </Text>
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View className="px-6 pt-2">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-xs font-semibold" style={{ color: '#64748B' }}>
            Tiến độ
          </Text>
          <Text className="text-xs font-bold" style={{ color: colors.primary }}>
            {Math.round(progress)}%
          </Text>
        </View>
        <View className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#E2E8F0' }}>
          <View
            className="h-full rounded-full"
            style={{ backgroundColor: colors.primary, width: `${progress}%` }}
          />
        </View>
      </View>

      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
        {/* Question Card */}
        <View
          className="rounded-2xl p-6 mb-6"
          style={{
            backgroundColor: colors.primary,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 8,
          }}
        >
          <View className="flex-row items-start mb-4">
            <View
              className="w-10 h-10 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            >
              <Text className="text-lg font-bold" style={{ color: '#FFFFFF' }}>
                {currentQuestionIndex + 1}
              </Text>
            </View>
            <Text className="text-base font-bold flex-1 leading-6" style={{ color: '#FFFFFF' }}>
              {currentQuestion.question}
            </Text>
          </View>
        </View>

        {/* Answer Options */}
        <View className="mb-6">
          {currentQuestion.options.map((answer: string, index: number) => {
            const isSelected = userAnswer === index;

            return (
              <TouchableOpacity
                key={index}
                className="mb-3 p-4 rounded-2xl flex-row items-center"
                style={{
                  backgroundColor: isSelected ? colors.primary + '15' : '#FFFFFF',
                  borderWidth: 2,
                  borderColor: isSelected ? colors.primary : '#E2E8F0',
                }}
                onPress={() => handleSelectAnswer(index)}
                activeOpacity={0.7}
              >
                <View
                  className="w-8 h-8 rounded-full items-center justify-center mr-4"
                  style={{
                    backgroundColor: isSelected ? colors.primary : '#F1F5F9',
                    borderWidth: 2,
                    borderColor: isSelected ? colors.primary : '#CBD5E1',
                  }}
                >
                  {isSelected ? (
                    <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                  ) : (
                    <Text className="text-sm font-bold" style={{ color: '#94A3B8' }}>
                      {String.fromCharCode(65 + index)}
                    </Text>
                  )}
                </View>
                <Text
                  className="text-sm flex-1 leading-5"
                  style={{
                    color: isSelected ? colors.primary : '#0F172A',
                    fontWeight: isSelected ? '600' : '400',
                  }}
                >
                  {answer}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Navigation Buttons */}
        <View className="flex-row gap-3 mb-8">
          <TouchableOpacity
            className="flex-1 rounded-xl py-4 items-center"
            style={{ backgroundColor: currentQuestionIndex === 0 ? '#F1F5F9' : '#FFFFFF' }}
            onPress={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            <Text
              className="text-sm font-bold"
              style={{ color: currentQuestionIndex === 0 ? '#CBD5E1' : '#64748B' }}
            >
              ← Câu trước
            </Text>
          </TouchableOpacity>

          {currentQuestionIndex === questions.length - 1 ? (
            <TouchableOpacity
              className="flex-1 rounded-xl py-4 items-center"
              style={{ backgroundColor: colors.primary }}
              onPress={handleSubmit}
            >
              <Text className="text-sm font-bold" style={{ color: '#FFFFFF' }}>
                Nộp bài ✓
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              className="flex-1 rounded-xl py-4 items-center"
              style={{ backgroundColor: colors.primary }}
              onPress={handleNext}
            >
              <Text className="text-sm font-bold" style={{ color: '#FFFFFF' }}>
                Câu sau →
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
