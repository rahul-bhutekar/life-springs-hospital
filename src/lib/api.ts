/**
 * Placeholder for the hospital's enquiry backend. Swap the body of these
 * functions for real API calls (e.g. POST /api/appointments) when available.
 */
export type AppointmentRequest = {
  name: string;
  phone: string;
  date: string;
  slot: string;
  type: string;
  consent: boolean;
};

export type AppointmentReceipt = { reference: string };

export async function submitAppointmentRequest(req: AppointmentRequest): Promise<AppointmentReceipt> {
  await new Promise((r) => setTimeout(r, 400));
  const d = new Date(req.date);
  const yy = String(d.getFullYear()).slice(-2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const n = String(Math.floor(Math.random() * 9000) + 1000);
  return { reference: `LS-${yy}${mm}-${n}` };
}
