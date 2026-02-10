import { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useQuery } from '@apollo/client';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COMPANY_BOOKINGS } from '@helpmeclean-mobile/shared';
import OrderCard from '../components/OrderCard';

interface Order {
  id: string;
  referenceCode: string;
  serviceName: string;
  scheduledDate: string;
  scheduledStartTime: string;
  estimatedDurationHours: number;
  status: string;
  estimatedTotal?: number;
  client?: { id: string; fullName: string; email?: string };
  cleaner?: { id: string; fullName: string } | null;
  address: { streetAddress: string; city: string };
}

type NavigationProp = NativeStackNavigationProp<{
  OrderDetail: { orderId: string };
}>;

const STATUS_FILTERS = [
  { label: 'Toate', value: undefined },
  { label: 'In asteptare', value: 'PENDING' },
  { label: 'Confirmate', value: 'CONFIRMED' },
  { label: 'In desfasurare', value: 'IN_PROGRESS' },
  { label: 'Finalizate', value: 'COMPLETED' },
] as const;

export default function OrdersScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [selectedFilter, setSelectedFilter] = useState<string | undefined>(
    undefined,
  );

  const { data, loading, refetch } = useQuery(COMPANY_BOOKINGS, {
    variables: { status: selectedFilter, first: 50 },
  });

  const orders: Order[] = data?.companyBookings?.edges ?? [];
  const totalCount = data?.companyBookings?.totalCount ?? 0;

  return (
    <SafeAreaView className="flex-1 bg-[#FAFBFC]">
      <View className="px-6 pt-4 pb-2">
        <Text className="text-2xl font-bold text-gray-900">Comenzi</Text>
        <Text className="text-sm text-gray-500 mt-1">
          {totalCount} comenz{totalCount === 1 ? 'i' : 'i'} in total
        </Text>
      </View>

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-6 mb-2"
        contentContainerStyle={{ paddingRight: 24 }}
      >
        {STATUS_FILTERS.map((filter) => {
          const isActive = selectedFilter === filter.value;
          return (
            <TouchableOpacity
              key={filter.label}
              className={`mr-2 px-4 py-2 rounded-full ${isActive ? 'bg-primary' : 'bg-white border border-gray-200'}`}
              onPress={() => setSelectedFilter(filter.value)}
            >
              <Text
                className={`text-sm font-medium ${isActive ? 'text-white' : 'text-gray-600'}`}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {loading && orders.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <OrderCard
              order={item}
              onPress={() =>
                navigation.navigate('OrderDetail', { orderId: item.id })
              }
            />
          )}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 12,
            paddingBottom: 24,
          }}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={() => { refetch(); }}
              tintColor="#2563EB"
            />
          }
          ListEmptyComponent={
            <View className="bg-gray-100 rounded-xl p-8 items-center mt-4">
              <Text className="text-gray-400 text-center">
                Nicio comanda gasita pentru filtrul selectat.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
