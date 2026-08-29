import fs from 'fs';
import path from 'path';
import { Word } from '../types';

export class SttService {
  /**
   * Transcribes an audio file and returns word-level timestamps.
   * Checks for API keys in environment variables and falls back to mock if none are available.
   * 
   * @param audioPath Absolute path to the audio file
   * @param duration Estimated or probed duration of the audio file in seconds
   */
  static async transcribe(audioPath: string, duration: number): Promise<Word[]> {
    const groqKey = process.env.GROQ_API_KEY;
    const speechmaticsKey = process.env.SPEECHMATICS_API_KEY;
    const gladiaKey = process.env.GLADIA_API_KEY;
    const deepgramKey = process.env.DEEPGRAM_API_KEY;
    const assemblyAiKey = process.env.ASSEMBLYAI_API_KEY;
    const openAiKey = process.env.OPENAI_API_KEY;

    if (groqKey) {
      try {
        console.log('[STT] Attempting Groq (Whisper Large V3) transcription...');
        return await this.transcribeGroq(audioPath, groqKey);
      } catch (err: any) {
        console.warn(`[STT] Groq transcription failed: ${err.message}. Trying next provider...`);
      }
    }

    if (speechmaticsKey) {
      try {
        console.log('[STT] Attempting Speechmatics transcription...');
        return await this.transcribeSpeechmatics(audioPath, speechmaticsKey);
      } catch (err: any) {
        console.warn(`[STT] Speechmatics transcription failed: ${err.message}. Trying next provider...`);
      }
    }

    if (gladiaKey) {
      try {
        console.log('[STT] Attempting Gladia transcription...');
        return await this.transcribeGladia(audioPath, gladiaKey);
      } catch (err: any) {
        console.warn(`[STT] Gladia transcription failed: ${err.message}. Trying next provider...`);
      }
    }

    if (deepgramKey) {
      try {
        console.log('[STT] Attempting Deepgram transcription...');
        return await this.transcribeDeepgram(audioPath, deepgramKey);
      } catch (err: any) {
        console.warn(`[STT] Deepgram transcription failed: ${err.message}. Trying next provider...`);
      }
    }

    if (assemblyAiKey) {
      try {
        console.log('[STT] Attempting AssemblyAI transcription...');
        return await this.transcribeAssemblyAi(audioPath, assemblyAiKey);
      } catch (err: any) {
        console.warn(`[STT] AssemblyAI transcription failed: ${err.message}. Trying next provider...`);
      }
    }

    if (openAiKey) {
      try {
        console.log('[STT] Attempting OpenAI Whisper transcription...');
        return await this.transcribeOpenAi(audioPath, openAiKey);
      } catch (err: any) {
        console.warn(`[STT] OpenAI transcription failed: ${err.message}.`);
      }
    }

    console.log('[STT] ℹ️ Using fallback gaming transcription generator.');
    return this.generateMockTranscript(duration);
  }

  /**
   * Groq (Whisper Large V3) STT implementation
   * Free tier with ~28,800 audio-seconds/day, no credit card required!
   */
  private static async transcribeGroq(audioPath: string, apiKey: string): Promise<Word[]> {
    const fileBuffer = fs.readFileSync(audioPath);
    
    const formData = new FormData();
    const audioFile = typeof File !== 'undefined'
      ? new File([fileBuffer], 'audio.mp3', { type: 'audio/mpeg' })
      : new Blob([fileBuffer], { type: 'audio/mpeg' });
    
    formData.append('file', audioFile, 'audio.mp3');
    formData.append('model', 'whisper-large-v3');
    formData.append('response_format', 'verbose_json');
    formData.append('timestamp_granularities[]', 'word');

    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      body: formData
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Groq Whisper API error (${response.status}): ${errText}`);
    }

    const data: any = await response.json();
    const words = data.words;

    if (!words || !Array.isArray(words)) {
      return [];
    }

    return words.map((w: any) => ({
      word: w.word.trim(),
      start: w.start,
      end: w.end
    }));
  }

  /**
   * Speechmatics STT implementation
   * 50 hours/month free, no credit card required!
   */
  private static async transcribeSpeechmatics(audioPath: string, apiKey: string): Promise<Word[]> {
    const fileBuffer = fs.readFileSync(audioPath);

    const formData = new FormData();
    formData.append('data_file', new Blob([fileBuffer], { type: 'audio/mpeg' }), 'audio.mp3');
    formData.append('config', JSON.stringify({
      type: 'transcription',
      transcription_config: {
        language: 'en',
        enable_entities: true
      }
    }));

    // 1. Create Job
    const createRes = await fetch('https://asr.api.speechmatics.com/v2/jobs/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      body: formData
    });

    if (!createRes.ok) {
      const errText = await createRes.text();
      throw new Error(`Speechmatics Job Creation failed: ${createRes.statusText} - ${errText}`);
    }

    const jobData: any = await createRes.json();
    const jobId = jobData.id;
    console.log(`[STT - Speechmatics] Job queued ID: ${jobId}. Polling status...`);

    // 2. Poll Status
    let jobStatus = 'running';
    while (jobStatus === 'running') {
      await new Promise(r => setTimeout(r, 1500));
      const pollRes = await fetch(`https://asr.api.speechmatics.com/v2/jobs/${jobId}`, {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });
      if (!pollRes.ok) throw new Error(`Speechmatics Polling failed: ${pollRes.statusText}`);
      const pollData: any = await pollRes.json();
      jobStatus = pollData.job.status;
    }

