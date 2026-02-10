import { useState, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useLazyQuery, useMutation } from '@apollo/client';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import {
  Check,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Home,
  Calendar,
  MapPin,
  ClipboardList,
  PawPrint,
  Plus,
  Minus,
  CheckCircle2,
  ArrowRight,
  LogIn,
} from 'lucide-react';
import { cn } from '@helpmeclean/shared';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import AddressAutocomplete, { type ParsedAddress } from '@/components/ui/AddressAutocomplete';
import {
  AVAILABLE_SERVICES,
  AVAILABLE_EXTRAS,
  ESTIMATE_PRICE,
  CREATE_BOOKING_REQUEST,
  MY_ADDRESSES,
} from '@/graphql/operations';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ServiceDefinition {
  id: string;
  serviceType: string;
  nameRo: string;
  descriptionRo: string;
  basePricePerHour: number;
  minHours: number;
  icon: string;
}

interface ExtraDefinition {
  id: string;
  nameRo: string;
  nameEn: string;
  price: number;
  icon: string;
}

interface SavedAddress {
  id: string;
  label?: string;
  streetAddress: string;
  city: string;
  county: string;
  floor?: string;
  apartment?: string;
  coordinates?: { latitude: number; longitude: number } | null;
  isDefault: boolean;
}

interface PriceEstimate {
  hourlyRate: number;
  estimatedHours: number;
  subtotal: number;
  extras: {
    extra: { nameRo: string; price: number };
    quantity: number;
    lineTotal: number;
  }[];
  total: number;
}

interface SelectedExtra {
  extraId: string;
  quantity: number;
}

interface BookingFormState {
  // Step 1
  serviceType: string;
  // Step 2
  numRooms: number;
  numBathrooms: number;
  areaSqm: string;
  hasPets: boolean;
  propertyType: string;
  extras: SelectedExtra[];
  // Step 3
  scheduledDate: string;
  scheduledStartTime: string;
  // Step 4
  streetAddress: string;
  city: string;
  county: string;
  floor: string;
  apartment: string;
  latitude: number | null;
  longitude: number | null;
  useSavedAddress: string;
  // Step 5
  specialInstructions: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const STEPS = [
  { key: 'service', label: 'Serviciu', icon: Sparkles },
  { key: 'details', label: 'Detalii', icon: Home },
  { key: 'schedule', label: 'Programare', icon: Calendar },
  { key: 'address', label: 'Adresa', icon: MapPin },
  { key: 'summary', label: 'Sumar', icon: ClipboardList },
] as const;

const PROPERTY_TYPES = [
  { value: 'Apartament', label: 'Apartament' },
  { value: 'Casa', label: 'Casa' },
  { value: 'Birou', label: 'Birou' },
];

const SERVICE_ICONS: Record<string, string> = {
  STANDARD_CLEANING: '🏠',
  DEEP_CLEANING: '✨',
  OFFICE_CLEANING: '🏢',
  POST_CONSTRUCTION: '🔨',
  MOVE_IN_OUT_CLEANING: '📦',
  WINDOW_CLEANING: '🪟',
};

const TIME_SLOTS = Array.from({ length: 21 }, (_, i) => {
  const hours = Math.floor(i / 2) + 8;
  const minutes = i % 2 === 0 ? '00' : '30';
  const value = `${String(hours).padStart(2, '0')}:${minutes}`;
  return { value, label: value };
});

const ROMANIAN_COUNTIES = [
  'Alba', 'Arad', 'Arges', 'Bacau', 'Bihor', 'Bistrita-Nasaud',
  'Botosani', 'Brasov', 'Braila', 'Bucuresti', 'Buzau', 'Caras-Severin',
  'Calarasi', 'Cluj', 'Constanta', 'Covasna', 'Dambovita', 'Dolj',
  'Galati', 'Giurgiu', 'Gorj', 'Harghita', 'Hunedoara', 'Ialomita',
  'Iasi', 'Ilfov', 'Maramures', 'Mehedinti', 'Mures', 'Neamt',
  'Olt', 'Prahova', 'Satu Mare', 'Salaj', 'Sibiu', 'Suceava',
  'Teleorman', 'Timis', 'Tulcea', 'Vaslui', 'Valcea', 'Vrancea',
].map((c) => ({ value: c, label: c }));

function getMinDate(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function BookingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, loginWithGoogle, loginDev } = useAuth();

