import { HOSPITAL } from '../../data/hospital';
import staticMap from '../../assets/images/map-hospital.jpg';
import './MapEmbed.css';

type Props = { className?: string };

/**
 * Map of the hospital's location.
 *
 * Shows a live Google Map. A static OpenStreetMap image centred on the same
 * point sits underneath, so something useful shows while the map loads.
 * Builds made with VITE_NO_IFRAMES=true (hosts that block embedded sites)
 * show only the static map, linking to Google Maps.
 */
export function MapEmbed({ className = '' }: Props) {
  const noIframes = import.meta.env.VITE_NO_IFRAMES === 'true';

  const base = (
    <>
      <img className="map__static" src={staticMap} alt="" loading="lazy" decoding="async" />
      <a className="map__credit" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">
        © OpenStreetMap contributors
      </a>
      <span className="map__pin" aria-hidden="true" />
    </>
  );

  if (noIframes) {
    return (
      <div className={`map ${className}`}>
        {base}
        <a className="map__card" href={HOSPITAL.mapsHref} target="_blank" rel="noreferrer">
          <span className="map__title">{HOSPITAL.name}</span>
          <span className="map__addr">Keshav Nagar, Mundhwa, Pune 411036</span>
          <span className="map__cta">Open in Google Maps →</span>
        </a>
      </div>
    );
  }

  return (
    <div className={`map ${className}`}>
      {base}
      <iframe
        className="map__frame"
        title={`Map showing ${HOSPITAL.name}, ${HOSPITAL.address}`}
        src={HOSPITAL.mapEmbedSrc}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
      <a className="map__open" href={HOSPITAL.mapsHref} target="_blank" rel="noreferrer">
        Open in Google Maps
      </a>
    </div>
  );
}
