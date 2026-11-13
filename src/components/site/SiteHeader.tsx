import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { HOSPITAL } from '../../data/hospital';
import { Button } from '../ui/Button';
import { CallLink } from '../ui/CallLink';
import { Logo } from '../ui/Logo';
import './SiteHeader.css';

export const NAV_LINKS = [
  { label: 'Services', to: '/#services' },
  { label: 'Doctors', to: '/doctor' },
  { label: 'Facilities', to: '/#facilities' },
  { label: 'Stories', to: '/#stories' },
  { label: 'Contact', to: '/#contact' },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const menuButton = useRef<HTMLButtonElement>(null);
  const close = () => setOpen(false);

  useEffect(() => setOpen(false), [location.pathname, location.hash]);

  // While the menu is open: Escape closes it, and the page behind doesn't scroll.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        menuButton.current?.focus();
      }
    };
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <header className={`site-header ${open ? 'is-menu-open' : ''}`}>
      <div className="site-header__inner">
        <span className="only-mobile">
          <Logo layout="stacked" />
        </span>
        <span className="only-desktop">
          <Logo layout="wide" />
        </span>

        <nav className="site-header__nav only-desktop" aria-label="Main">
          {NAV_LINKS.map((l) => (
            <Link key={l.label} to={l.to}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="site-header__actions">
          <CallLink className="site-header__call only-mobile">Call</CallLink>
          <button
            ref={menuButton}
            type="button"
            className={`site-header__menu only-mobile ${open ? 'is-open' : ''}`}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((o) => !o)}
          >
            <span />
            <span />
            <span />
          </button>
          <CallLink className="site-header__phone only-desktop">{HOSPITAL.phoneDisplay}</CallLink>
          <Button to="/appointment" size="sm" className="only-desktop">
            Book appointment
          </Button>
        </div>
      </div>

      {open && (
        <nav id="mobile-menu" className="site-header__drawer only-mobile" aria-label="Main">
          {NAV_LINKS.map((l) => (
            <Link key={l.label} to={l.to} onClick={close}>
              {l.label}
              <span aria-hidden="true">›</span>
            </Link>
          ))}
          <Link to="/assistant" className="site-header__drawer-cta" onClick={close}>
            Ask our assistant
          </Link>
        </nav>
      )}
      {/* Dims the page behind the open menu; rendered on <body> so the header's blur can't clip it. */}
      {open &&
        createPortal(<div className="site-header__backdrop only-mobile" aria-hidden="true" onClick={close} />, document.body)}
    </header>
  );
}
