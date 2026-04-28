import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from './server/models/User.ts';
import { Task } from './server/models/Task.ts';

dotenv.config();

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'secret_key';

app.use(express.json());

// Database Connection
const MONGO_URI = process.env.MONGO_URI;
mongoose.set('bufferCommands', false); // Fail fast instead of buffering for 10s

if (MONGO_URI && MONGO_URI !== 'PASTE_ATLAS_CONNECTION_STRING') {
  mongoose.connect(MONGO_URI)
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch(err => console.error('MongoDB connection error:', err));
} else {
  console.warn('MONGO_URI not provided or placeholder. Database features will fail.');
}

// Helper to check DB connection
const checkDbConnection = (req: any, res: any, next: any) => {
  if (mongoose.connection.readyState !== 1) {
    const status = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    }[mongoose.connection.readyState];
    
    return res.status(503).json({ 
      error: `Database is ${status}. Possible reasons: 1. MONGO_URI is not working.` 
    });
  }
  next();
};

// API ROUTES
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    mongoUriSet: !!MONGO_URI && MONGO_URI !== 'PASTE_ATLAS_CONNECTION_STRING'
  });
});

app.use('/api', checkDbConnection);

// Auth Middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, role });
    await user.save();
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET);
    res.status(201).json({ token, user: { id: user._id, name: user.name, role: user.role } });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET);
    res.json({ token, user: { id: user._id, name: user.name, role: user.role } });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// User Profile
app.get('/api/users/profile', authenticateToken, async (req: any, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/users/profile', authenticateToken, async (req: any, res) => {
  try {
    const { skills, availability, interests } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { skills, availability, interests },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Task Routes
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await Task.find({ status: 'Open' }).populate('createdBy', 'name');
    res.json(tasks);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/tasks', authenticateToken, async (req: any, res) => {
  if (req.user.role !== 'Organization') return res.sendStatus(403);
  try {
    const task = new Task({ ...req.body, createdBy: req.user.id });
    await task.save();
    res.status(201).json(task);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/tasks/:id/apply', authenticateToken, async (req: any, res) => {
  if (req.user.role !== 'Contributor') return res.sendStatus(403);
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    if (!task.applicants.includes(req.user.id)) {
      task.applicants.push(req.user.id);
      await task.save();
    }
    res.json(task);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Organization: Approve Application
app.post('/api/tasks/:taskId/approve/:userId', authenticateToken, async (req: any, res) => {
  if (req.user.role !== 'Organization') return res.sendStatus(403);
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task || task.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    task.assignedTo = req.params.userId as any;
    task.status = 'In Progress';
    await task.save();
    res.json(task);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Complete Task and Award Points
app.post('/api/tasks/:id/complete', authenticateToken, async (req: any, res) => {
  if (req.user.role !== 'Organization') return res.sendStatus(403);
  try {
    const task = await Task.findById(req.params.id);
    if (!task || task.createdBy.toString() !== req.user.id) {
       return res.status(403).json({ error: 'Not authorized' });
    }
    task.status = 'Completed';
    await task.save();

    if (task.assignedTo) {
      const points = task.impactLevel === 'High' ? 20 : 10;
      const user = await User.findById(task.assignedTo);
      if (user) {
        user.points += points;
        // Basic Badge Logic
        if (user.points >= 10 && !user.badges.includes('Starter')) user.badges.push('Starter');
        if (user.points >= 50 && !user.badges.includes('Impact Maker')) user.badges.push('Impact Maker');
        if (user.points >= 100 && !user.badges.includes('Top Contributor')) user.badges.push('Top Contributor');
        await user.save();
      }
    }
    res.json(task);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Leaderboard
app.get('/api/leaderboard', async (req, res) => {
  try {
    const users = await User.find({ role: 'Contributor' })
      .sort({ points: -1 })
      .limit(10)
      .select('name points badges');
    res.json(users);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 404 for API routes to avoid returning HTML from SPA fallback
app.all('/api/*', (req, res) => {
  res.status(404).json({ error: `API route ${req.method} ${req.url} not found` });
});

// Global API Error Handler
app.use('/api/*', (err: any, req: any, res: any, next: any) => {
  console.error('API Error:', err);
  res.status(err.status || 500).json({ 
    error: err.message || 'Internal Server Error',
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Vite Middleware
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
