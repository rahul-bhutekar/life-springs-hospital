/** Sample data for the owner dashboard. Replace with the enquiries API. */
export type EnquiryStatus = 'New' | 'Called' | 'Confirmed' | 'Follow up';

export type Enquiry = {
  id: string;
  name: string;
  time: string;
  phone: string;
  type: string;
  date: string;
  source: 'Assistant' | 'Website' | 'Phone';
  status: EnquiryStatus;
};

export const ENQUIRIES: Enquiry[] = [
  { id: 'e1', name: 'Priya Deshmukh', time: '8:12 am', phone: '+91 98220 41736', type: 'First consultation', date: 'Today, eve', source: 'Assistant', status: 'New' },
  { id: 'e2', name: 'Aarti Kulkarni', time: '7:48 am', phone: '+91 97651 22094', type: 'Antenatal check-up', date: 'Today, morn', source: 'Website', status: 'New' },
  { id: 'e3', name: 'Sneha Patil', time: 'Yesterday', phone: '+91 90110 58312', type: 'Delivery planning', date: 'Wed 11 Nov', source: 'Assistant', status: 'Called' },
  { id: 'e4', name: 'Meera Joshi', time: 'Yesterday', phone: '+91 88050 77421', type: 'Postnatal care', date: 'Today, eve', source: 'Phone', status: 'Confirmed' },
  { id: 'e5', name: 'Rutuja Pawar', time: 'Sat', phone: '+91 99223 10458', type: 'First consultation', date: 'Thu 12 Nov', source: 'Assistant', status: 'Follow up' },
  { id: 'e6', name: 'Kavya Iyer', time: 'Sat', phone: '+91 70208 66105', type: 'High-risk review', date: 'Today, morn', source: 'Website', status: 'New' },
];

export type Kpi = { label: string; value: string; delta: string; tone: 'up' | 'warn' | 'neutral' };

export const KPIS: Kpi[] = [
  { label: 'New enquiries', value: '14', delta: '+5 vs yesterday', tone: 'up' },
  { label: "Today's requests", value: '6', delta: '3 unconfirmed', tone: 'warn' },
  { label: 'Pending follow-ups', value: '9', delta: '2 overdue', tone: 'warn' },
  { label: 'Unanswered enquiries', value: '3', delta: 'from assistant', tone: 'neutral' },
];

export const DAILY_SUMMARY = {
  generatedAt: '7:00 am',
  long:
    "14 new enquiries since yesterday — 6 want slots today, mostly first-trimester consultations. 3 questions about NICU visiting couldn't be answered by the assistant. Feedback is warm; one family mentioned a long wait at billing.",
  short: '6 mothers want slots today. 3 NICU visiting questions need a reply. One billing-wait complaint.',
};

export type WhatsAppDraft = { id: string; name: string; phone: string; tag: string; text: string };

export const WHATSAPP_DRAFTS: WhatsAppDraft[] = [
  {
    id: 'w1',
    name: 'Priya Deshmukh',
    phone: '+91 98220 41736',
    tag: 'First consultation',
    text: 'Namaste Priya ji, thank you for contacting Life Springs Maternity Hospital. Dr. Deepak Shinde can see you today between 5–8 pm. Please reply YES to confirm, or tell us a time that suits you.',
  },
  {
    id: 'w2',
    name: 'Rutuja Pawar',
    phone: '+91 99223 10458',
    tag: 'Follow-up',
    text: 'Hello Rutuja ji, this is Life Springs Maternity Hospital. We tried calling about your consultation request for Thu 12 Nov. Shall we book the 11 am slot for you?',
  },
  {
    id: 'w3',
    name: 'Sneha Patil',
    phone: '+91 90110 58312',
    tag: 'Delivery planning',
    text: 'Namaste Sneha ji, your delivery-planning visit is noted for Wed 11 Nov. Please bring your antenatal file and recent scan reports. See you soon!',
  },
];

export const FOLLOWUPS = [
  { name: 'Rutuja Pawar', detail: 'No answer twice · since Sat', priority: 'overdue' as const },
  { name: 'Neha Gokhale', detail: 'Send scan-day reminder', priority: 'soon' as const },
  { name: 'Shruti More', detail: '6-week postnatal review due', priority: 'routine' as const },
];

export const UNANSWERED = [
  { q: 'Can my husband stay overnight in the NICU?', meta: 'Assistant · 9:40 pm' },
  { q: 'Do you accept Star Health cashless?', meta: 'Assistant · 8:15 pm' },
  { q: 'Is there parking for two-wheelers?', meta: 'Website · 6:02 pm' },
];

export const FEEDBACK = [
  { name: 'Meera J.', rating: 5, text: 'Felt cared for from admission to discharge.' },
  { name: 'Ankita R.', rating: 4, text: 'Lovely nurses, but billing took over an hour.' },
  { name: 'Swati D.', rating: 5, text: 'Dr. Shinde was patient with all our questions.' },
];

export const maskPhone = (phone: string, mask: boolean) => (mask ? phone.slice(0, -3) + 'xxx' : phone);
