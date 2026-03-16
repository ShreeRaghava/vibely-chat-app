import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // For email/password auth
  image: { type: String },
  guestId: { type: String, unique: true, sparse: true }, // For guest users
  isPremium: { type: Boolean, default: false },
  premiumPlan: { type: String, enum: ['location', 'premium'] },
  premiumExpiry: { type: Date },
  autoRenew: { type: Boolean, default: false },
  razorpayPaymentId: { type: String },
  chatsCount: { type: Number, default: 0 },
  reportsReceived: { type: Number, default: 0 },
  banned: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model('User', UserSchema);