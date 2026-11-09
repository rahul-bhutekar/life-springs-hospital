import type { CSSProperties, ReactNode } from 'react';
import './PhotoSlot.css';

type Props = {
  /** Describes the photo that belongs here; shown as a caption until a real image is supplied. */
  label: string;
  src?: string;
  tone?: 'sand' | 'teal' | 'mint' | 'blush';
  className?: string;
  style?: CSSProperties;
  labelPosition?: 'bottom' | 'top';
  children?: ReactNode;
};

/**
 * Image slot. Until real maternity/newborn photography is supplied, renders the
 * striped placeholder from the design with a short art-direction caption.
 */
export function PhotoSlot({ label, src, tone = 'sand', className = '', style, labelPosition = 'bottom', children }: Props) {
  return (
    <div className={`photo photo--${tone} ${className}`} style={style}>
      {src ? (
        <img className="photo__img" src={src} alt={label} />
      ) : (
        <span className={`photo__label photo__label--${labelPosition}`}>{label}</span>
      )}
      {children}
    </div>
  );
}
