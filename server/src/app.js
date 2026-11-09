import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import { ZodError } from 'zod';
import { config } from './config.js';
import authRoutes from './routes/auth.js';
import credentialRoutes from './routes/credentials.js';
import verifyRoutes from './routes/verify.js';
import dashboardRoutes from './routes/dashboard.js';

export function createApp() {
  const app = express();
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(cors({ origin: [config.clientUrl, 'http://127.0.0.1:5173'] }));
  app.use(express.json({ limit: '50kb' }));
  if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    });
  });

  app.use('/api/auth/login', rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false }));
  app.use('/api/verify', rateLimit({ windowMs: 60 * 1000, limit: 60, standardHeaders: true, legacyHeaders: false }));

  app.use('/api/auth', authRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/credentials', credentialRoutes);
  app.use('/api/verify', verifyRoutes);

  app.use('/api', (_req, res) => res.status(404).json({ message: 'Not found' }));

  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    if (err instanceof ZodError) {
      const fields = Object.fromEntries(err.issues.map((i) => [i.path.join('.'), i.message]));
      return res.status(400).json({ message: 'Please check the highlighted fields.', fields });
    }
    if (err.name === 'MongoServerSelectionError' || err.name === 'MongooseServerSelectionError') {
      return res.status(503).json({ message: 'Database unavailable. Check MONGODB_URI and your Atlas IP access list.' });
    }
    if (err.status) return res.status(err.status).json({ message: err.message });
    console.error(err);
    res.status(500).json({ message: 'Something went wrong on the server.' });
  });
  return app;
}
