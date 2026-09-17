import React from 'react';
import { 
  Zap, Bot, Users, Calendar, Flame, Sliders, 
  Trophy, Award, Play, ChevronRight, ShieldAlert 
} from 'lucide-react';
import { GameMode, Difficulty, PlayerProfile } from '../types';
import { soundManager } from '../services/sound';

interface MainMenuProps {
  profile: PlayerProfile;
  onSelectMode: (mode: GameMode, options?: { difficulty?: Difficulty }) => void;
  onOpenCustomModal: () => void;
  onOpenLeaderboard: () => void;
  onOpenAchievements: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  profile,
  onSelectMode,
  onOpenCustomModal,
  onOpenLeaderboard,
  onOpenAchievements,
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4 sm:py-8 space-y-6">
      {/* Hero Welcome Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/60 border border-slate-800 p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-300 text-[11px] font-black tracking-wide uppercase border border-amber-400/30">
                TÜRKİYE'NİN KELİME YARIŞMASI
              </span>
              <span className="text-xs text-slate-400 font-semibold">
                Hoş geldin, <span className="text-white font-bold">{profile.name}</span>
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white font-display">
              HARFİ YAKALA, <br className="hidden sm:inline" />
              SÜREYİ YEN!
            </h2>

            <p className="text-xs sm:text-sm text-slate-400 max-w-md">
              İsim-Şehir-Hayvan heyecanını yepyeni kombolar, altın kategoriler, yapay zeka düelloları ve hız bonuslarıyla yaşa.
            </p>
          </div>

          {/* Quick Play Primary CTA */}
          <button
            onClick={() => {
              soundManager.playClick();
              onSelectMode('quick');
            }}
            className="w-full md:w-auto px-8 py-5 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 hover:from-amber-300 hover:to-rose-400 text-slate-950 font-black text-lg shadow-xl shadow-orange-500/25 transition-all active:scale-95 flex items-center justify-center gap-3 font-display group shrink-0"
          >
            <Play className="w-6 h-6 fill-slate-950 group-hover:scale-110 transition-transform" />
            <span>HEMEN OYNA</span>
          </button>
        </div>

        {/* Subtle background glow */}
        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Game Modes Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 px-1 font-display">
          OYUN MODLARI
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {/* Quick Play */}
          <button
            onClick={() => {
              soundManager.playClick();
              onSelectMode('quick');
            }}
            className="flex items-start gap-4 p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-amber-400/50 text-left transition-all active:scale-[0.98] group shadow-sm"
          >
            <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/20 text-amber-400 group-hover:scale-110 transition-transform shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors font-display">
                Hızlı Oyun
              </h4>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                Zamana karşı tek kişilik yarış. Hızlı ve özgün cevaplarla rekor kır!
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-amber-400 transition-colors shrink-0 self-center" />
          </button>

          {/* AI Battle */}
          <button
            onClick={() => {
              soundManager.playClick();
              onSelectMode('ai_battle');
            }}
            className="flex items-start gap-4 p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-indigo-400/50 text-left transition-all active:scale-[0.98] group shadow-sm"
          >
            <div className="p-3 rounded-2xl bg-indigo-500/15 border border-indigo-500/20 text-indigo-400 group-hover:scale-110 transition-transform shrink-0">
              <Bot className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors font-display">
                Yapay Zeka Düellosu
              </h4>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                Akıllı bot rakibe karşı yarış. Cevapları karşılaştır ve itiraz et!
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-indigo-400 transition-colors shrink-0 self-center" />
          </button>

          {/* Friend Mode (Hotseat) */}
          <button
            onClick={() => {
              soundManager.playClick();
              onSelectMode('friend');
            }}
            className="flex items-start gap-4 p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-sky-400/50 text-left transition-all active:scale-[0.98] group shadow-sm"
          >
            <div className="p-3 rounded-2xl bg-sky-500/15 border border-sky-500/20 text-sky-400 group-hover:scale-110 transition-transform shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-base font-bold text-white group-hover:text-sky-300 transition-colors font-display">
                Arkadaş Modu (2 Kişi)
              </h4>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                Aynı cihazda sırayla oynayın. Farklı kelimelerle özgünlük puanı toplayın!
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-sky-400 transition-colors shrink-0 self-center" />
          </button>

          {/* Daily Challenge */}
          <button
            onClick={() => {
              soundManager.playClick();
              onSelectMode('daily');
            }}
            className="flex items-start gap-4 p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-purple-400/50 text-left transition-all active:scale-[0.98] group shadow-sm"
          >
            <div className="p-3 rounded-2xl bg-purple-500/15 border border-purple-500/20 text-purple-400 group-hover:scale-110 transition-transform shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors font-display">
                Günün Görevi
              </h4>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                Günün özel harfi ve özel kuralıyla yarış. En yüksek günlük skoru yap!
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-purple-400 transition-colors shrink-0 self-center" />
          </button>

          {/* Survival Mode */}
          <button
            onClick={() => {
              soundManager.playClick();
              onSelectMode('survival');
            }}
            className="flex items-start gap-4 p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-rose-400/50 text-left transition-all active:scale-[0.98] group shadow-sm"
          >
            <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/20 text-rose-400 group-hover:scale-110 transition-transform shrink-0">
              <Flame className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-base font-bold text-white group-hover:text-rose-300 transition-colors font-display">
                Hayatta Kalma
              </h4>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                Sürekli artan zorluk ve azalan süre! Bir hata yapmadan kaç tur dayanabilirsin?
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-rose-400 transition-colors shrink-0 self-center" />
          </button>

          {/* Custom Match */}
          <button
            onClick={() => {
              soundManager.playClick();
              onOpenCustomModal();
            }}
            className="flex items-start gap-4 p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-emerald-400/50 text-left transition-all active:scale-[0.98] group shadow-sm"
          >
            <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform shrink-0">
              <Sliders className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors font-display">
                Özel Maç Kur
              </h4>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                Kategori sayısı, süre, zorluk seviyesi ve özel kuralları kendin belirle.
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-emerald-400 transition-colors shrink-0 self-center" />
          </button>
        </div>
      </div>

      {/* Quick Player Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div className="text-center border-r border-slate-800/80 pr-2">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Toplam Oyun</span>
          <span className="text-xl sm:text-2xl font-black text-white font-display">{profile.stats.gamesPlayed}</span>
        </div>
        <div className="text-center sm:border-r border-slate-800/80 sm:pr-2">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Zafer Sayısı</span>
          <span className="text-xl sm:text-2xl font-black text-emerald-400 font-display">{profile.stats.wins}</span>
        </div>
        <div className="text-center border-r border-slate-800/80 pr-2">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">En Yüksek Skor</span>
          <span className="text-xl sm:text-2xl font-black text-amber-400 font-display">{profile.stats.highestScore}</span>
        </div>
        <div className="text-center pl-2">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Özgün Kelimeler</span>
          <span className="text-xl sm:text-2xl font-black text-sky-400 font-display">{profile.stats.totalUniqueAnswers}</span>
        </div>
      </div>
    </div>
  );
};
