import { Link } from 'react-router-dom';
import './Logo.css';

type Props = {
  /** 'stacked' shows the short name with a small caption (mobile); 'wide' shows the full name. */
  layout?: 'stacked' | 'wide';
  caption?: string;
  tone?: 'default' | 'inverse';
  size?: number;
  to?: string;
};

export function LogoMark({ size = 36, tone = 'default' }: { size?: number; tone?: 'default' | 'inverse' }) {
  return (
    <span className={`logo-mark logo-mark--${tone}`} style={{ width: size, height: size, fontSize: size * 0.47 }} aria-hidden="true">
      Ls
    </span>
  );
}

export function Logo({ layout = 'stacked', caption = 'Maternity · Pune', tone = 'default', size, to = '/' }: Props) {
  return (
    <Link to={to} className={`logo logo--${layout} logo--${tone}`} aria-label="Life Springs Hospital — home">
      <LogoMark size={size ?? (layout === 'wide' ? 40 : 36)} tone={tone === 'inverse' ? 'inverse' : 'default'} />
      {layout === 'wide' ? (
        <span className="logo__name">Life Springs Hospital</span>
      ) : (
        <span>
          <span className="logo__name">Life Springs</span>
          <span className="logo__caption">{caption}</span>
        </span>
      )}
    </Link>
  );
}
