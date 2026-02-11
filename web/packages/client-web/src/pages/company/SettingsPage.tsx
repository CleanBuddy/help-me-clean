import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Building2, Save, FileText, MapPin, Clock } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { cn } from '@helpmeclean/shared';
import { MY_COMPANY, UPDATE_COMPANY_PROFILE, MY_COMPANY_WORK_SCHEDULE } from '@/graphql/operations';

// ─── Helpers ─────────────────────────────────────────────────────────────────

type StatusVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

const companyStatusVariant: Record<string, StatusVariant> = {
  APPROVED: 'success',
  PENDING_REVIEW: 'warning',
  REJECTED: 'danger',
  SUSPENDED: 'danger',
};

const companyStatusLabel: Record<string, string> = {
  APPROVED: 'Aprobata',
  PENDING_REVIEW: 'In curs de verificare',
  REJECTED: 'Respinsa',
  SUSPENDED: 'Suspendata',
};

interface CompanyDocument {
  id: string;
  documentType: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
}

// ─── Work Schedule ───────────────────────────────────────────────────────────

interface WorkScheduleDay {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isWorkDay: boolean;
}

/** Display order: Mon(1)..Sun(0) */
const DAY_DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0] as const;

const DAY_NAMES: Record<number, string> = {
  0: 'Duminica',
  1: 'Luni',
  2: 'Marti',
  3: 'Miercuri',
  4: 'Joi',
  5: 'Vineri',
  6: 'Sambata',
};

