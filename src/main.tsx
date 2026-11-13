import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import './styles/tokens.css';
import './styles/global.css';
import { App } from './App';

/**
 * VITE_ROUTER=memory builds a copy that keeps routes in memory, for hosts that
 * don't allow path-based URLs (e.g. an embedded preview). A plain `#doctor`,
 * `#appointment`, `#assistant`, `#admin`, `#privacy` or `#terms` in the URL opens that page.
 */
const ROUTES: Record<string, string> = {
  doctor: '/doctor',
  appointment: '/appointment',
  assistant: '/assistant',
  admin: '/admin',
  privacy: '/privacy',
  terms: '/terms',
};

function Router({ children }: { children: React.ReactNode }) {
  if (import.meta.env.VITE_ROUTER === 'memory') {
    const start = ROUTES[window.location.hash.slice(1)] ?? '/';
    return <MemoryRouter initialEntries={[start]}>{children}</MemoryRouter>;
  }
  return <BrowserRouter>{children}</BrowserRouter>;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <App />
    </Router>
  </StrictMode>,
);
