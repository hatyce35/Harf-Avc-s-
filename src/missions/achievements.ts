import { Achievement, PlayerProfile } from '../types';

const ACHIEVEMENTS_STORAGE_KEY = 'harf_avcisi_achievements_v1';

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_victory',
    title: 'İlk Zafer',
    description: 'İlk kelime mücadelesini kazan.',
    icon: '🏆',
    xpReward: 50,
    coinReward: 25,
    unlocked: false,
    progress: 0,
    maxProgress: 1
  },
  {
    id: 'combo_master',
    title: 'Kombo Ustası',
    description: 'Tek turda en az x3 kombo çarpanına ulaş.',
    icon: '🔥',
    xpReward: 100,
    coinReward: 50,
    unlocked: false,
    progress: 0,
    maxProgress: 3
  },
  {
    id: 'speed_demon',
    title: 'Hız Şeytanı',
    description: 'Sürenin yarısından fazlası kala tüm cevapları bitir.',
    icon: '⚡',
    xpReward: 80,
    coinReward: 40,
    unlocked: false,
    progress: 0,
    maxProgress: 1
  },
  {
    id: 'word_genius',
    title: 'Kelime Dehası',
    description: 'Tek bir turda 250 veya daha yüksek skor elde et.',
    icon: '🧠',
    xpReward: 150,
    coinReward: 80,
    unlocked: false,
    progress: 0,
    maxProgress: 250
  },
  {
    id: 'perfect_round',
    title: 'Kusursuz Tur',
    description: 'Bir turdaki tüm kategorilere geçerli cevap ver (%100 isabet).',
    icon: '🎯',
    xpReward: 120,
    coinReward: 60,
    unlocked: false,
    progress: 0,
    maxProgress: 1
  },
  {
    id: 'unique_hunter',
    title: 'Özgün Avcı',
    description: 'Rakibinin bilemediği veya senden farklı yazdığı 3 özgün cevap ver.',
    icon: '💎',
    xpReward: 100,
    coinReward: 50,
    unlocked: false,
    progress: 0,
    maxProgress: 3
  },
  {
    id: 'category_king',
    title: 'Kategori Kralı',
    description: 'Toplamda 50 geçerli kelime bul.',
    icon: '👑',
    xpReward: 200,
    coinReward: 100,
    unlocked: false,
    progress: 0,
    maxProgress: 50
  },
  {
    id: 'never_stop',
    title: 'Asla Durma',
    description: 'Toplam 5 oyun oyna.',
    icon: '🏃',
    xpReward: 75,
    coinReward: 35,
    unlocked: false,
    progress: 0,
    maxProgress: 5
  }
];

export function getStoredAchievements(): Achievement[] {
  try {
    const raw = localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);
    if (raw) {
      const parsed: Achievement[] = JSON.parse(raw);
      // Merge with INITIAL_ACHIEVEMENTS to handle any new ones
      return INITIAL_ACHIEVEMENTS.map(initial => {
        const found = parsed.find(p => p.id === initial.id);
        return found ? { ...initial, ...found } : initial;
      });
    }
  } catch {
    // ignore
  }
  return INITIAL_ACHIEVEMENTS;
}

export function saveAchievements(achievements: Achievement[]): void {
  try {
    localStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(achievements));
  } catch (err) {
    console.error('Error saving achievements:', err);
  }
}

/**
 * Checks round performance against achievements and returns newly unlocked achievements
 */
export function checkRoundAchievements(params: {
  playerScore: number;
  opponentScore: number;
  combo: number;
  validCount: number;
  totalCategories: number;
  uniqueCount: number;
  isSpeedy: boolean;
  profile: PlayerProfile;
}): { updated: Achievement[]; newlyUnlocked: Achievement[] } {
  const current = getStoredAchievements();
  const newlyUnlocked: Achievement[] = [];

  const isWin = params.playerScore > params.opponentScore;
  const isPerfect = params.validCount === params.totalCategories && params.totalCategories >= 4;

  const updated = current.map(item => {
    if (item.unlocked) return item;

    let newProgress = item.progress;
    let willUnlock = false;

    switch (item.id) {
      case 'first_victory':
        if (isWin) {
          newProgress = 1;
          willUnlock = true;
        }
        break;

      case 'combo_master':
        newProgress = Math.max(newProgress, params.combo);
        if (newProgress >= item.maxProgress) willUnlock = true;
        break;

      case 'speed_demon':
        if (params.isSpeedy && params.validCount >= 3) {
          newProgress = 1;
          willUnlock = true;
        }
        break;

      case 'word_genius':
        newProgress = Math.max(newProgress, params.playerScore);
        if (newProgress >= item.maxProgress) willUnlock = true;
        break;

      case 'perfect_round':
        if (isPerfect) {
          newProgress = 1;
          willUnlock = true;
        }
        break;

      case 'unique_hunter':
        newProgress = Math.max(newProgress, params.uniqueCount);
        if (newProgress >= item.maxProgress) willUnlock = true;
        break;

      case 'category_king':
        newProgress = (params.profile.stats.totalValidAnswers || 0) + params.validCount;
        if (newProgress >= item.maxProgress) willUnlock = true;
        break;

      case 'never_stop':
        newProgress = (params.profile.stats.gamesPlayed || 0) + 1;
        if (newProgress >= item.maxProgress) willUnlock = true;
        break;
    }

    if (willUnlock) {
      const unlockedItem = {
        ...item,
        progress: item.maxProgress,
        unlocked: true,
        unlockedAt: new Date().toLocaleDateString('tr-TR')
      };
      newlyUnlocked.push(unlockedItem);
      return unlockedItem;
    }

    return {
      ...item,
      progress: Math.min(newProgress, item.maxProgress)
    };
  });

  saveAchievements(updated);
  return { updated, newlyUnlocked };
}
