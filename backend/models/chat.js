const mongoose = require('mongoose');

const chatSchema = mongoose.Schema({
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  messages: [
    {
      sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      content: { type: String },
      createdAt: { type: Date, default: Date.now },
    },
  ],
});

module.exports = mongoose.model('Chat', chatSchema);
