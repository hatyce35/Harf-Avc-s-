// Profile Manager for Harf Avcısı
export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  color: string;
  createdAt: number;
  stats: {
    roundsPlayed: number;
    totalScore: number;
    wins: number;
  };
}

const STORAGE_KEY = 'harf_avcisi_profiles_v2';
const ACTIVE_PROFILE_KEY = 'harf_avcisi_active_profile_id_v2';

export const AVATAR_LIST = [
  '🦊', '🦁', '🐱', '🐼', '🚀', '⚡', '💎', '👑', '🌟', '🎯', '🔥', '🌸', '🦅', '🐬', '🎮'
];

export const COLOR_LIST = [
  { name: 'Zümrüt Yeşili', bg: 'bg-emerald-500', text: 'text-emerald-900', border: 'border-emerald-300' },
  { name: 'Gece Moru', bg: 'bg-purple-600', text: 'text-purple-900', border: 'border-purple-300' },
  { name: 'Altın Kehribar', bg: 'bg-amber-500', text: 'text-amber-900', border: 'border-amber-300' },
  { name: 'Gül Pembesi', bg: 'bg-rose-500', text: 'text-rose-900', border: 'border-rose-300' },
  { name: 'Okyanus Mavisi', bg: 'bg-sky-500', text: 'text-sky-900', border: 'border-sky-300' },
  { name: 'İndigo', bg: 'bg-indigo-600', text: 'text-indigo-900', border: 'border-indigo-300' },
];

export const profileManager = {
  getAllProfiles(): UserProfile[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  getActiveProfile(): UserProfile | null {
    const profiles = this.getAllProfiles();
    if (profiles.length === 0) return null;
    const activeId = localStorage.getItem(ACTIVE_PROFILE_KEY);
    const found = profiles.find(p => p.id === activeId);
    return found || profiles[0];
  },

  saveProfile(name: string, avatar: string, color: string): UserProfile {
    const profiles = this.getAllProfiles();
    const newProfile: UserProfile = {
      id: 'p_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
      name: name.trim() || 'Oyuncu',
      avatar: avatar || '🦊',
      color: color || 'bg-amber-500',
      createdAt: Date.now(),
      stats: {
        roundsPlayed: 0,
        totalScore: 0,
        wins: 0,
      }
    };

    profiles.push(newProfile);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
    localStorage.setItem(ACTIVE_PROFILE_KEY, newProfile.id);
    return newProfile;
  },

  updateProfile(id: string, updates: Partial<Pick<UserProfile, 'name' | 'avatar' | 'color'>>): UserProfile | null {
    const profiles = this.getAllProfiles();
    const index = profiles.findIndex(p => p.id === id);
    if (index === -1) return null;

    profiles[index] = {
      ...profiles[index],
      ...updates,
      name: updates.name ? updates.name.trim() : profiles[index].name
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
    return profiles[index];
  },

  setActiveProfile(id: string): UserProfile | null {
    const profiles = this.getAllProfiles();
    const found = profiles.find(p => p.id === id);
    if (found) {
      localStorage.setItem(ACTIVE_PROFILE_KEY, id);
      return found;
    }
    return null;
  },

  deleteProfile(id: string): UserProfile | null {
    let profiles = this.getAllProfiles();
    profiles = profiles.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));

    if (profiles.length > 0) {
      localStorage.setItem(ACTIVE_PROFILE_KEY, profiles[0].id);
      return profiles[0];
    } else {
      localStorage.removeItem(ACTIVE_PROFILE_KEY);
      return null;
    }
  },

  recordRound(score: number, isWin: boolean) {
    const active = this.getActiveProfile();
    if (!active) return;
    const profiles = this.getAllProfiles();
    const index = profiles.findIndex(p => p.id === active.id);
    if (index !== -1) {
      profiles[index].stats.roundsPlayed += 1;
      profiles[index].stats.totalScore += score;
      if (isWin) profiles[index].stats.wins += 1;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
    }
  }
};
