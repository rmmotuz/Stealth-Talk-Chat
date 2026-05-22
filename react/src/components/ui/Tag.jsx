import { memo } from 'react';
import './Tag.css';

export const Tag = memo(({ label, isActive, onClick }) => {
  return (
    <button className={`tag ${isActive ? 'active' : ''}`} onClick={onClick}>
      {label}
    </button>
  );
});
