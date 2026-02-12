import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useLazyQuery } from '@apollo/client';
import {
  Users, UserPlus, Mail, Phone, Star, Copy, Check,
  ChevronDown, ChevronUp, Briefcase, TrendingUp, Calendar, DollarSign,
  MapPin, CheckCircle,
} from 'lucide-react';
import { cn } from '@helpmeclean/shared';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import {
  MY_CLEANERS, INVITE_CLEANER, UPDATE_CLEANER_STATUS, CLEANER_PERFORMANCE,
  MY_COMPANY_SERVICE_AREAS, CLEANER_SERVICE_AREAS, UPDATE_CLEANER_SERVICE_AREAS,
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

interface CityArea {
  id: string;
  name: string;
  cityId: string;
  cityName: string;
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

// ─── AreaManagementModal ────────────────────────────────────────────────────

function AreaManagementModal({
  cleaner,
  open,
  onClose,
}: {
  cleaner: Cleaner | null;
  open: boolean;
  onClose: () => void;
}) {
  const [selectedAreaIds, setSelectedAreaIds] = useState<Set<string>>(new Set());
  const [saveSuccess, setSaveSuccess] = useState(false);

  const { data: companyAreasData, loading: loadingCompanyAreas } = useQuery<{
    myCompanyServiceAreas: CityArea[];
  }>(MY_COMPANY_SERVICE_AREAS, { skip: !open });

  const [fetchCleanerAreas, { loading: loadingCleanerAreas }] = useLazyQuery<{
    cleanerServiceAreas: CityArea[];
  }>(CLEANER_SERVICE_AREAS);

  const [updateCleanerAreas, { loading: saving }] = useMutation(UPDATE_CLEANER_SERVICE_AREAS);

  const companyAreas: CityArea[] = companyAreasData?.myCompanyServiceAreas ?? [];

  // Group areas by city for display
  const areasByCity = companyAreas.reduce<Record<string, { cityName: string; areas: CityArea[] }>>((acc, area) => {
    if (!acc[area.cityId]) {
      acc[area.cityId] = { cityName: area.cityName, areas: [] };
    }
    acc[area.cityId].areas.push(area);
    return acc;
  }, {});

  // Load cleaner areas when the modal opens with a specific cleaner
  useEffect(() => {
    if (open && cleaner) {
      setSaveSuccess(false);
      fetchCleanerAreas({ variables: { cleanerId: cleaner.id } }).then((res) => {
        const areas = res.data?.cleanerServiceAreas ?? [];
        if (areas.length > 0) {
          setSelectedAreaIds(new Set(areas.map((a) => a.id)));
        } else {
          // Default: all company areas selected for new cleaners
          setSelectedAreaIds(new Set(companyAreas.map((a) => a.id)));
        }
      });
    }
  }, [open, cleaner, fetchCleanerAreas, companyAreas]);

  const toggleArea = (areaId: string) => {
    setSelectedAreaIds((prev) => {
      const next = new Set(prev);
      if (next.has(areaId)) {
        next.delete(areaId);
      } else {
        next.add(areaId);
      }
      return next;
    });
    setSaveSuccess(false);
  };

  const toggleAllForCity = (cityId: string) => {
    const cityAreas = areasByCity[cityId]?.areas ?? [];
    const allSelected = cityAreas.every((a) => selectedAreaIds.has(a.id));
    setSelectedAreaIds((prev) => {
      const next = new Set(prev);
      for (const area of cityAreas) {
        if (allSelected) {
          next.delete(area.id);
        } else {
          next.add(area.id);
        }
      }
      return next;
    });
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    if (!cleaner) return;
    try {
      await updateCleanerAreas({
        variables: {
          cleanerId: cleaner.id,
          areaIds: Array.from(selectedAreaIds),
        },
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      /* Apollo error handling */
    }
  };

  const isLoading = loadingCompanyAreas || loadingCleanerAreas;

  return (
    <Modal open={open} onClose={onClose} title="Zone de lucru" className="max-w-xl">
      <div className="space-y-5">
        {/* Worker info header */}
        {cleaner && (
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-base font-semibold text-primary">
                {cleaner.fullName?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 truncate">{cleaner.fullName}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant={statusBadgeVariant[cleaner.status || 'PENDING']}>
                  {statusLabel[cleaner.status || 'PENDING'] || cleaner.status}
                </Badge>
                {cleaner.ratingAvg && (
                  <span className="flex items-center gap-0.5 text-xs text-gray-500">
                    <Star className="h-3 w-3 text-accent" />
                    {Number(cleaner.ratingAvg).toFixed(1)}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Area selection */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="h-4 w-4 text-primary" />
            <p className="text-sm font-medium text-gray-900">
              Selecteaza zonele in care lucreaza
            </p>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
                  <div className="h-8 bg-gray-100 rounded w-full" />
                </div>
              ))}
            </div>
          ) : companyAreas.length === 0 ? (
            <div className="text-center py-6 bg-gray-50 rounded-xl">
              <MapPin className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">
                Firma ta nu are zone de lucru configurate.
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Adauga zone in pagina de setari a firmei.
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
              {Object.entries(areasByCity).map(([cityId, { cityName, areas }]) => {
                const allSelected = areas.every((a) => selectedAreaIds.has(a.id));
                const someSelected = areas.some((a) => selectedAreaIds.has(a.id));
                return (
                  <div key={cityId}>
                    {/* City header with select all */}
                    <button
                      type="button"
                      onClick={() => toggleAllForCity(cityId)}
                      className="flex items-center gap-2 mb-2 group cursor-pointer w-full text-left"
                    >
                      <div className={cn(
                        'h-4 w-4 rounded border-2 flex items-center justify-center transition-colors shrink-0',
                        allSelected
                          ? 'bg-primary border-primary'
                          : someSelected
                            ? 'bg-primary/30 border-primary'
                            : 'border-gray-300 group-hover:border-primary/50',
                      )}>
                        {(allSelected || someSelected) && (
                          <Check className="h-2.5 w-2.5 text-white" />
                        )}
                      </div>
                      <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                        {cityName}
                      </span>
                      <span className="text-xs text-gray-400 ml-auto">
                        {areas.filter((a) => selectedAreaIds.has(a.id)).length}/{areas.length}
                      </span>
                    </button>

                    {/* Area checkboxes */}
                    <div className="grid grid-cols-2 gap-1.5 pl-1">
                      {areas.map((area) => {
                        const checked = selectedAreaIds.has(area.id);
                        return (
                          <button
                            key={area.id}
                            type="button"
                            onClick={() => toggleArea(area.id)}
                            className={cn(
                              'flex items-center gap-2 px-3 py-2 rounded-lg border text-left transition-all cursor-pointer',
                              checked
                                ? 'border-primary/30 bg-primary/5'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
                            )}
                          >
                            <div className={cn(
                              'h-3.5 w-3.5 rounded border-2 flex items-center justify-center transition-colors shrink-0',
                              checked
                                ? 'bg-primary border-primary'
                                : 'border-gray-300',
                            )}>
                              {checked && <Check className="h-2 w-2 text-white" />}
                            </div>
                            <span className={cn(
                              'text-sm truncate',
                              checked ? 'text-gray-900 font-medium' : 'text-gray-600',
                            )}>
                              {area.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Summary */}
        {companyAreas.length > 0 && !isLoading && (
          <p className="text-xs text-gray-400">
            {selectedAreaIds.size} din {companyAreas.length} zone selectate
          </p>
        )}

        {/* Success message */}
        {saveSuccess && (
          <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-lg">
            <CheckCircle className="h-4 w-4 text-secondary shrink-0" />
            <p className="text-sm text-emerald-700 font-medium">
              Zonele de lucru au fost salvate cu succes!
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button variant="ghost" onClick={onClose} className="flex-1">
            Inchide
          </Button>
          <Button
            onClick={handleSave}
            loading={saving}
            disabled={companyAreas.length === 0}
            className="flex-1"
          >
            Salveaza
          </Button>
        </div>
      </div>
    </Modal>
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
  const [areasCleaner, setAreasCleaner] = useState<Cleaner | null>(null);

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
                    <button type="button" onClick={() => setAreasCleaner(c)}
                      className="flex items-center gap-1 text-xs font-medium text-primary hover:text-blue-700 transition-colors cursor-pointer">
                      <MapPin className="h-3.5 w-3.5" />
                      Zone
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

      {/* Area Management Modal */}
      <AreaManagementModal
        cleaner={areasCleaner}
        open={areasCleaner !== null}
        onClose={() => setAreasCleaner(null)}
      />

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
