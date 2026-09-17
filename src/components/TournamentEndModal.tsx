import React, { useEffect } from 'react';
import { Trophy, Swords, Sparkles, RotateCcw, Home, Crown } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../services/sound';

interface Props {
  isOpen: boolean;
  p1Name: string;
  p1Avatar: string;
  p1Score: number;
  p2Name?: string;
  p2Avatar?: string;
  p2Score?: number;
  hasOpponent: boolean;
  onExitGame: () => void;
  onRematch: () => void;
}

export const TournamentEndModal: React.FC<Props> = ({
  isOpen,
  p1Name,
  p1Avatar,
  p1Score,
  p2Name = 'Rakip',
  p2Avatar = '🤖',
  p2Score = 0,
  hasOpponent,
  onExitGame,
  onRematch
}) => {
  useEffect(() => {
    if (!isOpen) return;

    soundManager.playFanfare();
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 }
    });

    const timeout = setTimeout(() => {
      confetti({
        particleCount: 80,
        angle: 60,
        spread: 55,
        origin: { x: 0 }
      });
      confetti({
        particleCount: 80,
        angle: 120,
        spread: 55,
        origin: { x: 1 }
      });
    }, 400);

    return () => clearTimeout(timeout);
  }, [isOpen]);

  if (!isOpen) return null;

  const isP1Winner = p1Score > p2Score;
  const isP2Winner = p2Score > p1Score;
  const isTie = p1Score === p2Score;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white border-3 border-amber-400 rounded-3xl p-5 sm:p-7 max-w-md w-full shadow-2xl space-y-4 text-center relative overflow-hidden">
        
        {/* Glow Effects */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-400/25 rounded-full blur-3xl pointer-events-none" />

        {/* Big Trophy Header */}
        <div className="relative">
          <div className="w-18 h-18 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 via-amber-500 to-amber-600 text-white flex items-center justify-center shadow-xl shadow-amber-400/40 text-4xl mb-2 animate-bounce">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <span className="text-[11px] font-black uppercase tracking-widest text-amber-800 bg-amber-100 border border-amber-300 px-3 py-0.5 rounded-full">
            10 TUR TAMAMLANDI • OYUN SONU
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight font-display mt-2">
            {hasOpponent ? (
              isP1Winner ? `🏆 ŞAMPİYON ${p1Name.toUpperCase()}!` : isP2Winner ? `🥈 ${p2Name.toUpperCase()} KAZANDI!` : '🤝 DOSTLUK KAZANDI: BERABERE!'
            ) : (
              `🎉 TEBRİKLER ${p1Name.toUpperCase()}!`
            )}
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            10 turluk zorlu kelime maratonu sona erdi.
          </p>
        </div>

        {/* Head to head final scoreboard */}
        <div className="bg-slate-50 border-2 border-slate-200/90 rounded-2xl p-4 flex items-center justify-around gap-2 shadow-inner">
          
          {/* Player 1 */}
          <div className="text-center flex-1">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center text-2xl shadow-xs mb-1">
              {p1Avatar}
            </div>
            <div className="text-xs font-black text-slate-800 truncate">
              {p1Name}
            </div>
            <div className="text-3xl font-black text-emerald-600 font-display">
              {p1Score} <span className="text-xs font-semibold text-slate-400">puan</span>
            </div>
            {hasOpponent && isP1Winner && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full mt-0.5">
                <Crown className="w-3 h-3 text-amber-600" /> Şampiyon
              </span>
            )}
          </div>

          {/* VS Divider */}
          {hasOpponent && (
            <div className="flex flex-col items-center justify-center shrink-0 px-2">
              <span className="text-xs font-black text-slate-400 font-display">
                VS
              </span>
            </div>
          )}

          {/* Player 2 */}
          {hasOpponent && (
            <div className="text-center flex-1">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center text-2xl shadow-xs mb-1">
                {p2Avatar}
              </div>
              <div className="text-xs font-black text-slate-800 truncate">
                {p2Name}
              </div>
              <div className="text-3xl font-black text-purple-600 font-display">
                {p2Score} <span className="text-xs font-semibold text-slate-400">puan</span>
              </div>
              {isP2Winner && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-black text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full mt-0.5">
                  <Crown className="w-3 h-3 text-purple-600" /> Şampiyon
                </span>
              )}
            </div>
          )}

        </div>

        {/* TWO PRIMARY BUTTONS AS REQUESTED: "Oyundan Çık" & "Rövanş Teklif Et" */}
        <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
          {/* Oyundan Çık */}
          <button
            id="exit-game-btn"
            onClick={() => {
              soundManager.playClick();
              onExitGame();
            }}
            className="flex-1 py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Home className="w-4 h-4 text-slate-500" />
            <span>Oyundan Çık</span>
          </button>

          {/* Rövanş Teklif Et */}
          <button
            id="rematch-btn"
            onClick={() => {
              soundManager.playClick();
              onRematch();
            }}
            className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-700 text-white font-black text-xs sm:text-sm shadow-md shadow-amber-300/60 active:scale-[0.99] flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Rövanş Teklif Et</span>
          </button>
        </div>

      </div>
    </div>
  );
};
