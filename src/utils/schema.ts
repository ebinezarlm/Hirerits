export interface OrganizationSchema {
  name: string;
  url: string;
  logo?: string;
  contactPoint?: {
    telephone?: string;
    contactType?: string;
    email?: string;
  };
  sameAs?: string[];
}

export interface ServiceSchema {
  name: string;
  description: string;
  provider: {
    name: string;
    url: string;
  };
  areaServed?: string[];
  serviceType?: string;
}

export interface FAQSchema {
  question: string;
  answer: string;
}

export function generateOrganizationSchema(props: OrganizationSchema): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: props.name,
    url: props.url,
    ...(props.logo && { logo: props.logo }),
    ...(props.contactPoint && {
      contactPoint: {
        '@type': 'ContactPoint',
        ...props.contactPoint,
      },
    }),
    ...(props.sameAs && { sameAs: props.sameAs }),
  };
}

export function generateWebsiteSchema(url: string): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url,
    name: 'Hire Ritz - IT Consultancy',
    description: 'IT consultancy delivering digital transformation, cloud, software development, and technology strategy for enterprises worldwide.',
  };
}

export function generateServiceSchema(props: ServiceSchema): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: props.name,
    description: props.description,
    provider: {
      '@type': 'Organization',
      name: props.provider.name,
      url: props.provider.url,
    },
    ...(props.areaServed && {
      areaServed: props.areaServed.map((area) => ({
        '@type': 'Country',
        name: area,
      })),
    }),
    ...(props.serviceType && { serviceType: props.serviceType }),
  };
}

export function generateFAQSchema(faqs: FAQSchema[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateArticleSchema(props: {
  headline: string;
  description: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  author?: string;
  url: string;
}): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: props.headline,
    description: props.description,
    ...(props.image && { image: props.image }),
    datePublished: props.datePublished,
    ...(props.dateModified && { dateModified: props.dateModified }),
    ...(props.author && {
      author: {
        '@type': 'Person',
        name: props.author,
      },
    }),
    url: props.url,
  };
}
