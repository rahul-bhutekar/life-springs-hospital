import { useCallback, useEffect, useState } from 'react';

/**
 * Keeps the admin passcode for this browser tab only (sessionStorage), and
 * signs out after 30 minutes without activity.
 */
const KEY = 'ls-admin-session';
export const IDLE_LIMIT_MS = 30 * 60 * 1000;

type Session = { passcode: string; lastActive: number };

function read(): Session | null {
  try {
    const s = JSON.parse(sessionStorage.getItem(KEY) ?? 'null') as Session | null;
    return s && Date.now() - s.lastActive < IDLE_LIMIT_MS ? s : null;
  } catch {
    return null;
  }
}

function write(s: Session | null) {
  try {
    if (s) sessionStorage.setItem(KEY, JSON.stringify(s));
    else sessionStorage.removeItem(KEY);
  } catch {
    // Storage blocked (private mode, sandbox): the session lasts until the page reloads.
  }
}

export function useAdminSession() {
  const [session, setSession] = useState<Session | null>(read);

  const signIn = useCallback((passcode: string) => {
    const s = { passcode, lastActive: Date.now() };
    write(s);
    setSession(s);
  }, []);

  const signOut = useCallback(() => {
    write(null);
    setSession(null);
  }, []);

  useEffect(() => {
    if (!session) return;
    let last = session.lastActive;
    const touch = () => {
      // Record activity at most every 30 seconds.
      if (Date.now() - last > 30_000) {
        last = Date.now();
        write({ passcode: session.passcode, lastActive: last });
      }
    };
    const check = window.setInterval(() => {
      if (Date.now() - last >= IDLE_LIMIT_MS) signOut();
    }, 60_000);
    const events = ['pointerdown', 'keydown', 'scroll'] as const;
    events.forEach((e) => window.addEventListener(e, touch, { passive: true }));
    return () => {
      window.clearInterval(check);
      events.forEach((e) => window.removeEventListener(e, touch));
    };
  }, [session, signOut]);

  return { passcode: session?.passcode ?? null, signIn, signOut };
}
