import { useTranslation } from 'react-i18next';
import SEOHead from '@/components/seo/SEOHead';
import { Link } from 'react-router-dom';
import { CheckCircle, Users, TrendingUp, Shield } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { ROUTE_MAP } from '@/i18n/routes';

export default function AboutPage() {
  const { t } = useTranslation('about');
  const { lang } = useLanguage();

  const values = [
    { icon: Shield, title: t('values.transparency.title'), desc: t('values.transparency.desc') },
    { icon: CheckCircle, title: t('values.quality.title'), desc: t('values.quality.desc') },
    { icon: Users, title: t('values.community.title'), desc: t('values.community.desc') },
    { icon: TrendingUp, title: t('values.growth.title'), desc: t('values.growth.desc') },
  ];

  const stats = [
    { value: '2M+', label: t('stats.households') },
    { value: '5.000+', label: t('stats.companies') },
    { value: '80%', label: t('stats.informal') },
    { value: '2024', label: t('stats.founded') },
  ];

  return (
    <>
      <SEOHead
        title={t('meta.title')}
        description={t('meta.description')}
        canonicalUrl={ROUTE_MAP.about[lang]}
        lang={lang}
        alternateUrl={{ ro: ROUTE_MAP.about.ro, en: ROUTE_MAP.about.en }}
      />
      <div className="bg-white">
        {/* Hero */}
        <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-24 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {t('hero.title')}
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              {t('hero.subtitle')}
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">{t('mission.title')}</h2>
            <p className="text-lg text-gray-600 mb-6">
              {t('mission.p1')}
            </p>
            <p className="text-lg text-gray-600">
              {t('mission.p2')}
            </p>
          </div>
        </section>

        {/* Stats */}
        <section className="bg-gray-50 py-16 px-4">
          <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map(({ value, label }) => (
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
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">{t('values.title')}</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {values.map(({ icon: Icon, title, desc }) => (
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
            <h2 className="text-3xl font-bold mb-4">{t('cta.title')}</h2>
            <p className="text-blue-100 mb-8">
              {t('cta.subtitle')}
            </p>
            <Link
              to={ROUTE_MAP.waitlist[lang]}
              className="inline-block bg-white text-blue-600 font-semibold px-8 py-3 rounded-xl hover:bg-blue-50 transition"
            >
              {t('cta.button')}
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
