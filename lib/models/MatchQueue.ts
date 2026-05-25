import mongoose from 'mongoose';

const MatchQueueSchema = new mongoose.Schema({
  // Queue identifier - based on chatType and preferences
  queueKey: { type: String, required: true, index: true },
  
  // First person waiting (creates the room)
  userId: { type: String, required: true },
  userType: { type: String, enum: ['user', 'guest'], required: true },
  
  // The room ID created by first person
  roomId: { type: String, required: true, index: true },
  
  // When they joined queue
  createdAt: { type: Date, default: Date.now, expires: 120 }, // Auto-delete after 120 seconds
});

// Ensure unique constraint on queueKey and userId so same person can't be in queue twice
MatchQueueSchema.index({ queueKey: 1, userId: 1 }, { unique: true });

export default mongoose.models.MatchQueue || mongoose.model('MatchQueue', MatchQueueSchema);
