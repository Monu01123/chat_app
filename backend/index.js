const express = require("express");
const http = require("http");
const cors = require("cors");
const { initializeSocket } = require("./socket.io");
const dotenv = require("dotenv");
const connectDB = require("./db");
const user = require("./src/Routes/user.route");

dotenv.config();
const app = express();
// const server = http.createServer(app);
connectDB();

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/", user);

// initializeSocket(server);

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
