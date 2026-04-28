import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from './models/User.ts';
import { Task } from './models/Task.ts';
import { connectToDatabase, getDatabaseStatus } from './db.ts';

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'secret_key';

app.use(express.json());

app.get('/api/health', async (req, res) => {
  try {
    await connectToDatabase();
  } catch {
    // Health still returns status details even when DB is unavailable.
  }

  const db = getDatabaseStatus();
  res.json({
    status: 'ok',
    db: db.status,
    mongoUriSet: db.mongoUriSet,
  });
});

app.use('/api', async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error: any) {
    const db = getDatabaseStatus();
    res.status(503).json({
      error: `Database is ${db.status}. Check MONGO_URI in your deployment environment.`,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

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

app.all('/api/*', (req, res) => {
  res.status(404).json({ error: `API route ${req.method} ${req.url} not found` });
});

app.use((err: any, req: any, res: any, next: any) => {
  if (!req.path.startsWith('/api')) {
    return next(err);
  }

  console.error('API Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

export default app;
