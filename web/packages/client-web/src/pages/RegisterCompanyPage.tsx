import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { Building2, ArrowLeft, CheckCircle, Copy, Check } from 'lucide-react';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { useAuth } from '@/context/AuthContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { APPLY_AS_COMPANY, CLAIM_COMPANY } from '@/graphql/operations';

// ─── Component ───────────────────────────────────────────────────────────────

export default function RegisterCompanyPage() {
  const navigate = useNavigate();
  const { loginWithGoogle, loginDev, isAuthenticated } = useAuth();
  const [applyAsCompany, { loading }] = useMutation(APPLY_AS_COMPANY);
  const [claimCompany] = useMutation(CLAIM_COMPANY);

  const [submitted, setSubmitted] = useState(false);
  const [claimToken, setClaimToken] = useState<string | null>(null);
  const [claimed, setClaimed] = useState(false);
  const [claimError, setClaimError] = useState('');
  const [claimLoading, setClaimLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [devMode, setDevMode] = useState(false);
  const [devEmail, setDevEmail] = useState('');

  const [form, setForm] = useState({
    companyName: '',
    cui: '',
    companyType: '',
    legalRepresentative: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    city: '',
    county: '',
    description: '',
  });

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.companyName.trim() || !form.cui.trim() || !form.contactEmail.trim()) {
      setError('Te rugam sa completezi campurile obligatorii.');
      return;
    }

    try {
      const { data } = await applyAsCompany({
        variables: {
          input: form,
        },
      });
      setClaimToken(data?.applyAsCompany?.claimToken ?? null);
      setSubmitted(true);
    } catch {
      setError('Inregistrarea a esuat. Te rugam sa incerci din nou.');
    }
  };

  const handleClaimAfterAuth = async (token: string) => {
    if (!claimToken) return;
    setClaimLoading(true);
    setClaimError('');
    try {
      await claimCompany({
        variables: { claimToken },
        context: {
          headers: { Authorization: `Bearer ${token}` },
        },
      });
      setClaimed(true);
      setTimeout(() => navigate('/'), 1500);
    } catch {
      setClaimError('Nu am putut asocia firma cu contul tau. Poti incerca din dashboard.');
    } finally {
      setClaimLoading(false);
    }
  };

  const handleGoogleSuccess = async (response: CredentialResponse) => {
    if (!response.credential) {
      setClaimError('Autentificarea Google a esuat.');
      return;
    }
    setClaimError('');
    setClaimLoading(true);
    try {
      await loginWithGoogle(response.credential);
      const token = localStorage.getItem('token');
      if (token) {
        await handleClaimAfterAuth(token);
      }
    } catch {
      setClaimError('Autentificarea a esuat. Te rugam sa incerci din nou.');
      setClaimLoading(false);
    }
  };

  const handleDevClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!devEmail.trim()) return;
    setClaimError('');
    setClaimLoading(true);
    try {
      await loginDev(devEmail.trim());
      const token = localStorage.getItem('token');
      if (token) {
        await handleClaimAfterAuth(token);
      }
    } catch {
      setClaimError('Autentificarea a esuat. Te rugam sa incerci din nou.');
      setClaimLoading(false);
    }
  };

  const claimUrl = claimToken
    ? `${window.location.origin}/claim-firma/${claimToken}`
    : null;

  const handleCopyLink = async () => {
    if (!claimUrl) return;
    await navigator.clipboard.writeText(claimUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ─── Success Screen ─────────────────────────────────────────────────────────

  if (submitted) {
    // Already authenticated (or was authenticated when applying) — no need for claim flow
    if (isAuthenticated && !claimToken) {
      return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-[#FAFBFC]">
          <Card className="w-full max-w-md text-center">
            <CheckCircle className="h-16 w-16 text-secondary mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Cerere trimisa!
            </h1>
            <p className="text-gray-500 mb-6">
              Cererea ta de inregistrare a fost trimisa cu succes.
              Vei fi notificat prin email cand firma ta va fi aprobata.
            </p>
            <Button onClick={() => navigate('/')} className="w-full">
              Mergi la Dashboard
            </Button>
          </Card>
        </div>
      );
    }

    // Claimed successfully
    if (claimed) {
      return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-[#FAFBFC]">
          <Card className="w-full max-w-md text-center">
            <CheckCircle className="h-16 w-16 text-secondary mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Contul a fost asociat!
            </h1>
            <p className="text-gray-500 mb-6">
              Firma ta a fost asociata cu contul Google. Vei fi redirectionat catre dashboard...
            </p>
          </Card>
        </div>
      );
    }

    // Unauthenticated submission — prompt to sign in
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-[#FAFBFC]">
        <Card className="w-full max-w-lg text-center">
          <CheckCircle className="h-16 w-16 text-secondary mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Cerere trimisa cu succes!
          </h1>
          <p className="text-gray-500 mb-6">
            Conecteaza-te cu Google pentru a asocia aceasta cerere cu contul tau.
            Astfel vei putea urmari statusul cererii si gestiona firma din dashboard.
          </p>

          {claimLoading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : !devMode ? (
            <div className="flex flex-col items-center gap-4">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setClaimError('Autentificarea Google a esuat.')}
                theme="outline"
                size="large"
                text="signin_with"
                shape="rectangular"
                width="320"
              />
            </div>
          ) : (
            <form onSubmit={handleDevClaim} className="space-y-4">
              <Input
                label="Email (Dev Mode)"
                type="email"
                placeholder="admin@firma.ro"
                value={devEmail}
                onChange={(e) => setDevEmail(e.target.value)}
                autoFocus
              />
              <Button type="submit" loading={claimLoading} className="w-full">
                Conecteaza-te (Dev)
              </Button>
            </form>
          )}

          {import.meta.env.DEV && (
            <button
              type="button"
              onClick={() => { setDevMode(!devMode); setClaimError(''); }}
              className="mt-3 w-full text-center text-xs text-gray-400 hover:text-gray-600 underline"
            >
              {devMode ? 'Foloseste Google Auth' : 'Foloseste Dev Mode'}
            </button>
          )}

          {claimError && (
            <div className="mt-4 p-3 rounded-xl bg-red-50 text-sm text-red-700">
              {claimError}
            </div>
          )}

          {claimUrl && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-xs text-gray-400 mb-2">
                Sau salveaza acest link pentru a te conecta mai tarziu:
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={claimUrl}
                  className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600 truncate"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-secondary" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? 'Copiat' : 'Copiaza'}
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>
    );
  }

  // ─── Registration Form ────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen py-12 px-4 bg-[#FAFBFC]">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Inapoi
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Inregistreaza-ti firma
          </h1>
          <p className="text-gray-500">
            Completeaza datele firmei tale pentru a aplica ca partener HelpMeClean.
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="Nume firma *"
                placeholder="SC Firma SRL"
                value={form.companyName}
                onChange={(e) => updateField('companyName', e.target.value)}
              />
              <Input
                label="CUI *"
                placeholder="RO12345678"
                value={form.cui}
                onChange={(e) => updateField('cui', e.target.value)}
              />
              <Input
                label="Tip firma"
                placeholder="SRL / PFA / II"
                value={form.companyType}
                onChange={(e) => updateField('companyType', e.target.value)}
              />
              <Input
                label="Reprezentant legal"
                placeholder="Ion Popescu"
                value={form.legalRepresentative}
                onChange={(e) => updateField('legalRepresentative', e.target.value)}
              />
              <Input
                label="Email contact *"
                type="email"
                placeholder="contact@firma.ro"
                value={form.contactEmail}
                onChange={(e) => updateField('contactEmail', e.target.value)}
              />
              <Input
                label="Telefon contact"
                placeholder="+40 7XX XXX XXX"
                value={form.contactPhone}
                onChange={(e) => updateField('contactPhone', e.target.value)}
              />
            </div>

            <Input
              label="Adresa"
              placeholder="Str. Exemplu, Nr. 1"
              value={form.address}
              onChange={(e) => updateField('address', e.target.value)}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="Oras"
                placeholder="Bucuresti"
                value={form.city}
                onChange={(e) => updateField('city', e.target.value)}
              />
              <Input
                label="Judet"
                placeholder="Ilfov"
                value={form.county}
                onChange={(e) => updateField('county', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Descriere firma
              </label>
              <textarea
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                rows={4}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                placeholder="Descrierea firmei tale si a serviciilor oferite..."
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 text-sm text-red-700">
                {error}
              </div>
            )}

            <Button type="submit" loading={loading} className="w-full" size="lg">
              Trimite cererea de inregistrare
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
