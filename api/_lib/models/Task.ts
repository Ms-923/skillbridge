import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  requiredSkills: [{ type: String }],
  duration: { type: String, required: true },
  impactLevel: { type: String, enum: ['Low', 'Medium', 'High'], required: true },
  isMicroTask: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['Open', 'In Progress', 'Submitted', 'Completed'], default: 'Open' },
  createdAt: { type: Date, default: Date.now },
});

export const Task =
  ((mongoose.models.Task as any) || mongoose.model('Task', taskSchema)) as any;
