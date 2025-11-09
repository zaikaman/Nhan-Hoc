/**
 * Chat Screen
 * Màn hình chat với AI trợ lý học tập
 */

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import AppHeader from '../components/AppHeader';
import { colors } from '../constants/theme';
import { useChat } from '../hooks/useChat';
import type { ChatConversation, ChatMessage } from '../services/localStorage';
import * as localStorage from '../services/localStorage';

interface ChatScreenProps {
  navigation: any;
  route: {
    params?: {
      conversationId?: string;
    };
  };
}

export default function Chat({ navigation, route }: ChatScreenProps) {
  const { sendMessage, isLoading, pollingStatus } = useChat();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<ChatConversation | null>(null);
  const [inputText, setInputText] = useState('');
  const [showSidebar, setShowSidebar] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Load conversations
  const loadConversations = async () => {
    try {
      const convs = await localStorage.getAllChatConversations();
      setConversations(convs);

      // Load conversation từ params hoặc tạo mới
      if (route.params?.conversationId) {
        const conv = await localStorage.getChatConversationById(route.params.conversationId);
        setCurrentConversation(conv);
      } else if (convs.length > 0) {
        setCurrentConversation(convs[0]);
      } else {
        // Tạo conversation mới
        const newConv = await localStorage.createChatConversation('Chat mới');
        setCurrentConversation(newConv);
        setConversations([newConv]);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  useEffect(() => {
    loadConversations();
  }, [route.params?.conversationId]);

  // Reload khi màn hình được focus
  useFocusEffect(
    useCallback(() => {
      loadConversations();
    }, [])
  );

  // Scroll to bottom when messages change
  useEffect(() => {
    if (currentConversation && currentConversation.messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [currentConversation?.messages.length]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || !currentConversation) return;

    const userMessage = inputText.trim();
    setInputText('');

    try {
      // Add user message
      const updatedConv = await localStorage.addMessageToConversation(
        currentConversation.id,
        'user',
        userMessage
      );

      if (updatedConv) {
        setCurrentConversation(updatedConv);
      }

      // Get user context
      const userData = await localStorage.getUserContextData();

      // Prepare messages for AI
      const messages = updatedConv!.messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      // Send to AI
      const aiResponse = await sendMessage(messages, userData);

      if (aiResponse) {
        // Add AI response
        const finalConv = await localStorage.addMessageToConversation(
          currentConversation.id,
          'assistant',
          aiResponse
        );

        if (finalConv) {
          setCurrentConversation(finalConv);
          // Reload conversations để update title
          await loadConversations();
        }
      } else {
        // AI không phản hồi - thêm message lỗi vào conversation
        const errorConv = await localStorage.addMessageToConversation(
          currentConversation.id,
          'assistant',
          'Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau.'
        );
        if (errorConv) {
          setCurrentConversation(errorConv);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Không hiển thị Alert - chỉ log vào console
    }
  };

  const handleNewConversation = async () => {
    try {
      const newConv = await localStorage.createChatConversation('Chat mới');
      setCurrentConversation(newConv);
      await loadConversations();
      setShowSidebar(false);
    } catch (error) {
      console.error('Error creating new conversation:', error);
      Alert.alert('Lỗi', 'Không thể tạo cuộc trò chuyện mới.');
    }
  };

  const handleSelectConversation = async (conv: ChatConversation) => {
    setCurrentConversation(conv);
    setShowSidebar(false);
  };

  const handleDeleteConversation = async (id: string) => {
    Alert.alert(
      'Xoá cuộc trò chuyện',
      'Bạn có chắc chắn muốn xoá cuộc trò chuyện này?',
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Xoá',
          style: 'destructive',
          onPress: async () => {
            await localStorage.deleteChatConversation(id);
            await loadConversations();
            
            // Nếu đang xem conversation bị xoá, chuyển sang conversation khác
            if (currentConversation?.id === id) {
              const remaining = conversations.filter(c => c.id !== id);
              if (remaining.length > 0) {
                setCurrentConversation(remaining[0]);
              } else {
                const newConv = await localStorage.createChatConversation('Chat mới');
                setCurrentConversation(newConv);
                await loadConversations();
              }
            }
          },
        },
      ]
    );
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === 'user';

    return (
      <View
        className="mb-4 px-4"
        style={{
          alignItems: isUser ? 'flex-end' : 'flex-start',
        }}
      >
        <View
          className="rounded-2xl px-4 py-3 max-w-[80%]"
          style={{
            backgroundColor: isUser ? colors.primary : '#F1F5F9',
          }}
        >
          <Text
            className="text-sm leading-6"
            style={{
              color: isUser ? '#FFFFFF' : '#1E293B',
            }}
          >
            {item.content}
          </Text>
        </View>
        <Text className="text-xs mt-1 px-2" style={{ color: '#94A3B8' }}>
          {new Date(item.timestamp).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#FFFFFF' }}>
      <AppHeader title="Chat với AI" />

      {/* Back Button */}
      <View className="px-6 pt-4 pb-2 flex-row items-center justify-between">


        {/* Conversation List Button */}
        <TouchableOpacity
          className="flex-row items-center px-3 py-2 rounded-lg"
          style={{ backgroundColor: colors.primary + '15' }}
          onPress={() => setShowSidebar(!showSidebar)}
        >
          <Ionicons name="list" size={18} color={colors.primary} />
          <Text className="text-sm font-medium ml-2" style={{ color: colors.primary }}>
            Lịch sử
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Sidebar - Conversation List */}
        {showSidebar && (
          <View className="absolute top-0 left-0 right-0 bottom-0 z-50">
            <TouchableOpacity
              className="flex-1"
              style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
              onPress={() => setShowSidebar(false)}
              activeOpacity={1}
            >
              <View
                className="bg-white h-full w-80 p-4"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 2, height: 0 },
                  shadowOpacity: 0.25,
                  shadowRadius: 8,
                  elevation: 5,
                }}
                onStartShouldSetResponder={() => true}
              >
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-lg font-bold" style={{ color: colors.text.dark }}>
                    Lịch sử chat
                  </Text>
                  <TouchableOpacity onPress={() => setShowSidebar(false)}>
                    <Ionicons name="close" size={24} color="#64748B" />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  className="rounded-xl p-3 mb-4 flex-row items-center"
                  style={{ backgroundColor: colors.primary }}
                  onPress={handleNewConversation}
                >
                  <Ionicons name="add-circle" size={20} color="#FFFFFF" />
                  <Text className="text-sm font-semibold ml-2" style={{ color: '#FFFFFF' }}>
                    Cuộc trò chuyện mới
                  </Text>
                </TouchableOpacity>

                <ScrollView showsVerticalScrollIndicator={false}>
                  {conversations.map((conv) => (
                    <TouchableOpacity
                      key={conv.id}
                      className="rounded-xl p-3 mb-2 flex-row items-center justify-between"
                      style={{
                        backgroundColor:
                          currentConversation?.id === conv.id ? colors.primary + '20' : '#F8FAFC',
                      }}
                      onPress={() => handleSelectConversation(conv)}
                    >
                      <View className="flex-1 mr-2">
                        <Text
                          className="text-sm font-semibold mb-1"
                          style={{ color: '#1E293B' }}
                          numberOfLines={1}
                        >
                          {conv.title}
                        </Text>
                        <Text className="text-xs" style={{ color: '#64748B' }}>
                          {conv.messages.length} tin nhắn
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleDeleteConversation(conv.id)}
                      >
                        <Ionicons name="trash-outline" size={18} color="#EF4444" />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Messages List */}
        <View className="flex-1">
          {currentConversation && currentConversation.messages.length > 0 ? (
            <FlatList
              ref={flatListRef}
              data={currentConversation.messages}
              keyExtractor={(item) => item.id}
              renderItem={renderMessage}
              contentContainerStyle={{ paddingTop: 16, paddingBottom: 16 }}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View className="flex-1 items-center justify-center px-6">
              <View
                className="w-20 h-20 rounded-full items-center justify-center mb-4"
                style={{ backgroundColor: colors.primary + '20' }}
              >
                <Ionicons name="chatbubbles" size={40} color={colors.primary} />
              </View>
              <Text className="text-lg font-bold text-center mb-2" style={{ color: '#1E293B' }}>
                Bắt đầu cuộc trò chuyện
              </Text>
              <Text className="text-sm text-center" style={{ color: '#64748B' }}>
                AI sẽ giúp bạn học tập hiệu quả hơn dựa trên lộ trình và tiến độ của bạn
              </Text>
            </View>
          )}
        </View>

        {/* Loading/Polling Status Indicator */}
        {isLoading && pollingStatus && (
          <View
            className="px-4 py-3 flex-row items-center"
            style={{
              backgroundColor: '#F1F5F9',
              borderTopWidth: 1,
              borderTopColor: '#E2E8F0',
            }}
          >
            <ActivityIndicator size="small" color={colors.primary} />
            <Text className="ml-3 text-sm" style={{ color: '#64748B' }}>
              {pollingStatus}
            </Text>
          </View>
        )}

        {/* Input Box */}
        <View
          className="px-4 py-3 flex-row items-center"
          style={{
            backgroundColor: '#FFFFFF',
            borderTopWidth: 1,
            borderTopColor: '#E2E8F0',
          }}
        >
          <TextInput
            className="flex-1 rounded-xl px-4 py-3 mr-2"
            style={{
              backgroundColor: '#F8FAFC',
              color: '#1E293B',
              fontSize: 14,
            }}
            placeholder="Nhập tin nhắn..."
            placeholderTextColor="#94A3B8"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={1000}
            editable={!isLoading}
          />
          <TouchableOpacity
            className="w-12 h-12 rounded-xl items-center justify-center"
            style={{
              backgroundColor: inputText.trim() && !isLoading ? colors.primary : '#E2E8F0',
            }}
            onPress={handleSendMessage}
            disabled={!inputText.trim() || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons
                name="send"
                size={20}
                color={inputText.trim() ? '#FFFFFF' : '#94A3B8'}
              />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
