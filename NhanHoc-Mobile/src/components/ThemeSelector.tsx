import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { ThemeMode } from '../stores/useThemeStore';

interface ThemeSelectorProps {
  visible: boolean;
  onClose: () => void;
}

const themeOptions: { mode: ThemeMode; name: string; icon: any; description: string }[] = [
  { mode: 'light', name: 'Sáng', icon: 'sunny', description: 'Giao diện sáng, dễ nhìn ban ngày' },
  { mode: 'dark', name: 'Tối', icon: 'moon', description: 'Giao diện tối, bảo vệ mắt ban đêm' },
  { mode: 'ocean', name: 'Đại dương', icon: 'water', description: 'Xanh dương mát mẻ như biển' },
  { mode: 'sunset', name: 'Hoàng hôn', icon: 'partly-sunny', description: 'Cam ấm áp như hoàng hôn' },
];

export default function ThemeSelector({ visible, onClose }: ThemeSelectorProps) {
  const { colors, mode, setTheme } = useTheme();

  const handleSelectTheme = (newMode: ThemeMode) => {
    setTheme(newMode);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <View 
          className="rounded-t-3xl p-6"
          style={{ 
            backgroundColor: colors.background.card,
            maxHeight: '70%'
          }}
        >
          {/* Header */}
          <View className="flex-row justify-between items-center mb-6">
            <View className="flex-row items-center">
              <Ionicons name="color-palette" size={28} color={colors.text.primary} />
              <Text className="text-2xl font-bold ml-2" style={{ color: colors.text.primary }}>
                Chọn giao diện
              </Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color={colors.text.muted} />
            </TouchableOpacity>
          </View>

          {/* Theme Options */}
          <ScrollView showsVerticalScrollIndicator={false}>
            {themeOptions.map((option) => (
              <TouchableOpacity
                key={option.mode}
                className="mb-4 p-4 rounded-2xl flex-row items-center"
                style={{
                  backgroundColor: mode === option.mode 
                    ? colors.primary 
                    : colors.background.secondary,
                  borderWidth: 2,
                  borderColor: mode === option.mode ? colors.accent : 'transparent',
                }}
                onPress={() => handleSelectTheme(option.mode)}
              >
                <View className="mr-4">
                  <Ionicons 
                    name={option.icon} 
                    size={40} 
                    color={mode === option.mode ? '#FFFFFF' : colors.text.primary} 
                  />
                </View>
                <View className="flex-1">
                  <Text 
                    className="text-lg font-bold mb-1" 
                    style={{ 
                      color: mode === option.mode ? '#FFFFFF' : colors.text.primary 
                    }}
                  >
                    {option.name}
                  </Text>
                  <Text 
                    className="text-sm" 
                    style={{ 
                      color: mode === option.mode ? '#e0e0e0' : colors.text.muted 
                    }}
                  >
                    {option.description}
                  </Text>
                </View>
                {mode === option.mode && (
                  <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
