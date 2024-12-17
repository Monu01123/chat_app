import { Schema, model } from 'mongoose';

const messageSchema = Schema({
  sender: { type: Schema.Types.ObjectId, ref: 'User' },
  content: { type: String, required: true },
  chat: { type: Schema.Types.ObjectId, ref: 'Chat' },
}, { timestamps: true });

export default model('Message', messageSchema);
