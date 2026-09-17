import React, { useState } from 'react';
import { X, Users, Play, Clock, Sparkles } from 'lucide-react';
import { soundManager } from '../services/sound';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  p1Name: string;
  p1Avatar: string;
  onStartLocalDuel: (p1: { name: string; avatar: string }, p2: { name: string; avatar: string }, timeLimit: number) => void;
}

const AVATARS = ['🦊', '🦁', '🐼', '🐯', '🦄', '🐰', '🦉', '🐬', '🐶', '🐱'];

export const LocalDuelSetupModal: React.FC<Props> = ({
  isOpen,
  onClose,
  p1Name,
  p1Avatar,
  onStartLocalDuel
}) => {
  const [player1Name, setPlayer1Name] = useState(p1Name || 'Oyuncu 1');
  const [player1Avatar, setPlayer1Avatar] = useState(p1Avatar || '🦊');

  const [player2Name, setPlayer2Name] = useState('Oyuncu 2');
  const [player2Avatar, setPlayer2Avatar] = useState('🦁');

  const [timeLimit, setTimeLimit] = useState<number>(60);

  const TIME_OPTIONS = [
    { value: 30, label: '30 sn', desc: 'Yıldırım' },
    { value: 45, label: '45 sn', desc: 'Hızlı' },
    { value: 60, label: '60 sn', desc: 'Standart' },
    { value: 120, label: '120 sn', desc: 'Geniş' },
  ];

  if (!isOpen) return null;

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playFanfare();
    onStartLocalDuel(
      { name: player1Name.trim() || 'Oyuncu 1', avatar: player1Avatar },
      { name: player2Name.trim() || 'Oyuncu 2', avatar: player2Avatar },
      timeLimit
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border-2 border-amber-300 rounded-3xl p-5 sm:p-6 max-w-sm w-full shadow-2xl space-y-4 relative overflow-hidden">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center text-sm shadow-xs">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight font-display leading-none">
                Yan Yana Düello
              </h2>
              <span className="text-[10px] text-slate-500 font-medium">
                Aynı Cihazda 2 Kişilik Kapışma
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleStart} className="space-y-3.5">
          <p className="text-xs text-slate-600 text-center font-medium leading-relaxed">
            Telefonu veya ekranı sırayla kullanarak yan yana kapışın! Önce 1. Oyuncu, sonra 2. Oyuncu doldurur. Sonunda cevaplar ve Piştiler kıyaslanır.
          </p>

          {/* Player 1 Card */}
          <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-amber-950">1. Oyuncu:</span>
              <span className="text-[10px] text-amber-700 font-bold">İlk Başlayacak</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center text-xl shadow-xs shrink-0">
                {player1Avatar}
              </div>
              <input
                type="text"
                value={player1Name}
                maxLength={15}
                onChange={e => setPlayer1Name(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-white border border-amber-300 font-bold text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                placeholder="1. Oyuncu Adı"
              />
            </div>
          </div>

          {/* Player 2 Card */}
          <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-indigo-950">2. Oyuncu:</span>
              <span className="text-[10px] text-indigo-700 font-bold">İkinci Başlayacak</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <select
                  value={player2Avatar}
                  onChange={e => setPlayer2Avatar(e.target.value)}
                  className="w-10 h-10 rounded-xl bg-indigo-600 text-white text-xl appearance-none text-center cursor-pointer shadow-xs shrink-0"
                >
                  {AVATARS.map(a => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
              <input
                type="text"
                value={player2Name}
                maxLength={15}
                onChange={e => setPlayer2Name(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-white border border-indigo-300 font-bold text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                placeholder="Arkadaşının Adı"
              />
            </div>
          </div>

          {/* Time Limit Selector */}
          <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-black text-slate-800">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Oyuncu Başı Süre:</span>
              </div>
              <span className="text-[10px] font-bold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                {TIME_OPTIONS.find(t => t.value === timeLimit)?.desc}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1">
              {TIME_OPTIONS.map(opt => {
                const isSelected = timeLimit === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      soundManager.playClick();
                      setTimeLimit(opt.value);
                    }}
                    className={`py-1.5 px-1 rounded-xl text-center border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500 text-white border-amber-600 shadow-2xs font-black scale-102'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50 font-bold text-xs'
                    }`}
                  >
                    <div className="text-[11px] leading-tight">{opt.label}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Start Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-black text-sm shadow-md shadow-amber-400/40 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>10 Turluk Düelloya Başla</span>
          </button>
        </form>

      </div>
    </div>
  );
};
