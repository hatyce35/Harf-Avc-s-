import React, { useState } from 'react';
import { X, UserPlus, Trash2, Check, User, Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { AVATAR_LIST, COLOR_LIST, UserProfile, profileManager } from '../services/profileManager';
import { soundManager } from '../services/sound';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  activeProfile: UserProfile | null;
  onProfileUpdated: (profile: UserProfile) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onResetStats: () => void;
}

export const SettingsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  activeProfile,
  onProfileUpdated,
  soundEnabled,
  onToggleSound,
  onResetStats
}) => {
  const [profiles, setProfiles] = useState<UserProfile[]>(() => profileManager.getAllProfiles());
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Form states
  const [name, setName] = useState(activeProfile?.name || '');
  const [avatar, setAvatar] = useState(activeProfile?.avatar || '🦊');
  const [color, setColor] = useState(activeProfile?.color || 'bg-amber-500');
  const [error, setError] = useState('');

  if (!isOpen || !activeProfile) return null;

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('İsim boş olamaz');
      return;
    }
    const updated = profileManager.updateProfile(activeProfile.id, {
      name: name.trim(),
      avatar,
      color
    });
    if (updated) {
      soundManager.playSuccess();
      onProfileUpdated(updated);
      setIsEditing(false);
      setProfiles(profileManager.getAllProfiles());
    }
  };

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('İsim boş olamaz');
      return;
    }
    const created = profileManager.saveProfile(name.trim(), avatar, color);
    soundManager.playSuccess();
    onProfileUpdated(created);
    setIsAddingNew(false);
    setProfiles(profileManager.getAllProfiles());
  };

  const handleSwitchProfile = (p: UserProfile) => {
    soundManager.playClick();
    const switched = profileManager.setActiveProfile(p.id);
    if (switched) {
      onProfileUpdated(switched);
      setName(switched.name);
      setAvatar(switched.avatar);
      setColor(switched.color);
    }
  };

  const handleDeleteProfile = (id: string) => {
    if (profiles.length <= 1) {
      alert('En az bir profil bulunmalıdır!');
      return;
    }
    if (window.confirm('Bu profili silmek istediğinize emin misiniz?')) {
      const next = profileManager.deleteProfile(id);
      soundManager.playClick();
      setProfiles(profileManager.getAllProfiles());
      if (next) onProfileUpdated(next);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border-2 border-slate-200 rounded-3xl p-5 max-w-md w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center text-base">
              ⚙️
            </div>
            <h2 className="text-base font-black text-slate-900 tracking-tight font-display">
              Ayarlar & Profiller
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Edit or Add Profile View */}
        {(isEditing || isAddingNew) ? (
          <form onSubmit={isAddingNew ? handleCreateNew : handleSaveEdit} className="space-y-3.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                {isAddingNew ? 'Yeni Profil Oluştur' : 'Profili Düzenle'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setIsAddingNew(false);
                }}
                className="text-xs text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
              >
                Vazgeç
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Profil İsmi:
              </label>
              <input
                type="text"
                maxLength={18}
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-800 focus:outline-none focus:border-amber-500"
                placeholder="İsim..."
              />
              {error && <p className="text-[10px] text-rose-600 font-bold mt-1">{error}</p>}
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Avatar Seç:
              </label>
              <div className="grid grid-cols-5 gap-1 max-h-24 overflow-y-auto p-1 bg-white border border-slate-200 rounded-xl">
                {AVATAR_LIST.map(av => (
                  <button
                    type="button"
                    key={av}
                    onClick={() => setAvatar(av)}
                    className={`h-8 rounded-lg text-base flex items-center justify-center cursor-pointer ${
                      avatar === av ? 'bg-amber-100 ring-2 ring-amber-500' : 'hover:bg-slate-100'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Renk:
              </label>
              <div className="flex items-center gap-2">
                {COLOR_LIST.map(c => (
                  <button
                    type="button"
                    key={c.bg}
                    onClick={() => setColor(c.bg)}
                    className={`w-6 h-6 rounded-full ${c.bg} flex items-center justify-center cursor-pointer ${
                      color === c.bg ? 'ring-2 ring-offset-2 ring-slate-800' : ''
                    }`}
                  >
                    {color === c.bg && <Check className="w-3 h-3 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-xs cursor-pointer"
            >
              {isAddingNew ? 'Kaydet & Kullan' : 'Değişiklikleri Kaydet'}
            </button>
          </form>
        ) : (
          /* Profile Switcher List */
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">
                Kayıtlı Profiller ({profiles.length})
              </span>
              <button
                onClick={() => {
                  setName('');
                  setAvatar('🦁');
                  setColor('bg-purple-600');
                  setIsAddingNew(true);
                }}
                className="inline-flex items-center gap-1 text-[11px] font-black text-amber-700 hover:text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Yeni Profil Ekle</span>
              </button>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-0.5">
              {profiles.map(p => {
                const isActive = p.id === activeProfile.id;
                return (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between p-2 rounded-xl border transition-all ${
                      isActive
                        ? 'bg-amber-50/80 border-amber-300 ring-1 ring-amber-300'
                        : 'bg-slate-50 border-slate-200 hover:bg-white'
                    }`}
                  >
                    <div 
                      onClick={() => handleSwitchProfile(p)}
                      className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer"
                    >
                      <div className={`w-8 h-8 rounded-xl ${p.color} text-white flex items-center justify-center text-base shadow-xs shrink-0`}>
                        {p.avatar}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-slate-900 truncate">
                            {p.name}
                          </span>
                          {isActive && (
                            <span className="text-[9px] font-extrabold bg-amber-500 text-white px-1.5 py-0.2 rounded-full">
                              Aktif
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {p.stats.roundsPlayed} Tur • {p.stats.totalScore} Puan • {p.stats.wins} Galibiyet
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      {isActive && (
                        <button
                          onClick={() => {
                            setName(p.name);
                            setAvatar(p.avatar);
                            setColor(p.color);
                            setIsEditing(true);
                          }}
                          className="px-2 py-1 rounded-lg text-[10px] font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 cursor-pointer"
                        >
                          Düzenle
                        </button>
                      )}
                      {profiles.length > 1 && (
                        <button
                          onClick={() => handleDeleteProfile(p.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Profili Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Audio and Game Preferences */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
              <span>Ses Efektleri:</span>
            </div>
            <button
              onClick={onToggleSound}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                soundEnabled ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'
              }`}
            >
              {soundEnabled ? 'Açık' : 'Kapalı'}
            </button>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-xs font-bold text-slate-700">
              Oyun İstatistikleri:
            </span>
            <button
              onClick={onResetStats}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Sıfırla</span>
            </button>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
        >
          Kapat
        </button>

      </div>
    </div>
  );
};
