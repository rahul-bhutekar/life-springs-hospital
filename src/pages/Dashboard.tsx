import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { LogoMark } from '../components/ui/Logo';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Stars } from '../components/ui/Stars';
import {
  DAILY_SUMMARY,
  ENQUIRIES,
  FEEDBACK,
  FOLLOWUPS,
  KPIS,
  UNANSWERED,
  WHATSAPP_DRAFTS,
  maskPhone,
  type Enquiry,
  type EnquiryStatus,
  type WhatsAppDraft,
} from '../data/dashboard';
import { DOCTOR, HOSPITAL } from '../data/hospital';
import './Dashboard.css';

const TABS: { label: string; filter: EnquiryStatus | null }[] = [
  { label: 'All', filter: null },
  { label: 'New', filter: 'New' },
  { label: 'Follow up', filter: 'Follow up' },
];

const NAV = [
  { label: 'Overview', href: '#overview' },
  { label: 'Enquiries', href: '#enquiries', count: 14 },
  { label: 'Follow-ups', href: '#followups' },
  { label: 'Feedback', href: '#feedback' },
  { label: 'Assistant answers', href: '#unanswered' },
];

const KPI_TONE = { up: 'var(--success-text)', warn: 'var(--clay)', neutral: 'var(--muted)' };
const FOLLOWUP_DOT = { overdue: '#C9603F', soon: '#D9A441', routine: '#2E8A7E' };

