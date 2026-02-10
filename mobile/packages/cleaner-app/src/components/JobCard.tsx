import { View, Text, TouchableOpacity } from 'react-native';
import StatusBadge from './StatusBadge';

interface Job {
  id: string;
  referenceCode: string;
  serviceName: string;
  scheduledDate: string;
  scheduledStartTime: string;
  estimatedDurationHours: number;
  status: string;
  address: {
    streetAddress: string;
    city: string;
    floor?: string;
    apartment?: string;
  };
  client: { fullName: string; phone?: string };
}

export default function JobCard({
  job,
  onPress,
}: {
  job: Job;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      className="bg-white rounded-xl p-4 border border-gray-200 mb-3"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-sm font-semibold text-primary">
          {job.serviceName}
        </Text>
        <StatusBadge status={job.status} />
      </View>
      <Text className="text-gray-600 text-sm">
        {job.address.streetAddress}, {job.address.city}
      </Text>
      <Text className="text-gray-400 text-xs mt-1">
        {job.scheduledStartTime} · {job.estimatedDurationHours}h ·{' '}
        {job.client.fullName}
      </Text>
      <Text className="text-xs text-gray-400 mt-0.5">
        Ref: {job.referenceCode}
      </Text>
    </TouchableOpacity>
  );
}
