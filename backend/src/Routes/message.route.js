const express = require("express");
const Router = express.Router();
const { sendMessage,getUsersForSidebar,getMessages } = require("../Controllers/message.controller");
const protectRoute = require("../middleware/auth.middleware");

Router.post("/send-message/:id",protectRoute,sendMessage);

Router.get("/get-users",protectRoute,getUsersForSidebar);

Router.get("/get-messages/",protectRoute,getMessages);

module.exports = Router;
