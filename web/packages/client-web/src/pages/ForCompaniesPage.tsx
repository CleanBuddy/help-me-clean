import SEOHead from '@/components/seo/SEOHead';
import { Link } from 'react-router-dom';
import { Laptop, CreditCard, BarChart2, TrendingUp, FileCheck, CheckCircle, ArrowRight } from 'lucide-react';

export default function ForCompaniesPage() {
  return (
    <>
      <SEOHead
        title="Pentru Firme de Curățenie | HelpMeClean.ro"
        description="Parteneriat cu HelpMeClean: obține clienți noi online, gestionează rezervările digital și crește-ți afacerea de curățenie în România."
        canonicalUrl="/pentru-firme"
      />
      <div className="bg-white">
        {/* Hero */}
        <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-24 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Crește-ți afacerea cu HelpMeClean
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-10">
              Aducem clienți noi direct la ușa ta. Fără comisioane ascunse, fără bătăi de cap —
              doar comenzi verificate și plăți garantate.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/inregistrare-firma"
                className="inline-block bg-white text-blue-600 font-semibold px-8 py-3 rounded-xl hover:bg-blue-50 transition"
              >
                Aplică acum
              </Link>
              <Link
                to="/lista-asteptare"
                className="inline-block bg-blue-500 text-white font-semibold px-8 py-3 rounded-xl hover:bg-blue-400 transition border border-blue-400"
              >
                Înscrie-te pe lista de așteptare
              </Link>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">
              De ce să alegi HelpMeClean?
            </h2>
            <p className="text-gray-500 text-center mb-12">
              Platforma construită special pentru firmele de curățenie din România.
            </p>
            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  icon: Laptop,
                  title: 'Clienți noi online',
                  desc: 'Ajungem la mii de gospodării din București și orașele mari. Tu te ocupi de curățenie, noi de marketing.',
                },
                {
                  icon: CreditCard,
                  title: 'Plăți digitale sigure',
                  desc: 'Plățile sunt procesate online și garantate. Nu mai alergi după bani — încasezi direct în cont.',
                },
                {
                  icon: BarChart2,
                  title: 'Management simplificat',
                  desc: 'Dashboard dedicat pentru gestionarea comenzilor, echipei și programului. Totul într-un singur loc.',
                },
                {
                  icon: TrendingUp,
                  title: 'Creștere garantată',
                  desc: 'Firmele partenere raportează o creștere medie de 40% a comenzilor în primele 3 luni de activitate.',
                },
              ].map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="flex gap-4 p-6 rounded-xl border border-gray-200 hover:border-blue-200 hover:shadow-sm transition"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How to join */}
        <section className="bg-gray-50 py-20 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">
              Cum devii partener?
            </h2>
            <p className="text-gray-500 text-center mb-12">Procesul durează mai puțin de 10 minute.</p>
            <div className="space-y-6">
              {[
                {
                  step: '01',
                  title: 'Aplică online',
                  desc: 'Completează formularul cu datele firmei tale: CUI, persoană de contact, zona de acoperire.',
                },
                {
                  step: '02',
                  title: 'Verificare documente',
                  desc: 'Echipa noastră verifică documentele firmei (certificat de înregistrare, asigurare civilă) în maxim 48 de ore.',
                },
                {
                  step: '03',
                  title: 'Primești comenzi',
                  desc: 'Contul tău este activat și începi să primești rezervări din platforma HelpMeClean direct pe telefon.',
                },
              ].map(({ step, title, desc }) => (
                <div key={step} className="flex gap-6 items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {step}
                  </div>
                  <div className="pt-1">
                    <h3 className="font-semibold text-gray-900 text-lg mb-1">{title}</h3>
                    <p className="text-gray-600">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Requirements */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
              Cerințe pentru parteneri
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: FileCheck,
                  title: 'CUI valid',
                  desc: 'Firmă înregistrată legal în România cu cod unic de identificare fiscală activ.',
                },
                {
                  icon: CheckCircle,
                  title: 'Asigurare civilă',
                  desc: 'Poliță de asigurare civilă pentru activitățile de curățenie, acoperind eventualele daune.',
                },
                {
                  icon: FileCheck,
                  title: 'Documente firmă',
                  desc: 'Certificat de înregistrare la Registrul Comerțului și actul constitutiv.',
                },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="text-center p-6 rounded-xl border border-gray-200">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-6 w-6 text-emerald-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                  <p className="text-gray-600 text-sm">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-blue-600 text-white py-16 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Pregătit să crești?</h2>
            <p className="text-blue-100 mb-8 text-lg">
              Alătură-te primelor firme partenere și obține acces prioritar la comenzile din platforma HelpMeClean.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/inregistrare-firma"
                className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 font-semibold px-8 py-3 rounded-xl hover:bg-blue-50 transition"
              >
                Aplică acum
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/lista-asteptare"
                className="inline-flex items-center justify-center gap-2 bg-blue-500 text-white font-semibold px-8 py-3 rounded-xl hover:bg-blue-400 transition border border-blue-400"
              >
                Înscrie-te pe lista de așteptare
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
