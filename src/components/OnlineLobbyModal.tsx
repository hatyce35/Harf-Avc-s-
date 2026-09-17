import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Users, Loader2, Play, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { UserProfile } from '../services/profileManager';
import { soundManager } from '../services/sound';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  activeProfile: UserProfile;
  onRoomReady: (room: any, playerId: string) => void;
}

export const OnlineLobbyModal: React.FC<Props> = ({
  isOpen,
  onClose,
  activeProfile,
  onRoomReady
}) => {
  const [mode, setMode] = useState<'select' | 'create' | 'join'>('select');
  const [createdRoomCode, setCreatedRoomCode] = useState('');
  const [myPlayerId, setMyPlayerId] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedTimeLimit, setSelectedTimeLimit] = useState<number>(60);

  const TIME_OPTIONS = [
    { value: 30, label: '30 sn', desc: 'Yıldırım' },
    { value: 45, label: '45 sn', desc: 'Hızlı' },
    { value: 60, label: '60 sn', desc: 'Standart' },
    { value: 120, label: '120 sn', desc: 'Geniş' },
  ];

  // Poll room status when host is waiting for guest
  useEffect(() => {
    if (!isWaiting || !createdRoomCode) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/rooms/${createdRoomCode}`);
        if (!res.ok) return;
        const data = await res.json();
        const room = data.room;
        if (room && room.status === 'playing') {
          soundManager.playFanfare();
          setIsWaiting(false);
          onRoomReady(room, myPlayerId);
        }
      } catch (err) {
        console.warn('Room poll error:', err);
      }
    }, 1200);

    return () => clearInterval(interval);
  }, [isWaiting, createdRoomCode, myPlayerId, onRoomReady]);

  if (!isOpen) return null;

  // Handle Host: Create Room
  const handleCreateRoom = async () => {
    setLoading(true);
    setError('');
    soundManager.playClick();
    try {
      const res = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostName: activeProfile.name,
          hostAvatar: activeProfile.avatar,
          roundTimeLimit: selectedTimeLimit
        })
      });
      const data = await res.json();
      if (data.success) {
        setCreatedRoomCode(data.roomCode);
        setMyPlayerId(data.playerId);
        setMode('create');
        setIsWaiting(true);
      } else {
        setError('Oda oluşturulamadı, tekrar deneyin.');
      }
    } catch {
      setError('Bağlantı hatası.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Guest: Join Room
  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) {
      setError('Lütfen oda kodunu giriniz.');
      return;
    }
    setLoading(true);
    setError('');
    soundManager.playClick();

    try {
      const res = await fetch('/api/rooms/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomCode: inputCode.trim(),
          guestName: activeProfile.name,
          guestAvatar: activeProfile.avatar
        })
      });
      const data = await res.json();
      if (data.success) {
        soundManager.playFanfare();
        onRoomReady(data.room, data.playerId);
      } else {
        setError(data.error || 'Odaya katılamadı.');
      }
    } catch {
      setError('Bağlantı kurulamadı.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (!createdRoomCode) return;
    navigator.clipboard.writeText(createdRoomCode);
    setCopied(true);
    soundManager.playClick();
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border-2 border-indigo-300 rounded-3xl p-5 sm:p-6 max-w-sm w-full shadow-2xl space-y-4 relative overflow-hidden">
        
        {/* Glow */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center text-sm shadow-xs">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight font-display leading-none">
                Online Düello
              </h2>
              <span className="text-[10px] text-slate-500 font-medium">
                Canlı Karşılıklı İsim Şehir
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              setIsWaiting(false);
              onClose();
            }}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selection */}
        {mode === 'select' && (
          <div className="space-y-3 py-1">
            <p className="text-xs text-slate-600 text-center font-medium leading-relaxed">
              Arkadaşınla gerçek zamanlı karşılıklı oyna! İster yeni bir oda açıp kodunu paylaş, ister arkadaşının kodunu gir.
            </p>

            <div className="grid grid-cols-1 gap-2.5 pt-1">
              <div className="p-3.5 rounded-2xl bg-indigo-50/70 border-2 border-indigo-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">⏱️</span>
                    <span className="text-xs font-black text-indigo-950">Tur Süresi Seç:</span>
                  </div>
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md">
                    {TIME_OPTIONS.find(t => t.value === selectedTimeLimit)?.desc}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-1.5">
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
                            ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs font-black scale-102'
                            : 'bg-white text-slate-700 border-indigo-200/80 hover:bg-indigo-100/50 font-bold text-xs'
                        }`}
                      >
                        <div className="text-[11px] leading-tight">{opt.label}</div>
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={handleCreateRoom}
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black text-xs shadow-md shadow-indigo-300/40 active:scale-[0.99] flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <div className="w-5 h-5 rounded-lg bg-white/20 flex items-center justify-center text-xs">
                    🏠
                  </div>
                  <span>Odayı Oluştur ve Kod Al ({selectedTimeLimit} sn)</span>
                  {loading && <Loader2 className="w-4 h-4 animate-spin ml-1" />}
                </button>
              </div>

              <button
                onClick={() => {
                  setError('');
                  setMode('join');
                }}
                className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border-2 border-slate-200 text-slate-800 font-bold text-sm active:scale-[0.99] flex items-center justify-between transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-slate-200/80 flex items-center justify-center text-base">
                    🔑
                  </div>
                  <div className="text-left">
                    <div className="leading-tight">Odaya Katıl</div>
                    <div className="text-[10px] text-slate-500 font-normal">Arkadaşının verdiği kod numarasını gir</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>
        )}

        {/* Host Waiting View */}
        {mode === 'create' && (
          <div className="space-y-4 text-center py-2">
            <div className="bg-indigo-50/80 border-2 border-dashed border-indigo-300 rounded-2xl p-4 space-y-2">
              <div className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider">
                Oda Kodun:
              </div>
              <div className="text-3xl font-black text-indigo-950 font-mono tracking-widest select-all">
                {createdRoomCode}
              </div>
              <button
                onClick={handleCopyCode}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Kopyalandı!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Kodu Kopyala</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-600 animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
              <span>İkinci oyuncu bekleniyor...</span>
            </div>

            <p className="text-[11px] text-slate-500">
              Bu kodu arkadaşına gönder. O da "Odaya Katıl" ekranına bu kodu girdiğinde maç 10 tur boyunca otomatik başlayacak!
            </p>

            <button
              onClick={() => {
                setIsWaiting(false);
                setMode('select');
              }}
              className="text-xs text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
            >
              İptal Et
            </button>
          </div>
        )}

        {/* Guest Join View */}
        {mode === 'join' && (
          <form onSubmit={handleJoinRoom} className="space-y-3.5 py-1">
            <p className="text-xs text-slate-600 font-medium">
              Arkadaşının kurduğu odanın kod numarasını gir:
            </p>

            <div>
              <input
                type="text"
                maxLength={8}
                value={inputCode}
                onChange={e => {
                  setInputCode(e.target.value.toUpperCase());
                  if (error) setError('');
                }}
                placeholder="Örn: HA-4821"
                autoFocus
                className="w-full text-center text-xl font-mono font-black py-2.5 rounded-xl bg-slate-50 border-2 border-slate-300 focus:bg-white focus:border-indigo-500 focus:outline-none tracking-wider uppercase text-slate-900"
              />
              {error && <p className="text-[11px] text-rose-600 font-bold mt-1 text-center">{error}</p>}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMode('select')}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Geri
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-[1.8] py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black text-xs shadow-md shadow-indigo-300/50 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>Odaya Katıl & Oyna</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
