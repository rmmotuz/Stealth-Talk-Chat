import { useContext, useState, useEffect, useRef } from "react";
import { SocketContext } from "../context/SocketContext";
import { LanguageContext } from "../context/LanguageProvider";
import { useNavigate } from "react-router-dom";
import "./ChatRoom.css";

export const ChatRoom = () => {
  const { t } = useContext(LanguageContext);
  const navigate = useNavigate();
  const {
    status,
    messages,
    sendMessage,
    partnerTyping,
    sendTypingStatus,
    skipPartner,
    leaveChat,
    chatMode,

    mediaActive,
    isMuted,
    isCameraOff,
    partnerVoiceActive,
    partnerCameraActive,
    mediaConnectionState,
    startMedia,
    stopMedia,
    toggleMute,
    toggleCamera,
    localMediaRef,
    remoteMediaRef,
  } = useContext(SocketContext);

  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, partnerTyping]);

  useEffect(() => {
    if (status === "idle") {
      navigate("/");
    }
  }, [status, navigate]);

  useEffect(() => {
    if (status === "matched" && !mediaActive) {
      if (chatMode === "videoCall") {
        startMedia(true);
      } else if (chatMode === "voiceCall") {
        startMedia(false);
      }
    }
  }, [status, chatMode, mediaActive, startMedia]);

  const handleSend = (e) => {
    e.preventDefault();
    if (inputMessage.trim() && status === "matched") {
      sendMessage(inputMessage);
      setInputMessage("");
      sendTypingStatus(false);
    }
  };

  const handleTyping = (e) => {
    setInputMessage(e.target.value);
    if (status === "matched") {
      sendTypingStatus(e.target.value.length > 0);
    }
  };

  const handleLeave = () => {
    leaveChat();
    navigate("/");
  };

  const isMediaMode = chatMode === "voiceCall" || chatMode === "videoCall";

  return (
    <div className={`app-container chat-container ${isMediaMode ? 'has-media' : ''}`}>
      <header className="chat-header-bar">
        <div className="chat-header-left">
          <div className="partner-avatar">
            👤
            <div className={`status-dot ${status === "matched" ? "online" : "offline"}`}></div>
          </div>
          <div className="partner-info">
            <span className="partner-name">{t("anonymousPartner")}</span>
            {status === "matched" ? (
              partnerTyping ? (
                <span className="typing-text">{t("typing")}</span>
              ) : (
                <span className="online-text">{t("online")}</span>
              )
            ) : (
              <span className="disconnected-text">{t("partnerLeft")}</span>
            )}
          </div>
        </div>

        <div className="chat-header-right">
          <div className="encryption-badge">
            <span className="lock-icon">🔒</span>
            <span>{t("e2eEncryption")}</span>
          </div>
          <button className="skip-btn" onClick={skipPartner} disabled={status !== "matched"}>
            ⏭️ {t("nextPartner")}
          </button>
          <button className="leave-btn" onClick={handleLeave}>
            👋 {t("leave")}
          </button>
        </div>
      </header>

      <div className="chat-content-wrapper">
        {isMediaMode && (
          <section className="media-section">
            {chatMode === "videoCall" ? (
              <div className="video-container">
                <video
                  ref={remoteMediaRef}
                  autoPlay
                  playsInline
                  className="remote-video active"
                />
                {!partnerCameraActive && (
                  <div className="video-placeholder remote-placeholder">
                    <div className="avatar-large">👤</div>
                    <span className="placeholder-text">{t("cameraOff")}</span>
                  </div>
                )}

                <div className="local-video-pip">
                  <video
                    ref={localMediaRef}
                    autoPlay
                    playsInline
                    muted
                    className={`local-video ${!isCameraOff ? 'active' : ''}`}
                  />
                  {isCameraOff && (
                    <div className="video-placeholder local-placeholder">
                      <span>{t("cameraOff")}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="voice-container">
                <audio ref={remoteMediaRef} autoPlay />
                <div className={`voice-avatar ${partnerVoiceActive ? 'speaking' : ''}`}>
                  👤
                  {partnerVoiceActive && (
                    <div className="voice-rings">
                      <div className="ring ring-1"></div>
                      <div className="ring ring-2"></div>
                      <div className="ring ring-3"></div>
                    </div>
                  )}
                </div>
                <div className="voice-status">
                  {mediaActive ? (
                    partnerVoiceActive ? (
                      <span className="speaking-text">🎙️ {t("partnerSpeaking")}</span>
                    ) : (
                      <span className="connected-text">{t("voiceConnected")}</span>
                    )
                  ) : (
                    <span className="connecting-text">{t("voiceConnecting")}</span>
                  )}
                </div>
              </div>
            )}

            <div className="media-controls">
              <button
                className={`media-btn ${isMuted ? 'muted' : ''}`}
                onClick={toggleMute}
                title={isMuted ? t("unmute") : t("mute")}
              >
                {isMuted ? (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                    <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path>
                    <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path>
                    <line x1="12" y1="19" x2="12" y2="23"></line>
                    <line x1="8" y1="23" x2="16" y2="23"></line>
                  </svg>
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                    <line x1="12" y1="19" x2="12" y2="23"></line>
                    <line x1="8" y1="23" x2="16" y2="23"></line>
                  </svg>
                )}
              </button>

              {chatMode === "videoCall" && (
                <button
                  className={`media-btn ${isCameraOff ? 'muted' : ''}`}
                  onClick={toggleCamera}
                  title={isCameraOff ? t("cameraOn") : t("cameraOff")}
                >
                  {isCameraOff ? (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                      <path d="M21 17.16V5a2 2 0 0 0-2-2H7.84"></path>
                      <path d="M3.27 3.27A2 2 0 0 0 3 5v14a2 2 0 0 0 2 2h14c.36 0 .69-.1 1-.27"></path>
                      <polygon points="23 7 16 12 23 17 23 7"></polygon>
                    </svg>
                  ) : (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="23 7 16 12 23 17 23 7"></polygon>
                      <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                    </svg>
                  )}
                </button>
              )}
            </div>
          </section>
        )}

        <section className="text-chat-section">
          <div className="messages-area">
            <div className="system-message">
              <span className="system-icon">🔒</span>
              <span>{t("encryptedChat")}</span>
            </div>

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`message-wrapper ${msg.sender === "me" ? "message-right" : "message-left"}`}
              >
                <div className={`message-bubble ${msg.sender === "me" ? "bubble-me" : "bubble-partner"}`}>
                  <span className="message-text">{msg.text}</span>
                  <span className="message-time">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}

            {partnerTyping && (
              <div className="message-wrapper message-left">
                <div className="message-bubble bubble-partner typing-bubble">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              </div>
            )}

            {status === "disconnected" && (
              <div className="system-message disconnected-notice">
                <span className="system-icon">👋</span>
                <span>{t("partnerDisconnected")}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form className="chat-input-area" onSubmit={handleSend}>
            <input
              type="text"
              className="chat-input"
              value={inputMessage}
              onChange={handleTyping}
              placeholder={t("typeMessage")}
              disabled={status !== "matched"}
            />
            <div className="chat-controls">
              <button
                type="submit"
                className="send-btn"
                disabled={!inputMessage.trim() || status !== "matched"}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
};
