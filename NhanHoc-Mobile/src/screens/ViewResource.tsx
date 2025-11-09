/**
 * ViewResource Screen
 * Hiển thị tài liệu học tập với khả năng scroll, zoom và format đẹp
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ScrollView,
    Share,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../components/AppHeader';
import { colors } from '../constants/theme';

interface ViewResourceProps {
  route: {
    params: {
      resource: string;
      topic: string;
      courseId: string;
    };
  };
  navigation: any;
}

export default function ViewResource({ route, navigation }: ViewResourceProps) {
  const { resource, topic, courseId } = route.params;
  const [fontSize, setFontSize] = useState<number>(16);

  // Xử lý chia sẻ tài liệu
  const handleShare = async () => {
    try {
      await Share.share({
        message: `📚 Tài liệu học tập: ${topic}\n\n${resource}`,
        title: `Tài liệu: ${topic}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  // Tăng/giảm cỡ chữ
  const increaseFontSize = () => {
    if (fontSize < 24) {
      setFontSize(fontSize + 2);
    }
  };

  const decreaseFontSize = () => {
    if (fontSize > 12) {
      setFontSize(fontSize - 2);
    }
  };

  // Format tài liệu - tách thành các section
  const formatResource = (text: string) => {
    const lines = text.split('\n');
    const sections: { type: 'heading' | 'subheading' | 'text' | 'bullet' | 'number'; content: string }[] = [];

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      if (!trimmedLine) {
        // Skip empty lines
        return;
      }

      // Heading patterns (###, **, ALL CAPS)
      if (trimmedLine.startsWith('###') || trimmedLine.startsWith('## ') || trimmedLine.startsWith('# ')) {
        sections.push({
          type: 'heading',
          content: trimmedLine.replace(/^#+\s*/, '').replace(/\*\*/g, ''),
        });
      }
      // Subheading patterns (**, -)
      else if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
        sections.push({
          type: 'subheading',
          content: trimmedLine.replace(/\*\*/g, ''),
        });
      }
      // Bullet points
      else if (trimmedLine.match(/^[•\-\*]\s+/)) {
        sections.push({
          type: 'bullet',
          content: trimmedLine.replace(/^[•\-\*]\s+/, ''),
        });
      }
      // Numbered lists
      else if (trimmedLine.match(/^\d+[\.\)]\s+/)) {
        sections.push({
          type: 'number',
          content: trimmedLine,
        });
      }
      // Regular text
      else {
        sections.push({
          type: 'text',
          content: trimmedLine,
        });
      }
    });

    return sections;
  };

  const sections = formatResource(resource);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#F8FAFC' }}>
      <AppHeader 
        title="Tài Liệu Học Tập"
      />

      {/* Back Button */}
      <View className="px-6 pt-3">
        <TouchableOpacity
          className="flex-row items-center mb-2"
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={20} color={colors.primary} />
          <Text className="text-sm font-medium ml-2" style={{ color: colors.primary }}>
            Quay lại
          </Text>
        </TouchableOpacity>
      </View>

      {/* Top Controls */}
      <View 
        className="px-6 py-3 flex-row items-center justify-between"
        style={{
          backgroundColor: '#FFFFFF',
          borderBottomWidth: 1,
          borderBottomColor: '#E2E8F0',
        }}
      >
        {/* Topic Title */}
        <View className="flex-1 mr-4">
          <Text className="text-xs font-medium" style={{ color: colors.text.muted }}>
            CHỦ ĐỀ
          </Text>
          <Text className="text-base font-semibold" style={{ color: colors.text.dark }} numberOfLines={1}>
            {topic}
          </Text>
        </View>

        {/* Font Size Controls */}
        <View className="flex-row items-center" style={{ gap: 8 }}>
          <TouchableOpacity
            className="w-9 h-9 rounded-full items-center justify-center"
            style={{
              backgroundColor: fontSize <= 12 ? '#F1F5F9' : colors.primary + '15',
            }}
            onPress={decreaseFontSize}
            disabled={fontSize <= 12}
          >
            <Ionicons
              name="remove"
              size={18}
              color={fontSize <= 12 ? '#94A3B8' : colors.primary}
            />
          </TouchableOpacity>

          <Text className="text-sm font-medium" style={{ color: colors.text.dark, width: 32, textAlign: 'center' }}>
            {fontSize}
          </Text>

          <TouchableOpacity
            className="w-9 h-9 rounded-full items-center justify-center"
            style={{
              backgroundColor: fontSize >= 24 ? '#F1F5F9' : colors.primary + '15',
            }}
            onPress={increaseFontSize}
            disabled={fontSize >= 24}
          >
            <Ionicons
              name="add"
              size={18}
              color={fontSize >= 24 ? '#94A3B8' : colors.primary}
            />
          </TouchableOpacity>

          <View className="w-px h-6 mx-2" style={{ backgroundColor: '#E2E8F0' }} />

          <TouchableOpacity
            className="w-9 h-9 rounded-full items-center justify-center"
            style={{ backgroundColor: colors.primary + '15' }}
            onPress={handleShare}
          >
            <Ionicons name="share-outline" size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          className="rounded-2xl p-6 mb-6"
          style={{
            backgroundColor: '#FFFFFF',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          {sections.map((section, index) => {
            switch (section.type) {
              case 'heading':
                return (
                  <Text
                    key={index}
                    className="font-bold mb-3 mt-4"
                    style={{
                      fontSize: fontSize + 4,
                      color: colors.primary,
                      lineHeight: (fontSize + 4) * 1.4,
                    }}
                  >
                    {section.content}
                  </Text>
                );
              
              case 'subheading':
                return (
                  <Text
                    key={index}
                    className="font-semibold mb-2 mt-3"
                    style={{
                      fontSize: fontSize + 2,
                      color: colors.text.dark,
                      lineHeight: (fontSize + 2) * 1.4,
                    }}
                  >
                    {section.content}
                  </Text>
                );
              
              case 'bullet':
                return (
                  <View key={index} className="flex-row mb-2" style={{ paddingLeft: 12 }}>
                    <Text
                      className="font-medium mr-2"
                      style={{
                        fontSize: fontSize,
                        color: colors.primary,
                      }}
                    >
                      •
                    </Text>
                    <Text
                      className="flex-1"
                      style={{
                        fontSize: fontSize,
                        color: '#1E293B',
                        lineHeight: fontSize * 1.6,
                      }}
                    >
                      {section.content}
                    </Text>
                  </View>
                );
              
              case 'number':
                return (
                  <View key={index} className="flex-row mb-2" style={{ paddingLeft: 12 }}>
                    <Text
                      className="flex-1"
                      style={{
                        fontSize: fontSize,
                        color: '#1E293B',
                        lineHeight: fontSize * 1.6,
                        fontWeight: '500',
                      }}
                    >
                      {section.content}
                    </Text>
                  </View>
                );
              
              case 'text':
              default:
                return (
                  <Text
                    key={index}
                    className="mb-2"
                    style={{
                      fontSize: fontSize,
                      color: '#64748b',
                      lineHeight: fontSize * 1.6,
                    }}
                  >
                    {section.content}
                  </Text>
                );
            }
          })}
        </View>

        {/* Info Card */}
        <View
          className="rounded-xl p-4 mb-6"
          style={{
            backgroundColor: colors.primary + '08',
            borderWidth: 1,
            borderColor: colors.primary + '20',
          }}
        >
          <View className="flex-row items-center mb-2">
            <Ionicons name="information-circle" size={20} color={colors.primary} />
            <Text className="text-sm font-semibold ml-2" style={{ color: colors.primary }}>
              Mẹo học tập
            </Text>
          </View>
          <Text className="text-sm" style={{ color: colors.text.dark, lineHeight: 20 }}>
            Hãy đọc kỹ tài liệu và ghi chú lại những phần quan trọng. Bạn có thể chia sẻ tài liệu này
            hoặc quay lại đọc bất cứ lúc nào.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
