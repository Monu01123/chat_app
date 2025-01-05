const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const path = require('path');
const connectDb = require('./db');
const Message = require('./src/models/message.model');
const User = require('./src/models/user.model');
const UserApp = require('./src/Routes/user.route');
const MessageApp = require('./src/Routes/message.route');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

app.use(cors());
app.use(express.json());
connectDb();
app.use('/', UserApp);
app.use('/', MessageApp);

const activeUsers = new Map();

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('join', async (username) => {
    activeUsers.set(username, socket.id);
    io.emit('activeUsers', Array.from(activeUsers.keys()));

    const messages = await Message.find({
      recipient: username
    }).sort('timestamp');
    io.to(socket.id).emit('loadOldMessages', messages);
  });

  socket.on('message', async ({ sender, recipient, content, type, fileUrl }) => {
    const message = new Message({ sender, recipient, content, type, fileUrl });
    await message.save();

    if (activeUsers.has(recipient)) {
      io.to(activeUsers.get(recipient)).emit('newMessage', message);
    }
    io.to(socket.id).emit('newMessage', message);
  });

  socket.on('disconnect', () => {
    const username = Array.from(activeUsers.keys()).find(
      (key) => activeUsers.get(key) === socket.id
    );
    if (username) {
      activeUsers.delete(username);
      io.emit('activeUsers', Array.from(activeUsers.keys()));
    }
    console.log('A user disconnected');
  });
});


server.listen(3000, () => {
  console.log('Server is running on port 3000');
});