  const preselectedService = searchParams.get('service') || '';

  const [currentStep, setCurrentStep] = useState(preselectedService ? 1 : 0);
  const [bookingResult, setBookingResult] = useState<{
    referenceCode: string;
    id: string;
  } | null>(null);

  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [devAuthMode, setDevAuthMode] = useState(false);
  const [devAuthEmail, setDevAuthEmail] = useState('');

  const [form, setForm] = useState<BookingFormState>({
    serviceType: preselectedService,
    numRooms: 2,
    numBathrooms: 1,
    areaSqm: '',
    hasPets: false,
    propertyType: 'Apartament',
    extras: [],
    scheduledDate: '',
    scheduledStartTime: '',
    streetAddress: '',
    city: '',
    county: '',
    floor: '',
    apartment: '',
    latitude: null,
    longitude: null,
    useSavedAddress: '',
    specialInstructions: '',
  });

  // ─── Data fetching ───────────────────────────────────────────────────────

  const { data: servicesData, loading: servicesLoading } =
    useQuery(AVAILABLE_SERVICES);

  const { data: extrasData } = useQuery(AVAILABLE_EXTRAS);

  const { data: addressesData } = useQuery<{ myAddresses: SavedAddress[] }>(
    MY_ADDRESSES,
    { skip: !isAuthenticated },
  );

  const [fetchEstimate, { data: estimateData, loading: estimateLoading }] =
    useLazyQuery<{ estimatePrice: PriceEstimate }>(ESTIMATE_PRICE, {
      fetchPolicy: 'network-only',
    });

  const [createBooking, { loading: creating }] = useMutation(
    CREATE_BOOKING_REQUEST,
  );

  const services: ServiceDefinition[] =
    servicesData?.availableServices ?? [];
  const extras: ExtraDefinition[] = extrasData?.availableExtras ?? [];
  const savedAddresses: SavedAddress[] = addressesData?.myAddresses ?? [];
  const estimate = estimateData?.estimatePrice;

  // ─── Helpers ─────────────────────────────────────────────────────────────

  const updateForm = useCallback(
    (updates: Partial<BookingFormState>) => {
      setForm((prev) => ({ ...prev, ...updates }));
    },
    [],
  );

  const selectedService = useMemo(
    () => services.find((s) => s.serviceType === form.serviceType),
    [services, form.serviceType],
  );

  const canProceed = useMemo(() => {
    switch (currentStep) {
      case 0:
        return !!form.serviceType;
      case 1:
        return form.numRooms >= 1 && form.numBathrooms >= 1;
      case 2:
        return !!form.scheduledDate && !!form.scheduledStartTime;
      case 3:
        return (
          !!form.streetAddress.trim() &&
          !!form.city.trim() &&
          !!form.county.trim()
        );
      case 4:
        return isAuthenticated;
      default:
        return false;
    }
  }, [currentStep, form, isAuthenticated]);

  const handleNext = useCallback(() => {
    if (currentStep < STEPS.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);

      // Fetch estimate when entering summary step
      if (nextStep === 4 && form.serviceType) {
        fetchEstimate({
          variables: {
            input: {
              serviceType: form.serviceType,
              numRooms: form.numRooms,
              numBathrooms: form.numBathrooms,
              areaSqm: form.areaSqm ? parseInt(form.areaSqm, 10) : undefined,
              extras: form.extras.filter((e) => e.quantity > 0),
            },
          },
        });
      }
    }
  }, [currentStep, form, fetchEstimate]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const handleSelectSavedAddress = useCallback(
    (addressId: string) => {
      const addr = savedAddresses.find((a) => a.id === addressId);
      if (addr) {
        updateForm({
          useSavedAddress: addressId,
          streetAddress: addr.streetAddress,
          city: addr.city,
          county: addr.county,
          floor: addr.floor || '',
          apartment: addr.apartment || '',
          latitude: addr.coordinates?.latitude ?? null,
          longitude: addr.coordinates?.longitude ?? null,
        });
      }
    },
    [savedAddresses, updateForm],
  );

