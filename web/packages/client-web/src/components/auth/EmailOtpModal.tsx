import { useState } from 'react';
import { Mail } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import type { AuthUser } from '@/services/AuthService';

// ─── Types ────────────────────────────────────────────────────────────────────

interface EmailOtpModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (user: AuthUser) => void;
  role?: string;
  title?: string;
}

type Step = 'email' | 'code';

// ─── Component ───────────────────────────────────────────────────────────────

export default function EmailOtpModal({
  open,
  onClose,
  onSuccess,
  role = 'CLIENT',
  title = 'Autentificare prin email',
}: EmailOtpModalProps) {
  const { requestEmailOtp, loginWithEmailOtp } = useAuth();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [devCode, setDevCode] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClose = () => {
    setStep('email');
    setEmail('');
    setCode('');
    setDevCode(undefined);
    setError('');
    onClose();
  };

  const handleRequestCode = async () => {
    if (!email.trim()) {
      setError('Introdu adresa de email.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const result = await requestEmailOtp(email.trim(), role);
      setDevCode(result.devCode);
      setStep('code');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'A apărut o eroare. Încearcă din nou.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (code.trim().length !== 6) {
      setError('Codul trebuie să aibă exact 6 cifre.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const user = await loginWithEmailOtp(email.trim(), code.trim(), role);
      handleClose();
      onSuccess(user);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Cod invalid sau expirat.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title={title} className="max-w-sm">
      {step === 'email' ? (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-500">
            Introdu adresa ta de email și îți trimitem un cod de verificare.
          </p>
          <Input
            label="Adresă email"
            type="email"
            placeholder="exemplu@email.ro"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRequestCode()}
            error={error}
            autoFocus
          />
          <Button onClick={handleRequestCode} disabled={loading} className="w-full">
            <Mail className="h-4 w-4 mr-2" />
            {loading ? 'Se trimite...' : 'Trimite codul'}
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-500">
            Am trimis un cod de 6 cifre la <strong>{email}</strong>.
          </p>

          {/* Dev-mode hint: shows OTP code when SMTP is not configured */}
          {devCode && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm">
              <span className="font-semibold text-amber-700">Dev — cod OTP: </span>
              <span className="font-mono font-black text-amber-900 tracking-widest">{devCode}</span>
            </div>
          )}

          <Input
            label="Cod de verificare"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            placeholder="123456"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            onKeyDown={(e) => e.key === 'Enter' && handleVerifyCode()}
            error={error}
            autoFocus
          />
          <Button onClick={handleVerifyCode} disabled={loading} className="w-full">
            {loading ? 'Se verifică...' : 'Verifică codul'}
          </Button>
          <button
            type="button"
            onClick={() => { setStep('email'); setCode(''); setError(''); }}
            className="text-sm text-gray-400 hover:text-primary transition text-center"
          >
            Schimbă adresa de email
          </button>
        </div>
      )}
    </Modal>
  );
}
