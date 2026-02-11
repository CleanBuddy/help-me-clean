import { useState, useCallback } from 'react';
import { useQuery, useMutation, useLazyQuery } from '@apollo/client';
import {
  Users, UserPlus, Mail, Phone, Star, Copy, Check,
  ChevronDown, ChevronUp, Briefcase, TrendingUp, Calendar, DollarSign,
} from 'lucide-react';
import { cn } from '@helpmeclean/shared';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import {
  MY_CLEANERS, INVITE_CLEANER, UPDATE_CLEANER_STATUS, CLEANER_PERFORMANCE,
} from '@/graphql/operations';

// ─── Types ──────────────────────────────────────────────────────────────────

type CleanerStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'INVITED' | 'PENDING';
type MutableStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

interface AvailabilitySlot {
  id: string; dayOfWeek: number; startTime: string; endTime: string; isAvailable: boolean;
}

interface Cleaner {
  id: string; userId: string; fullName: string; phone: string; email: string;
  avatarUrl: string | null; status: CleanerStatus; isCompanyAdmin: boolean;
  inviteToken: string | null; ratingAvg: number | null; totalJobsCompleted: number;
  availability: AvailabilitySlot[]; createdAt: string;
}

interface CleanerPerformance {
  cleanerId: string; fullName: string; ratingAvg: number;
  totalCompletedJobs: number; thisMonthCompleted: number;
  totalEarnings: number; thisMonthEarnings: number;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const statusBadgeVariant: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  ACTIVE: 'success', INVITED: 'info', PENDING: 'warning', SUSPENDED: 'danger', INACTIVE: 'default',
};
const statusLabel: Record<string, string> = {
  ACTIVE: 'Activ', INVITED: 'Invitat', PENDING: 'In asteptare', SUSPENDED: 'Suspendat', INACTIVE: 'Inactiv',
};
const dayNames: Record<number, string> = {
  0: 'Duminica', 1: 'Luni', 2: 'Marti', 3: 'Miercuri', 4: 'Joi', 5: 'Vineri', 6: 'Sambata',
};
const fmtCurrency = (n: number) => `${n.toFixed(0)} RON`;

// ─── StatusButtons ──────────────────────────────────────────────────────────

const STATUS_CFG: Array<{ value: MutableStatus; label: string; idle: string; active: string }> = [
  { value: 'ACTIVE', label: 'Activ', idle: 'text-emerald-600 border-gray-200 hover:bg-emerald-50', active: 'bg-emerald-500 text-white border-emerald-500' },
  { value: 'INACTIVE', label: 'Inactiv', idle: 'text-gray-600 border-gray-200 hover:bg-gray-50', active: 'bg-gray-500 text-white border-gray-500' },
  { value: 'SUSPENDED', label: 'Suspendat', idle: 'text-red-600 border-gray-200 hover:bg-red-50', active: 'bg-red-500 text-white border-red-500' },
];

function StatusButtons({ current, onChange }: { current: CleanerStatus; onChange: (s: MutableStatus) => void }) {
  return (
    <div className="flex gap-1.5">
      {STATUS_CFG.map((s) => (
        <button key={s.value} type="button"
          onClick={() => { if (s.value !== current) onChange(s.value); }}
          className={cn('flex-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer',
            current === s.value ? s.active : s.idle)}>
          {s.label}
        </button>
      ))}
    </div>
  );
}

// ─── PerformancePanel ───────────────────────────────────────────────────────

