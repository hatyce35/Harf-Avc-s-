import React, { useState } from 'react';
import { ArrowRight, Check, Sparkles, Trophy, Zap, Clock, ShieldCheck } from 'lucide-react';
import { soundManager } from '../services/sound';

interface TutorialModalProps {
  isOpen: boolean;
  onComplete: (playerName: string) => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({
  isOpen,
  onComplete,
}) => {
  const [step, setStep] = useState<'name' | 'guide'>('name');
  const [name, setName] = useState('');
  const [guideIndex, setGuideIndex] = useState(0);

  if (!isOpen) return null;

  const tutorialSteps = [
    {
      icon: '🎯',
      title: '1. Harfi Yakala',
      desc: 'Her turun başında rastgele bir Türkçe harf belirlenir (Örn: "K"). Tüm kelimelerin bu harfle başlamalı!',
    },
    {
      icon: '✍️',
      title: '2. Kategorileri Doldur',
      desc: 'İsim, Şehir, Hayvan, Yiyecek gibi popüler kategorilere en uygun kelimeleri süren dolmadan yaz.',
    },
    {
      icon: '💎',
      title: '3. Özgün Ol, 2 Kat Puan Al!',
      desc: 'Herkesin aklına gelen sıradan kelimeler yerine rakibinin düşünemediği özgün kelimeleri bul ve ekstra +10 puan kap!',
    },
    {
      icon: '🔥',
      title: '4. Kombo ve Altın Kategoriler',
      desc: 'Peş peşe doğru kelimeler bularak kombo çarpanını x5\'e kadar çıkar. Altın kategoride 2 kat puan topla!',
    },
    {
      icon: '⚡',
      title: '5. Süreyi Yen, Şampiyon Ol!',
      desc: 'Hızlı cevap verenler Hız Bonusu kazanır. Süre bitmeden BİTİR butonuna bas ve skoru gör!',
    },
  ];

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playClick();
    if (name.trim()) {
      setStep('guide');
    }
  };

  const handleNextGuide = () => {
    soundManager.playClick();
    if (guideIndex < tutorialSteps.length - 1) {
      setGuideIndex(prev => prev + 1);
    } else {
      onComplete(name.trim() || 'Avcı');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center">
        {step === 'name' ? (
          <form onSubmit={handleNameSubmit} className="space-y-6">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-500 flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-orange-500/20 font-display">
              H
            </div>

            <div>
              <span className="text-[11px] font-black uppercase tracking-widest text-amber-400">
                HARF AVCISI'NA HOŞ GELDİN
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1 font-display">
                Kelimeyi Bul. Süreyi Yen.
              </h2>
              <p className="text-xs text-slate-400 mt-2">
                Yarışmaya başlamak için oyuncu adını belirle.
              </p>
            </div>

            <div>
              <input
                type="text"
                autoFocus
                required
                maxLength={16}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Adın veya lakabın..."
                className="w-full px-4 py-3.5 bg-slate-950 rounded-2xl text-base font-bold text-white text-center placeholder-slate-600 border border-slate-800 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={!name.trim()}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 hover:from-amber-300 hover:to-rose-400 text-slate-950 font-black text-base shadow-xl shadow-orange-500/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 font-display"
            >
              <span>DEVAM ET</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="text-5xl animate-bounce">
              {tutorialSteps[guideIndex].icon}
            </div>

            <div>
              <span className="text-[11px] font-black uppercase tracking-widest text-amber-400">
                NASIL OYNANIR? ({guideIndex + 1}/{tutorialSteps.length})
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white mt-1 font-display">
                {tutorialSteps[guideIndex].title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-3 leading-relaxed">
                {tutorialSteps[guideIndex].desc}
              </p>
            </div>

            {/* Step Indicators */}
            <div className="flex justify-center gap-1.5">
              {tutorialSteps.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === guideIndex ? 'w-6 bg-amber-400' : 'w-2 bg-slate-800'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={handleNextGuide}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-base shadow-xl shadow-orange-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 font-display"
            >
              <span>{guideIndex === tutorialSteps.length - 1 ? 'OYUNA BAŞLA' : 'SONRAKİ'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
