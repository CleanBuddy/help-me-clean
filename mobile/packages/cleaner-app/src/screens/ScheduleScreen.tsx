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
import { MY_ASSIGNED_JOBS } from '@helpmeclean-mobile/shared';
import JobCard from '../components/JobCard';

interface Job {
  id: string;
  referenceCode: string;
  serviceName: string;
  scheduledDate: string;
  scheduledStartTime: string;
  estimatedDurationHours: number;
  status: string;
  address: { streetAddress: string; city: string };
  client: { fullName: string };
}

type NavigationProp = NativeStackNavigationProp<{
  JobDetail: { jobId: string };
}>;

export default function ScheduleScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { data, loading, refetch } = useQuery(MY_ASSIGNED_JOBS);
  const jobs: Job[] = data?.myAssignedJobs ?? [];

  return (
    <SafeAreaView className="flex-1 bg-[#FAFBFC]">
      <View className="px-6 pt-4 pb-2">
        <Text className="text-2xl font-bold text-gray-900">Program</Text>
        <Text className="text-sm text-gray-500 mt-1">
          Toate comenzile tale viitoare
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
              <Text className="text-gray-400 text-center">
                Nu ai comenzi programate.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
