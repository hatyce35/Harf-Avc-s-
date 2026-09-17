import React from 'react';
import { Play, ArrowRight, ShieldCheck, Sparkles, UserCheck } from 'lucide-react';
import { soundManager } from '../services/sound';

interface Props {
  targetLetter: string;
  roundNumber: number;
  maxRounds: number;
  p1Name: string;
  p1Avatar: string;
  p1FilledCount: number;
  p2Name: string;
  p2Avatar: string;
  timeLimit: number;
  onStartP2Turn: () => void;
}

export const LocalDuelPassScreen: React.FC<Props> = ({
  targetLetter,
  roundNumber,
  maxRounds,
  p1Name,
  p1Avatar,
  p1FilledCount,
  p2Name,
  p2Avatar,
  timeLimit,
  onStartP2Turn
}) => {
  return (
    <div className="w-full h-full max-w-md mx-auto flex flex-col justify-between py-3 px-3 relative animate-fadeIn">
      
      {/* Top indicator */}
      <div className="text-center pt-2">
        <span className="text-xs font-black text-amber-900 bg-amber-100 border border-amber-300 px-3 py-1 rounded-full uppercase tracking-wider">
          Tur {roundNumber} / {maxRounds} • Hedef Harf: "{targetLetter}"
        </span>
      </div>

      {/* Main Handoff Card */}
      <div className="my-auto bg-white border-2 border-indigo-200 rounded-3xl p-6 text-center space-y-4 shadow-xl relative overflow-hidden">
        
        {/* Glow */}
        <div className="absolute -top-12 -left-12 w-36 h-36 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-36 h-36 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none" />

        {/* Status icon */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 text-white flex items-center justify-center text-3xl shadow-md mx-auto">
          🤝
        </div>

        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-display">
            Sıra {p2Name}'de!
          </h2>
          <p className="text-xs sm:text-[13px] text-slate-600 mt-1 font-medium">
            {p1Name} turunu tamamladı ({p1FilledCount}/6 kategori doldurdu). Şimdi cihazı <strong>{p2Name}</strong>'ye uzatın!
          </p>
        </div>

        {/* Players Card */}
        <div className="flex items-center justify-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{p1Avatar}</span>
            <div className="text-left">
              <div className="text-xs font-bold text-slate-800 leading-none">{p1Name}</div>
              <span className="text-[10px] text-emerald-600 font-bold">Tamamladı ✓</span>
            </div>
          </div>

          <ArrowRight className="w-4 h-4 text-slate-400" />

          <div className="flex items-center gap-2">
            <span className="text-2xl">{p2Avatar}</span>
            <div className="text-left">
              <div className="text-xs font-black text-indigo-900 leading-none">{p2Name}</div>
              <span className="text-[10px] text-indigo-600 font-black animate-pulse">Sıradaki</span>
            </div>
          </div>
        </div>

        {/* Privacy badge */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>{p1Name}'nin cevapları gizlendi, kopya çekilemez!</span>
        </div>

        {/* Ready Button */}
        <button
          onClick={() => {
            soundManager.playFanfare();
            onStartP2Turn();
          }}
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black text-sm shadow-md shadow-indigo-300/50 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>{p2Name} Hazır! Başla ({timeLimit} sn)</span>
        </button>

      </div>

      {/* Footer */}
      <div className="text-center text-[11px] text-slate-400 pb-1">
        Hedef harf değişmedi: "{targetLetter}". Süre bitene veya DUR diyene kadar yaz!
      </div>

    </div>
  );
};
