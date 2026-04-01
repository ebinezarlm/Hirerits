import { SITE_ORIGIN } from './schema';

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
    ogImage = 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80',
    ogType = 'website',
    keywords,
    noindex = false,
  } = props;

  const siteUrl = SITE_ORIGIN;
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
