/**
 * Single source of truth for firm details.
 * Anything marked [PLACEHOLDER] must be confirmed before launch (see README.md).
 * NAP (name, address, phone) must match the Google Business Profile character-for-character.
 */
export const SITE = {
  // [PLACEHOLDER] live domain, no trailing slash. Keep in sync with astro.config.mjs.
  url: 'https://www.rrlawassociates.com',
  name: 'R&R Law Associates',
  legalName: 'Raza & Raza Law Associates',
  tagline: 'Advocates · Lahore High Court',

  phoneDisplay: '+92 343 4653357',
  phoneHref: 'tel:+923434653357',
  whatsappNumber: '923434653357',
  whatsappMessage:
    'Assalam-o-Alaikum. I found R&R Law Associates through your website and would like to arrange a consultation about a legal matter.',
  whatsappMessageUr: 'السلام علیکم۔ میں نے آپ کی ویب سائٹ دیکھی ہے اور ایک قانونی معاملے پر مشاورت کا وقت لینا چاہتا/چاہتی ہوں۔',

  address: {
    streetAddress: 'First Floor, Siddiqi Plaza, 7 Turner Road, Mozang Chungi',
    addressLocality: 'Lahore',
    addressRegion: 'Punjab',
    postalCode: '54000',
    addressCountry: 'PK',
    countryName: 'Pakistan',
  },
  /** Exact NAP line used in the footer and contact page. Do not edit casually. */
  napAddress: 'First Floor, Siddiqi Plaza, 7 Turner Road, Mozang Chungi, Lahore 54000, Pakistan',
  napAddressUr: 'فرسٹ فلور، صدیقی پلازہ، 7 ٹرنر روڈ، مزنگ چونگی، لاہور 54000، پاکستان',

  // [PLACEHOLDER] approximate coordinates for Turner Road, Mozang Chungi.
  // Replace with the exact pin from the Google Business Profile.
  geo: { latitude: 31.5586, longitude: 74.3186 },

  // [PLACEHOLDER] confirm opening hours (used on the site and in structured data).
  hours: {
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    opens: '10:00',
    closes: '21:00',
    display: 'Monday to Saturday, 10:00 AM – 9:00 PM',
    displayUr: 'پیر تا ہفتہ، صبح 10 بجے سے رات 9 بجے تک',
    closedNote: 'Closed on Sundays and gazetted public holidays',
    closedNoteUr: 'اتوار اور سرکاری تعطیلات پر دفتر بند رہتا ہے',
  },

  // [PLACEHOLDER] leave empty strings until confirmed; empty values are hidden from the site and schema.
  email: '',
  googleMapsUrl: '', // e.g. https://maps.app.goo.gl/xxxx or the full Google Maps listing URL
  /** Optional: the iframe src from Google Maps → Share → Embed a map. If empty, an address query embed is used. */
  googleMapsEmbedSrc: '',
  social: {
    facebook: '',
    instagram: '',
    linkedin: '',
  },

  // [ACCESS_KEY] Web3Forms access key — see README.md.
  web3formsAccessKey: '[ACCESS_KEY]',

  ogImage: '/og/rr-law-associates-lahore.jpg',
  logoPath: '/brand/rr-law-associates-logo.png',
} as const;

export const isSet = (v: string | undefined | null) => !!v && !v.includes('PLACEHOLDER') && !v.includes('ACCESS_KEY');

export const whatsappLink = (lang: 'en' | 'ur' = 'en') =>
  `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(lang === 'ur' ? SITE.whatsappMessageUr : SITE.whatsappMessage)}`;

export const sameAs = () =>
  [SITE.googleMapsUrl, SITE.social.facebook, SITE.social.instagram, SITE.social.linkedin].filter(isSet);

export const mapEmbedSrc = () =>
  isSet(SITE.googleMapsEmbedSrc)
    ? SITE.googleMapsEmbedSrc
    : `https://www.google.com/maps?q=${encodeURIComponent(`${SITE.name}, ${SITE.napAddress}`)}&output=embed`;

export const mapLink = () =>
  isSet(SITE.googleMapsUrl)
    ? SITE.googleMapsUrl
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${SITE.name}, ${SITE.napAddress}`)}`;

export const abs = (path: string) => new URL(path, SITE.url + '/').href;

/** Matter types offered in the consultation form. */
export const MATTER_TYPES = [
  'Family (khula, divorce, custody, maintenance)',
  'Criminal (bail, FIR, trial)',
  'Civil suit, recovery or injunction',
  'Property or inheritance',
  'Writ petition (Lahore High Court)',
  'Corporate or company registration',
  'Banking recovery',
  'Tax',
  'Service matter',
  'Overseas Pakistani matter',
  'Other',
];
export const MATTER_TYPES_UR = [
  'عائلی معاملہ (خلع، طلاق، حضانت، نان نفقہ)',
  'فوجداری معاملہ (ضمانت، ایف آئی آر، ٹرائل)',
  'دیوانی دعویٰ، ریکوری یا حکمِ امتناعی',
  'جائیداد یا وراثت',
  'رِٹ پٹیشن (لاہور ہائی کورٹ)',
  'کارپوریٹ یا کمپنی رجسٹریشن',
  'بینکنگ ریکوری',
  'ٹیکس',
  'سروس میٹر',
  'بیرونِ ملک مقیم پاکستانی',
  'دیگر',
];
