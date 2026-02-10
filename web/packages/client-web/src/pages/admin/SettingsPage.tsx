import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Settings, Package, Sparkles, Pencil, Check, X, Plus } from 'lucide-react';
import { cn } from '@helpmeclean/shared';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import {
  PLATFORM_SETTINGS,
  UPDATE_PLATFORM_SETTING,
  ALL_SERVICES,
  ALL_EXTRAS,
  UPDATE_SERVICE_DEFINITION,
  CREATE_SERVICE_DEFINITION,
  UPDATE_SERVICE_EXTRA,
  CREATE_SERVICE_EXTRA,
} from '@/graphql/operations';

// ─── Types ───────────────────────────────────────────────────────────────────

type TabKey = 'general' | 'services' | 'extras';

interface PlatformSetting {
  key: string;
  value: string;
  valueType?: string;
  description?: string;
  updatedAt?: string;
}

interface ServiceDef {
  id: string;
  serviceType: string;
  nameRo: string;
  nameEn: string;
  basePricePerHour: number;
  minHours: number;
  icon?: string;
  isActive: boolean;
}

interface ExtraDef {
  id: string;
  nameRo: string;
  nameEn: string;
  price: number;
  icon?: string;
  isActive: boolean;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const tabs: { key: TabKey; label: string; icon: typeof Settings }[] = [
  { key: 'general', label: 'Setari Generale', icon: Settings },
  { key: 'services', label: 'Servicii', icon: Package },
  { key: 'extras', label: 'Extra-uri', icon: Sparkles },
];

const SETTING_GROUPS: { title: string; keys: string[] }[] = [
  { title: 'Business', keys: ['commission_pct', 'min_booking_hours', 'max_booking_hours', 'default_hourly_rate'] },
  { title: 'Contact', keys: ['support_email', 'support_phone'] },
  { title: 'Politici', keys: ['privacy_policy_url', 'terms_url', 'cancellation_policy_url', 'refund_policy_url'] },
];

const SETTING_LABELS: Record<string, string> = {
  commission_pct: 'Comision platforma (%)',
  min_booking_hours: 'Ore minime rezervare',
  max_booking_hours: 'Ore maxime rezervare',
  default_hourly_rate: 'Tarif orar implicit (RON)',
  support_email: 'Email suport',
  support_phone: 'Telefon suport',
  privacy_policy_url: 'URL Politica confidentialitate',
  terms_url: 'URL Termeni si conditii',
  cancellation_policy_url: 'URL Politica anulare',
  refund_policy_url: 'URL Politica rambursare',
};

const NUMBER_KEYS = new Set(['commission_pct', 'min_booking_hours', 'max_booking_hours', 'default_hourly_rate']);

const SERVICE_TYPE_OPTIONS = [
  { value: 'STANDARD', label: 'Standard' },
  { value: 'DEEP', label: 'Curatenie generala' },
  { value: 'POST_CONSTRUCTION', label: 'Post-constructie' },
  { value: 'OFFICE', label: 'Birou' },
  { value: 'MOVE_IN_OUT', label: 'Mutare' },
];

// ─── Skeleton ────────────────────────────────────────────────────────────────

function SettingsSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <div className="animate-pulse space-y-4">
            <div className="h-5 bg-gray-200 rounded w-32" />
            {[1, 2].map((j) => (
              <div key={j} className="flex items-center justify-between">
                <div className="h-4 bg-gray-200 rounded w-48" />
                <div className="h-4 bg-gray-200 rounded w-24" />
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="animate-pulse flex items-center gap-4 py-3 px-4">
          <div className="h-4 bg-gray-200 rounded flex-1" />
          <div className="h-4 bg-gray-200 rounded w-24" />
          <div className="h-4 bg-gray-200 rounded w-16" />
          <div className="h-4 bg-gray-200 rounded w-12" />
        </div>
      ))}
    </div>
  );
}

// ─── Toggle Switch ───────────────────────────────────────────────────────────

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer',
        checked ? 'bg-emerald-500' : 'bg-gray-300',
        disabled && 'opacity-50 cursor-not-allowed',
      )}
    >
      <span
        className={cn(
          'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
          checked ? 'translate-x-6' : 'translate-x-1',
        )}
      />
    </button>
  );
}

// ─── Tab: Setari Generale ────────────────────────────────────────────────────

