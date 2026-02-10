import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import {
  ArrowLeft,
  Shield,
  Mail,
  Phone,
  Calendar,
  Pencil,
  Check,
  X,
  User,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import {
  GET_USER,
  UPDATE_USER_ROLE,
  ADMIN_UPDATE_USER_PROFILE,
  SUSPEND_USER,
  REACTIVATE_USER,
  SEARCH_USERS,
} from '@/graphql/operations';

// ─── Constants ──────────────────────────────────────────────────────────────

const roleLabel: Record<string, string> = {
  CLIENT: 'Client',
  COMPANY_ADMIN: 'Admin Companie',
  CLEANER: 'Curatator',
  GLOBAL_ADMIN: 'Admin Global',
};

const roleVariant: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  CLIENT: 'default',
  COMPANY_ADMIN: 'info',
  CLEANER: 'success',
  GLOBAL_ADMIN: 'warning',
};

const statusLabel: Record<string, string> = {
  ACTIVE: 'Activ',
  SUSPENDED: 'Suspendat',
};

const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  ACTIVE: 'success',
  SUSPENDED: 'danger',
};

const languageLabel: Record<string, string> = {
  ro: 'Romana',
  en: 'Engleza',
};

const roleOptions = [
  { value: 'CLIENT', label: 'Client' },
  { value: 'COMPANY_ADMIN', label: 'Admin Companie' },
  { value: 'CLEANER', label: 'Curatator' },
  { value: 'GLOBAL_ADMIN', label: 'Admin Global' },
];

// ─── Types ──────────────────────────────────────────────────────────────────

interface UserData {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  role: string;
  status: string;
  preferredLanguage: string;
  createdAt: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Editing state
  const [editingName, setEditingName] = useState(false);
  const [editingPhone, setEditingPhone] = useState(false);
  const [nameValue, setNameValue] = useState('');
  const [phoneValue, setPhoneValue] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [suspendModal, setSuspendModal] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');

  // Queries
  const { data, loading } = useQuery(GET_USER, {
    variables: { id },
    onCompleted: (result) => {
      const u = result?.user as UserData | undefined;
      if (u) {
        setNameValue(u.fullName);
        setPhoneValue(u.phone ?? '');
        setSelectedRole(u.role);
      }
    },
  });

  const refetchQueries = [
    { query: GET_USER, variables: { id } },
    { query: SEARCH_USERS },
  ];

  // Mutations
  const [updateProfile, { loading: savingProfile }] = useMutation(
    ADMIN_UPDATE_USER_PROFILE,
    { refetchQueries },
  );

  const [updateRole, { loading: savingRole }] = useMutation(
    UPDATE_USER_ROLE,
    { refetchQueries },
  );

  const [suspendUser, { loading: suspending }] = useMutation(
    SUSPEND_USER,
    { refetchQueries },
  );

  const [reactivateUser, { loading: reactivating }] = useMutation(
    REACTIVATE_USER,
    { refetchQueries },
  );

  const user: UserData | undefined = data?.user;

  // Handlers
  const handleSaveName = async () => {
    if (!nameValue.trim() || !user) return;
    await updateProfile({
      variables: {
        userId: user.id,
        fullName: nameValue.trim(),
        phone: user.phone || null,
      },
    });
    setEditingName(false);
  };

  const handleSavePhone = async () => {
    if (!user) return;
    await updateProfile({
      variables: {
        userId: user.id,
        fullName: user.fullName,
        phone: phoneValue.trim() || null,
      },
    });
    setEditingPhone(false);
  };

  const handleCancelName = () => {
    setNameValue(user?.fullName ?? '');
    setEditingName(false);
  };

  const handleCancelPhone = () => {
    setPhoneValue(user?.phone ?? '');
    setEditingPhone(false);
  };

  const handleSaveRole = async () => {
    if (!user || selectedRole === user.role) return;
    await updateRole({
      variables: { userId: user.id, role: selectedRole },
    });
  };

  const handleSuspend = async () => {
    if (!suspendReason.trim() || !user) return;
    await suspendUser({
      variables: { id: user.id, reason: suspendReason.trim() },
    });
    setSuspendModal(false);
    setSuspendReason('');
  };

  const handleReactivate = async () => {
    if (!user) return;
    await reactivateUser({ variables: { id: user.id } });
  };

