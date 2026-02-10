import { View, Text, TouchableOpacity } from 'react-native';
import StatusBadge from './StatusBadge';

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

export default function OrderCard({
  order,
  onPress,
}: {
  order: Order;
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
          {order.serviceName}
        </Text>
        <StatusBadge status={order.status} />
      </View>
      <Text className="text-sm text-gray-600">
        {order.client?.fullName ?? '--'}
      </Text>
      <Text className="text-gray-600 text-sm">
        {order.address.streetAddress}, {order.address.city}
      </Text>
      <View className="flex-row justify-between items-center mt-1">
        <Text className="text-xs text-gray-400">
          {new Date(order.scheduledDate).toLocaleDateString('ro-RO')} ·{' '}
          {order.scheduledStartTime} · {order.estimatedDurationHours}h
        </Text>
        {order.cleaner ? (
          <Text className="text-xs text-blue-600">
            {order.cleaner.fullName}
          </Text>
        ) : (
          <Text className="text-xs text-amber-600">Neasignat</Text>
        )}
      </View>
      <Text className="text-xs text-gray-400 mt-0.5">
        Ref: {order.referenceCode}
      </Text>
    </TouchableOpacity>
  );
}
