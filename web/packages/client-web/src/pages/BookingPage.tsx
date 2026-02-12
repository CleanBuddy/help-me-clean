import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useLazyQuery, useMutation } from '@apollo/client';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import {
  Check,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
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
  Users,
  Building2,
  Briefcase,
  Refrigerator,
  CookingPot,
  Shirt,
  SquareStack,
  UtensilsCrossed,
  Archive,
  Clock,
  X,
  Star,
  AlertCircle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
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
  ACTIVE_CITIES,
  SUGGEST_CLEANERS,
} from '@/graphql/operations';

// ---- Types ------------------------------------------------------------------

interface ServiceDefinition {
  id: string;
  serviceType: string;
  nameRo: string;
  descriptionRo: string;
  basePricePerHour: number;
  minHours: number;
  icon: string;
  isActive?: boolean;
}

interface ExtraDefinition {
  id: string;
  nameRo: string;
  nameEn: string;
  price: number;
  icon: string;
  isActive?: boolean;
}

interface SavedAddress {
  id: string;
  label?: string;
  streetAddress: string;
  city: string;
  county: string;
  floor?: string;
  apartment?: string;
  latitude?: number | null;
  longitude?: number | null;
  coordinates?: { latitude: number; longitude: number } | null;
  isDefault: boolean;
}

interface PriceEstimate {
  hourlyRate: number;
  estimatedHours: number;
  propertyMultiplier: number;
  petsSurcharge: number;
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

interface TimeSlot {
  date: string;
  startTime: string;
  endTime: string;
}

interface CityArea {
  id: string;
  name: string;
  cityId: string;
  cityName: string;
}

interface ActiveCity {
  id: string;
  name: string;
  county: string;
  isActive: boolean;
  areas: CityArea[];
}

interface CleanerSuggestion {
  cleaner: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
    ratingAvg: number;
    totalJobsCompleted: number;
  };
  company: {
    id: string;
    companyName: string;
  };
  availabilityStatus: string;
  availableFrom: string | null;
  availableTo: string | null;
  suggestedStartTime: string | null;
  suggestedEndTime: string | null;
  suggestedSlotIndex: number | null;
  matchScore: number;
}

interface BookingFormState {
  serviceType: string;
  propertyType: string;
  numRooms: number;
  numBathrooms: number;
  areaSqm: string;
  hasPets: boolean;
  extras: SelectedExtra[];
  timeSlots: TimeSlot[];
  streetAddress: string;
  city: string;
  county: string;
  floor: string;
  apartment: string;
  latitude: number | null;
  longitude: number | null;
  useSavedAddress: string;
  selectedCityId: string;
  selectedAreaId: string;
  preferredCleanerId: string;
  suggestedStartTime: string;
  specialInstructions: string;
}

// ---- Constants --------------------------------------------------------------

const STEPS = [
  { key: 'service', label: 'Serviciu', icon: Sparkles },
  { key: 'details', label: 'Detalii', icon: Home },
  { key: 'schedule', label: 'Programare', icon: Calendar },
  { key: 'address', label: 'Adresa', icon: MapPin },
  { key: 'cleaner', label: 'Curatator', icon: Users },
  { key: 'summary', label: 'Sumar', icon: ClipboardList },
] as const;

const PROPERTY_TYPES: { value: string; label: string; icon: LucideIcon; badge: string | null }[] = [
  { value: 'Apartament', label: 'Apartament', icon: Building2, badge: null },
  { value: 'Casa', label: 'Casa', icon: Home, badge: 'x1.3' },
  { value: 'Birou', label: 'Birou', icon: Briefcase, badge: null },
];

const SERVICE_ICONS: Record<string, string> = {
  STANDARD_CLEANING: '\uD83E\uDDF9',
  DEEP_CLEANING: '\u2728',
  MOVE_IN_OUT_CLEANING: '\uD83D\uDCE6',
  POST_CONSTRUCTION: '\uD83C\uDFD7\uFE0F',
  OFFICE_CLEANING: '\uD83C\uDFE2',
  WINDOW_CLEANING: '\uD83E\uDE9F',
};

const EXTRA_ICON_MAP: Record<string, LucideIcon> = {
  fridge: Refrigerator,
  oven: CookingPot,
  iron: Shirt,
  window: SquareStack,
  dishes: UtensilsCrossed,
  closet: Archive,
};


const DAY_LABELS = ['Lu', 'Ma', 'Mi', 'Jo', 'Vi', 'Sa', 'Du'];

const MONTH_NAMES_RO = [
  'Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie',
  'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie',
];

// ---- Helpers ----------------------------------------------------------------

function getExtraIcon(iconField: string): LucideIcon {
  if (!iconField) return Sparkles;
  const lower = iconField.toLowerCase();
  for (const [key, Icon] of Object.entries(EXTRA_ICON_MAP)) {
    if (lower.includes(key)) return Icon;
  }
  return Sparkles;
}

function getInitialColor(name: string): string {
  const colors = [
    'bg-blue-600', 'bg-emerald-600', 'bg-purple-600',
    'bg-amber-600', 'bg-rose-600', 'bg-cyan-600',
  ];
  return colors[name.charCodeAt(0) % colors.length];
}

function padTwo(n: number): string {
  return String(n).padStart(2, '0');
}

