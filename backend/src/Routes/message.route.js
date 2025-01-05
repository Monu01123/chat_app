const express = require("express");
const message = require("../models/message.model");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

const app = express();

cloudinary.config({
  cloud_name: "dp7mm7aog",
  api_key: "398632473657626",
  api_secret: "j2OHBWj0NXx11FlCiAhKPtI4vjI",
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'chat-app', 
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'], 
  },
});
const upload = multer({ storage });


app.get("/messages", async (req, res) => {
  const { sender, recipient } = req.query;
  try {
    const messages = await Message.find({
      $or: [
        { sender, recipient },
        { sender: recipient, recipient: sender },
      ],
    }).sort("timestamp");
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).send("Error fetching messages");
  }
});

app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file || !req.file.path) {
    return res.status(400).send("No file uploaded");
  }
  res.status(200).json({ fileUrl: req.file.path }); // Cloudinary URL
});

module.exports = app;
