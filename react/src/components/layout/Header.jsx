import { Link, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { LanguageContext } from '../../context/LanguageProvider';
import './Header.css';

export const Header = () => {
  const { t } = useContext(LanguageContext);
  const location = useLocation();

  return (
    <header className="app-header">
      <Link to="/" className="logo-section">
        <div className="logo-icon-wrap">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <span className="logo-text">Stealth<span className="logo-accent">Talk</span></span>
      </Link>
      <nav className="header-nav">
        <Link
          to="/guidelines"
          className={`nav-link ${location.pathname === '/guidelines' ? 'active' : ''}`}
        >
          {t("guidelines")}
        </Link>
        <Link
          to="/privacy"
          className={`nav-link ${location.pathname === '/privacy' ? 'active' : ''}`}
        >
          {t("privacyPolicy")}
        </Link>
      </nav>
    </header>
  );
};
