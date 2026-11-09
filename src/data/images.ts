/**
 * Stock photography used until real hospital photos are available.
 * All images are from Unsplash (https://unsplash.com/license — free for
 * commercial use, no attribution required). See docs/IMAGE_CREDITS.md.
 *
 * To use real photos: replace the files in src/assets/images/ keeping the
 * same names, or point these imports at new files.
 */
import doctor from '../assets/images/doctor.jpg';
import deliverySuite from '../assets/images/facility-delivery-suite.jpg';
import lactation from '../assets/images/facility-lactation.jpg';
import nicu from '../assets/images/facility-nicu.jpg';
import recoveryRoom from '../assets/images/facility-recovery-room.jpg';
import heroMother from '../assets/images/hero-mother.jpg';

export type SiteImage = { src: string; alt: string; position?: string };

export const IMAGES = {
  hero: { src: heroMother, alt: 'An expectant mother making a heart shape with her hands over her bump', position: '50% 55%' },
  // Deliberately shows no face: it stands in for a named doctor until his real portrait is available.
  doctor: { src: doctor, alt: 'A doctor in a white coat holding a stethoscope', position: '50% 40%' },
  deliverySuite: { src: deliverySuite, alt: 'A clean, bright delivery room' },
  recoveryRoom: { src: recoveryRoom, alt: 'A calm private room with a made bed' },
  nicu: { src: nicu, alt: "A newborn's feet wrapped in a soft white towel" },
  lactation: { src: lactation, alt: 'A newborn sleeping peacefully' },
} satisfies Record<string, SiteImage>;