function PerformancePanel({ cleanerId, availability }: { cleanerId: string; availability: AvailabilitySlot[] }) {
  const [fetchPerf, { data, loading }] = useLazyQuery<{ cleanerPerformance: CleanerPerformance }>(
    CLEANER_PERFORMANCE, { variables: { cleanerId } },
  );
  const [fetched, setFetched] = useState(false);
  if (!fetched) { setFetched(true); fetchPerf(); }

  const perf = data?.cleanerPerformance;
  const slots = availability.filter((s) => s.isAvailable).sort((a, b) => a.dayOfWeek - b.dayOfWeek);

  const stats = perf ? [
    { bg: 'bg-blue-50', icon: Briefcase, iconCls: 'text-blue-600', label: 'Total joburi', value: perf.totalCompletedJobs, valCls: 'text-blue-900' },
    { bg: 'bg-emerald-50', icon: Calendar, iconCls: 'text-emerald-600', label: 'Luna aceasta', value: perf.thisMonthCompleted, valCls: 'text-emerald-900' },
    { bg: 'bg-amber-50', icon: DollarSign, iconCls: 'text-amber-600', label: 'Castiguri totale', value: fmtCurrency(perf.totalEarnings), valCls: 'text-amber-900' },
    { bg: 'bg-purple-50', icon: TrendingUp, iconCls: 'text-purple-600', label: 'Castiguri luna', value: fmtCurrency(perf.thisMonthEarnings), valCls: 'text-purple-900' },
  ] : [];

  return (
    <div className="pt-4 mt-4 border-t border-gray-100 space-y-4">
      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-50 rounded-xl p-3">
              <div className="h-3 bg-gray-200 rounded w-16 mb-2" />
              <div className="h-5 bg-gray-200 rounded w-10" />
            </div>
          ))}
        </div>
      ) : stats.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {stats.map((s) => (
            <div key={s.label} className={cn(s.bg, 'rounded-xl p-3')}>
              <div className="flex items-center gap-1.5 mb-1">
                <s.icon className={cn('h-3.5 w-3.5', s.iconCls)} />
                <span className={cn('text-xs font-medium', s.iconCls)}>{s.label}</span>
              </div>
              <p className={cn('text-lg font-bold', s.valCls)}>{s.value}</p>
            </div>
          ))}
        </div>
      ) : null}
      {slots.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-500 mb-2">Program disponibilitate</p>
          <div className="space-y-1">
            {slots.map((slot) => (
              <div key={slot.id} className="flex items-center justify-between text-xs">
                <span className="text-gray-700 font-medium">{dayNames[slot.dayOfWeek] ?? `Ziua ${slot.dayOfWeek}`}</span>
                <span className="text-gray-500">{slot.startTime} - {slot.endTime}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function TeamPage() {
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [inviteToken, setInviteToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [copiedId, setCopiedId] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusModal, setStatusModal] = useState<{ cleaner: Cleaner; newStatus: MutableStatus } | null>(null);
  const [deactivateModal, setDeactivateModal] = useState<Cleaner | null>(null);

  const { data, loading, refetch } = useQuery(MY_CLEANERS);
  const [inviteCleaner, { loading: inviting }] = useMutation(INVITE_CLEANER);
  const [updateStatus, { loading: updatingStatus }] = useMutation(UPDATE_CLEANER_STATUS);
  const cleaners: Cleaner[] = data?.myCleaners ?? [];

  const handleCopyToken = useCallback(async (token: string, id?: string) => {
    await navigator.clipboard.writeText(token);
    setCopiedId(id || '__modal__');
    setTimeout(() => setCopiedId(''), 2000);
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError('');
    if (!inviteEmail.trim() || !inviteName.trim()) {
      setInviteError('Te rugam sa completezi toate campurile.');
      return;
    }
    try {
      const { data: res } = await inviteCleaner({
        variables: { input: { email: inviteEmail.trim(), fullName: inviteName.trim() } },
      });
      const token = res?.inviteCleaner?.inviteToken;
      setShowInvite(false); setInviteEmail(''); setInviteName('');
      refetch();
      if (token) { setInviteToken(token); setShowToken(true); }
    } catch (error: unknown) {
      const gqlErr = (error as { graphQLErrors?: Array<{ message: string }> }).graphQLErrors?.[0];
      setInviteError(gqlErr?.message || 'Invitatia nu a putut fi trimisa. Te rugam sa incerci din nou.');
    }
  };

  const handleStatusChange = async () => {
    if (!statusModal) return;
    try {
      await updateStatus({ variables: { id: statusModal.cleaner.id, status: statusModal.newStatus } });
      setStatusModal(null); refetch();
    } catch { /* handled by Apollo */ }
  };

  const handleDeactivate = async () => {
    if (!deactivateModal) return;
    try {
      await updateStatus({ variables: { id: deactivateModal.id, status: 'INACTIVE' } });
      setDeactivateModal(null); refetch();
    } catch { /* handled by Apollo */ }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Echipa mea</h1>
          <p className="text-gray-500 mt-1">Gestioneaza cleanerii firmei tale.</p>
        </div>
        <Button onClick={() => setShowInvite(true)}>
          <UserPlus className="h-4 w-4" />
          Invita cleaner
        </Button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <div className="animate-pulse">
                <div className="h-12 w-12 bg-gray-200 rounded-full mb-4" />
                <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-48" />
              </div>
            </Card>
          ))}
        </div>
      ) : cleaners.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">Niciun cleaner</h3>
            <p className="text-gray-500 mb-4">Nu ai adaugat inca niciun cleaner in echipa ta.</p>
            <Button onClick={() => setShowInvite(true)}>
              <UserPlus className="h-4 w-4" /> Invita primul cleaner
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cleaners.map((c) => {
            const expanded = expandedId === c.id;
            const canChange = c.status === 'ACTIVE' || c.status === 'INACTIVE' || c.status === 'SUSPENDED';
            return (
              <Card key={c.id}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-lg font-semibold text-primary">
                        {c.fullName?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{c.fullName}</p>
                      <Badge variant={statusBadgeVariant[c.status || 'PENDING']}>
                        {statusLabel[c.status || 'PENDING'] || c.status}
                      </Badge>
                    </div>
                  </div>
                  {c.isCompanyAdmin && <Badge variant="info">Admin</Badge>}
                </div>

                <div className="space-y-2 text-sm">
                  {c.email && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="h-4 w-4 text-gray-400" />{c.email}
                    </div>
                  )}
                  {c.phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="h-4 w-4 text-gray-400" />{c.phone}
                    </div>
                  )}
                  {c.status === 'INVITED' && c.inviteToken && (
                    <div className="pt-2">
                      <p className="text-xs text-gray-400 mb-1">Cod invitatie</p>
                      <div className="flex items-center gap-1.5">
                        <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 font-mono text-xs text-gray-700 truncate select-all">
                          {c.inviteToken}
                        </div>
                        <button type="button" onClick={() => handleCopyToken(c.inviteToken!, c.id)}
                          className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer shrink-0"
                          title="Copiaza codul">
                          {copiedId === c.id
                            ? <Check className="h-3.5 w-3.5 text-secondary" />
                            : <Copy className="h-3.5 w-3.5 text-gray-400" />}
                        </button>
                      </div>
                      {copiedId === c.id && <p className="text-xs text-secondary mt-1">Copiat!</p>}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1 text-gray-500">
                      <Star className="h-4 w-4 text-accent" />
                      {c.ratingAvg ? Number(c.ratingAvg).toFixed(1) : '--'}
                    </div>
                    <span className="text-gray-500">{c.totalJobsCompleted ?? 0} joburi</span>
                  </div>

                  {canChange && (
                    <div className="pt-3">
                      <p className="text-xs text-gray-400 mb-1.5">Schimba status</p>
                      <StatusButtons current={c.status} onChange={(ns) => setStatusModal({ cleaner: c, newStatus: ns })} />
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-3">
                    <button type="button" onClick={() => setExpandedId(expanded ? null : c.id)}
                      className="flex items-center gap-1 text-xs font-medium text-primary hover:text-blue-700 transition-colors cursor-pointer">
                      {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      Detalii
                    </button>
                    {c.status === 'ACTIVE' && (
                      <button type="button" onClick={() => setDeactivateModal(c)}
                        className="ml-auto text-xs font-medium text-red-500 hover:text-red-700 transition-colors cursor-pointer">
                        Dezactiveaza
                      </button>
                    )}
                  </div>

                  {expanded && <PerformancePanel cleanerId={c.id} availability={c.availability ?? []} />}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Status Change Modal */}
      <Modal open={statusModal !== null} onClose={() => setStatusModal(null)} title="Schimba status">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Esti sigur ca vrei sa schimbi statusul lui{' '}
            <span className="font-semibold text-gray-900">{statusModal?.cleaner.fullName}</span> in{' '}
            <span className="font-semibold text-gray-900">{statusModal ? statusLabel[statusModal.newStatus] : ''}</span>?
          </p>
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" onClick={() => setStatusModal(null)} className="flex-1">Anuleaza</Button>
            <Button onClick={handleStatusChange} loading={updatingStatus} className="flex-1">Confirma</Button>
          </div>
        </div>
      </Modal>

      {/* Deactivate Modal */}
      <Modal open={deactivateModal !== null} onClose={() => setDeactivateModal(null)} title="Dezactiveaza cleaner">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Esti sigur ca vrei sa dezactivezi pe{' '}
            <span className="font-semibold text-gray-900">{deactivateModal?.fullName}</span>?
            Acesta nu va mai putea primi joburi noi.
          </p>
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" onClick={() => setDeactivateModal(null)} className="flex-1">Anuleaza</Button>
            <Button variant="danger" onClick={handleDeactivate} loading={updatingStatus} className="flex-1">Dezactiveaza</Button>
          </div>
        </div>
      </Modal>

      {/* Invite Modal */}
      <Modal open={showInvite} onClose={() => setShowInvite(false)} title="Invita cleaner">
        <form onSubmit={handleInvite} className="space-y-4">
          <Input label="Nume complet" placeholder="Ion Popescu" value={inviteName}
            onChange={(e) => setInviteName(e.target.value)} />
          <Input label="Adresa de email" type="email" placeholder="ion@email.com" value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)} error={inviteError} />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setShowInvite(false)} className="flex-1">Anuleaza</Button>
            <Button type="submit" loading={inviting} className="flex-1">Trimite invitatie</Button>
          </div>
        </form>
      </Modal>

      {/* Invite Token Modal */}
      <Modal open={showToken} onClose={() => setShowToken(false)} title="Invitatie trimisa cu succes!">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Trimite acest cod de invitatie cleanerului. El trebuie sa il introduca in panoul sau
            pentru a se alatura echipei tale.
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-mono text-sm text-gray-800 break-all select-all">
              {inviteToken}
            </div>
            <button type="button" onClick={() => handleCopyToken(inviteToken)}
              className="p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer shrink-0"
              title="Copiaza codul">
              {copiedId === '__modal__'
                ? <Check className="h-5 w-5 text-secondary" />
                : <Copy className="h-5 w-5 text-gray-500" />}
            </button>
          </div>
          {copiedId === '__modal__' && <p className="text-xs text-secondary">Codul a fost copiat!</p>}
          <Button onClick={() => setShowToken(false)} className="w-full">Am inteles</Button>
        </div>
      </Modal>
    </div>
  );
}
