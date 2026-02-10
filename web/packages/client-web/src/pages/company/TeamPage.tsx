import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Users, UserPlus, Mail, Phone, Star, Copy, Check } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { MY_CLEANERS, INVITE_CLEANER } from '@/graphql/operations';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const statusBadgeVariant: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  ACTIVE: 'success',
  INVITED: 'info',
  PENDING: 'warning',
  SUSPENDED: 'danger',
  INACTIVE: 'default',
};

const statusLabel: Record<string, string> = {
  ACTIVE: 'Activ',
  INVITED: 'Invitat',
  PENDING: 'In asteptare',
  SUSPENDED: 'Suspendat',
  INACTIVE: 'Inactiv',
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function TeamPage() {
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [inviteToken, setInviteToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [copiedId, setCopiedId] = useState('');

  const { data, loading, refetch } = useQuery(MY_CLEANERS);
  const [inviteCleaner, { loading: inviting }] = useMutation(INVITE_CLEANER);

  const cleaners = data?.myCleaners ?? [];

  const handleCopyToken = async (token: string, id?: string) => {
    await navigator.clipboard.writeText(token);
    setCopiedId(id || '__modal__');
    setTimeout(() => setCopiedId(''), 2000);
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError('');

    if (!inviteEmail.trim() || !inviteName.trim()) {
      setInviteError('Te rugam sa completezi toate campurile.');
      return;
    }

    try {
      const { data: inviteData } = await inviteCleaner({
        variables: {
          input: {
            email: inviteEmail.trim(),
            fullName: inviteName.trim(),
          },
        },
      });
      const token = inviteData?.inviteCleaner?.inviteToken;
      setShowInvite(false);
      setInviteEmail('');
      setInviteName('');
      refetch();
      if (token) {
        setInviteToken(token);
        setShowToken(true);
      }
    } catch (error: unknown) {
      // Extract error message from GraphQL error
      const graphqlError = (error as { graphQLErrors?: Array<{ message: string }> }).graphQLErrors?.[0];
      const errorMessage = graphqlError?.message || 'Invitatia nu a putut fi trimisa. Te rugam sa incerci din nou.';
      setInviteError(errorMessage);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Echipa mea</h1>
          <p className="text-gray-500 mt-1">
            Gestioneaza cleanerii firmei tale.
          </p>
        </div>
        <Button onClick={() => setShowInvite(true)}>
          <UserPlus className="h-4 w-4" />
          Invita cleaner
        </Button>
      </div>

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
            <p className="text-gray-500 mb-4">
              Nu ai adaugat inca niciun cleaner in echipa ta.
            </p>
            <Button onClick={() => setShowInvite(true)}>
              <UserPlus className="h-4 w-4" />
              Invita primul cleaner
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cleaners.map((cleaner: Record<string, unknown>) => (
            <Card key={cleaner.id as string}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-semibold text-primary">
                      {(cleaner.fullName as string)?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {cleaner.fullName as string}
                    </p>
                    <Badge variant={statusBadgeVariant[(cleaner.status as string) || 'PENDING']}>
                      {statusLabel[(cleaner.status as string) || 'PENDING'] || (cleaner.status as string)}
                    </Badge>
                  </div>
                </div>
                {(cleaner.isCompanyAdmin as boolean) && (
                  <Badge variant="info">Admin</Badge>
                )}
              </div>

              <div className="space-y-2 text-sm">
                {(cleaner.email as string) && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="h-4 w-4 text-gray-400" />
                    {cleaner.email as string}
                  </div>
                )}
                {(cleaner.phone as string) && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="h-4 w-4 text-gray-400" />
                    {cleaner.phone as string}
                  </div>
                )}
                {(cleaner.status as string) === 'INVITED' && (cleaner.inviteToken as string) && (
                  <div className="pt-2">
                    <p className="text-xs text-gray-400 mb-1">Cod invitatie</p>
                    <div className="flex items-center gap-1.5">
                      <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 font-mono text-xs text-gray-700 truncate select-all">
                        {cleaner.inviteToken as string}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyToken(cleaner.inviteToken as string, cleaner.id as string)}
                        className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer shrink-0"
                        title="Copiaza codul"
                      >
                        {copiedId === (cleaner.id as string) ? (
                          <Check className="h-3.5 w-3.5 text-secondary" />
                        ) : (
                          <Copy className="h-3.5 w-3.5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {copiedId === (cleaner.id as string) && (
                      <p className="text-xs text-secondary mt-1">Copiat!</p>
                    )}
                  </div>
                )}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1 text-gray-500">
                    <Star className="h-4 w-4 text-accent" />
                    {cleaner.ratingAvg ? Number(cleaner.ratingAvg).toFixed(1) : '--'}
                  </div>
                  <span className="text-gray-500">
                    {cleaner.totalJobsCompleted as number ?? 0} joburi
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Invite Modal */}
      <Modal open={showInvite} onClose={() => setShowInvite(false)} title="Invita cleaner">
        <form onSubmit={handleInvite} className="space-y-4">
          <Input
            label="Nume complet"
            placeholder="Ion Popescu"
            value={inviteName}
            onChange={(e) => setInviteName(e.target.value)}
          />
          <Input
            label="Adresa de email"
            type="email"
            placeholder="ion@email.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            error={inviteError}
          />
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowInvite(false)}
              className="flex-1"
            >
              Anuleaza
            </Button>
            <Button type="submit" loading={inviting} className="flex-1">
              Trimite invitatie
            </Button>
          </div>
        </form>
      </Modal>

      {/* Invite Token Modal */}
      <Modal
        open={showToken}
        onClose={() => setShowToken(false)}
        title="Invitatie trimisa cu succes!"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Trimite acest cod de invitatie cleanerului. El trebuie sa il introduca in panoul sau
            pentru a se alatura echipei tale.
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-mono text-sm text-gray-800 break-all select-all">
              {inviteToken}
            </div>
            <button
              type="button"
              onClick={() => handleCopyToken(inviteToken)}
              className="p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer shrink-0"
              title="Copiaza codul"
            >
              {copiedId === '__modal__' ? (
                <Check className="h-5 w-5 text-secondary" />
              ) : (
                <Copy className="h-5 w-5 text-gray-500" />
              )}
            </button>
          </div>
          {copiedId === '__modal__' && (
            <p className="text-xs text-secondary">Codul a fost copiat!</p>
          )}
          <Button
            onClick={() => setShowToken(false)}
            className="w-full"
          >
            Am inteles
          </Button>
        </div>
      </Modal>
    </div>
  );
}
