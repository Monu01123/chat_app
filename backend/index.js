const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const cors = require('cors');
const connectDb = require('./db');
const UserApp = require('./src/Routes/user.route');
const MessageApp = require('./src/Routes/message.route');
const { socketHandler } = require('./socket.io'); 

const app = express();
const server = http.createServer(app);


app.use(cors());
app.use(express.json());

connectDb();

app.use('/', UserApp);
app.use('/', MessageApp);

server.listen(3000, () => {
  console.log('Server is running on port 3000');
});

socketHandler(server);
