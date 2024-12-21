const Router = require('express').Router();
const { register,login } = require('../controllers/user.controller');

Router.post('/register', register);

Router.post("/login", login);

Router.post("/update-profile", login);

module.exports = Router;