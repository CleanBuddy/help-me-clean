import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useQuery } from '@apollo/client';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MY_COMPANY, COMPANY_BOOKINGS } from '@helpmeclean-mobile/shared';
import StatusBadge from '../components/StatusBadge';

type NavigationProp = NativeStackNavigationProp<{
  OrderDetail: { orderId: string };
}>;

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const {
    data: companyData,
    loading: companyLoading,
    refetch: refetchCompany,
  } = useQuery(MY_COMPANY);
  const {
    data: bookingsData,
    loading: bookingsLoading,
    refetch: refetchBookings,
  } = useQuery(COMPANY_BOOKINGS, {
    variables: { first: 5 },
  });

  const company = companyData?.myCompany;
  const bookings = bookingsData?.companyBookings?.edges ?? [];
  const loading = companyLoading || bookingsLoading;

  const handleRefresh = () => {
    refetchCompany();
    refetchBookings();
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FAFBFC]">
      <View className="px-6 pt-4 pb-2">
        <Text className="text-2xl font-bold text-gray-900">
          {company ? company.companyName : 'HelpMeClean'}
        </Text>
        <Text className="text-sm text-gray-500">Company Dashboard</Text>
      </View>

      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={handleRefresh}
            tintColor="#2563EB"
          />
        }
      >
        {/* Stats */}
        {companyLoading ? (
          <View className="mt-6 items-center">
            <ActivityIndicator size="small" color="#2563EB" />
          </View>
        ) : company ? (
          <View className="flex-row gap-3 mt-4">
            <View className="flex-1 bg-white rounded-xl p-4 border border-gray-200">
              <Text className="text-xs text-gray-500">Lucrari totale</Text>
              <Text className="text-2xl font-bold text-gray-900 mt-1">
                {company.totalJobsCompleted ?? 0}
              </Text>
            </View>
            <View className="flex-1 bg-white rounded-xl p-4 border border-gray-200">
              <Text className="text-xs text-gray-500">Rating</Text>
              <Text className="text-2xl font-bold text-accent mt-1">
                {company.ratingAvg
                  ? Number(company.ratingAvg).toFixed(1)
                  : '--'}
              </Text>
            </View>
          </View>
        ) : null}

        {/* Recent Orders */}
        <Text className="text-lg font-semibold text-gray-900 mt-6 mb-3">
          Comenzi recente
        </Text>
        {bookings.length === 0 ? (
          <View className="bg-gray-100 rounded-xl p-8 items-center">
            <Text className="text-gray-400 text-center">
              Nicio comanda inca.
            </Text>
          </View>
        ) : (
          bookings.map((booking: {
            id: string;
            serviceName: string;
            status: string;
            client?: { fullName: string };
            scheduledDate: string;
            referenceCode: string;
          }) => (
            <TouchableOpacity
              key={booking.id}
              className="bg-white rounded-xl p-4 border border-gray-200 mb-3"
              onPress={() =>
                navigation.navigate('OrderDetail', { orderId: booking.id })
              }
              activeOpacity={0.7}
            >
              <View className="flex-row justify-between items-center mb-1">
                <Text className="text-sm font-semibold text-primary">
                  {booking.serviceName}
                </Text>
                <StatusBadge status={booking.status} />
              </View>
              <Text className="text-sm text-gray-600">
                {booking.client?.fullName ?? '--'}
              </Text>
              <Text className="text-xs text-gray-400 mt-0.5">
                {new Date(booking.scheduledDate).toLocaleDateString('ro-RO')} ·{' '}
                {booking.referenceCode}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
