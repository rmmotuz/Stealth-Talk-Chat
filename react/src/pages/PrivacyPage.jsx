import { useContext } from "react";
import { Header } from "../components/layout/Header";
import { LanguageContext } from "../context/LanguageProvider";
import "./InfoPage.css";

export const PrivacyPage = () => {
  const { t } = useContext(LanguageContext);

  return (
    <div className="app-container">
      <Header />
      <main className="info-main">
        <div className="info-hero">
          <div className="info-icon-wrap">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <h1 className="info-title">{t("privacyTitle")}</h1>
          <p className="info-subtitle">{t("privacySubtitle")}</p>
        </div>

        <div className="info-content">
          {}
          <section className="info-card">
            <div className="card-icon">🕵️</div>
            <h2>{t("privacyZeroTitle")}</h2>
            <p>{t("privacyZeroText")}</p>
          </section>

          {}
          <section className="info-card accent">
            <div className="card-icon">🔐</div>
            <h2>{t("privacyE2ETitle")}</h2>
            <p>{t("privacyE2EText")}</p>
            <div className="tech-badges">
              <span className="tech-badge">ECDH P-256</span>
              <span className="tech-badge">AES-GCM 256</span>
              <span className="tech-badge">Web Crypto API</span>
            </div>
          </section>

          {}
          <section className="info-card">
            <div className="card-icon">🗑️</div>
            <h2>{t("privacyNoLogsTitle")}</h2>
            <p>{t("privacyNoLogsText")}</p>
          </section>

          {}
          <section className="info-card">
            <div className="card-icon">👻</div>
            <h2>{t("privacyNoRegTitle")}</h2>
            <p>{t("privacyNoRegText")}</p>
          </section>

          {}
          <section className="info-card wide">
            <div className="card-icon">📡</div>
            <h2>{t("privacyDataFlowTitle")}</h2>
            <div className="flow-diagram">
              <div className="flow-step">
                <div className="flow-node you">You</div>
                <div className="flow-arrow">→</div>
                <div className="flow-node encrypt">🔒 Encrypt</div>
                <div className="flow-arrow">→</div>
                <div className="flow-node server">Server<br/><small>(relay only)</small></div>
                <div className="flow-arrow">→</div>
                <div className="flow-node encrypt">🔓 Decrypt</div>
                <div className="flow-arrow">→</div>
                <div className="flow-node partner">Partner</div>
              </div>
            </div>
            <p className="flow-note">{t("privacyDataFlowText")}</p>
          </section>

          {}
          <section className="info-card">
            <div className="card-icon">🎙️</div>
            <h2>{t("privacyVoiceTitle")}</h2>
            <p>{t("privacyVoiceText")}</p>
          </section>

          {}
          <section className="info-card">
            <div className="card-icon">🍪</div>
            <h2>{t("privacyCookiesTitle")}</h2>
            <p>{t("privacyCookiesText")}</p>
          </section>
        </div>

        <div className="info-footer-text">
          <p>{t("privacyFooter")}</p>
        </div>
      </main>
    </div>
  );
};
