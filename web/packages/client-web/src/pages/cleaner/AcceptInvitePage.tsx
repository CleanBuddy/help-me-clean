import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { UserCheck, CheckCircle, AlertCircle, Mail } from 'lucide-react';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { useAuth } from '@/context/AuthContext';
import { authService, type AuthUser } from '@/services/AuthService';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import EmailOtpModal from '@/components/auth/EmailOtpModal';
import { ACCEPT_INVITATION } from '@/graphql/operations';

// Public landing page for invited cleaners.
// Accessible at /invitare?token=inv-xxx or /invitare (manual token entry).
// Handles auth inline so cleaners can sign up with email OTP (role=CLEANER)
// without navigating away from the invitation context.
export default function AcceptInvitePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlToken = searchParams.get('token') ?? '';

  const { isAuthenticated, loginWithGoogle, refreshToken } = useAuth();
  const [acceptInvitation, { loading: accepting }] = useMutation(ACCEPT_INVITATION);

  const [token, setToken] = useState(urlToken);
  const [step, setStep] = useState<'auth' | 'invite' | 'done'>(
    isAuthenticated ? 'invite' : 'auth',
  );
  const [error, setError] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);

  // Once authenticated, advance to invite step.
  useEffect(() => {
    if (isAuthenticated && step === 'auth') {
      setStep('invite');
    }
  }, [isAuthenticated, step]);

  const handleAccept = async () => {
    if (!token.trim()) {
      setError('Introdu codul de invitație.');
      return;
    }
    setError('');
    try {
      const { data } = await acceptInvitation({ variables: { token: token.trim() } });
      setCompanyName(data?.acceptInvitation?.company?.companyName ?? '');
      setStep('done');
      // Refresh JWT so it carries the CLEANER role before entering /worker.
      await refreshToken();
      setTimeout(() => navigate('/worker'), 2000);
    } catch {
      setError('Codul de invitație nu este valid sau a expirat.');
    }
  };

  const handleGoogleSuccess = async (response: CredentialResponse) => {
    if (!response.credential) { setError('Autentificarea Google a eșuat.'); return; }
    setError('');
    try {
      await loginWithGoogle(response.credential, 'CLEANER');
      // Effect above advances to 'invite' step once isAuthenticated updates.
    } catch {
      setError('Autentificarea a eșuat. Încearcă din nou.');
    }
  };

  const handleOtpSuccess = (_user: AuthUser) => {
    // authService emits state → useAuth reflects new user → effect advances step.
    // We also check the token in case it was pre-filled from the URL.
    if (authService.getToken() && urlToken) {
      acceptInvitation({ variables: { token: urlToken } })
        .then(async ({ data }) => {
          setCompanyName(data?.acceptInvitation?.company?.companyName ?? '');
          setStep('done');
          // Refresh JWT so it carries the CLEANER role before entering /worker.
          await refreshToken();
          setTimeout(() => navigate('/worker'), 2000);
        })
        .catch(() => {
          setStep('invite');
        });
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
            <UserCheck className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Acceptă invitația
          </h1>
          <p className="text-gray-500">
            {step === 'auth'
              ? 'Autentifică-te pentru a-ți activa profilul de curățitor.'
              : 'Introdu codul de invitație primit de la companie.'}
          </p>
        </div>

        {/* ── Step: Authentication ── */}
        {step === 'auth' && (
          <Card>
            <div className="flex flex-col items-center gap-4">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Autentificarea Google a eșuat.')}
                theme="outline"
                size="large"
                text="signin_with"
                shape="rectangular"
                width="320"
              />

              <div className="flex items-center gap-3 w-full max-w-[320px]">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400">sau</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <button
                type="button"
                onClick={() => setShowOtpModal(true)}
                className="w-full max-w-[320px] rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition flex items-center justify-center gap-2"
              >
                <Mail className="h-4 w-4" />
                Continuă cu email
              </button>
            </div>

            {error && (
              <div className="mt-4 p-3 rounded-xl bg-red-50 text-sm text-red-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <EmailOtpModal
              open={showOtpModal}
              onClose={() => setShowOtpModal(false)}
              onSuccess={handleOtpSuccess}
              role="CLEANER"
              title="Creează cont de curățitor"
            />
          </Card>
        )}

        {/* ── Step: Enter invite token ── */}
        {step === 'invite' && (
          <Card>
            <div className="flex flex-col gap-4">
              <Input
                label="Cod de invitație"
                placeholder="inv-xxxxxxxxxxxxxxxx"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAccept()}
                error={error}
                autoFocus={!token}
              />
              <Button onClick={handleAccept} disabled={accepting} className="w-full">
                {accepting ? 'Se procesează...' : 'Acceptă invitația'}
              </Button>
            </div>
          </Card>
        )}

        {/* ── Step: Success ── */}
        {step === 'done' && (
          <Card className="text-center">
            <CheckCircle className="h-16 w-16 text-secondary mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Invitație acceptată!
            </h2>
            <p className="text-gray-500">
              {companyName
                ? `Ai fost adăugat la ${companyName}.`
                : 'Profilul tău de curățitor a fost activat.'}
              {' '}Vei fi redirecționat...
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
