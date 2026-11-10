export type OpdDay = { iso: string; weekday: string; day: number; month: string; label: string };

/** Next `count` OPD days starting today. Sundays are skipped (emergencies only). */
export function upcomingOpdDays(count = 5, from = new Date()): OpdDay[] {
  const days: OpdDay[] = [];
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  while (days.length < count) {
    if (d.getDay() !== 0) {
      const weekday = d.toLocaleDateString('en-IN', { weekday: 'short' });
      const month = d.toLocaleDateString('en-IN', { month: 'short' });
      days.push({
        iso: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
        weekday,
        day: d.getDate(),
        month,
        label: `${weekday} ${d.getDate()} ${month}`,
      });
    }
    d.setDate(d.getDate() + 1);
  }
  return days;
}

export const formatIndianMobile = (digits: string) =>
  digits.length > 5 ? `${digits.slice(0, 5)} ${digits.slice(5)}` : digits;
