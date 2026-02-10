import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { Building2, CheckCircle, XCircle, MapPin, Star } from 'lucide-react';
import { cn } from '@helpmeclean/shared';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import {
  PENDING_COMPANY_APPLICATIONS,
  COMPANIES,
  APPROVE_COMPANY,
  REJECT_COMPANY,
} from '@/graphql/operations';

type Tab = 'pending' | 'approved' | 'all';

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

interface CompanyEdge {
  id: string;
  companyName: string;
  cui: string;
  companyType: string;
  status: string;
  ratingAvg: number | null;
  totalJobsCompleted: number;
  contactEmail: string;
  contactPhone: string;
  city: string;
  county: string;
  createdAt: string;
}

interface PendingApp {
  id: string;
  companyName: string;
  cui: string;
  companyType: string;
  legalRepresentative: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  city: string;
  county: string;
  description: string;
  status: string;
  createdAt: string;
}

export default function CompaniesPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('pending');
  const [rejectModal, setRejectModal] = useState<{ open: boolean; companyId: string }>({
    open: false,
    companyId: '',
  });
  const [rejectReason, setRejectReason] = useState('');

  const { data: pendingData, loading: pendingLoading } = useQuery(PENDING_COMPANY_APPLICATIONS);
  const { data: approvedData, loading: approvedLoading } = useQuery(COMPANIES, {
    variables: { status: 'APPROVED', first: 50 },
  });
  const { data: allData, loading: allLoading } = useQuery(COMPANIES, {
    variables: { first: 50 },
  });

  const [approveCompany, { loading: approving }] = useMutation(APPROVE_COMPANY, {
    refetchQueries: [
      { query: PENDING_COMPANY_APPLICATIONS },
      { query: COMPANIES, variables: { status: 'APPROVED', first: 50 } },
      { query: COMPANIES, variables: { first: 50 } },
    ],
  });

  const [rejectCompany, { loading: rejecting }] = useMutation(REJECT_COMPANY, {
    refetchQueries: [
      { query: PENDING_COMPANY_APPLICATIONS },
      { query: COMPANIES, variables: { first: 50 } },
    ],
  });

  const handleApprove = async (id: string) => {
    await approveCompany({ variables: { id } });
  };

  const handleRejectSubmit = async () => {
    if (!rejectReason.trim()) return;
    await rejectCompany({
      variables: { id: rejectModal.companyId, reason: rejectReason.trim() },
    });
    setRejectModal({ open: false, companyId: '' });
    setRejectReason('');
  };

  const pendingApps: PendingApp[] = pendingData?.pendingCompanyApplications ?? [];
  const approvedCompanies: CompanyEdge[] = approvedData?.companies?.edges ?? [];
  const allCompanies: CompanyEdge[] = allData?.companies?.edges ?? [];

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: 'pending', label: 'In asteptare', count: pendingApps.length },
    { key: 'approved', label: 'Aprobate', count: approvedData?.companies?.totalCount },
    { key: 'all', label: 'Toate', count: allData?.companies?.totalCount },
  ];

  const loading = activeTab === 'pending' ? pendingLoading : activeTab === 'approved' ? approvedLoading : allLoading;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Companii</h1>
        <p className="text-gray-500 mt-1">Gestioneaza companiile de pe platforma.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer',
              activeTab === tab.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700',
            )}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-md">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <div className="animate-pulse flex items-center gap-4">
                <div className="h-12 w-12 bg-gray-200 rounded-xl" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-48 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-32" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pending Tab */}
      {!loading && activeTab === 'pending' && (
        <div className="space-y-4">
          {pendingApps.length === 0 ? (
            <Card>
              <p className="text-center text-gray-400 py-8">
                Nu exista aplicatii in asteptare.
              </p>
            </Card>
          ) : (
            pendingApps.map((app) => (
              <Card key={app.id}>
                <div className="flex items-start justify-between">
                  <div
                    className="flex items-start gap-4 cursor-pointer flex-1"
                    onClick={() => navigate(`/admin/companii/${app.id}`)}
                  >
                    <div className="p-3 rounded-xl bg-accent/10">
                      <Building2 className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{app.companyName}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">
                        CUI: {app.cui} &middot; {app.companyType}
                      </p>
                      <div className="flex items-center gap-1 text-sm text-gray-400 mt-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {app.city}, {app.county}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Reprezentant: {app.legalRepresentative}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Depusa pe {new Date(app.createdAt).toLocaleDateString('ro-RO')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleApprove(app.id)}
                      loading={approving}
                    >
                      <CheckCircle className="h-4 w-4" />
                      Aproba
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => setRejectModal({ open: true, companyId: app.id })}
                    >
                      <XCircle className="h-4 w-4" />
                      Respinge
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Approved Tab */}
      {!loading && activeTab === 'approved' && (
        <div className="space-y-4">
          {approvedCompanies.length === 0 ? (
            <Card>
              <p className="text-center text-gray-400 py-8">Nu exista companii aprobate.</p>
            </Card>
          ) : (
            approvedCompanies.map((company) => (
              <CompanyRow key={company.id} company={company} onClick={() => navigate(`/admin/companii/${company.id}`)} />
            ))
          )}
        </div>
      )}

      {/* All Tab */}
      {!loading && activeTab === 'all' && (
        <div className="space-y-4">
          {allCompanies.length === 0 ? (
            <Card>
              <p className="text-center text-gray-400 py-8">Nu exista companii.</p>
            </Card>
          ) : (
            allCompanies.map((company) => (
              <CompanyRow key={company.id} company={company} onClick={() => navigate(`/admin/companii/${company.id}`)} />
            ))
          )}
        </div>
      )}

      {/* Reject Modal */}
      <Modal
        open={rejectModal.open}
        onClose={() => {
          setRejectModal({ open: false, companyId: '' });
          setRejectReason('');
        }}
        title="Respinge aplicatia"
      >
        <div className="space-y-4">
          <Input
            label="Motivul respingerii"
            placeholder="Explica motivul respingerii..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
          <div className="flex justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => {
                setRejectModal({ open: false, companyId: '' });
                setRejectReason('');
              }}
            >
              Anuleaza
            </Button>
            <Button
              variant="danger"
              onClick={handleRejectSubmit}
              loading={rejecting}
              disabled={!rejectReason.trim()}
            >
              Respinge
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function CompanyRow({ company, onClick }: { company: CompanyEdge; onClick: () => void }) {
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{company.companyName}</h3>
            <p className="text-sm text-gray-500">
              CUI: {company.cui} &middot; {company.companyType}
            </p>
            <div className="flex items-center gap-1 text-sm text-gray-400 mt-0.5">
              <MapPin className="h-3.5 w-3.5" />
              {company.city}, {company.county}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {company.ratingAvg != null && (
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Star className="h-4 w-4 text-accent fill-accent" />
              {Number(company.ratingAvg).toFixed(1)}
            </div>
          )}
          <div className="text-sm text-gray-500">
            {company.totalJobsCompleted} lucrari
          </div>
          <Badge variant={statusVariant[company.status] ?? 'default'}>
            {statusLabel[company.status] ?? company.status}
          </Badge>
        </div>
      </div>
    </Card>
  );
}
