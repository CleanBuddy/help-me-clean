import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Phone, FileText, Building2, Star, Briefcase, TrendingUp, Check } from 'lucide-react';
import { cn } from '@helpmeclean/shared';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import {
  MY_CLEANER_PROFILE,
  MY_CLEANER_STATS,
  UPDATE_CLEANER_PROFILE,
  ACCEPT_INVITATION,
} from '@/graphql/operations';

// ─── Helpers ─────────────────────────────────────────────────────────────────

type StatusVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

const statusVariant: Record<string, StatusVariant> = {
  ACTIVE: 'success',
  INVITED: 'warning',
  SUSPENDED: 'danger',
  INACTIVE: 'default',
};

const statusLabel: Record<string, string> = {
  ACTIVE: 'Activ',
  INVITED: 'Invitat',
  SUSPENDED: 'Suspendat',
  INACTIVE: 'Inactiv',
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { data: profileData, loading: profileLoading } = useQuery(MY_CLEANER_PROFILE);
  const { data: statsData, loading: statsLoading } = useQuery(MY_CLEANER_STATS);

  const profile = profileData?.myCleanerProfile;
  const stats = statsData?.myCleanerStats;
  const loading = profileLoading || statsLoading;

  // ─── Editable form state ────────────────────────────────────────────────
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (profile) {
      setPhone(profile.phone || '');
      setBio(profile.bio || '');
    }
  }, [profile]);

  const [updateProfile, { loading: saving }] = useMutation(UPDATE_CLEANER_PROFILE, {
    refetchQueries: [{ query: MY_CLEANER_PROFILE }],
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess('');
    setSaveError('');
    try {
      await updateProfile({ variables: { input: { phone, bio } } });
      setSaveSuccess('Profil actualizat cu succes!');
      setTimeout(() => setSaveSuccess(''), 3000);
    } catch {
      setSaveError('Eroare la salvare. Incearca din nou.');
    }
  };

  // ─── Invitation state ──────────────────────────────────────────────────
  const [inviteToken, setInviteToken] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');
  const [inviteError, setInviteError] = useState('');

  const [acceptInvitation, { loading: accepting }] = useMutation(ACCEPT_INVITATION, {
    refetchQueries: [{ query: MY_CLEANER_PROFILE }],
  });

  const handleAcceptInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteToken.trim()) {
      setInviteError('Te rugam sa introduci codul de invitatie.');
      return;
    }
    setInviteError('');
    setInviteSuccess('');
    try {
      await acceptInvitation({ variables: { token: inviteToken.trim() } });
      setInviteSuccess('Invitatie acceptata cu succes!');
      setInviteToken('');
    } catch {
      setInviteError('Codul de invitatie nu este valid sau a expirat.');
    }
  };

  // ─── Loading ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Profil & Setari</h1>
        <LoadingSpinner text="Se incarca profilul..." />
      </div>
    );
  }

  const initial = profile?.fullName?.[0]?.toUpperCase() ?? '?';

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Profil & Setari</h1>

      {/* Profile Header */}
      <Card className="mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold shrink-0">
            {initial}
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-gray-900">{profile?.fullName ?? '--'}</h2>
            <p className="text-sm text-gray-400">{profile?.email ?? '--'}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={statusVariant[profile?.status] || 'default'}>
                {statusLabel[profile?.status] || profile?.status || '--'}
              </Badge>
              {profile?.company?.companyName && (
                <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                  <Building2 className="h-3.5 w-3.5" />
                  {profile.company.companyName}
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Row */}
      {stats && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-50">
                <Star className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Rating</p>
                <p className="text-xl font-bold text-gray-900">
                  {stats.averageRating ? `${Number(stats.averageRating).toFixed(1)} / 5` : '-- / 5'}
                </p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-50">
                <Briefcase className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Joburi</p>
                <p className="text-xl font-bold text-gray-900">{stats.totalJobsCompleted ?? 0}</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-50">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Castiguri luna</p>
                <p className="text-xl font-bold text-gray-900">
                  {stats.thisMonthEarnings ? `${Number(stats.thisMonthEarnings).toFixed(0)} RON` : '0 RON'}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Editable Profile Form */}
      <Card className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Informatii profil</h2>
        <form onSubmit={handleSave} className="space-y-5">
          <div className="relative">
            <Phone className="absolute left-3 top-[38px] h-4 w-4 text-gray-400" />
            <Input
              label="Telefon"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Numar de telefon"
              className="pl-10"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Bio</label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Descrie-te pe scurt..."
                rows={4}
                className={cn(
                  'w-full rounded-xl border border-gray-300 bg-white pl-10 pr-4 py-2.5 text-sm text-gray-900',
                  'placeholder:text-gray-400 transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
                )}
              />
            </div>
          </div>
          {saveSuccess && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-700">
              <Check className="h-4 w-4 shrink-0" />
              {saveSuccess}
            </div>
          )}
          {saveError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
              {saveError}
            </div>
          )}
          <Button type="submit" loading={saving}>
            Salveaza modificarile
          </Button>
        </form>
      </Card>

      {/* Accept Invitation */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Accepta invitatie</h2>
        <p className="text-sm text-gray-500 mb-4">
          Ai primit un cod de invitatie de la o companie? Introdu-l mai jos.
        </p>
        <form onSubmit={handleAcceptInvitation} className="space-y-4">
          <Input
            value={inviteToken}
            onChange={(e) => setInviteToken(e.target.value)}
            placeholder="Cod invitatie (ex: inv-abc123...)"
          />
          {inviteSuccess && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-700">
              <Check className="h-4 w-4 shrink-0" />
              {inviteSuccess}
            </div>
          )}
          {inviteError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
              {inviteError}
            </div>
          )}
          <Button type="submit" loading={accepting}>
            Accepta invitatia
          </Button>
        </form>
      </Card>
    </div>
  );
}
