import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import usersRouter from './routes/users.js';
import authRouter from './routes/auth.js';

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(morgan('dev'));

// CORS
const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
app.use(
  cors({
    origin: allowedOrigin,
    credentials: false,
  })
);

// Health
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'waste-management-server' });
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);

// Start
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.warn('Missing MONGODB_URI in environment - running without database');
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT} (No Database)`);
  });
} else {
  mongoose
    .connect(MONGODB_URI)
    .then(() => {
      console.log('✅ Connected to MongoDB');
      app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
      });
    })
    .catch((err) => {
      console.error('❌ MongoDB connection error:', err);
      console.warn('⚠️  Falling back to no-database mode');
      app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT} (No Database)`);
      });
    });
}