import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { HOSPITAL } from '../../data/hospital';
import './CallLink.css';

type Props = { className?: string; children: ReactNode };

/**
 * Link that calls the hospital.
 *
 * Normally a plain `tel:` link, which opens the phone's dialer. Builds made
 * with VITE_NO_TEL=true (hosts that block phone links, such as the claude.ai
 * preview) open a small panel with the number and a Copy button instead, so
 * the button never silently does nothing.
 */
export function CallLink({ className = '', children }: Props) {
  const [open, setOpen] = useState(false);

  if (import.meta.env.VITE_NO_TEL !== 'true') {
    return (
      <a className={className} href={HOSPITAL.phoneHref}>
        {children}
      </a>
    );
  }

  return (
    <>
      <button type="button" className={`call-link ${className}`} onClick={() => setOpen(true)} aria-haspopup="dialog">
        {children}
      </button>
      {/* Rendered at the end of <body> so no parent (e.g. the blurred sticky header) can clip it. */}
      {open && createPortal(<CallPanel onClose={() => setOpen(false)} />, document.body)}
    </>
  );
}

function CallPanel({ onClose }: { onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const numberRef = useRef<HTMLParagraphElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const copy = () => {
    const done = () => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    };
    const selectNumber = () => {
      const el = numberRef.current;
      if (!el) return;
      const range = document.createRange();
      range.selectNodeContents(el);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(HOSPITAL.phoneDisplay).then(done, selectNumber);
    } else {
      selectNumber();
    }
  };

  return (
    <div className="call-panel__backdrop" onClick={onClose}>
      <div
        className="call-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="call-panel-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="call-panel-title" className="call-panel__title">
          Call {HOSPITAL.name}
        </h2>
        <p ref={numberRef} className="call-panel__number">
          {HOSPITAL.phoneDisplay}
        </p>
        <p className="call-panel__hint">
          This preview can't open your phone's dialer. Copy the number and call it from your phone. The labour ward
          answers 24 × 7.
        </p>
        <div className="call-panel__actions">
          <button type="button" className="btn btn--primary btn--md" onClick={copy}>
            {copied ? 'Copied ✓' : 'Copy number'}
          </button>
          <button ref={closeRef} type="button" className="btn btn--outline btn--md" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
