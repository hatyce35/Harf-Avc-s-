import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Check, 
  RotateCw, 
  Trophy, 
  Swords, 
  Sparkles,
  Pause,
  Play,
  Bot,
  Home,
  LogOut
} from 'lucide-react';
import { soundManager } from '../services/sound';
import { triggerStarSparkles } from '../utils/sparkleEffects';

export interface CategoryResultItem {
  categoryId: string;
  categoryName: string;
  icon: React.ComponentType<{ className?: string }>;
  p1Word: string;
  p1Status: 'valid' | 'pisti' | 'typo' | 'wrong' | 'empty';
  p1Points: number;
  p1Corrected?: string;
  p2Word: string;
  p2Status: 'valid' | 'pisti' | 'typo' | 'wrong' | 'empty';
  p2Points: number;
  p2Corrected?: string;
  isPisti?: boolean;
}

interface Props {
  targetLetter: string;
  roundNumber: number;
  maxRounds: number;
  p1Name: string;
  p1Avatar: string;
  p1RoundScore: number;
  p1TotalScore: number;
  p2Name?: string;
  p2Avatar?: string;
  p2RoundScore?: number;
  p2TotalScore?: number;
  hasOpponent: boolean;
  categoryResults: CategoryResultItem[];
  onNextRound: () => void;
  onExitToMenu: () => void;
}

