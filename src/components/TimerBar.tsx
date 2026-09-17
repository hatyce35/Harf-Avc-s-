import React from 'react';
import { Clock, Zap } from 'lucide-react';

interface TimerBarProps {
  timeRemaining: number;
  totalTime: number;
}

export const TimerBar: React.FC<TimerBarProps> = ({ timeRemaining, totalTime }) => {
  const percentage = Math.max(0, Math.min(100, (timeRemaining / totalTime) * 100));
  const isCritical = timeRemaining <= 10;
  const isUrgent = timeRemaining <= 5;

  // Speed bonus tiers
  const isMaxSpeed = timeRemaining >= totalTime * 0.6;
  const isMidSpeed = timeRemaining >= totalTime * 0.3 && !isMaxSpeed;

  return (
    <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-3 shadow-lg">
      <div className="flex items-center justify-between mb-2">
        {/* Timer countdown with warning colors */}
        <div className="flex items-center gap-2">
          <div
            className={`p-1.5 rounded-lg transition-colors ${
              isCritical
                ? 'bg-rose-500/20 text-rose-400 animate-pulse'
                : 'bg-emerald-500/20 text-emerald-400'
            }`}
          >
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span
                className={`text-2xl font-black font-display tracking-tight transition-transform ${
                  isUrgent
                    ? 'text-rose-400 scale-110 animate-ping'
                    : isCritical
                    ? 'text-rose-400 scale-105'
                    : 'text-white'
                }`}
              >
                {timeRemaining}
              </span>
              <span className="text-xs text-slate-400 font-semibold">sn</span>
            </div>
          </div>
        </div>

        {/* Speed bonus status badge */}
        <div className="flex items-center gap-1 text-xs">
          <Zap className={`w-3.5 h-3.5 ${isMaxSpeed ? 'text-amber-400 animate-bounce' : isMidSpeed ? 'text-sky-400' : 'text-slate-500'}`} />
          <span className="font-bold text-slate-300">
            {isMaxSpeed ? (
              <span className="text-amber-400">Hız Bonusu: +10 Puan</span>
            ) : isMidSpeed ? (
              <span className="text-sky-400">Hız Bonusu: +6 Puan</span>
            ) : (
              <span className="text-slate-400">Hız Bonusu: Normal</span>
            )}
          </span>
        </div>
      </div>

      {/* Progress Track */}
      <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/40">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            isCritical
              ? 'bg-gradient-to-r from-rose-500 to-red-600 animate-pulse'
              : percentage > 50
              ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
              : 'bg-gradient-to-r from-amber-500 to-orange-400'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
