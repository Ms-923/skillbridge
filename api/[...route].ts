import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from './_lib/models/User.ts';
import { Task } from './_lib/models/Task.ts';
import { connectToDatabase, getDatabaseStatus } from './_lib/db.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key';

function sendJson(res: any, status: number, payload: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

async function readJsonBody(req: any) {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }

  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

function getTokenPayload(req: any) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return null;
  }

  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch {
    return null;
  }
}

export default async function handler(req: any, res: any) {
  const url = String(req.url || '');
  const pathname = url.split('?')[0];
  const method = String(req.method || 'GET').toUpperCase();

  if (pathname === '/api/health') {
    return sendJson(res, 200, {
      status: 'ok',
      runtime: 'vercel',
      api: 'reachable',
      mongoUriSet: Boolean(process.env.MONGO_URI),
      jwtSecretSet: Boolean(process.env.JWT_SECRET),
    });
  }

  try {
    await connectToDatabase();
  } catch (error: any) {
    const db = getDatabaseStatus();
    return sendJson(res, 503, {
      error: `Database is ${db.status}. Check MONGO_URI in your deployment environment.`,
      details: error?.message,
    });
  }

  try {
    if (pathname === '/api/auth/register' && method === 'POST') {
      const { name, email, password, role } = await readJsonBody(req);
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({ name, email, password: hashedPassword, role });
      await user.save();
      const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET);
      return sendJson(res, 201, {
        token,
        user: { id: user._id, name: user.name, role: user.role },
      });
    }

    if (pathname === '/api/auth/login' && method === 'POST') {
      const { email, password } = await readJsonBody(req);
      const user = await User.findOne({ email });
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return sendJson(res, 401, { error: 'Invalid credentials' });
      }
      const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET);
      return sendJson(res, 200, {
        token,
        user: { id: user._id, name: user.name, role: user.role },
      });
    }

    if (pathname === '/api/users/profile' && method === 'GET') {
      const auth = getTokenPayload(req);
      if (!auth) return sendJson(res, 401, { error: 'Unauthorized' });
      const user = await User.findById(auth.id).select('-password');
      return sendJson(res, 200, user);
    }

    if (pathname === '/api/users/profile' && method === 'PUT') {
      const auth = getTokenPayload(req);
      if (!auth) return sendJson(res, 401, { error: 'Unauthorized' });
      const { skills, availability, interests } = await readJsonBody(req);
      const user = await User.findByIdAndUpdate(
        auth.id,
        { skills, availability, interests },
        { new: true }
      ).select('-password');
      return sendJson(res, 200, user);
    }

    if (pathname === '/api/tasks' && method === 'GET') {
      const tasks = await Task.find({ status: 'Open' }).populate('createdBy', 'name');
      return sendJson(res, 200, tasks);
    }

    if (pathname === '/api/tasks' && method === 'POST') {
      const auth = getTokenPayload(req);
      if (!auth) return sendJson(res, 401, { error: 'Unauthorized' });
      if (auth.role !== 'Organization') return sendJson(res, 403, { error: 'Forbidden' });
      const body = await readJsonBody(req);
      const task = new Task({ ...body, createdBy: auth.id });
      await task.save();
      return sendJson(res, 201, task);
    }

    if (pathname === '/api/leaderboard' && method === 'GET') {
      const users = await User.find({ role: 'Contributor' })
        .sort({ points: -1 })
        .limit(10)
        .select('name points badges');
      return sendJson(res, 200, users);
    }

    const applyMatch = pathname.match(/^\/api\/tasks\/([^/]+)\/apply$/);
    if (applyMatch && method === 'POST') {
      const auth = getTokenPayload(req);
      if (!auth) return sendJson(res, 401, { error: 'Unauthorized' });
      if (auth.role !== 'Contributor') return sendJson(res, 403, { error: 'Forbidden' });
      const task = await Task.findById(applyMatch[1]);
      if (!task) return sendJson(res, 404, { error: 'Task not found' });
      if (!task.applicants.includes(auth.id)) {
        task.applicants.push(auth.id);
        await task.save();
      }
      return sendJson(res, 200, task);
    }

    const approveMatch = pathname.match(/^\/api\/tasks\/([^/]+)\/approve\/([^/]+)$/);
    if (approveMatch && method === 'POST') {
      const auth = getTokenPayload(req);
      if (!auth) return sendJson(res, 401, { error: 'Unauthorized' });
      if (auth.role !== 'Organization') return sendJson(res, 403, { error: 'Forbidden' });
      const task = await Task.findById(approveMatch[1]);
      if (!task || task.createdBy.toString() !== auth.id) {
        return sendJson(res, 403, { error: 'Not authorized' });
      }
      task.assignedTo = approveMatch[2] as any;
      task.status = 'In Progress';
      await task.save();
      return sendJson(res, 200, task);
    }

    const completeMatch = pathname.match(/^\/api\/tasks\/([^/]+)\/complete$/);
    if (completeMatch && method === 'POST') {
      const auth = getTokenPayload(req);
      if (!auth) return sendJson(res, 401, { error: 'Unauthorized' });
      if (auth.role !== 'Organization') return sendJson(res, 403, { error: 'Forbidden' });
      const task = await Task.findById(completeMatch[1]);
      if (!task || task.createdBy.toString() !== auth.id) {
        return sendJson(res, 403, { error: 'Not authorized' });
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

      return sendJson(res, 200, task);
    }

    return sendJson(res, 404, { error: `API route ${method} ${pathname} not found` });
  } catch (error: any) {
    console.error('API handler error:', error);
    return sendJson(res, 500, {
      error: 'Internal Server Error',
      details: error?.message || 'Unknown server error',
    });
  }
}
