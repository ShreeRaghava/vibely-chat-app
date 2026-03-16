import mongoose from 'mongoose';

const MatchRequestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  roomId: { type: String, required: true, unique: true },
  gender: { type: String, default: '' },
  location: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

MatchRequestSchema.index({ location: 1, gender: 1 });

export default mongoose.models.MatchRequest || mongoose.model('MatchRequest', MatchRequestSchema);