function buildDefaultSchedule(): WorkScheduleDay[] {
  return DAY_DISPLAY_ORDER.map((dow) => ({
    dayOfWeek: dow,
    startTime: '08:00',
    endTime: '17:00',
    isWorkDay: dow >= 1 && dow <= 5, // Mon-Fri on, Sat-Sun off
  }));
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { data, loading } = useQuery(MY_COMPANY);
  const [updateCompany, { loading: saving }] = useMutation(UPDATE_COMPANY_PROFILE);
  const company = data?.myCompany;

  const { data: scheduleData } = useQuery(MY_COMPANY_WORK_SCHEDULE);

  const [description, setDescription] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [maxRadius, setMaxRadius] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [schedule, setSchedule] = useState<WorkScheduleDay[]>(buildDefaultSchedule);
  const [scheduleSuccessMessage, setScheduleSuccessMessage] = useState('');
  const [savingSchedule, setSavingSchedule] = useState(false);

  useEffect(() => {
    if (company) {
      setDescription(company.description || '');
      setContactEmail(company.contactEmail || '');
      setContactPhone(company.contactPhone || '');
      setMaxRadius(company.maxServiceRadiusKm?.toString() || '');
    }
  }, [company]);

  useEffect(() => {
    if (scheduleData?.myCompanyWorkSchedule) {
      const fetched = scheduleData.myCompanyWorkSchedule as Array<{
        dayOfWeek: number;
        startTime: string;
        endTime: string;
        isWorkDay: boolean;
      }>;
      setSchedule((prev) =>
        prev.map((day) => {
          const match = fetched.find((f) => f.dayOfWeek === day.dayOfWeek);
          return match
            ? { ...day, startTime: match.startTime, endTime: match.endTime, isWorkDay: match.isWorkDay }
            : day;
        }),
      );
    }
  }, [scheduleData]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    try {
      await updateCompany({
        variables: {
          input: {
            description,
            contactPhone,
            contactEmail,
            maxServiceRadiusKm: maxRadius ? parseInt(maxRadius, 10) : undefined,
          },
        },
      });
      setSuccessMessage('Setarile au fost salvate cu succes.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch {
      // Error handled by Apollo
    }
  };

  const updateScheduleDay = (dayOfWeek: number, patch: Partial<WorkScheduleDay>) => {
    setSchedule((prev) =>
      prev.map((d) => (d.dayOfWeek === dayOfWeek ? { ...d, ...patch } : d)),
    );
  };

  const handleSaveSchedule = async () => {
    setScheduleSuccessMessage('');
    setSavingSchedule(true);
    try {
      await updateCompany({
        variables: {
          input: {
            workSchedule: schedule.map(({ dayOfWeek, startTime, endTime, isWorkDay }) => ({
              dayOfWeek,
              startTime,
              endTime,
              isWorkDay,
            })),
          },
        },
      });
      setScheduleSuccessMessage('Programul de lucru a fost salvat cu succes.');
      setTimeout(() => setScheduleSuccessMessage(''), 3000);
    } catch {
      // Error handled by Apollo
    } finally {
      setSavingSchedule(false);
    }
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Setari</h1>
        <div className="animate-pulse space-y-6">
          <div className="h-48 bg-gray-200 rounded-xl" />
          <div className="h-64 bg-gray-200 rounded-xl" />
          <div className="h-32 bg-gray-200 rounded-xl" />
          <div className="h-24 bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Setari</h1>
        <Card>
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">Nicio firma inregistrata</h3>
            <p className="text-gray-500">Nu ai o firma inregistrata inca.</p>
          </div>
        </Card>
      </div>
    );
  }

  const documents: CompanyDocument[] = company.documents ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Setari</h1>

      {/* Company Info (read-only) */}
      <Card className="mb-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{company.companyName}</h2>
            <p className="text-sm text-gray-500 mt-1">CUI: {company.cui}</p>
          </div>
          <Badge variant={companyStatusVariant[company.status] || 'default'}>
            {companyStatusLabel[company.status] || company.status}
          </Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Tip firma</p>
            <p className="font-medium">{company.companyType || '--'}</p>
          </div>
          <div>
            <p className="text-gray-500">Reprezentant legal</p>
            <p className="font-medium">{company.legalRepresentative || '--'}</p>
          </div>
          <div>
            <p className="text-gray-500">Adresa</p>
            <p className="font-medium">
              {[company.city, company.county].filter(Boolean).join(', ') || '--'}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Raza de acoperire</p>
            <p className="font-medium">{company.maxServiceRadiusKm ?? '--'} km</p>
          </div>
        </div>
        {company.rejectionReason && (
          <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
            <p className="font-medium mb-1">Motiv respingere:</p>
            <p>{company.rejectionReason}</p>
          </div>
        )}
      </Card>

      {/* Editable profile settings */}
      <Card className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Editeaza profilul firmei</h2>
        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Descriere firma</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className={cn(
                'w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900',
                'placeholder:text-gray-400 transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600',
              )}
              placeholder="Descrierea firmei tale..."
            />
          </div>
          <Input label="Email contact" type="email" value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)} placeholder="contact@firma.ro" />
          <Input label="Telefon contact" value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)} placeholder="+40 7XX XXX XXX" />
          <Input label="Raza maxima serviciu (km)" type="number" value={maxRadius}
            onChange={(e) => setMaxRadius(e.target.value)} placeholder="50" />
          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-700">
              {successMessage}
            </div>
          )}
          <Button type="submit" loading={saving}>
            <Save className="h-4 w-4" />
            Salveaza modificarile
          </Button>
        </form>
      </Card>

      {/* Work Schedule */}
      <Card className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">Program implicit de lucru</h2>
        </div>
        <p className="text-sm text-gray-500 mb-5">
          Seteaza orele implicite de lucru ale firmei. Acestea vor fi folosite ca baza la programarea curateniilor.
        </p>
        <div className="space-y-3">
          {schedule.map((day) => (
            <div
              key={day.dayOfWeek}
              className={cn(
                'flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-xl border transition-colors',
                day.isWorkDay ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100',
              )}
            >
              <div className="flex items-center gap-3 sm:w-36 shrink-0">
                <input
                  type="checkbox"
                  checked={day.isWorkDay}
                  onChange={(e) => updateScheduleDay(day.dayOfWeek, { isWorkDay: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600/30"
                />
                <span className={cn(
                  'text-sm font-medium',
                  day.isWorkDay ? 'text-gray-900' : 'text-gray-400',
                )}>
                  {DAY_NAMES[day.dayOfWeek]}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={day.startTime}
                  onChange={(e) => updateScheduleDay(day.dayOfWeek, { startTime: e.target.value })}
                  disabled={!day.isWorkDay}
                  className={cn(
                    'rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-colors',
                    'focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600',
                    !day.isWorkDay && 'opacity-40 cursor-not-allowed bg-gray-100',
                  )}
                />
                <span className="text-sm text-gray-400">-</span>
                <input
                  type="time"
                  value={day.endTime}
                  onChange={(e) => updateScheduleDay(day.dayOfWeek, { endTime: e.target.value })}
                  disabled={!day.isWorkDay}
                  className={cn(
                    'rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-colors',
                    'focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600',
                    !day.isWorkDay && 'opacity-40 cursor-not-allowed bg-gray-100',
                  )}
                />
              </div>
            </div>
          ))}
        </div>
        {scheduleSuccessMessage && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-700">
            {scheduleSuccessMessage}
          </div>
        )}
        <div className="mt-5">
          <Button onClick={handleSaveSchedule} loading={savingSchedule}>
            <Save className="h-4 w-4" />
            Salveaza programul
          </Button>
        </div>
      </Card>

      {/* Documents */}
      <Card className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-5 w-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">Documente firma</h2>
        </div>
        {documents.length > 0 ? (
          <ul className="divide-y divide-gray-100">
            {documents.map((doc) => (
              <li key={doc.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="h-4 w-4 text-gray-400 shrink-0" />
                  <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer"
                    className="text-sm font-medium text-blue-600 hover:underline truncate">
                    {doc.fileName}
                  </a>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <Badge variant="info">{doc.documentType}</Badge>
                  <span className="text-xs text-gray-500">{formatDate(doc.uploadedAt)}</span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500 py-4 text-center">Nu exista documente incarcate.</p>
        )}
      </Card>

      {/* Coverage area */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="h-5 w-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">Zona de acoperire</h2>
        </div>
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
          <MapPin className="h-5 w-5 text-blue-600 shrink-0" />
          <p className="text-sm font-medium text-gray-900">
            {[company.city, company.county].filter(Boolean).join(', ') || 'Locatie nespecificata'}
            {' — '}
            <span className="text-blue-600">{company.maxServiceRadiusKm ?? 0} km</span>
            {' raza de serviciu'}
          </p>
        </div>
      </Card>
    </div>
  );
}
