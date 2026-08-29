import React, { useState, useRef, useCallback } from 'react';
import type { CaptionCue, CaptionStyle, Word } from './types';

// Supported canvas aspect ratios
const ASPECT_RATIOS: Array<{ id: '9:16' | '1:1' | '16:9' | '4:5'; name: string; icon: string; desc: string; containerClass: string }> = [
  { id: '9:16', name: '9:16 Vertical', icon: '📱', desc: 'Reels / Shorts / TikTok', containerClass: 'aspect-[9/16] max-w-[310px]' },
  { id: '1:1', name: '1:1 Square', icon: '🔲', desc: 'Instagram / Feed Posts', containerClass: 'aspect-square max-w-[360px]' },
  { id: '16:9', name: '16:9 Landscape', icon: '🖥️', desc: 'YouTube / Widescreen', containerClass: 'aspect-[16/9] max-w-[480px]' },
  { id: '4:5', name: '4:5 Portrait', icon: '🖼️', desc: 'IG Portrait Feed', containerClass: 'aspect-[4/5] max-w-[330px]' },
];

// Available fonts that can be styled in real-time
const FONT_FAMILIES = [
  { id: 'Impact', name: 'Impact (Heavy Gaming)', className: 'font-impact' },
  { id: 'Anton', name: 'Anton (Ultra Heavy)', className: 'font-anton' },
  { id: 'Montserrat', name: 'Montserrat Black', className: 'font-montserrat font-black' },
  { id: 'Poppins', name: 'Poppins ExtraBold', className: 'font-poppins font-extrabold' },
  { id: 'Bungee', name: 'Bungee (Retro Arcade)', className: 'font-bungee' },
  { id: 'Lilita One', name: 'Lilita One (Punchy Bubble)', className: 'font-lilita' },
  { id: 'Rubik Mono One', name: 'Rubik Mono (Blocky)', className: 'font-rubik' },
  { id: 'Bangers', name: 'Bangers (Anime / Comic)', className: 'font-bangers' },
  { id: 'Russo One', name: 'Russo One (FPS Action)', className: 'font-russo' },
  { id: 'Titan One', name: 'Titan One (3D Cartoon)', className: 'font-titan' },
  { id: 'Oswald', name: 'Oswald (Modern Creator)', className: 'font-oswald' },
  { id: 'Permanent Marker', name: 'Permanent Marker (Vlog)', className: 'font-marker' },
  { id: 'Luckiest Guy', name: 'Luckiest Guy (Pop Fun)', className: 'font-luckiest' },
  { id: 'Press Start 2P', name: 'Press Start 2P (8-Bit Pixel)', className: 'font-press-start' },
  { id: 'Kanit', name: 'Kanit (Super Heavy)', className: 'font-kanit' },
  { id: 'Chakra Petch', name: 'Chakra Petch (Cyberpunk)', className: 'font-chakra' },
];

// Presets representing different creator video caption trends
const PRESETS: Record<string, { name: string; style: CaptionStyle }> = {
  mrbeast: {
    name: '🔥 MrBeast Supreme',
    style: {
      fontFamily: 'Impact',
      fontSize: 70,
      fontWeight: '900',
      textColor: '#FFFFFF',
      highlightColor: '#FFFF00',
      outlineWidth: 8,
      outlineColor: '#000000',
      shadowBlur: 5,
      shadowColor: '#000000',
      backgroundColor: 'transparent',
      backgroundPadding: 10,
      positionY: 70,
      caseStyle: 'upper',
      animationStyle: 'pop',
      aspectRatio: '9:16',
    },
  },
  hormozi: {
    name: '🧠 Alex Hormozi',
    style: {
      fontFamily: 'Montserrat',
      fontSize: 62,
      fontWeight: '900',
      textColor: '#FFFFFF',
      highlightColor: '#22C55E',
      outlineWidth: 6,
      outlineColor: '#000000',
      shadowBlur: 0,
      shadowColor: '#000000',
      backgroundColor: 'transparent',
      backgroundPadding: 8,
      positionY: 65,
      caseStyle: 'upper',
      animationStyle: 'bounce',
      aspectRatio: '9:16',
    },
  },
  neon: {
    name: '👾 Cyber Gaming',
    style: {
      fontFamily: 'Russo One',
      fontSize: 56,
      fontWeight: 'normal',
      textColor: '#00FFFF',
      highlightColor: '#FF00FF',
      outlineWidth: 5,
      outlineColor: '#000000',
      shadowBlur: 10,
      shadowColor: '#FF00FF',
      backgroundColor: 'transparent',
      backgroundPadding: 10,
      positionY: 75,
      caseStyle: 'upper',
      animationStyle: 'pop',
      aspectRatio: '1:1',
    },
  },
  comic: {
    name: '💥 Anime Comic',
    style: {
      fontFamily: 'Bangers',
      fontSize: 65,
      fontWeight: '900',
      textColor: '#FFFF00',
      highlightColor: '#FF2222',
      outlineWidth: 7,
      outlineColor: '#000000',
      shadowBlur: 4,
      shadowColor: '#000000',
      backgroundColor: 'transparent',
      backgroundPadding: 8,
      positionY: 68,
      caseStyle: 'upper',
      animationStyle: 'pop',
      aspectRatio: '9:16',
    },
  },
  retro: {
    name: '🎮 8-Bit Pixel',
    style: {
      fontFamily: 'Press Start 2P',
      fontSize: 38,
      fontWeight: 'normal',
      textColor: '#FACC15',
      highlightColor: '#4ADE80',
      outlineWidth: 4,
      outlineColor: '#000000',
      shadowBlur: 0,
      shadowColor: '#000000',
      backgroundColor: '#000000C0',
      backgroundPadding: 14,
      positionY: 72,
      caseStyle: 'upper',
      animationStyle: 'none',
      aspectRatio: '1:1',
    },
  },
  cinema: {
    name: '🎬 Cinema Vlog',
    style: {
      fontFamily: 'Oswald',
      fontSize: 54,
      fontWeight: '700',
      textColor: '#FFFFFF',
      highlightColor: '#F59E0B',
      outlineWidth: 3,
      outlineColor: '#0f172a',
      shadowBlur: 6,
      shadowColor: '#000000',
      backgroundColor: 'transparent',
      backgroundPadding: 10,
      positionY: 80,
      caseStyle: 'upper',
      animationStyle: 'fade',
      aspectRatio: '16:9',
    },
  },
  vlog: {
    name: '🎨 Sharpie Vlog',
    style: {
      fontFamily: 'Permanent Marker',
      fontSize: 58,
      fontWeight: 'normal',
      textColor: '#FFFFFF',
      highlightColor: '#84CC16',
      outlineWidth: 5,
      outlineColor: '#18181b',
      shadowBlur: 4,
      shadowColor: '#000000',
      backgroundColor: 'transparent',
      backgroundPadding: 10,
      positionY: 75,
      caseStyle: 'sentence',
      animationStyle: 'pop',
      aspectRatio: '4:5',
    },
  },
  minimal: {
    name: '✨ Clean Minimal',
    style: {
      fontFamily: 'Poppins',
      fontSize: 48,
      fontWeight: '800',
      textColor: '#FFFFFF',
      highlightColor: '#C084FC',
      outlineWidth: 2,
      outlineColor: '#1F2937',
      shadowBlur: 0,
      shadowColor: '#000000',
      backgroundColor: '#000000A0',
      backgroundPadding: 16,
      positionY: 80,
      caseStyle: 'sentence',
      animationStyle: 'fade',
      aspectRatio: '1:1',
    },
  },
};

