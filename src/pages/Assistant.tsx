import { useEffect, useRef, useState, type FormEvent } from 'react';
import { BackButton } from '../components/ui/BackButton';
import { LogoMark } from '../components/ui/Logo';
import { HOSPITAL } from '../data/hospital';
import { PLACEHOLDERS, QUICK_REPLIES, initialChat, respond, type ChatState } from '../data/assistant';
import './Assistant.css';

export function Assistant() {
  const [chat, setChat] = useState<ChatState>(initialChat);
  const [input, setInput] = useState('');
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [chat.messages.length]);

  const send = (text: string) => {
    if (!text.trim()) return;
    setChat((c) => respond(c, text));
    setInput('');
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    send(input);
  };

  const quick = QUICK_REPLIES[chat.step];

  return (
    <main className="assistant">
      <div className="assistant__panel">
        <header className="assistant__head">
          <BackButton tone="inverse" label="Back to the website" />
          <span className="assistant__logo">
            <LogoMark size={40} tone="inverse" />
          </span>
          <div className="assistant__title">
            <h1>{HOSPITAL.name}</h1>
            <p>
              <span aria-hidden="true" />
              <span>
                Assistant<span className="only-desktop-inline"> · hospital-approved answers</span>
              </span>
            </p>
          </div>
          <button
            type="button"
            className="assistant__restart"
            onClick={() => {
              setChat(initialChat());
              setInput('');
            }}
          >
            Restart
          </button>
        </header>

        <div ref={logRef} className="assistant__log" role="log" aria-live="polite" aria-label="Conversation">
          {chat.messages.map((m) => {
            if (m.role === 'summary') {
              return (
                <div key={m.id} className="msg msg--summary">
                  <div className="msg__summary-title">Enquiry sent to hospital team</div>
                  <dl>
                    <dt>Name</dt>
                    <dd>{m.lead.name}</dd>
                    <dt>Phone</dt>
                    <dd>{m.lead.phone}</dd>
                    <dt>Date</dt>
                    <dd>{m.lead.date}</dd>
                    <dt>Type</dt>
                    <dd>{m.lead.type}</dd>
                  </dl>
                </div>
              );
            }
            return (
              <div key={m.id} className={`msg msg--${m.role}`}>
                {m.role === 'user' && <span className="sr-only">You: </span>}
                {m.text}
              </div>
            );
          })}
        </div>

        <div className="assistant__composer">
          {quick.length > 0 && (
            <div className="assistant__quick" aria-label="Suggested replies">
              {quick.map((q) => (
                <button key={q} type="button" onClick={() => send(q)}>
                  {q}
                </button>
              ))}
            </div>
          )}
          <form className="assistant__form" onSubmit={onSubmit}>
            <label htmlFor="assistant-input" className="sr-only">
              Your message
            </label>
            <input
              id="assistant-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={PLACEHOLDERS[chat.step]}
              inputMode={chat.step === 'phone' ? 'tel' : 'text'}
              autoComplete="off"
            />
            <button type="submit" aria-label="Send message">
              →
            </button>
          </form>
          <p className="assistant__disclaimer">
            Not medical advice. In an emergency, call the labour ward 24 × 7
            <span className="only-desktop-inline"> on {HOSPITAL.phoneDisplay}</span>.
          </p>
        </div>
      </div>
    </main>
  );
}
