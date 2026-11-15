/**
 * Admin board helpers: sample data for demo mode, and the summaries the
 * board builds from enquiries (real ones from the Google Sheet, or samples).
 */
import type { EnquiryStatus, StoredEnquiry, StoredQuestion } from '../lib/api';
import { DOCTOR, HOSPITAL } from './hospital';

export const STATUSES: EnquiryStatus[] = ['New', 'Called', 'Confirmed', 'Follow up', 'Closed'];

// ---------- Sample data (demo mode only) ----------

const at = (now: Date, daysAgo: number, h: number, m: number) => {
  const d = new Date(now);
  d.setDate(d.getDate() - daysAgo);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};

/** Made-up enquiries, timed relative to `now` so demo mode always looks current. */
export function sampleEnquiries(now = new Date()): StoredEnquiry[] {
  const rows: [string, number, number, number, string, string, string, string, string, EnquiryStatus][] = [
    ['Priya Deshmukh', 0, 8, 12, '+919822041736', 'Today', 'evening', 'First pregnancy consultation', 'Assistant', 'New'],
    ['Aarti Kulkarni', 0, 7, 48, '+919765122094', 'Today', 'morning', 'Routine antenatal check-up', 'Website', 'New'],
    ['Sneha Patil', 1, 18, 5, '+919011058312', 'Wed 11 Nov', 'morning', 'Delivery planning', 'Assistant', 'Called'],
    ['Meera Joshi', 1, 16, 40, '+918805077421', 'Today', 'evening', 'Postnatal / newborn care', 'Website', 'Confirmed'],
    ['Rutuja Pawar', 3, 11, 20, '+919922310458', 'Thu 12 Nov', 'morning', 'First pregnancy consultation', 'Assistant', 'Follow up'],
    ['Kavya Iyer', 3, 9, 55, '+917020866105', 'Today', 'morning', 'Routine antenatal check-up', 'Website', 'New'],
  ];
  return rows.map(([name, days, h, m, phone, date, slot, type, source, status], i) => ({
    reference: `LS-DEMO-${String(rows.length - i).padStart(4, '0')}`,
    received: at(now, days, h, m),
    name,
    phone,
    date,
    slot,
    type,
    source,
    status,
    notes: '',
    updated: at(now, days, h, m),
  }));
}

export function sampleQuestions(now = new Date()): StoredQuestion[] {
  return [
    { received: at(now, 1, 21, 40), question: 'Can my husband stay overnight in the NICU?', source: 'Assistant' },
    { received: at(now, 1, 20, 15), question: 'Do you accept Star Health cashless?', source: 'Assistant' },
    { received: at(now, 1, 18, 2), question: 'Is there parking for two-wheelers?', source: 'Assistant' },
  ];
}

/** Sample patient feedback. Shown in demo mode only: the website does not collect feedback yet. */
export const SAMPLE_FEEDBACK = [
  { name: 'Meera J.', rating: 5, text: 'Felt cared for from admission to discharge.' },
  { name: 'Ankita R.', rating: 4, text: 'Lovely nurses, but billing took over an hour.' },
  { name: 'Swati D.', rating: 5, text: 'Dr. Shinde was patient with all our questions.' },
];

// ---------- Formatting ----------

const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

/** "8:12 am" today, "Yesterday", "Sat" this week, otherwise "9 Nov". */
export function formatReceived(iso: string, now = new Date()): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  if (sameDay(d, now)) return d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (sameDay(d, yesterday)) return 'Yesterday';
  const days = (now.getTime() - d.getTime()) / 86_400_000;
  if (days < 6) return d.toLocaleDateString('en-IN', { weekday: 'short' });
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

/**
 * Older versions of the Google script could send a preferred date that Sheets had
 * turned into a date, as "Sat Nov 14 2026 00:00:00 GMT+0530 (India Standard Time)".
 * Show that as "Sat 14 Nov" again; leave any other text unchanged.
 */
export function cleanPreferredDate(date: string): string {
  const m = /^([A-Z][a-z]{2}) ([A-Z][a-z]{2}) (\d{1,2}) \d{4} \d{2}:\d{2}:\d{2} GMT/.exec(date.trim());
  return m ? `${m[1]} ${Number(m[3])} ${m[2]}` : date;
}

/** "Thu 12 Nov · evening", or just the date when no slot was chosen. */
export const formatPreferred = (e: StoredEnquiry) => [cleanPreferredDate(e.date), e.slot].filter(Boolean).join(' · ');

/** "+919822041736" → "+91 98220 41736". */
export function formatPhone(phone: string): string {
  const d = phone.replace(/\D/g, '');
  if (d.length === 12 && d.startsWith('91')) return `+91 ${d.slice(2, 7)} ${d.slice(7)}`;
  return phone;
}

