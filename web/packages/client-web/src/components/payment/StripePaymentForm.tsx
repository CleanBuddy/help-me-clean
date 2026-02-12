import { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import Button from '@/components/ui/Button';
import { CreditCard, Loader2 } from 'lucide-react';

interface StripePaymentFormProps {
  amount: number;
  onSuccess: () => void;
  onError: (message: string) => void;
  returnUrl?: string;
}

export default function StripePaymentForm({
  amount,
  onSuccess,
  onError,
  returnUrl,
}: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: returnUrl || window.location.href,
      },
      redirect: 'if_required',
    });

    if (error) {
      onError(error.message || 'Plata a esuat. Incearca din nou.');
      setProcessing(false);
    } else {
      onSuccess();
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-blue-50 rounded-xl p-4 flex items-center justify-between">
        <span className="text-sm text-gray-600">Total de plata</span>
        <span className="text-xl font-bold text-gray-900">
          {(amount / 100).toFixed(2)} RON
        </span>
      </div>

      <PaymentElement
        options={{
          layout: 'tabs',
        }}
      />

      <Button
        type="submit"
        disabled={!stripe || processing}
        className="w-full"
        size="lg"
      >
        {processing ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Se proceseaza...
          </>
        ) : (
          <>
            <CreditCard className="h-5 w-5" />
            Plateste {(amount / 100).toFixed(2)} RON
          </>
        )}
      </Button>

      <p className="text-xs text-gray-400 text-center">
        Platile sunt procesate securizat prin Stripe.
      </p>
    </form>
  );
}
