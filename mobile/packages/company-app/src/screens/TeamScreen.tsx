import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useQuery, useMutation } from '@apollo/client';
import { MY_CLEANERS, INVITE_CLEANER } from '@helpmeclean-mobile/shared';

export default function TeamScreen() {
  const { data, loading, refetch } = useQuery(MY_CLEANERS);
  const cleaners = data?.myCleaners ?? [];

  const [inviteCleaner, { loading: inviting }] = useMutation(INVITE_CLEANER, {
    refetchQueries: [{ query: MY_CLEANERS }],
  });

  const handleInvite = () => {
    Alert.prompt(
      'Invita curatenist',
      'Introdu numele complet:',
      (fullName) => {
        if (!fullName?.trim()) return;
        Alert.prompt(
          'Invita curatenist',
          'Introdu adresa de email:',
          async (email) => {
            if (!email?.trim()) return;
            try {
              await inviteCleaner({
                variables: {
                  fullName: fullName.trim(),
                  email: email.trim(),
                },
              });
              Alert.alert('Succes', 'Invitatia a fost trimisa cu succes.');
            } catch {
              Alert.alert('Eroare', 'Nu s-a putut trimite invitatia.');
            }
          },
          'plain-text',
          '',
          'email-address',
        );
      },
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FAFBFC]">
      <View className="px-6 pt-4 pb-2 flex-row justify-between items-center">
        <View>
          <Text className="text-2xl font-bold text-gray-900">Echipa</Text>
          <Text className="text-sm text-gray-500 mt-1">
            {cleaners.length} curatenist{cleaners.length === 1 ? '' : 'i'}
          </Text>
        </View>
        <TouchableOpacity
          className={`px-4 py-2 rounded-xl ${inviting ? 'bg-blue-400' : 'bg-primary'}`}
          onPress={handleInvite}
          disabled={inviting}
        >
          <Text className="text-white font-semibold text-sm">
            {inviting ? '...' : '+ Invita'}
          </Text>
        </TouchableOpacity>
      </View>

      {loading && cleaners.length === 0 ? (
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
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={() => { refetch(); }}
              tintColor="#2563EB"
            />
          }
          renderItem={({
            item,
          }: {
            item: {
              id: string;
              fullName: string;
              phone?: string;
              email?: string;
              status: string;
              ratingAvg?: number;
              totalJobsCompleted?: number;
            };
          }) => (
            <View className="bg-white rounded-xl p-4 border border-gray-200 mb-3">
              <View className="flex-row justify-between items-center mb-2">
                <View className="flex-row items-center flex-1">
                  <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center mr-3">
                    <Text className="text-lg">👤</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-gray-900">
                      {item.fullName}
                    </Text>
                    {item.email ? (
                      <Text className="text-xs text-gray-400">
                        {item.email}
                      </Text>
                    ) : null}
                  </View>
                </View>
                <View
                  className={`px-2.5 py-1 rounded-lg ${item.status === 'ACTIVE' ? 'bg-emerald-100' : item.status === 'PENDING' ? 'bg-amber-100' : 'bg-gray-100'}`}
                >
                  <Text
                    className={`text-xs font-medium ${item.status === 'ACTIVE' ? 'text-emerald-700' : item.status === 'PENDING' ? 'text-amber-700' : 'text-gray-600'}`}
                  >
                    {item.status === 'ACTIVE'
                      ? 'Activ'
                      : item.status === 'PENDING'
                        ? 'In asteptare'
                        : item.status}
                  </Text>
                </View>
              </View>

              <View className="flex-row mt-1 ml-13">
                {item.phone ? (
                  <Text className="text-xs text-gray-400 mr-4">
                    {item.phone}
                  </Text>
                ) : null}
                {item.ratingAvg ? (
                  <Text className="text-xs text-accent mr-4">
                    Rating: {Number(item.ratingAvg).toFixed(1)}
                  </Text>
                ) : null}
                <Text className="text-xs text-gray-400">
                  {item.totalJobsCompleted ?? 0} lucrari finalizate
                </Text>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View className="bg-gray-100 rounded-xl p-8 items-center mt-4">
              <Text className="text-5xl mb-4">👥</Text>
              <Text className="text-lg font-semibold text-gray-900 mb-2">
                Niciun curatenist
              </Text>
              <Text className="text-gray-400 text-center">
                Invita curatenisti in echipa ta pentru a le putea asigna
                comenzi.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
