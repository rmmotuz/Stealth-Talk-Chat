import './Header.css';

export const Header = () => {
  return (
    <header className="app-header">
      <div className="logo-section">
        <div className="logo-icon">💬</div>
        <span className="logo-text">Anonymous Stealth Talk</span>
      </div>
      <div className="header-links">
        <a href="#">Guidelines</a>
        <a href="#">Privacy Policy</a>
      </div>
    </header>
  );
};