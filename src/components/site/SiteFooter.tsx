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
          <a href="#privacy">Privacy</a> · <a href="#terms">Terms</a> ·{' '}
          <span className="only-desktop-inline">Information on this site is not a substitute for medical advice.</span>
          <span className="only-mobile-inline">For medical emergencies, call the hospital directly.</span>
        </span>
      </div>
    </footer>
  );
}
