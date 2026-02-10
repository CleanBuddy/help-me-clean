import { useCallback } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useQuery } from '@apollo/client';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MY_CHAT_ROOMS } from '@helpmeclean-mobile/shared';
import { useAuth } from '../context/AuthContext';

interface Participant {
  user: {
    id: string;
    fullName: string;
    avatarUrl?: string;
  };
  joinedAt: string;
}

interface ChatRoom {
  id: string;
  roomType: string;
  lastMessage?: {
    id: string;
    content: string;
    messageType: string;
    isRead: boolean;
    createdAt: string;
    sender: {
      id: string;
      fullName: string;
    };
  };
  participants: Participant[];
  createdAt: string;
}

type NavigationProp = NativeStackNavigationProp<{
  Chat: { roomId: string; otherUserName: string };
}>;

function formatTimestamp(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString('ro-RO', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  if (diffDays === 1) {
    return 'Ieri';
  }
  if (diffDays < 7) {
    return date.toLocaleDateString('ro-RO', { weekday: 'short' });
  }
  return date.toLocaleDateString('ro-RO', {
    day: 'numeric',
    month: 'short',
  });
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trimEnd() + '...';
}

export default function MessagesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const { data, loading, refetch } = useQuery(MY_CHAT_ROOMS, {
    fetchPolicy: 'cache-and-network',
  });

  const chatRooms: ChatRoom[] = data?.myChatRooms ?? [];

  const getOtherParticipant = useCallback(
    (participants: Participant[]) => {
      const other = participants.find((p) => p.user.id !== user?.id);
      return other?.user ?? { id: '', fullName: 'Necunoscut' };
    },
    [user?.id],
  );

  const handleRoomPress = useCallback(
    (room: ChatRoom) => {
      const otherUser = getOtherParticipant(room.participants);
      navigation.navigate('Chat', {
        roomId: room.id,
        otherUserName: otherUser.fullName,
      });
    },
    [navigation, getOtherParticipant],
  );

  const renderChatRoom = useCallback(
    ({ item }: { item: ChatRoom }) => {
      const otherUser = getOtherParticipant(item.participants);
      const lastMessage = item.lastMessage;
      const isUnread = lastMessage && !lastMessage.isRead && lastMessage.sender.id !== user?.id;

      return (
        <TouchableOpacity
          className="bg-white rounded-xl px-4 py-3 mb-2 border border-gray-100"
          activeOpacity={0.7}
          onPress={() => handleRoomPress(item)}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-3">
              <View className="flex-row items-center mb-1">
                <Text
                  className={`text-base ${isUnread ? 'font-bold' : 'font-semibold'} text-gray-900 flex-1`}
                  numberOfLines={1}
                >
                  {otherUser.fullName}
                </Text>
                {lastMessage && (
                  <Text className="text-xs text-gray-400 ml-2">
                    {formatTimestamp(lastMessage.createdAt)}
                  </Text>
                )}
              </View>
              {lastMessage ? (
                <Text
                  className={`text-sm ${isUnread ? 'text-gray-900 font-medium' : 'text-gray-500'}`}
                  numberOfLines={1}
                >
                  {truncate(lastMessage.content, 60)}
                </Text>
              ) : (
                <Text className="text-sm text-gray-400 italic">
                  Niciun mesaj inca
                </Text>
              )}
            </View>
            {isUnread && (
              <View className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
            )}
          </View>
        </TouchableOpacity>
      );
    },
    [getOtherParticipant, handleRoomPress, user?.id],
  );

  return (
    <SafeAreaView className="flex-1 bg-[#FAFBFC]">
      <View className="px-6 pt-4 pb-2">
        <Text className="text-2xl font-bold text-gray-900">Mesaje</Text>
        <Text className="text-sm text-gray-500 mt-1">
          Conversatii cu clientii
        </Text>
      </View>

      {loading && chatRooms.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <FlatList
          data={chatRooms}
          keyExtractor={(item) => item.id}
          renderItem={renderChatRoom}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 12,
            paddingBottom: 24,
            flexGrow: 1,
          }}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={() => {
                refetch();
              }}
              tintColor="#2563EB"
            />
          }
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center px-8">
              <Text className="text-5xl mb-4">💬</Text>
              <Text className="text-lg font-semibold text-gray-900 mb-2">
                Niciun mesaj
              </Text>
              <Text className="text-gray-400 text-center">
                Conversatiile cu clientii vor aparea aici
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
