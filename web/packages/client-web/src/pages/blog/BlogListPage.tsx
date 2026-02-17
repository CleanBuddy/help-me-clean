import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Calendar, ArrowRight } from 'lucide-react';
import SEOHead from '@/components/seo/SEOHead';
import {
  BLOG_POSTS,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  type BlogCategory,
} from '@/data/blog';

const ALL_CATEGORIES = ['all', 'sfaturi', 'ghid-orase', 'cum-sa'] as const;
type FilterCategory = (typeof ALL_CATEGORIES)[number];

export default function BlogListPage() {
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('all');

  const filtered =
    activeCategory === 'all'
      ? BLOG_POSTS
      : BLOG_POSTS.filter((p) => p.category === activeCategory);

  return (
    <>
      <SEOHead
        title="Blog Curățenie | Sfaturi și Ghiduri | HelpMeClean"
        description="Sfaturi practice despre curățenie, ghiduri pentru alegerea firmei potrivite și articole despre servicii de curățenie profesională în România."
        canonicalUrl="/blog"
      />
      <div className="bg-white">
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16 px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Blog Curățenie</h1>
          <p className="text-blue-100 text-lg max-w-xl mx-auto">
            Sfaturi practice, ghiduri și articole despre servicii de curățenie
            profesională
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
                  ? 'Toate articolele'
                  : CATEGORY_LABELS[cat as BlogCategory]}
              </button>
            ))}
          </div>
        </div>

        {/* Posts grid */}
        <div className="max-w-5xl mx-auto px-4 py-12">
          {filtered.length === 0 ? (
            <p className="text-center text-gray-500 py-16">
              Nu există articole în această categorie momentan.
            </p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((post) => (
                <Link
                  key={post.slug}
                  to={`/blog/${post.slug}`}
                  className="group bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col"
                >
                  {/* Cover placeholder */}
                  <div className="h-48 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                    <span className="text-5xl" role="img" aria-label="curățenie">
                      🧹
                    </span>
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded self-start mb-3 ${CATEGORY_COLORS[post.category]}`}
                    >
                      {CATEGORY_LABELS[post.category]}
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
                        {new Date(post.publishedAt).toLocaleDateString('ro-RO', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {post.readTimeMinutes} min citire
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
            Vrei să rezervi o curățenie?
          </h2>
          <p className="text-blue-100 mb-6">
            Platforma noastră se lansează în curând. Înscrie-te pe lista de
            așteptare.
          </p>
          <Link
            to="/lista-asteptare"
            className="inline-flex items-center gap-1 bg-white text-blue-600 font-semibold px-6 py-3 rounded-xl hover:bg-blue-50 transition"
          >
            Înregistrează-te
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
      </div>
    </>
  );
}
