import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import {
  Banknote,
  TrendingUp,
  ArrowDownRight,
  Clock,
  RotateCcw,
  CreditCard,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import {
  PLATFORM_REVENUE_REPORT,
  ALL_PAYMENT_TRANSACTIONS,
} from '@/graphql/operations';

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatRON(amount: number): string {
  return (amount / 100).toFixed(2) + ' lei';
}

function getMonthRange(): { from: string; to: string } {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split('T')[0];
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString()
    .split('T')[0];
  return { from, to };
}

// ─── Types ──────────────────────────────────────────────────────────────────

interface PaymentTransaction {
  id: string;
  bookingId: string;
  stripePaymentIntentId: string;
  amountTotal: number;
  amountCompany: number;
  amountPlatformFee: number;
  currency: string;
  status: string;
  failureReason: string | null;
  refundAmount: number;
  createdAt: string;
  booking: {
    id: string;
    referenceCode: string;
    serviceName: string;
    company: {
      id: string;
      companyName: string;
    } | null;
  } | null;
}

interface RevenueReport {
  totalRevenue: number;
  totalCommission: number;
  totalPayouts: number;
  pendingPayouts: number;
  totalRefunds: number;
  netRevenue: number;
  bookingCount: number;
}

// ─── Status Maps ────────────────────────────────────────────────────────────

const paymentStatusVariant: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  PENDING: 'warning',
  PROCESSING: 'info',
  SUCCEEDED: 'success',
  FAILED: 'danger',
  REFUNDED: 'default',
  PARTIALLY_REFUNDED: 'warning',
};

const paymentStatusLabel: Record<string, string> = {
  PENDING: 'In asteptare',
  PROCESSING: 'Se proceseaza',
  SUCCEEDED: 'Reusita',
  FAILED: 'Esuata',
  REFUNDED: 'Rambursata',
  PARTIALLY_REFUNDED: 'Rambursata partial',
};

const statusOptions = [
  { value: '', label: 'Toate statusurile' },
  { value: 'PENDING', label: 'In asteptare' },
  { value: 'PROCESSING', label: 'Se proceseaza' },
  { value: 'SUCCEEDED', label: 'Reusita' },
  { value: 'FAILED', label: 'Esuata' },
  { value: 'REFUNDED', label: 'Rambursata' },
];

// ─── Stat Card ──────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
}) {
  const colorMap: Record<string, { bg: string; text: string }> = {
    primary: { bg: 'bg-primary/10', text: 'text-primary' },
    secondary: { bg: 'bg-secondary/10', text: 'text-secondary' },
    accent: { bg: 'bg-accent/10', text: 'text-accent' },
    danger: { bg: 'bg-danger/10', text: 'text-danger' },
  };
  const colors = colorMap[color] ?? colorMap.primary;

  return (
    <Card>
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${colors.bg}`}>
          <Icon className={`h-6 w-6 ${colors.text}`} />
        </div>
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </Card>
  );
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function PaymentsPage() {
  const navigate = useNavigate();
  const defaults = getMonthRange();
  const [dateFrom, setDateFrom] = useState(defaults.from);
  const [dateTo, setDateTo] = useState(defaults.to);
  const [statusFilter, setStatusFilter] = useState('');

  // Revenue report
  const { data: revenueData, loading: revenueLoading } = useQuery(PLATFORM_REVENUE_REPORT, {
    variables: { from: dateFrom, to: dateTo },
  });

  // Payment transactions
  const { data: txData, loading: txLoading } = useQuery(ALL_PAYMENT_TRANSACTIONS, {
    variables: {
      status: statusFilter || undefined,
      first: 50,
    },
  });

  const report: RevenueReport | null = revenueData?.platformRevenueReport ?? null;
  const transactions: PaymentTransaction[] = txData?.allPaymentTransactions ?? [];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Plati si Venituri</h1>
        <p className="text-gray-500 mt-1">
          Raport financiar si tranzactii pe platforma.
        </p>
      </div>

      {/* Date Range Picker */}
      <div className="flex items-end gap-4 mb-6">
        <Input
          label="De la"
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
        />
        <Input
          label="Pana la"
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
        />
      </div>

      {/* Revenue Summary Cards */}
      {revenueLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-24 mb-3" />
                <div className="h-8 bg-gray-200 rounded w-16" />
              </div>
            </Card>
          ))}
        </div>
      ) : report ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatCard
            icon={Banknote}
            label="Venit Total"
            value={formatRON(report.totalRevenue)}
            color="primary"
          />
          <StatCard
            icon={TrendingUp}
            label="Comision Platforma"
            value={formatRON(report.totalCommission)}
            color="secondary"
          />
          <StatCard
            icon={ArrowDownRight}
            label="Plati catre companii"
            value={formatRON(report.totalPayouts)}
            color="accent"
          />
          <StatCard
            icon={Clock}
            label="In asteptare"
            value={formatRON(report.pendingPayouts)}
            color="accent"
          />
          <StatCard
            icon={RotateCcw}
            label="Rambursari"
            value={formatRON(report.totalRefunds)}
            color="danger"
          />
        </div>
      ) : null}

      {/* Transactions Section */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-gray-900">Tranzactii</h3>
          </div>
          <div className="w-48">
            <Select
              options={statusOptions}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              placeholder="Filtreaza"
            />
          </div>
        </div>

        {txLoading ? (
          <LoadingSpinner text="Se incarca tranzactiile..." />
        ) : transactions.length === 0 ? (
          <p className="text-center text-gray-400 py-12">Nu exista tranzactii.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-200">
                  <th className="pb-3 font-medium">Data</th>
                  <th className="pb-3 font-medium">Cod Rezervare</th>
                  <th className="pb-3 font-medium">Companie</th>
                  <th className="pb-3 font-medium text-right">Suma</th>
                  <th className="pb-3 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => {
                      if (tx.booking?.id) {
                        navigate(`/admin/comenzi/${tx.booking.id}`);
                      }
                    }}
                  >
                    <td className="py-3 text-gray-600">
                      {new Date(tx.createdAt).toLocaleDateString('ro-RO')}
                    </td>
                    <td className="py-3 font-medium text-gray-900">
                      {tx.booking?.referenceCode ?? '-'}
                    </td>
                    <td className="py-3 text-gray-600">
                      {tx.booking?.company?.companyName ?? '-'}
                    </td>
                    <td className="py-3 text-right font-semibold text-gray-900">
                      {formatRON(tx.amountTotal)}
                    </td>
                    <td className="py-3 text-right">
                      <Badge variant={paymentStatusVariant[tx.status] ?? 'default'}>
                        {paymentStatusLabel[tx.status] ?? tx.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
