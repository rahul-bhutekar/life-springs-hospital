import { APPOINTMENT_TYPES, DOCTOR, HOSPITAL } from './hospital';

/**
 * Scripted enquiry assistant.
 *
 * This is not an AI model. Every reply is a fixed, hospital-approved answer,
 * picked by matching keywords in what the visitor types. That keeps it from
 * ever giving medical advice it was not approved to give.
 *
 * How a message is handled, in order:
 *  1. Emergency words (pain, bleeding, medicine…) always get the labour-ward
 *     warning, even in the middle of a booking.
 *  2. "Cancel" / "stop" ends a booking that is in progress.
 *  3. If the assistant just asked something (a booking question, or "would
 *     you like a call back?"), the message is treated as the answer.
 *  4. Otherwise it is matched against the approved topics below, then
 *     small talk (hi, thanks, bye, help).
 *  5. Anything else gets an honest "no approved answer" reply that offers a
 *     call back.
 */

const timings = DOCTOR.timings.map((t) => `• ${t.days}: ${t.hours}`).join('\n');

const ANSWERS = {
  pack:
    'Our team suggests packing:\n• ID, antenatal file & reports\n• Insurance / cashless papers\n• 2–3 loose cotton outfits, feeding bras\n• Newborn clothes, caps, swaddles\n• Toiletries & slippers\n\nYour nurse will share the full checklist at your 36-week visit.',
  visit:
    'Visiting hours are 11am–1pm and 5pm–8pm. One family attendant may stay with the mother at all times. NICU visits are for parents only.',
  post:
    'After delivery we offer lactation support, newborn check-ups, and a postnatal review with your doctor at around 6 weeks. You can also book a home-care call with our nurses.',
  services:
    'We offer pregnancy consultations, antenatal check-ups, normal & caesarean delivery, high-risk pregnancy care, a Level II NICU and postnatal support.',
  opd: `${DOCTOR.name} sees patients in OPD:\n${timings}\n\nThe labour ward and emergency care are open 24 × 7.`,
  location: `We are at:\n${HOSPITAL.addressLines.join('\n')}\n\nUse "Directions" on our website to open Google Maps.`,
  contact: `You can call or WhatsApp us on ${HOSPITAL.phoneDisplay}. The labour ward answers 24 × 7.`,
};

export const MENU = [
  'Book an appointment',
  'What to pack for delivery?',
  'Visiting hours',
  'OPD timings',
  'Postnatal care',
  'Your services',
  'Location',
];

const TOPICS_TEXT =
  'I can help with:\n• Booking an appointment or a call back\n• OPD timings and visiting hours\n• What to pack for delivery\n• Postnatal care and our services\n• Our location and phone number\n\nTap a topic below, or type your question.';

export type Lead = { name?: string; phone?: string; date?: string; type?: string };

export type ChatMessage =
  | { id: number; role: 'bot' | 'user' | 'note'; text: string }
  | { id: number; role: 'summary'; lead: Required<Lead> };

/**
 * What the assistant is waiting for:
 * 'menu' = a new question; 'callback' = yes/no to "would you like a call back?";
 * 'name' | 'phone' | 'date' | 'type' = the next booking detail.
 */
export type Step = 'menu' | 'callback' | 'name' | 'phone' | 'date' | 'type';

/**
 * Something the page should do after this reply: send a finished booking to
 * the hospital, or record a question there was no approved answer for.
 * Set only on the reply that caused it.
 */
export type ChatEffect =
  | { id: number; kind: 'enquiry'; lead: Required<Lead> }
  | { id: number; kind: 'question'; question: string };

export type ChatState = { messages: ChatMessage[]; step: Step; lead: Lead; effect?: ChatEffect };

let nextId = 1;
const msg = (role: 'bot' | 'user' | 'note', text: string): ChatMessage => ({ id: nextId++, role, text });

export const initialChat = (): ChatState => ({
  step: 'menu',
  lead: {},
  messages: [
    msg(
      'bot',
      `Namaste! I'm the ${HOSPITAL.name} assistant. I can help with appointments, our maternity services, visiting hours and preparing for delivery.\n\nTap a topic below, or type your question.`,
    ),
    msg(
      'note',
      "I share hospital-approved information only. I can't diagnose, suggest medicines or replace your doctor. For pain, bleeding or reduced baby movement, call the labour ward right away.",
    ),
  ],
});

