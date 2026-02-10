import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { useQuery, useMutation, useSubscription } from '@apollo/client';
import {
  CHAT_ROOM_DETAIL,
  SEND_MESSAGE,
  MARK_MESSAGES_READ,
  MESSAGE_SENT_SUBSCRIPTION,
} from '@helpmeclean-mobile/shared';
import { useAuth } from '../context/AuthContext';

type ChatRouteParams = {
  Chat: { roomId: string; otherUserName: string };
};

interface Message {
  id: string;
  content: string;
  messageType: string;
  isRead: boolean;
  createdAt: string;
  sender: {
    id: string;
    fullName: string;
  };
}

export default function ChatScreen() {
  const route = useRoute<RouteProp<ChatRouteParams, 'Chat'>>();
  const { roomId } = route.params;
  const { user } = useAuth();
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const flatListRef = useRef<FlatList>(null);

  const { data, loading } = useQuery(CHAT_ROOM_DETAIL, {
    variables: { id: roomId },
    fetchPolicy: 'cache-and-network',
  });

  const [sendMessage, { loading: sending }] = useMutation(SEND_MESSAGE);
  const [markMessagesRead] = useMutation(MARK_MESSAGES_READ);

  // Mark messages as read on mount
  useEffect(() => {
    markMessagesRead({ variables: { roomId } }).catch(() => {});
  }, [roomId, markMessagesRead]);

  // Sync query data to local state
  useEffect(() => {
    if (data?.chatRoom?.messages?.edges) {
      setMessages(data.chatRoom.messages.edges);
    }
  }, [data]);

  // Real-time subscription
  useSubscription(MESSAGE_SENT_SUBSCRIPTION, {
    variables: { roomId },
    onData: ({ data: subData }) => {
      const newMessage = subData?.data?.messageSent;
      if (newMessage) {
        setMessages((prev) => {
          const exists = prev.some((m) => m.id === newMessage.id);
          if (exists) return prev;
          return [...prev, newMessage];
        });
        // Mark new incoming messages as read
        if (newMessage.sender.id !== user?.id) {
          markMessagesRead({ variables: { roomId } }).catch(() => {});
        }
      }
    },
  });

  const handleSend = useCallback(async () => {
    const trimmed = messageText.trim();
    if (!trimmed || sending) return;

    setMessageText('');
    try {
      const { data: sendData } = await sendMessage({
        variables: { roomId, content: trimmed },
      });
      if (sendData?.sendMessage) {
        setMessages((prev) => {
          const exists = prev.some((m) => m.id === sendData.sendMessage.id);
          if (exists) return prev;
          return [...prev, sendData.sendMessage];
        });
      }
    } catch {
      // Restore message text on error
      setMessageText(trimmed);
    }
  }, [messageText, sending, sendMessage, roomId]);

  const formatTime = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ro-RO', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  const renderMessage = useCallback(
    ({ item }: { item: Message }) => {
      const isSent = item.sender.id === user?.id;

      return (
        <View
          className={`mb-2 max-w-[80%] ${isSent ? 'self-end' : 'self-start'}`}
        >
          <View
            className={`px-4 py-2.5 rounded-2xl ${
              isSent
                ? 'bg-[#2563EB] rounded-br-sm'
                : 'bg-[#F3F4F6] rounded-bl-sm'
            }`}
          >
            <Text
              className={`text-base ${isSent ? 'text-white' : 'text-gray-900'}`}
            >
              {item.content}
            </Text>
          </View>
          <Text
            className={`text-xs text-gray-400 mt-1 ${isSent ? 'text-right' : 'text-left'}`}
          >
            {formatTime(item.createdAt)}
          </Text>
        </View>
      );
    },
    [user?.id, formatTime],
  );

  if (loading && messages.length === 0) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#FAFBFC]">
        <ActivityIndicator size="large" color="#2563EB" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#FAFBFC]">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={[...messages].reverse()}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          inverted
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 8,
            paddingBottom: 8,
          }}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-8">
              <Text className="text-gray-400 text-center">
                Niciun mesaj inca. Trimite primul mesaj!
              </Text>
            </View>
          }
        />

        <View className="border-t border-gray-200 bg-white px-4 py-2">
          <View className="flex-row items-end">
            <TextInput
              className="flex-1 bg-[#F3F4F6] rounded-2xl px-4 py-2.5 text-base text-gray-900 max-h-24"
              placeholder="Scrie un mesaj..."
              placeholderTextColor="#9CA3AF"
              value={messageText}
              onChangeText={setMessageText}
              multiline
              returnKeyType="default"
            />
            <TouchableOpacity
              className={`ml-2 w-10 h-10 rounded-full items-center justify-center ${
                messageText.trim() && !sending
                  ? 'bg-[#2563EB]'
                  : 'bg-gray-300'
              }`}
              onPress={handleSend}
              disabled={!messageText.trim() || sending}
              activeOpacity={0.7}
            >
              <Text className="text-white text-lg font-bold">
                {sending ? '...' : '\u2191'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
