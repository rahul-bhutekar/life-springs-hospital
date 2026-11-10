import type { ReactNode } from 'react';

type Props = { children: ReactNode; tone?: 'clay' | 'blush' | 'teal'; className?: string };

/** Small uppercase label that sits above headings. Styles live in global.css (.eyebrow). */
export function Eyebrow({ children, tone = 'clay', className = '' }: Props) {
  return <div className={`eyebrow ${tone === 'clay' ? '' : `eyebrow--${tone}`} ${className}`.trim()}>{children}</div>;
}
