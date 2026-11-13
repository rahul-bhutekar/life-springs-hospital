import { useLocation, useNavigate } from 'react-router-dom';
import './BackButton.css';

type Props = {
  className?: string;
  /** 'inverse' for use on the dark teal header. */
  tone?: 'default' | 'inverse';
  label?: string;
  /** Show the label as visible text next to the arrow, as one button. */
  showLabel?: boolean;
};

/** Goes back to the previous page, or to the home page when there is none. */
export function BackButton({ className = '', tone = 'default', label = 'Go back', showLabel = false }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const goBack = () => (location.key !== 'default' ? navigate(-1) : navigate('/'));

  if (showLabel) {
    return (
      <button type="button" className={`back-link ${className}`} onClick={goBack}>
        <span className={`back-btn back-btn--${tone}`} aria-hidden="true">
          ‹
        </span>
        {label}
      </button>
    );
  }

  return (
    <button type="button" className={`back-btn back-btn--${tone} ${className}`} aria-label={label} title={label} onClick={goBack}>
      ‹
    </button>
  );
}
