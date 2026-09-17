import React, { useState } from 'react';
import { Sparkles, User, Check } from 'lucide-react';
import { AVATAR_LIST, COLOR_LIST, UserProfile, profileManager } from '../services/profileManager';
import { soundManager } from '../services/sound';

interface Props {
  isOpen: boolean;
  onProfileCreated: (profile: UserProfile) => void;
}

export const InitialProfileModal: React.FC<Props> = ({ isOpen, onProfileCreated }) => {
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_LIST[0]);
  const [selectedColor, setSelectedColor] = useState(COLOR_LIST[2].bg); // Amber
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      setError('Lütfen bir oyuncu ismi giriniz!');
      return;
    }
    soundManager.playSuccess();
    const newProfile = profileManager.saveProfile(cleanName, selectedAvatar, selectedColor);
    onProfileCreated(newProfile);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border-2 border-amber-300 rounded-3xl p-5 sm:p-7 max-w-sm w-full shadow-2xl space-y-4 text-center relative overflow-hidden">
        
        {/* Glow Effect */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-40 h-40 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />

        {/* Title */}
        <div className="relative">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-amber-400 via-amber-500 to-amber-600 text-white flex items-center justify-center shadow-lg shadow-amber-400/30 text-3xl mb-2.5">
            {selectedAvatar}
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight font-display">
            Harf Avcısı'na Hoş Geldin!
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Oyuna başlamak için oyuncu profilini oluştur:
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {/* Name input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Oyuncu İsmi:
            </label>
            <div className="relative">
              <input
                type="text"
                maxLength={18}
                value={name}
                onChange={e => {
                  setName(e.target.value);
                  if (error) setError('');
                }}
                placeholder="İsmini yaz (Örn: Can, Aslı, Mert)..."
                autoFocus
                className="w-full pl-3.5 pr-3 py-2.5 rounded-xl bg-slate-50 border-2 border-slate-200 focus:bg-white focus:border-amber-500 focus:outline-none text-sm font-bold text-slate-900 transition-all placeholder:text-slate-400 placeholder:font-normal"
              />
            </div>
            {error && (
              <p className="text-[11px] text-rose-600 font-bold mt-1">
                {error}
              </p>
            )}
          </div>

          {/* Avatar selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Avatarını Seç:
            </label>
            <div className="grid grid-cols-5 gap-1.5 max-h-28 overflow-y-auto p-1 bg-slate-50 border border-slate-200/80 rounded-xl">
              {AVATAR_LIST.map(av => (
                <button
                  type="button"
                  key={av}
                  onClick={() => {
                    soundManager.playClick();
                    setSelectedAvatar(av);
                  }}
                  className={`h-9 rounded-lg text-lg flex items-center justify-center transition-all cursor-pointer ${
                    selectedAvatar === av
                      ? 'bg-amber-100 ring-2 ring-amber-500 scale-105 shadow-xs'
                      : 'hover:bg-white hover:scale-105'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          {/* Color theme selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Profil Rengi:
            </label>
            <div className="flex items-center gap-2">
              {COLOR_LIST.map(c => (
                <button
                  type="button"
                  key={c.bg}
                  onClick={() => {
                    soundManager.playClick();
                    setSelectedColor(c.bg);
                  }}
                  className={`w-7 h-7 rounded-full ${c.bg} flex items-center justify-center transition-transform cursor-pointer ${
                    selectedColor === c.bg ? 'ring-2 ring-offset-2 ring-slate-800 scale-110' : 'hover:scale-105'
                  }`}
                  title={c.name}
                >
                  {selectedColor === c.bg && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-700 text-white font-black text-sm shadow-md shadow-amber-300/60 active:scale-[0.99] flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Oyuna Başla</span>
          </button>
        </form>

      </div>
    </div>
  );
};
