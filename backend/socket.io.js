const { Server } = require("socket.io");
const Message = require("./src/models/message.model");

const activeUsers = new Map();

const socketHandler = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("join", async (username) => {
      activeUsers.set(username, socket.id);
      io.emit("activeUsers", Array.from(activeUsers.keys()));

      const messages = await Message.find({
        recipient: username,
      }).sort("timestamp");
      io.to(socket.id).emit("loadOldMessages", messages);
    });

    socket.on(
      "message",
      async ({ sender, recipient, content, type, fileUrl }) => {
        const message = new Message({
          sender,
          recipient,
          content,
          type,
          fileUrl,
        });
        await message.save();

        if (activeUsers.has(recipient)) {
          io.to(activeUsers.get(recipient)).emit("newMessage", message);
        }
        io.to(socket.id).emit("newMessage", message);
      }
    );

    socket.on("disconnect", () => {
      const username = Array.from(activeUsers.keys()).find(
        (key) => activeUsers.get(key) === socket.id
      );
      if (username) {
        activeUsers.delete(username);
        io.emit("activeUsers", Array.from(activeUsers.keys()));
      }
      console.log("A user disconnected");
    });
  });
};

module.exports = { socketHandler };
