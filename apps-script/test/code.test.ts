import { beforeEach, describe, expect, it } from 'vitest';
// eslint-disable-next-line @typescript-eslint/no-require-imports
import { createFakeBackend } from './fake-apps-script.cjs';

type Backend = ReturnType<typeof createFakeBackend>;
let api: Backend;

const enquiry = (over: Record<string, unknown> = {}) => ({
  action: 'createEnquiry',
  name: 'Priya Deshmukh',
  phone: '+91 98220 41736',
  date: '2026-11-12',
  slot: 'evening',
  type: 'First pregnancy consultation',
  source: 'Website',
  consent: true,
  ...over,
});

beforeEach(() => {
  api = createFakeBackend({ passcode: 'secret-123' });
});

describe('createEnquiry', () => {
  it('saves a row with a reference and status New', () => {
    const res = api.post(enquiry());
    expect(res).toMatchObject({ ok: true });
    expect(res.reference).toMatch(/^LS-\d{4}-0001$/);
    const rows = api.sheet('Enquiries').rows;
    expect(rows[0]).toEqual(expect.arrayContaining(['Reference', 'Status']));
    expect(rows[1]).toEqual(expect.arrayContaining(['Priya Deshmukh', '+919822041736', 'evening', 'Website', 'New']));
  });

  it('numbers references in order', () => {
    api.post(enquiry());
    expect(api.post(enquiry({ phone: '9000000001' })).reference).toMatch(/-0002$/);
  });

  it.each([
    ['9182345678', '+919182345678'],
    ['919822041736', '+919822041736'],
    ['098220 41736', '+919822041736'],
  ])('normalises phone %s', (phone, stored) => {
    api.post(enquiry({ phone }));
    expect(api.sheet('Enquiries').rows[1][3]).toBe(stored);
  });

  it('rejects missing name, short phone and missing consent', () => {
    expect(api.post(enquiry({ name: ' ' }))).toMatchObject({ ok: false, error: 'invalid' });
    expect(api.post(enquiry({ phone: '12345' }))).toMatchObject({ ok: false, error: 'invalid' });
    expect(api.post(enquiry({ consent: false }))).toMatchObject({ ok: false, error: 'invalid' });
    expect(api.sheet('Enquiries')).toBeUndefined();
  });

  it('marks formula-like visitor text as plain text, so the Sheet never runs it', () => {
    const appended: unknown[][] = [];
    const sheet = (api.post(enquiry()), api.sheet('Enquiries'));
    const original = sheet.appendRow;
    sheet.appendRow = (v: unknown[]) => {
      appended.push(v);
      original(v);
    };
    api.post(enquiry({ phone: '9000000002', name: '=HYPERLINK("http://x","y") Priya', type: '@SUM(A1)' }));
    expect(appended[0][2]).toBe('\'=HYPERLINK("http://x","y") Priya');
    expect(appended[0][6]).toBe("'@SUM(A1)");
    expect(appended[0][3]).toBe("'+919000000002");
  });

  it('ignores the spam trap without saving', () => {
    expect(api.post(enquiry({ website: 'spam.example' }))).toMatchObject({ ok: true });
    expect(api.sheet('Enquiries')).toBeUndefined();
  });

  it('limits repeat requests from one phone number', () => {
    for (let i = 0; i < 3; i++) expect(api.post(enquiry()).ok).toBe(true);
    expect(api.post(enquiry())).toMatchObject({ ok: false, error: 'rate_limited' });
    expect(api.post(enquiry({ phone: '9000000003' })).ok).toBe(true);
  });

  it('trims long text', () => {
    api.post(enquiry({ type: 'x'.repeat(500) }));
    expect(String(api.sheet('Enquiries').rows[1][6]).length).toBe(80);
  });
});

describe('preferred dates', () => {
  it('keeps a preferred date like "Sat 14 Nov" as text instead of letting Sheets turn it into a date', () => {
    const { reference } = api.post(enquiry({ date: 'Sat 14 Nov', phone: '9000000010' }));
    const row = api.sheet('Enquiries').rows.find((r: unknown[]) => r[0] === reference);
    expect(row[4]).toBe('Sat 14 Nov');
    const res = api.post({ action: 'listEnquiries', passcode: 'secret-123' });
    expect(res.enquiries[0].date).toBe('Sat 14 Nov');
  });

  it('shows rows that Sheets already turned into dates as a short day, not a long date-time', () => {
    api.post(enquiry());
    api.sheet('Enquiries').rows[1][4] = new Date(2026, 10, 14); // what older rows look like
    const res = api.post({ action: 'listEnquiries', passcode: 'secret-123' });
    expect(res.enquiries[0].date).toBe('Sat 14 Nov');
  });

  it('keeps other visitor text as text too', () => {
    api.post(enquiry({ name: '12 May', phone: '9000000011', type: '2026-01-01' }));
    const res = api.post({ action: 'listEnquiries', passcode: 'secret-123' });
    expect(res.enquiries[0]).toMatchObject({ name: '12 May', type: '2026-01-01' });
  });
});

describe('logQuestion', () => {
  it('saves the question', () => {
    expect(api.post({ action: 'logQuestion', question: 'Do you have a cafeteria?', source: 'Assistant' })).toEqual({ ok: true });
    expect(api.sheet('Questions').rows[1][1]).toBe('Do you have a cafeteria?');
  });
  it('rejects an empty question', () => {
    expect(api.post({ action: 'logQuestion', question: '  ' }).ok).toBe(false);
  });
});

