import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { LogoMark } from '../components/ui/Logo';
import { HOSPITAL } from '../data/hospital';
import { ApiError, fetchAdminData, type AdminData } from '../lib/api';
import './AdminSignIn.css';

type Props = { notice?: string | null; onSignedIn: (passcode: string, data: AdminData) => void };

export function AdminSignIn({ notice, onSignedIn }: Props) {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!passcode.trim()) {
      setError('Enter the admin passcode.');
      return;
    }
    setChecking(true);
    setError(null);
    try {
      const data = await fetchAdminData(passcode.trim());
      onSignedIn(passcode.trim(), data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
      setChecking(false);
    }
  }

  return (
    <main className="signin">
      <form className="signin__card" onSubmit={onSubmit} noValidate>
        <div className="signin__brand">
          <LogoMark size={40} />
          <div>
            <div className="signin__name">{HOSPITAL.name}</div>
            <div className="signin__sub">Admin</div>
          </div>
        </div>
        <h1 className="signin__title">Sign in to the admin board</h1>
        <p className="signin__text">Enter the passcode your hospital set up for the enquiries sheet.</p>
        {notice && <p className="signin__notice">{notice}</p>}
        <label className="signin__label" htmlFor="admin-passcode">
          Passcode
        </label>
        <input
          id="admin-passcode"
          className="signin__input"
          type="password"
          autoComplete="current-password"
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
          aria-invalid={!!error}
          aria-describedby={error ? 'admin-passcode-err' : undefined}
          autoFocus
        />
        {error && (
          <p id="admin-passcode-err" className="signin__error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="btn btn--primary btn--md btn--block signin__submit" disabled={checking}>
          {checking ? 'Checking…' : 'Sign in'}
        </button>
        <Link to="/" className="signin__back">
          ← Back to the website
        </Link>
      </form>
    </main>
  );
}
