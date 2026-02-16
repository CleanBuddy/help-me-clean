import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { useAuth } from '@/context/AuthContext';
import Card from '@/components/ui/Card';

// ─── Constants ────────────────────────────────────────────────────────────────

const ROLE_HOME: Record<string, string> = {
  CLIENT: '/cont',
  COMPANY_ADMIN: '/firma',
  CLEANER: '/worker',
  GLOBAL_ADMIN: '/admin',
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithGoogle, isAuthenticated, user } = useAuth();

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
    try {
      const authUser = await loginWithGoogle(response.credential);
      navigate(from || ROLE_HOME[authUser.role] || '/', { replace: true });
    } catch {
      setError('Autentificarea a esuat. Te rugam sa incerci din nou.');
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
            <LogIn className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Autentificare
          </h1>
          <p className="text-gray-500">
            Conecteaza-te cu Google pentru a accesa contul tau.
          </p>
        </div>

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
        </Card>
      </div>
    </div>
  );
}
