import { View, Text } from 'react-native';

const variants: Record<string, { bg: string; text: string }> = {
  PENDING: { bg: 'bg-amber-100', text: 'text-amber-700' },
  ASSIGNED: { bg: 'bg-blue-100', text: 'text-blue-700' },
  CONFIRMED: { bg: 'bg-blue-100', text: 'text-blue-700' },
  IN_PROGRESS: { bg: 'bg-blue-50', text: 'text-primary' },
  COMPLETED: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  CANCELLED_BY_CLIENT: { bg: 'bg-red-100', text: 'text-red-700' },
  CANCELLED_BY_COMPANY: { bg: 'bg-red-100', text: 'text-red-700' },
  CANCELLED_BY_ADMIN: { bg: 'bg-red-100', text: 'text-red-700' },
};

const labels: Record<string, string> = {
  PENDING: 'In asteptare',
  ASSIGNED: 'Asignat',
  CONFIRMED: 'Confirmat',
  IN_PROGRESS: 'In desfasurare',
  COMPLETED: 'Finalizat',
  CANCELLED_BY_CLIENT: 'Anulat',
  CANCELLED_BY_COMPANY: 'Anulat',
  CANCELLED_BY_ADMIN: 'Anulat',
};

export default function StatusBadge({ status }: { status: string }) {
  const v = variants[status] ?? { bg: 'bg-gray-100', text: 'text-gray-700' };
  return (
    <View className={`px-2.5 py-1 rounded-lg ${v.bg}`}>
      <Text className={`text-xs font-medium ${v.text}`}>
        {labels[status] ?? status}
      </Text>
    </View>
  );
}
