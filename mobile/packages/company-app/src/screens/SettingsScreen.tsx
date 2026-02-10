import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@apollo/client';
import { MY_COMPANY } from '@helpmeclean-mobile/shared';
import { useAuth } from '../context/AuthContext';

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const { data, loading } = useQuery(MY_COMPANY);
  const company = data?.myCompany;

  return (
    <SafeAreaView className="flex-1 bg-[#FAFBFC]">
      <View className="px-6 pt-4 pb-2">
        <Text className="text-2xl font-bold text-gray-900">Setari</Text>
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
              {user?.fullName ?? '--'}
            </Text>
            <Text className="text-sm text-gray-500">
              {user?.email ?? '--'}
            </Text>
            <View className="bg-blue-100 px-3 py-1 rounded-full mt-2">
              <Text className="text-xs font-medium text-blue-700">
                Administrator
              </Text>
            </View>
          </View>
        </View>

        {/* Company Info */}
        {loading ? (
          <View className="mt-6 items-center">
            <ActivityIndicator size="small" color="#2563EB" />
          </View>
        ) : company ? (
          <View className="bg-white rounded-xl p-5 border border-gray-200 mt-4">
            <Text className="text-sm font-semibold text-gray-900 mb-3">
              Informatii companie
            </Text>

            <View className="py-2 border-b border-gray-100">
              <Text className="text-xs text-gray-500">Nume companie</Text>
              <Text className="text-sm text-gray-900 mt-0.5">
                {company.companyName}
              </Text>
            </View>

            <View className="py-2 border-b border-gray-100">
              <Text className="text-xs text-gray-500">CUI</Text>
              <Text className="text-sm text-gray-900 mt-0.5">
                {company.cui}
              </Text>
            </View>

            {company.companyType ? (
              <View className="py-2 border-b border-gray-100">
                <Text className="text-xs text-gray-500">Tip companie</Text>
                <Text className="text-sm text-gray-900 mt-0.5">
                  {company.companyType}
                </Text>
              </View>
            ) : null}

            {company.contactEmail ? (
              <View className="py-2 border-b border-gray-100">
                <Text className="text-xs text-gray-500">Email contact</Text>
                <Text className="text-sm text-gray-900 mt-0.5">
                  {company.contactEmail}
                </Text>
              </View>
            ) : null}

            {company.contactPhone ? (
              <View className="py-2 border-b border-gray-100">
                <Text className="text-xs text-gray-500">Telefon contact</Text>
                <Text className="text-sm text-gray-900 mt-0.5">
                  {company.contactPhone}
                </Text>
              </View>
            ) : null}

            {company.maxServiceRadiusKm ? (
              <View className="py-2 border-b border-gray-100">
                <Text className="text-xs text-gray-500">
                  Raza maxima de serviciu
                </Text>
                <Text className="text-sm text-gray-900 mt-0.5">
                  {company.maxServiceRadiusKm} km
                </Text>
              </View>
            ) : null}

            {company.description ? (
              <View className="py-2">
                <Text className="text-xs text-gray-500">Descriere</Text>
                <Text className="text-sm text-gray-900 mt-0.5">
                  {company.description}
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}

        {/* Company Stats */}
        {company ? (
          <View className="flex-row gap-3 mt-4">
            <View className="flex-1 bg-white rounded-xl p-4 border border-gray-200">
              <Text className="text-xs text-gray-500">Status</Text>
              <Text className="text-sm font-semibold text-gray-900 mt-1">
                {company.status === 'ACTIVE' ? 'Activ' : company.status}
              </Text>
            </View>
            <View className="flex-1 bg-white rounded-xl p-4 border border-gray-200">
              <Text className="text-xs text-gray-500">Rating</Text>
              <Text className="text-sm font-semibold text-accent mt-1">
                {company.ratingAvg
                  ? Number(company.ratingAvg).toFixed(1)
                  : '--'}
              </Text>
            </View>
          </View>
        ) : null}

        {/* Logout */}
        <TouchableOpacity
          className="mt-8 py-3.5 rounded-xl items-center bg-red-50 border border-red-200"
          onPress={logout}
        >
          <Text className="text-danger font-semibold">Deconectare</Text>
        </TouchableOpacity>

        {/* App Info */}
        <Text className="text-xs text-gray-400 text-center mt-6">
          HelpMeClean Company App v1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
