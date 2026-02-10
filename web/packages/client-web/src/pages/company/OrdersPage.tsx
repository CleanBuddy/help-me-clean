import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, ChevronRight } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { COMPANY_BOOKINGS } from '@/graphql/operations';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const statusBadgeVariant: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  IN_PROGRESS: 'info',
  COMPLETED: 'success',
  CANCELLED: 'danger',
};

const statusLabel: Record<string, string> = {
  PENDING: 'In asteptare',
  CONFIRMED: 'Confirmata',
  IN_PROGRESS: 'In desfasurare',
  COMPLETED: 'Finalizata',
  CANCELLED: 'Anulata',
};

const tabs = [
  { label: 'Toate', value: undefined },
  { label: 'In asteptare', value: 'PENDING' },
  { label: 'Confirmate', value: 'CONFIRMED' },
  { label: 'In desfasurare', value: 'IN_PROGRESS' },
  { label: 'Finalizate', value: 'COMPLETED' },
  { label: 'Anulate', value: 'CANCELLED' },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function OrdersPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string | undefined>(undefined);

  const { data, loading } = useQuery(COMPANY_BOOKINGS, {
    variables: { status: activeTab, first: 20 },
  });

  const bookings = data?.companyBookings?.edges ?? [];
  const totalCount = data?.companyBookings?.totalCount ?? 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Comenzi</h1>
        <p className="text-gray-500 mt-1">
          Gestioneaza comenzile firmei tale.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map(({ label, value }) => (
          <button
            key={label}
            onClick={() => setActiveTab(value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === value
                ? 'bg-primary text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Results count */}
      {!loading && (
        <p className="text-sm text-gray-500 mb-4">{totalCount} comenzi gasite</p>
      )}

      {/* Loading */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <div className="animate-pulse flex justify-between items-center">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-32" />
                  <div className="h-3 bg-gray-200 rounded w-48" />
                </div>
                <div className="h-6 bg-gray-200 rounded w-20" />
              </div>
            </Card>
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <ClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">Nicio comanda</h3>
            <p className="text-gray-500">
              Nu exista comenzi pentru filtrul selectat.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking: Record<string, unknown>) => (
            <Card
              key={booking.id as string}
              className="hover:border-primary/30 transition-colors cursor-pointer"
              onClick={() => navigate(`/firma/comenzi/${booking.id}`)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="font-semibold text-gray-900">
                      #{booking.referenceCode as string}
                    </p>
                    <Badge variant={statusBadgeVariant[(booking.status as string) || 'PENDING']}>
                      {statusLabel[(booking.status as string) || 'PENDING'] || (booking.status as string)}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    {booking.serviceName as string} &middot;{' '}
                    {booking.scheduledDate as string} la {booking.scheduledStartTime as string}
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Client: {(booking.client as Record<string, unknown>)?.fullName as string}
                    {(booking.cleaner as Record<string, unknown>)?.fullName
                      ? ` | Cleaner: ${(booking.cleaner as Record<string, unknown>).fullName as string}`
                      : ' | Neasignat'}
                  </p>
                </div>
                <div className="flex items-center gap-4 ml-4">
                  <p className="text-lg font-bold text-gray-900 whitespace-nowrap">
                    {booking.estimatedTotal as string} RON
                  </p>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </Card>
          ))}

          {data?.companyBookings?.pageInfo?.hasNextPage && (
            <div className="text-center pt-4">
              <Button variant="outline" size="sm">
                Incarca mai multe
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
