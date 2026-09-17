import React, { useRef, useEffect } from 'react';
import { Send, CheckCircle, Sparkles, MessageSquare } from 'lucide-react';
import { 
  Category, AnswerItem, SpecialEvent, Difficulty, GameMode, PlayerProfile 
} from '../types';
import { TimerBar } from './TimerBar';
import { ScoreBoard } from './ScoreBoard';
import { LetterDisplay } from './LetterDisplay';
import { CategoryInputCard } from './CategoryInputCard';
import { CATEGORY_MAP } from '../data/categories';
import { AIAvatar } from '../ai/aiPlayer';

interface GameplayScreenProps {
  letter: string;
  categories: Category[];
  answers: Record<string, AnswerItem>;
  goldenCategoryId: string;
  specialEvent: SpecialEvent;
  timeRemaining: number;
  totalRoundTime: number;
  gameMode: GameMode;
  difficulty: Difficulty;
  roundNumber: number;
  survivalStreak?: number;
  currentFriendTurn: 1 | 2;
  player1Name: string;
  player2Name?: string;
  aiProfile?: AIAvatar;
  aiReaction?: string;
  onUpdateAnswer: (categoryId: string, value: string) => void;
  onToggleLock: (categoryId: string) => void;
  onFinishRound: () => void;
}

export const GameplayScreen: React.FC<GameplayScreenProps> = ({
  letter,
  categories,
  answers,
  goldenCategoryId,
  specialEvent,
  timeRemaining,
  totalRoundTime,
  gameMode,
  roundNumber,
  survivalStreak,
  currentFriendTurn,
  player1Name,
  player2Name = '2. Oyuncu',
  aiProfile,
  aiReaction,
  onUpdateAnswer,
  onToggleLock,
  onFinishRound,
}) => {
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Auto-focus the first field on round start
  useEffect(() => {
    if (categories.length > 0) {
      const firstId = categories[0].id;
      inputRefs.current[firstId]?.focus();
    }
  }, [categories, letter]);

  // Focus next category helper
  const focusNextCategory = (currentIndex: number) => {
    const nextIndex = (currentIndex + 1) % categories.length;
    const nextCategory = categories[nextIndex];
    if (nextCategory) {
      inputRefs.current[nextCategory.id]?.focus();
    }
  };

  // Calculate live filled count and estimated valid score
  const filledCount = categories.filter((c) => Boolean(answers[c.id]?.value?.trim())).length;
  const goldenCatName = CATEGORY_MAP.get(goldenCategoryId)?.name;

  const activePlayerTitle =
    gameMode === 'friend'
      ? currentFriendTurn === 1
        ? `${player1Name}'in Sırası`
        : `${player2Name}'in Sırası`
      : gameMode === 'survival'
      ? `Hayatta Kalma: Tur ${roundNumber} (Seri: ${survivalStreak || 0})`
      : gameMode === 'daily'
      ? 'Günün Meydan Okuması'
      : gameMode === 'ai_battle'
      ? `${aiProfile?.name || 'Yapay Zeka'} ile Düello`
      : 'Hızlı Oyun';

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-6 space-y-4">
      {/* Active Turn Banner */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs sm:text-sm font-bold text-slate-300 font-display">
            {activePlayerTitle}
          </span>
        </div>

        {/* Keyboard shortcut hint for desktop */}
        <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-500 font-semibold">
          <span>Enter: Sonraki Alan</span>
          <span>•</span>
          <span>Ctrl + Enter: Bitir</span>
        </div>
      </div>

      {/* Top Bar: Timer and Live Score */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <TimerBar timeRemaining={timeRemaining} totalTime={totalRoundTime} />
        <ScoreBoard
          score={filledCount * 10}
          combo={Math.max(1, Math.min(5, Math.floor(filledCount / 2) + 1))}
          opponentScore={gameMode === 'ai_battle' ? Math.max(0, filledCount * 8 + Math.floor(Math.random() * 5)) : undefined}
          opponentName={gameMode === 'ai_battle' ? aiProfile?.name : undefined}
          opponentAvatar={gameMode === 'ai_battle' ? aiProfile?.avatar : undefined}
        />
      </div>

      {/* AI Reaction Message Bubble (if AI mode) */}
      {gameMode === 'ai_battle' && aiReaction && (
        <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-200 text-xs shadow-md">
          <span className="text-lg">{aiProfile?.avatar || '🤖'}</span>
          <div className="flex-1">
            <span className="font-bold text-indigo-300">{aiProfile?.name}: </span>
            <span>&ldquo;{aiReaction}&rdquo;</span>
          </div>
        </div>
      )}

      {/* Center: Prominent Letter Display */}
      <LetterDisplay
        letter={letter}
        specialEvent={specialEvent}
        goldenCategoryName={goldenCatName}
      />

      {/* Category Inputs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {categories.map((cat, idx) => {
          const ans = answers[cat.id] || { categoryId: cat.id, value: '', isLocked: false, timestamp: 0 };
          const isGolden = cat.id === goldenCategoryId;

          return (
            <CategoryInputCard
              key={cat.id}
              category={cat}
              targetLetter={letter}
              value={ans.value}
              isLocked={ans.isLocked}
              isGolden={isGolden}
              onChange={(val) => onUpdateAnswer(cat.id, val)}
              onToggleLock={() => onToggleLock(cat.id)}
              onNextCategory={() => focusNextCategory(idx)}
              onFinishRound={onFinishRound}
              inputRef={(el) => {
                inputRefs.current[cat.id] = el;
              }}
              autoFocus={idx === 0}
            />
          );
        })}
      </div>

      {/* Sticky Bottom Finish Button Bar */}
      <div className="sticky bottom-3 z-30 pt-2">
        <div className="p-2 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-800 shadow-2xl flex items-center justify-between gap-3">
          {/* Progress Indicator */}
          <div className="flex items-center gap-2 pl-3">
            <CheckCircle className={`w-5 h-5 ${filledCount === categories.length ? 'text-emerald-400' : 'text-slate-500'}`} />
            <div>
              <span className="text-xs font-bold text-white block">
                {filledCount} / {categories.length} Dolduruldu
              </span>
              <span className="text-[10px] text-slate-400">
                {filledCount === categories.length ? 'Tüm alanlar hazır!' : 'Eksikleri tamamla veya bitir'}
              </span>
            </div>
          </div>

          {/* Large Tactile Finish Button */}
          <button
            type="button"
            onClick={onFinishRound}
            className="px-6 sm:px-10 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 hover:from-amber-300 hover:to-rose-400 text-slate-950 font-black text-sm sm:text-base tracking-wide shadow-lg shadow-orange-500/25 transition-all active:scale-95 flex items-center gap-2 font-display"
          >
            <span>BİTİR</span>
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
