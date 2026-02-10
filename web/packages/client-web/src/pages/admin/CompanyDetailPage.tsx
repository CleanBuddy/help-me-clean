import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  MapPin,
  Star,
  ClipboardList,
  Calendar,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import {
  COMPANY,
  APPROVE_COMPANY,
  REJECT_COMPANY,
  SUSPEND_COMPANY,
  PENDING_COMPANY_APPLICATIONS,
  COMPANIES,
} from '@/graphql/operations';

const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  PENDING_APPROVAL: 'warning',
  APPROVED: 'success',
  SUSPENDED: 'danger',
  REJECTED: 'danger',
};

const statusLabel: Record<string, string> = {
  PENDING_APPROVAL: 'In asteptare',
  APPROVED: 'Aprobat',
  SUSPENDED: 'Suspendat',
  REJECTED: 'Respins',
};

export default function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [rejectModal, setRejectModal] = useState(false);
  const [suspendModal, setSuspendModal] = useState(false);
  const [reason, setReason] = useState('');

  const { data, loading } = useQuery(COMPANY, { variables: { id } });

  const refetchQueries = [
    { query: COMPANY, variables: { id } },
    { query: PENDING_COMPANY_APPLICATIONS },
    { query: COMPANIES, variables: { first: 50 } },
  ];

  const [approveCompany, { loading: approving }] = useMutation(APPROVE_COMPANY, { refetchQueries });
  const [rejectCompany, { loading: rejecting }] = useMutation(REJECT_COMPANY, { refetchQueries });
  const [suspendCompany, { loading: suspending }] = useMutation(SUSPEND_COMPANY, { refetchQueries });

  const company = data?.company;

  if (loading) {
    return (
      <div>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="h-64 bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400">Compania nu a fost gasita.</p>
        <Button variant="ghost" className="mt-4" onClick={() => navigate('/admin/companii')}>
          Inapoi la companii
        </Button>
      </div>
    );
  }

  const handleApprove = async () => {
    await approveCompany({ variables: { id } });
  };

  const handleReject = async () => {
    if (!reason.trim()) return;
    await rejectCompany({ variables: { id, reason: reason.trim() } });
    setRejectModal(false);
    setReason('');
  };

  const handleSuspend = async () => {
    if (!reason.trim()) return;
    await suspendCompany({ variables: { id, reason: reason.trim() } });
    setSuspendModal(false);
    setReason('');
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/admin/companii')}
          className="p-2 rounded-xl hover:bg-gray-100 transition cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{company.companyName}</h1>
            <Badge variant={statusVariant[company.status] ?? 'default'}>
              {statusLabel[company.status] ?? company.status}
            </Badge>
          </div>
          <p className="text-gray-500 mt-0.5">CUI: {company.cui}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Company Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informatii companie</h3>
            <div className="grid grid-cols-2 gap-4">
              <InfoItem icon={Building2} label="Tip companie" value={company.companyType} />
              <InfoItem icon={Building2} label="Reprezentant legal" value={company.legalRepresentative} />
              <InfoItem icon={Mail} label="Email contact" value={company.contactEmail} />
              <InfoItem icon={Phone} label="Telefon" value={company.contactPhone} />
              <InfoItem icon={MapPin} label="Adresa" value={company.address} />
              <InfoItem icon={MapPin} label="Localitate" value={`${company.city}, ${company.county}`} />
            </div>
            {company.description && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-1">Descriere</p>
                <p className="text-sm text-gray-600">{company.description}</p>
              </div>
            )}
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10">
                  <Star className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Rating</p>
                  <p className="text-xl font-bold text-gray-900">
                    {company.ratingAvg ? Number(company.ratingAvg).toFixed(1) : '--'}
                  </p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-secondary/10">
                  <ClipboardList className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Lucrari</p>
                  <p className="text-xl font-bold text-gray-900">{company.totalJobsCompleted}</p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-accent/10">
                  <MapPin className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Raza</p>
                  <p className="text-xl font-bold text-gray-900">{company.maxServiceRadiusKm ?? '--'} km</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Actions Sidebar */}
        <div className="space-y-6">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actiuni</h3>
            <div className="space-y-3">
              {company.status === 'PENDING_APPROVAL' && (
                <>
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={handleApprove}
                    loading={approving}
                  >
                    Aproba compania
                  </Button>
                  <Button
                    variant="danger"
                    className="w-full"
                    onClick={() => setRejectModal(true)}
                  >
                    Respinge compania
                  </Button>
                </>
              )}
              {company.status === 'APPROVED' && (
                <Button
                  variant="danger"
                  className="w-full"
                  onClick={() => setSuspendModal(true)}
                >
                  Suspenda compania
                </Button>
              )}
              {company.status === 'SUSPENDED' && (
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={handleApprove}
                  loading={approving}
                >
                  Reactiveaza compania
                </Button>
              )}
              {company.status === 'REJECTED' && (
                <p className="text-sm text-gray-500">
                  Compania a fost respinsa.
                  {company.rejectionReason && (
                    <span className="block mt-1 text-danger">
                      Motiv: {company.rejectionReason}
                    </span>
                  )}
                </p>
              )}
            </div>
          </Card>

          <Card>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Inregistrata pe</h3>
            <div className="flex items-center gap-2 text-gray-900">
              <Calendar className="h-4 w-4 text-gray-400" />
              {new Date(company.createdAt).toLocaleDateString('ro-RO', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* Reject Modal */}
      <Modal
        open={rejectModal}
        onClose={() => { setRejectModal(false); setReason(''); }}
        title="Respinge compania"
      >
        <div className="space-y-4">
          <Input
            label="Motivul respingerii"
            placeholder="Explica motivul respingerii..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => { setRejectModal(false); setReason(''); }}>
              Anuleaza
            </Button>
            <Button variant="danger" onClick={handleReject} loading={rejecting} disabled={!reason.trim()}>
              Respinge
            </Button>
          </div>
        </div>
      </Modal>

      {/* Suspend Modal */}
      <Modal
        open={suspendModal}
        onClose={() => { setSuspendModal(false); setReason(''); }}
        title="Suspenda compania"
      >
        <div className="space-y-4">
          <Input
            label="Motivul suspendarii"
            placeholder="Explica motivul suspendarii..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => { setSuspendModal(false); setReason(''); }}>
              Anuleaza
            </Button>
            <Button variant="danger" onClick={handleSuspend} loading={suspending} disabled={!reason.trim()}>
              Suspenda
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm text-gray-900">{value || '--'}</p>
      </div>
    </div>
  );
}