    if (jobStatus !== 'done') {
      throw new Error(`Speechmatics Job failed with status: ${jobStatus}`);
    }

    // 3. Get Results
    const resultRes = await fetch(`https://asr.api.speechmatics.com/v2/jobs/${jobId}/transcript?format=json-v2`, {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });

    if (!resultRes.ok) throw new Error(`Speechmatics Transcript fetch failed: ${resultRes.statusText}`);

    const resultData: any = await resultRes.json();
    const results = resultData.results || [];
    const words: Word[] = [];

    results.forEach((item: any) => {
      if (item.type === 'word' && item.alternatives && item.alternatives.length > 0) {
        words.push({
          word: item.alternatives[0].content,
          start: item.start_time,
          end: item.end_time
        });
      }
    });

    return words;
  }

  /**
   * Gladia STT implementation
   * 10 hours/month free, no credit card required!
   */
  private static async transcribeGladia(audioPath: string, apiKey: string): Promise<Word[]> {
    const fileBuffer = fs.readFileSync(audioPath);

    // 1. Upload File
    const formData = new FormData();
    formData.append('audio', new Blob([fileBuffer], { type: 'audio/mpeg' }), 'audio.mp3');

    const uploadRes = await fetch('https://api.gladia.io/v2/upload', {
      method: 'POST',
      headers: { 'x-gladia-key': apiKey },
      body: formData
    });

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      throw new Error(`Gladia Upload failed: ${uploadRes.statusText} - ${errText}`);
    }

    const uploadData: any = await uploadRes.json();
    const audioUrl = uploadData.audio_url;

    // 2. Queue Transcription
    const transcribeRes = await fetch('https://api.gladia.io/v2/transcription', {
      method: 'POST',
      headers: {
        'x-gladia-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        audio_url: audioUrl,
        diarization: false,
        subtitles: false
      })
    });

    if (!transcribeRes.ok) {
      const errText = await transcribeRes.text();
      throw new Error(`Gladia Transcription failed: ${transcribeRes.statusText} - ${errText}`);
    }

    const transcribeData: any = await transcribeRes.json();
    const resultUrl = transcribeData.result_url;

    // 3. Poll Result
    let status = 'queued';
    let resultData: any = null;

    while (status === 'queued' || status === 'processing') {
      await new Promise(r => setTimeout(r, 1500));
      const pollRes = await fetch(resultUrl, {
        headers: { 'x-gladia-key': apiKey }
      });
      if (!pollRes.ok) throw new Error(`Gladia Polling failed: ${pollRes.statusText}`);
      resultData = await pollRes.json();
      status = resultData.status;
    }

    if (status !== 'done') {
      throw new Error(`Gladia Transcription job failed with status: ${status}`);
    }

    const utterances = resultData.result?.transcription?.utterances || [];
    const words: Word[] = [];

    utterances.forEach((utt: any) => {
      if (utt.words && Array.isArray(utt.words)) {
        utt.words.forEach((w: any) => {
          words.push({
            word: w.word.trim(),
            start: w.start,
            end: w.end
          });
        });
      }
    });

    return words;
  }

  /**
   * AssemblyAI STT implementation
   */
  private static async transcribeAssemblyAi(audioPath: string, apiKey: string): Promise<Word[]> {
    const fileStream = fs.readFileSync(audioPath);
    const uploadRes = await fetch('https://api.assemblyai.com/v2/upload', {
      method: 'POST',
      headers: {
        'authorization': apiKey,
        'content-type': 'application/octet-stream'
      },
      body: fileStream
    });

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      throw new Error(`AssemblyAI Upload failed: ${uploadRes.statusText} - ${errText}`);
    }

    const uploadData: any = await uploadRes.json();
    const audioUrl = uploadData.upload_url;

    const transcriptRes = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: {
        'authorization': apiKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        audio_url: audioUrl,
        punctuate: true,
        format_text: true
      })
    });

    if (!transcriptRes.ok) {
      const errText = await transcriptRes.text();
      throw new Error(`AssemblyAI Transcription queue failed: ${transcriptRes.statusText} - ${errText}`);
    }

    const transcriptData: any = await transcriptRes.json();
    const transcriptId = transcriptData.id;

    let status = 'processing';
    let pollData: any = null;

    while (status === 'queued' || status === 'processing') {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const pollRes = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
        headers: { 'authorization': apiKey }
      });
      
      if (!pollRes.ok) throw new Error(`AssemblyAI Polling failed: ${pollRes.statusText}`);
      pollData = await pollRes.json();
      status = pollData.status;
    }

    if (status === 'error') throw new Error(`AssemblyAI Transcription failed: ${pollData.error}`);
    if (!pollData.words || !Array.isArray(pollData.words)) return [];

    return pollData.words.map((w: any) => ({
      word: w.text,
      start: w.start / 1000,
      end: w.end / 1000
    }));
  }

  /**
   * Deepgram STT implementation
   */
  private static async transcribeDeepgram(audioPath: string, apiKey: string): Promise<Word[]> {
    const fileBuffer = fs.readFileSync(audioPath);
    
    const response = await fetch('https://api.deepgram.com/v1/listen?smart_format=true&punctuate=true', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'audio/mpeg'
      },
      body: fileBuffer
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Deepgram API failed: ${response.statusText} - ${errText}`);
    }

    const data: any = await response.json();
    const words = data.results?.channels[0]?.alternatives[0]?.words;

    if (!words || !Array.isArray(words)) return [];

    return words.map((w: any) => ({
      word: w.word,
      start: w.start,
      end: w.end
    }));
  }

  /**
   * OpenAI Whisper STT implementation
   */
  private static async transcribeOpenAi(audioPath: string, apiKey: string): Promise<Word[]> {
    const fileBuffer = fs.readFileSync(audioPath);
    
    const formData = new FormData();
    formData.append('file', new Blob([fileBuffer], { type: 'audio/mpeg' }), 'audio.mp3');
    formData.append('model', 'whisper-1');
    formData.append('response_format', 'verbose_json');
    formData.append('timestamp_granularities[]', 'word');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      body: formData
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenAI Whisper API failed: ${response.statusText} - ${errText}`);
    }

    const data: any = await response.json();
    const words = data.words;

    if (!words || !Array.isArray(words)) return [];

    return words.map((w: any) => ({
      word: w.word,
      start: w.start,
      end: w.end
    }));
  }

  /**
   * Generates a mock word list evenly spaced over the video duration.
   */
  private static generateMockTranscript(duration: number): Word[] {
    const mockPhrases = [
      "Oh my god!",
      "Did you see that clip?",
      "That was absolutely insane!",
      "I just hit a clean double headshot",
      "while jumping off the Maze Bank tower!",
      "Let's go!",
      "This is easily",
      "one of the cleanest plays",
      "I've ever pulled off in GTA.",
      "Make sure to follow",
      "and subscribe for more daily clips!"
    ];

    const allWords: string[] = [];
    mockPhrases.forEach(phrase => {
      phrase.split(' ').forEach(w => allWords.push(w));
    });

    const totalWords = allWords.length;
    const durationPerWord = duration / (totalWords + 2);

    const wordsList: Word[] = [];
    let currentTime = 0.5;

    for (let i = 0; i < totalWords; i++) {
      const wordLength = allWords[i].length;
      const wordDuration = durationPerWord * (0.7 + (wordLength / 10) * 0.6);
      
      wordsList.push({
        word: allWords[i],
        start: parseFloat(currentTime.toFixed(3)),
        end: parseFloat((currentTime + wordDuration).toFixed(3))
      });

      currentTime += wordDuration + 0.05;
    }

    return wordsList;
  }
}
