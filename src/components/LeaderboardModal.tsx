import React, { useState } from 'react';
import { X, Trophy, Medal, Flame } from 'lucide-react';
import { LeaderboardEntry } from '../types';
import { getStoredLeaderboard } from '../services/storage';
import { soundManager } from '../services/sound';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlayerName: string;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  currentPlayerName,
}) => {
  const [tab, setTab] = useState<'daily' | 'weekly' | 'all'>('all');
  const entries = getStoredLeaderboard();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/20 text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white font-display">LİDER TABLOSU</h3>
              <p className="text-xs text-slate-400">En yüksek puanlı kelime avcıları</p>
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

        {/* Filter Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950/80 rounded-2xl border border-slate-800">
          <button
            onClick={() => {
              soundManager.playClick();
              setTab('daily');
            }}
            className={`py-2 rounded-xl text-xs font-bold transition-all ${
              tab === 'daily' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            Günlük
          </button>
          <button
            onClick={() => {
              soundManager.playClick();
              setTab('weekly');
            }}
            className={`py-2 rounded-xl text-xs font-bold transition-all ${
              tab === 'weekly' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            Haftalık
          </button>
          <button
            onClick={() => {
              soundManager.playClick();
              setTab('all');
            }}
            className={`py-2 rounded-xl text-xs font-bold transition-all ${
              tab === 'all' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            Tüm Zamanlar
          </button>
        </div>

        {/* List of Entries */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {entries.map((entry, index) => {
            const isTop3 = index < 3;
            const isMe = entry.playerName.toLowerCase() === currentPlayerName.toLowerCase();

            return (
              <div
                key={entry.id}
                className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                  isMe
                    ? 'bg-amber-500/15 border-amber-500/40'
                    : isTop3
                    ? 'bg-slate-950/80 border-slate-800'
                    : 'bg-slate-950/40 border-slate-850'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Rank badge */}
                  <div className="w-7 text-center font-black font-display text-sm">
                    {index === 0 ? (
                      <span className="text-yellow-400">🥇</span>
                    ) : index === 1 ? (
                      <span className="text-slate-300">🥈</span>
                    ) : index === 2 ? (
                      <span className="text-amber-600">🥉</span>
                    ) : (
                      <span className="text-slate-500 text-xs">#{index + 1}</span>
                    )}
                  </div>

                  <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-base">
                    {entry.avatar}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs sm:text-sm font-bold text-white">
                        {entry.playerName}
                      </span>
                      {isMe && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30">
                          Sen
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      Harf: {entry.letter} • {entry.date}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-base sm:text-lg font-black text-amber-400 font-display">
                    {entry.score}
                  </span>
                  <span className="text-[10px] text-slate-500 block font-semibold">Puan</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center text-[11px] text-slate-500 border-t border-slate-800/80 pt-3">
          <span>Skorlar yerel olarak kaydedilir ve güncellenir.</span>
        </div>
      </div>
    </div>
  );
};
