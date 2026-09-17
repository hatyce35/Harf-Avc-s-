import React, { useState, useEffect } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Users, 
  Loader2, 
  Play, 
  ArrowRight, 
  Share2, 
  ExternalLink,
  MessageCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { UserProfile } from '../services/profileManager';
import { soundManager } from '../services/sound';
import { onlineService } from '../services/onlineService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  activeProfile: UserProfile;
  initialRoomCode?: string;
  onRoomReady: (room: any, playerId: string) => void;
}

export const OnlineLobbyModal: React.FC<Props> = ({
  isOpen,
  onClose,
  activeProfile,
  initialRoomCode = '',
  onRoomReady
}) => {
  const [mode, setMode] = useState<'select' | 'create' | 'join'>('select');
  const [createdRoomCode, setCreatedRoomCode] = useState('');
  const [myPlayerId, setMyPlayerId] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [codeCopied, setCodeCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
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

  // Auto-detect initial room code from URL params
  useEffect(() => {
    if (initialRoomCode) {
      setInputCode(initialRoomCode);
      setMode('join');
    }
  }, [initialRoomCode]);

  // Listen for room updates when host is waiting for guest
  useEffect(() => {
    if (!isWaiting) return;

    const unsubscribe = onlineService.onRoomUpdate((room) => {
      if (room.status === 'playing') {
        soundManager.playFanfare();
        setIsWaiting(false);
        onRoomReady(room, myPlayerId || onlineService.getPlayerId());
      }
    });

    return () => {
      unsubscribe();
    };
  }, [isWaiting, myPlayerId, onRoomReady]);

  if (!isOpen) return null;

  // Handle Host: Create Room
  const handleCreateRoom = async () => {
    setLoading(true);
    setError('');
    soundManager.playClick();
    try {
      const { room, playerId } = await onlineService.createRoom(
        { name: activeProfile.name, avatar: activeProfile.avatar },
        selectedTimeLimit
      );
      setCreatedRoomCode(room.code);
      setMyPlayerId(playerId);
      setMode('create');
      setIsWaiting(true);
    } catch (err: any) {
      setError(err?.message || 'Oda oluşturulamadı, lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Guest: Join Room
  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = onlineService.normalizeCode(inputCode);
    if (!clean || clean.length < 4) {
      setError('Lütfen 4 haneli oda kodunu giriniz.');
      return;
    }
    setLoading(true);
    setError('');
    soundManager.playClick();

    try {
      const { room, playerId } = await onlineService.joinRoom(
        clean,
        { name: activeProfile.name, avatar: activeProfile.avatar }
      );
      soundManager.playFanfare();
      onRoomReady(room, playerId);
    } catch (err: any) {
      setError(err?.message || 'Odaya bağlanılamadı. Kodu kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  const getInviteUrl = () => {
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    return `${origin}${pathname}?oda=${createdRoomCode}`;
  };

  const handleCopyCode = () => {
    if (!createdRoomCode) return;
    navigator.clipboard.writeText(createdRoomCode);
    setCodeCopied(true);
    soundManager.playClick();
    setTimeout(() => setCodeCopied(false), 2500);
  };

  const handleCopyLink = () => {
    if (!createdRoomCode) return;
    navigator.clipboard.writeText(getInviteUrl());
    setLinkCopied(true);
    soundManager.playClick();
    setTimeout(() => setLinkCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const url = getInviteUrl();
    const msg = `Harf Avcısı (İsim Şehir Hayvan) canlı düellosuna davet edildin!\nOda Kodu: ${createdRoomCode}\nKatılmak için tıkla: ${url}`;
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
  };

  const handleOpenSecondTabTest = () => {
    const url = getInviteUrl();
    window.open(url, '_blank');
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
                Canlı Online Düello
              </h2>
              <span className="text-[10px] text-slate-500 font-medium">
                Gerçek Zamanlı İsim Şehir Karşılaşması
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              setIsWaiting(false);
              onlineService.leaveRoom();
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
              Arkadaşınla farklı telefonlardan veya bilgisayarlardan canlı yarış! Biriniz oda açıp kod verir, diğeri kodla katılır.
            </p>

            <div className="grid grid-cols-1 gap-2.5 pt-1">
              
              {/* Option 1: Create Room */}
              <div className="p-3.5 rounded-2xl bg-indigo-50/70 border-2 border-indigo-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-indigo-600" />
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

                {error && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold text-center">
                    {error}
                  </div>
                )}
              </div>

              {/* Option 2: Join Room */}
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
                    <div className="leading-tight font-black">Odaya Katıl</div>
                    <div className="text-[10px] text-slate-500 font-normal">Arkadaşının verdiği 4 haneli kodu gir</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>
        )}

        {/* Host Waiting View */}
        {mode === 'create' && (
          <div className="space-y-3.5 text-center py-1">
            <div className="bg-indigo-50/90 border-2 border-dashed border-indigo-300 rounded-2xl p-3.5 space-y-2">
              <div className="text-[10px] font-bold text-indigo-900 uppercase tracking-wider">
                Oda Kodun:
              </div>
              <div className="text-3xl sm:text-4xl font-black text-indigo-950 font-mono tracking-widest select-all">
                {createdRoomCode}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-2 pt-1">
                <button
                  onClick={handleCopyCode}
                  className="flex-1 py-1.5 px-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {codeCopied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{codeCopied ? 'Kopyalandı!' : 'Kodu Kopyala'}</span>
                </button>

                <button
                  onClick={handleShareWhatsApp}
                  className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                  title="WhatsApp ile Paylaş"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>
              </div>

              <div className="pt-1">
                <button
                  onClick={handleCopyLink}
                  className="text-[11px] text-indigo-700 hover:text-indigo-900 font-bold underline cursor-pointer flex items-center justify-center gap-1 mx-auto"
                >
                  <Share2 className="w-3 h-3" />
                  <span>{linkCopied ? 'Bağlantı Panoya Kopyalandı!' : 'Doğrudan Katılma Linkini Kopyala'}</span>
                </button>
              </div>
            </div>

            {/* Waiting indicator */}
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center gap-2 text-xs font-bold text-amber-900 animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
              <span>Arkadaşının katılması bekleniyor...</span>
            </div>

            {/* Test on same device button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleOpenSecondTabTest}
                className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-indigo-600" />
                <span>Bu Cihazda İkinci Sekmede Test Et</span>
              </button>
            </div>

            <button
              onClick={() => {
                setIsWaiting(false);
                onlineService.leaveRoom();
                setMode('select');
              }}
              className="text-xs text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
            >
              İptal Et ve Geri Dön
            </button>
          </div>
        )}

        {/* Guest Join View */}
        {mode === 'join' && (
          <form onSubmit={handleJoinRoom} className="space-y-3.5 py-1">
            <p className="text-xs text-slate-600 font-medium">
              Arkadaşının verdiği 4 haneli oda kodunu gir:
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
                placeholder="Örn: 4821 veya HA-4821"
                autoFocus
                className="w-full text-center text-2xl font-mono font-black py-3 rounded-2xl bg-slate-50 border-2 border-slate-300 focus:bg-white focus:border-indigo-500 focus:outline-none tracking-widest uppercase text-slate-900"
              />
              {error && <p className="text-[11px] text-rose-600 font-bold mt-1.5 text-center">{error}</p>}
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
                <span>Odaya Katıl & Başla</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
