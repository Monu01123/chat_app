import { Server } from "socket.io";
import http from "http";
import express from "express";
import Message from "../models/message.model.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      callback(null, true);
    },
    methods: ["GET", "POST"],
  },
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// used to store online users
const userSocketMap = {}; // {userId: socketId}

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;

  // io.emit() is used to send events to all the connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });

  socket.on("joinChat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });

  socket.on("typing", ({ receiverId, chatId }) => {
    // If chatId is present, emit to the room
    if (chatId) {
       socket.in(chatId).emit("typing", { userId, chatId });
    } else {
       // Old logic for 1-1
       const receiverSocketId = getReceiverSocketId(receiverId);
       if (receiverSocketId) {
         io.to(receiverSocketId).emit("typing", { userId });
       }
    }
  });

  socket.on("stopTyping", ({ receiverId, chatId }) => {
    if (chatId) {
       socket.in(chatId).emit("stopTyping", { userId, chatId });
    } else {
       const receiverSocketId = getReceiverSocketId(receiverId);
       if (receiverSocketId) {
         io.to(receiverSocketId).emit("stopTyping", { userId });
       }
    }
  });

  socket.on("newGroupMessage", (newMessageReceived) => {
    var chat = newMessageReceived.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageReceived.sender._id) return;

      // If user is in the room (we rely on client emitting 'joinChat'), socket.in(chat._id).emit SHOULD work
      // effectively, but here we might want to emit to specific sockets if we rely on userSocketMap
      // For simplicity/robustness in this hybrid approach:
      const userSocketId = getReceiverSocketId(user._id);
      if (userSocketId) {
          io.to(userSocketId).emit("message received", newMessageReceived);
      }
    });
  });

  socket.on("markMessagesAsRead", async ({ senderId, chatId }) => {
    const userId = socket.handshake.query.userId;
    
    if (chatId) {
        // Group Logic: Add user to readBy array
        // We only want to mark messages that are NOT sent by this user
        await Message.updateMany(
          { chat: chatId, senderId: { $ne: userId } },
          { $addToSet: { readBy: userId } }
        );
    } else {
        await Message.updateMany(
          { senderId: senderId, receiverId: userId, status: { $ne: "read" } },
          { $set: { status: "read" } }
        );
    }

    const senderSocketId = getReceiverSocketId(senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("messagesRead", { userId, chatId }); 
    }
  });
});

export { io, app, server };