export const RoundResultScreen: React.FC<Props> = ({
  targetLetter,
  roundNumber,
  maxRounds,
  p1Name,
  p1Avatar,
  p1RoundScore,
  p1TotalScore,
  p2Name = 'Rakip',
  p2Avatar = '🤖',
  p2RoundScore = 0,
  p2TotalScore = 0,
  hasOpponent,
  categoryResults,
  onNextRound,
  onExitToMenu
}) => {
  const [countdown, setCountdown] = useState(10);
  const [isPaused, setIsPaused] = useState(false);

  // Play cute sound and sparkles on round results
  useEffect(() => {
    if (p1RoundScore > 0) {
      soundManager.playSparkle();
      triggerStarSparkles({ x: 0.5, y: 0.3 });
    } else {
      soundManager.playInvalid();
    }
  }, []);

  // 10-second automatic countdown timer
  useEffect(() => {
    if (isPaused) return;

    if (countdown <= 0) {
      soundManager.playClick();
      onNextRound();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(c => c - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, isPaused, onNextRound]);

  // Helper for Status Icon:
  // Green check: Valid and clean
  // Yellow check: Valid but pişti (both wrote same word) or minor spelling variance (typo)
  // Red X: Wrong or empty
  const renderStatusIcon = (status: 'valid' | 'pisti' | 'typo' | 'wrong' | 'empty') => {
    switch (status) {
      case 'valid':
        return (
          <div className="w-5 h-5 rounded-full bg-emerald-100 border border-emerald-400 flex items-center justify-center text-emerald-600 shrink-0" title="Tam ve Doğru (+10)">
            <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
        );
      case 'pisti':
        return (
          <div className="w-5 h-5 rounded-full bg-amber-100 border border-amber-400 flex items-center justify-center text-amber-700 shrink-0" title="Aynı Kelime / Pişti (+5)">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </div>
        );
      case 'typo':
        return (
          <div className="w-5 h-5 rounded-full bg-amber-100 border border-amber-400 flex items-center justify-center text-amber-700 shrink-0" title="Küçük Yazım Hatası / 1 Harf Eksik (+5)">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </div>
        );
      case 'wrong':
      case 'empty':
      default:
        return (
          <div className="w-5 h-5 rounded-full bg-rose-100 border border-rose-400 flex items-center justify-center text-rose-600 shrink-0" title={status === 'empty' ? 'Yazılmadı (0)' : 'Geçersiz (0)'}>
            <XCircle className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
        );
    }
  };

  const isP1Winner = p1RoundScore > p2RoundScore;
  const isP2Winner = p2RoundScore > p1RoundScore;
  const isTie = p1RoundScore === p2RoundScore;

  return (
    <div className="bg-white border-2 border-amber-300/90 rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-xl flex flex-col justify-between gap-2 flex-1 min-h-0 relative overflow-hidden">
      
      {/* Subtle Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

      {/* TOP HEADER: ROUND SCORE COMPARISON (P1 vs P2) */}
      <div className="border-b border-slate-100 pb-2 shrink-0">
        <div className="flex items-center justify-between">
          
          {/* Player 1 (Left) */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white font-black text-lg flex items-center justify-center shadow-xs shrink-0">
              {p1Avatar}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-black text-slate-900 truncate leading-tight">
                {p1Name}
              </div>
              <div className="flex items-center gap-1">
                <span className="text-base sm:text-lg font-black text-emerald-600 leading-none font-display">
                  +{p1RoundScore}p
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">
                  ({p1TotalScore}p)
                </span>
              </div>
            </div>
          </div>

          {/* Center: Round & Letter Badge */}
          <div className="flex flex-col items-center justify-center shrink-0 px-2 text-center">
            <span className="text-[10px] font-black text-amber-700 uppercase tracking-wider bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              Tur {roundNumber} / {maxRounds}
            </span>
            <div className="w-8 h-8 mt-1 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-white font-black text-lg flex items-center justify-center shadow-xs font-display">
              {targetLetter}
            </div>
          </div>

          {/* Player 2 or Solo indicator (Right) */}
          {hasOpponent ? (
            <div className="flex items-center justify-end gap-2 min-w-0 text-right">
              <div className="min-w-0">
                <div className="text-xs font-black text-slate-900 truncate leading-tight">
                  {p2Name}
                </div>
                <div className="flex items-center justify-end gap-1">
                  <span className="text-base sm:text-lg font-black text-purple-600 leading-none font-display">
                    +{p2RoundScore}p
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    ({p2TotalScore}p)
                  </span>
                </div>
              </div>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white font-black text-lg flex items-center justify-center shadow-xs shrink-0">
                {p2Avatar}
              </div>
            </div>
          ) : (
            <div className="text-right">
              <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                Solo Pratik
              </span>
            </div>
          )}

        </div>

        {/* Winner Announcement Pill */}
        {hasOpponent && (
          <div className="text-center mt-1">
            <span className={`inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full border shadow-2xs ${
              isP1Winner 
                ? 'bg-emerald-100 text-emerald-900 border-emerald-300' 
                : isP2Winner 
                ? 'bg-purple-100 text-purple-900 border-purple-300' 
                : 'bg-amber-100 text-amber-900 border-amber-300'
            }`}>
              {isP1Winner ? `🏆 Bu Turu ${p1Name} Kazandı!` : isP2Winner ? `🥈 Bu Turu ${p2Name} Kazandı!` : '🤝 Berabere!'}
            </span>
          </div>
        )}
      </div>

      {/* WORDS LIST: 6 COMPACT ROWS WITHOUT HEADERS, ALL ON ONE SCREEN! */}
      <div className="space-y-1 my-auto overflow-hidden">
        {categoryResults.map(item => {
          const CatIcon = item.icon;
          return (
            <div 
              key={item.categoryId}
              className={`flex items-center justify-between p-1.5 sm:p-2 rounded-xl border transition-colors ${
                item.isPisti 
                  ? 'bg-amber-50/80 border-amber-200' 
                  : 'bg-slate-50/70 border-slate-200/90'
              }`}
            >
              {/* Category mini icon */}
              <div className="w-6 h-6 rounded-lg bg-white border border-slate-200 text-slate-600 flex items-center justify-center shrink-0 mr-1.5 shadow-2xs" title={item.categoryName}>
                <CatIcon className="w-3.5 h-3.5" />
              </div>

              {/* Left: Player 1's word & status */}
              <div className="flex items-center gap-1.5 flex-1 min-w-0 pr-1">
                {renderStatusIcon(item.p1Status)}
                <div className="flex items-baseline gap-1 min-w-0 truncate">
                  <span className="font-black text-xs sm:text-sm text-slate-900 truncate">
                    {item.p1Word || <span className="text-slate-300 font-normal italic">&lt;Boş&gt;</span>}
                  </span>
                  {item.p1Status === 'typo' && item.p1Corrected && (
                    <span className="text-[10px] font-bold text-amber-700 truncate shrink-0" title={`Doğrusu: ${item.p1Corrected}`}>
                      ({item.p1Corrected})
                    </span>
                  )}
                </div>
                <span className={`text-[10px] font-extrabold ml-auto shrink-0 ${
                  item.p1Status === 'typo' || item.p1Status === 'pisti'
                    ? 'text-amber-700'
                    : item.p1Points > 0
                    ? 'text-emerald-700'
                    : 'text-slate-400'
                }`}>
                  +{item.p1Points}
                </span>
              </div>

              {/* Divider / Pişti badge */}
              {hasOpponent && (
                <div className="px-1 text-center shrink-0">
                  {item.isPisti ? (
                    <span className="text-[9px] font-black bg-amber-400 text-amber-950 px-1.5 py-0.5 rounded-md shadow-2xs animate-pulse">
                      PİŞTİ
                    </span>
                  ) : (
                    <span className="text-slate-300 font-light text-xs">|</span>
                  )}
                </div>
              )}

              {/* Right: Player 2's word & status */}
              {hasOpponent && (
                <div className="flex items-center justify-end gap-1.5 flex-1 min-w-0 pl-1">
                  <span className={`text-[10px] font-extrabold mr-auto shrink-0 ${
                    item.p2Status === 'typo' || item.p2Status === 'pisti'
                      ? 'text-amber-700'
                      : item.p2Points > 0
                      ? 'text-purple-700'
                      : 'text-slate-400'
                  }`}>
                    +{item.p2Points}
                  </span>
                  <div className="flex items-baseline justify-end gap-1 min-w-0 truncate text-right">
                    {item.p2Status === 'typo' && item.p2Corrected && (
                      <span className="text-[10px] font-bold text-amber-700 truncate shrink-0" title={`Doğrusu: ${item.p2Corrected}`}>
                        ({item.p2Corrected})
                      </span>
                    )}
                    <span className="font-black text-xs sm:text-sm text-slate-900 truncate text-right">
                      {item.p2Word || <span className="text-slate-300 font-normal italic">&lt;Boş&gt;</span>}
                    </span>
                  </div>
                  {renderStatusIcon(item.p2Status)}
                </div>
              )}

            </div>
          );
        })}
      </div>

      {/* BOTTOM CONTROLS: "Ana Menü" & "Yeni Harf" BUTTON WITH 10S COUNTDOWN */}
      <div className="pt-1.5 border-t border-slate-100 flex items-center gap-2 shrink-0">
        
        {/* Return to Main Menu Button */}
        <button
          id="exit-to-menu-btn"
          onClick={() => {
            soundManager.playClick();
            onExitToMenu();
          }}
          className="py-2.5 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-200/90 text-slate-700 hover:text-slate-900 font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-2xs active:scale-[0.98]"
          title="Ana Menüye Dön"
        >
          <Home className="w-4 h-4 text-slate-600" />
          <span className="inline">Menü</span>
        </button>

        {/* Pause/Resume Timer Button */}
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="p-2.5 rounded-2xl border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer shrink-0 shadow-2xs"
          title={isPaused ? 'Geri sayımı devam ettir' : 'Geri sayımı durdur (incelemek için)'}
        >
          {isPaused ? <Play className="w-4 h-4 fill-current text-emerald-600" /> : <Pause className="w-4 h-4 text-slate-400" />}
        </button>

        {/* Primary "Yeni Harf" Button with live countdown */}
        <button
          id="next-letter-btn"
          onClick={() => {
            soundManager.playClick();
            onNextRound();
          }}
          className="flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-700 text-white font-black text-xs sm:text-sm shadow-md shadow-amber-300/50 active:scale-[0.99] flex items-center justify-center gap-1.5 sm:gap-2 transition-all cursor-pointer truncate"
        >
          <RotateCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin shrink-0" style={{ animationDuration: '4s' }} />
          <span className="truncate">Yeni Harf</span>
          <span className="bg-white/25 px-1.5 py-0.5 rounded-lg text-[11px] sm:text-xs font-mono font-black shrink-0">
            {isPaused ? 'Durduruldu' : `${countdown}s`}
          </span>
        </button>

      </div>

    </div>
  );
};
