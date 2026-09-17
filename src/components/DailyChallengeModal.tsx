import React from 'react';
import { X, Calendar, Flame, Play, Trophy, Sparkles } from 'lucide-react';
import { getDailyChallengeConfig } from '../services/storage';
import { CATEGORY_MAP } from '../data/categories';
import { soundManager } from '../services/sound';

interface DailyChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartDaily: () => void;
}

export const DailyChallengeModal: React.FC<DailyChallengeModalProps> = ({
  isOpen,
  onClose,
  onStartDaily,
}) => {
  if (!isOpen) return null;

  const daily = getDailyChallengeConfig();
  const categoryObjects = daily.categoryIds.map((id) => CATEGORY_MAP.get(id)).filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/15 border border-purple-500/20 text-purple-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white font-display">GÜNÜN MEYDAN OKUMASI</h3>
              <p className="text-xs text-slate-400">Tarih: {daily.date}</p>
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

        {/* Letter & Rule Banner */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-950/40 via-slate-950 to-slate-950 border border-purple-500/30 text-center space-y-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">
            GÜNÜN HARFİ
          </span>
          <div className="text-6xl font-black text-purple-300 font-display">
            {daily.letter}
          </div>

          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-left">
            <div className="flex items-center gap-1.5 text-xs font-bold text-purple-300 mb-0.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Özel Kural: {daily.specialRuleName}</span>
            </div>
            <p className="text-[11px] text-slate-400">
              {daily.specialRuleDescription}
            </p>
          </div>
        </div>

        {/* Categories list */}
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Günün Kategorileri
          </span>
          <div className="grid grid-cols-2 gap-2">
            {categoryObjects.map((cat) => (
              <div
                key={cat!.id}
                className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-300 flex items-center gap-2"
              >
                <span>•</span>
                <span>{cat!.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Player best score today */}
        {daily.playerBestScore && daily.playerBestScore > 0 ? (
          <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 font-bold">
            <span className="flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-emerald-400" />
              Bugünkü En İyi Skorun:
            </span>
            <span className="text-base font-black font-display">{daily.playerBestScore} Puan</span>
          </div>
        ) : null}

        {/* Start Button */}
        <button
          onClick={() => {
            soundManager.playClick();
            onStartDaily();
            onClose();
          }}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-black text-sm shadow-xl shadow-purple-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 font-display"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>MEYDAN OKUMAYI BAŞLAT</span>
        </button>
      </div>
    </div>
  );
};