function greeting(d: Date) {
  const h = d.getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

function downloadCsv(rows: Enquiry[]) {
  const header = ['Patient', 'Received', 'Phone', 'Enquiry', 'Preferred', 'Source', 'Status'];
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const csv = [header, ...rows.map((e) => [e.name, e.time, e.phone, e.type, e.date, e.source, e.status])]
    .map((r) => r.map(esc).join(','))
    .join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `life-springs-enquiries-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function WhatsAppCard({
  draft,
  mask,
  copied,
  sent,
  onCopy,
  onToggleSent,
  compact,
}: {
  draft: WhatsAppDraft;
  mask: boolean;
  copied: boolean;
  sent: boolean;
  onCopy: () => void;
  onToggleSent: () => void;
  compact?: boolean;
}) {
  return (
    <div className={`wa ${sent ? 'is-sent' : ''} ${compact ? 'wa--compact' : ''}`}>
      <div className="wa__head">
        <div className="wa__to">
          {draft.name} · {maskPhone(draft.phone, mask)}
        </div>
        {!compact && <div className="wa__tag">{draft.tag}</div>}
      </div>
      <p className="wa__text">{draft.text}</p>
      <div className="wa__actions">
        <button type="button" className={`wa__copy ${copied ? 'is-copied' : ''}`} onClick={onCopy}>
          {copied ? 'Copied ✓' : 'Copy message'}
        </button>
        {!compact && (
          <button type="button" className="wa__sent" onClick={onToggleSent} aria-pressed={sent}>
            {sent ? 'Sent ✓' : 'Mark sent'}
          </button>
        )}
      </div>
    </div>
  );
}

export function Dashboard() {
  const now = useMemo(() => new Date(), []);
  const [tab, setTab] = useState(0);
  const [query, setQuery] = useState('');
  const [mask, setMask] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const [sent, setSent] = useState<Record<string, boolean>>({});
  const [showAllDrafts, setShowAllDrafts] = useState(false);

  const enquiries = useMemo(() => {
    const f = TABS[tab].filter;
    const q = query.trim().toLowerCase();
    const qDigits = q.replace(/\D/g, '');
    return ENQUIRIES.filter((e) => !f || e.status === f).filter(
      (e) => !q || e.name.toLowerCase().includes(q) || (qDigits && e.phone.replace(/\D/g, '').includes(qDigits)),
    );
  }, [tab, query]);

  const copy = (d: WhatsAppDraft) => {
    navigator.clipboard?.writeText(d.text).catch(() => {});
    setCopied(d.id);
    window.setTimeout(() => setCopied((c) => (c === d.id ? null : c)), 1600);
  };
  const toggleSent = (id: string) => setSent((s) => ({ ...s, [id]: !s[id] }));

  const dateLong = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const dateShort = now.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  const mobileDrafts = showAllDrafts ? WHATSAPP_DRAFTS : WHATSAPP_DRAFTS.slice(0, 1);

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
          {NAV.map((n, i) => (
            <a key={n.label} href={n.href} className={`dash__nav ${i === 0 ? 'is-active' : ''}`} aria-current={i === 0 ? 'page' : undefined}>
              {n.label}
              {n.count != null && <span className="dash__count">{n.count}</span>}
            </a>
          ))}
        </nav>
        <Link to="/" className="dash__site">
          ← View website
        </Link>
        <div className="dash__session">
          <strong>Signed in · {DOCTOR.shortName}</strong>
          2-step verified · auto sign-out 30 min
        </div>
      </aside>

      <main className="dash__main" id="overview">
        {/* Header */}
        <header className="dash__header">
          <div>
            <div className="dash__date">
              <span className="only-desktop-inline">{dateLong}</span>
              <span className="only-mobile-inline">{HOSPITAL.name}</span>
            </div>
            <h1 className="dash__title">
              <span className="only-desktop-inline">
                {greeting(now)}, {DOCTOR.shortName}
              </span>
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
            <button type="button" className="dash__primary" onClick={() => downloadCsv(enquiries)}>
              Export CSV
            </button>
          </div>
          <div className="dash__mobile-actions only-mobile">
            <Link to="/" className="dash__site-mobile">
              Website
            </Link>
            <div className="dash__avatar" role="img" aria-label={`Signed in as ${DOCTOR.name}`}>
              DS
            </div>
          </div>
        </header>

        {/* KPIs */}
        <section className="kpis" aria-label="Key numbers">
          {KPIS.map((k) => (
            <div key={k.label} className="kpi">
              <div className="kpi__label">{k.label}</div>
              <div className="kpi__row">
                <div className="kpi__value">{k.value}</div>
                <div className="kpi__delta" style={{ color: KPI_TONE[k.tone] }}>
                  {k.delta}
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
                <span className="only-mobile-inline">New enquiries</span>
              </h2>
              <div className="tabs only-desktop" role="tablist" aria-label="Filter enquiries">
                {TABS.map((t, i) => (
                  <button key={t.label} type="button" role="tab" aria-selected={i === tab} className={i === tab ? 'is-on' : ''} onClick={() => setTab(i)}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <table className="enq__table only-desktop">
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
                  <tr key={e.id}>
                    <td>
                      <div className="enq__name">{e.name}</div>
                      <div className="enq__time">{e.time}</div>
                    </td>
                    <td className="enq__phone">{maskPhone(e.phone, mask)}</td>
                    <td>{e.type}</td>
                    <td>{e.date}</td>
                    <td className="enq__src">{e.source}</td>
                    <td>
                      <StatusBadge status={e.status} />
                    </td>
                  </tr>
                ))}
                {enquiries.length === 0 && (
                  <tr>
                    <td colSpan={6} className="enq__empty">
                      No enquiries match.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <ul className="enq__cards only-mobile">
              {ENQUIRIES.slice(0, 4).map((e) => (
                <li key={e.id}>
                  <div>
                    <div className="enq__name">{e.name}</div>
                    <div className="enq__time">
                      {e.type} · {e.date}
                    </div>
                  </div>
                  <StatusBadge status={e.status} size={11.5} />
                </li>
              ))}
            </ul>
          </section>

          {/* AI summary */}
          <section className="summary" aria-labelledby="summary-title">
            <div className="summary__head">
              <h2 id="summary-title" className="summary__eyebrow">
                AI daily summary
              </h2>
              <div className="summary__time only-desktop">Generated {DAILY_SUMMARY.generatedAt}</div>
            </div>
            <p className="summary__text">
              <span className="only-desktop-inline">{DAILY_SUMMARY.long}</span>
              <span className="only-mobile-inline">{DAILY_SUMMARY.short}</span>
            </p>
            <h3 className="summary__sub only-desktop">Ready-to-send WhatsApp follow-ups</h3>

            <div className="summary__drafts only-desktop">
              {WHATSAPP_DRAFTS.map((d) => (
                <WhatsAppCard
                  key={d.id}
                  draft={d}
                  mask={mask}
                  copied={copied === d.id}
                  sent={!!sent[d.id]}
                  onCopy={() => copy(d)}
                  onToggleSent={() => toggleSent(d.id)}
                />
              ))}
            </div>
            <div className="summary__drafts only-mobile">
              {mobileDrafts.map((d) => (
                <WhatsAppCard
                  key={d.id}
                  draft={d}
                  mask={mask}
                  copied={copied === d.id}
                  sent={!!sent[d.id]}
                  onCopy={() => copy(d)}
                  onToggleSent={() => toggleSent(d.id)}
                  compact
                />
              ))}
              <button type="button" className="summary__more" onClick={() => setShowAllDrafts((s) => !s)} aria-expanded={showAllDrafts}>
                {showAllDrafts ? 'Show fewer' : `+${WHATSAPP_DRAFTS.length - 1} more messages`}
              </button>
            </div>
          </section>
        </div>

        {/* Lower row */}
        <div className="dash__lower">
          <section className="panel panel--pad" id="followups">
            <h2 className="panel__title panel__title--sm">Pending follow-ups</h2>
            <ul className="followups">
              {FOLLOWUPS.map((f) => (
                <li key={f.name}>
                  <span className="followups__dot" style={{ background: FOLLOWUP_DOT[f.priority] }} aria-hidden="true" />
                  <div className="followups__body">
                    <div className="followups__name">{f.name}</div>
                    <div className="followups__detail">{f.detail}</div>
                  </div>
                  <button type="button" className="followups__call">
                    Call
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className="panel panel--pad" id="unanswered">
            <h2 className="panel__title panel__title--sm">Unanswered questions</h2>
            <p className="panel__hint">The assistant handed these to your team</p>
            <ul className="unanswered">
              {UNANSWERED.map((u) => (
                <li key={u.q}>
                  <div>“{u.q}”</div>
                  <div className="unanswered__meta">{u.meta}</div>
                </li>
              ))}
            </ul>
          </section>

          <section className="panel panel--pad panel--blush" id="feedback">
            <h2 className="panel__title panel__title--sm">Recent feedback</h2>
            <ul className="feedback">
              {FEEDBACK.map((f) => (
                <li key={f.name}>
                  <div className="feedback__head">
                    <span>{f.name}</span>
                    <Stars rating={f.rating} className="feedback__stars" />
                  </div>
                  <p className="feedback__text">{f.text}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}
