import { Link } from 'react-router-dom';
import { MobileActionBar } from '../components/site/MobileActionBar';
import { SiteFooter } from '../components/site/SiteFooter';
import { SiteHeader } from '../components/site/SiteHeader';
import { Button } from '../components/ui/Button';
import { CallLink } from '../components/ui/CallLink';
import { Eyebrow } from '../components/ui/Eyebrow';
import { MapEmbed } from '../components/ui/MapEmbed';
import { PhotoSlot } from '../components/ui/PhotoSlot';
import { IMAGES } from '../data/images';
import { DOCTOR, FACILITIES, HOSPITAL, SERVICES, TESTIMONIALS } from '../data/hospital';
import './Home.css';

export function Home() {
  return (
    <>
      <SiteHeader />
      <main className="home">
        {/* Hero */}
        <section className="hero container">
          <div className="hero__copy">
            <Eyebrow>
              Maternity &amp; pregnancy care<span className="only-desktop-inline"> · Pune</span>
            </Eyebrow>
            <h1 className="hero__title">
              Gentle, expert care for every step of <em>motherhood</em>.
            </h1>
            <p className="hero__lede">
              From your first scan to your baby's first weeks home — one calm, experienced team{' '}
              <span className="only-mobile-inline">in Pune.</span>
              <span className="only-desktop-inline">led by {DOCTOR.name}.</span>
            </p>
            <div className="hero__ctas">
              <Button to="/appointment" size="lg">
                Request an appointment
              </Button>
              <Button to="/assistant" size="lg" variant="outline">
                Ask our assistant
              </Button>
            </div>
            <dl className="hero__stats only-desktop">
              <div>
                <dt>24 × 7</dt>
                <dd>Labour ward</dd>
              </div>
              <div>
                <dt>Level II</dt>
                <dd>NICU on-site</dd>
              </div>
              <div>
                <dt>मराठी · हिंदी · Eng</dt>
                <dd>Care in your language</dd>
              </div>
            </dl>
          </div>

          <div className="hero__media">
            <PhotoSlot className="hero__photo" label="photo · mother & newborn skin-to-skin, natural light" image={IMAGES.hero} eager>
              <div className="hero__badge only-mobile">
                <div className="hero__badge-value">24 × 7</div>
                <div className="hero__badge-label">Labour ward &amp; NICU</div>
              </div>
            </PhotoSlot>
            <div className="hero__opd only-desktop">
              <Eyebrow>Next OPD</Eyebrow>
              <div className="hero__opd-time">Today, 5 – 8 pm</div>
              <div className="hero__opd-doc">{DOCTOR.name}</div>
            </div>
          </div>
        </section>

        {/* Services */}
        <section id="services" className="section container">
          <div className="section__head">
            <h2 className="section__title">
              <span className="only-mobile-inline">Our care</span>
              <span className="only-desktop-inline">Care for every stage</span>
            </h2>
          </div>
          <ul className="services">
            {SERVICES.map((s) => (
              <li key={s.n} className="service">
                <span className="service__num" aria-hidden="true">
                  {s.n}
                </span>
                <div className="service__body">
                  <h3 className="service__title">{s.title}</h3>
                  <p className="service__desc">{s.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Doctor */}
        <section className="container">
          <div className="doc-feature">
            <PhotoSlot tone="teal" className="doc-feature__photo" label={`portrait · ${DOCTOR.name}, warm smile`} image={IMAGES.doctor} />
            <div className="doc-feature__body">
              <Eyebrow tone="blush">
                <span className="only-mobile-inline">Lead consultant</span>
                <span className="only-desktop-inline">Meet your doctor</span>
              </Eyebrow>
              <h2 className="doc-feature__name">{DOCTOR.name}</h2>
              <p className="doc-feature__meta">
                <span className="only-mobile-inline">{DOCTOR.speciality}</span>
                <span className="only-desktop-inline">
                  {DOCTOR.degreesShort} · {DOCTOR.role}
                </span>
              </p>
              <blockquote className="doc-feature__quote only-desktop">“{DOCTOR.quote}”</blockquote>
              <div className="doc-feature__ctas">
                <Button to="/doctor" variant="light" block className="only-mobile">
                  Meet {DOCTOR.shortName}
                </Button>
                <Button to="/appointment" variant="light" className="only-desktop">
                  Book with {DOCTOR.shortName}
                </Button>
                <Button to="/doctor" variant="outline-light" className="only-desktop">
                  Full profile
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Facilities */}
        <section id="facilities" className="section">
          <h2 className="section__title container">Facilities</h2>
          <ul className="facilities">
            {FACILITIES.map((f) => (
              <li key={f.title} className="facility">
                <PhotoSlot className="facility__photo" label={f.photo} image={f.image} />
                <h3 className="facility__title">{f.title}</h3>
                <p className="facility__desc">{f.desc}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Stories */}
        <section id="stories" className="section" aria-labelledby="stories-title">
          <h2 id="stories-title" className="section__title container">
            Families who trusted us
          </h2>
          <ul className="stories">
            {TESTIMONIALS.map((t) => (
              <li key={t.name} className={`story story--${t.tone}`}>
                <div className="story__stars" role="img" aria-label="5 out of 5 stars">
                  ★★★★★
                </div>
                <blockquote className="story__quote">{t.quote}</blockquote>
                <div className="story__name">{t.name}</div>
                <div className="story__detail">{t.detail}</div>
              </li>
            ))}
          </ul>
        </section>

        {/* Visit */}
        <section id="contact" className="section container visit">
          <div className="visit__info">
            <h2 className="section__title">
              <span className="only-mobile-inline">Visit us</span>
              <span className="only-desktop-inline">Visit Life Springs Maternity Hospital</span>
            </h2>
            <MapEmbed className="visit__map only-mobile" />
            <dl className="visit__details">
              <div className="visit__item visit__item--wide">
                <dt>Address</dt>
                <dd>
                  <address>
                    {HOSPITAL.addressLines.map((line) => (
                      <span key={line} className="visit__line">
                        {line}
                      </span>
                    ))}
                  </address>
                </dd>
              </div>
              <div className="visit__item">
                <dt>OPD hours</dt>
                <dd>
                  <span className="visit__line">{HOSPITAL.opdDays}</span>
                  <span className="visit__line">
                    {/* Keep each time range whole, e.g. never "5pm–" / "8pm" */}
                    {HOSPITAL.opdTimes.split(' · ').map((range, i) => (
                      <span key={range}>
                        {i > 0 && ' · '}
                        <span className="visit__nowrap">{range}</span>
                      </span>
                    ))}
                  </span>
                </dd>
              </div>
              <div className="visit__item">
                <dt>Emergency &amp; labour ward</dt>
                <dd>{HOSPITAL.emergencyHours}</dd>
              </div>
              <div className="visit__item visit__item--phone">
                <dt>Phone</dt>
                <dd>
                  <CallLink className="visit__phone">{HOSPITAL.phoneDisplay}</CallLink>
                </dd>
              </div>
              <div className="visit__item only-desktop">
                <dt>Email</dt>
                <dd>
                  <a href={`mailto:${HOSPITAL.email}`}>{HOSPITAL.email}</a>
                </dd>
              </div>
            </dl>
            <div className="visit__ctas only-mobile">
              <CallLink className="btn btn--outline btn--md btn--block">Call hospital</CallLink>
              <Button href={HOSPITAL.directionsHref} external variant="outline" block>
                Directions
              </Button>
            </div>
            <div className="visit__ctas only-desktop">
              <Button href={HOSPITAL.directionsHref} external>
                Get directions
              </Button>
              <Button href={HOSPITAL.whatsappHref} external variant="outline">
                WhatsApp us
              </Button>
            </div>
          </div>
          <MapEmbed className="visit__map visit__map--lg only-desktop" />
        </section>
      </main>
      <SiteFooter />

      <MobileActionBar>
        <Button to="/appointment" size="lg">
          Book appointment
        </Button>
        <Link to="/assistant" className="mobile-action-bar__ask" aria-label="Ask our assistant">
          Ask
        </Link>
      </MobileActionBar>
    </>
  );
}
