import React from 'react';
import * as LucideIcons from 'lucide-react';
import { Lock, Unlock, Flame, Check, AlertCircle } from 'lucide-react';
import { Category } from '../types';
import { getFirstTurkishLetter } from '../utils/turkish';
import { soundManager } from '../services/sound';

interface CategoryInputCardProps {
  category: Category;
  targetLetter: string;
  value: string;
  isLocked: boolean;
  isGolden: boolean;
  onChange: (value: string) => void;
  onToggleLock: () => void;
  onNextCategory: () => void;
  onFinishRound: () => void;
  inputRef?: (el: HTMLInputElement | null) => void;
  autoFocus?: boolean;
}

export const CategoryInputCard: React.FC<CategoryInputCardProps> = ({
  category,
  targetLetter,
  value,
  isLocked,
  isGolden,
  onChange,
  onToggleLock,
  onNextCategory,
  onFinishRound,
  inputRef,
  autoFocus = false,
}) => {
  // Dynamically resolve lucide icon or fallback to HelpCircle
  const IconComponent = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[category.icon] || LucideIcons.Folder;

  const trimmed = value.trim();
  const firstLetter = getFirstTurkishLetter(trimmed);
  const hasStartedWithTarget = trimmed.length > 0 && firstLetter === targetLetter;
  const hasStartedWithWrong = trimmed.length > 0 && firstLetter !== targetLetter;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        onFinishRound();
      } else {
        e.preventDefault();
        onNextCategory();
      }
    }
  };

  return (
    <div
      className={`relative w-full rounded-2xl p-3 sm:p-4 transition-all duration-200 border ${
        isGolden
          ? 'bg-gradient-to-br from-amber-950/40 via-slate-900/90 to-slate-900 border-amber-400/60 shadow-lg shadow-amber-500/10'
          : isLocked
          ? 'bg-slate-900/90 border-blue-500/50 shadow-md shadow-blue-500/5'
          : 'bg-slate-900/70 border-slate-800 hover:border-slate-700/80 shadow-sm'
      }`}
    >
      {/* Category Header */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div
            className={`p-2 rounded-xl ${
              isGolden
                ? 'bg-amber-500/20 text-amber-300'
                : 'bg-slate-800 text-slate-300'
            }`}
          >
            <IconComponent className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
              {category.name}
              {isGolden && (
                <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 font-black animate-pulse">
                  <Flame className="w-3 h-3 text-amber-400" />
                  x2 ALTIN
                </span>
              )}
            </h3>
            <p className="text-[11px] text-slate-400 font-medium line-clamp-1">
              {category.description}
            </p>
          </div>
        </div>

        {/* Risk & Reward Lock Button */}
        <button
          type="button"
          disabled={!trimmed}
          onClick={() => {
            soundManager.playClick();
            onToggleLock();
          }}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
            isLocked
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : trimmed
              ? 'bg-slate-800/80 hover:bg-slate-750 text-slate-300 border border-slate-700 hover:border-blue-400/50'
              : 'bg-slate-800/40 text-slate-600 border border-slate-800 cursor-not-allowed'
          }`}
          title={
            isLocked
              ? 'Cevap Kilitlendi! Doğruysa +5 Bonus, Yanlışsa -5 Ceza'
              : 'Cevabı Kilitle (Risk & Ödül: +5 / -5)'
          }
        >
          {isLocked ? (
            <>
              <Lock className="w-3.5 h-3.5" />
              <span>Kilitli (+5)</span>
            </>
          ) : (
            <>
              <Unlock className="w-3.5 h-3.5 opacity-60" />
              <span className="hidden sm:inline">Kilitle</span>
            </>
          )}
        </button>
      </div>

      {/* Input Field with Start Letter Badge */}
      <div className="relative flex items-center">
        {/* Letter matching indicator tag inside input */}
        <div className="absolute left-3 flex items-center pointer-events-none">
          <span
            className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black transition-colors font-display ${
              hasStartedWithTarget
                ? 'bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/30'
                : hasStartedWithWrong
                ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/30'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            {targetLetter}
          </span>
        </div>

        <input
          ref={inputRef}
          type="text"
          autoFocus={autoFocus}
          disabled={isLocked}
          value={value}
          onChange={(e) => {
            soundManager.playType();
            onChange(e.target.value);
          }}
          onKeyDown={handleKeyDown}
          placeholder={category.placeholder}
          className={`w-full pl-12 pr-10 py-2.5 sm:py-3 bg-slate-950/70 rounded-xl text-sm sm:text-base font-medium text-white placeholder-slate-500 border transition-all focus:outline-none ${
            isLocked
              ? 'border-blue-500/50 bg-slate-950/90 text-blue-200 cursor-not-allowed'
              : hasStartedWithTarget
              ? 'border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20'
              : hasStartedWithWrong
              ? 'border-rose-500/60 focus:ring-2 focus:ring-rose-500/20'
              : 'border-slate-800 focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/20'
          }`}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />

        {/* Status icon inside input right */}
        <div className="absolute right-3 flex items-center">
          {hasStartedWithTarget ? (
            <Check className="w-4 h-4 text-emerald-400" />
          ) : hasStartedWithWrong ? (
            <AlertCircle className="w-4 h-4 text-rose-400" title={`'${targetLetter}' ile başlamalı!`} />
          ) : null}
        </div>
      </div>
    </div>
  );
};
