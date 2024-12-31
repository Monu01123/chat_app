const Router = require("express").Router();
const { register, login, logout,checkAuth } = require("../Controllers/user.controller");
const protectRoute = require("../middleware/auth.middleware");

Router.post("/register", register);

Router.post("/login", login);

Router.post("/update-profile", login);

Router.post("/logout", logout);

Router.get("/check", protectRoute, checkAuth);

module.exports = Router;
