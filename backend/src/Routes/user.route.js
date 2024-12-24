const Router = require('express').Router();
const { register,login,logout } = require('../Controllers/user.controller');

Router.post('/register', register);

Router.post("/login", login);

Router.post("/update-profile", login);

Router.post("/logout",logout);
//sorry i am going home today

module.exports = Router;