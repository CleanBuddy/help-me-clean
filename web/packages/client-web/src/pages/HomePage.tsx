import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { useAuth } from '@/context/AuthContext';
import {
  Sparkles,
  CalendarCheck,
  Smile,
  ArrowRight,
  Star,
  Shield,
  CreditCard,
  Eye,
  Headphones,
  Building2,
  Users,
  TrendingUp,
  FileText,
  CheckCircle2,
  BadgeCheck,
  Banknote,
  CalendarX2,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { AVAILABLE_SERVICES } from '@/graphql/operations';

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

// ─── Data ─────────────────────────────────────────────────────────────────────

const SERVICE_ICONS: Record<string, string> = {
  STANDARD_CLEANING: '🏠',
  DEEP_CLEANING: '✨',
  OFFICE_CLEANING: '🏢',
  POST_CONSTRUCTION: '🔨',
  MOVE_IN_OUT_CLEANING: '📦',
  WINDOW_CLEANING: '🪟',
  CARPET_CLEANING: '🧹',
  UPHOLSTERY_CLEANING: '🛋️',
};

const SERVICE_COLORS: Record<string, string> = {
  STANDARD_CLEANING: 'border-t-primary',
  DEEP_CLEANING: 'border-t-secondary',
  OFFICE_CLEANING: 'border-t-blue-400',
  POST_CONSTRUCTION: 'border-t-amber-500',
  MOVE_IN_OUT_CLEANING: 'border-t-purple-500',
  WINDOW_CLEANING: 'border-t-sky-400',
  CARPET_CLEANING: 'border-t-emerald-400',
  UPHOLSTERY_CLEANING: 'border-t-rose-400',
};

const TRUST_ITEMS = [
  {
    icon: Shield,
    title: 'Firme verificate',
    description: 'Toate firmele partenere trec printr-un proces strict de verificare și acreditare.',
    color: 'text-primary',
    bg: 'bg-blue-50',
    border: 'border-l-primary',
  },
  {
    icon: CreditCard,
    title: 'Plăți sigure',
    description: 'Platești online în siguranță. Banii ajung la firmă doar după finalizarea lucrării.',
    color: 'text-secondary',
    bg: 'bg-emerald-50',
    border: 'border-l-secondary',
  },
  {
    icon: Eye,
    title: 'Prețuri transparente',
    description: 'Niciun cost ascuns. Știi prețul final înainte de a confirma rezervarea.',
    color: 'text-accent',
    bg: 'bg-amber-50',
    border: 'border-l-accent',
  },
  {
    icon: Headphones,
    title: 'Suport rapid',
    description: 'Echipa noastră este disponibilă să te ajute cu orice problemă sau întrebare.',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-l-purple-500',
  },
];

const PARTNER_BENEFITS = [
  {
    icon: Users,
    title: 'Clienți noi',
    description: 'Primești comenzi de la clienți verificați din zona ta de acoperire.',
  },
  {
    icon: CreditCard,
    title: 'Plăți digitale',
    description: 'Încasezi online, fără bătăi de cap cu numerarul sau facturile.',
  },
  {
    icon: FileText,
    title: 'Administrare simplă',
    description: 'Dashboard dedicat pentru comenzi, echipă și comunicare cu clienții.',
  },
  {
    icon: TrendingUp,
    title: 'Creștere garantată',
    description: 'Vizibilitate pe platformă, recenzii și rating pentru mai mulți clienți.',
  },
];

const STATS = [
  { value: '500+', label: 'Rezervări efectuate' },
  { value: '50+', label: 'Firme partenere' },
  { value: '4.9★', label: 'Rating mediu' },
  { value: '100%', label: 'Plăți securizate' },
];

const TESTIMONIALS = [
  {
    name: 'Maria Ionescu',
    city: 'București',
    text: 'Am găsit o firmă excelentă în mai puțin de 5 minute. Serviciu impecabil, recomand cu toată încrederea!',
    rating: 5,
  },
  {
    name: 'Andrei Popescu',
    city: 'Cluj-Napoca',
    text: 'Platforma e simplă și intuitivă. Am rezervat curățenie de 3 ori și de fiecare dată a fost perfect.',
    rating: 5,
  },
  {
    name: 'Elena Dumitrescu',
    city: 'Timișoara',
    text: 'Prețuri transparente, fără surprize neplăcute. Echipa de curățenie a fost punctuală și profesionistă.',
    rating: 5,
  },
];

const TRUST_BADGES = [
  { icon: BadgeCheck, label: 'Firme verificate și asigurate' },
  { icon: Banknote, label: 'Plată securizată' },
  { icon: CheckCircle2, label: 'Fără abonament' },
  { icon: CalendarX2, label: 'Anulare gratuită' },
];

const AVATAR_COLORS = ['#2563EB', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444'];
const AVATAR_INITIALS = ['M', 'A', 'E', 'D', 'R'];

// ─── Component ───────────────────────────────────────────────────────────────

function scrollToServices() {
  document.getElementById('servicii')?.scrollIntoView({ behavior: 'smooth' });
}

export default function HomePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { data, loading } = useQuery(AVAILABLE_SERVICES);

  const isClient = isAuthenticated && user?.role === 'CLIENT';
  const isCompanyOrWorker =
    isAuthenticated && (user?.role === 'COMPANY_ADMIN' || user?.role === 'CLEANER');
  const isGlobalAdmin = isAuthenticated && user?.role === 'GLOBAL_ADMIN';

  const dashboardPath = isClient
    ? '/cont'
    : isCompanyOrWorker
      ? user?.role === 'COMPANY_ADMIN'
        ? '/firma'
        : '/worker'
      : '/admin';

  const services: ServiceDefinition[] = data?.availableServices ?? [];

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="bg-white pt-16 pb-12 sm:pt-24 sm:pb-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            {/* Left — text */}
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-50 text-primary text-sm font-semibold px-4 py-2 rounded-full mb-6">
                <Sparkles className="h-4 w-4" />
                Platforma #1 de curățenie din România
              </div>

              <h1 className="text-5xl sm:text-6xl font-black text-gray-900 leading-[1.05] tracking-tight mb-6">
                Casă curată,<br />
                <span className="text-primary">fără bătăi</span><br />
                de cap.
              </h1>

              <p className="text-lg text-gray-500 leading-relaxed mb-8 max-w-lg">
                Conectăm clienții cu firme de curățenie verificate din România.
                Rezervi în 2 minute, plătești online, te bucuri de rezultat.
              </p>

              {authLoading ? (
                <div className="flex flex-col sm:flex-row gap-3 mb-10">
                  <div className="h-11 w-44 bg-gray-100 rounded-xl animate-pulse" />
                  <div className="h-11 w-36 bg-gray-100 rounded-xl animate-pulse" />
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3 mb-10">
                  {isCompanyOrWorker ? (
                    <Button size="lg" onClick={() => navigate(dashboardPath)}>
                      Mergi la contul tău <ArrowRight className="h-5 w-5" />
                    </Button>
                  ) : isGlobalAdmin ? (
                    <>
                      <Button size="lg" onClick={() => navigate('/admin')}>
                        Panou admin <ArrowRight className="h-5 w-5" />
                      </Button>
                      <Button size="lg" variant="outline" onClick={() => scrollToServices()}>
                        Vezi serviciile
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button size="lg" onClick={() => navigate('/rezervare')}>
                        Rezervă o curățenie <ArrowRight className="h-5 w-5" />
                      </Button>
                      {isClient ? (
                        <Button size="lg" variant="outline" onClick={() => navigate('/cont')}>
                          Contul meu
                        </Button>
                      ) : (
                        <Button size="lg" variant="outline" onClick={() => scrollToServices()}>
                          Vezi serviciile
                        </Button>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Social proof */}
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {AVATAR_COLORS.map((color, i) => (
                    <div
                      key={i}
                      className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white"
                      style={{ backgroundColor: color }}
                    >
                      {AVATAR_INITIALS[i]}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500">
                  <span className="font-semibold text-gray-900">500+</span> rezervări efectuate
                </p>
              </div>
            </div>

            {/* Right — decorative booking card mockup */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-80 h-80 bg-blue-50 rounded-full blur-3xl opacity-70" />
              </div>
              <div className="relative w-full max-w-sm">
                {/* Main booking card */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Rezervare confirmată</p>
                      <p className="text-lg font-bold text-gray-900">Curățenie Standard</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                      <CheckCircle2 className="h-5 w-5 text-secondary" />
                    </div>
                  </div>

                  <div className="space-y-3 mb-5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Data</span>
                      <span className="font-medium text-gray-900">Mâine, 10:00</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Durată</span>
                      <span className="font-medium text-gray-900">3 ore</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Firmă</span>
                      <span className="font-medium text-gray-900">CleanPro SRL</span>
                    </div>
                    <div className="h-px bg-gray-100" />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Total</span>
                      <span className="text-xl font-black text-primary">180 lei</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-emerald-50 rounded-xl px-4 py-2.5">
                    <CheckCircle2 className="h-4 w-4 text-secondary flex-shrink-0" />
                    <p className="text-xs text-secondary font-semibold">Plată securizată · Anulare gratuită</p>
                  </div>
                </div>

                {/* Floating rating badge */}
                <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-lg border border-gray-100 px-4 py-3 flex items-center gap-2.5">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">4.9/5</p>
                    <p className="text-xs text-gray-400">500+ recenzii</p>
                  </div>
                </div>

                {/* Floating firm badge */}
                <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-lg border border-gray-100 px-4 py-3">
                  <p className="text-xs text-gray-400 mb-0.5">Firmă verificată</p>
                  <div className="flex items-center gap-1.5">
                    <BadgeCheck className="h-4 w-4 text-primary" />
                    <p className="text-xs font-bold text-gray-900">CleanPro SRL</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust bar ────────────────────────────────────────────────────────── */}
      <section className="border-y border-gray-100 bg-gray-50 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {TRUST_BADGES.map((badge) => (
              <div key={badge.label} className="flex items-center gap-2 text-sm text-gray-500">
                <badge.icon className="h-4 w-4 text-secondary flex-shrink-0" />
                <span>{badge.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services ─────────────────────────────────────────────────────────── */}
      <section id="servicii" className="py-20 sm:py-24 bg-white scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-12">
            <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">Servicii</p>
            <h2 className="text-4xl font-black text-gray-900 mb-4">
              Ce putem face pentru tine?
            </h2>
            <p className="text-gray-500 max-w-xl text-lg">
              Alege tipul de curățenie potrivit și rezervă în câteva minute.
            </p>
          </div>

          {loading ? (
            <LoadingSpinner text="Se încarcă serviciile..." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {services.map((service) => (
                <Card
                  key={service.id}
                  className={`border-t-4 ${SERVICE_COLORS[service.serviceType] ?? 'border-t-gray-200'} hover:-translate-y-1 hover:shadow-lg transition-all duration-200 cursor-pointer group`}
                  onClick={() => navigate(`/rezervare?service=${service.serviceType}`)}
                >
                  <div className="text-3xl mb-4">
                    {SERVICE_ICONS[service.serviceType] || service.icon || '🧹'}
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                    {service.nameRo}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                    {service.descriptionRo}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black text-primary">
                      {service.basePricePerHour} lei
                    </span>
                    <span className="text-sm text-gray-400">/oră</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Minim {service.minHours} ore
                  </p>
                </Card>
              ))}
            </div>
          )}

        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────────── */}
      <section id="cum-functioneaza" className="py-20 sm:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">Proces</p>
            <h2 className="text-4xl font-black text-gray-900 mb-4">
              Cum funcționează?
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-lg">
              Trei pași simpli către o locuință curată.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-5">
                <Sparkles className="h-7 w-7 text-primary" />
              </div>
              <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-black mb-3">
                1
              </div>
              <h3 className="text-lg font-black text-gray-900 mb-2">Alege serviciul</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Selectează tipul de curățenie, numărul de camere și data dorită.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-5">
                <CalendarCheck className="h-7 w-7 text-secondary" />
              </div>
              <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-secondary text-white text-xs font-black mb-3">
                2
              </div>
              <h3 className="text-lg font-black text-gray-900 mb-2">Programează</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Confirmă detaliile și plasează comanda. O firmă va prelua cererea ta rapid.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-5">
                <Smile className="h-7 w-7 text-accent" />
              </div>
              <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-accent text-white text-xs font-black mb-3">
                3
              </div>
              <h3 className="text-lg font-black text-gray-900 mb-2">Bucură-te de rezultat</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Echipa vine la tine. Tu te relaxezi, noi ne ocupăm de restul.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Button size="lg" onClick={() => navigate('/rezervare')}>
              Rezervă acum <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* ── Stats strip ──────────────────────────────────────────────────────── */}
      <section className="py-16 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <p className="text-4xl font-black text-white mb-1">{stat.value}</p>
                <p className="text-sm font-medium text-white/60">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why HelpMeClean ──────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-12">
            <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">De ce noi</p>
            <h2 className="text-4xl font-black text-gray-900 mb-4">
              De ce HelpMeClean?
            </h2>
            <p className="text-gray-500 max-w-xl text-lg">
              Siguranță, transparență și calitate în fiecare serviciu.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {TRUST_ITEMS.map((item) => (
              <div
                key={item.title}
                className={`bg-white rounded-2xl p-6 border border-gray-100 border-l-4 ${item.border} shadow-sm`}
              >
                <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center mb-4`}>
                  <item.icon className={`h-6 w-6 ${item.color}`} />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">Recenzii</p>
            <h2 className="text-4xl font-black text-gray-900 mb-4">
              Ce spun clienții noștri
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm flex flex-col">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-700 leading-relaxed text-sm flex-1 mb-5">
                  "{t.text}"
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-xs font-bold text-primary">
                    {t.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── For Companies ────────────────────────────────────────────────────── */}
      {!authLoading && !isClient && !isCompanyOrWorker && (
        <section className="py-20 sm:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="mb-12">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center mb-5">
                <Building2 className="h-6 w-6 text-secondary" />
              </div>
              <p className="text-secondary text-sm font-semibold uppercase tracking-widest mb-3">Parteneri</p>
              <h2 className="text-4xl font-black text-gray-900 mb-4">
                Ești firmă de curățenie?
              </h2>
              <p className="text-gray-500 max-w-xl text-lg">
                Alătură-te platformei HelpMeClean și primește comenzi de la clienți din toată România.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
              {PARTNER_BENEFITS.map((benefit) => (
                <div key={benefit.title} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center mb-4">
                    <benefit.icon className="h-6 w-6 text-secondary" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{benefit.description}</p>
                </div>
              ))}
            </div>

            <Link to="/inregistrare-firma">
              <Button size="lg">
                Aplică ca partener <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
