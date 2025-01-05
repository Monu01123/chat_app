const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  sender: String,
  recipient: String,
  content: String,
  type: { type: String, default: 'text' },
  fileUrl: String,
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Message", messageSchema);
