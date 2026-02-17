import { Helmet } from 'react-helmet-async';

interface ArticleMeta {
  publishedTime: string;
  author: string;
  tags: string[];
}

interface SEOHeadProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  articleMeta?: ArticleMeta;
  structuredData?: object;
  noIndex?: boolean;
}

const BASE_URL = 'https://helpmeclean.ro';
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.jpg`;

export default function SEOHead({
  title,
  description,
  canonicalUrl,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = 'website',
  articleMeta,
  structuredData,
  noIndex = false,
}: SEOHeadProps) {
  const fullTitle = title.includes('HelpMeClean') ? title : `${title} | HelpMeClean`;
  const canonical = canonicalUrl ? `${BASE_URL}${canonicalUrl}` : undefined;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      {canonical && <link rel="canonical" href={canonical} />}

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={ogImage} />
      {canonical && <meta property="og:url" content={canonical} />}
      <meta property="og:locale" content="ro_RO" />
      <meta property="og:site_name" content="HelpMeClean" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {articleMeta && (
        <>
          <meta property="article:published_time" content={articleMeta.publishedTime} />
          <meta property="article:author" content={articleMeta.author} />
          {articleMeta.tags.map((tag) => (
            <meta key={tag} property="article:tag" content={tag} />
          ))}
        </>
      )}

      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
}
