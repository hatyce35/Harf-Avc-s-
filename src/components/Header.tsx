import React from 'react';
import { Volume2, VolumeX, Trophy, Award, User, Settings as SettingsIcon } from 'lucide-react';
import { PlayerProfile } from '../types';
import { soundManager } from '../services/sound';

interface HeaderProps {
  profile: PlayerProfile;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenProfile: () => void;
  onOpenLeaderboard: () => void;
  onOpenAchievements: () => void;
  onOpenSettings: () => void;
  onGoHome?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  soundEnabled,
  onToggleSound,
  onOpenProfile,
  onOpenLeaderboard,
  onOpenAchievements,
  onOpenSettings,
  onGoHome,
}) => {
  // Level progress calculation: each level needs level * 100 XP
  const xpForNextLevel = profile.level * 100;
  const currentLevelProgress = Math.min(100, Math.round((profile.xp % xpForNextLevel) / (xpForNextLevel / 100)));

  return (
    <header className="w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-3 py-2.5 sm:px-6">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
        {/* Game Title & Brand */}
        <button
          onClick={() => {
            soundManager.playClick();
            onGoHome?.();
          }}
          className="flex items-center gap-2 group text-left transition-transform active:scale-95"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-orange-500/20 font-display">
            H
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5 font-display">
              HARF AVCISI
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30">
                PRO
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 hidden sm:block font-medium">
              Süreyi Yen • Kelimeyi Bul
            </p>
          </div>
        </button>

        {/* Player Stats & Level Pill */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Level & XP */}
          <button
            onClick={() => {
              soundManager.playClick();
              onOpenProfile();
            }}
            className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-full px-2.5 py-1 text-xs transition-all active:scale-95"
            title="Profil ve Seviye"
          >
            <span className="text-sm">{profile.avatar}</span>
            <div className="text-left hidden xs:block">
              <div className="flex items-center gap-1">
                <span className="font-bold text-amber-400">Lv.{profile.level}</span>
                <span className="text-[10px] text-slate-400 truncate max-w-[80px]">
                  {profile.title}
                </span>
              </div>
              <div className="w-14 h-1.5 bg-slate-700 rounded-full overflow-hidden mt-0.5">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-300"
                  style={{ width: `${currentLevelProgress}%` }}
                />
              </div>
            </div>
          </button>

          {/* Coins */}
          <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 rounded-full px-2.5 py-1 text-xs font-bold text-amber-400">
            <span>🪙</span>
            <span>{profile.coins}</span>
          </div>

          {/* Navigation Action Buttons */}
          <button
            onClick={() => {
              soundManager.playClick();
              onOpenLeaderboard();
            }}
            className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 text-slate-300 hover:text-amber-400 transition-colors"
            title="Lider Tablosu"
          >
            <Trophy className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onOpenAchievements();
            }}
            className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 text-slate-300 hover:text-orange-400 transition-colors"
            title="Başarımlar"
          >
            <Award className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              onToggleSound();
              soundManager.playClick();
            }}
            className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 text-slate-300 hover:text-white transition-colors"
            title={soundEnabled ? 'Sesi Kapat' : 'Sesi Aç'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-rose-400" />
            )}
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onOpenSettings();
            }}
            className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 text-slate-300 hover:text-white transition-colors"
            title="Ayarlar"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
