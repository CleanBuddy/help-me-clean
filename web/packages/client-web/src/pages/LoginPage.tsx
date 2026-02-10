import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogIn, User as UserIcon, Building2, Sparkles, Shield } from 'lucide-react';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { cn } from '@helpmeclean/shared';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

// ─── Constants ────────────────────────────────────────────────────────────────

const ROLE_HOME: Record<string, string> = {
  CLIENT: '/cont',
  COMPANY_ADMIN: '/firma',
  CLEANER: '/worker',
  GLOBAL_ADMIN: '/admin',
};

interface TestUser {
  email: string;
  name: string;
  role: string;
  description: string;
}

interface TestUserGroup {
  label: string;
  icon: React.ReactNode;
  color: string;
  badgeClass: string;
  users: TestUser[];
}

const DEV_USER_GROUPS: TestUserGroup[] = [
  {
    label: 'Clienti',
    icon: <UserIcon className="h-4 w-4" />,
    color: 'border-l-primary bg-primary/5',
    badgeClass: 'bg-primary/10 text-primary',
    users: [
      { email: 'maria.client@test.dev', name: 'Maria Popescu', role: 'CLIENT', description: 'Client fara rezervari' },
      { email: 'ion.client@test.dev', name: 'Ion Ionescu', role: 'CLIENT', description: 'Client fara rezervari' },
      { email: 'elena.client@test.dev', name: 'Elena Dumitrescu', role: 'CLIENT', description: 'Client fara rezervari' },
    ],
  },
  {
    label: 'Company Admins',
    icon: <Building2 className="h-4 w-4" />,
    color: 'border-l-secondary bg-secondary/5',
    badgeClass: 'bg-secondary/10 text-secondary',
    users: [
      { email: 'alex.company@test.dev', name: 'Alexandru Firma', role: 'COMPANY_ADMIN', description: 'Fara firma — testeaza aplicarea' },
      { email: 'cristina.company@test.dev', name: 'Cristina Business', role: 'COMPANY_ADMIN', description: 'Fara firma — testeaza aplicarea' },
      { email: 'mihai.company@test.dev', name: 'Mihai Enterprise', role: 'COMPANY_ADMIN', description: 'Fara firma — testeaza aplicarea' },
    ],
  },
  {
    label: 'Cleaneri',
    icon: <Sparkles className="h-4 w-4" />,
    color: 'border-l-accent bg-accent/5',
    badgeClass: 'bg-accent/10 text-accent',
    users: [
      { email: 'ana.cleaner@test.dev', name: 'Ana Curatenie', role: 'CLEANER', description: 'Accepta invitatii de la firme' },
      { email: 'bogdan.cleaner@test.dev', name: 'Bogdan Muncitor', role: 'CLEANER', description: 'Accepta invitatii de la firme' },
      { email: 'diana.cleaner@test.dev', name: 'Diana Igienizare', role: 'CLEANER', description: 'Accepta invitatii de la firme' },
    ],
  },
  {
    label: 'Admin Global',
    icon: <Shield className="h-4 w-4" />,
    color: 'border-l-danger bg-red-50',
    badgeClass: 'bg-red-100 text-danger',
    users: [
      { email: 'admin@test.dev', name: 'Admin Principal', role: 'GLOBAL_ADMIN', description: 'Aproba firme, gestioneaza platforma' },
      { email: 'admin2@test.dev', name: 'Admin Secundar', role: 'GLOBAL_ADMIN', description: 'Aproba firme, gestioneaza platforma' },
    ],
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithGoogle, loginDev, isAuthenticated, user } = useAuth();

  const [devMode, setDevMode] = useState(import.meta.env.DEV);
  const [manualEmail, setManualEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState<string | null>(null);
  const [error, setError] = useState('');

  const from = (location.state as { from?: string })?.from;

  // Redirect if already authenticated
  if (isAuthenticated && user) {
    navigate(from || ROLE_HOME[user.role] || '/', { replace: true });
    return null;
  }

  const handleGoogleSuccess = async (response: CredentialResponse) => {
    if (!response.credential) {
      setError('Autentificarea Google a esuat.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const authUser = await loginWithGoogle(response.credential);
      navigate(from || ROLE_HOME[authUser.role] || '/', { replace: true });
    } catch {
      setError('Autentificarea a esuat. Te rugam sa incerci din nou.');
    } finally {
      setLoading(false);
    }
  };

  const handleDevLogin = async (email: string, role: string) => {
    setError('');
    setLoadingEmail(email);
    try {
      const authUser = await loginDev(email, role);
      navigate(from || ROLE_HOME[authUser.role] || '/', { replace: true });
    } catch {
      setError('Autentificarea a esuat. Te rugam sa incerci din nou.');
    } finally {
      setLoadingEmail(null);
    }
  };

  const handleManualDevSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualEmail.trim()) {
      setError('Te rugam sa introduci adresa de email.');
      return;
    }
    await handleDevLogin(manualEmail.trim(), 'CLIENT');
  };

  const getInitials = (name: string) =>
    name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
      <div className={cn('w-full', devMode ? 'max-w-2xl' : 'max-w-md')}>
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
            <LogIn className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Autentificare
          </h1>
          <p className="text-gray-500">
            {devMode
              ? 'Selecteaza un cont de test pentru a te conecta instant.'
              : 'Conecteaza-te cu Google pentru a accesa contul tau.'}
          </p>
        </div>

        {!devMode ? (
          <Card>
            <div className="flex flex-col items-center gap-4">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Autentificarea Google a esuat.')}
                useOneTap
                theme="outline"
                size="large"
                text="signin_with"
                shape="rectangular"
                width="320"
              />
              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}
            </div>

            {import.meta.env.DEV && (
              <button
                type="button"
                onClick={() => { setDevMode(true); setError(''); }}
                className="mt-4 w-full text-center text-xs text-gray-400 hover:text-gray-600 underline cursor-pointer"
              >
                Foloseste Dev Mode
              </button>
            )}
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Test User Groups */}
            {DEV_USER_GROUPS.map((group) => (
              <div key={group.label}>
                <div className="flex items-center gap-2 mb-3">
                  {group.icon}
                  <h3 className="text-sm font-semibold text-gray-700">{group.label}</h3>
                  <span className="text-xs text-gray-400">({group.users.length})</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {group.users.map((testUser) => {
                    const isLoggingIn = loadingEmail === testUser.email;
                    return (
                      <button
                        key={testUser.email}
                        type="button"
                        disabled={!!loadingEmail}
                        onClick={() => handleDevLogin(testUser.email, testUser.role)}
                        className={cn(
                          'relative border-l-4 rounded-xl p-4 text-left transition-all cursor-pointer',
                          'border border-gray-200 hover:shadow-md hover:scale-[1.02]',
                          'disabled:opacity-50 disabled:cursor-not-allowed',
                          group.color,
                        )}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className={cn(
                            'w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                            group.badgeClass,
                          )}>
                            {isLoggingIn ? (
                              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                              getInitials(testUser.name)
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {testUser.name}
                            </div>
                            <div className="text-xs text-gray-400 truncate">
                              {testUser.email}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {testUser.description}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Error */}
            {error && (
              <div className="p-3 rounded-xl bg-red-50 text-sm text-red-700 text-center">
                {error}
              </div>
            )}

            {/* Manual email fallback */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-[#FAFBFC] px-3 text-gray-400">sau email manual</span>
              </div>
            </div>

            <form onSubmit={handleManualDevSubmit} className="flex gap-3">
              <div className="flex-1">
                <Input
                  type="email"
                  placeholder="email@exemplu.com"
                  value={manualEmail}
                  onChange={(e) => setManualEmail(e.target.value)}
                />
              </div>
              <Button
                type="submit"
                loading={loading}
                size="md"
              >
                Conecteaza-te
              </Button>
            </form>

            {/* Toggle back to Google Auth */}
            <button
              type="button"
              onClick={() => { setDevMode(false); setError(''); }}
              className="w-full text-center text-xs text-gray-400 hover:text-gray-600 underline cursor-pointer"
            >
              Foloseste Google Auth
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
