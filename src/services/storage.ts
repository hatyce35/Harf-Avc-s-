import { PlayerProfile, GameSettings, LeaderboardEntry, DailyChallengeConfig } from '../types';

const STORAGE_KEYS = {
  PROFILE: 'harf_avcisi_profile_v1',
  SETTINGS: 'harf_avcisi_settings_v1',
  LEADERBOARD: 'harf_avcisi_leaderboard_v1',
  DAILY: 'harf_avcisi_daily_v1',
  TUTORIAL_COMPLETED: 'harf_avcisi_tutorial_done_v1'
};

export const DEFAULT_AVATARS = [
  '⚡', '🦊', '🦁', '🦉', '👑', '🚀', '🎯', '🔥', '💎', '🦄'
];

export const TITLES_BY_LEVEL: Record<number, string> = {
  1: 'Acemi Avcı',
  2: 'Kelime Çırağı',
  3: 'Harf Dedektifi',
  4: 'Hızlı Kalem',
  5: 'Kelime Ustası',
  7: 'Sözlük Bükücü',
  10: 'Harf Şampiyonu',
  15: 'Kelime Efsanesi',
  20: 'Büyük Üstat'
};

export function getTitleForLevel(level: number): string {
  let matched = 'Acemi Avcı';
  Object.keys(TITLES_BY_LEVEL).forEach(lvlStr => {
    const lvl = Number(lvlStr);
    if (level >= lvl) {
      matched = TITLES_BY_LEVEL[lvl];
    }
  });
  return matched;
}

export const INITIAL_PROFILE: PlayerProfile = {
  name: 'Oyuncu',
  avatar: '⚡',
  title: 'Acemi Avcı',
  level: 1,
  xp: 0,
  coins: 50,
  stats: {
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    highestScore: 0,
    maxCombo: 1,
    totalValidAnswers: 0,
    totalUniqueAnswers: 0,
    survivalBestStreak: 0,
    dailyStreak: 0,
    lastDailyDate: ''
  },
  unlockedThemes: ['default'],
  unlockedAvatars: ['⚡', '🦊', '🦁'],
  unlockedTitles: ['Acemi Avcı']
};

export const INITIAL_SETTINGS: GameSettings = {
  soundEnabled: true,
  musicEnabled: true,
  vibrationEnabled: true,
  animationsEnabled: true,
  language: 'tr'
};

export const INITIAL_LEADERBOARD: LeaderboardEntry[] = [
  { id: '1', playerName: 'EfsaneKaan', avatar: '👑', score: 480, mode: 'quick', difficulty: 'expert', date: 'Bugün', letter: 'K' },
  { id: '2', playerName: 'KelimeCanavarı', avatar: '🦁', score: 430, mode: 'ai_battle', difficulty: 'hard', date: 'Bugün', letter: 'A' },
  { id: '3', playerName: 'SözlükAvcısı', avatar: '🦊', score: 390, mode: 'quick', difficulty: 'normal', date: 'Dün', letter: 'M' },
  { id: '4', playerName: 'HızlıZeynep', avatar: '⚡', score: 360, mode: 'survival', difficulty: 'hard', date: 'Dün', letter: 'B' },
  { id: '5', playerName: 'HarfUstası', avatar: '🦉', score: 310, mode: 'ai_battle', difficulty: 'normal', date: '2 gün önce', letter: 'S' }
];

export function getStoredProfile(): PlayerProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...INITIAL_PROFILE, ...parsed, stats: { ...INITIAL_PROFILE.stats, ...(parsed.stats || {}) } };
    }
  } catch (err) {
    console.error('Error loading profile:', err);
  }
  return INITIAL_PROFILE;
}

export function saveProfile(profile: PlayerProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (err) {
    console.error('Error saving profile:', err);
  }
}

export function getStoredSettings(): GameSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) {
      return { ...INITIAL_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (err) {
    console.error('Error loading settings:', err);
  }
  return INITIAL_SETTINGS;
}

export function saveSettings(settings: GameSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Error saving settings:', err);
  }
}

export function getStoredLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LEADERBOARD);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error loading leaderboard:', err);
  }
  return INITIAL_LEADERBOARD;
}

export function addLeaderboardEntry(entry: Omit<LeaderboardEntry, 'id'>): LeaderboardEntry[] {
  try {
    const current = getStoredLeaderboard();
    const newEntry: LeaderboardEntry = {
      ...entry,
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
    };
    const updated = [...current, newEntry].sort((a, b) => b.score - a.score).slice(0, 20);
    localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Error saving leaderboard:', err);
    return INITIAL_LEADERBOARD;
  }
}

export function isTutorialCompleted(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEYS.TUTORIAL_COMPLETED) === 'true';
  } catch {
    return false;
  }
}

export function setTutorialCompleted(completed: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TUTORIAL_COMPLETED, completed ? 'true' : 'false');
  } catch (err) {
    console.error('Error saving tutorial status:', err);
  }
}

export function getDailyChallengeConfig(): DailyChallengeConfig {
  const today = new Date().toISOString().split('T')[0];
  const stored = localStorage.getItem(STORAGE_KEYS.DAILY);
  
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed.date === today) {
        return parsed;
      }
    } catch {
      // ignore
    }
  }

  // Generate deterministic daily challenge from today's date
  const dateNum = today.split('-').reduce((acc, part) => acc + parseInt(part, 10), 0);
  const letters = ['M', 'K', 'S', 'B', 'A', 'T', 'D', 'E', 'L', 'P'];
  const dailyLetter = letters[dateNum % letters.length];

  const dailyCats = ['name', 'city', 'animal', 'plant', 'food', 'profession'];

  const rules = [
    { name: 'Özgünlük Bonusu', desc: 'Yalnızca benzersiz cevaplar tam puan ve bonus kazanır.' },
    { name: 'Çift Altın Kategori', desc: 'Günün turunda iki kategori x2 altın puan verir.' },
    { name: 'Hızlı Avcı', desc: 'İlk 20 saniyede bitirirsen ekstra +50 hız puanı.' }
  ];
  const chosenRule = rules[dateNum % rules.length];

  const newConfig: DailyChallengeConfig = {
    date: today,
    letter: dailyLetter,
    categoryIds: dailyCats,
    specialRuleName: chosenRule.name,
    specialRuleDescription: chosenRule.desc,
    playerBestScore: 0,
    completed: false
  };

  try {
    localStorage.setItem(STORAGE_KEYS.DAILY, JSON.stringify(newConfig));
  } catch {
    // ignore
  }

  return newConfig;
}

export function saveDailyChallengeProgress(score: number): void {
  const current = getDailyChallengeConfig();
  const updated: DailyChallengeConfig = {
    ...current,
    completed: true,
    playerBestScore: Math.max(current.playerBestScore || 0, score)
  };
  try {
    localStorage.setItem(STORAGE_KEYS.DAILY, JSON.stringify(updated));
  } catch (err) {
    console.error('Error saving daily:', err);
  }
}
