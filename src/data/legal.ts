import { HOSPITAL } from './hospital';

/**
 * Details used on the Privacy notice and Terms of use pages.
 * Confirm each one with the hospital (and ideally a lawyer) before relying on these pages.
 */
export const LEGAL = {
  /** Shown at the top of both pages. Update whenever the wording changes. */
  lastUpdated: '13 November 2026',
  /** The registered name of the organisation that runs the hospital, if different from the hospital's name. */
  operator: HOSPITAL.name,
  /** Who handles privacy requests and complaints (DPDP Act 2023). Add a named person when one is appointed. */
  grievance: {
    title: 'Grievance Officer',
    email: HOSPITAL.email,
    phone: HOSPITAL.phoneDisplay,
  },
  /** How long enquiry records are kept after the last contact. Must match what staff actually do in the Sheet. */
  retention: '12 months',
  /** How quickly privacy requests and complaints are answered. */
  responseTime: '30 days',
};