const CANCEL = 'Cancel booking';
const YES_CALLBACK = 'Yes, call me back';
const NO_THANKS = 'No, thanks';

export const QUICK_REPLIES: Record<Step, string[]> = {
  menu: MENU,
  callback: [YES_CALLBACK, NO_THANKS, ...MENU],
  name: [CANCEL],
  phone: [CANCEL],
  date: ['Tomorrow', 'This week', 'Next week', CANCEL],
  type: [...APPOINTMENT_TYPES, CANCEL],
};

export const PLACEHOLDERS: Record<Step, string> = {
  menu: 'Ask about our maternity care…',
  callback: 'Type yes or no, or ask something else',
  name: 'Type your full name',
  phone: '10-digit mobile number',
  date: 'Or type a date',
  type: 'Or describe briefly',
};

// Keyword patterns. English plus common Hindi/Marathi replies (haan, ho, nahi…).
const RE = {
  emergency: /pain|bleed|blood|medicine|tablet|dose|fever|emergenc|movement|spotting|cramp|water broke|leak|dizz|faint|seizure|headache/i,
  cancel: /^(cancel|stop|quit|exit|never ?mind)\b|cancel booking/i,
  yes: /^(yes|yeah|yep|yup|ya|ok|okay|sure|please|haan?|ho|hoy|ji|y)\b/i,
  no: /^(no|nope|nah|nahi|nako|not now|no thanks)\b/i,
  greeting: /^(hi+|hey+|hello+|helo|hlo|hii+|namaste|namaskar|good (morning|afternoon|evening)|hola)\b/i,
  thanks: /\b(thanks?|thank you|thx|ty|dhanyavaa?d|dhanyawaa?d|shukriya)\b/i,
  bye: /^(bye|goodbye|good bye|see you|ok bye|tata)\b/i,
  help: /^(help|menu|options|topics|start|what can you do)\b/i,
  callback: /call ?back|call me|callback/i,
  book: /book|appoint|slot|consult|check.?up|checkup/i,
  pack: /pack|bag|bring|carry/i,
  opd: /\bopd\b|doctor|dr\.?\s|shinde|clinic|timing|hour|open/i,
  visit: /visit|attendant|stay with/i,
  post: /post|after (delivery|birth)|lactat|feed|breast|newborn care/i,
  services: /service|offer|nicu|deliver|caesar|c-?section|normal|high.?risk|scan/i,
  location: /where|address|locat|direction|map|reach|route|parking/i,
  contact: /phone|number|contact|whats ?app|mobile|call/i,
};

