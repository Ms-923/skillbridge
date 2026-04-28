import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Contributor', 'Organization'], required: true },
  skills: [{ type: String }],
  availability: { type: Number, default: 0 }, // hours/week
  interests: [{ type: String }],
  points: { type: Number, default: 0 },
  badges: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
});

export const User =
  ((mongoose.models.User as any) || mongoose.model('User', userSchema)) as any;
