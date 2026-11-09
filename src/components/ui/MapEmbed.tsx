import { HOSPITAL } from '../../data/hospital';
import './MapEmbed.css';

type Props = { className?: string };

/**
 * Google Map pinned to the hospital's address.
 * Builds made with VITE_NO_IFRAMES=true (hosts that block embedded sites)
 * show a card linking to Google Maps instead.
 */
export function MapEmbed({ className = '' }: Props) {
  if (import.meta.env.VITE_NO_IFRAMES === 'true') {
    return (
      <a className={`map map--link ${className}`} href={HOSPITAL.directionsHref} target="_blank" rel="noreferrer">
        <span className="map__pin" aria-hidden="true" />
        <span className="map__card">
          <span className="map__title">{HOSPITAL.name}</span>
          <span className="map__addr">Keshav Nagar, Mundhwa, Pune 411036</span>
          <span className="map__cta">Open in Google Maps →</span>
        </span>
      </a>
    );
  }

  return (
    <div className={`map ${className}`}>
      <iframe
        className="map__frame"
        title={`Map showing ${HOSPITAL.name}, ${HOSPITAL.address}`}
        src={HOSPITAL.mapEmbedSrc}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
      <a className="map__open" href={HOSPITAL.directionsHref} target="_blank" rel="noreferrer">
        Open in Google Maps
      </a>
    </div>
  );
}
