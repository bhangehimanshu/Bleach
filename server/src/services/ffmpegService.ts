import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';

export class FfmpegService {
  /**
   * Extracts the audio track from a video file and saves it as an MP3.
   * @param videoPath Absolute path to the source video file
   * @param audioOutputPath Absolute path where the output audio file will be written
   */
  static extractAudio(videoPath: string, audioOutputPath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      // -y to overwrite if file exists
      // -vn to disable video recording
      // -acodec libmp3lame to encode as MP3
      // -q:a 2 for VBR audio quality ~192kbps
      const cmd = `ffmpeg -y -i "${videoPath}" -vn -acodec libmp3lame -q:a 2 "${audioOutputPath}"`;
      
      console.log(`[FFmpeg] Extracting audio: ${cmd}`);
      exec(cmd, (error, stdout, stderr) => {
        if (error) {
          console.error('[FFmpeg Error]', error, stderr);
          return reject(new Error(`Failed to extract audio: ${error.message}`));
        }
        console.log(`[FFmpeg] Audio extracted successfully to ${audioOutputPath}`);
        resolve(audioOutputPath);
      });
    });
  }

  /**
   * Probes the duration of a media file (video or audio) in seconds using FFmpeg.
   */
  static getDuration(filePath: string): Promise<number> {
    return new Promise((resolve) => {
      const cmd = `ffmpeg -i "${filePath}"`;
      exec(cmd, (error, stdout, stderr) => {
        const match = stderr.match(/Duration: (\d{2}):(\d{2}):(\d{2})\.(\d{2})/);
        if (match) {
          const hours = parseInt(match[1]);
          const minutes = parseInt(match[2]);
          const seconds = parseInt(match[3]);
          const hundredths = parseInt(match[4]);
          const duration = hours * 3600 + minutes * 60 + seconds + hundredths / 100;
          console.log(`[FFmpeg] Probed duration for ${path.basename(filePath)}: ${duration}s`);
          return resolve(duration);
        }
        console.warn(`[FFmpeg] Could not parse duration for ${path.basename(filePath)}, using fallback 15s`);
        resolve(15);
      });
    });
  }


  /**
   * Burns subtitles into a video file using the ASS subtitle filter.
   * @param videoPath Absolute path to the source video file
   * @param assPath Absolute path to the ASS subtitles file
   * @param videoOutputPath Absolute path where the rendered video file will be written
   */
  static burnSubtitles(
    videoPath: string,
    assPath: string,
    videoOutputPath: string,
    aspectRatio: string = '1:1'
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      let escapedAssPath = assPath.replace(/\\/g, '/');
      if (escapedAssPath.includes(':')) {
        escapedAssPath = escapedAssPath.replace(':', '\\:');
      }

      let scaleW = 1080;
      let scaleH = 1080;
      if (aspectRatio === '9:16') {
        scaleW = 1080;
        scaleH = 1920;
      } else if (aspectRatio === '16:9') {
        scaleW = 1920;
        scaleH = 1080;
      } else if (aspectRatio === '4:5') {
        scaleW = 1080;
        scaleH = 1350;
      }

      // Filter chain: Scale & center-crop video to target aspect ratio, then burn ASS subtitles
      const vfFilter = `scale=${scaleW}:${scaleH}:force_original_aspect_ratio=increase,crop=${scaleW}:${scaleH},ass='${escapedAssPath}'`;

      const cmd = `ffmpeg -y -i "${videoPath}" -vf "${vfFilter}" -c:v libx264 -pix_fmt yuv420p -c:a aac -b:a 192k "${videoOutputPath}"`;
      
      console.log(`[FFmpeg] Rendering video (Ratio ${aspectRatio}) with subtitles: ${cmd}`);
      exec(cmd, (error, stdout, stderr) => {
        if (error) {
          console.error('[FFmpeg Subtitle Burn Error]', error, stderr);
          return reject(new Error(`Failed to render video: ${error.message}`));
        }
        console.log(`[FFmpeg] Video rendered successfully to ${videoOutputPath}`);
        resolve(videoOutputPath);
      });
    });
  }

  /**
   * Trims a video file between startSec and endSec using stream copy (no re-encode).
   * Near-instant regardless of file size. Output is a new MP4 file.
   * @param inputPath  Absolute path to the source video
   * @param outputPath Absolute path for the trimmed output video
   * @param startSec   Trim start in seconds
   * @param endSec     Trim end in seconds
   */
  static trimVideo(inputPath: string, outputPath: string, startSec: number, endSec: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const cmd = `ffmpeg -y -ss ${startSec} -to ${endSec} -i "${inputPath}" -c copy "${outputPath}"`;
      console.log(`[FFmpeg] Trimming video: ${cmd}`);
      exec(cmd, (error, _stdout, stderr) => {
        if (error) {
          console.error('[FFmpeg Trim Error]', error, stderr);
          return reject(new Error(`Failed to trim video: ${error.message}`));
        }
        console.log(`[FFmpeg] Trimmed video saved to ${outputPath}`);
        resolve(outputPath);
      });
    });
  }
}
