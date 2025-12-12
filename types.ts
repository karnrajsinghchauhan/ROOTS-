
export enum View {
  HOME = 'HOME',
  VISION = 'VISION',
  AUDIO = 'AUDIO',
  CHAT = 'CHAT',
  KIDS = 'KIDS', // Keeping internal enum name for stability, but UI will show "Creator's Atelier"
  GUIDES = 'GUIDES'
}

export interface UserStats {
  xp: number;
  level: number;
  streak: number;
}

export interface PromptOption {
  label: string;
  prompt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  image?: string; // base64
  isLoading?: boolean;
}

export interface VisionResult {
  title: string;
  explanation: string;
  symbolism: string;
  history: string;
}

export interface AudioAnalysisResult {
    title: string;
    meaning: string;
    origin: string;
}

export interface StoryResult {
  title: string;
  story: string;
  imageUrl?: string;
}

export interface VideoScene {
  sceneNumber: number;
  visual: string;
  audio: string;
}

export interface VideoPlanResult {
  title: string;
  script: string;
  scenes: VideoScene[];
  voiceoverDialogues: string[];
  visualStyle: string;
}

export interface MeditationResult {
  title: string;
  intro: string;
  visualization: string;
  reflection: string;
}