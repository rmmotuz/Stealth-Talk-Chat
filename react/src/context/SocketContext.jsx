import { createContext, useState, useEffect, useCallback, useRef } from "react";
import socket from "../services/socket";
import {
  generateKeyPair,
  exportPublicKey,
  importPublicKey,
  deriveSharedKey,
  encryptMessage,
  decryptMessage,
} from "../services/crypto";
import { createMediaConnection } from "../services/webrtc";

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {

  const [isConnected, setIsConnected] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | searching | matched | disconnected
  const [roomId, setRoomId] = useState(null);
  const [partnerId, setPartnerId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);

  const keyPairRef = useRef(null);
  const sharedKeyRef = useRef(null);

  const [mediaActive, setMediaActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [partnerVoiceActive, setPartnerVoiceActive] = useState(false);
  const [partnerCameraActive, setPartnerCameraActive] = useState(false);
  const [mediaConnectionState, setMediaConnectionState] = useState("new");
  
  const mediaControllerRef = useRef(null);
  const localMediaRef = useRef(null);
  const remoteMediaRef = useRef(null);

  const preferencesRef = useRef(null);
  const [chatMode, setChatMode] = useState("textChat");

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => {
      setIsConnected(false);
      setStatus("disconnected");
      setOnlineCount(0);
    });

    socket.on("online_count", (count) => {
      setOnlineCount(count);
    });

    socket.on("searching", () => {
      setStatus("searching");
    });

    socket.on("match_found", async ({ roomId: newRoomId, partnerId: newPartnerId }) => {
      setRoomId(newRoomId);
      setPartnerId(newPartnerId);
      setMessages([]);
      setStatus("matched");
      setPartnerTyping(false);
      setMediaActive(false);
      setPartnerVoiceActive(false);
      setPartnerCameraActive(false);

      try {
        const keyPair = await generateKeyPair();
        keyPairRef.current = keyPair;
        const publicKeyJwk = await exportPublicKey(keyPair.publicKey);
        socket.emit("exchange_key", { roomId: newRoomId, publicKey: publicKeyJwk });
      } catch (err) {
        console.error("Key generation failed:", err);
      }
    });

    socket.on("exchange_key", async ({ publicKey: partnerPublicKeyJwk }) => {
      try {
        const partnerPublicKey = await importPublicKey(partnerPublicKeyJwk);
        if (keyPairRef.current) {
          sharedKeyRef.current = await deriveSharedKey(
            keyPairRef.current.privateKey,
            partnerPublicKey
          );
          console.log("🔐 Shared encryption key derived");
        }
      } catch (err) {
        console.error("Key exchange failed:", err);
      }
    });

    socket.on("message", async ({ encryptedData, iv, from, timestamp }) => {
      try {
        let text = "[Encrypted message]";
        if (sharedKeyRef.current) {
          text = await decryptMessage(encryptedData, iv, sharedKeyRef.current);
        }
        setMessages((prev) => [
          ...prev,
          { id: Date.now(), text, sender: "partner", timestamp },
        ]);
      } catch (err) {
        console.error("Decryption failed:", err);
        setMessages((prev) => [
          ...prev,
          { id: Date.now(), text: "[Failed to decrypt]", sender: "partner", timestamp },
        ]);
      }
    });

    socket.on("typing", ({ isTyping }) => {
      setPartnerTyping(isTyping);
    });

    socket.on("partner_disconnected", () => {
      setStatus("disconnected");
      setPartnerTyping(false);
      setMediaActive(false);
      setPartnerVoiceActive(false);
      setPartnerCameraActive(false);
      if (mediaControllerRef.current) {
        mediaControllerRef.current.stop();
        mediaControllerRef.current = null;
      }
    });

    socket.on("webrtc_offer", async ({ offer }) => {
      if (mediaControllerRef.current) {
        await mediaControllerRef.current.handleOffer(offer);
      }
    });

    socket.on("webrtc_answer", async ({ answer }) => {
      if (mediaControllerRef.current) {
        await mediaControllerRef.current.handleAnswer(answer);
      }
    });

    socket.on("webrtc_ice_candidate", async ({ candidate }) => {
      if (mediaControllerRef.current) {
        await mediaControllerRef.current.handleIceCandidate(candidate);
      }
    });

    socket.on("media_state", ({ audioActive, videoActive }) => {
      if (audioActive !== undefined) setPartnerVoiceActive(audioActive);
      if (videoActive !== undefined) setPartnerCameraActive(videoActive);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("searching");
      socket.off("match_found");
      socket.off("exchange_key");
      socket.off("message");
      socket.off("typing");
      socket.off("partner_disconnected");
      socket.off("webrtc_offer");
      socket.off("webrtc_answer");
      socket.off("webrtc_ice_candidate");
      socket.off("media_state");
      socket.off("online_count");
    };
  }, []);

  const findPartner = useCallback((preferences) => {
    preferencesRef.current = preferences;
    setChatMode(preferences.mode);
    sharedKeyRef.current = null;
    keyPairRef.current = null;
    socket.emit("find_partner", preferences);
  }, []);

  const cancelSearch = useCallback(() => {
    socket.emit("cancel_search");
    setStatus("idle");
  }, []);

  const sendMessage = useCallback(async (text) => {
    if (!roomId) return;

    try {
      let payload;
      if (sharedKeyRef.current) {
        const { encryptedData, iv } = await encryptMessage(text, sharedKeyRef.current);
        payload = { roomId, encryptedData, iv };
      } else {

        const encoder = new TextEncoder();
        const data = encoder.encode(text);
        const base64 = btoa(String.fromCharCode(...data));
        payload = { roomId, encryptedData: base64, iv: "" };
      }

      socket.emit("message", payload);
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), text, sender: "me", timestamp: Date.now() },
      ]);
    } catch (err) {
      console.error("Send message failed:", err);
    }
  }, [roomId]);

  const sendTypingStatus = useCallback((isTyping) => {
    if (roomId) {
      socket.emit("typing", { roomId, isTyping });
    }
  }, [roomId]);

  const skipPartner = useCallback(() => {
    if (mediaControllerRef.current) {
      mediaControllerRef.current.stop();
      mediaControllerRef.current = null;
    }
    setMediaActive(false);
    setPartnerVoiceActive(false);
    setPartnerCameraActive(false);
    sharedKeyRef.current = null;
    keyPairRef.current = null;

    if (preferencesRef.current) {
      socket.emit("skip_partner", preferencesRef.current);
    }
  }, []);

  const leaveChat = useCallback(() => {
    if (mediaControllerRef.current) {
      mediaControllerRef.current.stop();
      mediaControllerRef.current = null;
    }
    socket.emit("leave_chat");
    setStatus("idle");
    setRoomId(null);
    setPartnerId(null);
    setMessages([]);
    setMediaActive(false);
    setPartnerVoiceActive(false);
    setPartnerCameraActive(false);
    sharedKeyRef.current = null;
    keyPairRef.current = null;
  }, []);

  const startMedia = useCallback(async (withVideo = false) => {
    if (!roomId) return false;

    const mediaOptions = { audio: true, video: withVideo };

    const controller = createMediaConnection(
      socket,
      roomId,
      mediaOptions,
      (localStream) => {
        if (localMediaRef.current) {
          localMediaRef.current.srcObject = localStream;
        }
      },
      (remoteStream) => {
        if (remoteMediaRef.current) {
          remoteMediaRef.current.srcObject = remoteStream;
          remoteMediaRef.current.play().catch(() => {});
        }
      },
      (state) => {
        setMediaConnectionState(state);
      }
    );

    mediaControllerRef.current = controller;
    const success = await controller.start(true);

    if (success) {
      setMediaActive(true);
      setIsMuted(false);
      setIsCameraOff(false);
      socket.emit("media_state", { roomId, audioActive: true, videoActive: withVideo });
    }

    return success;
  }, [roomId]);

  const stopMedia = useCallback(() => {
    if (mediaControllerRef.current) {
      mediaControllerRef.current.stop();
      mediaControllerRef.current = null;
    }
    setMediaActive(false);
    setIsMuted(false);
    setIsCameraOff(false);
    
    if (localMediaRef.current) localMediaRef.current.srcObject = null;
    if (remoteMediaRef.current) remoteMediaRef.current.srcObject = null;

    if (roomId) {
      socket.emit("media_state", { roomId, audioActive: false, videoActive: false });
    }
  }, [roomId]);

  const toggleMute = useCallback(() => {
    if (mediaControllerRef.current) {
      const isAudioActive = mediaControllerRef.current.toggleMute();
      setIsMuted(!isAudioActive);
      socket.emit("media_state", { roomId, audioActive: isAudioActive });
    }
  }, [roomId]);

  const toggleCamera = useCallback(() => {
    if (mediaControllerRef.current) {
      const isVideoActive = mediaControllerRef.current.toggleCamera();
      setIsCameraOff(!isVideoActive);
      socket.emit("media_state", { roomId, videoActive: isVideoActive });
    }
  }, [roomId]);

  const value = {

    isConnected,
    status,
    roomId,
    partnerId,
    chatMode,
    onlineCount,

    messages,
    partnerTyping,
    sendMessage,
    sendTypingStatus,

    findPartner,
    cancelSearch,
    skipPartner,
    leaveChat,

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
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
