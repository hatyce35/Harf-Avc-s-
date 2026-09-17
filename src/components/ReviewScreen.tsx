import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Trophy, Flame, Zap, Award, Star, CheckCircle2, 
  XCircle, RotateCcw, Home, ArrowRight, ShieldAlert, 
  HelpCircle, AlertTriangle 
} from 'lucide-react';
import { Category, AnswerItem, GameMode, PlayerProfile } from '../types';
import { CATEGORY_MAP } from '../data/categories';
import { soundManager } from '../services/sound';
import { validateAnswerLocally } from '../data/wordDatabase';

interface ReviewScreenProps {
  playerScore: number;
  opponentScore: number;
  playerAnswers: Record<string, AnswerItem>;
  opponentAnswers: Record<string, AnswerItem>;
  targetLetter: string;
  categoryIds: string[];
  goldenCategoryId: string;
  gameMode: GameMode;
  opponentName?: string;
  opponentAvatar?: string;
  maxCombo: number;
  validCount: number;
  uniqueCount: number;
  fastCount: number;
  xpEarned: number;
  coinsEarned: number;
  profile: PlayerProfile;
  onPlayAgain: () => void;
  onNextRound?: () => void;
  onMainMenu: () => void;
}

export const ReviewScreen: React.FC<ReviewScreenProps> = ({
  playerScore,
  opponentScore,
  playerAnswers,
  opponentAnswers,
  targetLetter,
  categoryIds,
  goldenCategoryId,
  gameMode,
  opponentName = 'Yapay Zeka',
  opponentAvatar = '🤖',
  maxCombo,
  validCount,
  uniqueCount,
  fastCount,
  xpEarned,
  coinsEarned,
  profile,
  onPlayAgain,
  onNextRound,
  onMainMenu,
}) => {
  const [localOpponentAnswers, setLocalOpponentAnswers] = useState(opponentAnswers);
  const [currentOpponentScore, setCurrentOpponentScore] = useState(opponentScore);
  const [currentPlayerScore, setCurrentPlayerScore] = useState(playerScore);
  const [disputeMessage, setDisputeMessage] = useState<string | null>(null);

  const isWin = currentPlayerScore > currentOpponentScore;
  const isTie = currentPlayerScore === currentOpponentScore && currentPlayerScore > 0;

  useEffect(() => {
    if (isWin) {
      soundManager.playVictory();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // ignore
      }
    } else {
      soundManager.playDefeat();
    }
  }, [isWin]);

  // Handle Player Challenge on Opponent's answer
  const handleChallenge = (catId: string) => {
    const oppAns = localOpponentAnswers[catId];
    if (!oppAns || oppAns.isChallenged) return;

    soundManager.playClick();
    const cleanWord = (oppAns.value || '').trim();
    const evaluation = validateAnswerLocally(catId, cleanWord, targetLetter);

    if (!evaluation.isValid) {
      // Opponent answer was indeed invalid! Player wins dispute
      soundManager.playCorrect();
      setDisputeMessage(`🎯 İtiraz Başarılı! "${cleanWord}" geçerli bir kelime değil. Rakip puan kaybetti, sen +10 bonus kazandın!`);
      
      setCurrentOpponentScore(prev => Math.max(0, prev - (oppAns.totalPoints || 10)));
      setCurrentPlayerScore(prev => prev + 10);

      setLocalOpponentAnswers(prev => ({
        ...prev,
        [catId]: {
          ...oppAns,
          isValid: false,
          isChallenged: true,
          totalPoints: -5,
          invalidReason: 'İtiraz sonucu elendi'
        }
      }));
    } else {
      // Opponent answer was actually valid! Player penalized for bad challenge
      soundManager.playInvalid();
      setDisputeMessage(`⚠️ İtiraz Reddedildi! "${cleanWord}" Türkçe kurallarına göre geçerli bir cevap. Haksız itiraz için -5 ceza puanı.`);
      
      setCurrentPlayerScore(prev => Math.max(0, prev - 5));

      setLocalOpponentAnswers(prev => ({
        ...prev,
        [catId]: {
          ...oppAns,
          isChallenged: true
        }
      }));
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-3 py-6 space-y-6">
      {/* Dramatic Victory / Defeat Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-6 text-center shadow-2xl">
        <div className="flex flex-col items-center justify-center">
          <div className="text-4xl sm:text-5xl mb-2">
            {isWin ? '🏆' : isTie ? '🤝' : '💫'}
          </div>

          <span className="text-xs font-black uppercase tracking-widest text-amber-400 mb-1">
            TUR TAMAMLANDI
          </span>

          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white font-display">
            {isWin ? 'TEBRİKLER, KAZANDIN!' : isTie ? 'BERABERE BİTTİ!' : 'BU TURU RAKİP ALDI!'}
          </h2>

          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md">
            {isWin
              ? 'Hızlı ve özgün kelimelerinle harika bir zafer kazandın!'
              : 'Bir sonraki turda daha yaratıcı kelimelerle rövanşı alabilirsin.'}
          </p>

          {/* Scores Comparison Card */}
          <div className="grid grid-cols-2 gap-4 w-full max-w-md mt-6 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
            {/* Player */}
            <div className="text-center border-r border-slate-800 pr-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Senin Skorun
              </span>
              <span className="text-3xl sm:text-4xl font-black text-amber-400 font-display">
                {currentPlayerScore}
              </span>
              <span className="text-[10px] text-emerald-400 font-bold block mt-0.5">
                {validCount} Doğru Cevap
              </span>
            </div>

            {/* Opponent */}
            <div className="text-center pl-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block truncate">
                {opponentName}
              </span>
              <span className="text-3xl sm:text-4xl font-black text-slate-300 font-display">
                {currentOpponentScore}
              </span>
              <span className="text-[10px] text-slate-500 font-bold block mt-0.5">
                Rakip Skoru
              </span>
            </div>
          </div>

          {/* Reward Badges: XP & Coins */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold">
              <Star className="w-3.5 h-3.5 text-purple-400" />
              <span>+{xpEarned} XP Kazanıldı</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
              <span>🪙</span>
              <span>+{coinsEarned} Altın Kazanıldı</span>
            </div>
            {maxCombo > 1 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-300 text-xs font-bold">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                <span>Maks Kombo: x{maxCombo}</span>
              </div>
            )}
            {uniqueCount > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs font-bold">
                <Award className="w-3.5 h-3.5 text-sky-400" />
                <span>{uniqueCount} Özgün Cevap</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dispute message notice */}
      {disputeMessage && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs sm:text-sm font-medium flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{disputeMessage}</span>
        </div>
      )}

      {/* Category Answer Review Comparison Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 font-display">
            <span>CEVAP İNCELEMESİ</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-400">
              Harf: {targetLetter}
            </span>
          </h3>
          <span className="text-xs text-slate-400">
            Şüpheli rakip cevaplarına itiraz edebilirsin
          </span>
        </div>

        <div className="space-y-3">
          {categoryIds.map(catId => {
            const cat = CATEGORY_MAP.get(catId);
            const pAns = playerAnswers[catId];
            const oAns = localOpponentAnswers[catId];
            const isGolden = catId === goldenCategoryId;

            return (
              <div
                key={catId}
                className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
                  isGolden
                    ? 'bg-amber-950/20 border-amber-500/30'
                    : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                {/* Category Title */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold text-white">
                      {cat?.name || catId}
                    </span>
                    {isGolden && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-400/30">
                        x2 ALTIN
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-black text-amber-400">
                    {pAns?.totalPoints !== undefined ? (
                      pAns.totalPoints >= 0 ? `+${pAns.totalPoints} P` : `${pAns.totalPoints} P`
                    ) : ''}
                  </span>
                </div>

                {/* Answers Grid: Player vs Opponent */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-800/80">
                  {/* Player Answer */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                      Senin Cevabın:
                    </span>
                    <div className="flex items-center justify-between bg-slate-900/80 rounded-xl px-3 py-2 border border-slate-800">
                      <span className="text-sm font-bold text-white truncate max-w-[150px]">
                        {pAns?.value || <i className="text-slate-500 font-normal">Boş bırakıldı</i>}
                      </span>
                      <div className="flex items-center gap-1 text-[11px] font-bold">
                        {pAns?.isValid ? (
                          <span className="flex items-center gap-1 text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Geçerli
                          </span>
                        ) : pAns?.value ? (
                          <span className="flex items-center gap-1 text-rose-400" title={pAns.invalidReason}>
                            <XCircle className="w-3.5 h-3.5" /> Geçersiz
                          </span>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}

                        {pAns?.isUnique && (
                          <span className="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 text-[10px] font-black border border-sky-400/30">
                            ★ ÖZGÜN
                          </span>
                        )}

                        {pAns?.isFast && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-black">
                            ⚡ HIZLI
                          </span>
                        )}

                        {pAns?.isLocked && (
                          <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-black">
                            🔒 KİLİT
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Opponent Answer */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                      {opponentName}:
                    </span>
                    <div className="flex items-center justify-between bg-slate-900/80 rounded-xl px-3 py-2 border border-slate-800">
                      <span className="text-sm font-bold text-slate-300 truncate max-w-[130px]">
                        {oAns?.value || <i className="text-slate-500 font-normal">Boş</i>}
                      </span>
                      <div className="flex items-center gap-2">
                        {oAns?.isValid ? (
                          <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Geçerli
                          </span>
                        ) : oAns?.value ? (
                          <span className="text-xs text-rose-400 font-semibold flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" /> Geçersiz
                          </span>
                        ) : null}

                        {/* Dispute / Challenge button */}
                        {oAns?.value && !oAns.isChallenged && (
                          <button
                            type="button"
                            onClick={() => handleChallenge(catId)}
                            className="px-2 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-[10px] font-black transition-all active:scale-95 flex items-center gap-1"
                            title="Bu kelimenin geçerliliğine itiraz et"
                          >
                            <ShieldAlert className="w-3 h-3" />
                            İtiraz Et
                          </button>
                        )}
                        {oAns?.isChallenged && (
                          <span className="text-[10px] text-slate-500 italic">İtiraz Edildi</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Navigation Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => {
            soundManager.playClick();
            onPlayAgain();
          }}
          className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm sm:text-base shadow-lg shadow-orange-500/20 transition-all active:scale-95 font-display"
        >
          <RotateCcw className="w-4 h-4" />
          <span>YENİDEN OYNA</span>
        </button>

        {onNextRound && (
          <button
            onClick={() => {
              soundManager.playClick();
              onNextRound();
            }}
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm sm:text-base shadow-lg shadow-emerald-500/20 transition-all active:scale-95 font-display"
          >
            <span>SONRAKİ TUR</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={() => {
            soundManager.playClick();
            onMainMenu();
          }}
          className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-bold text-sm sm:text-base transition-all active:scale-95 font-display"
        >
          <Home className="w-4 h-4" />
          <span>ANA MENÜ</span>
        </button>
      </div>
    </div>
  );
};
