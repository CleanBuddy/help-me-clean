import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { Building2, CheckCircle, AlertCircle, Mail } from 'lucide-react';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { useAuth } from '@/context/AuthContext';
import { authService, type AuthUser } from '@/services/AuthService';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import EmailOtpModal from '@/components/auth/EmailOtpModal';
import { CLAIM_COMPANY } from '@/graphql/operations';

export default function ClaimCompanyPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { loginWithGoogle, isAuthenticated, refreshToken, refetchUser } = useAuth();
  const [claimCompany] = useMutation(CLAIM_COMPANY);

  const [claimed, setClaimed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);

  // If the user is already authenticated, attempt to claim immediately.
  useEffect(() => {
    if (isAuthenticated && token && !claimed) {
      handleClaim();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const handleClaim = async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      await claimCompany({ variables: { claimToken: token } });

      // Refresh token to get updated JWT with COMPANY_ADMIN role
      await refreshToken();

      // Refetch user data to update UI
      await refetchUser();

      setClaimed(true);
      setTimeout(() => navigate('/firma'), 1500);
    } catch {
      setError('Link-ul este invalid sau firma a fost deja revendicata.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSuccess = async (_user: AuthUser) => {
    setError('');
    setLoading(true);
    try {
      const jwtToken = authService.getToken();
      if (jwtToken && token) {
        await claimCompany({
          variables: { claimToken: token },
          context: { headers: { Authorization: `Bearer ${jwtToken}` } },
        });
        await refreshToken();
        await refetchUser();
        setClaimed(true);
        setTimeout(() => navigate('/firma'), 1500);
      }
    } catch {
      setError('Revendicarea a esuat. Te rugam sa incerci din nou.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (response: CredentialResponse) => {
    if (!response.credential) {
      setError('Autentificarea Google a esuat.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle(response.credential);
      // After login, the useEffect will trigger handleClaim.
      // But since state may not update synchronously, also claim directly.
      const jwtToken = authService.getToken();
      if (jwtToken && token) {
        await claimCompany({
          variables: { claimToken: token },
          context: { headers: { Authorization: `Bearer ${jwtToken}` } },
        });

        // Refresh token to get updated JWT with COMPANY_ADMIN role
        await refreshToken();

        // Refetch user data to update UI
        await refetchUser();

        setClaimed(true);
        setTimeout(() => navigate('/firma'), 1500);
      }
    } catch {
      setError('Autentificarea a esuat. Te rugam sa incerci din nou.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Link invalid</h1>
          <p className="text-gray-500 mb-6">Acest link de revendicare nu este valid.</p>
          <Button onClick={() => navigate('/autentificare')} className="w-full">
            Mergi la autentificare
          </Button>
        </Card>
      </div>
    );
  }

  if (claimed) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md text-center">
          <CheckCircle className="h-16 w-16 text-secondary mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Firma a fost asociata!
          </h1>
          <p className="text-gray-500 mb-6">
            Contul tau a fost asociat cu firma. Vei fi redirectionat catre dashboard...
          </p>
        </Card>
      </div>
    );
  }

  if (isAuthenticated && loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-gray-500">Se asociaza firma cu contul tau...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Revendica firma
          </h1>
          <p className="text-gray-500">
            Conecteaza-te cu Google pentru a asocia firma cu contul tau.
          </p>
        </div>

        <Card>
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Autentificarea Google a esuat.')}
                theme="outline"
                size="large"
                text="signin_with"
                shape="rectangular"
                width="320"
              />

              {/* Divider */}
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
          )}

          {error && (
            <div className="mt-4 p-3 rounded-xl bg-red-50 text-sm text-red-700">
              {error}
            </div>
          )}
        </Card>

        <EmailOtpModal
          open={showOtpModal}
          onClose={() => setShowOtpModal(false)}
          onSuccess={handleOtpSuccess}
          role="COMPANY_ADMIN"
          title="Revendică firma cu email"
        />
      </div>
    </div>
  );
}
