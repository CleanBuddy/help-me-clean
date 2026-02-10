import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import {
  Sparkles,
  CalendarCheck,
  Smile,
  ArrowRight,
  Star,
  Shield,
  Clock,
  CreditCard,
  Eye,
  Headphones,
  Building2,
  Users,
  TrendingUp,
  FileText,
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

// ─── Icon map for service types ──────────────────────────────────────────────

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

// ─── Trust items ─────────────────────────────────────────────────────────────

const TRUST_ITEMS = [
  {
    icon: Shield,
    title: 'Firme verificate',
    description:
      'Toate firmele de curatenie sunt verificate si indeplinesc standarde stricte de calitate.',
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    icon: CreditCard,
    title: 'Plati sigure',
    description:
      'Platile sunt procesate in siguranta. Platesti doar dupa ce serviciul a fost efectuat.',
    color: 'text-secondary',
    bg: 'bg-secondary/10',
  },
  {
    icon: Eye,
    title: 'Preturi transparente',
    description:
      'Fara costuri ascunse. Vezi pretul estimat inainte de a confirma rezervarea.',
    color: 'text-accent',
    bg: 'bg-accent/10',
  },
  {
    icon: Headphones,
    title: 'Suport rapid',
    description:
      'Echipa noastra de suport este disponibila pentru a te ajuta cu orice intrebare.',
    color: 'text-purple-600',
    bg: 'bg-purple-100',
  },
];

const PARTNER_BENEFITS = [
  {
    icon: Users,
    title: 'Acces la clienti noi',
    description: 'Primeste comenzi de la clienti verificati din zona ta de acoperire.',
  },
  {
    icon: CreditCard,
    title: 'Plati digitale',
    description: 'Incaseaza platile online, fara batai de cap cu numerarul.',
  },
  {
    icon: FileText,
    title: 'Administrare simplificata',
    description: 'Dashboard dedicat pentru comenzi, echipa si comunicare cu clientii.',
  },
  {
    icon: TrendingUp,
    title: 'Creste-ti afacerea',
    description: 'Vizibilitate pe platforma, recenzii si rating pentru a atrage mai multi clienti.',
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function HomePage() {
  const navigate = useNavigate();
  const { data, loading } = useQuery(AVAILABLE_SERVICES);

  const services: ServiceDefinition[] = data?.availableServices ?? [];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/5 via-white to-secondary/5 py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Curatenie profesionala,
            <br />
            <span className="text-primary">la un click distanta</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            Conectam clientii cu firme de curatenie verificate din Romania.
            Plati digitale, facturare automata, transparenta totala.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/rezervare')}>
              Rezerva o curatenie
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/servicii')}
            >
              Vezi serviciile
            </Button>
          </div>

          {/* Trust badges */}
          <div className="mt-14 flex flex-wrap justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-secondary" />
              <span>Firme verificate</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-accent" />
              <span>Recenzii reale</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <span>Rezervare rapida</span>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Serviciile noastre
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Alege tipul de curatenie de care ai nevoie si rezerva in cateva
              minute.
            </p>
          </div>

          {loading ? (
            <LoadingSpinner text="Se incarca serviciile..." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.slice(0, 6).map((service) => (
                <Card
                  key={service.id}
                  className="hover:shadow-md transition-shadow cursor-pointer group"
                  onClick={() =>
                    navigate(`/rezervare?service=${service.serviceType}`)
                  }
                >
                  <div className="text-4xl mb-4">
                    {SERVICE_ICONS[service.serviceType] ||
                      service.icon ||
                      '🧹'}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                    {service.nameRo}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                    {service.descriptionRo}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-primary">
                      {service.basePricePerHour} lei
                    </span>
                    <span className="text-sm text-gray-400">/ora</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Minim {service.minHours} ore
                  </p>
                </Card>
              ))}
            </div>
          )}

          {services.length > 6 && (
            <div className="text-center mt-10">
              <Button variant="outline" onClick={() => navigate('/servicii')}>
                Vezi toate serviciile
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section id="cum-functioneaza" className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Cum functioneaza?
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Trei pasi simpli catre o locuinta curata.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <div className="text-sm font-semibold text-primary mb-2">
                Pasul 1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Alege serviciul
              </h3>
              <p className="text-gray-500 text-sm">
                Selecteaza tipul de curatenie, numarul de camere si data dorita.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto mb-5">
                <CalendarCheck className="h-8 w-8 text-secondary" />
              </div>
              <div className="text-sm font-semibold text-secondary mb-2">
                Pasul 2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Programeaza
              </h3>
              <p className="text-gray-500 text-sm">
                Confirma detaliile si plaseaza comanda. O firma de curatenie va
                prelua cererea ta.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-5">
                <Smile className="h-8 w-8 text-accent" />
              </div>
              <div className="text-sm font-semibold text-accent mb-2">
                Pasul 3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Bucura-te de rezultat
              </h3>
              <p className="text-gray-500 text-sm">
                Echipa de curatenie vine la tine. Tu te relaxezi, noi ne ocupam
                de restul.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Button size="lg" onClick={() => navigate('/rezervare')}>
              Incepe acum
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* De ce HelpMeClean? */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              De ce HelpMeClean?
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Siguranta, transparenta si calitate in fiecare serviciu.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TRUST_ITEMS.map((item) => (
              <Card key={item.title} className="text-center">
                <div
                  className={`w-14 h-14 rounded-2xl ${item.bg} flex items-center justify-center mx-auto mb-4`}
                >
                  <item.icon className={`h-7 w-7 ${item.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500">{item.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Partner / For Companies Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-secondary/5 via-white to-primary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto mb-5">
              <Building2 className="h-8 w-8 text-secondary" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Esti firma de curatenie?
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Alatura-te platformei HelpMeClean si primeste comenzi de la clienti
              din toata Romania.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {PARTNER_BENEFITS.map((benefit) => (
              <Card key={benefit.title} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="h-7 w-7 text-secondary" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {benefit.title}
                </h3>
                <p className="text-sm text-gray-500">{benefit.description}</p>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Link to="/inregistrare-firma">
              <Button size="lg" variant="outline">
                Aplica ca partener
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
