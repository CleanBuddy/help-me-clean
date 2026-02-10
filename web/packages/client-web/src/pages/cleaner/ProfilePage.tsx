import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Star, Briefcase, CalendarCheck, TrendingUp } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import {
  MY_CLEANER_PROFILE,
  MY_CLEANER_STATS,
  ACCEPT_INVITATION,
} from '@/graphql/operations';

export default function ProfilePage() {
  const { user } = useAuth();
  const { data: profileData, loading: profileLoading } = useQuery(MY_CLEANER_PROFILE);
  const { data: statsData, loading: statsLoading } = useQuery(MY_CLEANER_STATS);

  const profile = profileData?.myCleanerProfile;
  const stats = statsData?.myCleanerStats;
  const loading = profileLoading || statsLoading;

  // Accept invitation
  const [inviteToken, setInviteToken] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');
  const [acceptInvitation, { loading: accepting }] = useMutation(ACCEPT_INVITATION, {
    refetchQueries: [{ query: MY_CLEANER_PROFILE }, { query: MY_CLEANER_STATS }],
  });

  const handleAcceptInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteToken.trim()) {
      setInviteError('Te rugam sa introduci codul invitatie.');
      return;
    }
    setInviteError('');
    setInviteSuccess('');
    try {
      const { data } = await acceptInvitation({ variables: { token: inviteToken.trim() } });
      const companyName = data?.acceptInvitation?.company?.companyName;
      setInviteSuccess(
        companyName
          ? `Ai fost adaugat la ${companyName}!`
          : 'Invitatia a fost acceptata cu succes!',
      );
      setInviteToken('');
    } catch {
      setInviteError('Codul de invitatie nu este valid sau a expirat.');
    }
  };

  const getInitials = (name: string) =>
    name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Profil</h1>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <div className="animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-40 mb-3" />
                <div className="h-4 bg-gray-200 rounded w-24" />
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {/* User Info */}
          <Card className="mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary shrink-0">
                {getInitials(user?.fullName ?? profile?.fullName ?? '??')}
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-gray-900">
                  {user?.fullName ?? profile?.fullName ?? '--'}
                </h2>
                <p className="text-sm text-gray-500">{user?.email ?? profile?.email ?? '--'}</p>
                {profile?.phone && (
                  <p className="text-sm text-gray-400 mt-0.5">{profile.phone}</p>
                )}
                {profile?.company?.companyName && (
                  <Badge variant="info" className="mt-2">{profile.company.companyName}</Badge>
                )}
              </div>
            </div>
          </Card>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/10">
                    <Briefcase className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total lucrari</p>
                    <p className="text-xl font-bold text-gray-900">{stats.totalJobsCompleted ?? 0}</p>
                  </div>
                </div>
              </Card>
              <Card>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-secondary/10">
                    <CalendarCheck className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Luna aceasta</p>
                    <p className="text-xl font-bold text-gray-900">{stats.thisMonthJobs ?? 0}</p>
                  </div>
                </div>
              </Card>
              <Card>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-accent/10">
                    <Star className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Rating</p>
                    <p className="text-xl font-bold text-accent">
                      {stats.averageRating ? Number(stats.averageRating).toFixed(1) : '--'}
                    </p>
                  </div>
                </div>
              </Card>
              <Card>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-50">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
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

          {/* Accept Invitation */}
          <Card>
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Accepta invitatie</h2>
            <p className="text-sm text-gray-500 mb-4">
              Ai primit un cod de invitatie de la o firma? Introdu-l mai jos pentru a te alatura echipei.
            </p>
            <form onSubmit={handleAcceptInvitation} className="flex gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Codul de invitatie"
                  value={inviteToken}
                  onChange={(e) => setInviteToken(e.target.value)}
                />
              </div>
              <Button type="submit" loading={accepting}>
                Accepta
              </Button>
            </form>
            {inviteError && (
              <p className="text-sm text-red-500 mt-2">{inviteError}</p>
            )}
            {inviteSuccess && (
              <p className="text-sm text-secondary mt-2">{inviteSuccess}</p>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
