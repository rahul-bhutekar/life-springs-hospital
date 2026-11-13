import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { LogoMark } from '../components/ui/Logo';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Stars } from '../components/ui/Stars';
import {
  SAMPLE_FEEDBACK,
  STATUSES,
  buildKpis,
  buildSummary,
  firstName,
  formatPhone,
  formatPreferred,
  formatReceived,
  maskPhone,
  needsMessage,
  whatsappDraft,
  whatsappLink,
} from '../data/dashboard';
import { HOSPITAL } from '../data/hospital';
import { useAdminSession } from '../lib/adminSession';
import {
  ApiError,
  fetchAdminData,
  isBackendConnected,
  updateEnquiryStatus,
  type AdminData,
  type EnquiryStatus,
  type StoredEnquiry,
} from '../lib/api';
import { AdminSignIn } from './AdminSignIn';
import './Dashboard.css';

const TABS: { label: string; filter: EnquiryStatus | null }[] = [
  { label: 'All', filter: null },
  { label: 'New', filter: 'New' },
  { label: 'Follow up', filter: 'Follow up' },
];

const KPI_TONE = { up: 'var(--success-text)', warn: 'var(--clay)', neutral: 'var(--muted)' };

function greeting(d: Date) {
  const h = d.getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

function downloadCsv(rows: StoredEnquiry[]) {
  const header = ['Reference', 'Received', 'Patient', 'Phone', 'Enquiry', 'Preferred date', 'Slot', 'Source', 'Status'];
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const csv = [header, ...rows.map((e) => [e.reference, e.received, e.name, e.phone, e.type, e.date, e.slot, e.source, e.status])]
    .map((r) => r.map(esc).join(','))
    .join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `life-springs-enquiries-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Signs in first when connected to the Google Sheet; demo mode opens straight away with sample data. */
export function Dashboard() {
  const session = useAdminSession();
  const [initial, setInitial] = useState<AdminData | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  if (isBackendConnected && !session.passcode) {
    return (
      <AdminSignIn
        notice={notice}
        onSignedIn={(passcode, data) => {
          setInitial(data);
          setNotice(null);
          session.signIn(passcode);
        }}
      />
    );
  }
  return (
    <DashboardBoard
      passcode={session.passcode ?? ''}
      initial={initial}
      onSignOut={(why) => {
        setInitial(null);
        setNotice(why ?? null);
        session.signOut();
      }}
    />
  );
}

function DashboardBoard({
  passcode,
  initial,
  onSignOut,
}: {
  passcode: string;
  initial: AdminData | null;
  onSignOut: (why?: string) => void;
}) {
  const [data, setData] = useState<AdminData | null>(initial);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!initial);
  const [actionError, setActionError] = useState<string | null>(null);
  const [now, setNow] = useState(() => new Date());
  const [tab, setTab] = useState(0);
  const [query, setQuery] = useState('');
  const [mask, setMask] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const [showAllDrafts, setShowAllDrafts] = useState(false);

  const handleAuthError = useCallback(
    (err: unknown) => {
      if (err instanceof ApiError && (err.code === 'unauthorized' || err.code === 'locked')) {
        onSignOut(err.code === 'locked' ? err.message : 'Your passcode has changed. Please sign in again.');
        return true;
      }
      return false;
    },
    [onSignOut],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      setData(await fetchAdminData(passcode));
      setNow(new Date());
    } catch (err) {
      if (!handleAuthError(err)) setLoadError(err instanceof ApiError ? err.message : 'Could not load enquiries.');
    } finally {
      setLoading(false);
    }
  }, [passcode, handleAuthError]);

  useEffect(() => {
    if (!initial) void load();
  }, [initial, load]);

  const all = useMemo(() => data?.enquiries ?? [], [data]);
  const questions = useMemo(() => data?.questions ?? [], [data]);
  const kpis = useMemo(() => buildKpis(all, questions, now), [all, questions, now]);
  const summary = useMemo(() => buildSummary(all, questions, now), [all, questions, now]);
  const drafts = useMemo(() => needsMessage(all).slice(0, 3), [all]);
  const followUps = useMemo(() => all.filter((e) => e.status === 'Follow up'), [all]);
  const newCount = kpis[0].value;

  const enquiries = useMemo(() => {
    const f = TABS[tab].filter;
    const q = query.trim().toLowerCase();
    const qDigits = q.replace(/\D/g, '');
    return all
      .filter((e) => !f || e.status === f)
      .filter((e) => !q || e.name.toLowerCase().includes(q) || (qDigits !== '' && e.phone.replace(/\D/g, '').includes(qDigits)));
  }, [all, tab, query]);

  async function changeStatus(e: StoredEnquiry, status: EnquiryStatus) {
    const before = e.status;
    const set = (s: EnquiryStatus) =>
      setData((d) => d && { ...d, enquiries: d.enquiries.map((x) => (x.reference === e.reference ? { ...x, status: s } : x)) });
    set(status);
    setActionError(null);
    try {
      await updateEnquiryStatus(passcode, e.reference, status);
    } catch (err) {
      set(before);
      if (!handleAuthError(err)) {
        setActionError(`Couldn't change ${firstName(e.name)}'s status. ${err instanceof ApiError ? err.message : 'Please try again.'}`);
      }
    }
  }

  const copy = (e: StoredEnquiry) => {
    navigator.clipboard?.writeText(whatsappDraft(e)).catch(() => {});
    setCopied(e.reference);
    window.setTimeout(() => setCopied((c) => (c === e.reference ? null : c)), 1600);
  };

  const dateLong = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const dateShort = now.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  const mobileDrafts = showAllDrafts ? drafts : drafts.slice(0, 1);
  const updatedAt = now.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase();

  const nav = [
    { label: 'Overview', href: '#overview' },
    { label: 'Enquiries', href: '#enquiries', count: newCount },
    { label: 'Follow-ups', href: '#followups' },
    { label: 'Feedback', href: '#feedback' },
    { label: 'Assistant questions', href: '#unanswered' },
  ];

  const draftCard = (e: StoredEnquiry, compact = false) => (
    <div key={e.reference} className={`wa ${compact ? 'wa--compact' : ''}`}>
      <div className="wa__head">
        <div className="wa__to">
          {e.name} · {maskPhone(e.phone, mask)}
        </div>
        {!compact && <div className="wa__tag">{e.status === 'Follow up' ? 'Follow-up' : e.type}</div>}
      </div>
      <p className="wa__text">{whatsappDraft(e)}</p>
      <div className="wa__actions">
        <button type="button" className={`wa__copy ${copied === e.reference ? 'is-copied' : ''}`} onClick={() => copy(e)}>
          {copied === e.reference ? 'Copied ✓' : 'Copy message'}
        </button>
        <a className="wa__sent" href={whatsappLink(e)} target="_blank" rel="noreferrer">
          Open WhatsApp
        </a>
        {!compact && (
          <button type="button" className="wa__sent" onClick={() => changeStatus(e, 'Called')}>
            Mark called
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="dash">
      <aside className="dash__side only-desktop">
        <div className="dash__brand">
          <LogoMark size={34} tone="inverse" />
          <div>
            <div className="dash__brand-name">{HOSPITAL.name}</div>
            <div className="dash__brand-sub">Admin</div>
          </div>
        </div>
        <nav aria-label="Dashboard">
          {nav.map((n, i) => (
            <a key={n.label} href={n.href} className={`dash__nav ${i === 0 ? 'is-active' : ''}`} aria-current={i === 0 ? 'page' : undefined}>
              {n.label}
              {n.count ? <span className="dash__count">{n.count}</span> : null}
            </a>
          ))}
        </nav>
        <Link to="/" className="dash__site">
          ← View website
        </Link>
        <div className="dash__session">
          {isBackendConnected ? (
            <>
              <strong>Signed in</strong>
              Signs out after 30 min without activity.
              <button type="button" className="dash__signout" onClick={() => onSignOut()}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <strong>Demo data</strong>
              Not connected to the Google Sheet yet, so these are sample enquiries.
            </>
          )}
        </div>
      </aside>

      <main className="dash__main" id="overview">
        {!isBackendConnected && (
          <p className="dash__demo only-mobile">Demo data · not connected to the Google Sheet yet</p>
        )}

        <header className="dash__header">
          <div>
            <div className="dash__date">
              <span className="only-desktop-inline">{dateLong}</span>
              <span className="only-mobile-inline">{HOSPITAL.name}</span>
            </div>
            <h1 className="dash__title">
              <span className="only-desktop-inline">{greeting(now)}</span>
              <span className="only-mobile-inline">Today, {dateShort}</span>
            </h1>
          </div>
          <div className="dash__tools only-desktop">
            <label className="sr-only" htmlFor="dash-search">
              Search name or phone
            </label>
            <input
              id="dash-search"
              className="dash__search"
              type="search"
              placeholder="Search name or phone"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="button" className="dash__ghost" onClick={() => setMask((m) => !m)} aria-pressed={!mask}>
              {mask ? 'Show numbers' : 'Hide numbers'}
            </button>
            <button type="button" className="dash__ghost" onClick={() => void load()} disabled={loading}>
              {loading ? 'Loading…' : 'Refresh'}
            </button>
            <button type="button" className="dash__primary" onClick={() => downloadCsv(enquiries)} disabled={!enquiries.length}>
              Export CSV
            </button>
          </div>
          <div className="dash__mobile-actions only-mobile">
            <Link to="/" className="dash__site-mobile">
              Website
            </Link>
            {isBackendConnected ? (
              <button type="button" className="dash__site-mobile" onClick={() => onSignOut()}>
                Sign out
              </button>
            ) : null}
          </div>
        </header>

        {loadError && (
          <div className="dash__alert" role="alert">
            {loadError}{' '}
            <button type="button" onClick={() => void load()}>
              Try again
            </button>
          </div>
        )}
        {actionError && (
          <div className="dash__alert" role="alert">
            {actionError}
          </div>
        )}

        {!data && loading ? (
          <p className="dash__loading" aria-live="polite">
            Loading enquiries…
          </p>
        ) : (
          <>
            {/* KPIs */}
            <section className="kpis" aria-label="Key numbers">
              {kpis.map((k) => (
                <div key={k.label} className="kpi">
                  <div className="kpi__label">{k.label}</div>
                  <div className="kpi__row">
                    <div className="kpi__value">{k.value}</div>
                    <div className="kpi__delta" style={{ color: KPI_TONE[k.tone] }}>
                      {k.note}
                    </div>
                  </div>
                </div>
              ))}
            </section>

            <div className="dash__grid">
              {/* Enquiries */}
              <section className="panel enq" id="enquiries" aria-labelledby="enq-title">
                <div className="enq__head">
                  <h2 id="enq-title" className="panel__title">
                    <span className="only-desktop-inline">Appointment enquiries</span>
                    <span className="only-mobile-inline">Latest enquiries</span>
                  </h2>
                  <div className="tabs only-desktop" role="tablist" aria-label="Filter enquiries">
                    {TABS.map((t, i) => (
                      <button key={t.label} type="button" role="tab" aria-selected={i === tab} className={i === tab ? 'is-on' : ''} onClick={() => setTab(i)}>
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="enq__scroll only-desktop">
                  <table className="enq__table">
                    <thead>
                      <tr>
                        <th scope="col">Patient</th>
                        <th scope="col">Phone</th>
                        <th scope="col">Enquiry</th>
                        <th scope="col">Preferred</th>
                        <th scope="col">Source</th>
                        <th scope="col">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {enquiries.map((e) => (
                        <tr key={e.reference}>
                          <td>
                            <div className="enq__name">{e.name}</div>
                            <div className="enq__time">{formatReceived(e.received, now)}</div>
                          </td>
                          <td className="enq__phone">{maskPhone(e.phone, mask)}</td>
                          <td>{e.type}</td>
                          <td>{formatPreferred(e)}</td>
                          <td className="enq__src">{e.source}</td>
                          <td>
                            <label className="sr-only" htmlFor={`status-${e.reference}`}>
                              Status for {e.name}
                            </label>
                            <select
                              id={`status-${e.reference}`}
                              className={`enq__status enq__status--${e.status.replace(' ', '-').toLowerCase()}`}
                              value={e.status}
                              onChange={(ev) => void changeStatus(e, ev.target.value as EnquiryStatus)}
                            >
                              {STATUSES.map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                      {enquiries.length === 0 && (
                        <tr>
                          <td colSpan={6} className="enq__empty">
                            {all.length ? 'No enquiries match.' : 'No enquiries yet. Requests from the website will appear here.'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <ul className="enq__cards only-mobile">
                  {all.slice(0, 6).map((e) => (
                    <li key={e.reference}>
                      <div>
                        <div className="enq__name">{e.name}</div>
                        <div className="enq__time">
                          {e.type} · {formatReceived(e.received, now)}
                        </div>
                      </div>
                      <StatusBadge status={e.status} size={11.5} />
                    </li>
                  ))}
                  {all.length === 0 && <li className="enq__empty">No enquiries yet.</li>}
                </ul>
              </section>

              {/* Summary */}
              <section className="summary" aria-labelledby="summary-title">
                <div className="summary__head">
                  <h2 id="summary-title" className="summary__eyebrow">
                    Today's summary
                  </h2>
                  <div className="summary__time only-desktop">Updated {updatedAt}</div>
                </div>
                <p className="summary__text">{summary}</p>
                {drafts.length > 0 && (
                  <>
                    <h3 className="summary__sub only-desktop">Ready-to-send WhatsApp messages</h3>
                    <div className="summary__drafts only-desktop">{drafts.map((e) => draftCard(e))}</div>
                    <div className="summary__drafts only-mobile">
                      {mobileDrafts.map((e) => draftCard(e, true))}
                      {drafts.length > 1 && (
                        <button type="button" className="summary__more" onClick={() => setShowAllDrafts((s) => !s)} aria-expanded={showAllDrafts}>
                          {showAllDrafts ? 'Show fewer' : `+${drafts.length - 1} more messages`}
                        </button>
                      )}
                    </div>
                  </>
                )}
              </section>
            </div>

            {/* Lower row */}
            <div className="dash__lower">
              <section className="panel panel--pad" id="followups">
                <h2 className="panel__title panel__title--sm">Pending follow-ups</h2>
                {followUps.length ? (
                  <ul className="followups">
                    {followUps.map((f) => (
                      <li key={f.reference}>
                        <span className="followups__dot" aria-hidden="true" />
                        <div className="followups__body">
                          <div className="followups__name">{f.name}</div>
                          <div className="followups__detail">
                            {f.type} · {formatReceived(f.received, now)}
                          </div>
                        </div>
                        <a className="followups__call" href={`tel:${f.phone.replace(/[^\d+]/g, '')}`} aria-label={`Call ${f.name} on ${formatPhone(f.phone)}`}>
                          Call
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="panel__empty">No follow-ups. Set an enquiry's status to "Follow up" to list it here.</p>
                )}
              </section>

              <section className="panel panel--pad" id="unanswered">
                <h2 className="panel__title panel__title--sm">Unanswered questions</h2>
                <p className="panel__hint">Questions the assistant had no approved answer for</p>
                {questions.length ? (
                  <ul className="unanswered">
                    {questions.slice(0, 5).map((u) => (
                      <li key={u.received + u.question}>
                        <div>“{u.question}”</div>
                        <div className="unanswered__meta">
                          {u.source} · {formatReceived(u.received, now)}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="panel__empty">None yet.</p>
                )}
              </section>

              <section className="panel panel--pad panel--blush" id="feedback">
                <h2 className="panel__title panel__title--sm">Recent feedback</h2>
                {isBackendConnected ? (
                  <p className="panel__empty">The website doesn't collect patient feedback yet.</p>
                ) : (
                  <ul className="feedback">
                    {SAMPLE_FEEDBACK.map((f) => (
                      <li key={f.name}>
                        <div className="feedback__head">
                          <span>{f.name}</span>
                          <Stars rating={f.rating} className="feedback__stars" />
                        </div>
                        <p className="feedback__text">{f.text}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
