import { useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { SiteHeader } from '../components/site/SiteHeader';
import { BackButton } from '../components/ui/BackButton';
import { Button } from '../components/ui/Button';
import { APPOINTMENT_TYPES, HOSPITAL, OPD_SLOTS } from '../data/hospital';
import { ApiError, submitAppointmentRequest } from '../lib/api';
import { formatIndianMobile, upcomingOpdDays } from '../lib/dates';
import './Appointment.css';

type Errors = Partial<Record<'name' | 'phone' | 'consent', string>>;

export function Appointment() {
  const days = useMemo(() => upcomingOpdDays(5), []);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [dateIdx, setDateIdx] = useState(0);
  const [slotIdx, setSlotIdx] = useState(1);
  const [typeIdx, setTypeIdx] = useState(0);
  const [consent, setConsent] = useState(true);
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const [reference, setReference] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [trap, setTrap] = useState(''); // spam trap, hidden from people

  const digits = phone.replace(/\D/g, '').slice(0, 10);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const next: Errors = {};
    if (!name.trim()) next.name = 'Please enter your name.';
    if (digits.length !== 10) next.phone = 'Please enter a 10-digit mobile number.';
    if (!consent) next.consent = 'We need your permission to call you back.';
    setErrors(next);
    if (Object.keys(next).length) return;

    setSending(true);
    setSubmitError(null);
    try {
      const receipt = await submitAppointmentRequest({
        name: name.trim(),
        phone: `+91${digits}`,
        date: days[dateIdx].label,
        slot: OPD_SLOTS[slotIdx].id,
        type: APPOINTMENT_TYPES[typeIdx],
        consent,
        website: trap,
      });
      setReference(receipt.reference);
    } catch (err) {
      setSubmitError(
        err instanceof ApiError && (err.code === 'invalid' || err.code === 'rate_limited')
          ? err.message
          : `Sorry, we couldn't send your request. Please try again, or call us on ${HOSPITAL.phoneDisplay}.`,
      );
    } finally {
      setSending(false);
    }
  }

  function reset() {
    setReference(null);
    setName('');
    setPhone('');
    setErrors({});
    setSubmitError(null);
  }

  return (
    <>
      <div className="only-desktop">
        <SiteHeader />
      </div>
      <main className="appt">
        {reference ? (
          <section className="appt__done" aria-live="polite">
            <div className="appt__done-icon" aria-hidden="true">
              <span>✓</span>
            </div>
            <h1 className="appt__done-title">Request received</h1>
            <p className="appt__done-text">
              Thank you, {name.trim().split(' ')[0]}. Our team will call you on{' '}
              <strong>+91 {formatIndianMobile(digits.slice(0, 7) + 'xxx')}</strong> to confirm your{' '}
              {OPD_SLOTS[slotIdx].id} slot on {days[dateIdx].label}.
            </p>
            <div className="appt__receipt">
              <div className="eyebrow">Your request</div>
              {APPOINTMENT_TYPES[typeIdx]}
              <br />
              Reference {reference}
            </div>
            <Button to="/" variant="outline" block className="appt__done-btn">
              Back to home
            </Button>
            <button type="button" className="appt__again" onClick={reset}>
              Make another request
            </button>
          </section>
        ) : (
          <form className="appt__form" onSubmit={onSubmit} noValidate>
            <div className="appt__top">
              <BackButton className="only-mobile" />
              <span>Request an appointment</span>
            </div>
            <h1 className="appt__title">We'll call you to confirm a time.</h1>
            <p className="appt__sub">Takes under a minute. No payment needed.</p>

            <label className="appt__label" htmlFor="appt-name">
              Your full name
            </label>
            <input
              id="appt-name"
              className={`appt__input ${errors.name ? 'has-error' : ''}`}
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'appt-name-err' : undefined}
              placeholder="e.g. Priya Deshmukh"
            />
            {errors.name && (
              <p id="appt-name-err" className="appt__error">
                {errors.name}
              </p>
            )}

            <label className="appt__label" htmlFor="appt-phone">
              Mobile number
            </label>
            <div className={`appt__input appt__phone ${errors.phone ? 'has-error' : ''}`}>
              <span aria-hidden="true">+91</span>
              <input
                id="appt-phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                value={formatIndianMobile(digits)}
                onChange={(e) => setPhone(e.target.value)}
                aria-invalid={!!errors.phone}
                aria-describedby={errors.phone ? 'appt-phone-err' : undefined}
                placeholder="98220 41736"
              />
            </div>
            {errors.phone && (
              <p id="appt-phone-err" className="appt__error">
                {errors.phone}
              </p>
            )}

            <fieldset className="appt__fieldset">
              <legend className="appt__label">Preferred date</legend>
              <div className="appt__dates">
                {days.map((d, i) => (
                  <label key={d.iso} className={`appt__date ${i === dateIdx ? 'is-on' : ''}`}>
                    <input
                      type="radio"
                      name="date"
                      className="sr-only"
                      checked={i === dateIdx}
                      onChange={() => setDateIdx(i)}
                    />
                    <span className="appt__date-w">{d.weekday}</span>
                    <span className="appt__date-n">{d.day}</span>
                    <span className="appt__date-m">{d.month}</span>
                  </label>
                ))}
              </div>
              <div className="appt__slots">
                {OPD_SLOTS.map((s, i) => (
                  <label key={s.id} className={`appt__slot ${i === slotIdx ? 'is-on' : ''}`}>
                    <input
                      type="radio"
                      name="slot"
                      className="sr-only"
                      checked={i === slotIdx}
                      onChange={() => setSlotIdx(i)}
                    />
                    {s.label}
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="appt__fieldset">
              <legend className="appt__label">What is this about?</legend>
              <div className="appt__types">
                {APPOINTMENT_TYPES.map((t, i) => (
                  <label key={t} className={`appt__type ${i === typeIdx ? 'is-on' : ''}`}>
                    <input
                      type="radio"
                      name="type"
                      className="sr-only"
                      checked={i === typeIdx}
                      onChange={() => setTypeIdx(i)}
                    />
                    <span className="appt__radio" aria-hidden="true">
                      <span />
                    </span>
                    {t}
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="appt__consent">
              <input
                type="checkbox"
                className="sr-only"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
              />
              <span className={`appt__check ${consent ? 'is-on' : ''}`} aria-hidden="true">
                {consent ? '✓' : ''}
              </span>
              <span>
                I agree to be contacted by {HOSPITAL.name} on call or WhatsApp about this enquiry. See our{' '}
                {/* New tab keeps the half-filled form; the in-memory preview build can't open routes in a new tab. */}
                <Link to="/privacy" target={import.meta.env.VITE_ROUTER === 'memory' ? undefined : '_blank'}>
                  Privacy notice
                </Link>
                .
              </span>
            </label>
            {errors.consent && <p className="appt__error">{errors.consent}</p>}

            {/* Spam trap: hidden from people and screen readers; bots that fill every field get caught. */}
            <div className="appt__trap" aria-hidden="true">
              <label htmlFor="appt-website">Website</label>
              <input id="appt-website" tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} />
            </div>

            {submitError && (
              <p className="appt__submit-error" role="alert">
                {submitError}
              </p>
            )}

            <div className="appt__submit">
              <Button type="submit" size="lg" block disabled={sending}>
                {sending ? 'Sending…' : 'Send request'}
              </Button>
            </div>
          </form>
        )}
      </main>
    </>
  );
}
