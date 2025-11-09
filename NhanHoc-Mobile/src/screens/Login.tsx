import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GoogleLogo } from '../components/GoogleLogo';
import { colors } from '../constants/theme';
import { RootStackParamList } from '../types';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

interface LoginProps {
  navigation: LoginScreenNavigationProp;
}

export default function Login({ navigation }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }

    setIsLoading(true);
    
    try {
      // TODO: Implement API call
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Navigate to Dashboard after successful login
      navigation.replace('Main');
    } catch (error) {
      Alert.alert('Lỗi', 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    
    try {
      // TODO: Implement Google Sign-In
      await new Promise(resolve => setTimeout(resolve, 1500));
      Alert.alert('Thành công', 'Đăng nhập Google thành công!');
      navigation.replace('Main');
    } catch (error) {
      Alert.alert('Lỗi', 'Đăng nhập Google thất bại. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#FFFFFF' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1 px-6 justify-center">
          {/* Logo/Title */}
          <View className="items-center mb-10">
            <View className="mb-4 w-40 h-40 rounded-3xl items-center justify-center overflow-hidden" 
                  style={{ backgroundColor: '#FFFFFF' }}>
              <Image 
                source={require('../assets/images/NhanHoc_logo.jpg')}
                style={{ width: '100%', height: '100%' }}
                resizeMode="contain"
              />
            </View>
            <Text className="text-4xl font-bold mb-2" style={{ color: colors.primary }}>
              Nhàn Học
            </Text>
            <Text className="text-base" style={{ color: '#64748b' }}>
              Học tập thông minh với AI
            </Text>
          </View>

          {/* Login Form */}
          <View className="space-y-4">
            {/* Email Input */}
            <View className="mb-4">
              <Text className="mb-2 text-sm font-medium" style={{ color: '#334155' }}>
                Email
              </Text>
              <TextInput
                className="px-4 py-3.5 rounded-xl"
                style={{ 
                  backgroundColor: '#F8FAFC',
                  color: '#0f172a',
                  borderWidth: 1,
                  borderColor: '#e2e8f0'
                }}
                placeholder="your.email@example.com"
                placeholderTextColor="#94a3b8"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>

            {/* Password Input */}
            <View className="mb-4">
              <Text className="mb-2 text-sm font-medium" style={{ color: '#334155' }}>
                Mật khẩu
              </Text>
              <TextInput
                className="px-4 py-3.5 rounded-xl"
                style={{ 
                  backgroundColor: '#F8FAFC',
                  color: '#0f172a',
                  borderWidth: 1,
                  borderColor: '#e2e8f0'
                }}
                placeholder="••••••••"
                placeholderTextColor="#94a3b8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!isLoading}
              />
            </View>

            {/* Forgot Password */}
            <TouchableOpacity className="self-end mb-2">
              <Text className="text-sm" style={{ color: colors.accent }}>
                Quên mật khẩu?
              </Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              className="py-4 rounded-xl items-center mt-4"
              style={{ 
                backgroundColor: colors.primary,
                opacity: isLoading ? 0.7 : 1,
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 5
              }}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="font-semibold text-base" style={{ color: '#FFFFFF' }}>
                  Đăng nhập
                </Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View className="flex-row items-center my-6">
              <View className="flex-1 h-px" style={{ backgroundColor: '#e2e8f0' }} />
              <Text className="mx-4 text-sm" style={{ color: '#94a3b8' }}>
                Hoặc tiếp tục với
              </Text>
              <View className="flex-1 h-px" style={{ backgroundColor: '#e2e8f0' }} />
            </View>

            {/* Google Login Button */}
            <TouchableOpacity
              className="py-4 rounded-xl items-center flex-row justify-center"
              style={{ 
                backgroundColor: '#FFFFFF',
                borderWidth: 1.5,
                borderColor: '#e2e8f0',
                opacity: isLoading ? 0.7 : 1
              }}
              onPress={handleGoogleLogin}
              disabled={isLoading}
            >
              <View style={{ marginRight: 12 }}>
                <GoogleLogo size={20} />
              </View>
              <Text className="font-semibold text-base" style={{ color: '#334155' }}>
                Đăng nhập với Google
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}