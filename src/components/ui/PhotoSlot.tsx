import type { CSSProperties, ReactNode } from 'react';
import './PhotoSlot.css';

type Props = {
  /** Describes the photo that belongs here; shown as a caption until a real image is supplied. */
  label: string;
  /** A real photo for this slot; when given, the caption placeholder is not shown. */
  image?: { src: string; alt: string; position?: string };
  tone?: 'sand' | 'teal' | 'mint' | 'blush';
  className?: string;
  style?: CSSProperties;
  labelPosition?: 'bottom' | 'top';
  /** Load immediately (for photos visible on first paint, like the hero). */
  eager?: boolean;
  children?: ReactNode;
};

/**
 * Image slot. Shows `image` when given; otherwise renders the striped
 * placeholder from the design with a short art-direction caption.
 */
export function PhotoSlot({ label, image, tone = 'sand', className = '', style, labelPosition = 'bottom', eager = false, children }: Props) {
  return (
    <div className={`photo photo--${tone} ${image ? 'photo--filled' : ''} ${className}`} style={style}>
      {image ? (
        <img
          className="photo__img"
          src={image.src}
          alt={image.alt}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          style={image.position ? { objectPosition: image.position } : undefined}
        />
      ) : (
        <span className={`photo__label photo__label--${labelPosition}`}>{label}</span>
      )}
      {children}
    </div>
  );
}
