import React, { useState } from 'react';
import { 
  Play, 
  Bot, 
  Users, 
  Settings as SettingsIcon, 
  Sparkles, 
  Trophy, 
  Zap, 
  ChevronRight, 
  HelpCircle,
  Flame,
  ShieldAlert
} from 'lucide-react';
import { UserProfile } from '../services/profileManager';
import { BotDifficulty, BOT_DIFFICULTIES } from '../data/botGenerator';
import { soundManager } from '../services/sound';

interface Props {
  activeProfile: UserProfile;
  onOpenSettings: () => void;
  onStartSolo: () => void;
  onStartAIBattle: (difficulty: BotDifficulty, timeLimit: number) => void;
  onOpenOnlineDuel: () => void;
}

export const WelcomeScreen: React.FC<Props> = ({
  activeProfile,
  onOpenSettings,
  onStartSolo,
  onStartAIBattle,
  onOpenOnlineDuel
}) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<BotDifficulty>('medium');
  const [selectedTimeLimit, setSelectedTimeLimit] = useState<number>(60);
  const [showAIDifficultyPicker, setShowAIDifficultyPicker] = useState(false);

  const difficultyList: BotDifficulty[] = ['very_easy', 'easy', 'medium', 'hard', 'very_hard'];
  const TIME_OPTIONS = [
    { value: 30, label: '30 sn', desc: 'Yıldırım' },
    { value: 45, label: '45 sn', desc: 'Hızlı' },
    { value: 60, label: '60 sn', desc: 'Standart' },
    { value: 120, label: '120 sn', desc: 'Geniş' },
  ];

  return (
    <div className="w-full h-full flex flex-col justify-between py-2 sm:py-3 px-3 sm:px-4 max-w-md mx-auto relative overflow-hidden">
      
      {/* Background Ambience Glows */}
      <div className="absolute -top-16 -left-16 w-52 h-52 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-16 w-52 h-52 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* TOP BAR: Profile Card & Settings Button */}
      <header className="flex items-center justify-between shrink-0 mb-1.5">
        
        {/* User Profile Pill */}
        <button
          onClick={() => {
            soundManager.playClick();
            onOpenSettings();
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/90 border border-slate-200/80 shadow-xs hover:border-amber-400 transition-all cursor-pointer group"
          title="Profili veya Ayarları Değiştir"
        >
          <div className={`w-8 h-8 rounded-xl ${activeProfile.color} text-white flex items-center justify-center text-base shadow-xs group-hover:scale-105 transition-transform`}>
            {activeProfile.avatar}
          </div>
          <div className="text-left">
            <div className="text-xs font-black text-slate-900 leading-none flex items-center gap-1">
              <span>{activeProfile.name}</span>
              <span className="text-[10px] text-amber-600">★</span>
            </div>
            <span className="text-[10px] text-slate-500 font-semibold">
              {activeProfile.stats.totalScore} Puan
            </span>
          </div>
        </button>

        {/* Settings button */}
        <button
          onClick={() => {
            soundManager.playClick();
            onOpenSettings();
          }}
          className="p-2.5 rounded-2xl bg-white/90 border border-slate-200/80 text-slate-600 hover:text-slate-900 hover:border-amber-400 shadow-xs transition-all cursor-pointer"
          title="Ayarlar & Profiller"
        >
          <SettingsIcon className="w-4 h-4" />
        </button>

      </header>

      {/* HERO SECTION: Title & Classic Game Info */}
      <section className="text-center my-auto shrink-0 relative py-1">
        
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-300/80 text-amber-900 text-[11px] font-black uppercase tracking-wider shadow-2xs mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Klasik İsim Şehir Bitki Hayvan</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight font-display leading-tight drop-shadow-xs">
          Harf <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 bg-clip-text text-transparent">Avcısı</span>
        </h1>

        <p className="text-xs sm:text-[13px] text-slate-600 max-w-xs mx-auto mt-1 font-medium leading-relaxed">
          Bildiğimiz geleneksel İsim Şehir oyunu! Rastgele gelen harfle en hızlı ve doğru kelimeleri yaz, puanları topla ve yarış.
        </p>

      </section>

      {/* 3 GAME MODES: HEMEN OYNA / AI'A KARŞI OYNA / ONLINE DÜELLO */}
      <div className="space-y-2.5 my-auto shrink-0">
        
        {/* MODE 1: Hemen Oyna (Solo - Zaman sınırı olmadan, rakipsiz) */}
        <button
          id="mode-solo-btn"
          onClick={() => {
            soundManager.playClick();
            onStartSolo();
          }}
          className="w-full p-3.5 rounded-2xl bg-white border-2 border-emerald-300 hover:border-emerald-500 shadow-sm hover:shadow-md active:scale-[0.99] transition-all text-left flex items-center justify-between cursor-pointer group relative overflow-hidden"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center text-xl shadow-md shadow-emerald-400/30 group-hover:scale-105 transition-transform">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-black text-slate-900 tracking-tight">
                  Hemen Oyna
                </h3>
                <span className="text-[9px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.2 rounded-full">
                  Solo Mod
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium line-clamp-1">
                Süre ve rakip olmadan rastgele harflerle rahatça oyna
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-emerald-500 group-hover:translate-x-0.5 transition-transform shrink-0" />
        </button>

        {/* MODE 2: AI'a Karşı Oyna (Farklı Zorluk Derecelerinde Bot) */}
        <div className="border-2 border-amber-300 rounded-2xl bg-white shadow-sm overflow-hidden transition-all">
          <button
            id="mode-ai-btn"
            onClick={() => {
              soundManager.playClick();
              setShowAIDifficultyPicker(!showAIDifficultyPicker);
            }}
            className="w-full p-3.5 text-left flex items-center justify-between cursor-pointer group hover:bg-amber-50/40 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center text-xl shadow-md shadow-amber-400/30 group-hover:scale-105 transition-transform">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-black text-slate-900 tracking-tight">
                    AI'a Karşı Oyna
                  </h3>
                  <span className="text-[9px] font-extrabold bg-amber-100 text-amber-900 px-2 py-0.2 rounded-full">
                    {BOT_DIFFICULTIES[selectedDifficulty].name}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium line-clamp-1">
                  Türkçe isimli akıllı bota karşı 10 tur yarış
                </p>
              </div>
            </div>
            <ChevronRight className={`w-5 h-5 text-amber-500 transition-transform shrink-0 ${showAIDifficultyPicker ? 'rotate-90' : ''}`} />
          </button>

          {/* Difficulty Drawer */}
          {showAIDifficultyPicker && (
            <div className="p-3 bg-amber-50/70 border-t border-amber-200 space-y-2 animate-fadeIn">
              <div className="text-[11px] font-bold text-amber-950 uppercase tracking-wider">
                Zorluk Derecesi Seç:
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                {difficultyList.map(diff => {
                  const cfg = BOT_DIFFICULTIES[diff];
                  const isSelected = selectedDifficulty === diff;
                  return (
                    <button
                      key={diff}
                      onClick={() => {
                        soundManager.playClick();
                        setSelectedDifficulty(diff);
                      }}
                      className={`p-2 rounded-xl text-left border text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500 text-white border-amber-600 shadow-xs scale-[1.02]'
                          : 'bg-white text-slate-800 border-amber-200/80 hover:bg-amber-100/50'
                      }`}
                    >
                      <div className="leading-tight">{cfg.badge}</div>
                      <div className={`text-[9px] mt-0.5 font-normal line-clamp-1 ${isSelected ? 'text-amber-100' : 'text-slate-500'}`}>
                        {cfg.name} • {cfg.description}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Time Limit Selector */}
              <div className="pt-1 border-t border-amber-200/80">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1">
                    <span>⏱️</span>
                    <span>Tur Süresi:</span>
                  </span>
                  <span className="text-[9px] font-black text-amber-800 bg-amber-200/70 px-2 py-0.5 rounded-full">
                    {TIME_OPTIONS.find(t => t.value === selectedTimeLimit)?.desc}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-1">
                  {TIME_OPTIONS.map(opt => {
                    const isSelected = selectedTimeLimit === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          soundManager.playClick();
                          setSelectedTimeLimit(opt.value);
                        }}
                        className={`py-1.5 px-1 rounded-xl text-center border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-600 text-white border-amber-700 shadow-2xs font-black scale-102'
                            : 'bg-white text-slate-700 border-amber-200 hover:bg-amber-100/50 font-bold text-[11px]'
                        }`}
                      >
                        <div className="leading-tight">{opt.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Start AI Battle Button */}
              <button
                onClick={() => {
                  soundManager.playClick();
                  onStartAIBattle(selectedDifficulty, selectedTimeLimit);
                }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{BOT_DIFFICULTIES[selectedDifficulty].name} Bot ({selectedTimeLimit} sn) Başla</span>
              </button>
            </div>
          )}
        </div>

        {/* MODE 3: Online Düello (Gerçek zamanlı oda aç veya koda bağlan) */}
        <button
          id="mode-online-btn"
          onClick={() => {
            soundManager.playClick();
            onOpenOnlineDuel();
          }}
          className="w-full p-3.5 rounded-2xl bg-white border-2 border-indigo-300 hover:border-indigo-500 shadow-sm hover:shadow-md active:scale-[0.99] transition-all text-left flex items-center justify-between cursor-pointer group relative overflow-hidden"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center text-xl shadow-md shadow-indigo-400/30 group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-black text-slate-900 tracking-tight">
                  Online Düello
                </h3>
                <span className="text-[9px] font-extrabold bg-indigo-100 text-indigo-900 px-2 py-0.2 rounded-full">
                  Canlı Karşılıklı
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium line-clamp-1">
                Oda aç, kodu arkadaşına ver, canlı karşılıklı kapış!
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-indigo-500 group-hover:translate-x-0.5 transition-transform shrink-0" />
        </button>

      </div>

      {/* FOOTER: Friendly Tips */}
      <footer className="text-center shrink-0 pt-2 border-t border-slate-100">
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>İsim • Şehir • Hayvan • Bitki • Eşya • Ülke</span>
        </div>
      </footer>

    </div>
  );
};
