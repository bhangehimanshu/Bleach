export interface Word {
  word: string;
  start: number; // in seconds
  end: number;   // in seconds
}

export interface CaptionCue {
  id: string;
  text: string;
  start: number; // in seconds
  end: number;   // in seconds
  words: Word[];
}

export interface CaptionStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  textColor: string;       // Hex (e.g., #ffffff)
  highlightColor: string;  // Hex (e.g., #ffff00)
  outlineWidth: number;
  outlineColor: string;    // Hex (e.g., #000000)
  shadowBlur: number;
  shadowColor: string;     // Hex (e.g., #000000)
  backgroundColor: string; // Hex/RGBA (e.g., #000000 or transparent)
  backgroundPadding: number;
  positionY: number;       // Vertical offset slider (0-100, where 100 is bottom, default 75)
  caseStyle: 'upper' | 'sentence' | 'as-typed';
  animationStyle: 'pop' | 'fade' | 'bounce' | 'none';
  aspectRatio?: '9:16' | '1:1' | '16:9' | '4:5';
}
