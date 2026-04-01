export interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  keywords?: string;
  noindex?: boolean;
}

export function generateSEOMeta(props: SEOProps) {
  const {
    title,
    description,
    canonical,
    ogImage = '/images/og-default.jpg',
    ogType = 'website',
    keywords,
    noindex = false,
  } = props;

  const siteUrl = 'https://hireritz.com'; // Update with actual domain
  const fullTitle = `${title} | Hire Ritz - IT Consultancy`;
  const canonicalUrl = canonical ? `${siteUrl}${canonical}` : siteUrl;
  const ogImageUrl = ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`;

  return {
    title: fullTitle,
    description,
    canonical: canonicalUrl,
    ogImage: ogImageUrl,
    ogType,
    keywords,
    noindex,
    siteUrl,
  };
}
