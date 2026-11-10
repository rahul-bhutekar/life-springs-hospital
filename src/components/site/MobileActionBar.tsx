import type { ReactNode } from 'react';
import './MobileActionBar.css';

/** Sticky bottom bar with the primary call-to-action, shown on phones only. */
export function MobileActionBar({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="mobile-action-bar__spacer only-mobile" aria-hidden="true" />
      <div className="mobile-action-bar only-mobile">{children}</div>
    </>
  );
}
