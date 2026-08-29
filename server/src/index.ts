import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables explicitly from server/.env (Keys Loaded)
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config(); // Fallback to root .env




const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Ensure uploads and outputs directories exist
const UPLOADS_DIR = path.join(__dirname, '../uploads');
const OUTPUTS_DIR = path.join(__dirname, '../outputs');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
if (!fs.existsSync(OUTPUTS_DIR)) {
  fs.mkdirSync(OUTPUTS_DIR, { recursive: true });
}

// Serve static rendered files
app.use('/outputs', express.static(OUTPUTS_DIR));
app.use('/uploads', express.static(UPLOADS_DIR));

// Import routes
import uploadRouter from './routes/upload';
import transcribeRouter from './routes/transcribe';
import renderRouter from './routes/render';

app.use('/api/upload', uploadRouter);
app.use('/api/transcribe', transcribeRouter);
app.use('/api/render', renderRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Bleach server is running smoothly.' });
});

// Serve static client assets if client/dist exists
const CLIENT_DIST_DIR = path.join(__dirname, '../../client/dist');
if (fs.existsSync(CLIENT_DIST_DIR)) {
  console.log(`[Bleach Server] Serving client static assets from ${CLIENT_DIST_DIR}`);
  app.use(express.static(CLIENT_DIST_DIR));
  
  // SPA routing fallback (direct index.html response for client-side routing)
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path.startsWith('/outputs')) {
      return next();
    }
    res.sendFile(path.join(CLIENT_DIST_DIR, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`[Bleach Server] Running on http://localhost:${PORT}`);
});

