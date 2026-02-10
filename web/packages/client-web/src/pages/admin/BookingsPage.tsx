import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Calendar, Building2, User } from 'lucide-react';
import { cn } from '@helpmeclean/shared';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { ALL_BOOKINGS } from '@/graphql/operations';

type StatusFilter = 'ALL' | 'PENDING' | 'ASSIGNED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

const statusTabs: { key: StatusFilter; label: string }[] = [
  { key: 'ALL', label: 'Toate' },
  { key: 'PENDING', label: 'In asteptare' },
  { key: 'ASSIGNED', label: 'Asignate' },
  { key: 'CONFIRMED', label: 'Confirmate' },
  { key: 'IN_PROGRESS', label: 'In desfasurare' },
  { key: 'COMPLETED', label: 'Finalizate' },
  { key: 'CANCELLED', label: 'Anulate' },
];

const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  PENDING: 'warning',
  ASSIGNED: 'info',
  CONFIRMED: 'info',
  IN_PROGRESS: 'info',
  COMPLETED: 'success',
  CANCELLED: 'danger',
  CANCELLED_BY_CLIENT: 'danger',
  CANCELLED_BY_COMPANY: 'danger',
  CANCELLED_BY_ADMIN: 'danger',
};

const statusLabel: Record<string, string> = {
  PENDING: 'In asteptare',
  ASSIGNED: 'Asignat',
  CONFIRMED: 'Confirmat',
  IN_PROGRESS: 'In desfasurare',
  COMPLETED: 'Finalizat',
  CANCELLED: 'Anulat',
  CANCELLED_BY_CLIENT: 'Anulat de client',
  CANCELLED_BY_COMPANY: 'Anulat de companie',
  CANCELLED_BY_ADMIN: 'Anulat de admin',
};

interface BookingEdge {
  id: string;
  referenceCode: string;
  serviceType: string;
  serviceName: string;
  scheduledDate: string;
  scheduledStartTime: string;
  estimatedDurationHours: number;
  status: string;
  estimatedTotal: number;
  paymentStatus: string;
  createdAt: string;
  client: { id: string; fullName: string; email: string } | null;
  company: { id: string; companyName: string } | null;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('ro-RO', {
    style: 'currency',
    currency: 'RON',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function BookingsPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<StatusFilter>('ALL');

  const { data, loading } = useQuery(ALL_BOOKINGS, {
    variables: {
      status: filter === 'ALL' ? undefined : filter,
      first: 50,
    },
  });

  const bookings: BookingEdge[] = data?.allBookings?.edges ?? [];
  const totalCount: number = data?.allBookings?.totalCount ?? 0;

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Comenzi</h1>
            <p className="text-gray-500 mt-1">Gestioneaza toate comenzile de pe platforma.</p>
          </div>
          {totalCount > 0 && (
            <Badge variant="info">{totalCount} comenzi</Badge>
          )}
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit overflow-x-auto">
        {statusTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap cursor-pointer',
              filter === tab.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <div className="animate-pulse flex items-center gap-4">
                <div className="h-10 w-10 bg-gray-200 rounded-xl" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-40 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-28" />
                </div>
                <div className="h-6 w-20 bg-gray-200 rounded-lg" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Bookings List */}
      {!loading && bookings.length === 0 && (
        <Card>
          <p className="text-center text-gray-400 py-12">Nu exista comenzi.</p>
        </Card>
      )}

      {!loading && bookings.length > 0 && (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <Card
              key={booking.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/admin/comenzi/${booking.id}`)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-xl bg-primary/10">
                    <ClipboardList className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{booking.referenceCode}</h3>
                      <Badge variant={statusVariant[booking.status] ?? 'default'}>
                        {statusLabel[booking.status] ?? booking.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-0.5">{booking.serviceName}</p>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(booking.scheduledDate).toLocaleDateString('ro-RO')}
                      </span>
                      {booking.client && (
                        <span className="flex items-center gap-1">
                          <User className="h-3.5 w-3.5" />
                          {booking.client.fullName}
                        </span>
                      )}
                      {booking.company && (
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3.5 w-3.5" />
                          {booking.company.companyName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-semibold text-gray-900">{formatCurrency(booking.estimatedTotal)}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{booking.paymentStatus}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