describe('admin actions', () => {
  it('needs the right passcode', () => {
    expect(api.post({ action: 'listEnquiries', passcode: 'wrong' })).toMatchObject({ ok: false, error: 'unauthorized' });
    expect(api.post({ action: 'listEnquiries' })).toMatchObject({ ok: false, error: 'unauthorized' });
  });

  it('locks out after 10 wrong passcodes', () => {
    for (let i = 0; i < 10; i++) api.post({ action: 'listEnquiries', passcode: 'nope' });
    expect(api.post({ action: 'listEnquiries', passcode: 'secret-123' })).toMatchObject({ ok: false, error: 'locked' });
  });

  it('lists enquiries newest first, with questions', () => {
    api.post(enquiry({ name: 'First' }));
    api.post(enquiry({ name: 'Second', phone: '9000000004' }));
    api.post({ action: 'logQuestion', question: 'Parking?' });
    const res = api.post({ action: 'listEnquiries', passcode: 'secret-123' });
    expect(res.ok).toBe(true);
    expect(res.enquiries.map((e: { name: string }) => e.name)).toEqual(['Second', 'First']);
    expect(res.enquiries[0]).toMatchObject({ status: 'New', source: 'Website', phone: '+919000000004' });
    expect(new Date(res.enquiries[0].received).toString()).not.toBe('Invalid Date');
    expect(res.questions[0].question).toBe('Parking?');
  });

  it('lists nothing when the sheet is empty', () => {
    expect(api.post({ action: 'listEnquiries', passcode: 'secret-123' })).toEqual({ ok: true, enquiries: [], questions: [] });
  });

  it('updates a status', () => {
    const { reference } = api.post(enquiry());
    expect(api.post({ action: 'updateStatus', passcode: 'secret-123', reference, status: 'Called' })).toEqual({ ok: true });
    const res = api.post({ action: 'listEnquiries', passcode: 'secret-123' });
    expect(res.enquiries[0].status).toBe('Called');
  });

  it('rejects unknown statuses and references', () => {
    const { reference } = api.post(enquiry());
    expect(api.post({ action: 'updateStatus', passcode: 'secret-123', reference, status: 'Deleted' }).error).toBe('invalid');
    expect(api.post({ action: 'updateStatus', passcode: 'secret-123', reference: 'LS-0000-9999', status: 'Called' }).error).toBe('not_found');
    expect(api.post({ action: 'updateStatus', passcode: 'bad', reference, status: 'Called' }).error).toBe('unauthorized');
  });

  it('reports a missing passcode setting', () => {
    const unset = createFakeBackend({ passcode: '' });
    expect(unset.post({ action: 'listEnquiries', passcode: '' }).error).toBe('not_configured');
  });
});

describe('markQuestion', () => {
  const list = () => api.post({ action: 'listEnquiries', passcode: 'secret-123' });
  const ask = (question: string) => api.post({ action: 'logQuestion', question });
  const mark = (q: { received: string; question: string }, answered?: boolean) =>
    api.post({ action: 'markQuestion', passcode: 'secret-123', received: q.received, question: q.question, answered });

  it('hides a question marked as answered, and keeps the row in the Sheet', () => {
    ask('Parking?');
    ask('Cafeteria?');
    const [cafeteria] = list().questions;
    expect(mark(cafeteria)).toEqual({ ok: true });
    expect(list().questions.map((q: { question: string }) => q.question)).toEqual(['Parking?']);
    const row = api.sheet('Questions').rows.find((r: unknown[]) => r[1] === 'Cafeteria?');
    expect(row[3]).toBeInstanceOf(Date);
  });

  it('undo brings the question back', () => {
    ask('Parking?');
    const [q] = list().questions;
    mark(q);
    expect(list().questions).toHaveLength(0);
    expect(mark(q, false)).toEqual({ ok: true });
    expect(list().questions.map((x: { question: string }) => x.question)).toEqual(['Parking?']);
  });

  it('needs the passcode, and reports a question that no longer exists', () => {
    ask('Parking?');
    const [q] = list().questions;
    expect(api.post({ action: 'markQuestion', passcode: 'bad', received: q.received, question: q.question }).error).toBe('unauthorized');
    expect(mark({ received: q.received, question: 'Something else' }).error).toBe('not_found');
  });

  it('adds the Handled column to a Questions tab made by the older script', () => {
    ask('Parking?');
    const sheet = api.sheet('Questions');
    sheet.rows[0] = ['Received', 'Question', 'Source']; // what older Sheets have
    sheet.rows[1].length = 3;
    const [q] = list().questions;
    expect(mark(q)).toEqual({ ok: true });
    expect(sheet.rows[0]).toEqual(['Received', 'Question', 'Source', 'Handled']);
    expect(list().questions).toHaveLength(0);
  });
});

describe('requests', () => {
  it('rejects bad JSON and unknown actions', () => {
    expect(api.post('not json').error).toBe('bad_request');
    expect(api.post({ action: 'dropTables' }).error).toBe('bad_request');
  });
  it('answers GET with a health check', () => {
    expect(api.get()).toEqual({ ok: true, service: 'life-springs-enquiries' });
  });
});
