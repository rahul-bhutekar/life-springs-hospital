import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { Appointment } from './pages/Appointment';
import { Assistant } from './pages/Assistant';
import { Dashboard } from './pages/Dashboard';
import { Doctor } from './pages/Doctor';
import { Home } from './pages/Home';

/** Scrolls to `#section` links (e.g. /#services) and to the top on page changes. */
function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY - 90;
        window.scrollTo({ top, behavior: 'smooth' });
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

export function App() {
  return (
    <>
      <ScrollManager />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/doctor" element={<Doctor />} />
        <Route path="/appointment" element={<Appointment />} />
        <Route path="/assistant" element={<Assistant />} />
        <Route path="/admin" element={<Dashboard />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </>
  );
}
