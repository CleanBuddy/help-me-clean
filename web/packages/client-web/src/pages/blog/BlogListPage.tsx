import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Clock, Calendar, ArrowRight } from 'lucide-react';
import SEOHead from '@/components/seo/SEOHead';
import {
  getPostsByLanguage,
  CATEGORY_COLORS,
  type BlogCategory,
} from '@/data/blog';
import { useLanguage } from '@/context/LanguageContext';
import { ROUTE_MAP } from '@/i18n/routes';

const ALL_CATEGORIES = ['all', 'sfaturi', 'ghid-orase', 'cum-sa'] as const;
type FilterCategory = (typeof ALL_CATEGORIES)[number];

export default function BlogListPage() {
  const { t } = useTranslation('blog');
  const { lang } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('all');

  const posts = getPostsByLanguage(lang);
  const filtered =
    activeCategory === 'all'
      ? posts
      : posts.filter((p) => p.category === activeCategory);

  const dateLocale = lang === 'en' ? 'en-GB' : 'ro-RO';

  return (
    <>
      <SEOHead
        title={t('meta.title')}
        description={t('meta.description')}
        canonicalUrl={ROUTE_MAP.blog[lang]}
        lang={lang}
        alternateUrl={{ ro: ROUTE_MAP.blog.ro, en: ROUTE_MAP.blog.en }}
      />
      <div className="bg-white">
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16 px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">{t('heroTitle')}</h1>
          <p className="text-blue-100 text-lg max-w-xl mx-auto">
            {t('heroSubtitle')}
          </p>
        </div>

        {/* Category filter */}
        <div className="border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="max-w-5xl mx-auto px-4 flex gap-1 overflow-x-auto">
            {ALL_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeCategory === cat
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                {cat === 'all'
                  ? t('categories.all')
                  : t(`categories.${cat}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Posts grid */}
        <div className="max-w-5xl mx-auto px-4 py-12">
          {filtered.length === 0 ? (
            <p className="text-center text-gray-500 py-16">
              {t('noArticles')}
            </p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((post) => (
                <Link
                  key={post.slug}
                  to={`${ROUTE_MAP.blog[lang]}/${post.slug}`}
                  className="group bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col"
                >
                  {/* Cover placeholder */}
                  <div className="h-48 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                    <span className="text-5xl" role="img" aria-label="cleaning">
                      🧹
                    </span>
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded self-start mb-3 ${CATEGORY_COLORS[post.category as BlogCategory]}`}
                    >
                      {t(`categories.${post.category}`)}
                    </span>

                    <h2 className="text-gray-900 font-semibold text-lg leading-snug mb-2 group-hover:text-blue-600 transition-colors">
                      {post.title}
                    </h2>

                    <p className="text-gray-500 text-sm flex-1 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-auto">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(post.publishedAt).toLocaleDateString(dateLocale, {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {post.readTimeMinutes} {t('readTime')}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="bg-blue-600 text-white py-16 px-4 text-center">
          <h2 className="text-2xl font-bold mb-3">
            {t('ctaTitle', 'Vrei să rezervi o curățenie?')}
          </h2>
          <p className="text-blue-100 mb-6">
            {t('ctaSubtitle', 'Platforma noastră se lansează în curând.')}
          </p>
          <Link
            to={ROUTE_MAP.waitlist[lang]}
            className="inline-flex items-center gap-1 bg-white text-blue-600 font-semibold px-6 py-3 rounded-xl hover:bg-blue-50 transition"
          >
            {t('ctaButton', 'Înregistrează-te')}
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
      </div>
    </>
  );
}
