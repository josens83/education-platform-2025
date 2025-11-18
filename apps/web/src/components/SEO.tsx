import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  noindex?: boolean;
}

/**
 * SEO Component
 * Manages meta tags for search engines and social media
 */
export default function SEO({
  title = '영어 학습 플랫폼',
  description = '구독형 영어 원서 읽기 플랫폼. 수준별 영어책과 오디오북, 퀴즈로 영어 실력을 향상시키세요.',
  keywords = '영어학습, 영어원서, 오디오북, 영어공부, 영어교육, 온라인영어, 영어책',
  image = '/og-image.jpg',
  url,
  type = 'website',
  noindex = false,
}: SEOProps) {
  const siteUrl = import.meta.env.VITE_SITE_URL || 'http://localhost:3000';
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl;
  const fullImageUrl = image.startsWith('http') ? image : `${siteUrl}${image}`;

  // Add site name to title if not already present
  const fullTitle = title.includes('영어 학습 플랫폼') ? title : `${title} | 영어 학습 플랫폼`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Robots */}
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:site_name" content="영어 학습 플랫폼" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={fullUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={fullImageUrl} />

      {/* Additional SEO */}
      <link rel="canonical" href={fullUrl} />
      <meta name="language" content="Korean" />
      <meta name="author" content="영어 학습 플랫폼" />

      {/* Mobile */}
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      <meta name="theme-color" content="#667eea" />

      {/* Apple */}
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="영어 학습" />
    </Helmet>
  );
}
