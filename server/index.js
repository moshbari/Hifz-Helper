import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
// Routes
import transcribeRoutes from './routes/transcribe.js';
import verifyRoutes from './routes/verify.js';
import quranRoutes from './routes/quran.js';
import attemptsRoutes from './routes/attempts.js';
import authRoutes from './routes/auth.js';
import audioRoutes from './routes/audio.js';

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3001;
// Trust proxy for Railway (MUST be before other middleware)
app.set('trust proxy', 1);
// Health check FIRST - before any other middleware
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});
// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
}));
// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
}));
// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
  validate: { xForwardedForHeader: false }
});
app.use('/api/', limiter);
// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/transcribe', transcribeRoutes);
app.use('/api/verify', verifyRoutes);
app.use('/api/quran', quranRoutes);
app.use('/api/attempts', attemptsRoutes);
app.use('/api/audio', audioRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const clientPath = path.join(__dirname, '../client/dist');
  app.use(express.static(clientPath));
  
  // Handle client-side routing - serve index.html for non-API routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientPath, 'index.html'));
  });
}
// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});
// Start server and keep it alive
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('Server running on port ' + PORT);
  console.log('Hifz Helper API ready');
});
// Handle shutdown gracefully
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
