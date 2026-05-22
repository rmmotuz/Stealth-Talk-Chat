import { memo } from 'react';
import { useTheme } from '../../hooks/useTheme';
import './Toggle.css';

export const Toggle = memo(() => {
  const { theme, setLightMode, setDarkMode } = useTheme();

  return (
    <div className="toggle-container">
      <button
        className={`toggle-btn ${theme === 'light' ? 'active' : ''}`}
        onClick={setLightMode}
      >
        ☀️
      </button>
      <button
        className={`toggle-btn ${theme === 'dark' ? 'active' : ''}`}
        onClick={setDarkMode}
      >
        🌙
      </button>
    </div>
  );
});
