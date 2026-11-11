import type { EnquiryStatus } from '../../lib/api';

export const STATUS_COLORS: Record<EnquiryStatus, [string, string]> = {
  New: ['#F6E6E0', '#7A3E32'],
  Called: ['#EEF0E6', '#4A5A2A'],
  Confirmed: ['#E3EEEC', '#164B4F'],
  'Follow up': ['#FFF1D9', '#7A5410'],
  Closed: ['#ECEAE6', '#4E5D5C'],
};

export function StatusBadge({ status, size = 12 }: { status: EnquiryStatus; size?: number }) {
  const [bg, fg] = STATUS_COLORS[status] ?? STATUS_COLORS.New;
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '4px 10px',
        borderRadius: 999,
        font: `600 ${size}px/1.3 var(--font-sans)`,
        background: bg,
        color: fg,
        whiteSpace: 'nowrap',
      }}
    >
      {status}
    </span>
  );
}
