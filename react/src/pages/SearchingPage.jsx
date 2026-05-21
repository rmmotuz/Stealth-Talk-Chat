import { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { SocketContext } from "../context/SocketContext";
import { LanguageContext } from "../context/LanguageProvider";
import { Header } from "../components/layout/Header";
import "./SearchingPage.css";

export const SearchingPage = () => {
  const { status, cancelSearch, chatMode } = useContext(SocketContext);
  const { t } = useContext(LanguageContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (status === "matched") {
      navigate("/chat");
    }
    if (status === "idle") {
      navigate("/");
    }
  }, [status, navigate]);

  const handleCancel = () => {
    cancelSearch();
    navigate("/");
  };

  return (
    <div className="app-container">
      <Header />
      <main className="searching-main">
        <div className="searching-content">
          <div className="radar-container">
            <div className="radar-pulse pulse-1"></div>
            <div className="radar-pulse pulse-2"></div>
            <div className="radar-pulse pulse-3"></div>
            <div className="radar-center">
              <span className="radar-icon">
                {chatMode === "voiceCall" ? "🎙️" : "💬"}
              </span>
            </div>
          </div>

          <h2 className="searching-title">{t("searchingTitle")}</h2>
          <p className="searching-subtitle">{t("searchingSubtitle")}</p>

          <div className="dots-container">
            <span className="search-dot dot-1"></span>
            <span className="search-dot dot-2"></span>
            <span className="search-dot dot-3"></span>
          </div>

          <div className="encryption-badge">
            <span className="lock-icon">🔒</span>
            <span>{t("encryptionActive")}</span>
          </div>

          <button className="cancel-btn" onClick={handleCancel}>
            {t("cancelSearch")}
          </button>
        </div>
      </main>
    </div>
  );
};
