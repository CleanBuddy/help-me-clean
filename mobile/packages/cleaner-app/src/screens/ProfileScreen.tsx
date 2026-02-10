import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@apollo/client';
import {
  MY_CLEANER_PROFILE,
  MY_CLEANER_STATS,
} from '@helpmeclean-mobile/shared';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { data: profileData, loading: profileLoading } =
    useQuery(MY_CLEANER_PROFILE);
  const { data: statsData, loading: statsLoading } =
    useQuery(MY_CLEANER_STATS);

  const profile = profileData?.myCleanerProfile;
  const stats = statsData?.myCleanerStats;
  const loading = profileLoading || statsLoading;

  return (
    <SafeAreaView className="flex-1 bg-[#FAFBFC]">
      <View className="px-6 pt-4 pb-2">
        <Text className="text-2xl font-bold text-gray-900">Profil</Text>
      </View>

      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* User Info */}
        <View className="bg-white rounded-xl p-5 border border-gray-200 mt-4">
          <View className="items-center mb-4">
            <View className="w-20 h-20 rounded-full bg-blue-50 items-center justify-center mb-3">
              <Text className="text-3xl">👤</Text>
            </View>
            <Text className="text-xl font-bold text-gray-900">
              {user?.fullName ?? profile?.fullName ?? '--'}
            </Text>
            <Text className="text-sm text-gray-500">
              {user?.email ?? profile?.email ?? '--'}
            </Text>
          </View>

          {profile?.phone ? (
            <View className="flex-row items-center py-2 border-t border-gray-100">
              <Text className="text-sm text-gray-500 w-24">Telefon</Text>
              <Text className="text-sm text-gray-900">{profile.phone}</Text>
            </View>
          ) : null}
        </View>

        {/* Stats */}
        {loading ? (
          <View className="mt-6 items-center">
            <ActivityIndicator size="small" color="#2563EB" />
          </View>
        ) : stats ? (
          <>
            <View className="flex-row gap-3 mt-4">
              <View className="flex-1 bg-white rounded-xl p-4 border border-gray-200">
                <Text className="text-xs text-gray-500">Total lucrari</Text>
                <Text className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.totalJobsCompleted ?? 0}
                </Text>
              </View>
              <View className="flex-1 bg-white rounded-xl p-4 border border-gray-200">
                <Text className="text-xs text-gray-500">Luna aceasta</Text>
                <Text className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.totalJobsThisMonth ?? 0}
                </Text>
              </View>
            </View>
            <View className="flex-row gap-3 mt-3">
              <View className="flex-1 bg-white rounded-xl p-4 border border-gray-200">
                <Text className="text-xs text-gray-500">Rating</Text>
                <Text className="text-2xl font-bold text-accent mt-1">
                  {stats.averageRating
                    ? Number(stats.averageRating).toFixed(1)
                    : '--'}
                </Text>
              </View>
              <View className="flex-1 bg-white rounded-xl p-4 border border-gray-200">
                <Text className="text-xs text-gray-500">Urmatoare</Text>
                <Text className="text-2xl font-bold text-primary mt-1">
                  {stats.upcomingJobsCount ?? 0}
                </Text>
              </View>
            </View>
          </>
        ) : null}

        {/* Logout */}
        <TouchableOpacity
          className="mt-8 py-3.5 rounded-xl items-center bg-red-50 border border-red-200"
          onPress={logout}
        >
          <Text className="text-danger font-semibold">Deconectare</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
