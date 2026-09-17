import React, { useState } from 'react';
import { X, Play, Sliders } from 'lucide-react';
import { CustomGameConfig, Difficulty } from '../types';
import { soundManager } from '../services/sound';

interface CustomGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartCustomGame: (config: CustomGameConfig) => void;
}

export const CustomGameModal: React.FC<CustomGameModalProps> = ({
  isOpen,
  onClose,
  onStartCustomGame,
}) => {
  const [categoryCount, setCategoryCount] = useState<number>(6);
  const [timeLimit, setTimeLimit] = useState<number>(60);
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [specialEvents, setSpecialEvents] = useState<boolean>(true);

  if (!isOpen) return null;

  const categoryOptions = [4, 5, 6, 8, 10];
  const timeOptions = [30, 45, 60, 90, 120];
  const difficultyOptions: { id: Difficulty; label: string }[] = [
    { id: 'easy', label: 'Kolay' },
    { id: 'normal', label: 'Normal' },
    { id: 'hard', label: 'Zor' },
    { id: 'expert', label: 'Uzman' },
  ];

  const handleStart = () => {
    soundManager.playClick();
    onStartCustomGame({
      categoryCount,
      timeLimit,
      difficulty,
      specialEventsEnabled: specialEvents,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/20 text-emerald-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white font-display">ÖZEL MAÇ AYARLARI</h3>
              <p className="text-xs text-slate-400">Maç kurallarını zevkine göre özelleştir</p>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Options */}
        <div className="space-y-4">
          {/* Category Count */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
              Kategori Sayısı
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {categoryOptions.map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => {
                    soundManager.playClick();
                    setCategoryCount(cnt);
                  }}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    categoryCount === cnt
                      ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                  }`}
                >
                  {cnt}
                </button>
              ))}
            </div>
          </div>

          {/* Time Limit */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
              Süre Limiti
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {timeOptions.map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => {
                    soundManager.playClick();
                    setTimeLimit(sec);
                  }}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    timeLimit === sec
                      ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                  }`}
                >
                  {sec}s
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
              Zorluk Seviyesi
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {difficultyOptions.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => {
                    soundManager.playClick();
                    setDifficulty(d.id);
                  }}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    difficulty === d.id
                      ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Special Events Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
            <div>
              <span className="text-xs font-bold text-white block">Özel Harf Olayları</span>
              <span className="text-[11px] text-slate-400">Çift Puan, Kaos Harfi ve Son Şans</span>
            </div>
            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                setSpecialEvents(!specialEvents);
              }}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                specialEvents ? 'bg-emerald-500' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  specialEvents ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={handleStart}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 font-display"
        >
          <Play className="w-4 h-4 fill-slate-950" />
          <span>ÖZEL MAÇI BAŞLAT</span>
        </button>
      </div>
    </div>
  );
};
