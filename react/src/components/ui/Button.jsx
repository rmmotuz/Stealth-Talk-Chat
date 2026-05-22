import { memo } from 'react';
import './Button.css';

export const Button = memo(({ children, variant = 'primary', onClick, isActive, disabled }) => {
  const className = `btn btn-${variant} ${isActive ? 'active' : ''} ${disabled ? 'disabled' : ''}`;
  return (
    <button className={className} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
});
