import { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { useQuery, useMutation } from '@apollo/client';
import {
  BOOKING_DETAIL,
  MY_CLEANERS,
  ASSIGN_CLEANER,
  COMPANY_BOOKINGS,
} from '@helpmeclean-mobile/shared';
import StatusBadge from '../components/StatusBadge';

type OrderDetailRouteParams = {
  OrderDetail: { orderId: string };
};

export default function OrderDetailScreen() {
  const route = useRoute<RouteProp<OrderDetailRouteParams, 'OrderDetail'>>();
  const { orderId } = route.params;
  const [showCleanerModal, setShowCleanerModal] = useState(false);

  const { data, loading } = useQuery(BOOKING_DETAIL, {
    variables: { id: orderId },
  });
  const booking = data?.booking;

  const { data: cleanersData, loading: cleanersLoading } = useQuery(
    MY_CLEANERS,
    {
      skip: !showCleanerModal,
    },
  );
  const cleaners = cleanersData?.myCleaners ?? [];

  const [assignCleaner, { loading: assigning }] = useMutation(ASSIGN_CLEANER, {
    refetchQueries: [
      { query: BOOKING_DETAIL, variables: { id: orderId } },
      { query: COMPANY_BOOKINGS },
    ],
  });

  const handleAssignCleaner = async (cleanerId: string) => {
    try {
      await assignCleaner({
        variables: { bookingId: orderId, cleanerId },
      });
      setShowCleanerModal(false);
      Alert.alert('Succes', 'Curatenistul a fost asignat cu succes.');
    } catch {
      Alert.alert('Eroare', 'Nu s-a putut asigna curatenistul.');
    }
  };

  if (loading || !booking) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#FAFBFC]">
        <ActivityIndicator size="large" color="#2563EB" />
      </SafeAreaView>
    );
  }

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

        {/* Client */}
        <View className="bg-white rounded-xl p-4 border border-gray-200 mb-3">
          <Text className="text-sm font-semibold text-gray-900 mb-2">
            Client
          </Text>
          <Text className="text-sm text-gray-600">
            {booking.client?.fullName ?? '--'}
          </Text>
          {booking.client?.email ? (
            <Text className="text-sm text-gray-400">
              {booking.client.email}
            </Text>
          ) : null}
          {booking.client?.phone ? (
            <Text className="text-sm text-gray-400">
              {booking.client.phone}
            </Text>
          ) : null}
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

        {/* Cleaner */}
        <View className="bg-white rounded-xl p-4 border border-gray-200 mb-3">
          <Text className="text-sm font-semibold text-gray-900 mb-2">
            Curatenist
          </Text>
          {booking.cleaner ? (
            <>
              <Text className="text-sm text-gray-600">
                {booking.cleaner.fullName}
              </Text>
              {booking.cleaner.phone ? (
                <Text className="text-sm text-gray-400">
                  {booking.cleaner.phone}
                </Text>
              ) : null}
            </>
          ) : (
            <Text className="text-sm text-amber-600">
              Niciun curatenist asignat
            </Text>
          )}
        </View>

        {/* Property */}
        {(booking.propertyType || booking.numRooms || booking.areaSqm) && (
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

        {/* Financials */}
        <View className="bg-white rounded-xl p-4 border border-gray-200 mb-3">
          <Text className="text-sm font-semibold text-gray-900 mb-2">
            Financiar
          </Text>
          {booking.hourlyRate ? (
            <Text className="text-sm text-gray-600">
              Tarif orar: {booking.hourlyRate} RON/h
            </Text>
          ) : null}
          {booking.estimatedTotal ? (
            <Text className="text-sm text-gray-600">
              Total estimat: {booking.estimatedTotal} RON
            </Text>
          ) : null}
          {booking.finalTotal ? (
            <Text className="text-sm font-semibold text-gray-900">
              Total final: {booking.finalTotal} RON
            </Text>
          ) : null}
          {booking.paymentStatus ? (
            <Text className="text-sm text-gray-400 mt-1">
              Status plata: {booking.paymentStatus}
            </Text>
          ) : null}
        </View>

        {/* Assign Cleaner Action */}
        {!booking.cleaner &&
          booking.status !== 'COMPLETED' &&
          booking.status !== 'CANCELLED_BY_CLIENT' &&
          booking.status !== 'CANCELLED_BY_COMPANY' &&
          booking.status !== 'CANCELLED_BY_ADMIN' && (
            <TouchableOpacity
              className="mt-4 py-3.5 rounded-xl items-center bg-primary"
              onPress={() => setShowCleanerModal(true)}
            >
              <Text className="text-white font-semibold">
                Asigneaza curatenist
              </Text>
            </TouchableOpacity>
          )}
      </ScrollView>

      {/* Cleaner Selection Modal */}
      <Modal
        visible={showCleanerModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCleanerModal(false)}
      >
        <SafeAreaView className="flex-1 bg-[#FAFBFC]">
          <View className="flex-row justify-between items-center px-6 pt-4 pb-2">
            <Text className="text-xl font-bold text-gray-900">
              Selecteaza curatenist
            </Text>
            <TouchableOpacity onPress={() => setShowCleanerModal(false)}>
              <Text className="text-primary font-semibold">Inchide</Text>
            </TouchableOpacity>
          </View>

          {cleanersLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#2563EB" />
            </View>
          ) : (
            <FlatList
              data={cleaners}
              keyExtractor={(item: { id: string }) => item.id}
              contentContainerStyle={{
                paddingHorizontal: 24,
                paddingTop: 12,
                paddingBottom: 24,
              }}
              renderItem={({
                item,
              }: {
                item: {
                  id: string;
                  fullName: string;
                  email?: string;
                  status: string;
                  ratingAvg?: number;
                  totalJobsCompleted?: number;
                };
              }) => (
                <TouchableOpacity
                  className="bg-white rounded-xl p-4 border border-gray-200 mb-3"
                  onPress={() => handleAssignCleaner(item.id)}
                  disabled={assigning}
                  activeOpacity={0.7}
                >
                  <View className="flex-row justify-between items-center mb-1">
                    <Text className="text-sm font-semibold text-gray-900">
                      {item.fullName}
                    </Text>
                    <View
                      className={`px-2 py-0.5 rounded-lg ${item.status === 'ACTIVE' ? 'bg-emerald-100' : 'bg-gray-100'}`}
                    >
                      <Text
                        className={`text-xs font-medium ${item.status === 'ACTIVE' ? 'text-emerald-700' : 'text-gray-600'}`}
                      >
                        {item.status === 'ACTIVE' ? 'Activ' : item.status}
                      </Text>
                    </View>
                  </View>
                  {item.email ? (
                    <Text className="text-sm text-gray-400">{item.email}</Text>
                  ) : null}
                  <View className="flex-row mt-1">
                    {item.ratingAvg ? (
                      <Text className="text-xs text-accent mr-3">
                        Rating: {Number(item.ratingAvg).toFixed(1)}
                      </Text>
                    ) : null}
                    <Text className="text-xs text-gray-400">
                      {item.totalJobsCompleted ?? 0} lucrari
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View className="bg-gray-100 rounded-xl p-8 items-center mt-4">
                  <Text className="text-gray-400 text-center">
                    Nu ai curatenisti in echipa.
                  </Text>
                </View>
              }
            />
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
