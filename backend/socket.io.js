const socketIo = require("socket.io");

let users = {};

function initializeSocket(server) {
    
  const io = socketIo(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      allowedHeaders: ["Content-Type"],
    },
  });

  io.on("connection", (socket) => {
    socket.on("setNickname", (nickname) => {
      users[socket.id] = nickname;
      socket.broadcast.emit("chatMessage", {
        nickname: "Server",
        message: `${nickname} has joined the chat!`,
      });
      io.emit("onlineUsers", Object.values(users));
    });

    socket.on("chatMessage", (data) => {
      socket.broadcast.emit("chatMessage", data);
    });

    socket.on("privateMessage", (data) => {
      const { recipient, message, nickname } = data;
      for (const [socketId, user] of Object.entries(users)) {
        if (user === recipient) {
          io.to(socketId).emit("privateMessage", { nickname, message });
          break;
        }
      }
    });

    socket.on("typing", (nickname) => {
      socket.broadcast.emit("typing", nickname);
    });

    socket.on("stopTyping", () => {
      socket.broadcast.emit("stopTyping");
    });

    socket.on("disconnect", () => {
      const nickname = users[socket.id];
      if (nickname) {
        socket.broadcast.emit("chatMessage", {
          nickname: "Server",
          message: `${nickname} has left the chat!`,
        });
        delete users[socket.id];
        io.emit("onlineUsers", Object.values(users));
      }
    });
  });
}

module.exports = { initializeSocket };
