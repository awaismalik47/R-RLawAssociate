export type Lang = 'en' | 'ur';

export const NAV = {
  en: [
    { href: '/practice-areas/', label: 'Practice Areas' },
    { href: '/advocates/', label: 'Advocates' },
    { href: '/about/', label: 'About' },
    { href: '/overseas-pakistanis/', label: 'Overseas Pakistanis' },
    { href: '/guides/', label: 'Legal Guides' },
    { href: '/contact/', label: 'Contact' },
  ],
  ur: [
    { href: '/ur/', label: 'صفحۂ اول' },
    { href: '/ur/practice-areas/', label: 'شعبہ جات' },
    { href: '/ur/contact/', label: 'رابطہ' },
    { href: '/advocates/', label: 'وکلاء (English)', hreflang: 'en' },
  ],
};

export const T = {
  en: {
    skip: 'Skip to main content',
    book: 'Book a Consultation',
    menu: 'Menu',
    close: 'Close menu',
    call: 'Call',
    whatsapp: 'WhatsApp',
    whatsappUs: 'WhatsApp Us',
    langSwitch: 'اردو',
    langSwitchLabel: 'اردو میں پڑھیں',
    home: 'Home',
    breadcrumb: 'Breadcrumb',
    address: 'Address',
    phone: 'Phone / WhatsApp',
    hours: 'Office hours',
    email: 'Email',
    footerDisclaimer:
      'This website provides general information only. It is not legal advice or a solicitation, and using it or contacting us through it does not create a lawyer-client relationship.',
    readDisclaimer: 'Read the full disclaimer and privacy notice',
  },
  ur: {
    skip: 'مرکزی مواد پر جائیں',
    book: 'مشاورت کا وقت لیں',
    menu: 'مینیو',
    close: 'مینیو بند کریں',
    call: 'کال',
    whatsapp: 'واٹس ایپ',
    whatsappUs: 'واٹس ایپ پر رابطہ',
    langSwitch: 'English',
    langSwitchLabel: 'Read in English',
    home: 'صفحۂ اول',
    breadcrumb: 'راستہ',
    address: 'پتہ',
    phone: 'فون / واٹس ایپ',
    hours: 'دفتری اوقات',
    email: 'ای میل',
    footerDisclaimer:
      'یہ ویب سائٹ صرف عمومی معلومات کے لیے ہے۔ یہ قانونی مشورہ یا ترغیب نہیں ہے، اور اس کے استعمال یا اس کے ذریعے رابطے سے وکیل اور مؤکل کا تعلق قائم نہیں ہوتا۔',
    readDisclaimer: 'مکمل ڈس کلیمر اور پرائیویسی نوٹس (انگریزی)',
  },
} as const;

/** Pages that exist in both languages: English path → Urdu path. */
export const URDU_PAIRS: Record<string, string> = {
  '/': '/ur/',
  '/practice-areas/': '/ur/practice-areas/',
  '/contact/': '/ur/contact/',
};
export const enFor = (urPath: string) => Object.entries(URDU_PAIRS).find(([, u]) => u === urPath)?.[0];

export const formatDate = (d: Date) =>
  d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Karachi' });