/** Pure reducer: given the current chat and the visitor's text, returns the next chat. */
export function respond(state: ChatState, raw: string): ChatState {
  const text = raw.trim();
  if (!text) return state;
  const { step, lead } = state;
  const user = msg('user', text);
  const say = (next: Partial<ChatState>, ...m: ChatMessage[]): ChatState => ({
    ...state,
    effect: undefined,
    ...next,
    messages: [...state.messages, user, ...m],
  });
  const inBooking = step === 'name' || step === 'phone' || step === 'date' || step === 'type';

  // 1. Safety first, at every step.
  if (RE.emergency.test(text)) {
    return say(
      {},
      msg(
        'note',
        `I'm not able to advise on symptoms or medicines. Please call our 24 × 7 labour ward on ${HOSPITAL.phoneDisplay} now, or come straight to the hospital.`,
      ),
    );
  }

  // 2. Leave a booking.
  if (inBooking && RE.cancel.test(text)) {
    return say({ step: 'menu', lead: {} }, msg('bot', "No problem, I've stopped the booking. What else can I help with?"));
  }

  // 3. Answers to the question the assistant just asked.
  switch (step) {
    case 'name':
      if (!/\p{L}/u.test(text)) {
        return say({}, msg('bot', 'Please type your name so our team knows who to ask for.'));
      }
      return say(
        { step: 'phone', lead: { ...lead, name: text } },
        msg(
          'bot',
          `Thank you, ${text.split(' ')[0]}. Which mobile number should our team call or WhatsApp?\n\nBy sharing it, you agree that ${HOSPITAL.name} may contact you about this enquiry.`,
        ),
      );
    case 'phone': {
      const digits = text.replace(/\D/g, '');
      if (digits.length < 10 || digits.length > 13) {
        return say({}, msg('bot', 'Please share a 10-digit mobile number, for example 98220 41736.'));
      }
      return say({ step: 'date', lead: { ...lead, phone: text } }, msg('bot', 'When would you prefer to visit?'));
    }
    case 'date':
      return say({ step: 'type', lead: { ...lead, date: text } }, msg('bot', 'And what is the appointment for?'));
    case 'type': {
      const done = { name: '', phone: '', date: '', ...lead, type: text };
      return say(
        { step: 'menu', lead: {}, effect: { id: nextId, kind: 'enquiry', lead: done } },
        { id: nextId++, role: 'summary', lead: done },
        msg('bot', 'Thank you. Our team will call you during OPD hours to confirm a time. Anything else I can help with?'),
      );
    }
    case 'callback':
      if (RE.yes.test(text) || text === YES_CALLBACK) return startBooking(say, 'callback');
      if (RE.no.test(text) || text === NO_THANKS) {
        return say({ step: 'menu' }, msg('bot', 'No problem. Tap a topic below, or type another question.'));
      }
      break; // Anything else: treat it as a new question.
    case 'menu':
      break;
  }

  // 4. Approved topics first, so "hi, where are you?" still gets the address…
  const fresh = { step: 'menu' as Step };
  if (RE.callback.test(text)) return startBooking(say, 'callback');
  if (RE.book.test(text)) return startBooking(say, 'appointment');
  if (RE.pack.test(text)) return say(fresh, msg('bot', ANSWERS.pack));
  if (RE.visit.test(text)) return say(fresh, msg('bot', ANSWERS.visit));
  if (RE.opd.test(text)) return say(fresh, msg('bot', ANSWERS.opd));
  if (RE.post.test(text)) return say(fresh, msg('bot', ANSWERS.post));
  if (RE.services.test(text)) return say(fresh, msg('bot', ANSWERS.services));
  if (RE.location.test(text)) return say(fresh, msg('bot', ANSWERS.location));
  if (RE.contact.test(text)) return say(fresh, msg('bot', ANSWERS.contact));

  // …then small talk.
  if (RE.greeting.test(text)) {
    return say(fresh, msg('bot', `Namaste! How can I help you today?\n\n${TOPICS_TEXT}`));
  }
  if (RE.thanks.test(text)) {
    return say(fresh, msg('bot', "You're welcome! Is there anything else I can help with?"));
  }
  if (RE.bye.test(text)) {
    return say(fresh, msg('bot', `Take care! If you need us, call ${HOSPITAL.phoneDisplay}. The labour ward is open 24 × 7.`));
  }
  if (RE.help.test(text) || RE.yes.test(text) || RE.no.test(text)) {
    return say(fresh, msg('bot', TOPICS_TEXT));
  }

  // 5. No approved answer: say so honestly and offer a call back.
  return say(
    { step: 'callback', effect: { id: user.id, kind: 'question', question: text } },
    msg(
      'bot',
      "Sorry, I don't have an approved answer for that yet. Our team can answer it on a call. Would you like a call back?",
    ),
  );
}

function startBooking(say: (next: Partial<ChatState>, ...m: ChatMessage[]) => ChatState, kind: 'appointment' | 'callback') {
  const intro =
    kind === 'callback'
      ? "Sure. I'll take a few details so our team can call you back."
      : 'Happy to help you request an appointment.';
  return say({ step: 'name', lead: {} }, msg('bot', `${intro} What's your full name?`));
}

/** Adds a warning note from the page (e.g. when sending a request failed). */
export function addNote(state: ChatState, text: string): ChatState {
  return { ...state, effect: undefined, messages: [...state.messages, msg('note', text)] };
}
