export type GameMode = 'quick' | 'ai_battle' | 'friend' | 'daily' | 'survival' | 'custom';

export type Difficulty = 'easy' | 'normal' | 'hard' | 'expert';

export type SpecialEvent = 
  | 'none' 
  | 'double_letter' 
  | 'chaos_letter' 
  | 'last_chance' 
  | 'reverse' 
  | 'golden_letter';

export interface Category {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  difficulty: Difficulty;
  description: string;
  placeholder: string;
}

export interface AnswerItem {
  categoryId: string;
  value: string;
  isLocked: boolean;
  timestamp: number; // when typed
  // Evaluated values
  isValid?: boolean;
  isUnique?: boolean;
  isFast?: boolean;
  basePoints?: number;
  uniqueBonus?: number;
  speedBonus?: number;
  goldenMultiplier?: number;
  lockBonus?: number;
  totalPoints?: number;
  invalidReason?: string;
  isChallenged?: boolean;
}

export interface PlayerRoundData {
  playerName: string;
  isAI: boolean;
  answers: Record<string, AnswerItem>;
  totalScore: number;
  comboMultiplier: number;
  validCount: number;
  uniqueCount: number;
  fastCount: number;
  finishTime: number; // in seconds
}

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  vibrationEnabled: boolean;
  animationsEnabled: boolean;
  language: 'tr' | 'en';
}

export interface CustomGameConfig {
  categoryCount: number;
  timeLimit: number;
  difficulty: Difficulty;
  specialEventsEnabled: boolean;
}

export interface PlayerProfile {
  name: string;
  avatar: string;
  title: string;
  level: number;
  xp: number;
  coins: number;
  stats: {
    gamesPlayed: number;
    wins: number;
    losses: number;
    highestScore: number;
    maxCombo: number;
    totalValidAnswers: number;
    totalUniqueAnswers: number;
    survivalBestStreak: number;
    dailyStreak: number;
    lastDailyDate: string;
  };
  unlockedThemes: string[];
  unlockedAvatars: string[];
  unlockedTitles: string[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  coinReward: number;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  unlockedAt?: string;
}

export interface LeaderboardEntry {
  id: string;
  playerName: string;
  avatar: string;
  score: number;
  mode: GameMode;
  difficulty: Difficulty;
  date: string;
  letter: string;
}

export interface DailyChallengeConfig {
  date: string; // YYYY-MM-DD
  letter: string;
  categoryIds: string[];
  specialRuleName: string;
  specialRuleDescription: string;
  playerBestScore?: number;
  completed?: boolean;
}
