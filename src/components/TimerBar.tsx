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

  return (
    <div className="w-full bg-white/90 backdrop-blur-xs border-2 border-amber-200/90 rounded-2xl p-2 sm:p-2.5 shadow-2xs">
      <div className="flex items-center justify-between mb-1.5 px-0.5">
        {/* Timer countdown with warning colors */}
        <div className="flex items-center gap-1.5">
          <div
            className={`p-1 rounded-lg transition-colors ${
              isCritical
                ? 'bg-rose-100 text-rose-600 animate-pulse'
                : 'bg-amber-100 text-amber-700'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-baseline gap-1">
            <span
              className={`text-base sm:text-lg font-black font-display tracking-tight transition-transform ${
                isUrgent
                  ? 'text-rose-600 scale-110 font-mono animate-bounce'
                  : isCritical
                  ? 'text-rose-600 scale-105 font-mono'
                  : 'text-slate-900 font-mono'
              }`}
            >
              {timeRemaining}
            </span>
            <span className="text-[10px] text-slate-500 font-bold">/ {totalTime} sn</span>
          </div>
        </div>

        {/* Status text */}
        <div className="flex items-center gap-1 text-[11px] font-bold">
          {isCritical ? (
            <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 animate-pulse">
              Acele et! ⏳
            </span>
          ) : (
            <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              Kalan Süre
            </span>
          )}
        </div>
      </div>

      {/* Progress Track */}
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/70">
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

