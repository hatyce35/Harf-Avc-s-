import React from 'react';
import { Sparkles, Flame, Zap, Clock, Shuffle } from 'lucide-react';
import { SpecialEvent } from '../types';

interface LetterDisplayProps {
  letter: string;
  specialEvent: SpecialEvent;
  goldenCategoryName?: string;
  chaosRemaining?: number;
}

export const LetterDisplay: React.FC<LetterDisplayProps> = ({
  letter,
  specialEvent,
  goldenCategoryName,
}) => {
  const getEventBadge = () => {
    switch (specialEvent) {
      case 'double_letter':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ÇİFT PUAN HARFİ (x2)</span>
          </div>
        );
      case 'chaos_letter':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/40 text-purple-300 text-xs font-bold">
            <Shuffle className="w-3.5 h-3.5" />
            <span>KAOS HARFİ (Değişebilir!)</span>
          </div>
        );
      case 'last_chance':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/40 text-sky-300 text-xs font-bold">
            <Clock className="w-3.5 h-3.5" />
            <span>SON ŞANS (+10 SANİYE)</span>
          </div>
        );
      case 'golden_letter':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-400/40 text-yellow-300 text-xs font-bold animate-pulse">
            <Zap className="w-3.5 h-3.5" />
            <span>ALTIN HARF (+5 EKSTRA PUAN)</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center my-3 sm:my-5">
      {/* Container with tactile card frame */}
      <div className="relative group">
        {/* Ambient Glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-3xl blur-md opacity-30 group-hover:opacity-60 transition duration-500" />

        <div className="relative flex flex-col items-center justify-center w-36 h-36 sm:w-44 sm:h-44 bg-slate-900/95 border-2 border-amber-400/60 rounded-3xl shadow-2xl shadow-orange-950/40 p-4">
          <span className="text-[11px] font-black uppercase tracking-widest text-amber-400/80 mb-1">
            HEDEF HARF
          </span>

          {/* Ultra Prominent Letter */}
          <div className="text-6xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-amber-100 to-amber-400 font-display drop-shadow-md select-none">
            {letter}
          </div>

          <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
            <span>Türkçe Alfabe</span>
          </div>
        </div>
      </div>

      {/* Special Event or Golden Category Tag below Letter */}
      <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
        {getEventBadge()}

        {goldenCategoryName && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/15 border border-orange-400/30 text-orange-300 text-xs font-bold">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span>ALTIN KATEGORİ: {goldenCategoryName} (x2)</span>
          </div>
        )}
      </div>
    </div>
  );
};
