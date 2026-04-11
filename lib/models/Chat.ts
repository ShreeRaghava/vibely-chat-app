import mongoose from 'mongoose';

const ChatSchema = new mongoose.Schema({
  participants: [{ type: String }],
  messages: [{
    sender: { type: String },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  }],
  peerIds: [{
    senderId: { type: String },
    peerId: { type: String },
  }],
  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date },
  roomId: { type: String, required: true, unique: true },
  location: { type: String, default: '' },
  gender: { type: String, default: '' },
});

export default mongoose.models.Chat || mongoose.model('Chat', ChatSchema);