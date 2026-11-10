import { useLocation, useNavigate } from 'react-router-dom';
import './BackButton.css';

type Props = {
  className?: string;
  /** 'inverse' for use on the dark teal header. */
  tone?: 'default' | 'inverse';
  label?: string;
};

/** Goes back to the previous page, or to the home page when there is none. */
export function BackButton({ className = '', tone = 'default', label = 'Go back' }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <button
      type="button"
      className={`back-btn back-btn--${tone} ${className}`}
      aria-label={label}
      title={label}
      onClick={() => (location.key !== 'default' ? navigate(-1) : navigate('/'))}
    >
      ‹
    </button>
  );
}