const DEFAULT_STYLE = PRESETS.mrbeast.style;

const DEMO_VIDEO_URL = 'https://assets.mixkit.co/videos/preview/mixkit-neon-light-from-a-building-at-night-43950-large.mp4';
const DEMO_CUES: CaptionCue[] = [
  {
    id: 'demo-1',
    text: 'Welcome to Bleach!',
    start: 0.5,
    end: 2.5,
    words: [
      { word: 'Welcome', start: 0.5, end: 1.0 },
      { word: 'to', start: 1.0, end: 1.3 },
      { word: 'Bleach!', start: 1.3, end: 2.5 }
    ]
  },
  {
    id: 'demo-2',
    text: 'The ultimate auto-caption generator',
    start: 2.8,
    end: 5.8,
    words: [
      { word: 'The', start: 2.8, end: 3.1 },
      { word: 'ultimate', start: 3.1, end: 3.8 },
      { word: 'auto-caption', start: 3.8, end: 4.8 },
      { word: 'generator', start: 4.8, end: 5.8 }
    ]
  },
  {
    id: 'demo-3',
    text: 'designed for vertical reels and shorts.',
    start: 6.0,
    end: 9.0,
    words: [
      { word: 'designed', start: 6.0, end: 6.8 },
      { word: 'for', start: 6.8, end: 7.1 },
      { word: 'vertical', start: 7.1, end: 7.8 },
      { word: 'reels', start: 7.8, end: 8.3 },
      { word: 'and', start: 8.3, end: 8.5 },
      { word: 'shorts.', start: 8.5, end: 9.0 }
    ]
  },
  {
    id: 'demo-4',
    text: 'Customize your style and hit export now!',
    start: 9.2,
    end: 12.0,
    words: [
      { word: 'Customize', start: 9.2, end: 10.0 },
      { word: 'your', start: 10.0, end: 10.3 },
      { word: 'style', start: 10.3, end: 10.8 },
      { word: 'and', start: 10.8, end: 11.0 },
      { word: 'hit', start: 11.0, end: 11.3 },
      { word: 'export', start: 11.3, end: 11.8 },
      { word: 'now!', start: 11.8, end: 12.0 }
    ]
  }
];

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || `http://${window.location.hostname}:5000`;

