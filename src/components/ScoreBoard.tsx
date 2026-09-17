import React from 'react';
import { Flame, Trophy } from 'lucide-react';

interface ScoreBoardProps {
  score: number;
  combo: number;
  opponentScore?: number;
  opponentName?: string;
  opponentAvatar?: string;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  score,
  combo,
  opponentScore,
  opponentName,
  opponentAvatar = '🤖',
}) => {
  return (
    <div className="flex items-center justify-between gap-3 w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-3 shadow-md">
      {/* Player Score */}
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
          <Trophy className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
            Skorun
          </span>
          <span className="text-xl sm:text-2xl font-black text-amber-400 font-display">
            {score}
          </span>
        </div>
      </div>

      {/* Dynamic Combo Badge */}
      {combo > 1 ? (
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-orange-600/30 to-rose-600/30 border border-orange-500/50 text-orange-300 shadow-lg shadow-orange-500/20 animate-bounce">
          <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
          <span className="text-xs sm:text-sm font-black tracking-wider uppercase font-display">
            KOMBO x{combo}
          </span>
        </div>
      ) : (
        <div className="text-[11px] text-slate-500 font-semibold px-2 py-1 rounded-lg bg-slate-800/40">
          Kombo x1
        </div>
      )}

      {/* Opponent score if in AI or Friend mode */}
      {opponentScore !== undefined && (
        <div className="flex items-center gap-2 text-right">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block truncate max-w-[80px]">
              {opponentName || 'Rakip'}
            </span>
            <span className="text-xl sm:text-2xl font-black text-slate-300 font-display">
              {opponentScore}
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-lg">
            {opponentAvatar}
          </div>
        </div>
      )}
    </div>
  );
};
