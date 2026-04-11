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
  callStatus: { type: String, enum: ['idle', 'calling', 'active', 'declined'], default: 'idle' },
  callInitiatedBy: { type: String, default: '' },
  callAcceptedBy: { type: String, default: '' },
  callStartedAt: { type: Date },
});

export default mongoose.models.Chat || mongoose.model('Chat', ChatSchema);