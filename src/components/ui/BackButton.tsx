import { useNavigate } from 'react-router-dom';
import './BackButton.css';

export function BackButton({ className = '' }: { className?: string }) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      className={`back-btn ${className}`}
      aria-label="Go back"
      onClick={() => (window.history.state?.idx > 0 ? navigate(-1) : navigate('/'))}
    >
      ‹
    </button>
  );
}