  const handleToggleExtra = useCallback(
    (extraId: string, delta: number) => {
      setForm((prev) => {
        const existing = prev.extras.find((e) => e.extraId === extraId);
        if (existing) {
          const newQty = Math.max(0, existing.quantity + delta);
          if (newQty === 0) {
            return {
              ...prev,
              extras: prev.extras.filter((e) => e.extraId !== extraId),
            };
          }
          return {
            ...prev,
            extras: prev.extras.map((e) =>
              e.extraId === extraId ? { ...e, quantity: newQty } : e,
            ),
          };
        }
        if (delta > 0) {
          return {
            ...prev,
            extras: [...prev.extras, { extraId, quantity: 1 }],
          };
        }
        return prev;
      });
    },
    [],
  );

  const handleSubmitBooking = useCallback(async () => {
    try {
      const input: Record<string, unknown> = {
        serviceType: form.serviceType,
        scheduledDate: form.scheduledDate,
        scheduledStartTime: form.scheduledStartTime,
        propertyType: form.propertyType || undefined,
        numRooms: form.numRooms,
        numBathrooms: form.numBathrooms,
        areaSqm: form.areaSqm ? parseInt(form.areaSqm, 10) : undefined,
        hasPets: form.hasPets,
        specialInstructions: form.specialInstructions || undefined,
        extras: form.extras.filter((e) => e.quantity > 0) || undefined,
      };

      if (form.useSavedAddress) {
        // Reuse existing saved address — no duplication.
        input.addressId = form.useSavedAddress;
      } else {
        // Create a new address with lat/lng from autocomplete.
        input.address = {
          streetAddress: form.streetAddress,
          city: form.city,
          county: form.county,
          floor: form.floor || undefined,
          apartment: form.apartment || undefined,
          latitude: form.latitude,
          longitude: form.longitude,
        };
      }

      const { data } = await createBooking({ variables: { input } });
      setBookingResult({
        referenceCode: data.createBookingRequest.referenceCode,
        id: data.createBookingRequest.id,
      });
    } catch (err) {
      console.error('Booking creation failed:', err);
    }
  }, [form, createBooking]);

  // ─── Auth handlers (for summary step) ────────────────────────────────────

  const handleBookingGoogleSuccess = useCallback(
    async (response: CredentialResponse) => {
      if (!response.credential) {
        setAuthError('Autentificarea Google a esuat.');
        return;
      }
      setAuthError('');
      setAuthLoading(true);
      try {
        await loginWithGoogle(response.credential);
      } catch {
        setAuthError('Autentificarea a esuat. Te rugam sa incerci din nou.');
      } finally {
        setAuthLoading(false);
      }
    },
    [loginWithGoogle],
  );

