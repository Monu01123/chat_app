
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

// MongoDB Models
const User = mongoose.model('User', new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
}));

const Message = mongoose.model('Message', new mongoose.Schema({
  sender: String,
  recipient: String,
  content: String,
  timestamp: { type: Date, default: Date.now },
}));

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect('mongodb://localhost/chat-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Routes
app.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.status(201).send('User registered successfully');
  } catch (err) {
    res.status(400).send('Error registering user');
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).send('Invalid credentials');
    }
    const token = jwt.sign({ username }, 'secretkey');
    res.status(200).json({ token });
  } catch (err) {
    res.status(400).send('Error logging in');
  }
});

app.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('username -_id');
    res.status(200).json(users);
  } catch (err) {
    res.status(500).send('Error fetching users');
  }
});

app.get('/messages', async (req, res) => {
  const { sender, recipient } = req.query;
  try {
    const messages = await Message.find({
      $or: [
        { sender, recipient },
        { sender: recipient, recipient: sender },
      ],
    }).sort('timestamp');
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).send('Error fetching messages');
  }
});

// Socket.IO Connection
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

  socket.on('message', async ({ sender, recipient, content }) => {
    const message = new Message({ sender, recipient, content });
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

// Start Server
server.listen(3000, () => {
  console.log('Server is running on port 3000');
});