// Dynamic Turkish Bot Generator with 5 Difficulty Tiers

export type BotDifficulty = 'very_easy' | 'easy' | 'medium' | 'hard' | 'very_hard';

export interface BotDifficultyConfig {
  id: BotDifficulty;
  name: string;
  badge: string;
  color: string;
  borderColor: string;
  textColor: string;
  description: string;
  speedMinMs: number; // delay per word
  speedMaxMs: number;
  accuracy: number; // 0.0 to 1.0
  wordCountExpected: number; // out of 6
}

export const BOT_DIFFICULTIES: Record<BotDifficulty, BotDifficultyConfig> = {
  very_easy: {
    id: 'very_easy',
    name: 'Çok Kolay',
    badge: '🌱 Çırak Bot',
    color: 'bg-emerald-100',
    borderColor: 'border-emerald-300',
    textColor: 'text-emerald-800',
    description: 'Yavaş yazar, nadiren kelime bulur (1-2 kelime).',
    speedMinMs: 8000,
    speedMaxMs: 14000,
    accuracy: 0.50,
    wordCountExpected: 2
  },
  easy: {
    id: 'easy',
    name: 'Kolay',
    badge: '🌿 Acemi Bot',
    color: 'bg-teal-100',
    borderColor: 'border-teal-300',
    textColor: 'text-teal-800',
    description: 'Sakin tempoda oynar, 2-3 kelime yazar.',
    speedMinMs: 6000,
    speedMaxMs: 10000,
    accuracy: 0.68,
    wordCountExpected: 3
  },
  medium: {
    id: 'medium',
    name: 'Orta',
    badge: '⚡ Usta Bot',
    color: 'bg-amber-100',
    borderColor: 'border-amber-300',
    textColor: 'text-amber-900',
    description: 'Dengeli yarışmacı, 4-5 kelimeyi hızla bulur.',
    speedMinMs: 4000,
    speedMaxMs: 7000,
    accuracy: 0.86,
    wordCountExpected: 4
  },
  hard: {
    id: 'hard',
    name: 'Zor',
    badge: '🔥 Şampiyon Bot',
    color: 'bg-purple-100',
    borderColor: 'border-purple-300',
    textColor: 'text-purple-900',
    description: 'Çok hızlıdır, neredeyse tüm kategorileri doldurur.',
    speedMinMs: 2500,
    speedMaxMs: 5000,
    accuracy: 0.94,
    wordCountExpected: 5
  },
  very_hard: {
    id: 'very_hard',
    name: 'Çok Zor',
    badge: '👑 Efsane Yapay Zeka',
    color: 'bg-rose-100',
    borderColor: 'border-rose-300',
    textColor: 'text-rose-900',
    description: 'Yıldırım hızında 6/6 eksiksiz ve nadir kelimeler yazar.',
    speedMinMs: 1200,
    speedMaxMs: 3000,
    accuracy: 0.99,
    wordCountExpected: 6
  }
};

// Rich list of authentic Turkish Male and Female names
export const TURKISH_GIRL_NAMES = [
  'Ayşe', 'Zeynep', 'Elif', 'Derya', 'Selin', 'İrem', 'Merve', 'Ceren',
  'Yağmur', 'Defne', 'Tuğba', 'Melis', 'Esra', 'Begüm', 'Aslı', 'Leyla',
  'Sena', 'Damla', 'Özge', 'Hilal', 'Büşra', 'Gizem', 'Sinem', 'Beren',
  'Ece', 'Gülşah', 'Hazal', 'Simge', 'Burcu', 'Ebru'
];

export const TURKISH_BOY_NAMES = [
  'Ahmet', 'Mehmet', 'Kerem', 'Burak', 'Emre', 'Tolga', 'Can', 'Caner',
  'Barış', 'Mert', 'Kaan', 'Arda', 'Alperen', 'Onur', 'Serkan', 'Batuhan',
  'Ozan', 'Doruk', 'Yiğit', 'Berkay', 'Cenk', 'Sinan', 'Volkan', 'Murat',
  'Furkan', 'Umut', 'Tuna', 'Eren', 'Kadir', 'Enes'
];

export const BOT_AVATARS = [
  { emoji: '🤖', bg: 'bg-sky-500' },
  { emoji: '🧠', bg: 'bg-indigo-600' },
  { emoji: '⚡', bg: 'bg-amber-500' },
  { emoji: '🎯', bg: 'bg-rose-500' },
  { emoji: '🦁', bg: 'bg-emerald-600' },
  { emoji: '🦊', bg: 'bg-orange-500' },
  { emoji: '🦉', bg: 'bg-purple-600' },
];

export interface GeneratedBot {
  name: string;
  gender: 'female' | 'male';
  difficulty: BotDifficulty;
  difficultyConfig: BotDifficultyConfig;
  avatar: string;
  avatarBg: string;
}

export function generateRandomBot(difficulty: BotDifficulty = 'medium'): GeneratedBot {
  const isFemale = Math.random() > 0.5;
  const nameList = isFemale ? TURKISH_GIRL_NAMES : TURKISH_BOY_NAMES;
  const name = nameList[Math.floor(Math.random() * nameList.length)];
  const avatarObj = BOT_AVATARS[Math.floor(Math.random() * BOT_AVATARS.length)];
  const diffConfig = BOT_DIFFICULTIES[difficulty];

  return {
    name,
    gender: isFemale ? 'female' : 'male',
    difficulty,
    difficultyConfig: diffConfig,
    avatar: avatarObj.emoji,
    avatarBg: avatarObj.bg
  };
}
