const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export function createMediaConnection(
  socket,
  roomId,
  mediaOptions,
  onLocalStream,
  onRemoteStream,
  onConnectionStateChange
) {
  let peerConnection = null;
  let startPromise = null;
  let localStream = null;

  const controller = {

    async start(isInitiator = false) {
      if (startPromise) return startPromise;

      startPromise = (async () => {
        try {
          localStream = await navigator.mediaDevices.getUserMedia({
            audio: mediaOptions.audio ? {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            } : false,
            video: mediaOptions.video ? {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              facingMode: "user"
            } : false,
          });

          if (onLocalStream) {
            onLocalStream(localStream);
          }

          peerConnection = new RTCPeerConnection(ICE_SERVERS);

          localStream.getTracks().forEach((track) => {
            peerConnection.addTrack(track, localStream);
          });

          peerConnection.ontrack = (event) => {
            if (event.streams && event.streams[0]) {
              onRemoteStream(event.streams[0]);
            }
          };

          peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
              socket.emit("webrtc_ice_candidate", {
                roomId,
                candidate: event.candidate,
              });
            }
          };

          peerConnection.onconnectionstatechange = () => {
            onConnectionStateChange(peerConnection.connectionState);
          };

          if (isInitiator) {
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            socket.emit("webrtc_offer", { roomId, offer });
          }

          return true;
        } catch (error) {
          console.error("Failed to start media:", error);
          return false;
        }
      })();

      return startPromise;
    },

    async handleOffer(offer) {
      if (!peerConnection) {
        await controller.start(false);
      }
      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      socket.emit("webrtc_answer", { roomId, answer });
    },

    async handleAnswer(answer) {
      if (peerConnection) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      }
    },

    async handleIceCandidate(candidate) {
      if (peerConnection) {
        try {
          await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.error("Error adding ICE candidate:", e);
        }
      }
    },

    toggleMute() {
      if (localStream) {
        const audioTrack = localStream.getAudioTracks()[0];
        if (audioTrack) {
          audioTrack.enabled = !audioTrack.enabled;
          return audioTrack.enabled;
        }
      }
      return false;
    },

    toggleCamera() {
      if (localStream) {
        const videoTrack = localStream.getVideoTracks()[0];
        if (videoTrack) {
          videoTrack.enabled = !videoTrack.enabled;
          return videoTrack.enabled;
        }
      }
      return false;
    },

    stop() {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
        localStream = null;
      }
      if (peerConnection) {
        peerConnection.close();
        peerConnection = null;
      }
      startPromise = null;
    },

    getPeerConnection() {
      return peerConnection;
    }
  };

  return controller;
}
