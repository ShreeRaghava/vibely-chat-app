import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // For email/password auth
  image: { type: String },
  guestId: { type: String, unique: true, sparse: true }, // For guest users
  location: { type: String, default: '' }, // User's location for matching
  gender: { type: String, default: '' }, // male, female, or other
  cameraPermission: { type: Boolean, default: false }, // Camera access granted
  locationPermission: { type: Boolean, default: false }, // Location access granted
  chatsCount: { type: Number, default: 0 },
  reportsReceived: { type: Number, default: 0 },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  banned: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model('User', UserSchema);