export const maskPhone = (phone: string, mask: boolean) => {
  const shown = formatPhone(phone);
  return mask ? shown.slice(0, -3) + 'xxx' : shown;
};

export const firstName = (name: string) => name.trim().split(/\s+/)[0] ?? name;

// ---------- Summaries ----------

// ---------- Filters (shared by the number tiles and the list tabs) ----------

export type EnquiryFilter = 'all' | 'new' | 'today' | 'followup';

export const FILTERS: { key: EnquiryFilter; tab: string; title: string }[] = [
  { key: 'all', tab: 'All', title: 'All enquiries' },
  { key: 'new', tab: 'New', title: 'New enquiries' },
  { key: 'today', tab: 'Today', title: 'Received today' },
  { key: 'followup', tab: 'Follow up', title: 'Pending follow-ups' },
];

/** Whether an enquiry belongs in a filter. The number tiles count with this same test. */
export function matchesFilter(e: StoredEnquiry, filter: EnquiryFilter, now = new Date()): boolean {
  switch (filter) {
    case 'new':
      return e.status === 'New';
    case 'followup':
      return e.status === 'Follow up';
    case 'today':
      return sameDay(new Date(e.received), now);
    default:
      return true;
  }
}

/** What tapping a number tile does: filter the enquiries, or (for questions) jump to the questions panel. */
export type KpiAction = EnquiryFilter | 'questions';

export type Kpi = { action: KpiAction; label: string; value: number; note: string; tone: 'up' | 'warn' | 'neutral' };

export function buildKpis(enquiries: StoredEnquiry[], questions: StoredQuestion[], now = new Date()): Kpi[] {
  const received = (daysAgo: number) => {
    const day = new Date(now);
    day.setDate(now.getDate() - daysAgo);
    return enquiries.filter((e) => sameDay(new Date(e.received), day)).length;
  };
  const weekAgo = now.getTime() - 7 * 86_400_000;
  const count = (f: EnquiryFilter) => enquiries.filter((e) => matchesFilter(e, f, now)).length;
  return [
    { action: 'new', label: 'New enquiries', value: count('new'), note: 'waiting for a call', tone: 'warn' },
    { action: 'today', label: 'Received today', value: count('today'), note: `${received(1)} yesterday`, tone: 'up' },
    { action: 'followup', label: 'Pending follow-ups', value: count('followup'), note: 'to call again', tone: 'warn' },
    {
      action: 'questions',
      label: 'Unanswered questions',
      value: questions.filter((q) => new Date(q.received).getTime() >= weekAgo).length,
      note: 'last 7 days',
      tone: 'neutral',
    },
  ];
}

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/** A plain-language summary of where things stand, built from the numbers (no AI involved). */
export function buildSummary(enquiries: StoredEnquiry[], questions: StoredQuestion[], now = new Date()): string {
  const [fresh, today, followUps, unanswered] = buildKpis(enquiries, questions, now).map((k) => k.value);
  if (!enquiries.length && !questions.length) return 'No enquiries yet. New requests from the website and the assistant will appear here.';
  const parts = [
    fresh
      ? `${plural(fresh, 'new enquiry', 'new enquiries')} waiting for a call${today ? `, ${today} received today` : ''}.`
      : 'Every enquiry has been called.',
    followUps ? `${plural(followUps, 'follow-up')} to call again.` : '',
    unanswered ? `${plural(unanswered, 'question')} the assistant couldn't answer this week.` : '',
  ];
  return parts.filter(Boolean).join(' ');
}

/** Enquiries that need a message: new ones first, then follow-ups. */
export const needsMessage = (enquiries: StoredEnquiry[]) => [
  ...enquiries.filter((e) => e.status === 'New'),
  ...enquiries.filter((e) => e.status === 'Follow up'),
];

/** A ready-to-send WhatsApp message for an enquiry. */
export function whatsappDraft(e: StoredEnquiry): string {
  const who = `${firstName(e.name)} ji`;
  const when = formatPreferred(e);
  if (e.status === 'Follow up') {
    return `Hello ${who}, this is ${HOSPITAL.name}. We tried calling about your ${e.type.toLowerCase()} request${when ? ` for ${when}` : ''}. Please reply with a time that suits you and we will book it.`;
  }
  return `Namaste ${who}, thank you for contacting ${HOSPITAL.name}. We have your ${e.type.toLowerCase()} request${when ? ` (${when})` : ''} for ${DOCTOR.name}. Please reply YES to confirm, or tell us a time that suits you.`;
}

/** WhatsApp link that opens a chat with the patient, with the message filled in. */
export const whatsappLink = (e: StoredEnquiry) => `https://wa.me/${e.phone.replace(/\D/g, '')}?text=${encodeURIComponent(whatsappDraft(e))}`;