function GeneralTab() {
  const { data, loading } = useQuery<{ platformSettings: PlatformSetting[] }>(PLATFORM_SETTINGS);
  const [updateSetting] = useMutation(UPDATE_PLATFORM_SETTING, {
    refetchQueries: [{ query: PLATFORM_SETTINGS }],
  });
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedKey, setSavedKey] = useState<string | null>(null);

  const settingsMap = new Map<string, PlatformSetting>();
  (data?.platformSettings ?? []).forEach((s) => settingsMap.set(s.key, s));

  const handleEdit = (key: string, currentValue: string) => {
    setEditingKey(key);
    setEditValue(currentValue);
  };

  const handleCancel = () => {
    setEditingKey(null);
    setEditValue('');
  };

  const handleSave = async (key: string) => {
    setSaving(true);
    try {
      await updateSetting({ variables: { key, value: editValue } });
      setSavedKey(key);
      setEditingKey(null);
      setEditValue('');
      setTimeout(() => setSavedKey(null), 2000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <SettingsSkeleton />;

  return (
    <div className="space-y-6">
      {SETTING_GROUPS.map((group) => (
        <Card key={group.title}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{group.title}</h3>
          <div className="divide-y divide-gray-100">
            {group.keys.map((key) => {
              const setting = settingsMap.get(key);
              const value = setting?.value ?? '';
              const isEditing = editingKey === key;
              const isNumber = NUMBER_KEYS.has(key);

              return (
                <div key={key} className="flex items-center justify-between py-3 gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-700">{SETTING_LABELS[key] ?? key}</p>
                    {setting?.description && (
                      <p className="text-xs text-gray-400 mt-0.5">{setting.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {isEditing ? (
                      <>
                        <input
                          type={isNumber ? 'number' : 'text'}
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSave(key);
                            if (e.key === 'Escape') handleCancel();
                          }}
                          autoFocus
                          className="w-48 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                        />
                        <button
                          onClick={() => handleSave(key)}
                          disabled={saving}
                          className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition cursor-pointer"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={handleCancel}
                          className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition cursor-pointer"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        {savedKey === key && (
                          <Badge variant="success">Salvat</Badge>
                        )}
                        <span className="text-sm text-gray-900 font-medium max-w-[200px] truncate">
                          {value || <span className="text-gray-300 italic">nesetat</span>}
                        </span>
                        <button
                          onClick={() => handleEdit(key, value)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/5 transition cursor-pointer"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      ))}
    </div>
  );
}

// ─── Tab: Servicii ───────────────────────────────────────────────────────────

function ServicesTab() {
  const { data, loading } = useQuery<{ allServices: ServiceDef[] }>(ALL_SERVICES);
  const [updateService] = useMutation(UPDATE_SERVICE_DEFINITION, {
    refetchQueries: [{ query: ALL_SERVICES }],
  });
  const [createService] = useMutation(CREATE_SERVICE_DEFINITION, {
    refetchQueries: [{ query: ALL_SERVICES }],
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFields, setEditFields] = useState({ nameRo: '', nameEn: '', basePricePerHour: 0, minHours: 0 });
  const [showModal, setShowModal] = useState(false);
  const [newService, setNewService] = useState({ serviceType: 'STANDARD', nameRo: '', nameEn: '', basePricePerHour: 0, minHours: 2, isActive: true });
  const [creating, setCreating] = useState(false);

  const services = data?.allServices ?? [];

  const startEdit = (s: ServiceDef) => {
    setEditingId(s.id);
    setEditFields({ nameRo: s.nameRo, nameEn: s.nameEn, basePricePerHour: s.basePricePerHour, minHours: s.minHours });
  };

  const saveEdit = async (id: string) => {
    await updateService({ variables: { input: { id, ...editFields } } });
    setEditingId(null);
  };

  const toggleActive = async (s: ServiceDef) => {
    await updateService({ variables: { input: { id: s.id, isActive: !s.isActive } } });
  };

  const handleCreate = async () => {
    setCreating(true);
    try {
      await createService({ variables: { input: newService } });
      setShowModal(false);
      setNewService({ serviceType: 'STANDARD', nameRo: '', nameEn: '', basePricePerHour: 0, minHours: 2, isActive: true });
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">{services.length} servicii definite</p>
        <Button size="sm" onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4" />
          Adauga serviciu
        </Button>
      </div>

      <Card padding={false}>
        {loading ? (
          <TableSkeleton />
        ) : services.length === 0 ? (
          <p className="text-center text-gray-400 py-12">Niciun serviciu definit.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/50">
                  <th className="text-left font-medium text-gray-500 px-4 py-3">Nume RO</th>
                  <th className="text-left font-medium text-gray-500 px-4 py-3">Nume EN</th>
                  <th className="text-right font-medium text-gray-500 px-4 py-3">Pret/Ora</th>
                  <th className="text-right font-medium text-gray-500 px-4 py-3">Ore Min.</th>
                  <th className="text-center font-medium text-gray-500 px-4 py-3">Activ</th>
                  <th className="px-4 py-3 w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {services.map((s) => {
                  const isEditing = editingId === s.id;
                  return (
                    <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <input
                            value={editFields.nameRo}
                            onChange={(e) => setEditFields((f) => ({ ...f, nameRo: e.target.value }))}
                            onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(s.id); if (e.key === 'Escape') setEditingId(null); }}
                            className="w-full rounded-lg border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                            autoFocus
                          />
                        ) : (
                          <span className="font-medium text-gray-900">{s.nameRo}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <input
                            value={editFields.nameEn}
                            onChange={(e) => setEditFields((f) => ({ ...f, nameEn: e.target.value }))}
                            onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(s.id); if (e.key === 'Escape') setEditingId(null); }}
                            className="w-full rounded-lg border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                          />
                        ) : (
                          <span className="text-gray-600">{s.nameEn}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editFields.basePricePerHour}
                            onChange={(e) => setEditFields((f) => ({ ...f, basePricePerHour: Number(e.target.value) }))}
                            onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(s.id); if (e.key === 'Escape') setEditingId(null); }}
                            className="w-24 rounded-lg border border-gray-300 px-2 py-1 text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/30"
                          />
                        ) : (
                          <span className="text-gray-900">{s.basePricePerHour} RON</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editFields.minHours}
                            onChange={(e) => setEditFields((f) => ({ ...f, minHours: Number(e.target.value) }))}
                            onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(s.id); if (e.key === 'Escape') setEditingId(null); }}
                            className="w-20 rounded-lg border border-gray-300 px-2 py-1 text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/30"
                          />
                        ) : (
                          <span className="text-gray-600">{s.minHours}h</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Toggle checked={s.isActive} onChange={() => toggleActive(s)} />
                      </td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => saveEdit(s.id)} className="p-1 rounded-lg text-emerald-600 hover:bg-emerald-50 transition cursor-pointer">
                              <Check className="h-4 w-4" />
                            </button>
                            <button onClick={() => setEditingId(null)} className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 transition cursor-pointer">
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => startEdit(s)} className="p-1 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/5 transition cursor-pointer">
                            <Pencil className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Adauga serviciu">
        <div className="space-y-4">
          <Select
            label="Tip serviciu"
            options={SERVICE_TYPE_OPTIONS}
            value={newService.serviceType}
            onChange={(e) => setNewService((s) => ({ ...s, serviceType: e.target.value }))}
          />
          <Input
            label="Nume RO"
            value={newService.nameRo}
            onChange={(e) => setNewService((s) => ({ ...s, nameRo: e.target.value }))}
          />
          <Input
            label="Nume EN"
            value={newService.nameEn}
            onChange={(e) => setNewService((s) => ({ ...s, nameEn: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Pret/Ora (RON)"
              type="number"
              value={newService.basePricePerHour}
              onChange={(e) => setNewService((s) => ({ ...s, basePricePerHour: Number(e.target.value) }))}
            />
            <Input
              label="Ore minime"
              type="number"
              value={newService.minHours}
              onChange={(e) => setNewService((s) => ({ ...s, minHours: Number(e.target.value) }))}
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={newService.isActive}
              onChange={(e) => setNewService((s) => ({ ...s, isActive: e.target.checked }))}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/30"
            />
            <span className="text-sm text-gray-700">Activ</span>
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowModal(false)}>Anuleaza</Button>
            <Button
              onClick={handleCreate}
              loading={creating}
              disabled={!newService.nameRo.trim() || !newService.nameEn.trim()}
            >
              Creeaza
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

// ─── Tab: Extra-uri ──────────────────────────────────────────────────────────

function ExtrasTab() {
  const { data, loading } = useQuery<{ allExtras: ExtraDef[] }>(ALL_EXTRAS);
  const [updateExtra] = useMutation(UPDATE_SERVICE_EXTRA, {
    refetchQueries: [{ query: ALL_EXTRAS }],
  });
  const [createExtra] = useMutation(CREATE_SERVICE_EXTRA, {
    refetchQueries: [{ query: ALL_EXTRAS }],
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFields, setEditFields] = useState({ nameRo: '', nameEn: '', price: 0 });
  const [showModal, setShowModal] = useState(false);
  const [newExtra, setNewExtra] = useState({ nameRo: '', nameEn: '', price: 0, isActive: true });
  const [creating, setCreating] = useState(false);

  const extras = data?.allExtras ?? [];

  const startEdit = (e: ExtraDef) => {
    setEditingId(e.id);
    setEditFields({ nameRo: e.nameRo, nameEn: e.nameEn, price: e.price });
  };

  const saveEdit = async (id: string) => {
    await updateExtra({ variables: { input: { id, ...editFields } } });
    setEditingId(null);
  };

  const toggleActive = async (e: ExtraDef) => {
    await updateExtra({ variables: { input: { id: e.id, isActive: !e.isActive } } });
  };

  const handleCreate = async () => {
    setCreating(true);
    try {
      await createExtra({ variables: { input: newExtra } });
      setShowModal(false);
      setNewExtra({ nameRo: '', nameEn: '', price: 0, isActive: true });
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">{extras.length} extra-uri definite</p>
        <Button size="sm" onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4" />
          Adauga extra
        </Button>
      </div>

      <Card padding={false}>
        {loading ? (
          <TableSkeleton />
        ) : extras.length === 0 ? (
          <p className="text-center text-gray-400 py-12">Niciun extra definit.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/50">
                  <th className="text-left font-medium text-gray-500 px-4 py-3">Nume RO</th>
                  <th className="text-left font-medium text-gray-500 px-4 py-3">Nume EN</th>
                  <th className="text-right font-medium text-gray-500 px-4 py-3">Pret (RON)</th>
                  <th className="text-center font-medium text-gray-500 px-4 py-3">Activ</th>
                  <th className="px-4 py-3 w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {extras.map((ex) => {
                  const isEditing = editingId === ex.id;
                  return (
                    <tr key={ex.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <input
                            value={editFields.nameRo}
                            onChange={(e) => setEditFields((f) => ({ ...f, nameRo: e.target.value }))}
                            onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(ex.id); if (e.key === 'Escape') setEditingId(null); }}
                            className="w-full rounded-lg border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                            autoFocus
                          />
                        ) : (
                          <span className="font-medium text-gray-900">{ex.nameRo}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <input
                            value={editFields.nameEn}
                            onChange={(e) => setEditFields((f) => ({ ...f, nameEn: e.target.value }))}
                            onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(ex.id); if (e.key === 'Escape') setEditingId(null); }}
                            className="w-full rounded-lg border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                          />
                        ) : (
                          <span className="text-gray-600">{ex.nameEn}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editFields.price}
                            onChange={(e) => setEditFields((f) => ({ ...f, price: Number(e.target.value) }))}
                            onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(ex.id); if (e.key === 'Escape') setEditingId(null); }}
                            className="w-24 rounded-lg border border-gray-300 px-2 py-1 text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/30"
                          />
                        ) : (
                          <span className="text-gray-900">{ex.price} RON</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Toggle checked={ex.isActive} onChange={() => toggleActive(ex)} />
                      </td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => saveEdit(ex.id)} className="p-1 rounded-lg text-emerald-600 hover:bg-emerald-50 transition cursor-pointer">
                              <Check className="h-4 w-4" />
                            </button>
                            <button onClick={() => setEditingId(null)} className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 transition cursor-pointer">
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => startEdit(ex)} className="p-1 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/5 transition cursor-pointer">
                            <Pencil className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Adauga extra">
        <div className="space-y-4">
          <Input
            label="Nume RO"
            value={newExtra.nameRo}
            onChange={(e) => setNewExtra((s) => ({ ...s, nameRo: e.target.value }))}
          />
          <Input
            label="Nume EN"
            value={newExtra.nameEn}
            onChange={(e) => setNewExtra((s) => ({ ...s, nameEn: e.target.value }))}
          />
          <Input
            label="Pret (RON)"
            type="number"
            value={newExtra.price}
            onChange={(e) => setNewExtra((s) => ({ ...s, price: Number(e.target.value) }))}
          />
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={newExtra.isActive}
              onChange={(e) => setNewExtra((s) => ({ ...s, isActive: e.target.checked }))}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/30"
            />
            <span className="text-sm text-gray-700">Activ</span>
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowModal(false)}>Anuleaza</Button>
            <Button
              onClick={handleCreate}
              loading={creating}
              disabled={!newExtra.nameRo.trim() || !newExtra.nameEn.trim()}
            >
              Creeaza
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('general');

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Setari Platforma</h1>
        <p className="text-gray-500 mt-1">Configuratii generale, servicii si extra-uri.</p>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap cursor-pointer',
                activeTab === tab.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700',
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'general' && <GeneralTab />}
      {activeTab === 'services' && <ServicesTab />}
      {activeTab === 'extras' && <ExtrasTab />}
    </div>
  );
}
