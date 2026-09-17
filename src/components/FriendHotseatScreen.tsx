import React from 'react';
import { Users, ArrowRight, Sparkles } from 'lucide-react';
import { soundManager } from '../services/sound';

interface FriendHotseatScreenProps {
  player1Name: string;
  player2Name: string;
  targetLetter: string;
  categoryCount: number;
  onStartPlayer2Turn: () => void;
}

export const FriendHotseatScreen: React.FC<FriendHotseatScreenProps> = ({
  player1Name,
  player2Name,
  targetLetter,
  categoryCount,
  onStartPlayer2Turn,
}) => {
  return (
    <div className="w-full max-w-lg mx-auto px-4 py-12 text-center space-y-6">
      <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-6">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-white text-3xl shadow-lg shadow-indigo-500/20">
          <Users className="w-8 h-8" />
        </div>

        <div>
          <span className="text-xs font-black uppercase tracking-widest text-sky-400">
            ARKADAŞ MODU (AYNI CİHAZ)
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white mt-1 font-display">
            Sıra {player2Name}&apos;de!
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            {player1Name} turunu tamamladı. Şimdi cihazı <strong className="text-sky-300">{player2Name}</strong> oyuncusuna verin.
          </p>
        </div>

        {/* Round Info reminder */}
        <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-950 border border-slate-800 text-left">
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Hedef Harf</span>
            <span className="text-2xl font-black text-amber-400 font-display">{targetLetter}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Kategori Sayısı</span>
            <span className="text-2xl font-black text-sky-400 font-display">{categoryCount}</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2 text-left">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>İpucu: Birbirinizden farklı kelimeler yazarsanız +10 Özgün Cevap bonusu kazanırsınız!</span>
        </div>

        <button
          onClick={() => {
            soundManager.playClick();
            onStartPlayer2Turn();
          }}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500 hover:from-sky-400 hover:to-purple-400 text-white font-black text-base shadow-xl shadow-indigo-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 font-display"
        >
          <span>BAŞLA ({player2Name})</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
