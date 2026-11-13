import { IMAGES } from './images';

/**
 * Hospital details shown across the site.
 * Address and phone number are confirmed by the hospital.
 * NOTE: email and doctor credentials are still placeholder copy from the
 * design — replace with confirmed details before launch.
 */
const LOCATION = { lat: 18.5285622, lng: 73.9460343 };

const ADDRESS =
  'Sr No. 35, Mundhwa - Manjari Rd, above Kastura Hotel, near New Orbis School, Keshav Nagar, Mundhwa, Pune, Maharashtra 411036';

export const HOSPITAL = {
  name: 'Life Springs Maternity Hospital',
  tagline: 'Maternity · Pune',
  phoneDisplay: '070318 80088',
  phoneHref: 'tel:+917031880088',
  whatsappHref: 'https://wa.me/917031880088',
  email: 'care@lifesprings.in',
  address: ADDRESS,
  /** Same address, broken into lines for display. */
  addressLines: [
    'Sr No. 35, Mundhwa - Manjari Rd, above Kastura Hotel',
    'Near New Orbis School, Keshav Nagar, Mundhwa',
    'Pune, Maharashtra 411036',
  ],
  opdDays: 'Mon–Sat',
  opdTimes: '10am–1pm · 5pm–8pm',
  emergencyHours: 'Open 24 × 7',
  /** Exact pin, from the hospital's Google Maps listing. */
  location: LOCATION,
  /** The hospital's own Google Maps share link (opens its listing). */
  mapsHref: 'https://maps.app.goo.gl/6G1mGAhUpxGDZqVLA',
  /** Starts Google Maps navigation to the hospital. */
  directionsHref: `https://www.google.com/maps/dir/?api=1&destination=${LOCATION.lat},${LOCATION.lng}`,
  /** Embeddable Google Map pinned to the hospital (no API key needed). */
  mapEmbedSrc: `https://maps.google.com/maps?q=${LOCATION.lat},${LOCATION.lng}&z=17&output=embed`,
  year: 2026,
};

export const DOCTOR = {
  name: 'Dr. Deepak Shinde',
  shortName: 'Dr. Shinde',
  degrees: 'MBBS, MS (Obstetrics & Gynaecology)',
  degreesShort: 'MBBS, MS (OBGY)',
  role: 'Lead Consultant',
  speciality: 'Obstetrician & Gynaecologist · Normal delivery & high-risk pregnancy',
  quote: 'Every mother deserves time, clear answers, and a birth plan she truly understands.',
  about:
    "Dr. Shinde believes every mother deserves time, clear answers and a birth plan she understands. He leads antenatal, delivery and high-risk pregnancy care at Life Springs Maternity Hospital.",
  stats: [
    { value: 'XX+', label: 'Years in practice' },
    { value: '3', label: 'Languages: मराठी, हिंदी, Eng' },
    { value: '24×7', label: 'On-call for deliveries' },
  ],
  interests: ['Normal delivery', 'High-risk pregnancy', 'VBAC counselling', 'Pre-conception care'],
  timings: [
    { days: 'Mon – Fri', hours: '10am–1pm · 5–8pm' },
    { days: 'Saturday', hours: '10am–1pm' },
    { days: 'Sunday', hours: 'Emergencies only', accent: true },
  ],
};

export type Service = { n: string; title: string; desc: string };

export const SERVICES: Service[] = [
  { n: '01', title: 'Pregnancy consultation', desc: 'Confirm, plan and ask every question.' },
  { n: '02', title: 'Antenatal care', desc: 'Regular check-ups, scans and classes.' },
  { n: '03', title: 'Normal & C-section delivery', desc: 'Private suites, 24 × 7 labour team.' },
  { n: '04', title: 'High-risk pregnancy', desc: 'Close monitoring with specialist support.' },
  { n: '05', title: 'Postnatal & lactation', desc: 'Recovery, feeding and emotional care.' },
  { n: '06', title: 'Newborn care & NICU', desc: 'Paediatric team and Level II NICU.' },
];

export const FACILITIES = [
  { title: 'Labour & delivery suites', desc: 'Calm, private, family-friendly.', photo: 'photo · birthing suite', image: IMAGES.deliverySuite },
  { title: 'Private recovery rooms', desc: 'Rest with your baby beside you.', photo: 'photo · recovery room', image: IMAGES.recoveryRoom },
  { title: 'Level II NICU', desc: 'Round-the-clock newborn care.', photo: 'photo · NICU, soft light', image: IMAGES.nicu },
  { title: 'Lactation lounge', desc: 'Guidance from trained counsellors.', photo: 'photo · feeding lounge', image: IMAGES.lactation },
];

export type Testimonial = { quote: string; name: string; detail: string; tone: 'blush' | 'mint' | 'cream' };

export const TESTIMONIALS: Testimonial[] = [
  {
    quote: 'The nurses explained everything twice, in Marathi, without ever making me feel rushed.',
    name: 'Snehal K.',
    detail: 'Normal delivery, 2026',
    tone: 'blush',
  },
  {
    quote: 'Dr. Shinde was honest and calm through a high-risk pregnancy. We trusted him completely.',
    name: 'Anjali & Rohan M.',
    detail: 'High-risk pregnancy',
    tone: 'mint',
  },
  {
    quote: 'Clean rooms, kind staff, and the lactation support at night was a lifesaver.',
    name: 'Pooja S.',
    detail: 'C-section, 2025',
    tone: 'cream',
  },
];

export const APPOINTMENT_TYPES = [
  'First pregnancy consultation',
  'Routine antenatal check-up',
  'Delivery planning',
  'Postnatal / newborn care',
];

export const OPD_SLOTS = [
  { id: 'morning', label: 'Morning · 10–1' },
  { id: 'evening', label: 'Evening · 5–8' },
] as const;
