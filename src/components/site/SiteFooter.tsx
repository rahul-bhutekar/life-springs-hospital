import { Link } from 'react-router-dom';
import { HOSPITAL } from '../../data/hospital';
import './SiteFooter.css';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <span>
          © {HOSPITAL.year} {HOSPITAL.name}, Pune
        </span>
        <span>
          <Link to="/privacy">Privacy</Link> · <Link to="/terms">Terms</Link> ·{' '}
          <span className="only-desktop-inline">Information on this site is not a substitute for medical advice.</span>
          <span className="only-mobile-inline">For medical emergencies, call the hospital directly.</span>
        </span>
      </div>
    </footer>
  );
}
