const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const app = express();

app.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.status(201).send("User registered successfully");
  } catch (err) {
    res.status(400).send("Error registering user");
  }
});


app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user || !bcrypt.compare(password, user.password)) {
      return res.status(401).send("Invalid credentials");
    }
    const token = jwt.sign({ username }, process.env.JWT_SECRET);
    res.status(200).json({ token });
  } catch (err) {
    res.status(400).send("Error logging in");
  }
});

app.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("username -_id");
    res.status(200).json(users);
  } catch (err) {
    res.status(500).send("Error fetching users");
  }
});

module.exports = app;
