const Router = require("express").Router();
const { register, login, logout } = require("../Controllers/user.controller");
const protectRoute = require("../middleware/auth.middleware");

Router.post("/register", register);

Router.post("/login", login);

Router.post("/update-profile", login);

Router.post("/logout", logout);

module.exports = Router;
