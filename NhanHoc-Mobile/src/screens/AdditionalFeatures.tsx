import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import AppHeader from '../components/AppHeader';
import { colors } from '../constants/theme';

export default function AdditionalFeatures() {
  const navigation = useNavigation();

  const features = [
    {
      id: 'recommendations',
      title: 'Gợi ý học tập AI',
      description: 'AI phân tích dữ liệu học tập và đưa ra lộ trình học phù hợp với bạn',
      icon: 'sparkles',
      color: colors.primary,
      bgColor: colors.primary + '15',
      screen: 'Recommendations',
      benefits: [
        'Chủ đề học tiếp theo phù hợp',
        'Lộ trình học tập chi tiết',
        'Điều chỉnh độ khó thông minh',
        'Lời khuyên học tập cá nhân hóa',
      ],
    },
    {
      id: 'pdf-analysis',
      title: 'Phân tích tài liệu PDF',
      description: 'Upload PDF và AI sẽ tạo flashcard học tập chi tiết cho bạn',
      icon: 'document-text',
      color: '#8B5CF6',
      bgColor: '#8B5CF6' + '15',
      screen: 'PdfAnalysis',
      benefits: [
        'Tóm tắt nội dung tổng quan',
        'Tạo flashcard tự động',
        'Trích xuất thuật ngữ quan trọng',
        'Tạo câu hỏi tự đánh giá',
      ],
    },
  ];

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#FFFFFF' }}>
      <AppHeader title="Tính năng bổ sung" />
      
      <ScrollView className="flex-1 px-6 pt-6">

        {/* Feature Cards */}
        {features.map((feature, index) => (
          <TouchableOpacity
            key={feature.id}
            onPress={() => navigation.navigate(feature.screen as never)}
            className="mb-6 rounded-3xl overflow-hidden"
            style={{
              backgroundColor: '#FFFFFF',
              borderWidth: 2,
              borderColor: '#E2E8F0',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            {/* Card Header */}
            <View 
              className="p-6 flex-row items-center"
              style={{ backgroundColor: feature.bgColor }}
            >
              <View 
                className="w-16 h-16 rounded-2xl items-center justify-center mr-4"
                style={{ backgroundColor: '#FFFFFF' }}
              >
                <Ionicons name={feature.icon as any} size={32} color={feature.color} />
              </View>
              
              <View className="flex-1">
                <Text className="text-xl font-bold mb-1" style={{ color: '#0f172a' }}>
                  {feature.title}
                </Text>
                <Text className="text-sm" style={{ color: '#475569' }}>
                  {feature.description}
                </Text>
              </View>
              
              <Ionicons name="chevron-forward" size={24} color={feature.color} />
            </View>

            {/* Card Body */}
            <View className="p-6 pt-4">
              <Text className="text-sm font-semibold mb-3" style={{ color: '#64748b' }}>
                ✨ Điểm nổi bật:
              </Text>
              
              {feature.benefits.map((benefit, idx) => (
                <View key={idx} className="flex-row items-center mb-2">
                  <View 
                    className="w-6 h-6 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: feature.bgColor }}
                  >
                    <Ionicons name="checkmark" size={14} color={feature.color} />
                  </View>
                  <Text className="text-sm flex-1" style={{ color: '#475569' }}>
                    {benefit}
                  </Text>
                </View>
              ))}

              {/* CTA Button */}
              <TouchableOpacity
                onPress={() => navigation.navigate(feature.screen as never)}
                className="mt-4 py-3 rounded-xl items-center flex-row justify-center"
                style={{ backgroundColor: feature.color }}
              >
                <Text className="text-white font-bold mr-2">
                  Trải nghiệm ngay
                </Text>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}

        {/* Info Section */}
        <View 
          className="mb-8 p-6 rounded-2xl"
          style={{ backgroundColor: '#F0F9FF', borderWidth: 1, borderColor: '#BAE6FD' }}
        >
          <View className="flex-row items-center mb-3">
            <Ionicons name="information-circle" size={24} color={colors.primary} />
            <Text className="text-base font-bold ml-2" style={{ color: colors.primary }}>
              Lưu ý
            </Text>
          </View>
          
          <Text className="text-sm leading-6" style={{ color: '#475569' }}>
            Cả hai tính năng đều sử dụng công nghệ AI tiên tiến để cung cấp trải nghiệm học tập tối ưu. 
            Hãy thử và khám phá tính năng phù hợp nhất với nhu cầu của bạn!
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
