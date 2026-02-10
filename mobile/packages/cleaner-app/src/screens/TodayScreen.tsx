import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@apollo/client';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TODAYS_JOBS } from '@helpmeclean-mobile/shared';
import JobCard from '../components/JobCard';

interface Job {
  id: string;
  referenceCode: string;
  serviceName: string;
  scheduledDate: string;
  scheduledStartTime: string;
  estimatedDurationHours: number;
  status: string;
  address: { streetAddress: string; city: string; floor?: string; apartment?: string };
  client: { fullName: string; phone?: string };
}

type NavigationProp = NativeStackNavigationProp<{
  JobDetail: { jobId: string };
}>;

export default function TodayScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { data, loading, refetch } = useQuery(TODAYS_JOBS);
  const jobs: Job[] = data?.todaysJobs ?? [];

  return (
    <SafeAreaView className="flex-1 bg-[#FAFBFC]">
      <View className="px-6 pt-4 pb-2">
        <Text className="text-2xl font-bold text-gray-900">
          Comenzile de azi
        </Text>
        <Text className="text-sm text-gray-500 mt-1">
          {jobs.length > 0
            ? `${jobs.length} comand${jobs.length === 1 ? 'a' : 'e'}`
            : 'Nicio comanda'}
        </Text>
      </View>

      {loading && jobs.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <FlatList
          data={jobs}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <JobCard
              job={item}
              onPress={() =>
                navigation.navigate('JobDetail', { jobId: item.id })
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
              <Text className="text-gray-400 text-center text-base">
                Nicio comanda programata pentru azi.
              </Text>
              <Text className="text-gray-400 text-center text-sm mt-1">
                Vei fi notificat cand primesti o comanda noua.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
