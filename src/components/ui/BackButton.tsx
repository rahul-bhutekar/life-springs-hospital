import { useLocation, useNavigate } from 'react-router-dom';
import './BackButton.css';

export function BackButton({ className = '' }: { className?: string }) {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <button
      type="button"
      className={`back-btn ${className}`}
      aria-label="Go back"
      onClick={() => (location.key !== 'default' ? navigate(-1) : navigate('/'))}
    >
      ‹
    </button>
  );
}
