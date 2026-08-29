import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import { FfmpegService } from '../services/ffmpegService';
import { generateAssSubtitles } from '../utils/assGenerator';

const router = Router();

router.post('/', async (req: any, res: any) => {
  const { fileId, cues, style } = req.body;
  if (!fileId || !cues || !style) {
    return res.status(400).json({ error: 'Missing required parameters: fileId, cues, or style' });
  }

  const videoPath = path.join(__dirname, '../../uploads', fileId);
  if (!fs.existsSync(videoPath)) {
    return res.status(404).json({ error: 'Source video file not found' });
  }

  const uniqueId = Date.now();
  const assPath = path.join(__dirname, '../../outputs', `subtitles-${uniqueId}.ass`);
  const outputPath = path.join(__dirname, '../../outputs', `render-${uniqueId}.mp4`);

  try {
    console.log(`[Render] Generating ASS subtitles style contents...`);
    // 1. Generate the ASS subtitles file contents
    const assContent = generateAssSubtitles(cues, style);

    // 2. Save the ASS subtitles file
    fs.writeFileSync(assPath, assContent, 'utf8');
    console.log(`[Render] ASS subtitle file saved to disk.`);

    // 3. Burn the subtitles in using FFmpeg
    console.log(`[Render] Invoking FFmpeg to burn subtitles into video (Ratio: ${style.aspectRatio || '1:1'})...`);
    await FfmpegService.burnSubtitles(videoPath, assPath, outputPath, style.aspectRatio || '1:1');

    // 4. Clean up the temp ASS file
    if (fs.existsSync(assPath)) {
      try {
        fs.unlinkSync(assPath);
        console.log(`[Render] Temporary ASS file cleaned up.`);
      } catch (err) {
        console.error('[Render] Error deleting temporary ASS file:', err);
      }
    }

    // 5. Respond with download path
    res.json({
      message: 'Video rendering complete',
      downloadUrl: `/outputs/render-${uniqueId}.mp4`,
      filename: `render-${uniqueId}.mp4`
    });
  } catch (error: any) {
    console.error('[Render Error]', error);
    // Clean up ASS if it still exists
    if (fs.existsSync(assPath)) {
      try {
        fs.unlinkSync(assPath);
      } catch (e) {}
    }
    res.status(500).json({ error: error.message || 'Rendering failed' });
  }
});

export default router;
