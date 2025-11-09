import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import PdfAnalysis from '../components/PdfAnalysis';
import { colors } from '../constants/theme';

export default function PdfAnalysisScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#FFFFFF' }}>
      {/* Back Button */}
      <View className="flex-row items-center px-6 py-4" style={{ borderBottomWidth: 1, borderBottomColor: '#E2E8F0' }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 rounded-xl items-center justify-center mr-3"
          style={{ backgroundColor: '#F8FAFC' }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text className="text-2xl font-bold" style={{ color: colors.primary }}>
          Phân tích tài liệu PDF
        </Text>
      </View>
      
      <ScrollView className="flex-1">
        <PdfAnalysis />
      </ScrollView>
    </SafeAreaView>
  );
}
