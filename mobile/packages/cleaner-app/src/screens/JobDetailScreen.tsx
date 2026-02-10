import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { useQuery, useMutation } from '@apollo/client';
import {
  BOOKING_DETAIL,
  CONFIRM_BOOKING,
  START_JOB,
  COMPLETE_JOB,
  TODAYS_JOBS,
  MY_ASSIGNED_JOBS,
} from '@helpmeclean-mobile/shared';
import StatusBadge from '../components/StatusBadge';

type JobDetailRouteParams = {
  JobDetail: { jobId: string };
};

export default function JobDetailScreen() {
  const route = useRoute<RouteProp<JobDetailRouteParams, 'JobDetail'>>();
  const { jobId } = route.params;

  const { data, loading } = useQuery(BOOKING_DETAIL, {
    variables: { id: jobId },
  });
  const booking = data?.booking;

  const refetchQueries = [
    { query: TODAYS_JOBS },
    { query: MY_ASSIGNED_JOBS },
    { query: BOOKING_DETAIL, variables: { id: jobId } },
  ];

  const [confirmBooking, { loading: confirming }] = useMutation(
    CONFIRM_BOOKING,
    { refetchQueries },
  );
  const [startJob, { loading: starting }] = useMutation(START_JOB, {
    refetchQueries,
  });
  const [completeJob, { loading: completing }] = useMutation(COMPLETE_JOB, {
    refetchQueries,
  });

  const handleAction = async (action: string) => {
    try {
      if (action === 'confirm')
        await confirmBooking({ variables: { id: jobId } });
      if (action === 'start') await startJob({ variables: { id: jobId } });
      if (action === 'complete')
        await completeJob({ variables: { id: jobId } });
      Alert.alert('Succes', 'Statusul comenzii a fost actualizat.');
    } catch {
      Alert.alert('Eroare', 'Nu s-a putut actualiza statusul.');
    }
  };

  if (loading || !booking) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#FAFBFC]">
        <ActivityIndicator size="large" color="#2563EB" />
      </SafeAreaView>
    );
  }

  const actionLoading = confirming || starting || completing;

  return (
    <SafeAreaView className="flex-1 bg-[#FAFBFC]">
      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}
      >
        {/* Header */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-xl font-bold text-gray-900 flex-1 mr-3">
            {booking.serviceName}
          </Text>
          <StatusBadge status={booking.status} />
        </View>

        {/* Reference */}
        <Text className="text-sm text-gray-400 mb-4">
          Ref: {booking.referenceCode}
        </Text>

        {/* Schedule */}
        <View className="bg-white rounded-xl p-4 border border-gray-200 mb-3">
          <Text className="text-sm font-semibold text-gray-900 mb-2">
            Programare
          </Text>
          <Text className="text-sm text-gray-600">
            Data:{' '}
            {new Date(booking.scheduledDate).toLocaleDateString('ro-RO')}
          </Text>
          <Text className="text-sm text-gray-600">
            Ora: {booking.scheduledStartTime}
          </Text>
          <Text className="text-sm text-gray-600">
            Durata: {booking.estimatedDurationHours}h
          </Text>
        </View>

        {/* Address */}
        <View className="bg-white rounded-xl p-4 border border-gray-200 mb-3">
          <Text className="text-sm font-semibold text-gray-900 mb-2">
            Adresa
          </Text>
          <Text className="text-sm text-gray-600">
            {booking.address.streetAddress}
          </Text>
          <Text className="text-sm text-gray-600">
            {booking.address.city}
            {booking.address.county ? `, ${booking.address.county}` : ''}
          </Text>
          {booking.address.floor ? (
            <Text className="text-sm text-gray-400">
              Etaj: {booking.address.floor}
            </Text>
          ) : null}
          {booking.address.apartment ? (
            <Text className="text-sm text-gray-400">
              Ap: {booking.address.apartment}
            </Text>
          ) : null}
        </View>

        {/* Client */}
        <View className="bg-white rounded-xl p-4 border border-gray-200 mb-3">
          <Text className="text-sm font-semibold text-gray-900 mb-2">
            Client
          </Text>
          <Text className="text-sm text-gray-600">
            {booking.client?.fullName ?? '--'}
          </Text>
          {booking.client?.phone ? (
            <Text className="text-sm text-gray-400">
              {booking.client.phone}
            </Text>
          ) : null}
        </View>

        {/* Property */}
        {(booking.propertyType ||
          booking.numRooms ||
          booking.areaSqm) && (
          <View className="bg-white rounded-xl p-4 border border-gray-200 mb-3">
            <Text className="text-sm font-semibold text-gray-900 mb-2">
              Proprietate
            </Text>
            {booking.propertyType ? (
              <Text className="text-sm text-gray-600">
                Tip: {booking.propertyType}
              </Text>
            ) : null}
            {booking.numRooms ? (
              <Text className="text-sm text-gray-600">
                Camere: {booking.numRooms}
              </Text>
            ) : null}
            {booking.numBathrooms ? (
              <Text className="text-sm text-gray-600">
                Bai: {booking.numBathrooms}
              </Text>
            ) : null}
            {booking.areaSqm ? (
              <Text className="text-sm text-gray-600">
                Suprafata: {booking.areaSqm} mp
              </Text>
            ) : null}
            {booking.hasPets ? (
              <Text className="text-sm text-accent">
                Are animale de companie
              </Text>
            ) : null}
          </View>
        )}

        {/* Special Instructions */}
        {booking.specialInstructions ? (
          <View className="bg-white rounded-xl p-4 border border-gray-200 mb-3">
            <Text className="text-sm font-semibold text-gray-900 mb-2">
              Instructiuni speciale
            </Text>
            <Text className="text-sm text-gray-600">
              {booking.specialInstructions}
            </Text>
          </View>
        ) : null}

        {/* Actions */}
        <View className="mt-4">
          {booking.status === 'ASSIGNED' && (
            <TouchableOpacity
              className={`py-3.5 rounded-xl items-center ${actionLoading ? 'bg-blue-400' : 'bg-primary'}`}
              onPress={() => handleAction('confirm')}
              disabled={actionLoading}
            >
              <Text className="text-white font-semibold">
                {confirming ? 'Se confirma...' : 'Confirma comanda'}
              </Text>
            </TouchableOpacity>
          )}
          {booking.status === 'CONFIRMED' && (
            <TouchableOpacity
              className={`py-3.5 rounded-xl items-center ${actionLoading ? 'bg-emerald-400' : 'bg-secondary'}`}
              onPress={() => handleAction('start')}
              disabled={actionLoading}
            >
              <Text className="text-white font-semibold">
                {starting ? 'Se porneste...' : 'Incepe curatenia'}
              </Text>
            </TouchableOpacity>
          )}
          {booking.status === 'IN_PROGRESS' && (
            <TouchableOpacity
              className={`py-3.5 rounded-xl items-center ${actionLoading ? 'bg-emerald-400' : 'bg-secondary'}`}
              onPress={() => handleAction('complete')}
              disabled={actionLoading}
            >
              <Text className="text-white font-semibold">
                {completing ? 'Se finalizeaza...' : 'Finalizeaza curatenia'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
