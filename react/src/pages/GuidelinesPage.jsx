import { useContext } from "react";
import { Header } from "../components/layout/Header";
import { LanguageContext } from "../context/LanguageProvider";
import "./InfoPage.css";

export const GuidelinesPage = () => {
  const { t } = useContext(LanguageContext);

  return (
    <div className="app-container">
      <Header />
      <main className="info-main">
        <div className="info-hero">
          <div className="info-icon-wrap">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
          </div>
          <h1 className="info-title">{t("guidelinesTitle")}</h1>
          <p className="info-subtitle">{t("guidelinesSubtitle")}</p>
        </div>

        <div className="info-content">
          <section className="info-card">
            <div className="card-number">01</div>
            <h2>{t("guideRespectTitle")}</h2>
            <p>{t("guideRespectText")}</p>
          </section>

          <section className="info-card warning">
            <div className="card-number">02</div>
            <h2>{t("guidePersonalTitle")}</h2>
            <p>{t("guidePersonalText")}</p>
            <div className="warn-list">
              <span className="warn-item">❌ {t("guideNoName")}</span>
              <span className="warn-item">❌ {t("guideNoPhone")}</span>
              <span className="warn-item">❌ {t("guideNoSocial")}</span>
              <span className="warn-item">❌ {t("guideNoAddress")}</span>
            </div>
          </section>

          <section className="info-card">
            <div className="card-number">03</div>
            <h2>{t("guideNSFWTitle")}</h2>
            <p>{t("guideNSFWText")}</p>
          </section>

          <section className="info-card accent">
            <div className="card-number">04</div>
            <h2>{t("guideHarassTitle")}</h2>
            <p>{t("guideHarassText")}</p>
          </section>

          <section className="info-card">
            <div className="card-number">05</div>
            <h2>{t("guideSkipTitle")}</h2>
            <p>{t("guideSkipText")}</p>
          </section>

          <section className="info-card fun">
            <div className="card-number">06</div>
            <h2>{t("guideFunTitle")}</h2>
            <p>{t("guideFunText")}</p>
            <div className="fun-emojis">
              <span>💬</span><span>🎙️</span><span>🌍</span><span>🤝</span><span>✨</span>
            </div>
          </section>
        </div>

        <div className="info-footer-text">
          <p>{t("guidelinesFooter")}</p>
        </div>
      </main>
    </div>
  );
};
