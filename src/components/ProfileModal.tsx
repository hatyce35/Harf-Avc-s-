import React, { useState } from 'react';
import { X, Check, Award, Flame, Trophy, Star, Sparkles } from 'lucide-react';
import { PlayerProfile } from '../types';
import { DEFAULT_AVATARS, TITLES_BY_LEVEL, getTitleForLevel } from '../services/storage';
import { soundManager } from '../services/sound';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: PlayerProfile;
  onSaveProfile: (updated: PlayerProfile) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
}) => {
  const [name, setName] = useState(profile.name);
  const [selectedAvatar, setSelectedAvatar] = useState(profile.avatar);
  const [selectedTitle, setSelectedTitle] = useState(profile.title);

  if (!isOpen) return null;

  const xpForNextLevel = profile.level * 100;
  const currentLevelProgress = Math.min(100, Math.round((profile.xp % xpForNextLevel) / (xpForNextLevel / 100)));

  // Titles player is eligible for based on level
  const eligibleTitles = Object.entries(TITLES_BY_LEVEL)
    .filter(([lvl]) => profile.level >= Number(lvl))
    .map(([, title]) => title);

  const handleSave = () => {
    soundManager.playClick();
    onSaveProfile({
      ...profile,
      name: name.trim() || profile.name,
      avatar: selectedAvatar,
      title: selectedTitle,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-2xl shadow-lg shadow-orange-500/20">
              {selectedAvatar}
            </div>
            <div>
              <h3 className="text-lg font-black text-white font-display">OYUNCU PROFİLİ</h3>
              <p className="text-xs text-slate-400">Lv.{profile.level} {selectedTitle}</p>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Level & XP Progress Bar */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-amber-400 flex items-center gap-1">
              <Star className="w-3.5 h-3.5" /> Seviye {profile.level}
            </span>
            <span className="text-slate-400 font-semibold">
              {profile.xp % xpForNextLevel} / {xpForNextLevel} XP
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-300"
              style={{ width: `${currentLevelProgress}%` }}
            />
          </div>
        </div>

        {/* Name input */}
        <div>
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
            Oyuncu İsmi
          </label>
          <input
            type="text"
            maxLength={18}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-950/80 rounded-xl text-sm font-medium text-white border border-slate-800 focus:border-amber-400 focus:outline-none"
          />
        </div>

        {/* Avatar Picker */}
        <div>
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
            Avatar Seçimi
          </label>
          <div className="grid grid-cols-5 gap-2">
            {DEFAULT_AVATARS.map((av) => (
              <button
                key={av}
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  setSelectedAvatar(av);
                }}
                className={`h-12 rounded-xl text-xl flex items-center justify-center border transition-all ${
                  selectedAvatar === av
                    ? 'bg-amber-400/20 border-amber-400 text-white shadow-md shadow-amber-400/10 scale-105'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                {av}
              </button>
            ))}
          </div>
        </div>

        {/* Title selector */}
        <div>
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
            Unvan Seçimi
          </label>
          <div className="flex flex-wrap gap-2">
            {eligibleTitles.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  setSelectedTitle(t);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedTitle === t
                    ? 'bg-amber-400 text-slate-950'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Dashboard */}
        <div>
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
            İstatistiklerin
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-center">
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Toplam Oyun</span>
              <span className="text-base font-black text-white font-display">{profile.stats.gamesPlayed}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Zafer</span>
              <span className="text-base font-black text-emerald-400 font-display">{profile.stats.wins}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">En Yüksek Skor</span>
              <span className="text-base font-black text-amber-400 font-display">{profile.stats.highestScore}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">En Yüksek Kombo</span>
              <span className="text-base font-black text-orange-400 font-display">x{profile.stats.maxCombo}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Özgün Kelimeler</span>
              <span className="text-base font-black text-sky-400 font-display">{profile.stats.totalUniqueAnswers}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Hayatta Kalma</span>
              <span className="text-base font-black text-purple-400 font-display">{profile.stats.survivalBestStreak} Tur</span>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-sm shadow-xl shadow-orange-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 font-display"
        >
          <Check className="w-4 h-4" />
          <span>DEĞİŞİKLİKLERİ KAYDET</span>
        </button>
      </div>
    </div>
  );
};
