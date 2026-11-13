import { describe, expect, it } from 'vitest';
import { FILTERS, buildKpis, matchesFilter, sampleEnquiries, sampleQuestions } from './dashboard';

const now = new Date('2026-11-13T15:00:00');
const enquiries = sampleEnquiries(now);
const questions = sampleQuestions(now);

describe('number tiles and filters', () => {
  it('each enquiry tile counts exactly the rows its filter shows', () => {
    for (const k of buildKpis(enquiries, questions, now)) {
      const action = k.action;
      if (action === 'questions') continue;
      expect(enquiries.filter((e) => matchesFilter(e, action, now)).length, k.label).toBe(k.value);
    }
  });

  it('tiles are in the expected order with the expected actions', () => {
    expect(buildKpis(enquiries, questions, now).map((k) => k.action)).toEqual(['new', 'today', 'followup', 'questions']);
  });

  it('filters by status and by the day received', () => {
    const names = (f: Parameters<typeof matchesFilter>[1]) => enquiries.filter((e) => matchesFilter(e, f, now)).map((e) => e.name);
    expect(names('new')).toEqual(['Priya Deshmukh', 'Aarti Kulkarni', 'Kavya Iyer']);
    expect(names('followup')).toEqual(['Rutuja Pawar']);
    expect(names('today')).toEqual(['Priya Deshmukh', 'Aarti Kulkarni']);
    expect(names('all')).toHaveLength(enquiries.length);
  });

  it('has a tab for every enquiry filter', () => {
    expect(FILTERS.map((f) => f.key)).toEqual(['all', 'new', 'today', 'followup']);
  });
});
