import { useTranslation } from 'react-i18next';
import SEOHead from '@/components/seo/SEOHead';
import { useLanguage } from '@/context/LanguageContext';
import { ROUTE_MAP } from '@/i18n/routes';

export default function PrivacyPage() {
  const { t } = useTranslation('legal');
  const { lang } = useLanguage();

  const dataCategories = [
    {
      title: t('privacy.s2.cat1Title'),
      items: t('privacy.s2.cat1Items', { returnObjects: true }) as string[],
    },
    {
      title: t('privacy.s2.cat2Title'),
      items: t('privacy.s2.cat2Items', { returnObjects: true }) as string[],
    },
    {
      title: t('privacy.s2.cat3Title'),
      items: t('privacy.s2.cat3Items', { returnObjects: true }) as string[],
    },
    {
      title: t('privacy.s2.cat4Title'),
      items: t('privacy.s2.cat4Items', { returnObjects: true }) as string[],
    },
  ];

  const scopes = [
    { scope: t('privacy.s3.scope1'), desc: t('privacy.s3.scope1Desc') },
    { scope: t('privacy.s3.scope2'), desc: t('privacy.s3.scope2Desc') },
    { scope: t('privacy.s3.scope3'), desc: t('privacy.s3.scope3Desc') },
    { scope: t('privacy.s3.scope4'), desc: t('privacy.s3.scope4Desc') },
    { scope: t('privacy.s3.scope5'), desc: t('privacy.s3.scope5Desc') },
    { scope: t('privacy.s3.scope6'), desc: t('privacy.s3.scope6Desc') },
  ];

  const legalBases = [
    t('privacy.s4.b1'),
    t('privacy.s4.b2'),
    t('privacy.s4.b3'),
    t('privacy.s4.b4'),
  ];

  const rights = [
    { right: t('privacy.s5.r1'), desc: t('privacy.s5.r1Desc') },
    { right: t('privacy.s5.r2'), desc: t('privacy.s5.r2Desc') },
    { right: t('privacy.s5.r3'), desc: t('privacy.s5.r3Desc') },
    { right: t('privacy.s5.r4'), desc: t('privacy.s5.r4Desc') },
    { right: t('privacy.s5.r5'), desc: t('privacy.s5.r5Desc') },
    { right: t('privacy.s5.r6'), desc: t('privacy.s5.r6Desc') },
  ];

  const cookies = [
    { type: t('privacy.s6.c1'), desc: t('privacy.s6.c1Desc') },
    { type: t('privacy.s6.c2'), desc: t('privacy.s6.c2Desc') },
    { type: t('privacy.s6.c3'), desc: t('privacy.s6.c3Desc') },
  ];

  return (
    <>
      <SEOHead
        title={t('privacy.meta.title')}
        description={t('privacy.meta.description')}
        canonicalUrl={ROUTE_MAP.privacy[lang]}
        lang={lang}
        alternateUrl={{ ro: ROUTE_MAP.privacy.ro, en: ROUTE_MAP.privacy.en }}
        noIndex={true}
      />
      <div className="bg-white py-16 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('privacy.title')}</h1>
            <p className="text-gray-500">
              <time dateTime="2024-01-01">{t('privacy.lastUpdated')}</time>
            </p>
            <p className="text-gray-600 mt-4 leading-relaxed">
              {t('privacy.intro')}
            </p>
          </div>

          <div className="prose prose-gray max-w-none space-y-10 text-gray-700">
            {/* 1. Operatorul de date */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('privacy.s1.title')}</h2>
              <p className="leading-relaxed">{t('privacy.s1.p1')}</p>
            </section>

            {/* 2. Datele colectate */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('privacy.s2.title')}</h2>
              <p className="leading-relaxed mb-4">{t('privacy.s2.intro')}</p>
              <div className="space-y-4">
                {dataCategories.map(({ title, items }) => (
                  <div key={title} className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            {/* 3. Scopul prelucrării */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('privacy.s3.title')}</h2>
              <p className="leading-relaxed mb-4">{t('privacy.s3.intro')}</p>
              <ul className="space-y-3">
                {scopes.map(({ scope, desc }) => (
                  <li key={scope} className="flex gap-2">
                    <span className="font-semibold text-gray-900 shrink-0">{scope}:</span>
                    <span>{desc};</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* 4. Temeiul juridic */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('privacy.s4.title')}</h2>
              <p className="leading-relaxed mb-4">{t('privacy.s4.intro')}</p>
              <ul className="list-disc list-inside space-y-2">
                {legalBases.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </section>

            {/* 5. Drepturile tale */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('privacy.s5.title')}</h2>
              <p className="leading-relaxed mb-4">{t('privacy.s5.intro')}</p>
              <div className="grid md:grid-cols-2 gap-4">
                {rights.map(({ right, desc }) => (
                  <div key={right} className="p-4 rounded-xl border border-gray-200">
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">{right}</h3>
                    <p className="text-sm text-gray-600">{desc}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm leading-relaxed">{t('privacy.s5.contact')}</p>
            </section>

            {/* 6. Cookies */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('privacy.s6.title')}</h2>
              <p className="leading-relaxed mb-4">{t('privacy.s6.intro')}</p>
              <div className="space-y-3">
                {cookies.map(({ type, desc }) => (
                  <div key={type} className="flex gap-3 p-4 rounded-xl bg-gray-50 border border-gray-200">
                    <div>
                      <span className="font-semibold text-gray-900 text-sm">{type}: </span>
                      <span className="text-sm text-gray-600">{desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 7. Retenție date */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('privacy.s7.title')}</h2>
              <p className="leading-relaxed">{t('privacy.s7.p1')}</p>
            </section>

            {/* 8. Contact DPO */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('privacy.s8.title')}</h2>
              <p className="leading-relaxed">{t('privacy.s8.p1')}</p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
