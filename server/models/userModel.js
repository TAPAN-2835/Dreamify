import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  creditBalance: { type: Number, default: 5 },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  stripeCustomerId: { type: String, default: null },
  lastActiveAt: { type: Date, default: Date.now },
  creditsExpiresAt: { type: Date, default: null },
}, { timestamps: true });

const userModel = mongoose.models.user || mongoose.model('user', userSchema);
export default userModel;