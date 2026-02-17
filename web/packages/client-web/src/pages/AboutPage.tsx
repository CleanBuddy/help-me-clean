import SEOHead from '@/components/seo/SEOHead';
import { Link } from 'react-router-dom';
import { CheckCircle, Users, TrendingUp, Shield } from 'lucide-react';

export default function AboutPage() {
  return (
    <>
      <SEOHead
        title="Despre Noi | HelpMeClean.ro"
        description="HelpMeClean este prima platformă de servicii de curățenie din România. Misiunea noastră este să conectăm clienții cu firme de curățenie verificate."
        canonicalUrl="/despre-noi"
      />
      <div className="bg-white">
        {/* Hero */}
        <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-24 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Prima platformă de curățenie din România
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Conectăm clienții cu firme de curățenie verificate, transparent și rapid.
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Misiunea noastră</h2>
            <p className="text-lg text-gray-600 mb-6">
              Sectorul de curățenie din România este în mare parte informal — milioane de tranzacții
              se fac fără factură, fără garanții și fără protecție. HelpMeClean schimbă asta.
            </p>
            <p className="text-lg text-gray-600">
              Creăm prima piață digitală de servicii de curățenie din România, unde firmele sunt
              verificate, plățile sunt sigure și calitatea este garantată.
            </p>
          </div>
        </section>

        {/* Stats */}
        <section className="bg-gray-50 py-16 px-4">
          <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '2M+', label: 'Gospodării în București' },
              { value: '5.000+', label: 'Firme de curățenie în RO' },
              { value: '80%', label: 'Piață informală' },
              { value: '2024', label: 'Anul fondării' },
            ].map(({ value, label }) => (
              <div key={label}>
                <div className="text-3xl font-bold text-blue-600">{value}</div>
                <div className="text-sm text-gray-500 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Values */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Valorile noastre</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  icon: Shield,
                  title: 'Transparență',
                  desc: 'Prețuri clare, fără costuri ascunse. Știi exact ce plătești.',
                },
                {
                  icon: CheckCircle,
                  title: 'Calitate verificată',
                  desc: 'Fiecare firmă trece printr-un proces riguros de verificare.',
                },
                {
                  icon: Users,
                  title: 'Comunitate',
                  desc: 'Construim o comunitate de profesioniști și clienți mulțumiți.',
                },
                {
                  icon: TrendingUp,
                  title: 'Creștere',
                  desc: 'Ajutăm firmele de curățenie să-și digitalizeze afacerea.',
                },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                    <p className="text-gray-600 text-sm">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-blue-600 text-white py-16 px-4 text-center">
          <div className="max-w-xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">Vrei să fii primul care ne testează?</h2>
            <p className="text-blue-100 mb-8">
              Platforma se lansează în curând. Înscrie-te și primești acces prioritar.
            </p>
            <Link
              to="/lista-asteptare"
              className="inline-block bg-white text-blue-600 font-semibold px-8 py-3 rounded-xl hover:bg-blue-50 transition"
            >
              Înscrie-te pe lista de așteptare
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
