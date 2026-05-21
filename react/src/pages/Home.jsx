import { useState, useContext } from "react";
import { Header } from "../components/layout/Header";
import { Button } from "../components/ui/Button";
import { Tag } from "../components/ui/Tag";
import { Toggle } from "../components/ui/Toggle";
import { LanguageContext } from "../context/LanguageProvider";
import { ThemeContext } from "../context/ThemeProvider";
import { SocketContext } from "../context/SocketContext";
import { useNavigate } from "react-router-dom";
import "./Home.css";

export const Home = () => {
  const { t, language, setLanguage } = useContext(LanguageContext);
  const { theme } = useContext(ThemeContext);
  const { findPartner, isConnected, onlineCount } = useContext(SocketContext);
  const navigate = useNavigate();

  const [mode, setMode] = useState("textChat");
  const [age, setAge] = useState("any");
  const [myGender, setMyGender] = useState("any");
  const [partnerGender, setPartnerGender] = useState("any");
  const [mood, setMood] = useState("chill");
  const [selectedTags, setSelectedTags] = useState([]);

  const modes = [
    { key: "textChat", icon: "💬" },
    { key: "voiceCall", icon: "🎙️" },
    { key: "videoCall", icon: "📹" },
  ];

  const ages = [
    { key: "any", label: t("anyAge") },
    { key: "18-24", label: "18-24" },
    { key: "25-34", label: "25-34" },
    { key: "35+", label: "35+" },
  ];

  const genders = [
    { key: "any", label: t("genderAny") },
    { key: "male", label: t("genderMale") },
    { key: "female", label: t("genderFemale") },
  ];

  const moods = [
    { key: "chill", icon: "😌", label: t("moodChill") },
    { key: "deep", icon: "🧠", label: t("moodDeep") },
    { key: "fun", icon: "🎉", label: t("moodFun") },
    { key: "vent", icon: "💭", label: t("moodVent") },
  ];

  const availableTags = [
    "#gaming", "#music", "#movies", "#tech",
    "#anime", "#sports", "#travel", "#books",
  ];

  const handleTagClick = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleStartChat = () => {
    findPartner({ mode, age, tags: selectedTags, myGender, partnerGender, mood });
    navigate("/searching");
  };

  return (
    <div className="app-container">
      <Header />

      <main className="home-main">
        {}
        <div className="hero-section">
          <h1 className="page-title">{t("homeTitle")}</h1>
          <p className="page-subtitle">{t("homeSubtitle")}</p>
          <div className="hero-badges">
            <div className={`connection-badge ${isConnected ? "connected" : "disconnected"}`}>
              <span className="conn-dot"></span>
              <span>{isConnected ? t("serverConnected") : t("serverDisconnected")}</span>
            </div>
            {isConnected && (
              <div className="online-badge">
                <span className="online-icon">🌍</span>
                <span>{onlineCount} {t("usersOnline")}</span>
              </div>
            )}
          </div>
        </div>

        {}
        <section className="config-section">
          <p className="config-label">{t("modeSelection")}</p>
          <div className="chip-row">
            {modes.map((m) => (
              <Button key={m.key} isActive={mode === m.key} onClick={() => setMode(m.key)}>
                {m.icon} {t(m.key)}
              </Button>
            ))}
          </div>
        </section>

        {}
        <section className="config-section">
          <p className="config-label">{t("moodLabel")}</p>
          <div className="chip-row">
            {moods.map((m) => (
              <Button key={m.key} isActive={mood === m.key} onClick={() => setMood(m.key)}>
                {m.icon} {m.label}
              </Button>
            ))}
          </div>
        </section>

        {}
        <div className="start-wrapper">
          <Button variant="large" onClick={handleStartChat} disabled={!isConnected}>
            {t("startChat")}
          </Button>
        </div>

        {}
        <div className="filters-card">
          <div className="filters-header">
            <h3 className="filters-title">{t("filters")}</h3>
            <span className="filters-badge">{t("optional")}</span>
          </div>

          {}
          <div className="filter-block">
            <p className="config-label">{t("yourGender")}</p>
            <div className="chip-row">
              {genders.map((g) => (
                <Button key={g.key} isActive={myGender === g.key} onClick={() => setMyGender(g.key)}>
                  {g.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="filter-block">
            <p className="config-label">{t("partnerGenderLabel")}</p>
            <div className="chip-row">
              {genders.map((g) => (
                <Button key={g.key} isActive={partnerGender === g.key} onClick={() => setPartnerGender(g.key)}>
                  {g.label}
                </Button>
              ))}
            </div>
          </div>

          {}
          <div className="filter-block">
            <p className="config-label">{t("ageCategory")}</p>
            <div className="chip-row">
              {ages.map((a) => (
                <Button key={a.key} isActive={age === a.key} onClick={() => setAge(a.key)}>
                  {a.label}
                </Button>
              ))}
            </div>
          </div>

          {}
          <div className="filter-block">
            <p className="config-label">{t("interestTags")}</p>
            <div className="tag-grid">
              {availableTags.map((tag) => (
                <Tag
                  key={tag}
                  label={tag}
                  isActive={selectedTags.includes(tag)}
                  onClick={() => handleTagClick(tag)}
                />
              ))}
            </div>
          </div>
        </div>

        {}
        <div className="settings-row">
          <div className="setting-item">
            <label className="config-label">{t("language")}</label>
            <select
              className="select-input"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="en">English</option>
              <option value="uk">Українська</option>
            </select>
          </div>
          <div className="setting-item">
            <label className="config-label">{t("theme")}</label>
            <Toggle />
          </div>
        </div>
      </main>
    </div>
  );
};
