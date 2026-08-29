import { Router } from 'express';
import multer from 'multer';
import path from 'path';

const router = Router();

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, 'video-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 } // 500MB limit
});

router.post('/', (req: any, res: any, next: any) => {
  upload.single('video')(req, res, (err: any) => {
    if (err) {
      // Multer-specific errors (file too large, wrong field, etc.)
      console.error('[Upload] Multer error:', err.message);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ error: 'File too large. Maximum size is 500MB.' });
      }
      return res.status(400).json({ error: `Upload error: ${err.message}` });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No video file uploaded. Make sure the field name is "video".' });
    }

    res.json({
      message: 'Upload successful',
      fileId: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      url: `/uploads/${req.file.filename}`
    });
  });
});

export default router;
