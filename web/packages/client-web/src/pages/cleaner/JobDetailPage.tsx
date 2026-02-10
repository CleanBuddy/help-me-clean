import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { ArrowLeft } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import {
  CLIENT_BOOKING_DETAIL,
  CONFIRM_BOOKING,
  START_JOB,
  COMPLETE_JOB,
  TODAYS_JOBS,
  MY_ASSIGNED_JOBS,
} from '@/graphql/operations';
import { useState } from 'react';

const STATUS_BADGE: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'danger' | 'info' }> = {
  PENDING: { label: 'In asteptare', variant: 'default' },
  ASSIGNED: { label: 'Asignata', variant: 'info' },
  CONFIRMED: { label: 'Confirmata', variant: 'warning' },
  IN_PROGRESS: { label: 'In lucru', variant: 'success' },
  COMPLETED: { label: 'Finalizata', variant: 'success' },
  CANCELLED_BY_CLIENT: { label: 'Anulata', variant: 'danger' },
  CANCELLED_BY_COMPANY: { label: 'Anulata', variant: 'danger' },
  CANCELLED_BY_ADMIN: { label: 'Anulata', variant: 'danger' },
};

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const { data, loading } = useQuery(CLIENT_BOOKING_DETAIL, {
    variables: { id },
    skip: !id,
  });
  const booking = data?.booking;

  const refetchQueries = [
    { query: TODAYS_JOBS },
    { query: MY_ASSIGNED_JOBS },
    { query: CLIENT_BOOKING_DETAIL, variables: { id } },
  ];

  const [confirmBooking, { loading: confirming }] = useMutation(CONFIRM_BOOKING, { refetchQueries });
  const [startJob, { loading: starting }] = useMutation(START_JOB, { refetchQueries });
  const [completeJob, { loading: completing }] = useMutation(COMPLETE_JOB, { refetchQueries });

  const actionLoading = confirming || starting || completing;

  const handleAction = async (action: 'confirm' | 'start' | 'complete') => {
    setError('');
    try {
      if (action === 'confirm') await confirmBooking({ variables: { id } });
      if (action === 'start') await startJob({ variables: { id } });
      if (action === 'complete') await completeJob({ variables: { id } });
    } catch {
      setError('Nu s-a putut actualiza statusul. Te rugam sa incerci din nou.');
    }
  };

  if (loading || !booking) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const badge = STATUS_BADGE[booking.status] ?? { label: booking.status, variant: 'default' as const };

  return (
    <div className="max-w-2xl">
      {/* Back link */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6 cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        Inapoi
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{booking.serviceName}</h1>
          <p className="text-sm text-gray-400 mt-1">Ref: {booking.referenceCode}</p>
        </div>
        <Badge variant={badge.variant}>{badge.label}</Badge>
      </div>

      {/* Schedule */}
      <Card className="mb-4">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Programare</h2>
        <div className="space-y-1 text-sm text-gray-600">
          <p>Data: {new Date(booking.scheduledDate).toLocaleDateString('ro-RO')}</p>
          <p>Ora: {booking.scheduledStartTime}</p>
          <p>Durata: {booking.estimatedDurationHours}h</p>
        </div>
      </Card>

      {/* Address */}
      {booking.address && (
        <Card className="mb-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Adresa</h2>
          <div className="space-y-1 text-sm text-gray-600">
            <p>{booking.address.streetAddress}</p>
            <p>{booking.address.city}{booking.address.county ? `, ${booking.address.county}` : ''}</p>
            {booking.address.floor && <p className="text-gray-400">Etaj: {booking.address.floor}</p>}
            {booking.address.apartment && <p className="text-gray-400">Ap: {booking.address.apartment}</p>}
          </div>
        </Card>
      )}

      {/* Client */}
      <Card className="mb-4">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Client</h2>
        <div className="space-y-1 text-sm text-gray-600">
          <p>{booking.client?.fullName ?? '--'}</p>
          {booking.client?.phone && <p className="text-gray-400">{booking.client.phone}</p>}
        </div>
      </Card>

      {/* Property */}
      {(booking.propertyType || booking.numRooms || booking.areaSqm) && (
        <Card className="mb-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Proprietate</h2>
          <div className="space-y-1 text-sm text-gray-600">
            {booking.propertyType && <p>Tip: {booking.propertyType}</p>}
            {booking.numRooms && <p>Camere: {booking.numRooms}</p>}
            {booking.numBathrooms && <p>Bai: {booking.numBathrooms}</p>}
            {booking.areaSqm && <p>Suprafata: {booking.areaSqm} mp</p>}
            {booking.hasPets && <p className="text-accent">Are animale de companie</p>}
          </div>
        </Card>
      )}

      {/* Special Instructions */}
      {booking.specialInstructions && (
        <Card className="mb-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Instructiuni speciale</h2>
          <p className="text-sm text-gray-600">{booking.specialInstructions}</p>
        </Card>
      )}

      {/* Error */}
      {error && (
        <div className="p-3 rounded-xl bg-red-50 text-sm text-red-700 text-center mb-4">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="mt-6 space-y-3">
        {booking.status === 'ASSIGNED' && (
          <Button
            onClick={() => handleAction('confirm')}
            loading={confirming}
            disabled={actionLoading}
            className="w-full"
          >
            Confirma comanda
          </Button>
        )}
        {booking.status === 'CONFIRMED' && (
          <Button
            onClick={() => handleAction('start')}
            loading={starting}
            disabled={actionLoading}
            variant="secondary"
            className="w-full"
          >
            Incepe curatenia
          </Button>
        )}
        {booking.status === 'IN_PROGRESS' && (
          <Button
            onClick={() => handleAction('complete')}
            loading={completing}
            disabled={actionLoading}
            variant="secondary"
            className="w-full"
          >
            Finalizeaza curatenia
          </Button>
        )}
      </div>
    </div>
  );
}
