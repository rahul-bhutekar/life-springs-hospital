import { Link } from 'react-router-dom';
import { MobileActionBar } from '../components/site/MobileActionBar';
import { SiteFooter } from '../components/site/SiteFooter';
import { SiteHeader } from '../components/site/SiteHeader';
import { Button } from '../components/ui/Button';
import { Eyebrow } from '../components/ui/Eyebrow';
import { PhotoSlot } from '../components/ui/PhotoSlot';
import { DOCTOR, FACILITIES, FEATURED_STORY, HOSPITAL, SERVICES, TESTIMONIALS } from '../data/hospital';
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
            <PhotoSlot className="hero__photo" label="photo · mother & newborn skin-to-skin, natural light">
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
            <Link to="/#services" className="section__link">
              <span className="only-mobile-inline">All services</span>
              <span className="only-desktop-inline">View all services →</span>
            </Link>
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
                <span className="service__chev only-mobile" aria-hidden="true">
                  ›
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Doctor */}
        <section className="container">
          <div className="doc-feature">
            <PhotoSlot tone="teal" className="doc-feature__photo" label={`portrait · ${DOCTOR.name}, warm smile`} />
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
                <PhotoSlot className="facility__photo" label={f.photo} />
                <h3 className="facility__title">{f.title}</h3>
                <p className="facility__desc">{f.desc}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Stories */}
        <section id="stories" className="section container">
          <figure className="story-feature only-mobile">
            <div className="story-feature__mark" aria-hidden="true">
              “
            </div>
            <blockquote className="story-feature__quote">{FEATURED_STORY.quote}</blockquote>
            <figcaption className="story-feature__by">
              <PhotoSlot tone="blush" className="story-feature__avatar" label="" />
              <span>
                <strong>{FEATURED_STORY.name}</strong>
                <span>{FEATURED_STORY.detail}</span>
              </span>
            </figcaption>
          </figure>

          <div className="only-desktop">
            <h2 className="section__title">Families who trusted us</h2>
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
          </div>
        </section>

        {/* Visit */}
        <section id="contact" className="section container visit">
          <div className="visit__info">
            <h2 className="section__title">
              <span className="only-mobile-inline">Visit us</span>
              <span className="only-desktop-inline">Visit Life Springs</span>
            </h2>
            <PhotoSlot tone="mint" className="visit__map only-mobile" label="map embed · Keshav Nagar, Mundhwa, Pune" />
            <address className="visit__address">
              {HOSPITAL.addressLines.map((line) => (
                <span key={line}>
                  {line}
                  <br />
                </span>
              ))}
              {HOSPITAL.opdHours}
              <br />
              {HOSPITAL.emergencyHours}
              <br />
              Phone: <a href={HOSPITAL.phoneHref}>{HOSPITAL.phoneDisplay}</a>
              <span className="only-desktop-inline">
                {' '}
                · <a href={`mailto:${HOSPITAL.email}`}>{HOSPITAL.email}</a>
              </span>
            </address>
            <div className="visit__ctas only-mobile">
              <Button href={HOSPITAL.phoneHref} variant="outline" block>
                Call hospital
              </Button>
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
          <PhotoSlot tone="mint" className="visit__map visit__map--lg only-desktop" label="map embed · Mundhwa - Manjari Rd, Pune 411036" />
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
