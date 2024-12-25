const express = require("express");
const Router = express.Router();
const { sendMessages } = require("../Controllers/message.controller");

Router.post("/send-message",sendMessages);

Router.get("/get-messages", (req, res) => {
  res.send("Messages retrieved successfully");
});

module.exports = Router;
