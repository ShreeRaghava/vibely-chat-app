import mongoose from 'mongoose';

const ChatSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  messages: [{
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  }],
  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date },
  roomId: { type: String, required: true, unique: true },
  location: { type: String, default: '' },
  gender: { type: String, default: '' },
});

export default mongoose.models.Chat || mongoose.model('Chat', ChatSchema);