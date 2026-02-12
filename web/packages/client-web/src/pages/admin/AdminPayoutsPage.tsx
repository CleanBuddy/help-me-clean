import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import {
  Wallet,
  Plus,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import {
  ALL_PAYOUTS,
  CREATE_MONTHLY_PAYOUT,
} from '@/graphql/operations';

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatRON(amount: number): string {
  return (amount / 100).toFixed(2) + ' lei';
}

// ─── Types ──────────────────────────────────────────────────────────────────

interface Payout {
  id: string;
  amount: number;
  currency: string;
  periodFrom: string;
  periodTo: string;
  bookingCount: number;
  status: string;
  paidAt: string | null;
  createdAt: string;
  company: {
    id: string;
    companyName: string;
  } | null;
}

// ─── Status Maps ────────────────────────────────────────────────────────────

const payoutStatusVariant: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  PENDING: 'warning',
  PROCESSING: 'info',
  PAID: 'success',
  FAILED: 'danger',
};

const payoutStatusLabel: Record<string, string> = {
  PENDING: 'In asteptare',
  PROCESSING: 'Se proceseaza',
  PAID: 'Platit',
  FAILED: 'Esuat',
};

const statusOptions = [
  { value: '', label: 'Toate statusurile' },
  { value: 'PENDING', label: 'In asteptare' },
  { value: 'PROCESSING', label: 'Se proceseaza' },
  { value: 'PAID', label: 'Platit' },
  { value: 'FAILED', label: 'Esuat' },
];

// ─── Component ──────────────────────────────────────────────────────────────

export default function AdminPayoutsPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  // Modal form state
  const [companyId, setCompanyId] = useState('');
  const [periodFrom, setPeriodFrom] = useState('');
  const [periodTo, setPeriodTo] = useState('');

  const { data, loading, refetch } = useQuery(ALL_PAYOUTS, {
    variables: {
      status: statusFilter || undefined,
      first: 50,
    },
  });

  const [createPayout, { loading: creating }] = useMutation(CREATE_MONTHLY_PAYOUT, {
    onCompleted: () => {
      setModalOpen(false);
      setCompanyId('');
      setPeriodFrom('');
      setPeriodTo('');
      refetch();
    },
  });

  const payouts: Payout[] = data?.allPayouts ?? [];

  const handleCreate = () => {
    if (!companyId || !periodFrom || !periodTo) return;
    createPayout({
      variables: {
        companyId,
        periodFrom,
        periodTo,
      },
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Plati catre companii</h1>
            <p className="text-gray-500 mt-1">
              Gestioneaza platile lunare catre companiile partenere.
            </p>
          </div>
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Creeaza plata lunara
          </Button>
        </div>
      </div>

      {/* Status Filter */}
      <div className="mb-6 w-48">
        <Select
          options={statusOptions}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          placeholder="Filtreaza dupa status"
        />
      </div>

      {/* Payouts List */}
      <Card>
        <div className="flex items-center gap-3 mb-6">
          <Wallet className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-gray-900">Toate platile</h3>
          {payouts.length > 0 && (
            <Badge variant="info">{payouts.length}</Badge>
          )}
        </div>

        {loading ? (
          <LoadingSpinner text="Se incarca platile..." />
        ) : payouts.length === 0 ? (
          <p className="text-center text-gray-400 py-12">Nu exista plati.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-200">
                  <th className="pb-3 font-medium">Companie</th>
                  <th className="pb-3 font-medium">Perioada</th>
                  <th className="pb-3 font-medium text-right">Suma</th>
                  <th className="pb-3 font-medium text-center">Rezervari</th>
                  <th className="pb-3 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payouts.map((payout) => (
                  <tr key={payout.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 font-medium text-gray-900">
                      {payout.company?.companyName ?? '-'}
                    </td>
                    <td className="py-3 text-gray-600">
                      {new Date(payout.periodFrom).toLocaleDateString('ro-RO')} -{' '}
                      {new Date(payout.periodTo).toLocaleDateString('ro-RO')}
                    </td>
                    <td className="py-3 text-right font-semibold text-gray-900">
                      {formatRON(payout.amount)}
                    </td>
                    <td className="py-3 text-center text-gray-600">
                      {payout.bookingCount}
                    </td>
                    <td className="py-3 text-right">
                      <Badge variant={payoutStatusVariant[payout.status] ?? 'default'}>
                        {payoutStatusLabel[payout.status] ?? payout.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Create Payout Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Creeaza plata lunara"
      >
        <div className="space-y-4">
          <Input
            label="ID Companie"
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
            placeholder="ex. uuid-companie"
          />
          <Input
            label="Perioada de la"
            type="date"
            value={periodFrom}
            onChange={(e) => setPeriodFrom(e.target.value)}
          />
          <Input
            label="Perioada pana la"
            type="date"
            value={periodTo}
            onChange={(e) => setPeriodTo(e.target.value)}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Anuleaza
            </Button>
            <Button
              onClick={handleCreate}
              loading={creating}
              disabled={!companyId || !periodFrom || !periodTo}
            >
              Creeaza plata
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
