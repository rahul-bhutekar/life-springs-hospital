import { useEffect, useState } from 'react';
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

  useEffect(() => setOpen(false), [location.pathname, location.hash]);

  return (
    <header className="site-header">
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
            type="button"
            className="site-header__menu only-mobile"
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
            <Link key={l.label} to={l.to}>
              {l.label}
            </Link>
          ))}
          <Link to="/assistant">Ask our assistant</Link>
        </nav>
      )}
    </header>
  );
}