  const handleBookingDevLogin = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!devAuthEmail.trim()) return;
      setAuthError('');
      setAuthLoading(true);
      try {
        await loginDev(devAuthEmail.trim());
      } catch {
        setAuthError('Autentificarea a esuat. Te rugam sa incerci din nou.');
      } finally {
        setAuthLoading(false);
      }
    },
    [devAuthEmail, loginDev],
  );

  // ─── Success screen ──────────────────────────────────────────────────────

  if (bookingResult) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10 text-secondary" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Rezervare confirmata!
          </h1>
          <p className="text-gray-500 mb-2">
            Comanda ta a fost plasata cu succes.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 text-lg font-mono font-semibold text-gray-900 mb-8">
            {bookingResult.referenceCode}
          </div>
          <p className="text-sm text-gray-400 mb-8">
            Vei fi notificat cand o firma de curatenie accepta cererea ta.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {isAuthenticated && (
              <Button onClick={() => navigate('/cont/comenzi')}>
                Vezi comenzile mele
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
            <Button variant="outline" onClick={() => navigate('/')}>
              Inapoi la pagina principala
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="py-10 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Page title */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Rezerva o curatenie
          </h1>
          <p className="text-gray-500">
            Completeaza detaliile si plaseaza comanda in cateva minute.
          </p>
        </div>

        {/* Step indicator */}
        <StepIndicator currentStep={currentStep} />

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            {/* Step 0: Service */}
            {currentStep === 0 && (
              <StepService
                services={services}
                loading={servicesLoading}
                selected={form.serviceType}
                onSelect={(type) => updateForm({ serviceType: type })}
              />
            )}

            {/* Step 1: Details */}
            {currentStep === 1 && (
              <StepDetails
                form={form}
                updateForm={updateForm}
                extras={extras}
                selectedExtras={form.extras}
                onToggleExtra={handleToggleExtra}
              />
            )}

            {/* Step 2: Schedule */}
            {currentStep === 2 && (
              <StepSchedule form={form} updateForm={updateForm} />
            )}

            {/* Step 3: Address */}
            {currentStep === 3 && (
              <StepAddress
                form={form}
                updateForm={updateForm}
                savedAddresses={savedAddresses}
                isAuthenticated={isAuthenticated}
                onSelectSaved={handleSelectSavedAddress}
              />
            )}

            {/* Step 4: Summary */}
            {currentStep === 4 && (
              <StepSummary
                form={form}
                updateForm={updateForm}
                selectedService={selectedService}
                estimate={estimate}
                estimateLoading={estimateLoading}
                extras={extras}
              />
            )}

            {/* Auth gate on summary step */}
            {currentStep === 4 && !isAuthenticated && (
              <Card className="mt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <LogIn className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Autentificare necesara
                    </h3>
                    <p className="text-sm text-gray-500">
                      Pentru a finaliza rezervarea, te rugam sa te autentifici.
                    </p>
                  </div>
                </div>

                {authLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                  </div>
                ) : !devAuthMode ? (
                  <div className="flex flex-col items-center gap-4">
                    <GoogleLogin
                      onSuccess={handleBookingGoogleSuccess}
                      onError={() => setAuthError('Autentificarea Google a esuat.')}
                      theme="outline"
                      size="large"
                      text="signin_with"
                      shape="rectangular"
                      width="320"
                    />
                  </div>
                ) : (
                  <form onSubmit={handleBookingDevLogin} className="space-y-4">
                    <Input
                      label="Adresa de email (Dev Mode)"
                      type="email"
                      placeholder="exemplu@email.com"
                      value={devAuthEmail}
                      onChange={(e) => setDevAuthEmail(e.target.value)}
                      autoFocus
                    />
                    <Button type="submit" loading={authLoading} className="w-full" size="lg">
                      Conecteaza-te (Dev)
                    </Button>
                  </form>
                )}

                {import.meta.env.DEV && (
                  <button
                    type="button"
                    onClick={() => { setDevAuthMode(!devAuthMode); setAuthError(''); }}
                    className="mt-4 w-full text-center text-xs text-gray-400 hover:text-gray-600 underline cursor-pointer"
                  >
                    {devAuthMode ? 'Foloseste Google Auth' : 'Foloseste Dev Mode'}
                  </button>
                )}

                {authError && (
                  <div className="mt-4 p-3 rounded-xl bg-red-50 text-sm text-red-700">
                    {authError}
                  </div>
                )}
              </Card>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              {currentStep > 0 ? (
                <Button variant="ghost" onClick={handleBack}>
                  <ChevronLeft className="h-4 w-4" />
                  Inapoi
                </Button>
              ) : (
                <div />
              )}

              {currentStep < STEPS.length - 1 ? (
                <Button onClick={handleNext} disabled={!canProceed}>
                  Continua
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmitBooking}
                  loading={creating}
                  disabled={!canProceed}
                  size="lg"
                >
                  Confirma rezervarea
                  <Check className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>

          {/* Sidebar: Price estimate */}
          <div className="hidden lg:block">
            <PriceSidebar
              form={form}
              selectedService={selectedService}
              extras={extras}
              estimate={estimate}
              estimateLoading={estimateLoading}
              fetchEstimate={fetchEstimate}
            />
          </div>
        </div>

        {/* Mobile price footer */}
        <MobilePriceFooter
          form={form}
          selectedService={selectedService}
          estimate={estimate}
        />
      </div>
    </div>
  );
}

// ─── Step Indicator ──────────────────────────────────────────────────────────

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2">
      {STEPS.map((step, index) => {
        const StepIcon = step.icon;
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;

        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center transition-colors',
                  isCompleted && 'bg-secondary text-white',
                  isCurrent && 'bg-primary text-white',
                  !isCompleted &&
                    !isCurrent &&
                    'bg-gray-100 text-gray-400',
                )}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <StepIcon className="h-5 w-5" />
                )}
              </div>
              <span
                className={cn(
                  'text-xs mt-1.5 font-medium hidden sm:block',
                  isCurrent ? 'text-primary' : 'text-gray-400',
                )}
              >
                {step.label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={cn(
                  'w-6 sm:w-10 h-0.5 mx-1 sm:mx-2 rounded-full mb-5 sm:mb-5',
                  index < currentStep ? 'bg-secondary' : 'bg-gray-200',
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Step 0: Service Selection ───────────────────────────────────────────────

function StepService({
  services,
  loading,
  selected,
  onSelect,
}: {
  services: ServiceDefinition[];
  loading: boolean;
  selected: string;
  onSelect: (type: string) => void;
}) {
  if (loading) {
    return <LoadingSpinner text="Se incarca serviciile..." />;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Alege tipul de serviciu
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Selecteaza serviciul de curatenie de care ai nevoie.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {services.map((service) => (
          <Card
            key={service.id}
            className={cn(
              'cursor-pointer transition-all',
              selected === service.serviceType
                ? 'ring-2 ring-primary border-primary shadow-md'
                : 'hover:shadow-md hover:border-gray-300',
            )}
            onClick={() => onSelect(service.serviceType)}
          >
            <div className="flex items-start gap-3">
              <div className="text-3xl">
                {SERVICE_ICONS[service.serviceType] || service.icon || '🧹'}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900">
                  {service.nameRo}
                </h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {service.descriptionRo}
                </p>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-lg font-bold text-primary">
                    {service.basePricePerHour} lei
                  </span>
                  <span className="text-xs text-gray-400">/ora</span>
                  <span className="text-xs text-gray-400 ml-2">
                    (min. {service.minHours} ore)
                  </span>
                </div>
              </div>
              {selected === service.serviceType && (
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <Check className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── Step 1: Property Details ────────────────────────────────────────────────

function StepDetails({
  form,
  updateForm,
  extras,
  selectedExtras,
  onToggleExtra,
}: {
  form: BookingFormState;
  updateForm: (updates: Partial<BookingFormState>) => void;
  extras: ExtraDefinition[];
  selectedExtras: SelectedExtra[];
  onToggleExtra: (extraId: string, delta: number) => void;
}) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Detalii proprietate
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Spune-ne mai multe despre spatiul care trebuie curatat.
      </p>

      <Card className="space-y-5">
        <Select
          label="Tip proprietate"
          options={PROPERTY_TYPES}
          value={form.propertyType}
          onChange={(e) => updateForm({ propertyType: e.target.value })}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Number of rooms */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Numar camere
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  updateForm({
                    numRooms: Math.max(1, form.numRooms - 1),
                  })
                }
                className="w-10 h-10 rounded-xl border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition cursor-pointer"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="text-lg font-semibold text-gray-900 w-8 text-center">
                {form.numRooms}
              </span>
              <button
                type="button"
                onClick={() =>
                  updateForm({
                    numRooms: Math.min(10, form.numRooms + 1),
                  })
                }
                className="w-10 h-10 rounded-xl border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition cursor-pointer"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Number of bathrooms */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Numar bai
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  updateForm({
                    numBathrooms: Math.max(1, form.numBathrooms - 1),
                  })
                }
                className="w-10 h-10 rounded-xl border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition cursor-pointer"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="text-lg font-semibold text-gray-900 w-8 text-center">
                {form.numBathrooms}
              </span>
              <button
                type="button"
                onClick={() =>
                  updateForm({
                    numBathrooms: Math.min(5, form.numBathrooms + 1),
                  })
                }
                className="w-10 h-10 rounded-xl border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition cursor-pointer"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <Input
          label="Suprafata (mp) - optional"
          type="number"
          placeholder="ex: 75"
          value={form.areaSqm}
          onChange={(e) => updateForm({ areaSqm: e.target.value })}
          min={1}
        />

        {/* Pets */}
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.hasPets}
            onChange={(e) => updateForm({ hasPets: e.target.checked })}
            className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary/30 cursor-pointer"
          />
          <PawPrint className="h-5 w-5 text-gray-400" />
          <span className="text-sm text-gray-700">
            Am animale de companie
          </span>
        </label>
      </Card>

      {/* Extras */}
      {extras.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Servicii extra
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Adauga servicii suplimentare la rezervarea ta.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {extras.map((extra) => {
              const sel = selectedExtras.find(
                (e) => e.extraId === extra.id,
              );
              const qty = sel?.quantity ?? 0;

              return (
                <Card
                  key={extra.id}
                  className={cn(
                    'transition-all',
                    qty > 0 && 'ring-1 ring-primary/30 border-primary/30',
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xl">
                        {extra.icon || '✨'}
                      </span>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {extra.nameRo}
                        </div>
                        <div className="text-sm text-primary font-semibold">
                          +{extra.price} lei
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {qty > 0 && (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              onToggleExtra(extra.id, -1)
                            }
                            className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition cursor-pointer"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-sm font-semibold w-4 text-center">
                            {qty}
                          </span>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => onToggleExtra(extra.id, 1)}
                        className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition cursor-pointer"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Step 2: Schedule ────────────────────────────────────────────────────────

function StepSchedule({
  form,
  updateForm,
}: {
  form: BookingFormState;
  updateForm: (updates: Partial<BookingFormState>) => void;
}) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Alege data si ora
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Selecteaza ziua si intervalul orar dorit.
      </p>

      <Card className="space-y-5">
        <Input
          label="Data"
          type="date"
          min={getMinDate()}
          value={form.scheduledDate}
          onChange={(e) => updateForm({ scheduledDate: e.target.value })}
        />

        <Select
          label="Ora de inceput"
          placeholder="Alege ora"
          options={TIME_SLOTS}
          value={form.scheduledStartTime}
          onChange={(e) =>
            updateForm({ scheduledStartTime: e.target.value })
          }
        />
      </Card>
    </div>
  );
}

// ─── Step 3: Address ─────────────────────────────────────────────────────────

function StepAddress({
  form,
  updateForm,
  savedAddresses,
  isAuthenticated,
  onSelectSaved,
}: {
  form: BookingFormState;
  updateForm: (updates: Partial<BookingFormState>) => void;
  savedAddresses: SavedAddress[];
  isAuthenticated: boolean;
  onSelectSaved: (id: string) => void;
}) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Adresa de curatenie
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Unde doresti sa fie efectuata curatenia?
      </p>

      {/* Saved addresses */}
      {isAuthenticated && savedAddresses.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Adrese salvate
          </h3>
          <div className="space-y-2">
            {savedAddresses.map((addr) => (
              <Card
                key={addr.id}
                className={cn(
                  'cursor-pointer transition-all',
                  form.useSavedAddress === addr.id
                    ? 'ring-2 ring-primary border-primary'
                    : 'hover:border-gray-300',
                )}
                onClick={() => onSelectSaved(addr.id)}
              >
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-gray-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900">
                      {addr.label || addr.streetAddress}
                      {addr.isDefault && (
                        <span className="ml-2 text-xs text-secondary font-semibold">
                          Implicita
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {addr.streetAddress}, {addr.city}, {addr.county}
                    </div>
                  </div>
                  {form.useSavedAddress === addr.id && (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#FAFBFC] px-4 text-sm text-gray-400">
                sau introdu o adresa noua
              </span>
            </div>
          </div>
        </div>
      )}

      <Card className="space-y-5">
        <AddressAutocomplete
          label="Strada si numar"
          placeholder="Cauta adresa sau scrie manual..."
          value={form.streetAddress}
          onChange={(val) => {
            updateForm({
              streetAddress: val,
              useSavedAddress: '',
            });
          }}
          onAddressSelect={(parsed: ParsedAddress) => {
            updateForm({
              streetAddress: parsed.streetAddress,
              city: parsed.city,
              county: parsed.county,
              latitude: parsed.latitude,
              longitude: parsed.longitude,
              useSavedAddress: '',
            });
          }}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Input
            label="Oras"
            placeholder="ex: Bucuresti"
            value={form.city}
            onChange={(e) => {
              updateForm({ city: e.target.value, useSavedAddress: '' });
            }}
          />
          <Select
            label="Judet"
            placeholder="Alege judetul"
            options={ROMANIAN_COUNTIES}
            value={form.county}
            onChange={(e) => {
              updateForm({ county: e.target.value, useSavedAddress: '' });
            }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Input
            label="Etaj (optional)"
            placeholder="ex: 3"
            value={form.floor}
            onChange={(e) => updateForm({ floor: e.target.value })}
          />
          <Input
            label="Apartament (optional)"
            placeholder="ex: 12B"
            value={form.apartment}
            onChange={(e) => updateForm({ apartment: e.target.value })}
          />
        </div>
      </Card>
    </div>
  );
}

// ─── Step 4: Summary ─────────────────────────────────────────────────────────

function StepSummary({
  form,
  updateForm,
  selectedService,
  estimate,
  estimateLoading,
  extras,
}: {
  form: BookingFormState;
  updateForm: (updates: Partial<BookingFormState>) => void;
  selectedService?: ServiceDefinition;
  estimate?: PriceEstimate;
  estimateLoading: boolean;
  extras: ExtraDefinition[];
}) {
  const selectedExtraNames = form.extras
    .filter((e) => e.quantity > 0)
    .map((e) => {
      const extra = extras.find((x) => x.id === e.extraId);
      return extra ? `${extra.nameRo} x${e.quantity}` : '';
    })
    .filter(Boolean);

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Sumar si confirmare
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Verifica detaliile inainte de a confirma rezervarea.
      </p>

      <div className="space-y-4">
        {/* Service summary */}
        <Card>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Serviciu
          </h3>
          <div className="text-lg font-semibold text-gray-900">
            {selectedService?.nameRo || form.serviceType}
          </div>
        </Card>

        {/* Property summary */}
        <Card>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Proprietate
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500">Tip:</span>{' '}
              <span className="font-medium text-gray-900">
                {form.propertyType}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Camere:</span>{' '}
              <span className="font-medium text-gray-900">
                {form.numRooms}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Bai:</span>{' '}
              <span className="font-medium text-gray-900">
                {form.numBathrooms}
              </span>
            </div>
            {form.areaSqm && (
              <div>
                <span className="text-gray-500">Suprafata:</span>{' '}
                <span className="font-medium text-gray-900">
                  {form.areaSqm} mp
                </span>
              </div>
            )}
            {form.hasPets && (
              <div>
                <span className="text-gray-500">Animale:</span>{' '}
                <span className="font-medium text-gray-900">Da</span>
              </div>
            )}
          </div>
          {selectedExtraNames.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <span className="text-sm text-gray-500">Extra: </span>
              <span className="text-sm font-medium text-gray-900">
                {selectedExtraNames.join(', ')}
              </span>
            </div>
          )}
        </Card>

        {/* Schedule summary */}
        <Card>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Programare
          </h3>
          <div className="flex gap-6 text-sm">
            <div>
              <span className="text-gray-500">Data:</span>{' '}
              <span className="font-medium text-gray-900">
                {form.scheduledDate}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Ora:</span>{' '}
              <span className="font-medium text-gray-900">
                {form.scheduledStartTime}
              </span>
            </div>
          </div>
        </Card>

        {/* Address summary */}
        <Card>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Adresa
          </h3>
          <div className="text-sm text-gray-900">
            {form.streetAddress}
            {form.floor && `, Etaj ${form.floor}`}
            {form.apartment && `, Ap. ${form.apartment}`}
            <br />
            {form.city}, {form.county}
          </div>
        </Card>

        {/* Price estimate */}
        <Card>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Estimare pret
          </h3>
          {estimateLoading ? (
            <LoadingSpinner size="sm" text="Se calculeaza pretul..." />
          ) : estimate ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>
                  {estimate.hourlyRate} lei/ora x {estimate.estimatedHours} ore
                </span>
                <span>{estimate.subtotal} lei</span>
              </div>
              {estimate.extras.map((ext, i) => (
                <div
                  key={i}
                  className="flex justify-between text-gray-600"
                >
                  <span>
                    {ext.extra.nameRo} x{ext.quantity}
                  </span>
                  <span>{ext.lineTotal} lei</span>
                </div>
              ))}
              <div className="flex justify-between font-bold text-gray-900 text-lg pt-2 border-t border-gray-100">
                <span>Total estimat</span>
                <span className="text-primary">{estimate.total} lei</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              Pretul va fi calculat automat.
            </p>
          )}
        </Card>

        {/* Special instructions */}
        <Card>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Instructiuni speciale (optional)
          </label>
          <textarea
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
            rows={3}
            placeholder="Indicatii suplimentare pentru echipa de curatenie..."
            value={form.specialInstructions}
            onChange={(e) =>
              updateForm({ specialInstructions: e.target.value })
            }
          />
        </Card>

      </div>
    </div>
  );
}

// ─── Price Sidebar ───────────────────────────────────────────────────────────

function PriceSidebar({
  form,
  selectedService,
  extras,
  estimate,
  estimateLoading,
  fetchEstimate,
}: {
  form: BookingFormState;
  selectedService?: ServiceDefinition;
  extras: ExtraDefinition[];
  estimate?: PriceEstimate;
  estimateLoading: boolean;
  fetchEstimate: (opts: { variables: { input: unknown } }) => void;
}) {
  const hasEnoughInfo = !!form.serviceType && form.numRooms >= 1;

  const handleRefreshEstimate = () => {
    if (form.serviceType) {
      fetchEstimate({
        variables: {
          input: {
            serviceType: form.serviceType,
            numRooms: form.numRooms,
            numBathrooms: form.numBathrooms,
            areaSqm: form.areaSqm ? parseInt(form.areaSqm, 10) : undefined,
            extras: form.extras.filter((e) => e.quantity > 0),
          },
        },
      });
    }
  };

  return (
    <div className="sticky top-8">
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Rezumat comanda
        </h3>

        {selectedService ? (
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Serviciu</span>
              <span className="font-medium text-gray-900">
                {selectedService.nameRo}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Pret/ora</span>
              <span className="font-medium text-gray-900">
                {selectedService.basePricePerHour} lei
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Camere</span>
              <span className="font-medium text-gray-900">
                {form.numRooms}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Bai</span>
              <span className="font-medium text-gray-900">
                {form.numBathrooms}
              </span>
            </div>

            {form.extras.filter((e) => e.quantity > 0).length > 0 && (
              <div className="pt-2 border-t border-gray-100">
                <span className="text-gray-500 text-xs uppercase tracking-wide">
                  Extra
                </span>
                {form.extras
                  .filter((e) => e.quantity > 0)
                  .map((e) => {
                    const extra = extras.find((x) => x.id === e.extraId);
                    return (
                      <div
                        key={e.extraId}
                        className="flex justify-between mt-1"
                      >
                        <span className="text-gray-600">
                          {extra?.nameRo} x{e.quantity}
                        </span>
                        <span className="font-medium text-gray-900">
                          +{(extra?.price ?? 0) * e.quantity} lei
                        </span>
                      </div>
                    );
                  })}
              </div>
            )}

            {estimate && !estimateLoading && (
              <div className="pt-3 border-t border-gray-200">
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-gray-900">Total</span>
                  <span className="text-primary">{estimate.total} lei</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  *Estimare - pretul final poate varia
                </p>
              </div>
            )}

            {estimateLoading && (
              <div className="pt-3 border-t border-gray-200">
                <LoadingSpinner size="sm" />
              </div>
            )}

            {hasEnoughInfo && !estimate && !estimateLoading && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-2"
                onClick={handleRefreshEstimate}
              >
                Calculeaza pretul
              </Button>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-4">
            Selecteaza un serviciu pentru a vedea pretul estimat.
          </p>
        )}
      </Card>
    </div>
  );
}

// ─── Mobile Price Footer ─────────────────────────────────────────────────────

function MobilePriceFooter({
  form,
  selectedService,
  estimate,
}: {
  form: BookingFormState;
  selectedService?: ServiceDefinition;
  estimate?: PriceEstimate;
}) {
  if (!selectedService) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 lg:hidden z-40">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div>
          <div className="text-xs text-gray-500">{selectedService.nameRo}</div>
          <div className="text-lg font-bold text-gray-900">
            {estimate
              ? `${estimate.total} lei`
              : `de la ${selectedService.basePricePerHour * selectedService.minHours} lei`}
          </div>
        </div>
        <div className="text-xs text-gray-400">
          {form.numRooms} camere, {form.numBathrooms} bai
        </div>
      </div>
    </div>
  );
}
