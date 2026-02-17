import { useState } from 'react';
import { useNavigate, useLocation, Navigate, Link } from 'react-router-dom';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { useAuth } from '@/context/AuthContext';

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
  const { loginWithGoogle, isAuthenticated, loading, user } = useAuth();

  const [error, setError] = useState('');

  const from = (location.state as { from?: string })?.from;

  // While auth is resolving, show a spinner rather than flashing the login form
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // Already authenticated → redirect immediately
  if (isAuthenticated && user) {
    return <Navigate to={from || ROLE_HOME[user.role] || '/'} replace />;
  }

  const handleGoogleSuccess = async (response: CredentialResponse) => {
    if (!response.credential) {
      setError('Autentificarea Google a eșuat.');
      return;
    }
    setError('');
    try {
      const authUser = await loginWithGoogle(response.credential);
      navigate(from || ROLE_HOME[authUser.role] || '/', { replace: true });
    } catch {
      setError('Autentificarea a eșuat. Te rugăm să încerci din nou.');
    }
  };

  return (
    <div className="flex h-screen">
      {/* ── Left panel — decorative, desktop only ── */}
      <div className="hidden lg:flex lg:w-[45%] bg-primary flex-col justify-between p-12 relative overflow-hidden">
        {/* Blobs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full" />
        <div className="absolute -bottom-32 -right-12 w-80 h-80 bg-white/5 rounded-full" />
        <div className="absolute top-1/2 left-1/4 w-56 h-56 bg-secondary/20 rounded-full blur-3xl" />

        {/* Logo */}
        <Link to="/" className="relative z-10">
          <span className="text-2xl font-black text-white tracking-tight">
            HelpMe<span className="text-secondary">Clean</span>
          </span>
        </Link>

        {/* Central message */}
        <div className="relative z-10">
          <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-4">
            Platforma #1 de curățenie din România
          </p>
          <h2 className="text-4xl font-black text-white leading-tight mb-6">
            Casă curată,<br />fără bătăi de cap.
          </h2>
          <p className="text-white/70 text-base leading-relaxed max-w-xs">
            Conectăm clienții cu firme de curățenie verificate. Simplu, rapid, fără surprize.
          </p>
        </div>

        {/* Stats row */}
        <div className="relative z-10 flex gap-8">
          <div>
            <p className="text-3xl font-black text-white">500+</p>
            <p className="text-white/50 text-sm mt-0.5">rezervări</p>
          </div>
          <div>
            <p className="text-3xl font-black text-secondary">50+</p>
            <p className="text-white/50 text-sm mt-0.5">firme active</p>
          </div>
          <div>
            <p className="text-3xl font-black text-white">4.9★</p>
            <p className="text-white/50 text-sm mt-0.5">rating mediu</p>
          </div>
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Top bar */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
          {/* Mobile-only logo */}
          <Link to="/" className="lg:hidden">
            <span className="text-lg font-black text-gray-900 tracking-tight">
              HelpMe<span className="text-primary">Clean</span>
            </span>
          </Link>
          <div className="hidden lg:block" />
          <p className="text-sm text-gray-500">
            Ești firmă?{' '}
            <Link
              to="/inregistrare-firma"
              className="text-primary font-semibold hover:underline"
            >
              Înregistrează-te
            </Link>
          </p>
        </div>

        {/* Form — vertically centered */}
        <div className="flex-1 flex items-center justify-center px-8 py-12">
          <div className="w-full max-w-sm">
            <h1 className="text-3xl font-black text-gray-900 mb-2">
              Bine ai revenit!
            </h1>
            <p className="text-gray-500 mb-8 leading-relaxed">
              Conectează-te cu contul tău Google pentru a accesa platforma.
            </p>

            <div className="flex flex-col items-start gap-3">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Autentificarea Google a eșuat.')}
                useOneTap
                theme="outline"
                size="large"
                text="signin_with"
                shape="rectangular"
                width="360"
              />

              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}
            </div>

            <p className="mt-8 text-xs text-gray-400 leading-relaxed">
              Prin conectare ești de acord cu{' '}
              <span className="text-gray-500 font-medium">Termenii și condițiile</span>{' '}
              și{' '}
              <span className="text-gray-500 font-medium">Politica de confidențialitate</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
