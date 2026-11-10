import { MobileActionBar } from '../components/site/MobileActionBar';
import { SiteFooter } from '../components/site/SiteFooter';
import { SiteHeader } from '../components/site/SiteHeader';
import { BackButton } from '../components/ui/BackButton';
import { Button } from '../components/ui/Button';
import { PhotoSlot } from '../components/ui/PhotoSlot';
import { IMAGES } from '../data/images';
import { DOCTOR, HOSPITAL } from '../data/hospital';
import './Doctor.css';

export function Doctor() {
  return (
    <>
      <div className="only-desktop">
        <SiteHeader />
      </div>
      <main className="doctor">
        <div className="doctor__media">
          <PhotoSlot className="doctor__photo" label={`portrait · ${DOCTOR.name} in consultation room`} image={IMAGES.doctor} eager />
          <BackButton className="doctor__back only-mobile" />
          <div className="doctor__fade only-mobile" aria-hidden="true" />
        </div>

        <div className="doctor__content">
          <div className="doctor__availability">
            <span aria-hidden="true" />
            Available for OPD today
          </div>
          <h1 className="doctor__name">{DOCTOR.name}</h1>
          <p className="doctor__creds">
            {DOCTOR.degrees}
            <br />
            {DOCTOR.role} · {HOSPITAL.name}
          </p>

          <dl className="doctor__stats">
            {DOCTOR.stats.map((s) => (
              <div key={s.label}>
                <dt>{s.value}</dt>
                <dd>{s.label}</dd>
              </div>
            ))}
          </dl>

          <h2 className="doctor__h">About</h2>
          <p className="doctor__about">{DOCTOR.about}</p>

          <h2 className="doctor__h">Special interests</h2>
          <ul className="doctor__chips">
            {DOCTOR.interests.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>

          <h2 className="doctor__h">OPD timings</h2>
          <dl className="doctor__timings">
            {DOCTOR.timings.map((t) => (
              <div key={t.days}>
                <dt>{t.days}</dt>
                <dd className={t.accent ? 'is-accent' : ''}>{t.hours}</dd>
              </div>
            ))}
          </dl>

          <div className="doctor__cta only-desktop">
            <Button to="/appointment" size="lg">
              Book with {DOCTOR.shortName}
            </Button>
            <Button to="/assistant" size="lg" variant="outline">
              Ask our assistant
            </Button>
          </div>
        </div>
      </main>
      <div className="only-desktop">
        <SiteFooter />
      </div>

      <MobileActionBar>
        <Button to="/appointment" size="lg" block>
          Book with {DOCTOR.shortName}
        </Button>
      </MobileActionBar>
    </>
  );
}