function formatDateRo(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const day = d.getDate();
  const month = MONTH_NAMES_RO[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

function toDateString(y: number, m: number, d: number): string {
  return `${y}-${padTwo(m + 1)}-${padTwo(d)}`;
}

function generateTimeSlots(startHour: number, startMin: number, endHour: number, endMin: number): string[] {
  const slots: string[] = [];
  let h = startHour;
  let m = startMin;
  while (h < endHour || (h === endHour && m <= endMin)) {
    slots.push(`${padTwo(h)}:${padTwo(m)}`);
    m += 30;
    if (m >= 60) {
      m = 0;
      h += 1;
    }
  }
  return slots;
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(mins: number): string {
  return `${padTwo(Math.floor(mins / 60))}:${padTwo(mins % 60)}`;
}

// ---- Component --------------------------------------------------------------

export default function BookingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, user, loginWithGoogle, loginDev } = useAuth();

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
    propertyType: 'Apartament',
    numRooms: 2,
    numBathrooms: 1,
    areaSqm: '',
    hasPets: false,
    extras: [],
    timeSlots: [],
    streetAddress: '',
    city: '',
    county: '',
    floor: '',
    apartment: '',
    latitude: null,
    longitude: null,
    useSavedAddress: '',
    selectedCityId: '',
    selectedAreaId: '',
    preferredCleanerId: '',
    suggestedStartTime: '',
    specialInstructions: '',
  });

  // ---- Data fetching --------------------------------------------------------

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

  const services: ServiceDefinition[] = servicesData?.availableServices ?? [];
  const extras: ExtraDefinition[] = extrasData?.availableExtras ?? [];
  const savedAddresses: SavedAddress[] = addressesData?.myAddresses ?? [];
  const estimate = estimateData?.estimatePrice;

  // ---- Reactive price estimation (debounced 400ms) --------------------------

  const estimateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerEstimate = useCallback(() => {
    if (!form.serviceType) return;
    if (estimateTimerRef.current) clearTimeout(estimateTimerRef.current);
    estimateTimerRef.current = setTimeout(() => {
      fetchEstimate({
        variables: {
          input: {
            serviceType: form.serviceType,
            numRooms: form.numRooms,
            numBathrooms: form.numBathrooms,
            areaSqm: parseInt(form.areaSqm, 10) || undefined,
            propertyType: form.propertyType || undefined,
            hasPets: form.hasPets,
            extras: form.extras.filter((e) => e.quantity > 0),
          },
        },
      });
    }, 400);
  }, [form.serviceType, form.numRooms, form.numBathrooms, form.areaSqm, form.propertyType, form.hasPets, form.extras, fetchEstimate]);

  useEffect(() => {
    triggerEstimate();
    return () => {
      if (estimateTimerRef.current) clearTimeout(estimateTimerRef.current);
    };
  }, [triggerEstimate]);

  // ---- Helpers --------------------------------------------------------------

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
        return form.numRooms >= 1 && form.numBathrooms >= 1 && !!form.areaSqm && parseInt(form.areaSqm, 10) > 0;
      case 2:
        return form.timeSlots.length >= 1;
      case 3:
        return !!form.useSavedAddress || (
          !!form.streetAddress.trim() &&
          !!form.selectedCityId &&
          !!form.selectedAreaId
        );
      case 4:
        return true;
      case 5:
        return isAuthenticated;
      default:
        return false;
    }
  }, [currentStep, form, isAuthenticated]);

  const handleNext = useCallback(() => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

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
        scheduledDate: form.timeSlots[0]?.date,
        scheduledStartTime: form.timeSlots[0]?.startTime,
        timeSlots: form.timeSlots.map((s) => ({
          date: s.date,
          startTime: s.startTime,
          endTime: s.endTime,
        })),
        propertyType: form.propertyType || undefined,
        numRooms: form.numRooms,
        numBathrooms: form.numBathrooms,
        areaSqm: parseInt(form.areaSqm, 10) || undefined,
        hasPets: form.hasPets,
        specialInstructions: form.specialInstructions || undefined,
        extras: form.extras.filter((e) => e.quantity > 0),
        preferredCleanerId: form.preferredCleanerId || undefined,
        suggestedStartTime: form.suggestedStartTime || undefined,
      };

      if (form.useSavedAddress) {
        input.addressId = form.useSavedAddress;
      } else {
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

  // ---- Auth handlers --------------------------------------------------------

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

  // ---- Success screen -------------------------------------------------------

  if (bookingResult) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
        <div className="text-center max-w-md">
          {/* Confetti-like decorations */}
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full bg-emerald-500/10 animate-ping" />
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <CheckCircle2 className="h-12 w-12 text-white" />
            </div>
            {/* Decorative dots */}
            <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-amber-400 animate-bounce" />
            <div className="absolute -bottom-1 -left-3 w-3 h-3 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
            <div className="absolute top-0 -left-4 w-2 h-2 rounded-full bg-rose-400 animate-bounce" style={{ animationDelay: '0.4s' }} />
            <div className="absolute -bottom-2 right-0 w-3 h-3 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0.3s' }} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Rezervare confirmata!
          </h1>
          <p className="text-gray-500 mb-4">
            Comanda ta a fost plasata cu succes.
          </p>
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-50 to-emerald-50 border border-blue-100 text-xl font-mono font-bold text-gray-900 mb-4 tracking-wider">
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

  // ---- Main Render ----------------------------------------------------------

  return (
    <div className="py-8 sm:py-12 pb-28 lg:pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Page title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Rezerva o curatenie
          </h1>
          <p className="text-gray-500">
            Completeaza detaliile si plaseaza comanda in cateva minute.
          </p>
        </div>

        {/* Step indicator */}
        <StepIndicator currentStep={currentStep} />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Main content */}
          <div className="lg:col-span-3">
            {currentStep === 0 && (
              <StepService
                services={services}
                loading={servicesLoading}
                selected={form.serviceType}
                onSelect={(type) => updateForm({ serviceType: type })}
              />
            )}

            {currentStep === 1 && (
              <StepDetails
                form={form}
                updateForm={updateForm}
                extras={extras}
                selectedExtras={form.extras}
                onToggleExtra={handleToggleExtra}
              />
            )}

            {currentStep === 2 && (
              <StepSchedule
                form={form}
                updateForm={updateForm}
                estimatedHours={estimate?.estimatedHours}
                minHours={selectedService?.minHours}
              />
            )}

            {currentStep === 3 && (
              <StepAddress
                form={form}
                updateForm={updateForm}
                savedAddresses={savedAddresses}
                isAuthenticated={isAuthenticated}
              />
            )}

            {currentStep === 4 && (
              <StepCleaner
                form={form}
                updateForm={updateForm}
                estimatedHours={estimate?.estimatedHours}
                minHours={selectedService?.minHours}
              />
            )}

            {currentStep === 5 && (
              <>
                {/* Auth gate */}
                {!isAuthenticated && (
                  <Card className="mb-6">
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
                          onError={() =>
                            setAuthError('Autentificarea Google a esuat.')
                          }
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
                        onClick={() => {
                          setDevAuthMode(!devAuthMode);
                          setAuthError('');
                        }}
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

                <StepSummary
                  form={form}
                  updateForm={updateForm}
                  selectedService={selectedService}
                  estimate={estimate}
                  estimateLoading={estimateLoading}
                  extras={extras}
                  savedAddresses={savedAddresses}
                  isAuthenticated={isAuthenticated}
                  userName={user?.fullName}
                />
              </>
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

          {/* Sidebar: Price estimate (desktop only) */}
          <div className="hidden lg:block lg:col-span-2">
            <PriceSidebar
              form={form}
              selectedService={selectedService}
              extras={extras}
              estimate={estimate}
              estimateLoading={estimateLoading}
            />
          </div>
        </div>

        {/* Mobile price footer */}
        <MobilePriceFooter
          form={form}
          selectedService={selectedService}
          estimate={estimate}
          estimateLoading={estimateLoading}
          extras={extras}
        />
      </div>
    </div>
  );
}

// ---- Step Indicator ---------------------------------------------------------

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
                  isCompleted && 'bg-emerald-500 text-white',
                  isCurrent && 'bg-blue-600 text-white shadow-md shadow-blue-600/20',
                  !isCompleted && !isCurrent && 'bg-gray-100 text-gray-400',
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
                  isCurrent ? 'text-blue-600' : isCompleted ? 'text-emerald-500' : 'text-gray-400',
                )}
              >
                {step.label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={cn(
                  'w-6 sm:w-10 h-0.5 mx-1 sm:mx-2 rounded-full mb-5 sm:mb-5',
                  index < currentStep ? 'bg-emerald-500' : 'bg-gray-200',
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ---- Step 0: Service Selection ----------------------------------------------

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
                ? 'ring-2 ring-blue-600 border-blue-600 shadow-md shadow-blue-600/10'
                : 'hover:shadow-md hover:border-gray-300',
            )}
            onClick={() => onSelect(service.serviceType)}
          >
            <div className="flex items-start gap-3">
              <div className="text-3xl">
                {SERVICE_ICONS[service.serviceType] || service.icon || '\uD83E\uDDF9'}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900">
                  {service.nameRo}
                </h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {service.descriptionRo}
                </p>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-lg font-bold text-blue-600">
                    {service.basePricePerHour} lei
                  </span>
                  <span className="text-xs text-gray-400">/ora</span>
                  <span className="text-xs text-gray-400 ml-2">
                    (min. {service.minHours} ore)
                  </span>
                </div>
              </div>
              {selected === service.serviceType && (
                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
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

// ---- Step 1: Details --------------------------------------------------------

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

      <Card className="space-y-6">
        {/* Property Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Tip proprietate
          </label>
          <div className="grid grid-cols-3 gap-3">
            {PROPERTY_TYPES.map((pt) => {
              const Icon = pt.icon;
              const isSelected = form.propertyType === pt.value;
              return (
                <button
                  key={pt.value}
                  type="button"
                  onClick={() => updateForm({ propertyType: pt.value })}
                  className={cn(
                    'relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all cursor-pointer',
                    isSelected
                      ? 'border-blue-600 bg-blue-50 shadow-sm'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50',
                  )}
                >
                  <Icon
                    className={cn(
                      'h-6 w-6',
                      isSelected ? 'text-blue-600' : 'text-gray-400',
                    )}
                  />
                  <span
                    className={cn(
                      'text-sm font-medium',
                      isSelected ? 'text-blue-600' : 'text-gray-700',
                    )}
                  >
                    {pt.label}
                  </span>
                  {pt.badge && (
                    <span
                      className={cn(
                        'absolute -top-2 -right-2 text-xs font-bold px-1.5 py-0.5 rounded-md',
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-amber-100 text-amber-700',
                      )}
                    >
                      {pt.badge}
                    </span>
                  )}
                  {isSelected && (
                    <div className="absolute top-1.5 left-1.5 w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center">
                      <Check className="h-2.5 w-2.5 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Rooms stepper */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <StepperField
            label="Numar camere"
            value={form.numRooms}
            min={1}
            max={10}
            onChange={(v) => updateForm({ numRooms: v })}
          />
          <StepperField
            label="Numar bai"
            value={form.numBathrooms}
            min={1}
            max={5}
            onChange={(v) => updateForm({ numBathrooms: v })}
          />
        </div>

        {/* Area */}
        <Input
          label="Suprafata (mp) *"
          type="number"
          placeholder="mp"
          value={form.areaSqm}
          onChange={(e) => updateForm({ areaSqm: e.target.value })}
          min={1}
        />

        {/* Pets toggle */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Animale de companie
          </label>
          <button
            type="button"
            onClick={() => updateForm({ hasPets: !form.hasPets })}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all cursor-pointer w-full sm:w-auto',
              form.hasPets
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-gray-300',
            )}
          >
            <PawPrint
              className={cn(
                'h-5 w-5',
                form.hasPets ? 'text-blue-600' : 'text-gray-400',
              )}
            />
            <span
              className={cn(
                'text-sm font-medium',
                form.hasPets ? 'text-blue-600' : 'text-gray-700',
              )}
            >
              Am animale de companie
            </span>
            {form.hasPets && (
              <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md ml-auto">
                +15 lei
              </span>
            )}
          </button>
        </div>
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
              const sel = selectedExtras.find((e) => e.extraId === extra.id);
              const qty = sel?.quantity ?? 0;
              const ExtraIcon = getExtraIcon(extra.icon);

              return (
                <Card
                  key={extra.id}
                  className={cn(
                    'transition-all',
                    qty > 0 && 'ring-2 ring-blue-600/30 border-blue-600/40 shadow-sm shadow-blue-600/5',
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={cn(
                          'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                          qty > 0 ? 'bg-blue-50' : 'bg-gray-50',
                        )}
                      >
                        <ExtraIcon
                          className={cn(
                            'h-5 w-5',
                            qty > 0 ? 'text-blue-600' : 'text-gray-400',
                          )}
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {extra.nameRo}
                        </div>
                        <div className="text-sm text-blue-600 font-semibold">
                          +{extra.price} lei
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {qty > 0 && (
                        <>
                          <button
                            type="button"
                            onClick={() => onToggleExtra(extra.id, -1)}
                            className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition cursor-pointer"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-sm font-bold text-blue-600 w-5 text-center">
                            {qty}
                          </span>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => onToggleExtra(extra.id, 1)}
                        className={cn(
                          'w-8 h-8 rounded-lg border flex items-center justify-center transition cursor-pointer',
                          qty > 0
                            ? 'border-blue-600 bg-blue-600 text-white hover:bg-blue-700'
                            : 'border-gray-300 hover:bg-gray-50',
                        )}
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

// ---- Stepper Field ----------------------------------------------------------

function StepperField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="w-10 h-10 rounded-xl border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="text-xl font-bold text-gray-900 w-10 text-center">
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="w-10 h-10 rounded-xl border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ---- Step 2: Schedule -------------------------------------------------------

function StepSchedule({
  form,
  updateForm,
  estimatedHours,
  minHours,
}: {
  form: BookingFormState;
  updateForm: (updates: Partial<BookingFormState>) => void;
  estimatedHours?: number;
  minHours?: number;
}) {
  const duration = estimatedHours ?? minHours ?? 2;

  const today = useMemo(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }, []);

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [pickStartTime, setPickStartTime] = useState<string | null>(null);
  const [pickEndTime, setPickEndTime] = useState<string | null>(null);

  // Dates that already have slots
  const slotDates = useMemo(
    () => new Set(form.timeSlots.map((s) => s.date)),
    [form.timeSlots],
  );

  // Calendar data
  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    // Monday-based: 0=Mon..6=Sun
    let startDow = firstDay.getDay() - 1;
    if (startDow < 0) startDow = 6;

    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells: (number | null)[] = [];

    for (let i = 0; i < startDow; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    // Pad to fill last row
    while (cells.length % 7 !== 0) cells.push(null);

    return cells;
  }, [viewYear, viewMonth]);

  const goToPrevMonth = useCallback(() => {
    setViewMonth((m) => {
      if (m === 0) {
        setViewYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  }, []);

  const goToNextMonth = useCallback(() => {
    setViewMonth((m) => {
      if (m === 11) {
        setViewYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  }, []);

  const handleDateClick = useCallback((day: number) => {
    const ds = toDateString(viewYear, viewMonth, day);
    setSelectedDate(ds);
    setPickStartTime(null);
    setPickEndTime(null);
  }, [viewYear, viewMonth]);

  const isDayPast = useCallback(
    (day: number) => {
      const d = new Date(viewYear, viewMonth, day);
      return d < today;
    },
    [viewYear, viewMonth, today],
  );

  // Start time options: 08:00 to 18:00
  const startTimeOptions = useMemo(
    () => generateTimeSlots(8, 0, 18, 0),
    [],
  );

  // End time options: startTime + duration to 20:00
  const endTimeOptions = useMemo(() => {
    if (!pickStartTime) return [];
    const minEnd = timeToMinutes(pickStartTime) + Math.ceil(duration) * 60;
    const maxEnd = 20 * 60; // 20:00
    const options: string[] = [];
    for (let mins = minEnd; mins <= maxEnd; mins += 30) {
      options.push(minutesToTime(mins));
    }
    return options;
  }, [pickStartTime, duration]);

  const handleAddSlot = useCallback(() => {
    if (!selectedDate || !pickStartTime || !pickEndTime) return;
    if (form.timeSlots.length >= 5) return;

    const newSlot: TimeSlot = {
      date: selectedDate,
      startTime: pickStartTime,
      endTime: pickEndTime,
    };
    updateForm({ timeSlots: [...form.timeSlots, newSlot] });
    setSelectedDate(null);
    setPickStartTime(null);
    setPickEndTime(null);
  }, [selectedDate, pickStartTime, pickEndTime, form.timeSlots, updateForm]);

  const handleRemoveSlot = useCallback(
    (index: number) => {
      updateForm({
        timeSlots: form.timeSlots.filter((_, i) => i !== index),
      });
    },
    [form.timeSlots, updateForm],
  );

  const canAddSlot = !!selectedDate && !!pickStartTime && !!pickEndTime && form.timeSlots.length < 5;

  const canPrevMonth = !(viewYear === today.getFullYear() && viewMonth === today.getMonth());

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Alege data si ora
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Selecteaza unul sau mai multe intervale orare disponibile.
      </p>

      {/* Duration banner */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 border border-blue-100 mb-6">
        <Clock className="h-5 w-5 text-blue-600 shrink-0" />
        <div>
          <span className="text-sm font-semibold text-blue-900">
            Durata estimata: ~{duration} ore
          </span>
          <span className="text-sm text-blue-600 ml-2">
            Selecteaza intervale de minim {duration} ore
          </span>
        </div>
      </div>

      {/* Calendar */}
      <Card>
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={goToPrevMonth}
            disabled={!canPrevMonth}
            className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-gray-100 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h3 className="text-base font-semibold text-gray-900">
            {MONTH_NAMES_RO[viewMonth]} {viewYear}
          </h3>
          <button
            type="button"
            onClick={goToNextMonth}
            className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-gray-100 transition cursor-pointer"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Day labels */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {DAY_LABELS.map((label) => (
            <div
              key={label}
              className="text-center text-xs font-semibold text-gray-400 py-2"
            >
              {label}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} className="h-10" />;
            }
            const dateStr = toDateString(viewYear, viewMonth, day);
            const isPast = isDayPast(day);
            const isToday = dateStr === toDateString(today.getFullYear(), today.getMonth(), today.getDate());
            const hasSlot = slotDates.has(dateStr);
            const isPickedDate = selectedDate === dateStr;

            return (
              <button
                key={dateStr}
                type="button"
                disabled={isPast}
                onClick={() => handleDateClick(day)}
                className={cn(
                  'relative h-10 rounded-lg text-sm font-medium transition-all cursor-pointer',
                  isPast && 'text-gray-300 cursor-not-allowed',
                  !isPast && !isPickedDate && !hasSlot && 'text-gray-700 hover:bg-gray-100',
                  isPickedDate && 'bg-blue-600 text-white shadow-sm',
                  !isPickedDate && hasSlot && 'bg-blue-50 text-blue-600',
                  isToday && !isPickedDate && 'ring-1 ring-blue-300',
                )}
              >
                {day}
                {hasSlot && !isPickedDate && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-blue-600" />
                )}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Time picker */}
      {selectedDate && (
        <Card className="mt-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            Interval pentru {formatDateRo(selectedDate)}
          </h4>

          {/* Start time */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
              Ora de inceput
            </label>
            <div className="flex flex-wrap gap-2">
              {startTimeOptions.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setPickStartTime(t);
                    setPickEndTime(null);
                  }}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer border',
                    pickStartTime === t
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50',
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* End time */}
          {pickStartTime && (
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
                Ora de sfarsit
              </label>
              {endTimeOptions.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {endTimeOptions.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setPickEndTime(t)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer border',
                        pickEndTime === t
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50',
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">
                  Ora de inceput selectata este prea tarziu. Alege o ora mai devreme.
                </p>
              )}
            </div>
          )}

          {/* Add slot button */}
          <Button
            onClick={handleAddSlot}
            disabled={!canAddSlot}
            size="sm"
          >
            <Plus className="h-4 w-4" />
            Adauga interval
          </Button>
        </Card>
      )}

      {/* Slot list */}
      {form.timeSlots.length > 0 && (
        <div className="mt-4 space-y-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Intervale selectate ({form.timeSlots.length}/5)
          </label>
          {form.timeSlots.map((slot, index) => (
            <div
              key={`${slot.date}-${slot.startTime}-${index}`}
              className="flex items-center justify-between p-3 rounded-xl bg-blue-50 border border-blue-100"
            >
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-blue-600 shrink-0" />
                <span className="text-sm font-medium text-gray-900">
                  {formatDateRo(slot.date)}
                </span>
                <span className="text-sm text-blue-600 font-semibold">
                  {slot.startTime} - {slot.endTime}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveSlot(index)}
                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-100 transition cursor-pointer text-gray-400 hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          {form.timeSlots.length < 5 && (
            <button
              type="button"
              onClick={() => {
                setSelectedDate(null);
                setPickStartTime(null);
                setPickEndTime(null);
              }}
              className="text-sm text-blue-600 font-medium hover:underline cursor-pointer mt-1"
            >
              + Adauga alt interval
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ---- Step 3: Address --------------------------------------------------------

function StepAddress({
  form,
  updateForm,
  savedAddresses,
  isAuthenticated,
}: {
  form: BookingFormState;
  updateForm: (updates: Partial<BookingFormState>) => void;
  savedAddresses: SavedAddress[];
  isAuthenticated: boolean;
}) {
  const { data: citiesData } = useQuery<{ activeCities: ActiveCity[] }>(ACTIVE_CITIES);
  const activeCities: ActiveCity[] = useMemo(
    () => (citiesData?.activeCities ?? []).filter((c) => c.isActive),
    [citiesData],
  );

  const [showCityNotFound, setShowCityNotFound] = useState(false);
  const [unsupportedCityName, setUnsupportedCityName] = useState('');

  // City names for Google Places autocomplete bias.
  const supportedCityNames = useMemo(
    () => activeCities.map((c) => c.name),
    [activeCities],
  );

  // City options for dropdown
  const cityOptions = useMemo(
    () => activeCities.map((c) => ({ value: c.id, label: c.name })),
    [activeCities],
  );

  // When a city is selected from dropdown, auto-fill county and area options
  const selectedCity = useMemo(
    () => activeCities.find((c) => c.id === form.selectedCityId) ?? null,
    [activeCities, form.selectedCityId],
  );

  const areaOptions = useMemo(() => {
    if (!selectedCity) return [];
    return selectedCity.areas.map((a) => ({ value: a.id, label: a.name }));
  }, [selectedCity]);

  const handleCityChange = useCallback(
    (cityId: string) => {
      const city = activeCities.find((c) => c.id === cityId);
      updateForm({
        selectedCityId: cityId,
        city: city?.name ?? '',
        county: city?.county ?? '',
        selectedAreaId: '',
        useSavedAddress: '',
      });
      setShowCityNotFound(false);
    },
    [activeCities, updateForm],
  );

  // Try to match an area from the parsed neighborhood / sublocality.
  // Strip Romanian diacritics for comparison (e.g. București → Bucuresti).
  const stripDiacritics = useCallback(
    (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
    [],
  );

  const matchArea = useCallback(
    (city: ActiveCity, neighborhood: string): string => {
      if (!neighborhood) return '';
      const norm = stripDiacritics(neighborhood.toLowerCase().trim());
      // Exact match first.
      const exact = city.areas.find(
        (a) => stripDiacritics(a.name.toLowerCase()) === norm,
      );
      if (exact) return exact.id;
      // Partial match (area name contained in neighborhood or vice-versa).
      const partial = city.areas.find(
        (a) =>
          norm.includes(stripDiacritics(a.name.toLowerCase())) ||
          stripDiacritics(a.name.toLowerCase()).includes(norm),
      );
      return partial?.id ?? '';
    },
    [stripDiacritics],
  );

  const handleAddressSelect = useCallback(
    (parsed: ParsedAddress) => {

      // Match city from active cities (case-insensitive, diacritics-insensitive).
      const cityMatch = activeCities.find(
        (c) =>
          stripDiacritics(c.name.toLowerCase()) ===
          stripDiacritics(parsed.city.toLowerCase()),
      );

      // Try to auto-match area from neighborhood.
      let areaId = '';
      if (cityMatch) {
        areaId = matchArea(cityMatch, parsed.neighborhood);
      }

      updateForm({
        streetAddress: parsed.streetAddress,
        city: parsed.city,
        county: parsed.county,
        latitude: parsed.latitude,
        longitude: parsed.longitude,
        floor: parsed.floor || form.floor,
        apartment: parsed.apartment || form.apartment,
        useSavedAddress: '',
        selectedCityId: cityMatch?.id ?? '',
        selectedAreaId: areaId,
      });

      if (!cityMatch && parsed.city) {
        setShowCityNotFound(true);
        setUnsupportedCityName(parsed.city);
      } else {
        setShowCityNotFound(false);
        setUnsupportedCityName('');
      }
    },
    [activeCities, matchArea, updateForm],
  );

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Adresa de curatenie
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Cauta adresa ta si vom completa automat orasul si zona.
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
                    ? 'ring-2 ring-blue-600 border-blue-600'
                    : 'hover:border-gray-300',
                )}
                onClick={() => {
                  const cityMatch = activeCities.find(
                    (c) => c.name.toLowerCase() === addr.city.toLowerCase(),
                  );
                  // Auto-select first area as default for saved addresses.
                  const areaId = cityMatch?.areas?.[0]?.id ?? '';
                  updateForm({
                    useSavedAddress: addr.id,
                    selectedCityId: cityMatch?.id ?? '',
                    selectedAreaId: areaId,
                  });
                }}
              >
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-gray-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900">
                      {addr.label || addr.streetAddress}
                      {addr.isDefault && (
                        <span className="ml-2 text-xs text-emerald-600 font-semibold">
                          Implicita
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {addr.streetAddress}, {addr.city}, {addr.county}
                    </div>
                  </div>
                  {form.useSavedAddress === addr.id && (
                    <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
          {/* Divider + new address link (only when no saved address selected) */}
          {!form.useSavedAddress && (
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
          )}

          {/* Area selector + link to switch when saved address is selected */}
          {form.useSavedAddress && (
            <div className="mt-4 space-y-3">
              {selectedCity && areaOptions.length > 1 && (
                <Select
                  label="Zona / Sector"
                  options={areaOptions}
                  value={form.selectedAreaId}
                  onChange={(e) => updateForm({ selectedAreaId: e.target.value })}
                />
              )}
              <button
                type="button"
                onClick={() => updateForm({ useSavedAddress: '' })}
                className="text-sm text-blue-600 font-medium hover:underline cursor-pointer"
              >
                Foloseste o adresa noua
              </button>
            </div>
          )}
        </div>
      )}

      {!form.useSavedAddress && (
      <Card className="space-y-5">
        {/* Address Autocomplete - biased toward supported cities */}
        <AddressAutocomplete
          label="Cauta adresa"
          placeholder="Incepe sa scrii adresa (ex: Strada Eroilor 5, Cluj-Napoca)..."
          value={form.streetAddress}
          biasTowardCities={supportedCityNames}
          onChange={(val) => {
            updateForm({
              streetAddress: val,
              useSavedAddress: '',
            });
          }}
          onAddressSelect={handleAddressSelect}
        />

        {/* Auto-filled location info */}
        {form.selectedCityId && selectedCity && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            <span className="text-sm text-emerald-700 font-medium">
              {selectedCity.name}, {form.county}
              {form.selectedAreaId && areaOptions.length > 0 && (
                <> &mdash; {areaOptions.find((a) => a.value === form.selectedAreaId)?.label}</>
              )}
            </span>
          </div>
        )}

        {/* City dropdown (manual override if needed) */}
        {!form.selectedCityId && (
          <div>
            <Select
              label="Oras"
              placeholder="Selecteaza orasul"
              options={cityOptions}
              value={form.selectedCityId}
              onChange={(e) => handleCityChange(e.target.value)}
            />
            {/* City not found */}
            {showCityNotFound && (
              <div className="mt-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
                <div className="flex items-start gap-2 mb-3">
                  <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-amber-800 font-medium">
                    Nu suntem inca activi in {unsupportedCityName || 'zona ta'}. Te vom notifica cand devenim disponibili!
                  </p>
                </div>
                {!isAuthenticated && (
                  <p className="text-xs text-amber-600 mt-2">
                    Creeaza un cont pentru a fi notificat cand devenim activi in zona ta.
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setShowCityNotFound(false);
                    setUnsupportedCityName('');
                  }}
                  className="mt-2 text-xs text-gray-500 hover:underline cursor-pointer"
                >
                  Inchide
                </button>
              </div>
            )}
            {!showCityNotFound && (
              <button
                type="button"
                onClick={() => setShowCityNotFound(true)}
                className="mt-2 text-xs text-blue-600 hover:underline cursor-pointer"
              >
                Orasul tau nu este in lista?
              </button>
            )}
          </div>
        )}

        {/* Change city link when auto-filled */}
        {form.selectedCityId && selectedCity && (
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => updateForm({ selectedCityId: '', selectedAreaId: '', city: '', county: '' })}
              className="text-xs text-blue-600 hover:underline cursor-pointer"
            >
              Schimba orasul
            </button>
          </div>
        )}

        {/* Area dropdown (shown if city has areas and not yet auto-matched) */}
        {selectedCity && areaOptions.length > 0 && !form.selectedAreaId && (
          <Select
            label="Selecteaza zona / sectorul"
            placeholder="Alege zona"
            options={areaOptions}
            value={form.selectedAreaId}
            onChange={(e) => updateForm({ selectedAreaId: e.target.value })}
          />
        )}

        {/* Area change link when auto-matched */}
        {selectedCity && areaOptions.length > 0 && form.selectedAreaId && (
          <div>
            <Select
              label="Zona / Sector"
              options={areaOptions}
              value={form.selectedAreaId}
              onChange={(e) => updateForm({ selectedAreaId: e.target.value })}
            />
          </div>
        )}

        {/* Floor / Apartment */}
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
      )}
    </div>
  );
}

// ---- Step 4: Cleaner Suggestions --------------------------------------------

function StepCleaner({
  form,
  updateForm,
  estimatedHours,
  minHours,
}: {
  form: BookingFormState;
  updateForm: (updates: Partial<BookingFormState>) => void;
  estimatedHours?: number;
  minHours?: number;
}) {
  const duration = estimatedHours ?? minHours ?? 2;
  const firstSlot = form.timeSlots[0];

  const { data: suggestionsData, loading: suggestionsLoading } = useQuery<{
    suggestCleaners: CleanerSuggestion[];
  }>(SUGGEST_CLEANERS, {
    variables: {
      cityId: form.selectedCityId,
      areaId: form.selectedAreaId,
      timeSlots: form.timeSlots.map((s) => ({
        date: s.date,
        startTime: s.startTime,
        endTime: s.endTime,
      })),
      estimatedDurationHours: duration,
    },
    skip:
      !form.selectedCityId ||
      !form.selectedAreaId ||
      !firstSlot?.date ||
      !firstSlot?.startTime,
    fetchPolicy: 'network-only',
  });

  const suggestions: CleanerSuggestion[] =
    suggestionsData?.suggestCleaners ?? [];
  const topSuggestions = suggestions.slice(0, 5);

  const getAvailabilityBadge = useCallback((status: string) => {
    switch (status.toLowerCase()) {
      case 'available':
        return {
          label: 'Disponibil',
          className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        };
      case 'partial':
        return {
          label: 'Partial disponibil',
          className: 'bg-amber-50 text-amber-700 border-amber-200',
        };
      case 'unavailable':
        return {
          label: 'Indisponibil',
          className: 'bg-red-50 text-red-700 border-red-200',
        };
      case 'busy':
      default:
        return {
          label: 'Ocupat',
          className: 'bg-red-50 text-red-700 border-red-200',
        };
    }
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Alege un curatator
      </h2>
      <p className="text-sm text-gray-500 mb-4">
        Iti sugeram curatatori disponibili in zona ta. Poti selecta unul sau
        continua fara preferinta.
      </p>

      {/* Job schedule header */}
      {firstSlot && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-blue-50 border border-blue-200 mb-6">
          <Calendar className="h-4 w-4 text-blue-600 shrink-0" />
          <span className="text-sm text-blue-800 font-medium">
            Programarea ta: {new Date(firstSlot.date).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })},{' '}
            {firstSlot.startTime} - {firstSlot.endTime}
            {duration ? ` (${duration} ${duration === 1 ? 'ora' : 'ore'})` : ''}
          </span>
        </div>
      )}

      {/* Any cleaner option (default) */}
      <Card
        className={cn(
          'cursor-pointer transition-all mb-4',
          !form.preferredCleanerId
            ? 'ring-2 ring-blue-600 border-blue-600 shadow-md shadow-blue-600/10'
            : 'hover:shadow-md hover:border-gray-300',
        )}
        onClick={() => updateForm({ preferredCleanerId: '', suggestedStartTime: '' })}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
            <Users className="h-6 w-6 text-gray-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">
              Orice curatator disponibil
            </h3>
            <p className="text-sm text-gray-500">
              Lasam platforma sa aleaga cel mai potrivit curatator pentru tine.
            </p>
          </div>
          {!form.preferredCleanerId && (
            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
              <Check className="h-4 w-4 text-white" />
            </div>
          )}
        </div>
      </Card>

      {suggestionsLoading ? (
        <LoadingSpinner text="Se cauta curatatori disponibili..." />
      ) : topSuggestions.length > 0 ? (
        <div className="space-y-3">
          {topSuggestions.map((suggestion) => {
            const { cleaner, company, availabilityStatus, availableFrom, availableTo, suggestedStartTime, suggestedEndTime, matchScore } = suggestion;
            const isSelected = form.preferredCleanerId === cleaner.id;
            const badge = getAvailabilityBadge(availabilityStatus);
            const initial = cleaner.fullName.charAt(0).toUpperCase();

            return (
              <Card
                key={cleaner.id}
                className={cn(
                  'transition-all',
                  isSelected
                    ? 'ring-2 ring-blue-600 border-blue-600 shadow-md shadow-blue-600/10'
                    : 'hover:shadow-md hover:border-gray-300',
                )}
              >
                <div className="flex items-start gap-4">
                  {/* Avatar initial */}
                  <div
                    className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0',
                      getInitialColor(cleaner.fullName),
                    )}
                  >
                    {initial}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900">
                        {cleaner.fullName}
                      </h3>
                      <span
                        className={cn(
                          'text-xs font-medium px-2 py-0.5 rounded-full border',
                          badge.className,
                        )}
                      >
                        {badge.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {company.companyName}
                    </p>

                    {/* Availability time window */}
                    {availableFrom && availableTo && (
                      <p className={cn(
                        'text-xs mt-1 flex items-center gap-1',
                        availabilityStatus === 'available' ? 'text-emerald-600' :
                        availabilityStatus === 'partial' ? 'text-amber-600' :
                        'text-red-500',
                      )}>
                        <Clock className="h-3 w-3 shrink-0" />
                        {availabilityStatus === 'unavailable' || availabilityStatus === 'busy' ? (
                          <>Indisponibil in intervalul selectat</>
                        ) : availabilityStatus === 'partial' ? (
                          <>Disponibil {availableFrom} - {availableTo} &mdash; nu acopera complet intervalul</>
                        ) : (
                          <>Disponibil {availableFrom} - {availableTo}</>
                        )}
                      </p>
                    )}

                    {/* System-decided optimal time */}
                    {suggestedStartTime && suggestedEndTime && availabilityStatus !== 'unavailable' && (
                      <p className="text-xs mt-1 flex items-center gap-1 text-blue-600 font-medium">
                        <Clock className="h-3 w-3 shrink-0" />
                        Programat: {suggestedStartTime} - {suggestedEndTime}
                      </p>
                    )}

                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                        <span className="font-medium text-gray-900">
                          {cleaner.ratingAvg > 0
                            ? cleaner.ratingAvg.toFixed(1)
                            : '5.0'}
                        </span>
                      </div>
                      <span className="text-gray-500">
                        {cleaner.totalJobsCompleted} lucrari
                      </span>
                      <span className="text-blue-600 font-medium">
                        Potrivire: {Math.round(matchScore)}%
                      </span>
                    </div>
                  </div>

                  {/* Select button */}
                  <button
                    type="button"
                    onClick={() =>
                      updateForm({
                        preferredCleanerId: isSelected ? '' : cleaner.id,
                        suggestedStartTime: isSelected ? '' : (suggestedStartTime ?? ''),
                      })
                    }
                    className={cn(
                      'shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all border cursor-pointer',
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-blue-600 border-blue-600 hover:bg-blue-50',
                    )}
                  >
                    {isSelected ? 'Selectat' : 'Selecteaza'}
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <div className="text-center py-6">
            <Users className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">
              Nu am gasit curatatori disponibili in aceasta zona si data. Poti
              continua fara preferinta sau incerca alta data.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}

// ---- Step 5: Summary --------------------------------------------------------

function StepSummary({
  form,
  updateForm,
  selectedService,
  estimate,
  estimateLoading,
  extras,
  savedAddresses,
  isAuthenticated,
  userName,
}: {
  form: BookingFormState;
  updateForm: (updates: Partial<BookingFormState>) => void;
  selectedService?: ServiceDefinition;
  estimate?: PriceEstimate;
  estimateLoading: boolean;
  extras: ExtraDefinition[];
  savedAddresses: SavedAddress[];
  isAuthenticated: boolean;
  userName?: string;
}) {
  const selectedExtraNames = useMemo(
    () =>
      form.extras
        .filter((e) => e.quantity > 0)
        .map((e) => {
          const extra = extras.find((x) => x.id === e.extraId);
          return extra ? `${extra.nameRo} x${e.quantity}` : '';
        })
        .filter(Boolean),
    [form.extras, extras],
  );

  const firstSlot = form.timeSlots[0];

  // Fetch cleaner suggestions to resolve selected cleaner name
  const { data: suggestionsData } = useQuery<{
    suggestCleaners: CleanerSuggestion[];
  }>(SUGGEST_CLEANERS, {
    variables: {
      cityId: form.selectedCityId,
      areaId: form.selectedAreaId,
      timeSlots: form.timeSlots.map((s) => ({
        date: s.date,
        startTime: s.startTime,
        endTime: s.endTime,
      })),
      estimatedDurationHours: estimate?.estimatedHours ?? selectedService?.minHours ?? 2,
    },
    skip:
      !form.preferredCleanerId ||
      !form.selectedCityId ||
      !form.selectedAreaId ||
      !firstSlot?.date ||
      !firstSlot?.startTime,
    fetchPolicy: 'cache-first',
  });

  const selectedCleaner = useMemo(() => {
    if (!form.preferredCleanerId) return null;
    const suggestions = suggestionsData?.suggestCleaners ?? [];
    return (
      suggestions.find((s) => s.cleaner.id === form.preferredCleanerId) ?? null
    );
  }, [form.preferredCleanerId, suggestionsData]);

  const propertyLabel = useMemo(() => {
    const pt = PROPERTY_TYPES.find((p) => p.value === form.propertyType);
    return pt ? pt.label : form.propertyType;
  }, [form.propertyType]);

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Sumar si confirmare
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Verifica detaliile inainte de a confirma rezervarea.
      </p>

      {isAuthenticated && userName && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-100 mb-4">
          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
          <span className="text-sm text-emerald-700">
            Conectat ca <strong>{userName}</strong>
          </span>
        </div>
      )}

      <div className="space-y-4">
        {/* Service summary */}
        <Card>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Serviciu
          </h3>
          <div className="flex items-center gap-3">
            <span className="text-2xl">
              {SERVICE_ICONS[form.serviceType] || '\uD83E\uDDF9'}
            </span>
            <div>
              <div className="text-lg font-semibold text-gray-900">
                {selectedService?.nameRo || form.serviceType}
              </div>
              <div className="text-sm text-blue-600 font-medium">
                {selectedService?.basePricePerHour} lei/ora
              </div>
            </div>
          </div>
        </Card>

        {/* Details summary */}
        <Card>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Detalii proprietate
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500">Tip:</span>{' '}
              <span className="font-medium text-gray-900">{propertyLabel}</span>
              {form.propertyType === 'Casa' && (
                <span className="text-xs text-amber-600 font-semibold ml-1">
                  (x1.3)
                </span>
              )}
            </div>
            <div>
              <span className="text-gray-500">Camere:</span>{' '}
              <span className="font-medium text-gray-900">{form.numRooms}</span>
            </div>
            <div>
              <span className="text-gray-500">Bai:</span>{' '}
              <span className="font-medium text-gray-900">{form.numBathrooms}</span>
            </div>
            <div>
              <span className="text-gray-500">Suprafata:</span>{' '}
              <span className="font-medium text-gray-900">{form.areaSqm} mp</span>
            </div>
            {form.hasPets && (
              <div className="flex items-center gap-1">
                <PawPrint className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-gray-500">Animale:</span>{' '}
                <span className="font-medium text-amber-600">Da (+15 lei)</span>
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

        {/* Time Slots summary */}
        <Card>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Intervale orare
          </h3>
          {form.timeSlots.length > 0 ? (
            <div className="space-y-2">
              {form.timeSlots.map((slot, idx) => (
                <div key={idx} className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-blue-600 shrink-0" />
                  <span className="font-medium text-gray-900">
                    {formatDateRo(slot.date)}
                  </span>
                  <span className="text-blue-600 font-semibold">
                    {slot.startTime} - {slot.endTime}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">Niciun interval selectat.</p>
          )}
        </Card>

        {/* Address summary */}
        <Card>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Adresa
          </h3>
          {(() => {
            const saved = form.useSavedAddress
              ? savedAddresses.find((a) => a.id === form.useSavedAddress)
              : null;
            const street = saved?.streetAddress ?? form.streetAddress;
            const city = saved?.city ?? form.city;
            const county = saved?.county ?? form.county;
            const floor = saved?.floor ?? form.floor;
            const apartment = saved?.apartment ?? form.apartment;
            return (
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                <div className="text-sm text-gray-900">
                  {street}
                  {floor && `, Etaj ${floor}`}
                  {apartment && `, Ap. ${apartment}`}
                  <br />
                  <span className="text-gray-500">
                    {city}, {county}
                  </span>
                </div>
              </div>
            );
          })()}
        </Card>

        {/* Cleaner summary */}
        <Card>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Curatator preferat
          </h3>
          {selectedCleaner ? (
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0',
                  getInitialColor(selectedCleaner.cleaner.fullName),
                )}
              >
                {selectedCleaner.cleaner.fullName.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {selectedCleaner.cleaner.fullName}
                </div>
                <div className="text-xs text-gray-500">
                  {selectedCleaner.company.companyName}
                </div>
                {selectedCleaner.suggestedStartTime && selectedCleaner.suggestedEndTime && (
                  <div className="text-xs text-blue-600 font-medium mt-0.5">
                    {selectedCleaner.suggestedStartTime} - {selectedCleaner.suggestedEndTime} (optimizat)
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                <Users className="h-5 w-5 text-gray-400" />
              </div>
              <div className="text-sm text-gray-900 font-medium">
                Orice curatator disponibil
              </div>
            </div>
          )}
        </Card>

        {/* Price breakdown */}
        <Card>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
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
              {estimate.propertyMultiplier > 1 && (
                <div className="flex justify-between text-gray-600">
                  <span>
                    Multiplicator proprietate (x{estimate.propertyMultiplier})
                  </span>
                  <span className="text-amber-600">inclus</span>
                </div>
              )}
              {estimate.petsSurcharge > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span className="flex items-center gap-1">
                    <PawPrint className="h-3 w-3" />
                    Supliment animale
                  </span>
                  <span>+{estimate.petsSurcharge} lei</span>
                </div>
              )}
              {estimate.extras.map((ext, i) => (
                <div key={i} className="flex justify-between text-gray-600">
                  <span>
                    {ext.extra.nameRo} x{ext.quantity}
                  </span>
                  <span>{ext.lineTotal} lei</span>
                </div>
              ))}
              <div className="flex justify-between font-bold text-gray-900 text-lg pt-3 border-t border-gray-100 mt-1">
                <span>Total estimat</span>
                <span className="text-blue-600">{estimate.total} lei</span>
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
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 resize-none"
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

// ---- Price Sidebar (desktop) ------------------------------------------------

function PriceSidebar({
  form,
  selectedService,
  extras,
  estimate,
  estimateLoading,
}: {
  form: BookingFormState;
  selectedService?: ServiceDefinition;
  extras: ExtraDefinition[];
  estimate?: PriceEstimate;
  estimateLoading: boolean;
}) {
  return (
    <div className="sticky top-8">
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Rezumat comanda
        </h3>

        {selectedService ? (
          <div className="space-y-3 text-sm relative">
            {/* Loading overlay */}
            {estimateLoading && (
              <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10 rounded-xl">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
              </div>
            )}

            {/* Service */}
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <span className="text-lg">
                  {SERVICE_ICONS[form.serviceType] || '\uD83E\uDDF9'}
                </span>
                <span className="font-medium text-gray-900">
                  {selectedService.nameRo}
                </span>
              </div>
              <span className="font-semibold text-gray-900">
                {selectedService.basePricePerHour} lei/ora
              </span>
            </div>

            {/* Property type */}
            {form.propertyType && (
              <div className="flex justify-between">
                <span className="text-gray-500">Tip proprietate</span>
                <span className="font-medium text-gray-900 flex items-center gap-1">
                  {form.propertyType}
                  {form.propertyType === 'Casa' && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold">
                      x1.3
                    </span>
                  )}
                </span>
              </div>
            )}

            {/* Rooms / Bathrooms */}
            <div className="flex justify-between">
              <span className="text-gray-500">Camere</span>
              <span className="font-medium text-gray-900">{form.numRooms}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Bai</span>
              <span className="font-medium text-gray-900">{form.numBathrooms}</span>
            </div>

            {/* Duration estimate */}
            {estimate && (
              <div className="flex justify-between">
                <span className="text-gray-500">Durata estimata</span>
                <span className="font-medium text-gray-900">
                  ~{estimate.estimatedHours} ore
                </span>
              </div>
            )}

            {/* Subtotal */}
            {estimate && (
              <div className="flex justify-between pt-2 border-t border-gray-100">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium text-gray-900">
                  {estimate.subtotal} lei
                </span>
              </div>
            )}

            {/* Extras */}
            {form.extras.filter((e) => e.quantity > 0).length > 0 && (
              <div className="pt-2 border-t border-gray-100">
                <span className="text-gray-500 text-xs uppercase tracking-wide font-semibold">
                  Extra
                </span>
                {form.extras
                  .filter((e) => e.quantity > 0)
                  .map((e) => {
                    const extra = extras.find((x) => x.id === e.extraId);
                    return (
                      <div key={e.extraId} className="flex justify-between mt-1">
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

            {/* Pets surcharge */}
            {estimate && estimate.petsSurcharge > 0 && (
              <div className="flex justify-between text-gray-600">
                <span className="flex items-center gap-1">
                  <PawPrint className="h-3 w-3" />
                  Animale
                </span>
                <span className="font-medium">+{estimate.petsSurcharge} lei</span>
              </div>
            )}

            {/* Total */}
            {estimate && (
              <div className="pt-3 border-t border-gray-200 mt-1">
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-gray-900">Total</span>
                  <span className="text-blue-600">{estimate.total} lei</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  *Estimare - pretul final poate varia
                </p>
              </div>
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

// ---- Mobile Price Footer ----------------------------------------------------

function MobilePriceFooter({
  form,
  selectedService,
  estimate,
  estimateLoading,
  extras,
}: {
  form: BookingFormState;
  selectedService?: ServiceDefinition;
  estimate?: PriceEstimate;
  estimateLoading: boolean;
  extras: ExtraDefinition[];
}) {
  const [expanded, setExpanded] = useState(false);

  if (!selectedService) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] lg:hidden z-40">
      {/* Expanded breakdown */}
      {expanded && (
        <div className="max-h-[50vh] overflow-y-auto px-4 pt-4 pb-2 border-b border-gray-100">
          <div className="max-w-5xl mx-auto space-y-2 text-sm">
            {/* Service */}
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

            {/* Property type */}
            {form.propertyType && (
              <div className="flex justify-between">
                <span className="text-gray-500">Tip</span>
                <span className="font-medium text-gray-900">
                  {form.propertyType}
                  {form.propertyType === 'Casa' && (
                    <span className="text-xs text-amber-600 ml-1">(x1.3)</span>
                  )}
                </span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-gray-500">Camere / Bai</span>
              <span className="font-medium text-gray-900">
                {form.numRooms} / {form.numBathrooms}
              </span>
            </div>

            {/* Duration */}
            {estimate && (
              <div className="flex justify-between">
                <span className="text-gray-500">Durata</span>
                <span className="font-medium text-gray-900">
                  ~{estimate.estimatedHours} ore
                </span>
              </div>
            )}

            {/* Subtotal */}
            {estimate && (
              <div className="flex justify-between pt-1 border-t border-gray-100">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium">{estimate.subtotal} lei</span>
              </div>
            )}

            {/* Extras */}
            {form.extras
              .filter((e) => e.quantity > 0)
              .map((e) => {
                const extra = extras.find((x) => x.id === e.extraId);
                return (
                  <div key={e.extraId} className="flex justify-between">
                    <span className="text-gray-600">{extra?.nameRo} x{e.quantity}</span>
                    <span>+{(extra?.price ?? 0) * e.quantity} lei</span>
                  </div>
                );
              })}

            {/* Pets */}
            {estimate && estimate.petsSurcharge > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Animale</span>
                <span>+{estimate.petsSurcharge} lei</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Collapsed bar */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full cursor-pointer"
      >
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <div className="text-xs text-gray-500 text-left">
                {selectedService.nameRo}
              </div>
              <div className="text-lg font-bold text-gray-900">
                {estimateLoading ? (
                  <span className="text-sm text-gray-400">Se calculeaza...</span>
                ) : estimate ? (
                  `${estimate.total} lei`
                ) : (
                  `de la ${selectedService.basePricePerHour * selectedService.minHours} lei`
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">
              {form.numRooms} camere, {form.numBathrooms} bai
            </span>
            {expanded ? (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronUp className="h-4 w-4 text-gray-400" />
            )}
          </div>
        </div>
      </button>
    </div>
  );
}
