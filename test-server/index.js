const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const crypto = require("crypto");
const { Queue } = require("./structures/queue");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const matchQueue = new Queue();
const activeRooms = new Map();
const socketRoomMap = new Map();
const waitingUsers = new Map();

function generateRoomId() {
  return `room_${crypto.randomBytes(8).toString("hex")}`;
}

function calculateCompatibility(prefsA, prefsB) {
  if (prefsA.mode !== prefsB.mode) return -1;

  if (prefsA.partnerGender && prefsA.partnerGender !== "any") {
    if (prefsB.myGender && prefsB.myGender !== prefsA.partnerGender) return -1;
  }
  if (prefsB.partnerGender && prefsB.partnerGender !== "any") {
    if (prefsA.myGender && prefsA.myGender !== prefsB.partnerGender) return -1;
  }

  let score = 1;

  if (prefsA.age && prefsB.age && prefsA.age === prefsB.age) {
    score += 3;
  }

  if (prefsA.mood && prefsB.mood && prefsA.mood === prefsB.mood) {
    score += 2;
  }

  if (prefsA.tags && prefsB.tags) {
    const tagsA = new Set(prefsA.tags);
    const sharedTags = prefsB.tags.filter((t) => tagsA.has(t));
    score += sharedTags.length * 2;
  }

  return score;
}

function findMatch(socketId, preferences) {
  let bestMatch = null;
  let bestScore = -1;

  for (let i = matchQueue.head; i < matchQueue.tail; i++) {
    const waitingSocketId = matchQueue.items[i];
    if (!waitingSocketId || waitingSocketId === socketId) continue;

    const waitingPrefs = waitingUsers.get(waitingSocketId);
    if (!waitingPrefs) continue;

    const waitingSocket = io.sockets.sockets.get(waitingSocketId);
    if (!waitingSocket || !waitingSocket.connected) {
      waitingUsers.delete(waitingSocketId);
      delete matchQueue.items[i];
      continue;
    }

    const score = calculateCompatibility(preferences, waitingPrefs);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = { index: i, socketId: waitingSocketId };
    }
  }

  if (bestMatch) {
    delete matchQueue.items[bestMatch.index];
    return bestMatch.socketId;
  }

  return null;
}

function cleanupUser(socketId) {
  matchQueue.remove((id) => id === socketId);
  waitingUsers.delete(socketId);

  const roomId = socketRoomMap.get(socketId);
  if (roomId) {
    const room = activeRooms.get(roomId);
    if (room) {
      const partnerId = room.users.find((id) => id !== socketId);
      if (partnerId) {
        const partnerSocket = io.sockets.sockets.get(partnerId);
        if (partnerSocket) {
          partnerSocket.emit("partner_disconnected");
          partnerSocket.leave(roomId);
          socketRoomMap.delete(partnerId);
        }
      }
      activeRooms.delete(roomId);
    }
    socketRoomMap.delete(socketId);
  }
}

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Stealth Talk server running on port ${PORT}`);
});

app.get("/", (req, res) => {
  res.send("Stealth Talk Server is running");
});

io.on("connection", (socket) => {
  console.log(`Connected: ${socket.id}`);

  io.emit("online_count", io.engine.clientsCount);

  socket.on("find_partner", (preferences) => {
    console.log(
      `${socket.id} searching (mode: ${preferences.mode}, gender: ${preferences.myGender}->${preferences.partnerGender}, age: ${preferences.age}, mood: ${preferences.mood}, tags: [${preferences.tags}])`
    );

    cleanupUser(socket.id);

    const partnerId = findMatch(socket.id, preferences);

    if (partnerId) {
      const roomId = generateRoomId();

      activeRooms.set(roomId, {
        users: [socket.id, partnerId],
        mode: preferences.mode,
        createdAt: Date.now(),
      });

      socketRoomMap.set(socket.id, roomId);
      socketRoomMap.set(partnerId, roomId);

      socket.join(roomId);
      const partnerSocket = io.sockets.sockets.get(partnerId);
      if (partnerSocket) {
        partnerSocket.join(roomId);
      }

      waitingUsers.delete(partnerId);

      console.log(`Matched: ${socket.id} <-> ${partnerId} in ${roomId}`);

      socket.emit("match_found", { roomId, partnerId });
      if (partnerSocket) {
        partnerSocket.emit("match_found", { roomId, partnerId: socket.id });
      }
    } else {
      waitingUsers.set(socket.id, preferences);
      matchQueue.enqueue(socket.id);
      socket.emit("searching");
      console.log(`${socket.id} added to queue (size: ${matchQueue.size()})`);
    }
  });

  socket.on("cancel_search", () => {
    matchQueue.remove((id) => id === socket.id);
    waitingUsers.delete(socket.id);
    console.log(`${socket.id} cancelled search`);
  });

  socket.on("leave_chat", () => {
    console.log(`${socket.id} left the chat`);
    cleanupUser(socket.id);
  });

  socket.on("message", ({ roomId, encryptedData, iv }) => {
    socket.to(roomId).emit("message", {
      encryptedData,
      iv,
      from: socket.id,
      timestamp: Date.now(),
    });
  });

  socket.on("typing", ({ roomId, isTyping }) => {
    socket.to(roomId).emit("typing", { isTyping, from: socket.id });
  });

  socket.on("exchange_key", ({ roomId, publicKey }) => {
    socket.to(roomId).emit("exchange_key", {
      publicKey,
      from: socket.id,
    });
    console.log(`Key exchanged in room ${roomId} by ${socket.id}`);
  });

  socket.on("webrtc_offer", ({ roomId, offer }) => {
    socket.to(roomId).emit("webrtc_offer", { offer, from: socket.id });
  });

  socket.on("webrtc_answer", ({ roomId, answer }) => {
    socket.to(roomId).emit("webrtc_answer", { answer, from: socket.id });
  });

  socket.on("webrtc_ice_candidate", ({ roomId, candidate }) => {
    socket.to(roomId).emit("webrtc_ice_candidate", { candidate, from: socket.id });
  });

  socket.on("voice_state", ({ roomId, isActive }) => {
    socket.to(roomId).emit("voice_state", { isActive, from: socket.id });
  });

  socket.on("skip_partner", (preferences) => {
    console.log(`${socket.id} skipping partner`);
    cleanupUser(socket.id);

    socket.emit("searching");

    const partnerId = findMatch(socket.id, preferences);

    if (partnerId) {
      const roomId = generateRoomId();

      activeRooms.set(roomId, {
        users: [socket.id, partnerId],
        mode: preferences.mode,
        createdAt: Date.now(),
      });

      socketRoomMap.set(socket.id, roomId);
      socketRoomMap.set(partnerId, roomId);

      socket.join(roomId);
      const partnerSocket = io.sockets.sockets.get(partnerId);
      if (partnerSocket) {
        partnerSocket.join(roomId);
      }

      waitingUsers.delete(partnerId);

      socket.emit("match_found", { roomId, partnerId });
      if (partnerSocket) {
        partnerSocket.emit("match_found", { roomId, partnerId: socket.id });
      }
    } else {
      waitingUsers.set(socket.id, preferences);
      matchQueue.enqueue(socket.id);
    }
  });

  socket.on("disconnect", () => {
    console.log(`Disconnected: ${socket.id}`);
    cleanupUser(socket.id);

    io.emit("online_count", io.engine.clientsCount);
  });
});
