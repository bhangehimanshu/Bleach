import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import { FfmpegService } from '../services/ffmpegService';
import { SttService } from '../services/sttService';
import { groupWordsIntoCues } from '../utils/captionUtils';

const router = Router();

router.post('/', async (req: any, res: any) => {
  // Long-running route: extend socket timeout to 10 minutes for large video transcription
  req.socket.setTimeout(10 * 60 * 1000);
  res.setTimeout(10 * 60 * 1000);

  const { fileId, trimStart, trimEnd } = req.body;
  if (!fileId) {
    return res.status(400).json({ error: 'Missing fileId parameter' });
  }

  const videoPath = path.join(__dirname, '../../uploads', fileId);
  if (!fs.existsSync(videoPath)) {
    return res.status(404).json({ error: 'Video file not found' });
  }

  // Determine whether to trim first
  const hasTrim = typeof trimStart === 'number' && typeof trimEnd === 'number' && trimEnd > trimStart;
  const uniqueId = Date.now();
  const trimmedFileId = `video-trimmed-${uniqueId}.mp4`;
  const trimmedPath = path.join(__dirname, '../../uploads', trimmedFileId);

  // The path we'll actually extract audio from (trimmed copy or original)
  let sourceVideoPath = videoPath;

  // Extract file extension and base name
  const fileBasename = path.basename(fileId, path.extname(fileId));
  const audioPath = path.join(__dirname, '../../uploads', `audio-${fileBasename}-${uniqueId}.mp3`);

  try {
    // 0. If trim params provided, cut the video first (stream-copy, near-instant)
    if (hasTrim) {
      console.log(`[Transcribe] Trimming video from ${trimStart}s to ${trimEnd}s -> ${trimmedFileId}...`);
      await FfmpegService.trimVideo(videoPath, trimmedPath, trimStart, trimEnd);
      sourceVideoPath = trimmedPath;
    }

    console.log(`[Transcribe] Starting audio extraction for ${sourceVideoPath}...`);
    // 1. Extract audio from (trimmed) video
    await FfmpegService.extractAudio(sourceVideoPath, audioPath);

    console.log(`[Transcribe] Probing video duration...`);
    // 2. Get duration of the (trimmed) source
    const duration = await FfmpegService.getDuration(sourceVideoPath);

    console.log(`[Transcribe] Running STT transcription...`);
    // 3. Transcribe audio to word timestamps
    const words = await SttService.transcribe(audioPath, duration);

    // 4. Clean up temporary audio file
    if (fs.existsSync(audioPath)) {
      try { fs.unlinkSync(audioPath); console.log(`[Transcribe] Temporary audio file deleted.`); }
      catch (err) { console.error('[Transcribe] Error deleting temporary audio file:', err); }
    }

    console.log(`[Transcribe] Grouping ${words.length} words into timed cues...`);
    // 5. Group words into CaptionCues
    const cues = groupWordsIntoCues(words);

    const activeFileId = hasTrim ? trimmedFileId : fileId;
    console.log(`[Transcribe] Done. Active video file: ${activeFileId}, duration: ${duration}s, generated ${cues.length} cues.`);
    res.json({
      message: 'Transcription and cue generation successful',
      fileId: activeFileId,
      videoUrl: `/uploads/${activeFileId}`,
      duration,
      cues
    });
  } catch (error: any) {
    console.error('[Transcription Error]', error);
    // Clean up audio if it still exists
    if (fs.existsSync(audioPath)) { try { fs.unlinkSync(audioPath); } catch (e) {} }
    // Clean up trimmed video if error occurred
    if (hasTrim && fs.existsSync(trimmedPath)) { try { fs.unlinkSync(trimmedPath); } catch (e) {} }
    res.status(500).json({ error: error.message || 'Failed during transcription' });
  }
});

export default router;
