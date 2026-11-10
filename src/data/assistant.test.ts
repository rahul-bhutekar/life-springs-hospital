import { describe, expect, it } from 'vitest';
import { QUICK_REPLIES, initialChat, respond, type ChatMessage, type ChatState } from './assistant';

/** Sends each message in turn and returns the final chat. */
function chat(...inputs: string[]): ChatState {
  return inputs.reduce((state, text) => respond(state, text), initialChat());
}

/** Text of the last reply from the assistant (bot message or warning note). */
function lastReply(state: ChatState): string {
  const m = [...state.messages].reverse().find((x): x is Extract<ChatMessage, { text: string }> => 'text' in x && x.role !== 'user');
  return m?.text ?? '';
}

describe('greetings and small talk', () => {
  it.each(['Hi', 'hii', 'Hello', 'hey', 'Namaste', 'Good morning'])('greets "%s" and lists topics', (hi) => {
    const s = chat(hi);
    expect(lastReply(s)).toMatch(/^Namaste! How can I help/);
    expect(lastReply(s)).toMatch(/Tap a topic below/);
    expect(s.step).toBe('menu');
  });

  it('answers the topic when a greeting comes with a question', () => {
    expect(lastReply(chat('hi, where are you located?'))).toMatch(/Mundhwa/);
    expect(chat('hello I want to book an appointment').step).toBe('name');
  });

  it('handles thanks, bye and help', () => {
    expect(lastReply(chat('thank you'))).toMatch(/You're welcome/);
    expect(lastReply(chat('bye'))).toMatch(/Take care/);
    expect(lastReply(chat('menu'))).toMatch(/I can help with/);
  });

  it('"ok, I want to book" starts a booking, not the topic list', () => {
    expect(chat('ok, I want to book').step).toBe('name');
  });
});

describe('the reported conversation: Hi, then Yes', () => {
  it('no longer repeats the fallback', () => {
    const s = chat('Hi', 'Yes');
    expect(lastReply(s)).not.toMatch(/don't have an approved answer/);
    expect(lastReply(s)).toMatch(/I can help with/);
  });
});

describe('fallback and call back', () => {
  it('is honest and offers a call back', () => {
    const s = chat('Do you have a cafeteria?');
    expect(lastReply(s)).toMatch(/don't have an approved answer/);
    expect(lastReply(s)).not.toMatch(/passed your question/);
    expect(s.step).toBe('callback');
    expect(QUICK_REPLIES.callback[0]).toBe('Yes, call me back');
  });

  it.each(['Yes', 'yes please', 'Haan', 'ok', 'Yes, call me back'])('"%s" after the offer starts the call-back details', (yes) => {
    const s = chat('Do you have a cafeteria?', yes);
    expect(s.step).toBe('name');
    expect(lastReply(s)).toMatch(/call you back.*full name/);
  });

  it.each(['No', 'nahi', 'No, thanks'])('"%s" after the offer returns to the menu', (no) => {
    const s = chat('Do you have a cafeteria?', no);
    expect(s.step).toBe('menu');
    expect(lastReply(s)).toMatch(/No problem/);
  });

  it('a new question after the offer is answered normally', () => {
    expect(lastReply(chat('Do you have a cafeteria?', 'visiting hours'))).toMatch(/Visiting hours are/);
  });
});

describe('booking flow', () => {
  it('collects name, phone, date and type, then shows a summary', () => {
    const s = chat('Book an appointment', 'Priya Deshmukh', '98220 41736', 'Tomorrow', 'Delivery planning');
    const summary = s.messages.find((m) => m.role === 'summary');
    expect(summary).toMatchObject({ lead: { name: 'Priya Deshmukh', phone: '98220 41736', date: 'Tomorrow', type: 'Delivery planning' } });
    expect(s.step).toBe('menu');
  });

  it('asks again for a short phone number', () => {
    const s = chat('book', 'Priya', '12345');
    expect(s.step).toBe('phone');
    expect(lastReply(s)).toMatch(/10-digit/);
  });

  it('can be cancelled at any step', () => {
    expect(chat('book', 'Priya', 'Cancel booking').step).toBe('menu');
    expect(lastReply(chat('book', 'cancel'))).toMatch(/stopped the booking/);
  });

  it('still warns about emergencies in the middle of a booking', () => {
    const s = chat('book', 'I am bleeding');
    expect(lastReply(s)).toMatch(/labour ward/);
    expect(s.lead.name).toBeUndefined();
  });
});

describe('approved topics', () => {
  it.each([
    ['What to pack for delivery?', /Our team suggests packing/],
    ['Visiting hours', /Visiting hours are/],
    ['OPD timings', /sees patients in OPD/],
    ['when is the doctor available', /sees patients in OPD/],
    ['Postnatal care', /After delivery we offer/],
    ['Your services', /We offer pregnancy consultations/],
    ['Location', /Sr No\. 35/],
    ['what is your whatsapp number', /070318 80088/],
    ['I have pain', /not able to advise on symptoms/],
  ])('"%s"', (q, answer) => {
    expect(lastReply(chat(q))).toMatch(answer);
  });

  it('every menu button gets an approved answer', () => {
    for (const q of QUICK_REPLIES.menu) {
      expect(lastReply(chat(q)), q).not.toMatch(/don't have an approved answer/);
    }
  });
});