  // Loading skeleton
  if (loading) {
    return (
      <div>
        <div className="animate-pulse space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-gray-200 rounded-xl" />
            <div className="h-8 bg-gray-200 rounded w-48" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 bg-gray-200 rounded-xl" />
            </div>
            <div className="space-y-6">
              <div className="h-40 bg-gray-200 rounded-xl" />
              <div className="h-32 bg-gray-200 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not found
  if (!user) {
    return (
      <div className="text-center py-20">
        <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-400">Utilizatorul nu a fost gasit.</p>
        <Button variant="ghost" className="mt-4" onClick={() => navigate('/admin/utilizatori')}>
          Inapoi la utilizatori
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/admin/utilizatori')}
          className="p-2 rounded-xl hover:bg-gray-100 transition cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.fullName}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <span className="text-base font-semibold text-primary">
                {getInitials(user.fullName)}
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">{user.fullName}</h1>
              <Badge variant={roleVariant[user.role] ?? 'default'}>
                {roleLabel[user.role] ?? user.role}
              </Badge>
              <Badge variant={statusVariant[user.status] ?? 'default'}>
                {statusLabel[user.status] ?? user.status}
              </Badge>
            </div>
            <p className="text-gray-500 text-sm mt-0.5">{user.email}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - User Info */}
        <div className="lg:col-span-2">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Informatii utilizator</h3>
            <div className="space-y-5">
              {/* Full Name - Editable */}
              <div className="flex items-start gap-3">
                <User className="h-4 w-4 text-gray-400 mt-2.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-400 mb-1">Nume complet</p>
                  {editingName ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={nameValue}
                        onChange={(e) => setNameValue(e.target.value)}
                        className="flex-1 rounded-xl border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                        autoFocus
                      />
                      <button
                        onClick={handleSaveName}
                        disabled={savingProfile || !nameValue.trim()}
                        className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition disabled:opacity-50 cursor-pointer"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={handleCancelName}
                        className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition cursor-pointer"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-gray-900">{user.fullName}</p>
                      <button
                        onClick={() => {
                          setNameValue(user.fullName);
                          setEditingName(true);
                        }}
                        className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition cursor-pointer"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Email - Read only */}
              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Email</p>
                  <p className="text-sm text-gray-900">{user.email}</p>
                </div>
              </div>

              {/* Phone - Editable */}
              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 text-gray-400 mt-2.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-400 mb-1">Telefon</p>
                  {editingPhone ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="tel"
                        value={phoneValue}
                        onChange={(e) => setPhoneValue(e.target.value)}
                        placeholder="+40..."
                        className="flex-1 rounded-xl border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                        autoFocus
                      />
                      <button
                        onClick={handleSavePhone}
                        disabled={savingProfile}
                        className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition disabled:opacity-50 cursor-pointer"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={handleCancelPhone}
                        className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition cursor-pointer"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-gray-900">{user.phone || '--'}</p>
                      <button
                        onClick={() => {
                          setPhoneValue(user.phone ?? '');
                          setEditingPhone(true);
                        }}
                        className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition cursor-pointer"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Language - Read only */}
              <div className="flex items-start gap-3">
                <Shield className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Limba preferata</p>
                  <p className="text-sm text-gray-900">
                    {languageLabel[user.preferredLanguage] ?? user.preferredLanguage ?? '--'}
                  </p>
                </div>
              </div>

              {/* Created date - Read only */}
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Inregistrat pe</p>
                  <p className="text-sm text-gray-900">
                    {new Date(user.createdAt).toLocaleDateString('ro-RO', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Role & Status */}
        <div className="space-y-6">
          {/* Role Card */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Rol</h3>
            <div className="space-y-3">
              <Select
                options={roleOptions}
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              />
              <Button
                variant="primary"
                size="sm"
                className="w-full"
                onClick={handleSaveRole}
                loading={savingRole}
                disabled={selectedRole === user.role}
              >
                Salveaza rolul
              </Button>
            </div>
          </Card>

          {/* Status Card */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status cont</h3>
            <div className="flex items-center gap-2 mb-4">
              <Badge variant={statusVariant[user.status] ?? 'default'}>
                {statusLabel[user.status] ?? user.status}
              </Badge>
            </div>
            {user.status === 'ACTIVE' && (
              <Button
                variant="danger"
                size="sm"
                className="w-full"
                onClick={() => setSuspendModal(true)}
              >
                Suspenda
              </Button>
            )}
            {user.status === 'SUSPENDED' && (
              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={handleReactivate}
                loading={reactivating}
              >
                Reactiveaza
              </Button>
            )}
          </Card>
        </div>
      </div>

      {/* Suspend Modal */}
      <Modal
        open={suspendModal}
        onClose={() => {
          setSuspendModal(false);
          setSuspendReason('');
        }}
        title="Suspenda utilizatorul"
      >
        <div className="space-y-4">
          <Input
            label="Motivul suspendarii"
            placeholder="Explica motivul suspendarii..."
            value={suspendReason}
            onChange={(e) => setSuspendReason(e.target.value)}
          />
          <div className="flex justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => {
                setSuspendModal(false);
                setSuspendReason('');
              }}
            >
              Anuleaza
            </Button>
            <Button
              variant="danger"
              onClick={handleSuspend}
              loading={suspending}
              disabled={!suspendReason.trim()}
            >
              Suspenda
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
