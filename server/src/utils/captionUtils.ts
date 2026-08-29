import { Word, CaptionCue } from '../types';

/**
 * Groups an array of individual timed words into caption cues (phrases).
 * Optimised for vertical short-form videos (Reels/Shorts/TikToks).
 * 
 * @param words List of word objects with start/end times
 * @param maxWords Maximum number of words in a single caption cue
 * @param maxChars Maximum character length of a single caption cue
 * @param maxPause Gaps in speech (in seconds) that trigger a new cue
 */
export function groupWordsIntoCues(
  words: Word[],
  maxWords: number = 3,
  maxChars: number = 18,
  maxPause: number = 0.4
): CaptionCue[] {
  const cues: CaptionCue[] = [];
  if (words.length === 0) return cues;

  let currentWords: Word[] = [];
  let currentTextLength = 0;

  const pushCue = () => {
    if (currentWords.length === 0) return;
    const start = currentWords[0].start;
    const end = currentWords[currentWords.length - 1].end;
    const text = currentWords.map(w => w.word).join(' ');
    const id = 'cue-' + Math.random().toString(36).substring(2, 9);
    
    cues.push({
      id,
      text,
      start: parseFloat(start.toFixed(3)),
      end: parseFloat(end.toFixed(3)),
      words: [...currentWords]
    });
    currentWords = [];
    currentTextLength = 0;
  };

  for (let i = 0; i < words.length; i++) {
    const wordObj = words[i];
    const prevWordObj = i > 0 ? words[i - 1] : null;

    // Check if we need to break into a new cue
    const tooManyWords = currentWords.length >= maxWords;
    const tooManyChars = currentTextLength + wordObj.word.length + (currentWords.length > 0 ? 1 : 0) > maxChars;
    const longPause = prevWordObj ? (wordObj.start - prevWordObj.end > maxPause) : false;
    const punctuationBreak = prevWordObj ? /[.?!,;]$/.test(prevWordObj.word.trim()) : false;

    if (tooManyWords || tooManyChars || longPause || punctuationBreak) {
      pushCue();
    }

    currentWords.push(wordObj);
    currentTextLength += wordObj.word.length + (currentWords.length > 1 ? 1 : 0);
  }

  // Push any remaining words
  pushCue();

  return cues;
}
