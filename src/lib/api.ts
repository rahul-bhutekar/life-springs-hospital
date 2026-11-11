/**
 * Everything the website sends to or reads from the hospital's backend goes
 * through this file. Today the backend is a Google Sheet with an Apps Script
 * web app (apps-script/Code.gs, set up with docs/GOOGLE_SHEETS_SETUP.md).
 * Moving to another backend (e.g. Supabase) means rewriting only this file.
 *
 * Set VITE_SHEETS_URL to the web app's URL to connect. Without it the site
 * runs in demo mode: forms show a confirmation but save nothing, and the
 * admin board shows sample data.
 */
import { sampleEnquiries, sampleQuestions } from '../data/dashboard';

const SHEETS_URL = ((import.meta.env.VITE_SHEETS_URL as string | undefined) ?? '').trim();

/** True when the site is connected to the Google Sheet; false in demo mode. */
export const isBackendConnected = SHEETS_URL !== '';

export type EnquiryStatus = 'New' | 'Called' | 'Confirmed' | 'Follow up' | 'Closed';

/** One row of the "Enquiries" sheet. */
export type StoredEnquiry = {
  reference: string;
  /** ISO timestamp. */
  received: string;
  name: string;
  phone: string;
  date: string;
  slot: string;
  type: string;
  source: string;
  status: EnquiryStatus;
  notes: string;
  updated: string;
};

/** One row of the "Questions" sheet: something the assistant could not answer. */
export type StoredQuestion = { received: string; question: string; source: string };

export type AdminData = { enquiries: StoredEnquiry[]; questions: StoredQuestion[] };

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function call<T>(body: Record<string, unknown>): Promise<T> {
  let res: Response;
  try {
    // text/plain keeps this a "simple" request, which Apps Script web apps accept from other sites.
    res = await fetch(SHEETS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiError('network', "We couldn't reach the hospital's system. Check your internet connection and try again.");
  }
  let data: { ok?: boolean; error?: string; message?: string } & T;
  try {
    data = await res.json();
  } catch {
    throw new ApiError('bad_response', "The hospital's system sent an unexpected reply. Please try again.");
  }
  if (!data.ok) throw new ApiError(data.error ?? 'error', data.message ?? 'Something went wrong. Please try again.');
  return data;
}

const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ---------- Public: website visitors ----------

export type AppointmentRequest = {
  name: string;
  phone: string;
  /** Preferred date as shown to the visitor, e.g. "Thu 12 Nov". */
  date: string;
  slot: string;
  type: string;
  consent: boolean;
  /** Spam trap: a hidden field people never fill. */
  website?: string;
};

export type AppointmentReceipt = { reference: string };

export async function submitAppointmentRequest(req: AppointmentRequest): Promise<AppointmentReceipt> {
  if (!isBackendConnected) {
    await pause(400);
    return { reference: demoReference() };
  }
  const { reference } = await call<AppointmentReceipt>({ action: 'createEnquiry', source: 'Website', ...req });
  return { reference };
}

/** A booking or call-back request completed in the assistant chat. */
export async function submitAssistantEnquiry(lead: { name: string; phone: string; date: string; type: string }) {
  if (!isBackendConnected) return { reference: demoReference() };
  return call<AppointmentReceipt>({ action: 'createEnquiry', source: 'Assistant', slot: '', consent: true, ...lead });
}

/** Records a question the assistant had no approved answer for. Never throws. */
export async function logUnansweredQuestion(question: string): Promise<void> {
  if (!isBackendConnected) return;
  try {
    await call({ action: 'logQuestion', source: 'Assistant', question });
  } catch {
    // Losing one logged question is not worth bothering the visitor about.
  }
}

// ---------- Admin board ----------

export async function fetchAdminData(passcode: string): Promise<AdminData> {
  if (!isBackendConnected) {
    await pause(150);
    const now = new Date();
    return { enquiries: sampleEnquiries(now), questions: sampleQuestions(now) };
  }
  const { enquiries, questions } = await call<AdminData>({ action: 'listEnquiries', passcode });
  return { enquiries, questions };
}

export async function updateEnquiryStatus(passcode: string, reference: string, status: EnquiryStatus): Promise<void> {
  if (!isBackendConnected) return;
  await call({ action: 'updateStatus', passcode, reference, status });
}

function demoReference() {
  const d = new Date();
  return `LS-${String(d.getFullYear()).slice(-2)}${String(d.getMonth() + 1).padStart(2, '0')}-${Math.floor(Math.random() * 9000) + 1000}`;
}
