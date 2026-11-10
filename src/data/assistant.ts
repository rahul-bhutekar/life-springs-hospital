import { APPOINTMENT_TYPES, HOSPITAL } from './hospital';

/** Scripted, hospital-approved answer set for the enquiry assistant. */
const ANSWERS = {
  pack:
    'Our team suggests packing:\n• ID, antenatal file & reports\n• Insurance / cashless papers\n• 2–3 loose cotton outfits, feeding bras\n• Newborn clothes, caps, swaddles\n• Toiletries & slippers\n\nYour nurse will share the full checklist at your 36-week visit.',
  visit:
    'Visiting hours are 11am–1pm and 5pm–8pm. One family attendant may stay with the mother at all times. NICU visits are for parents only.',
  post:
    'After delivery we offer lactation support, newborn check-ups, and a postnatal review with your doctor at around 6 weeks. You can also book a home-care call with our nurses.',
  services:
    'We offer pregnancy consultations, antenatal check-ups, normal & caesarean delivery, high-risk pregnancy care, a Level II NICU and postnatal support.',
};

export const MENU = [
  'Book an appointment',
  'What to pack for delivery?',
  'Visiting hours',
  'Postnatal care',
  'Your services',
];

export type Lead = { name?: string; phone?: string; date?: string; type?: string };

export type ChatMessage =
  | { id: number; role: 'bot' | 'user' | 'note'; text: string }
  | { id: number; role: 'summary'; lead: Required<Lead> };

export type Step = 'menu' | 'name' | 'phone' | 'date' | 'type';

export type ChatState = { messages: ChatMessage[]; step: Step; lead: Lead };

let nextId = 1;
const msg = (role: 'bot' | 'user' | 'note', text: string): ChatMessage => ({ id: nextId++, role, text });

export const initialChat = (): ChatState => ({
  step: 'menu',
  lead: {},
  messages: [
    msg(
      'bot',
      "Namaste! I'm the Life Springs Maternity Hospital assistant. I can help with appointments, our maternity services, visiting hours and preparing for delivery.",
    ),
    msg(
      'note',
      "I share hospital-approved information only. I can't diagnose, suggest medicines or replace your doctor. For pain, bleeding or reduced baby movement, call the labour ward right away.",
    ),
  ],
});

export const QUICK_REPLIES: Record<Step, string[]> = {
  menu: MENU,
  name: [],
  phone: [],
  date: ['Tomorrow', 'This week', 'Next week'],
  type: APPOINTMENT_TYPES,
};

export const PLACEHOLDERS: Record<Step, string> = {
  menu: 'Ask about our maternity care…',
  name: 'Type your full name',
  phone: '10-digit mobile number',
  date: 'Or type a date',
  type: 'Or describe briefly',
};

/** Pure reducer: given the current chat and the user's text, returns the next chat. */
export function respond(state: ChatState, raw: string): ChatState {
  const text = raw.trim();
  if (!text) return state;
  const { step, lead } = state;
  const user = msg('user', text);
  const add = (...m: ChatMessage[]) => [...state.messages, user, ...m];

  switch (step) {
    case 'name':
      return {
        step: 'phone',
        lead: { ...lead, name: text },
        messages: add(msg('bot', `Thank you, ${text.split(' ')[0]}. Which mobile number should our team call or WhatsApp?`)),
      };
    case 'phone':
      if (text.replace(/\D/g, '').length < 10) {
        return { ...state, messages: add(msg('bot', 'That looks short — please share a 10-digit mobile number.')) };
      }
      return {
        step: 'date',
        lead: { ...lead, phone: text },
        messages: add(msg('bot', 'When would you prefer to visit?')),
      };
    case 'date':
      return {
        step: 'type',
        lead: { ...lead, date: text },
        messages: add(msg('bot', 'And what is the appointment for?')),
      };
    case 'type': {
      const done = { name: '', phone: '', date: '', ...lead, type: text };
      return {
        step: 'menu',
        lead: {},
        messages: add(
          { id: nextId++, role: 'summary', lead: done },
          msg('bot', 'Done — our team will call you during OPD hours to confirm a time. Anything else I can help with?'),
        ),
      };
    }
    case 'menu':
      break;
  }

  if (/pain|bleed|medicine|tablet|dose|fever|emergenc|movement|spotting|cramp/i.test(text)) {
    return {
      ...state,
      messages: add(
        msg(
          'note',
          `I'm not able to advise on symptoms or medicines. Please call our 24 × 7 labour ward on ${HOSPITAL.phoneDisplay} now, or come straight to the hospital.`,
        ),
      ),
    };
  }
  if (/book|appoint|slot|consult/i.test(text)) {
    return {
      ...state,
      step: 'name',
      messages: add(msg('bot', "Happy to help you request an appointment. What's your full name?")),
    };
  }
  let reply =
    "I don't have an approved answer for that yet, so I've passed your question to our hospital team. Would you like to request a call back?";
  if (/pack|bag|bring/i.test(text)) reply = ANSWERS.pack;
  else if (/visit|hour|timing/i.test(text)) reply = ANSWERS.visit;
  else if (/post|after|lactat|feed|newborn/i.test(text)) reply = ANSWERS.post;
  else if (/service|offer|nicu|deliver/i.test(text)) reply = ANSWERS.services;
  return { ...state, messages: add(msg('bot', reply)) };
}
