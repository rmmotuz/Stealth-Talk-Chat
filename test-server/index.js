const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

server.listen(3000, () => {
  console.log("Server started");
});

app.get("/", (req, res) => {
  res.send("Server is running");
});

io.on("connection", (socket) => {
  
  socket.on("join_room", (roomId) => {
    console.log(roomId);
    socket.join(roomId);
  });

  socket.on("message", ({ roomId, text }) => {
    console.log(text);

    io.to(roomId).emit("message", {
      text,
      from: socket.id,
    });
  });
});