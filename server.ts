import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import app from './server/app.ts';
import { connectToDatabase } from './server/db.ts';

dotenv.config();

const PORT = Number(process.env.PORT || 3000);

// Vite Middleware
async function startServer() {
  try {
    await connectToDatabase();
    console.log('Connected to MongoDB Atlas');
  } catch (error: any) {
    console.warn('MongoDB connection not ready:', error.message);
  }

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
