import { SITE, abs, isSet, sameAs, mapLink } from '../data/site';

export type Crumb = { name: string; href: string };
export type FAQ = { q: string; a: string };

const ID = {
  org: () => abs('/#organization'),
  firm: () => abs('/#legalservice'),
  site: () => abs('/#website'),
};

const postalAddress = () => ({
  '@type': 'PostalAddress',
  streetAddress: SITE.address.streetAddress,
  addressLocality: SITE.address.addressLocality,
  addressRegion: SITE.address.addressRegion,
  postalCode: SITE.address.postalCode,
  addressCountry: SITE.address.addressCountry,
});

export function legalService(lang: 'en' | 'ur' = 'en') {
  const node: Record<string, unknown> = {
    '@type': ['LegalService', 'LocalBusiness'],
    '@id': ID.firm(),
    name: SITE.name,
    legalName: SITE.legalName,
    url: abs(lang === 'ur' ? '/ur/' : '/'),
    logo: abs(SITE.logoPath),
    image: [abs(SITE.ogImage), abs(SITE.logoPath)],
    telephone: SITE.phoneDisplay,
    address: postalAddress(),
    geo: { '@type': 'GeoCoordinates', latitude: SITE.geo.latitude, longitude: SITE.geo.longitude },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: SITE.hours.days.map((d) => `https://schema.org/${d}`),
        opens: SITE.hours.opens,
        closes: SITE.hours.closes,
      },
    ],
    areaServed: [
      { '@type': 'City', name: 'Lahore' },
      { '@type': 'State', name: 'Punjab' },
      { '@type': 'Country', name: 'Pakistan' },
    ],
    hasMap: mapLink(),
    knowsLanguage: ['en', 'ur', 'pa'],
    parentOrganization: { '@id': ID.org() },
  };
  if (isSet(SITE.email)) node.email = SITE.email;
  const links = sameAs();
  if (links.length) node.sameAs = links;
  return node;
}

export function organization() {
  const node: Record<string, unknown> = {
    '@type': 'Organization',
    '@id': ID.org(),
    name: SITE.name,
    legalName: SITE.legalName,
    url: abs('/'),
    logo: { '@type': 'ImageObject', url: abs(SITE.logoPath), width: 887, height: 692 },
    address: postalAddress(),
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: SITE.phoneDisplay,
        contactType: 'customer service',
        areaServed: 'PK',
        availableLanguage: ['English', 'Urdu'],
      },
    ],
  };
  if (isSet(SITE.email)) node.email = SITE.email;
  const links = sameAs();
  if (links.length) node.sameAs = links;
  return node;
}

export function website() {
  return {
    '@type': 'WebSite',
    '@id': ID.site(),
    name: SITE.name,
    url: abs('/'),
    inLanguage: ['en-PK', 'ur-PK'],
    publisher: { '@id': ID.org() },
  };
}

export function breadcrumbList(items: Crumb[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: abs(c.href),
    })),
  };
}

export function faqPage(faqs: FAQ[]) {
  return {
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

export function service(opts: { name: string; serviceType: string; description: string; url: string }) {
  return {
    '@type': 'Service',
    name: opts.name,
    serviceType: opts.serviceType,
    description: opts.description,
    url: abs(opts.url),
    provider: { '@id': ID.firm(), '@type': 'LegalService', name: SITE.name, telephone: SITE.phoneDisplay, address: postalAddress() },
    areaServed: [
      { '@type': 'City', name: 'Lahore' },
      { '@type': 'State', name: 'Punjab' },
    ],
  };
}

export function person(opts: {
  name: string; url: string; image: string; jobTitle: string; alumniOf: string[]; knowsAbout: string[]; sameAs: string[]; description: string;
}) {
  const node: Record<string, unknown> = {
    '@type': 'Person',
    '@id': abs(opts.url) + '#person',
    name: opts.name,
    url: abs(opts.url),
    image: opts.image,
    jobTitle: opts.jobTitle,
    description: opts.description,
    worksFor: { '@id': ID.firm(), '@type': 'LegalService', name: SITE.name },
    knowsAbout: opts.knowsAbout,
  };
  const alumni = opts.alumniOf.filter(isSet);
  if (alumni.length) node.alumniOf = alumni.map((name) => ({ '@type': 'EducationalOrganization', name }));
  const links = opts.sameAs.filter(isSet);
  if (links.length) node.sameAs = links;
  return node;
}

export function article(opts: {
  headline: string; description: string; url: string; image: string; datePublished: Date; dateModified: Date;
  authorName: string; authorUrl: string;
}) {
  return {
    '@type': 'Article',
    headline: opts.headline,
    description: opts.description,
    mainEntityOfPage: { '@type': 'WebPage', '@id': abs(opts.url) },
    image: [opts.image],
    datePublished: opts.datePublished.toISOString(),
    dateModified: opts.dateModified.toISOString(),
    inLanguage: 'en-PK',
    author: { '@type': 'Person', name: opts.authorName, url: abs(opts.authorUrl) },
    publisher: {
      '@type': 'Organization',
      '@id': ID.org(),
      name: SITE.name,
      logo: { '@type': 'ImageObject', url: abs(SITE.logoPath) },
    },
  };
}