export default function App() {
  const [, setVideoFile] = useState<File | null>(null);
  const [fileId, setFileId] = useState<string>('');
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'trimming' | 'uploading' | 'transcribing' | 'ready' | 'rendering' | 'done'>('idle');
  const [progressMsg, setProgressMsg] = useState<string>('');
  
  const [cues, setCues] = useState<CaptionCue[]>([]);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  
  const [style, setStyle] = useState<CaptionStyle>(DEFAULT_STYLE);
  const [selectedPreset, setSelectedPreset] = useState<string>('mrbeast');
  const [exportUrl, setExportUrl] = useState<string>('');

  // --- Trim state ---
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [trimVideoUrl, setTrimVideoUrl] = useState<string>('');
  const [trimVideoDuration, setTrimVideoDuration] = useState<number>(0);
  const [trimStart, setTrimStart] = useState<number>(0);
  const [trimEnd, setTrimEnd] = useState<number>(0);
  const [trimCurrentTime, setTrimCurrentTime] = useState<number>(0);
  const [trimPlaying, setTrimPlaying] = useState<boolean>(false);
  const [trimDragging, setTrimDragging] = useState<'start' | 'end' | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const trimVideoRef = useRef<HTMLVideoElement>(null);
  const trimTimelineRef = useRef<HTMLDivElement>(null);

  // Apply a style preset
  const applyPreset = (presetName: string) => {
    if (PRESETS[presetName]) {
      setStyle(PRESETS[presetName].style);
      setSelectedPreset(presetName);
    }
  };

  // Sync current time of video
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  // Play / Pause video preview
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(e => console.error(e));
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Seek video
  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = val;
      setCurrentTime(val);
    }
  };

  // Helper formatting for seconds to MM:SS
  const formatSecs = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = Math.floor(secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Step 1 — file selected: go to trim screen instead of immediately uploading
  const handleFileSelect = (file: File) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPendingFile(file);
    setTrimVideoUrl(url);
    setTrimStart(0);
    setTrimEnd(0); // will be set once metadata loads
    setTrimCurrentTime(0);
    setTrimPlaying(false);
    setStatus('trimming');
  };

  // Confirm trim selection → proceed to upload + transcribe
  const confirmTrim = () => {
    if (!pendingFile) return;
    const ts = trimStart;
    const te = trimEnd > trimStart ? trimEnd : trimVideoDuration;
    handleFileUpload(pendingFile, ts, te);
  };

  // Cancel trim — go back to idle
  const cancelTrim = () => {
    if (trimVideoUrl) URL.revokeObjectURL(trimVideoUrl);
    setPendingFile(null);
    setTrimVideoUrl('');
    setTrimVideoDuration(0);
    setTrimStart(0);
    setTrimEnd(0);
    setTrimPlaying(false);
    setStatus('idle');
  };

  // Trim video playback controls
  const toggleTrimPlay = () => {
    const v = trimVideoRef.current;
    if (!v) return;
    if (trimPlaying) {
      v.pause();
    } else {
      // If at or past trimEnd, rewind to trimStart
      if (v.currentTime >= trimEnd) v.currentTime = trimStart;
      v.play().catch(console.error);
    }
    setTrimPlaying(!trimPlaying);
  };

  // Timeline drag logic
  const getTimeFromMouseEvent = useCallback((e: React.MouseEvent | MouseEvent) => {
    const bar = trimTimelineRef.current;
    if (!bar || trimVideoDuration === 0) return 0;
    const rect = bar.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    return parseFloat((pct * trimVideoDuration).toFixed(2));
  }, [trimVideoDuration]);

  const handleTimelineDragStart = (handle: 'start' | 'end') => (e: React.MouseEvent) => {
    e.preventDefault();
    setTrimDragging(handle);

    const onMove = (ev: MouseEvent) => {
      const t = getTimeFromMouseEvent(ev);
      if (handle === 'start') {
        setTrimStart(Math.min(t, trimEnd - 0.5));
        if (trimVideoRef.current) trimVideoRef.current.currentTime = t;
      } else {
        setTrimEnd(Math.max(t, trimStart + 0.5));
        if (trimVideoRef.current) trimVideoRef.current.currentTime = t;
      }
    };
    const onUp = () => {
      setTrimDragging(null);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  // Step 2 — actual upload + transcribe (with optional trim range)
  const handleFileUpload = async (file: File, ts?: number, te?: number) => {
    if (!file) return;
    // Clean up trim blob URL
    if (trimVideoUrl) { URL.revokeObjectURL(trimVideoUrl); setTrimVideoUrl(''); }
    setPendingFile(null);

    setVideoFile(file);
    setVideoUrl(URL.createObjectURL(file));
    setStatus('uploading');
    const clipInfo = (ts !== undefined && te !== undefined)
      ? ` (trimmed ${formatSecs(ts)}–${formatSecs(te)})`
      : '';
    setProgressMsg(`Uploading video${clipInfo} to processing engine...`);
    setExportUrl('');

    const formData = new FormData();
    formData.append('video', file);

    try {
      // 1. Upload Video
      const uploadRes = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error('Upload failed');
      }

      const uploadData = await uploadRes.json();
      setFileId(uploadData.fileId);
      
      // 2. Trigger Transcription (pass trim params if set)
      setStatus('transcribing');
      setProgressMsg('Extracting audio & running Speech-to-Text transcription... (this may take 30–60s for longer videos)');

      const transcribeBody: Record<string, unknown> = { fileId: uploadData.fileId };
      if (ts !== undefined && te !== undefined && te > ts) {
        transcribeBody.trimStart = ts;
        transcribeBody.trimEnd = te;
      }

      const transcribeRes = await fetch(`${API_BASE_URL}/api/transcribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transcribeBody),
      });

      if (!transcribeRes.ok) {
        throw new Error('Transcription failed');
      }

      const transcribeData = await transcribeRes.json();
      setCues(transcribeData.cues);
      setDuration(transcribeData.duration);
      if (transcribeData.fileId) {
        setFileId(transcribeData.fileId);
      }
      if (transcribeData.videoUrl) {
        setVideoUrl(`${API_BASE_URL}${transcribeData.videoUrl}`);
      }
      setStatus('ready');
      setProgressMsg('');
    } catch (error: any) {
      console.error(error);
      setStatus('idle');
      const msg = error.message || 'Unknown error';
      if (msg.toLowerCase().includes('timeout') || msg.toLowerCase().includes('network')) {
        alert(`Connection timed out. Your video may be too long or the server is still processing. Try again in a moment.`);
      } else {
        alert(`Error processing video: ${msg}\n\nMake sure the server is running at ${API_BASE_URL}`);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // Load the Demo Video for quick styling preview
  const loadDemo = () => {
    setVideoFile(null);
    setVideoUrl(DEMO_VIDEO_URL);
    setCues(DEMO_CUES);
    setFileId('demo');
    setStatus('ready');
    setDuration(12);
    setExportUrl('');
  };

  // Reset workspace
  const handleReset = () => {
    setVideoFile(null);
    setVideoUrl('');
    setFileId('');
    setCues([]);
    setStatus('idle');
    setProgressMsg('');
    setExportUrl('');
    if (trimVideoUrl) { URL.revokeObjectURL(trimVideoUrl); setTrimVideoUrl(''); }
    setPendingFile(null);
    setTrimVideoDuration(0);
    setTrimStart(0);
    setTrimEnd(0);
    if (fileInputRef.current) { fileInputRef.current.value = ''; }
  };

  // Burn subtitles and export final render MP4
  const triggerExport = async () => {
    if (!fileId) return;
    if (fileId === 'demo') {
      alert("Demo videos are remote URLs and cannot be rendered on the local filesystem. Please upload a local MP4 file to test full FFmpeg rendering!");
      return;
    }
    
    setStatus('rendering');
    setProgressMsg('Invoking FFmpeg: Compiling ASS subtitles & encoding final vertical H.264 video...');
    
    try {
      const renderRes = await fetch(`${API_BASE_URL}/api/render`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileId,
          cues,
          style,
        }),
      });

      if (!renderRes.ok) {
        throw new Error('Rendering failed');
      }

      const renderData = await renderRes.json();
      setExportUrl(`${API_BASE_URL}${renderData.downloadUrl}`);
      setStatus('done');
    } catch (err: any) {
      console.error(err);
      setStatus('ready');
      alert(`Export failed: ${err.message}`);
    }
  };

  // Export native SRT subtitle file
  const triggerExportSRT = () => {
    if (cues.length === 0) return;
    
    let srt = '';
    cues.forEach((cue, index) => {
      const formatTime = (secs: number) => {
        const h = Math.floor(secs / 3600).toString().padStart(2, '0');
        const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
        const s = Math.floor(secs % 60).toString().padStart(2, '0');
        const ms = Math.floor((secs % 1) * 1000).toString().padStart(3, '0');
        return `${h}:${m}:${s},${ms}`;
      };

      srt += `${index + 1}\n`;
      srt += `${formatTime(cue.start)} --> ${formatTime(cue.end)}\n`;
      srt += `${cue.text}\n\n`;
    });

    const blob = new Blob([srt], { type: 'text/srt;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `captions_${Date.now()}.srt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Edit transcript text for an entire cue
  const updateCueText = (id: string, newText: string) => {
    setCues(prev => prev.map(cue => {
      if (cue.id === id) {
        // Recalculate word entries proportionally or split them
        const words = newText.split(' ');
        const totalDuration = cue.end - cue.start;
        const durationPerWord = totalDuration / words.length;
        
        const newWords: Word[] = words.map((w, idx) => ({
          word: w,
          start: cue.start + idx * durationPerWord,
          end: cue.start + (idx + 1) * durationPerWord
        }));

        return {
          ...cue,
          text: newText,
          words: newWords
        };
      }
      return cue;
    }));
  };

  // Edit spelling or timing of a single word in a cue
  const updateWordInCue = (cueId: string, wordIndex: number, fields: Partial<Word>) => {
    setCues(prev => prev.map(cue => {
      if (cue.id === cueId) {
        const updatedWords = cue.words.map((w, idx) => {
          if (idx === wordIndex) {
            return { ...w, ...fields };
          }
          return w;
        });

        // Reconstruct cue text from words
        const updatedText = updatedWords.map(w => w.word).join(' ');
        const start = updatedWords[0]?.start ?? cue.start;
        const end = updatedWords[updatedWords.length - 1]?.end ?? cue.end;

        return {
          ...cue,
          text: updatedText,
          words: updatedWords,
          start,
          end
        };
      }
      return cue;
    }));
  };

  // Add a new blank cue at current video playhead
  const addManualCue = () => {
    const start = parseFloat(currentTime.toFixed(3));
    const end = parseFloat((currentTime + 2.0).toFixed(3));
    const newCue: CaptionCue = {
      id: 'cue-manual-' + Math.random().toString(36).substring(2, 9),
      text: 'New caption',
      start,
      end,
      words: [
        { word: 'New', start, end: start + 1.0 },
        { word: 'caption', start: start + 1.0, end }
      ]
    };
    
    // Insert cue sorted by start time
    setCues(prev => [...prev, newCue].sort((a, b) => a.start - b.start));
  };

  // Delete a caption cue
  const deleteCue = (id: string) => {
    setCues(prev => prev.filter(c => c.id !== id));
  };

  // Find the active caption cue
  const activeCue = cues.find(c => currentTime >= c.start && currentTime <= c.end);

  // Generate text outline styling for live preview (text-shadow ring)
  const getOutlineShadow = (width: number, color: string) => {
    if (width <= 0) return '';
    const shadows = [];
    for (let x = -width; x <= width; x++) {
      for (let y = -width; y <= width; y++) {
        if (Math.abs(x) + Math.abs(y) > 0) {
          shadows.push(`${x}px ${y}px 0px ${color}`);
        }
      }
    }
    return shadows.join(', ');
  };

  const activeRatio = ASPECT_RATIOS.find(r => r.id === (style.aspectRatio || '1:1')) || ASPECT_RATIOS[1];

  return (
    <div className="min-h-screen flex flex-col bg-[#070709] text-gray-100 selection:bg-orange-500 selection:text-white">
      {/* Premium Header */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-[#0c0d12]/90 border-b border-gray-800/80 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-orange-600 via-amber-500 to-orange-500 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
            <span className="font-black text-2xl tracking-wider text-black">B</span>
          </div>
          <div>
            <h1 className="text-xl font-black tracking-wider bg-gradient-to-r from-orange-400 via-amber-300 to-white bg-clip-text text-transparent uppercase">
              Bleach
            </h1>
            <p className="text-xs text-gray-400 font-medium">Auto-Caption Reel Studio</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#1c1510] text-orange-400 border border-orange-800/40">
            <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-orange-400 animate-pulse"></span>
            FFmpeg Native Rendering
          </span>
          {status !== 'idle' && (
            <button 
              onClick={handleReset} 
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-800/40 hover:bg-red-950/20 hover:text-red-400 border border-gray-700/50 hover:border-red-900/40 transition-all duration-300"
            >
              Reset Workspace
            </button>
          )}
        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-6 flex flex-col lg:grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Loading / Process HUD Overlay */}
        {status === 'uploading' || status === 'transcribing' || status === 'rendering' ? (
          <div className="lg:col-span-12 w-full bg-[#12121a] border border-[#231e1a] rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-radial-gradient from-orange-600/5 via-transparent to-transparent pointer-events-none" />
            <div className="relative w-16 h-16 mb-4">
              <div className="w-16 h-16 rounded-full border-4 border-orange-800/20 border-t-orange-500 animate-spin"></div>
            </div>
            <h3 className="text-lg font-bold text-gray-200 capitalize mb-1">{status}...</h3>
            <p className="text-sm text-gray-400 max-w-lg animate-pulse">{progressMsg}</p>
          </div>
        ) : null}

        {status === 'idle' && (
          /* Drag and Drop File Selection HUD */
          <div className="lg:col-span-12 w-full flex flex-col items-center justify-center py-16 px-4">
            <div 
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="w-full max-w-2xl bg-[#0f0f14] hover:bg-[#141318] border-2 border-dashed border-gray-800/80 hover:border-orange-500/60 rounded-3xl p-12 text-center transition-all duration-500 shadow-2xl group flex flex-col items-center relative overflow-hidden"
            >
              {/* Decorative glows */}
              <div className="absolute -top-40 -left-40 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl pointer-events-none group-hover:bg-orange-600/15 transition-all duration-500" />
              <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-amber-600/10 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-600/15 transition-all duration-500" />

              <div className="w-16 h-16 rounded-2xl bg-gray-900 border border-gray-800 group-hover:border-orange-500/50 flex items-center justify-center text-gray-400 group-hover:text-orange-400 transition-all duration-500 mb-6 shadow-xl">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>

              <h2 className="text-2xl font-bold tracking-tight text-white mb-2">Auto-Caption Your Gaming Clip</h2>
              <p className="text-gray-400 max-w-md text-sm mb-8 leading-relaxed">
                Drag and drop your clip here, or browse local files. Bleach will automatically extract commentary, transcribe speech with AI, and sync high-impact captions.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-400 font-bold text-sm text-black shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 hover:scale-105 active:scale-95 transition-all duration-300"
                >
                  Upload Local MP4/MOV
                </button>
                
                <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">or</span>
                
                <button
                  onClick={loadDemo}
                  className="px-6 py-3 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 font-semibold text-sm hover:scale-105 active:scale-95 transition-all duration-300"
                >
                  ⚡ Try 1-Click Demo Video
                </button>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="video/mp4,video/quicktime"
                onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
              />
              <p className="text-xs text-gray-500 mt-6">Supports video uploads up to 500MB.</p>
            </div>
          </div>
        )}

        {/* ─────────────── TRIM SCREEN ─────────────── */}
        {status === 'trimming' && pendingFile && (
          <div className="lg:col-span-12 w-full flex flex-col gap-0 rounded-2xl overflow-hidden border border-gray-800 shadow-2xl bg-[#0e0f18]">

            {/* Header bar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-[#12131a]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center">
                  <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-bold text-white text-sm">Trim Your Clip</h2>
                  <p className="text-xs text-gray-500">{pendingFile.name} · {(pendingFile.size / 1024 / 1024).toFixed(1)} MB</p>
                </div>
              </div>
              <button onClick={cancelTrim} className="text-xs text-gray-500 hover:text-red-400 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-red-950/20 border border-transparent hover:border-red-900/30">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                Cancel
              </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-0">

              {/* LEFT: Video Preview */}
              <div className="flex-1 bg-black flex items-center justify-center min-h-[320px] relative">
                <video
                  ref={trimVideoRef}
                  src={trimVideoUrl}
                  className="max-h-[420px] w-full object-contain"
                  onLoadedMetadata={() => {
                    if (trimVideoRef.current) {
                      const d = trimVideoRef.current.duration;
                      setTrimVideoDuration(d);
                      setTrimEnd(d);
                    }
                  }}
                  onTimeUpdate={() => {
                    if (trimVideoRef.current) {
                      const t = trimVideoRef.current.currentTime;
                      setTrimCurrentTime(t);
                      // Auto-pause at trimEnd
                      if (t >= trimEnd && trimPlaying) {
                        trimVideoRef.current.pause();
                        setTrimPlaying(false);
                      }
                    }
                  }}
                  onEnded={() => setTrimPlaying(false)}
                />
                {/* Play / Pause overlay button */}
                <button
                  onClick={toggleTrimPlay}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-orange-500/90 hover:bg-orange-400 flex items-center justify-center shadow-xl shadow-orange-500/30 text-black transition-all duration-200 hover:scale-110 active:scale-95"
                >
                  {trimPlaying ? (
                    <svg className="w-5 h-5 fill-black" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                  ) : (
                    <svg className="w-5 h-5 fill-black ml-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                  )}
                </button>
              </div>

              {/* RIGHT: Controls Panel */}
              <div className="w-full lg:w-80 flex flex-col gap-4 p-5 border-t lg:border-t-0 lg:border-l border-gray-800 bg-[#12131a]">

                {/* Aspect Ratio Selector */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Target Aspect Ratio</label>
                  <div className="grid grid-cols-2 gap-2">
                    {ASPECT_RATIOS.map(ratio => (
                      <button
                        key={ratio.id}
                        onClick={() => setStyle(prev => ({ ...prev, aspectRatio: ratio.id }))}
                        className={`flex items-center gap-2 px-2.5 py-2 rounded-xl border text-xs text-left transition-all ${
                          (style.aspectRatio || '1:1') === ratio.id
                            ? 'bg-orange-950/40 border-orange-500 text-orange-200 shadow-md shadow-orange-500/10 font-bold'
                            : 'bg-gray-900/80 border-gray-800 text-gray-400 hover:border-gray-700 hover:bg-gray-900'
                        }`}
                      >
                        <span className="text-base">{ratio.icon}</span>
                        <div>
                          <div className="font-bold text-[11px] leading-tight">{ratio.name}</div>
                          <div className="text-[9px] text-gray-500 font-normal leading-tight">{ratio.desc.split('/')[0]}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time readouts */}
                <div className="grid grid-cols-3 gap-2">
                  {[['In Point', trimStart], ['Duration', Math.max(0, trimEnd - trimStart)], ['Out Point', trimEnd]].map(([label, val]) => (
                    <div key={label as string} className="bg-gray-900 rounded-xl p-2.5 text-center border border-gray-800">
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">{label}</p>
                      <p className="text-sm font-mono font-bold text-orange-400">{formatSecs(val as number)}</p>
                    </div>
                  ))}
                </div>

                {/* Set In / Out buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const t = trimCurrentTime;
                      if (t < trimEnd - 0.5) {
                        setTrimStart(t);
                        if (trimVideoRef.current) trimVideoRef.current.currentTime = t;
                      }
                    }}
                    className="flex-1 py-2 rounded-xl bg-gray-900 border border-gray-800 hover:border-orange-500/60 hover:bg-orange-950/20 text-xs font-semibold text-gray-300 hover:text-orange-300 transition-all duration-200"
                  >
                    ◀ Set In
                  </button>
                  <button
                    onClick={() => {
                      const t = trimCurrentTime;
                      if (t > trimStart + 0.5) {
                        setTrimEnd(t);
                        if (trimVideoRef.current) trimVideoRef.current.currentTime = t;
                      }
                    }}
                    className="flex-1 py-2 rounded-xl bg-gray-900 border border-gray-800 hover:border-orange-500/60 hover:bg-orange-950/20 text-xs font-semibold text-gray-300 hover:text-orange-300 transition-all duration-200"
                  >
                    Set Out ▶
                  </button>
                </div>

                {/* Clip info */}
                <div className="bg-gray-900/60 rounded-xl p-3 border border-gray-800 text-xs">
                  <div className="flex justify-between text-gray-400 mb-1"><span>Clip length</span><span className="font-mono font-bold text-white">{formatSecs(Math.max(0, trimEnd - trimStart))}</span></div>
                  <div className="flex justify-between text-gray-400 mb-1"><span>Full duration</span><span className="font-mono text-gray-500">{formatSecs(trimVideoDuration)}</span></div>
                  <div className="flex justify-between text-gray-400"><span>Est. transcribe time</span><span className="font-mono text-gray-500">{Math.round(Math.max(0, trimEnd - trimStart) / 10)}–{Math.round(Math.max(0, trimEnd - trimStart) / 6)}s</span></div>
                </div>

                {/* Warning for long clips */}
                {(trimEnd - trimStart) > 180 && (
                  <div className="bg-amber-950/20 border border-amber-800/40 rounded-xl px-3 py-2.5 text-xs text-amber-400 flex items-start gap-2">
                    <svg className="w-3.5 h-3.5 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    <span>Clips over 3 min take longer to transcribe. Consider trimming tighter.</span>
                  </div>
                )}

                {/* CTA */}
                <button
                  onClick={confirmTrim}
                  disabled={trimEnd <= trimStart}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-black disabled:opacity-40 disabled:cursor-not-allowed font-bold text-sm shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-[1.02] active:scale-95 transition-all duration-300"
                >
                  ✂ Trim & Process →
                </button>

                <button onClick={cancelTrim} className="text-xs text-gray-500 hover:text-gray-300 text-center transition-colors">
                  ← Choose a different file
                </button>
              </div>
            </div>

            {/* Bottom: Timeline */}
            <div className="px-5 pb-5 pt-4 border-t border-gray-800 bg-[#0e0f18]">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 font-semibold">Timeline — drag handles to set trim points</p>
              <div
                ref={trimTimelineRef}
                className="relative h-10 bg-gray-900 rounded-xl overflow-visible cursor-pointer border border-gray-800 select-none"
                onClick={(e) => {
                  const t = getTimeFromMouseEvent(e);
                  if (trimVideoRef.current) trimVideoRef.current.currentTime = t;
                  setTrimCurrentTime(t);
                }}
              >
                {/* Full bar */}
                <div className="absolute inset-0 rounded-xl bg-gray-800/50" />

                {/* Selected region highlight */}
                {trimVideoDuration > 0 && (
                  <div
                    className="absolute top-0 h-full bg-orange-500/30 border-y border-orange-500/40"
                    style={{
                      left: `${(trimStart / trimVideoDuration) * 100}%`,
                      width: `${((trimEnd - trimStart) / trimVideoDuration) * 100}%`,
                    }}
                  />
                )}

                {/* Playhead */}
                {trimVideoDuration > 0 && (
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-white/60 pointer-events-none"
                    style={{ left: `${(trimCurrentTime / trimVideoDuration) * 100}%` }}
                  >
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full" />
                  </div>
                )}

                {/* Start handle */}
                {trimVideoDuration > 0 && (
                  <div
                    onMouseDown={handleTimelineDragStart('start')}
                    className={`absolute top-0 bottom-0 w-4 -translate-x-1/2 flex items-center justify-center cursor-ew-resize z-10 group ${ trimDragging === 'start' ? 'opacity-100' : ''}`}
                    style={{ left: `${(trimStart / trimVideoDuration) * 100}%` }}
                  >
                    <div className="w-3 h-full bg-orange-500 rounded-l-lg opacity-90 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-0.5">
                      <div className="w-0.5 h-3 bg-black/60 rounded-full" />
                      <div className="w-0.5 h-3 bg-black/60 rounded-full" />
                    </div>
                    {/* Tooltip */}
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-mono px-1.5 py-0.5 rounded-md border border-gray-700 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                      {formatSecs(trimStart)}
                    </div>
                  </div>
                )}

                {/* End handle */}
                {trimVideoDuration > 0 && (
                  <div
                    onMouseDown={handleTimelineDragStart('end')}
                    className={`absolute top-0 bottom-0 w-4 -translate-x-1/2 flex items-center justify-center cursor-ew-resize z-10 group ${ trimDragging === 'end' ? 'opacity-100' : ''}`}
                    style={{ left: `${(trimEnd / trimVideoDuration) * 100}%` }}
                  >
                    <div className="w-3 h-full bg-orange-500 rounded-r-lg opacity-90 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-0.5">
                      <div className="w-0.5 h-3 bg-black/60 rounded-full" />
                      <div className="w-0.5 h-3 bg-black/60 rounded-full" />
                    </div>
                    {/* Tooltip */}
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-mono px-1.5 py-0.5 rounded-md border border-gray-700 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                      {formatSecs(trimEnd)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {status !== 'idle' && status !== 'trimming' && status !== 'uploading' && status !== 'transcribing' && status !== 'rendering' && (
          <>
            {/* LEFT COLUMN: STYLE CONTROLS PANEL (4 cols) */}
            <div className="lg:col-span-4 flex flex-col gap-6 w-full">

              {/* Target Aspect Ratio Card */}
              <div className="bg-[#12131a] border border-gray-800/80 rounded-2xl p-5 shadow-xl">
                <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-2V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                  Target Aspect Ratio
                </h3>
                <div className="grid grid-cols-2 gap-2.5">
                  {ASPECT_RATIOS.map((ratio) => (
                    <button
                      key={ratio.id}
                      onClick={() => {
                        setStyle(prev => ({ ...prev, aspectRatio: ratio.id }));
                        setSelectedPreset('custom');
                      }}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs text-left transition-all duration-200 ${
                        (style.aspectRatio || '1:1') === ratio.id
                          ? 'bg-orange-950/30 border-orange-500 text-orange-200 font-bold shadow-lg shadow-orange-500/10'
                          : 'bg-gray-900/60 border-gray-800 text-gray-400 hover:border-gray-700 hover:bg-gray-900/80'
                      }`}
                    >
                      <span className="text-lg">{ratio.icon}</span>
                      <div>
                        <div className="font-bold text-[11px] leading-tight">{ratio.name}</div>
                        <div className="text-[10px] text-gray-500 font-normal leading-tight">{ratio.desc.split('/')[0]}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Presets Cards */}
              <div className="bg-[#12131a] border border-gray-800/80 rounded-2xl p-5 shadow-xl">
                <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                  Style Presets
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(PRESETS).map(([key, data]) => (
                    <button
                      key={key}
                      onClick={() => applyPreset(key)}
                      className={`text-xs font-bold text-left px-3 py-2.5 rounded-xl border transition-all duration-300 ${
                        selectedPreset === key 
                          ? 'bg-orange-950/20 border-orange-500/70 text-orange-200' 
                          : 'bg-gray-900/60 border-gray-800/60 text-gray-400 hover:border-gray-700 hover:bg-gray-900/80'
                      }`}
                    >
                      {data.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Typography / Font Config */}
              <div className="bg-[#12131a] border border-gray-800/80 rounded-2xl p-5 shadow-xl flex flex-col gap-5">
                <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2 border-b border-gray-800 pb-3">
                  <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Typography Style
                </h3>

                {/* Font Picker */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Font Family</label>
                  <select
                    value={style.fontFamily}
                    onChange={(e) => {
                      setStyle(prev => ({ ...prev, fontFamily: e.target.value }));
                      setSelectedPreset('custom');
                    }}
                    className="w-full text-sm bg-gray-900 border border-gray-800 rounded-xl px-3 py-2.5 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
                  >
                    {FONT_FAMILIES.map(font => (
                      <option key={font.id} value={font.id}>{font.name}</option>
                    ))}
                  </select>
                  <p className="text-[10px] text-gray-500 mt-1.5">Note: Custom fonts will fallback gracefully on system outputs if not installed.</p>
                </div>

                {/* Font Size */}
                <div>
                  <div className="flex justify-between text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wide">
                    <span>Font Size</span>
                    <span className="text-orange-400">{style.fontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="24"
                    max="100"
                    value={style.fontSize}
                    onChange={(e) => {
                      setStyle(prev => ({ ...prev, fontSize: parseInt(e.target.value) }));
                      setSelectedPreset('custom');
                    }}
                    className="w-full accent-orange-500"
                  />
                </div>

                {/* Position Y Slider */}
                <div>
                  <div className="flex justify-between text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wide">
                    <span>Vertical Position (Y Offset)</span>
                    <span className="text-orange-400">{style.positionY}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="90"
                    value={style.positionY}
                    onChange={(e) => {
                      setStyle(prev => ({ ...prev, positionY: parseInt(e.target.value) }));
                      setSelectedPreset('custom');
                    }}
                    className="w-full accent-orange-500"
                  />
                </div>

                {/* Casing & Animation */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Caps Style</label>
                    <select
                      value={style.caseStyle}
                      onChange={(e) => {
                        setStyle(prev => ({ ...prev, caseStyle: e.target.value as any }));
                        setSelectedPreset('custom');
                      }}
                      className="w-full text-xs bg-gray-900 border border-gray-800 rounded-xl px-2 py-2"
                    >
                      <option value="upper">UPPERCASE</option>
                      <option value="sentence">Sentence Case</option>
                      <option value="as-typed">As-Typed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Active Word Pop</label>
                    <select
                      value={style.animationStyle}
                      onChange={(e) => {
                        setStyle(prev => ({ ...prev, animationStyle: e.target.value as any }));
                        setSelectedPreset('custom');
                      }}
                      className="w-full text-xs bg-gray-900 border border-gray-800 rounded-xl px-2 py-2"
                    >
                      <option value="pop">💥 Zoom Pop</option>
                      <option value="bounce">🦘 Bounce Up</option>
                      <option value="fade">💨 Fade In</option>
                      <option value="none">None (Static)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Borders, Outline & Shadows */}
              <div className="bg-[#12131a] border border-gray-800/80 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
                <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2 border-b border-gray-800 pb-3">
                  <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                  Stroke & Background
                </h3>

                {/* Color Pickers Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Text Color</label>
                    <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-xl p-1.5">
                      <input
                        type="color"
                        value={style.textColor.slice(0, 7)}
                        onChange={(e) => {
                          setStyle(prev => ({ ...prev, textColor: e.target.value }));
                          setSelectedPreset('custom');
                        }}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <span className="text-xs uppercase text-gray-300 font-mono font-semibold">{style.textColor.slice(0, 7)}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Highlight Word</label>
                    <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-xl p-1.5">
                      <input
                        type="color"
                        value={style.highlightColor}
                        onChange={(e) => {
                          setStyle(prev => ({ ...prev, highlightColor: e.target.value }));
                          setSelectedPreset('custom');
                        }}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <span className="text-xs uppercase text-gray-300 font-mono font-semibold">{style.highlightColor}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Stroke Outline</label>
                    <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-xl p-1.5">
                      <input
                        type="color"
                        value={style.outlineColor}
                        onChange={(e) => {
                          setStyle(prev => ({ ...prev, outlineColor: e.target.value }));
                          setSelectedPreset('custom');
                        }}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <span className="text-xs uppercase text-gray-300 font-mono font-semibold">{style.outlineColor}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Shadow Blur</label>
                    <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-xl p-1.5">
                      <input
                        type="color"
                        value={style.shadowColor}
                        onChange={(e) => {
                          setStyle(prev => ({ ...prev, shadowColor: e.target.value }));
                          setSelectedPreset('custom');
                        }}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <span className="text-xs uppercase text-gray-300 font-mono font-semibold">{style.shadowColor}</span>
                    </div>
                  </div>
                </div>

                {/* Stroke Width Slider */}
                <div>
                  <div className="flex justify-between text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wide">
                    <span>Stroke Width</span>
                    <span className="text-orange-400">{style.outlineWidth}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="12"
                    value={style.outlineWidth}
                    onChange={(e) => {
                      setStyle(prev => ({ ...prev, outlineWidth: parseInt(e.target.value) }));
                      setSelectedPreset('custom');
                    }}
                    className="w-full accent-orange-500"
                  />
                </div>

                {/* Box Background Toggle */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Box Background Box Color</label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setStyle(prev => ({ 
                          ...prev, 
                          backgroundColor: prev.backgroundColor === 'transparent' ? '#000000A0' : 'transparent' 
                        }));
                        setSelectedPreset('custom');
                      }}
                      className={`text-xs px-3 py-2 rounded-xl border font-bold ${
                        style.backgroundColor !== 'transparent'
                          ? 'bg-orange-950/20 border-orange-500/70 text-orange-300'
                          : 'bg-gray-900 border-gray-800 text-gray-400'
                      }`}
                    >
                      {style.backgroundColor !== 'transparent' ? 'Enabled (Solid Box)' : 'Disabled'}
                    </button>

                    {style.backgroundColor !== 'transparent' && (
                      <div className="flex-1 flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-xl p-1.5">
                        <input
                          type="color"
                          value={style.backgroundColor.slice(0, 7)}
                          onChange={(e) => {
                            setStyle(prev => ({ ...prev, backgroundColor: e.target.value + 'A0' }));
                            setSelectedPreset('custom');
                          }}
                          className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                        />
                        <span className="text-xs uppercase text-gray-300 font-mono font-semibold">{style.backgroundColor}</span>
                      </div>
                    )}
                  </div>
                </div>

              </div>

            </div>

            {/* CENTER COLUMN: LIVE PLAYER VIEWPORT */}
            <div className="lg:col-span-4 flex flex-col gap-6 items-center w-full">
              
              {/* Dynamic Aspect Ratio Player Box */}
              <div className={`relative w-full ${activeRatio.containerClass} bg-black rounded-3xl overflow-hidden shadow-2xl border border-gray-800 shadow-orange-500/5 group transition-all duration-500`}>
                <video
                  ref={videoRef}
                  src={videoUrl}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onClick={togglePlay}
                  className="w-full h-full object-cover cursor-pointer"
                  loop
                />

                {/* PLAY Overlay Indicator */}
                {!isPlaying && (
                  <div 
                    onClick={togglePlay}
                    className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer transition-all duration-300"
                  >
                    <div className="w-16 h-16 rounded-full bg-orange-500/90 text-black flex items-center justify-center shadow-xl shadow-orange-500/30 scale-100 hover:scale-110 active:scale-95 transition-all duration-300">
                      <svg className="w-8 h-8 fill-current ml-1" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                )}

                {/* LIVE DYNAMIC KARAOKE CAPTION OVERLAY */}
                {activeCue && (
                  <div
                    style={{
                      position: 'absolute',
                      top: `${style.positionY}%`,
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '85%',
                      textAlign: 'center',
                      pointerEvents: 'none',
                      zIndex: 10,
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: style.backgroundColor,
                        padding: style.backgroundColor !== 'transparent' ? `${style.backgroundPadding}px` : '0px',
                        borderRadius: '12px',
                        display: 'inline-block',
                      }}
                    >
                      <p
                        className={`leading-tight select-none tracking-normal font-${FONT_FAMILIES.find(f => f.id === style.fontFamily)?.id.replace(' ', '-').toLowerCase()}`}
                        style={{
                          fontSize: `${style.fontSize / 1.7}px`, // Scaled for preview fits
                          fontWeight: style.fontWeight === '900' ? '900' : 'normal',
                          color: style.textColor,
                          textShadow: getOutlineShadow(style.outlineWidth / 1.5, style.outlineColor),
                        }}
                      >
                        {activeCue.words.map((wordObj, idx) => {
                          const isWordActive = currentTime >= wordObj.start && currentTime <= wordObj.end;
                          
                          // Format word casing
                          let wordText = wordObj.word;
                          if (style.caseStyle === 'upper') {
                            wordText = wordText.toUpperCase();
                          } else if (style.caseStyle === 'sentence') {
                            if (idx === 0) {
                              wordText = wordText.charAt(0).toUpperCase() + wordText.slice(1);
                            }
                          }

                          // Trigger style values
                          const wordColor = isWordActive ? style.highlightColor : style.textColor;
                          const activeClass = isWordActive
                            ? style.animationStyle === 'pop'
                              ? 'animate-pop'
                              : style.animationStyle === 'bounce'
                              ? 'animate-bounce-word'
                              : style.animationStyle === 'fade'
                              ? 'animate-fade-word'
                              : ''
                            : '';

                          return (
                            <span
                              key={idx}
                              className={`mx-1 inline-block ${activeClass}`}
                              style={{
                                color: wordColor,
                                transformOrigin: 'center center',
                                transition: 'color 0.08s ease-in-out',
                              }}
                            >
                              {wordText}
                            </span>
                          );
                        })}
                      </p>
                    </div>
                  </div>
                )}

                {/* Progress bar inside Player */}
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                  <div className="flex justify-between items-center text-[10px] text-gray-400 font-mono">
                    <span>{formatSecs(currentTime)}</span>
                    <span>{formatSecs(duration)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={duration || 100}
                    step="0.05"
                    value={currentTime}
                    onChange={handleScrub}
                    className="w-full accent-orange-500 h-1 bg-gray-800 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* Rendering & Subtitle Actions */}
              <div className="w-full max-w-[340px] flex flex-col gap-3">
                <button
                  onClick={togglePlay}
                  className="w-full py-2.5 rounded-xl bg-gray-900 border border-gray-850 hover:bg-gray-800 text-xs font-bold transition-all duration-300"
                >
                  {isPlaying ? '⏸ Pause Preview' : '▶ Play Preview'}
                </button>

                <button
                  onClick={triggerExport}
                  disabled={!fileId || fileId === 'demo'}
                  className={`w-full py-3.5 rounded-xl font-bold text-sm tracking-wide shadow-lg transition-all duration-300 ${
                    !fileId || fileId === 'demo'
                      ? 'bg-gray-900 border border-gray-850 text-gray-600 cursor-not-allowed'
                      : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-black font-extrabold shadow-orange-500/20 hover:scale-105 active:scale-95'
                  }`}
                >
                  🎬 Export Rendered Video (FFmpeg)
                </button>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={triggerExportSRT}
                    disabled={cues.length === 0}
                    className="py-2.5 rounded-xl bg-gray-900 hover:bg-gray-850 border border-gray-850 text-[10px] font-bold tracking-wide uppercase transition-all duration-300 disabled:opacity-40"
                  >
                    📂 Export .SRT File
                  </button>
                  <button
                    onClick={addManualCue}
                    className="py-2.5 rounded-xl bg-orange-950/20 hover:bg-orange-900/20 border border-orange-800/40 text-[10px] font-bold text-orange-400 tracking-wide uppercase transition-all duration-300"
                  >
                    ➕ Add Cue Manually
                  </button>
                </div>

                {/* Show download link if finished rendering */}
                {exportUrl && (
                  <div className="mt-2 bg-[#12131a] border border-green-800/40 rounded-xl p-3 text-center">
                    <p className="text-xs text-green-400 font-semibold mb-2">🎉 Subtitles burned-in successfully!</p>
                    <a
                      href={exportUrl}
                      download
                      className="inline-block px-4 py-2 bg-green-700 hover:bg-green-600 text-white rounded-lg text-xs font-bold hover:scale-105 active:scale-95 transition-all duration-300 shadow-md shadow-green-700/20"
                    >
                      📥 Download Rendered Video
                    </a>
                  </div>
                )}
              </div>

            </div>

            {/* RIGHT COLUMN: INTERACTIVE TRANSCRIPT EDITOR (4 cols) */}
            <div className="lg:col-span-4 bg-[#12131a] border border-gray-800/80 rounded-2xl p-5 shadow-xl w-full h-[640px] flex flex-col">
              <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-gray-800 pb-3">
                <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Transcript Editor
              </h3>

              {cues.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-500 py-10">
                  <p className="text-xs mb-2">No transcript cues generated yet.</p>
                  <p className="text-[10px]">Upload a video or hit demo to get started!</p>
                </div>
              ) : (
                /* List of Cues */
                <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-4">
                  {cues.map((cue) => {
                    const isActive = currentTime >= cue.start && currentTime <= cue.end;

                    return (
                      <div
                        key={cue.id}
                        className={`p-3.5 rounded-xl border transition-all duration-300 ${
                          isActive 
                            ? 'bg-orange-950/15 border-orange-700/50' 
                            : 'bg-gray-900/50 border-gray-850/60'
                        }`}
                      >
                        {/* Cue Header with Timings & Delete */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] text-gray-400 font-mono font-bold bg-gray-800/40 px-2 py-0.5 rounded">
                            🕒 {cue.start.toFixed(2)}s - {cue.end.toFixed(2)}s
                          </span>
                          <button
                            onClick={() => deleteCue(cue.id)}
                            className="text-gray-500 hover:text-red-400 p-0.5 transition-colors"
                            title="Delete Cue"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>

                        {/* Text edit input for the cue phrase */}
                        <input
                          type="text"
                          value={cue.text}
                          onChange={(e) => updateCueText(cue.id, e.target.value)}
                          className="w-full text-xs bg-gray-900 border border-gray-800 rounded-lg px-2.5 py-1.5 text-gray-200 focus:border-orange-500 focus:outline-none font-medium mb-3"
                          placeholder="Edit cue phrase..."
                        />

                        {/* Individual Word Timing adjustments */}
                        <div className="flex flex-wrap gap-2 bg-gray-950/40 p-2 rounded-lg border border-gray-850/30">
                          {cue.words.map((w, wIdx) => {
                            const isWordActive = currentTime >= w.start && currentTime <= w.end;

                            return (
                              <div
                                key={wIdx}
                                className={`text-[10px] px-2 py-1 rounded flex items-center gap-1 border transition-all duration-300 ${
                                  isWordActive
                                    ? 'bg-orange-950/30 border-orange-700/80 text-orange-300 font-bold'
                                    : 'bg-gray-900/60 border-gray-850/40 text-gray-400'
                                }`}
                              >
                                {/* Word spelling input */}
                                <input
                                  type="text"
                                  value={w.word}
                                  onChange={(e) => updateWordInCue(cue.id, wIdx, { word: e.target.value })}
                                  className="w-14 bg-transparent border-0 focus:outline-none text-[10px] text-gray-200 font-semibold"
                                  title="Edit word spelling"
                                />

                                {/* Mini Timing Controls */}
                                <div className="flex items-center gap-0.5 border-l border-gray-800/80 pl-1 ml-0.5">
                                  <button
                                    onClick={() => updateWordInCue(cue.id, wIdx, { start: Math.max(0, w.start - 0.1), end: w.end - 0.1 })}
                                    className="hover:text-orange-400"
                                    title="Nudge timing backward (-100ms)"
                                  >
                                    ◀
                                  </button>
                                  <button
                                    onClick={() => updateWordInCue(cue.id, wIdx, { start: w.start + 0.1, end: w.end + 0.1 })}
                                    className="hover:text-orange-400"
                                    title="Nudge timing forward (+100ms)"
                                  >
                                    ▶
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <p className="text-[10px] text-gray-500 mt-4 text-center">
                Click text strings to edit transcript inline. Use nudge buttons ◀/▶ to adjust sync.
              </p>
            </div>
          </>
        )}

      </main>

      {/* Dynamic Wave Animations inside Layout */}
      <style>{`
        @keyframes pop {
          0% { transform: scale(1.0); }
          50% { transform: scale(1.25); }
          100% { transform: scale(1.0); }
        }
        .animate-pop {
          animation: pop 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }

        @keyframes bounceWord {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .animate-bounce-word {
          animation: bounceWord 0.18s ease-out;
        }

        @keyframes fadeWord {
          0% { opacity: 0.4; }
          100% { opacity: 1; }
        }
        .animate-fade-word {
          animation: fadeWord 0.1s ease-out;
        }

        /* Set system Google Fonts overrides on container text elements */
        .font-impact {
          font-family: 'Impact', 'Arial Black', sans-serif !important;
        }
        .font-montserrat {
          font-family: 'Montserrat', sans-serif !important;
        }
        .font-poppins {
          font-family: 'Poppins', sans-serif !important;
        }
        .font-bungee {
          font-family: 'Bungee', cursive !important;
        }
        .font-lilita {
          font-family: 'Lilita One', cursive !important;
        }
        .font-rubik {
          font-family: 'Rubik Mono One', monospace !important;
        }
      `}</style>
    </div>
  );
}
