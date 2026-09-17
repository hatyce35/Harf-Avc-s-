import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  User, 
  Building2, 
  Cat, 
  Flower2, 
  Package, 
  Globe, 
  Volume2, 
  VolumeX, 
  RotateCw, 
  CheckCircle2, 
  XCircle, 
  Trophy, 
  Clock, 
  Sparkles, 
  Bot, 
  AlertTriangle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Check,
  Swords,
  Users,
  Zap,
  Home,
  Settings as SettingsIcon,
  Flame,
  Radio
} from 'lucide-react';
import { TURKISH_DICTIONARY } from './data/wordDatabase';
import { 
  NORMAL_LETTERS, 
  toTurkishLower, 
  getFirstTurkishLetter 
} from './utils/turkish';
import { soundManager } from './services/sound';
import { validateRoundAnswers } from './services/validator';
import { profileManager, UserProfile } from './services/profileManager';
import { generateRandomBot, GeneratedBot, BotDifficulty, BOT_DIFFICULTIES } from './data/botGenerator';
import { InitialProfileModal } from './components/InitialProfileModal';
import { SettingsModal } from './components/SettingsModal';
import { OnlineLobbyModal } from './components/OnlineLobbyModal';
import { WelcomeScreen } from './components/WelcomeScreen';
import { RoundResultScreen, CategoryResultItem } from './components/RoundResultScreen';
import { TournamentEndModal } from './components/TournamentEndModal';
import { SparkleAura } from './components/SparkleAura';
import { TimerBar } from './components/TimerBar';
import { triggerStarSparkles } from './utils/sparkleEffects';

// 6 Classic Turkish Name-City-Animal categories
export interface CategoryConfig {
  id: string;
  name: string;
  subText: string;
  icon: React.ComponentType<{ className?: string }>;
  placeholder: string;
}

export const CATEGORIES: CategoryConfig[] = [
  { id: 'name', name: 'İsim', subText: 'Kadın / Erkek insan adı', icon: User, placeholder: 'isim yazın...' },
  { id: 'city', name: 'Şehir', subText: 'Türkiye veya dünya şehri', icon: Building2, placeholder: 'şehir yazın...' },
  { id: 'animal', name: 'Hayvan', subText: 'Herhangi bir hayvan türü', icon: Cat, placeholder: 'hayvan yazın...' },
  { id: 'plant', name: 'Bitki / Meyve', subText: 'Ağaç, çiçek, meyve, sebze', icon: Flower2, placeholder: 'bitki veya meyve...' },
  { id: 'object', name: 'Eşya', subText: 'Nesne, eşya, alet, mobilya', icon: Package, placeholder: 'eşya yazın...' },
  { id: 'country', name: 'Ülke', subText: 'Bağımsız dünya ülkesi', icon: Globe, placeholder: 'ülke yazın...' },
];

export type AppView = 'welcome' | 'playing' | 'round_results';
export type ActiveMode = 'solo' | 'ai' | 'online';

export default function App() {
  // --- USER PROFILE & SETTINGS ---
  const [activeProfile, setActiveProfile] = useState<UserProfile | null>(() => {
    return profileManager.getActiveProfile();
  });
  const [showInitialModal, setShowInitialModal] = useState<boolean>(() => {
    return profileManager.getActiveProfile() === null;
  });
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showOnlineLobby, setShowOnlineLobby] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('harf_avcisi_sound');
    return saved !== null ? saved === 'true' : true;
  });

  // Sync sound manager
  useEffect(() => {
    soundManager.setSoundEnabled(soundEnabled);
    localStorage.setItem('harf_avcisi_sound', String(soundEnabled));
  }, [soundEnabled]);

  // --- NAVIGATION / SCREEN STATE ---
  const [currentView, setCurrentView] = useState<AppView>('welcome');
  const [gameMode, setGameMode] = useState<ActiveMode>('ai');

  // --- TOURNAMENT / ROUND TRACKING ---
  const [roundNumber, setRoundNumber] = useState<number>(1);
  const MAX_ROUNDS = 10;
  const [showTournamentEnd, setShowTournamentEnd] = useState<boolean>(false);

  // Scores across the 10-round match
  const [p1TournamentScore, setP1TournamentScore] = useState<number>(0);
  const [p2TournamentScore, setP2TournamentScore] = useState<number>(0);

  // Current Round Scoring
  const [p1RoundScore, setP1RoundScore] = useState<number>(0);
  const [p2RoundScore, setP2RoundScore] = useState<number>(0);
  const [categoryResults, setCategoryResults] = useState<CategoryResultItem[]>([]);

  // --- ROUND PLAY STATE ---
  const [targetLetter, setTargetLetter] = useState<string>(() => {
    return NORMAL_LETTERS[Math.floor(Math.random() * NORMAL_LETTERS.length)];
  });
  const [answers, setAnswers] = useState<Record<string, string>>({
    name: '',
    city: '',
    animal: '',
    plant: '',
    object: '',
    country: ''
  });
  const [activeCategoryIndex, setActiveCategoryIndex] = useState<number>(0);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const currentInputRef = useRef<HTMLInputElement | null>(null);

  // --- ROUND TIMER STATE (30, 45, 60, 120 sn) ---
  const [roundTimeLimit, setRoundTimeLimit] = useState<number | null>(60);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const handleDurRef = useRef<() => void>(() => {});

  // --- AI OPPONENT STATE ---
  const [botOpponent, setBotOpponent] = useState<GeneratedBot>(() => generateRandomBot('medium'));
  const [botProgressCount, setBotProgressCount] = useState<number>(0);
  const [botStatusMessage, setBotStatusMessage] = useState<string>('');
  const botPlannedAnswersRef = useRef<Record<string, string>>({});

  // --- ONLINE MULTIPLAYER STATE ---
  const [onlineRoomCode, setOnlineRoomCode] = useState<string>('');
  const [onlinePlayerId, setOnlinePlayerId] = useState<string>('');
  const [onlineRoomState, setOnlineRoomState] = useState<any>(null);

  // Focus input automatically
  useEffect(() => {
    if (currentView === 'playing' && !isValidating) {
      setTimeout(() => {
        currentInputRef.current?.focus();
      }, 60);
    }
  }, [currentView, activeCategoryIndex, isValidating]);

  // Helper: Prepare AI opponent answers based on letter & difficulty
  const prepareAIBot = useCallback((letter: string, bot: GeneratedBot) => {
    const planned: Record<string, string> = {};
    const countTarget = bot.difficultyConfig.wordCountExpected;
    let assigned = 0;

    CATEGORIES.forEach((cat, idx) => {
      const words = TURKISH_DICTIONARY[cat.id]?.[letter] || [];
      const shouldPick = assigned < countTarget && Math.random() <= bot.difficultyConfig.accuracy;
      if (shouldPick && words.length > 0) {
        const randomIndex = Math.floor(Math.random() * words.length);
        planned[cat.id] = words[randomIndex];
        assigned++;
      } else {
        planned[cat.id] = '';
      }
    });

    botPlannedAnswersRef.current = planned;
    setBotProgressCount(0);
    setBotStatusMessage(`${bot.name} düşünüyor...`);
  }, []);

  // AI live typing simulator
  useEffect(() => {
    if (currentView !== 'playing' || gameMode !== 'ai') return;

    const delay = Math.floor(
      Math.random() * (botOpponent.difficultyConfig.speedMaxMs - botOpponent.difficultyConfig.speedMinMs) + 
      botOpponent.difficultyConfig.speedMinMs
    );

    const timer = setTimeout(() => {
      setBotProgressCount(prev => {
        const next = Math.min(prev + 1, botOpponent.difficultyConfig.wordCountExpected);
        if (next >= botOpponent.difficultyConfig.wordCountExpected) {
          setBotStatusMessage(`✨ ${botOpponent.name} yazmayı bitirdi!`);
        } else {
          setBotStatusMessage(`⚡ ${botOpponent.name} ${next}/${CATEGORIES.length} kelime yazdı.`);
        }
        return next;
      });
    }, delay);

    return () => clearTimeout(timer);
  }, [currentView, gameMode, botProgressCount, botOpponent]);

  // --- ONLINE POLLING LOOP ---
  useEffect(() => {
    if (gameMode !== 'online' || !onlineRoomCode) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/rooms/${onlineRoomCode}?playerId=${onlinePlayerId}`);
        if (!res.ok) return;
        const data = await res.json();
        const room = data.room;
        if (!room) return;
        setOnlineRoomState(room);

        // Synchronize letter and round number
        if (room.currentLetter && room.currentLetter !== targetLetter) {
          setTargetLetter(room.currentLetter);
        }
        if (room.roundNumber) {
          setRoundNumber(room.roundNumber);
        }

        // Opponent pressed DUR!
        if (room.status === 'scored' && currentView === 'playing') {
          handleOnlineScored(room);
        } else if (room.status === 'finished') {
          handleOnlineScored(room);
          setShowTournamentEnd(true);
        }
      } catch (err) {
        console.warn('Online sync error:', err);
      }
    }, 1100);

    return () => clearInterval(interval);
  }, [gameMode, onlineRoomCode, onlinePlayerId, currentView, targetLetter]);

  // Handle Online Scored from Server
  const handleOnlineScored = (room: any) => {
    const playerIds = Object.keys(room.players);
    const myId = onlinePlayerId;
    const opponentId = playerIds.find(id => id !== myId);

    const me = room.players[myId] || { roundScore: 0, totalScore: 0 };
    const opp = opponentId ? room.players[opponentId] : { roundScore: 0, totalScore: 0 };

    setP1RoundScore(me.roundScore || 0);
    setP1TournamentScore(me.totalScore || 0);
    setP2RoundScore(opp.roundScore || 0);
    setP2TournamentScore(opp.totalScore || 0);

    // Build category results
    const catItems: CategoryResultItem[] = CATEGORIES.map(cat => {
      const r = room.results?.[cat.id] || {};
      const isP1Host = playerIds[0] === myId;
      const myWord = isP1Host ? r.p1Answer : r.p2Answer;
      const myStatus = isP1Host ? r.p1Status : r.p2Status;
      const myPts = isP1Host ? r.p1Points : r.p2Points;
      const oppWord = isP1Host ? r.p2Answer : r.p1Answer;
      const oppStatus = isP1Host ? r.p2Status : r.p1Status;
      const oppPts = isP1Host ? r.p2Points : r.p1Points;

      return {
        categoryId: cat.id,
        categoryName: cat.name,
        icon: cat.icon,
        p1Word: myWord || '',
        p1Status: myStatus || 'empty',
        p1Points: myPts || 0,
        p2Word: oppWord || '',
        p2Status: oppStatus || 'empty',
        p2Points: oppPts || 0,
        isPisti: r.isPisti
      };
    });

    setCategoryResults(catItems);
    setCurrentView('round_results');
    soundManager.playFanfare();
  };

  // Keep fresh reference of handleDur for timer callback
  useEffect(() => {
    handleDurRef.current = handleDur;
  });

  // Countdown Timer Effect for AI & Online (and when roundTimeLimit is set)
  useEffect(() => {
    if (currentView !== 'playing' || isValidating || !roundTimeLimit) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          // Time's up! Automatically trigger Dur!
          handleDurRef.current();
          return 0;
        }

        // Tick sounds in last 10 seconds
        if (prev <= 11 && prev > 1) {
          if (prev <= 6) {
            soundManager.playUrgentTick();
          } else {
            soundManager.playCountdownTick();
          }
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentView, isValidating, roundTimeLimit]);

  // --- START MODES ---

  // 1. Start Solo
  const handleStartSolo = () => {
    soundManager.playLetterReveal();
    setGameMode('solo');
    setRoundTimeLimit(null);
    setTimeLeft(0);
    setRoundNumber(1);
    setP1TournamentScore(0);
    setP2TournamentScore(0);
    const nextLetter = NORMAL_LETTERS[Math.floor(Math.random() * NORMAL_LETTERS.length)];
    setTargetLetter(nextLetter);
    resetRoundInputs();
    setCurrentView('playing');
  };

  // 2. Start AI Battle with Chosen Difficulty & Time Limit (30, 45, 60, 120 sn)
  const handleStartAIBattle = (difficulty: BotDifficulty, timeLimit: number = 60) => {
    soundManager.playLetterReveal();
    const newBot = generateRandomBot(difficulty);
    setBotOpponent(newBot);
    setGameMode('ai');
    setRoundTimeLimit(timeLimit);
    setTimeLeft(timeLimit);
    setRoundNumber(1);
    setP1TournamentScore(0);
    setP2TournamentScore(0);
    const nextLetter = NORMAL_LETTERS[Math.floor(Math.random() * NORMAL_LETTERS.length)];
    setTargetLetter(nextLetter);
    prepareAIBot(nextLetter, newBot);
    resetRoundInputs();
    setCurrentView('playing');
  };

  // 3. Start Online Duel
  const handleOnlineRoomReady = (room: any, playerId: string) => {
    soundManager.playLetterReveal();
    setOnlineRoomCode(room.code);
    setOnlinePlayerId(playerId);
    setOnlineRoomState(room);
    setGameMode('online');
    const timeLimit = room.roundTimeLimit || 60;
    setRoundTimeLimit(timeLimit);
    setTimeLeft(timeLimit);
    setRoundNumber(room.roundNumber || 1);
    setP1TournamentScore(0);
    setP2TournamentScore(0);
    setTargetLetter(room.currentLetter);
    resetRoundInputs();
    setShowOnlineLobby(false);
    setCurrentView('playing');
  };

  // Reset round inputs
  const resetRoundInputs = () => {
    setAnswers({
      name: '',
      city: '',
      animal: '',
      plant: '',
      object: '',
      country: ''
    });
    setActiveCategoryIndex(0);
    setIsValidating(false);
    setCategoryResults([]);
    setP1RoundScore(0);
    setP2RoundScore(0);
  };

  // --- DUR! BUTTON HANDLER ---
  // When user clicks the prominent red "DUR!" button
  const handleDur = async () => {
    if (isValidating) return;
    soundManager.playDur();
    triggerStarSparkles();
    setIsValidating(true);

    if (gameMode === 'online') {
      // Send DUR to server
      try {
        await fetch(`/api/rooms/${onlineRoomCode}/dur`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ playerId: onlinePlayerId })
        });
      } catch (err) {
        console.error('Online dur error:', err);
      }
      setIsValidating(false);
      return;
    }

    // Local evaluation for Solo or AI Battle
    const targetLetterLower = targetLetter.toLocaleLowerCase('tr-TR');
    const validationMap = await validateRoundAnswers(targetLetter, answers);

    let roundP1Pts = 0;
    let roundP2Pts = 0;

    const catResults: CategoryResultItem[] = CATEGORIES.map(cat => {
      const userWord = (answers[cat.id] || '').trim();
      const botWord = gameMode === 'ai' ? (botPlannedAnswersRef.current[cat.id] || '').trim() : '';

      const uResult = validationMap[cat.id];
      const uValid = uResult?.isValid || false;
      const isUTypo = uResult?.status === 'typo' || (uResult?.isValid && uResult?.points === 5);
      const bValid = botWord.length > 0 && botWord.toLocaleLowerCase('tr-TR').startsWith(targetLetterLower);

      let p1Status: 'valid' | 'pisti' | 'typo' | 'wrong' | 'empty' = 'empty';
      let p2Status: 'valid' | 'pisti' | 'typo' | 'wrong' | 'empty' = 'empty';
      let p1Pts = 0;
      let p2Pts = 0;

      if (!userWord) {
        p1Status = 'empty';
      } else if (!uValid) {
        p1Status = 'wrong';
      } else if (isUTypo) {
        p1Status = 'typo';
        p1Pts = 5;
      } else {
        p1Status = 'valid';
        p1Pts = 10;
      }

      if (!botWord) {
        p2Status = 'empty';
      } else if (!bValid) {
        p2Status = 'wrong';
      } else {
        p2Status = 'valid';
        p2Pts = 10;
      }

      const uClean = (uResult?.corrected || userWord).toLocaleLowerCase('tr-TR');
      const bClean = botWord.toLocaleLowerCase('tr-TR');

      if (gameMode === 'solo') {
        // In solo mode, status & points are already finalized accurately above
      } else {
        // AI Opponent Scoring
        if (uValid && bValid) {
          if (uClean === bClean) {
            // Pişti! (Both gave same word -> Yellow check + 5 pts)
            p1Status = 'pisti';
            p2Status = 'pisti';
            p1Pts = 5;
            p2Pts = 5;
          } else {
            // Different valid words
            p2Status = 'valid';
            p2Pts = 10;
            if (isUTypo) {
              p1Status = 'typo';
              p1Pts = 5;
            } else {
              p1Status = 'valid';
              p1Pts = 10;
            }
          }
        } else if (uValid && !bValid) {
          if (isUTypo) {
            p1Status = 'typo';
            p1Pts = 5;
          } else {
            p1Status = 'valid';
            p1Pts = 10;
          }
        } else if (!uValid && bValid) {
          p2Status = 'valid';
          p2Pts = 10;
        }
      }

      roundP1Pts += p1Pts;
      roundP2Pts += p2Pts;

      return {
        categoryId: cat.id,
        categoryName: cat.name,
        icon: cat.icon,
        p1Word: userWord,
        p1Status,
        p1Points: p1Pts,
        p1Corrected: uResult?.corrected,
        p2Word: botWord,
        p2Status,
        p2Points: p2Pts,
        isPisti: p1Status === 'pisti'
      };
    });

    setP1RoundScore(roundP1Pts);
    setP2RoundScore(roundP2Pts);
    setP1TournamentScore(prev => prev + roundP1Pts);
    setP2TournamentScore(prev => prev + roundP2Pts);
    setCategoryResults(catResults);
    setIsValidating(false);
    setCurrentView('round_results');

    // Record to persistent profile
    profileManager.recordRound(roundP1Pts, roundP1Pts > roundP2Pts);
    setActiveProfile(profileManager.getActiveProfile());
  };

  // --- "YENİ HARF" (NEXT ROUND) HANDLER ---
  const handleNextRound = async () => {
    if (roundNumber >= MAX_ROUNDS) {
      // 10-round tournament is complete!
      setShowTournamentEnd(true);
      return;
    }

    soundManager.playLetterReveal();

    if (gameMode === 'online') {
      try {
        await fetch(`/api/rooms/${onlineRoomCode}/next-round`, { method: 'POST' });
      } catch (err) {
        console.error('Next round error:', err);
      }
      return;
    }

    // Local next round
    const nextRoundNum = roundNumber + 1;
    setRoundNumber(nextRoundNum);

    const candidates = NORMAL_LETTERS.filter(l => l !== targetLetter);
    const nextLetter = candidates[Math.floor(Math.random() * candidates.length)];
    setTargetLetter(nextLetter);

    if (gameMode === 'ai') {
      prepareAIBot(nextLetter, botOpponent);
    }

    if (roundTimeLimit) {
      setTimeLeft(roundTimeLimit);
    }

    resetRoundInputs();
    setCurrentView('playing');
  };

  // --- REMATCH & EXIT HANDLERS ---
  const handleRematch = async () => {
    soundManager.playLetterReveal();
    setShowTournamentEnd(false);
    setRoundNumber(1);
    setP1TournamentScore(0);
    setP2TournamentScore(0);

    if (roundTimeLimit) {
      setTimeLeft(roundTimeLimit);
    }

    if (gameMode === 'online') {
      try {
        await fetch(`/api/rooms/${onlineRoomCode}/rematch`, { method: 'POST' });
      } catch (err) {
        console.error('Online rematch error:', err);
      }
      return;
    }

    const nextLetter = NORMAL_LETTERS[Math.floor(Math.random() * NORMAL_LETTERS.length)];
    setTargetLetter(nextLetter);
    if (gameMode === 'ai') {
      const nextBot = generateRandomBot(botOpponent.difficulty);
      setBotOpponent(nextBot);
      prepareAIBot(nextLetter, nextBot);
    }

    resetRoundInputs();
    setCurrentView('playing');
  };

  const handleExitGame = () => {
    soundManager.playClick();
    if (gameMode === 'online' && onlineRoomCode) {
      fetch(`/api/rooms/${onlineRoomCode}/leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: onlinePlayerId })
      }).catch(() => {});
    }

    resetRoundInputs();
    setShowTournamentEnd(false);
    setRoundNumber(1);
    setP1TournamentScore(0);
    setP2TournamentScore(0);
    setCurrentView('welcome');
  };

  // Input change handler
  const handleAnswerChange = (text: string) => {
    soundManager.playType();
    const currentCat = CATEGORIES[activeCategoryIndex];
    const updated = { ...answers, [currentCat.id]: text };
    setAnswers(updated);

    // If online, sync progress
    if (gameMode === 'online' && onlineRoomCode) {
      fetch(`/api/rooms/${onlineRoomCode}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: onlinePlayerId, answers: updated })
      }).catch(() => {});
    }
  };

  // Filled words count
  const filledCount = Object.values(answers).filter(a => typeof a === 'string' && a.trim().length > 0).length;

  // Online opponent info
  const getOnlineOpponent = () => {
    if (!onlineRoomState) return { name: 'Rakip', avatar: '🎮', filledCount: 0 };
    const pids = Object.keys(onlineRoomState.players || {});
    const oppId = pids.find(id => id !== onlinePlayerId);
    if (oppId && onlineRoomState.players[oppId]) {
      return onlineRoomState.players[oppId];
    }
    return { name: 'Rakip', avatar: '🎮', filledCount: 0 };
  };

  const currentCategory = CATEGORIES[activeCategoryIndex];
  const CurrentIcon = currentCategory.icon;

  return (
    <div className="h-[100dvh] w-full bg-[#F8FAFC] text-slate-800 flex flex-col items-center justify-between p-2 sm:p-3 overflow-hidden select-none font-sans">
      
      {/* 1. INITIAL PROFILE CREATION MODAL */}
      <InitialProfileModal
        isOpen={showInitialModal}
        onProfileCreated={profile => {
          setActiveProfile(profile);
          setShowInitialModal(false);
        }}
      />

      {/* 2. SETTINGS & PROFILE MANAGEMENT MODAL */}
      {activeProfile && (
        <SettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          activeProfile={activeProfile}
          onProfileUpdated={updated => setActiveProfile(updated)}
          soundEnabled={soundEnabled}
          onToggleSound={() => setSoundEnabled(!soundEnabled)}
          onResetStats={() => {
            if (window.confirm('Tüm istatistikleri sıfırlamak istediğinize emin misiniz?')) {
              localStorage.removeItem('harf_avcisi_profiles_v2');
              localStorage.removeItem('harf_avcisi_active_profile_id_v2');
              setShowSettingsModal(false);
              setShowInitialModal(true);
            }
          }}
        />
      )}

      {/* 3. ONLINE LOBBY MODAL */}
      {activeProfile && (
        <OnlineLobbyModal
          isOpen={showOnlineLobby}
          onClose={() => setShowOnlineLobby(false)}
          activeProfile={activeProfile}
          onRoomReady={handleOnlineRoomReady}
        />
      )}

      {/* 4. 10-ROUND TOURNAMENT END MODAL ("Oyundan Çık" & "Rövanş Teklif Et") */}
      <TournamentEndModal
        isOpen={showTournamentEnd}
        p1Name={activeProfile?.name || 'Oyuncu'}
        p1Avatar={activeProfile?.avatar || '🦊'}
        p1Score={p1TournamentScore}
        p2Name={gameMode === 'ai' ? botOpponent.name : gameMode === 'online' ? getOnlineOpponent().name : undefined}
        p2Avatar={gameMode === 'ai' ? botOpponent.avatar : gameMode === 'online' ? getOnlineOpponent().avatar : undefined}
        p2Score={p2TournamentScore}
        hasOpponent={gameMode !== 'solo'}
        onExitGame={handleExitGame}
        onRematch={handleRematch}
      />

      {/* ========================================================================= */}
      {/* SCREEN ROUTING */}
      {/* ========================================================================= */}

      {/* VIEW 1: WELCOME SCREEN (Giriş / Açılış Sayfası) */}
      {currentView === 'welcome' && activeProfile && (
        <WelcomeScreen
          activeProfile={activeProfile}
          onOpenSettings={() => setShowSettingsModal(true)}
          onStartSolo={handleStartSolo}
          onStartAIBattle={handleStartAIBattle}
          onOpenOnlineDuel={() => setShowOnlineLobby(true)}
        />
      )}

      {/* VIEW 2: ROUND RESULT SCREEN (6 Kompakt Satır, Yeşil/Sarı/Kırmızı, 10s Sayaç) */}
      {currentView === 'round_results' && activeProfile && (
        <div className="w-full h-full max-w-md mx-auto flex flex-col justify-between py-1">
          <RoundResultScreen
            targetLetter={targetLetter}
            roundNumber={roundNumber}
            maxRounds={MAX_ROUNDS}
            p1Name={activeProfile.name}
            p1Avatar={activeProfile.avatar}
            p1RoundScore={p1RoundScore}
            p1TotalScore={p1TournamentScore}
            p2Name={gameMode === 'ai' ? botOpponent.name : gameMode === 'online' ? getOnlineOpponent().name : undefined}
            p2Avatar={gameMode === 'ai' ? botOpponent.avatar : gameMode === 'online' ? getOnlineOpponent().avatar : undefined}
            p2RoundScore={p2RoundScore}
            p2TotalScore={p2TournamentScore}
            hasOpponent={gameMode !== 'solo'}
            categoryResults={categoryResults}
            onNextRound={handleNextRound}
            onExitToMenu={handleExitGame}
          />
        </div>
      )}

      {/* VIEW 3: ACTIVE PLAY SCREEN (Single-View, Fits Screen, Big Red DUR! Button) */}
      {currentView === 'playing' && activeProfile && (
        <div className="w-full h-full max-w-md mx-auto flex flex-col justify-between gap-1.5 sm:gap-2">
          
          {/* HEADER: Back to Home & Round Indicator */}
          <header className="flex items-center justify-between shrink-0 bg-white/95 px-3 py-1.5 rounded-2xl border border-slate-200/80 shadow-2xs">
            
            {/* Back to Home Button */}
            <button
              id="header-menu-btn"
              onClick={handleExitGame}
              className="flex items-center gap-1.5 text-slate-700 hover:text-slate-950 text-xs font-black px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 transition-all cursor-pointer shadow-2xs active:scale-95"
              title="Ana Menüye Dön"
            >
              <Home className="w-4 h-4 text-slate-700" />
              <span>Menü</span>
            </button>

            {/* Round / Mode indicator */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-slate-700 bg-slate-100 border border-slate-200 px-3 py-1 rounded-xl">
                {gameMode === 'solo' ? 'Solo Pratik' : `Tur ${roundNumber} / ${MAX_ROUNDS}`}
              </span>
            </div>

            {/* Sound Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              title={soundEnabled ? 'Sesi Kapat' : 'Sesi Aç'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>

          </header>

          {/* ARENA: 1. Oyuncu vs 2. Oyuncu (Live Progress) */}
          <section className="bg-white/95 border border-slate-200/80 rounded-2xl px-3 py-2 shrink-0 shadow-2xs">
            <div className="flex items-center justify-between">
              
              {/* Player 1 (You) */}
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-xl ${activeProfile.color} text-white flex items-center justify-center text-base shadow-xs shrink-0`}>
                  {activeProfile.avatar}
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900 leading-tight">
                    {activeProfile.name} (Sen)
                  </div>
                  {/* Filled Dots */}
                  <div className="flex items-center gap-1 mt-0.5">
                    {CATEGORIES.map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full transition-all ${
                          i < filledCount ? 'bg-emerald-500 ring-1 ring-emerald-300 scale-110' : 'bg-slate-200'
                        }`}
                      />
                    ))}
                    <span className="text-[10px] font-bold text-slate-500 ml-1">
                      {filledCount}/6
                    </span>
                  </div>
                </div>
              </div>

              {/* Opponent Progress (AI / Online) */}
              {gameMode !== 'solo' ? (
                <div className="flex items-center justify-end gap-2 text-right">
                  <div>
                    <div className="text-xs font-black text-slate-900 leading-tight">
                      {gameMode === 'ai' ? botOpponent.name : getOnlineOpponent().name}
                    </div>
                    {/* Opponent Dots */}
                    <div className="flex items-center justify-end gap-1 mt-0.5">
                      <span className="text-[10px] font-bold text-slate-500 mr-1">
                        {gameMode === 'ai' ? botProgressCount : getOnlineOpponent().filledCount || 0}/6
                      </span>
                      {CATEGORIES.map((_, i) => {
                        const count = gameMode === 'ai' ? botProgressCount : (getOnlineOpponent().filledCount || 0);
                        return (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full transition-all ${
                              i < count ? 'bg-purple-500 ring-1 ring-purple-300 scale-110' : 'bg-slate-200'
                            }`}
                          />
                        );
                      })}
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center text-base shadow-xs shrink-0">
                    {gameMode === 'ai' ? botOpponent.avatar : getOnlineOpponent().avatar || '🎮'}
                  </div>
                </div>
              ) : (
                <div className="text-right">
                  <span className="text-[10px] font-black text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    Süre Sınırı Yok
                  </span>
                </div>
              )}

            </div>
          </section>

          {/* TIMER BAR (30s, 45s, 60s, 120s limit for AI battles and Online duels) */}
          {roundTimeLimit && (
            <div className="shrink-0">
              <TimerBar timeRemaining={timeLeft} totalTime={roundTimeLimit} />
            </div>
          )}

          {/* CATEGORY STEPPER (6 Kategorinin Kompakt Adım İkonları) */}
          <nav className="grid grid-cols-6 gap-1 shrink-0">
            {CATEGORIES.map((cat, idx) => {
              const Icon = cat.icon;
              const isCurrent = idx === activeCategoryIndex;
              const hasWord = (answers[cat.id] || '').trim().length > 0;

              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    soundManager.playClick();
                    setActiveCategoryIndex(idx);
                  }}
                  className={`py-1.5 px-1 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer border ${
                    isCurrent
                      ? 'bg-amber-500 text-white border-amber-600 shadow-xs scale-102'
                      : hasWord
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                  title={cat.name}
                >
                  <Icon className="w-3.5 h-3.5 mb-0.5" />
                  <span className="text-[10px] font-black truncate max-w-full leading-none">
                    {cat.name}
                  </span>
                  {hasWord && !isCurrent && (
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-0.5" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* HEDEF HARF: KATEGORİ ADIMLARI İLE GİRİŞ KARTININ TAM ORTASINDA, %100 DAHA BÜYÜK VE IŞILTILI ANİMASYONLU */}
          <div className="flex flex-col items-center justify-center shrink-0 my-auto py-1 sm:py-2">
            <span className="text-[11px] sm:text-xs font-black uppercase tracking-widest text-amber-800 bg-amber-100/90 border border-amber-300 px-3 py-0.5 rounded-full mb-1.5 shadow-2xs flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-600 animate-spin" style={{ animationDuration: '6s' }} />
              <span>Hedef Harf</span>
            </span>
            <SparkleAura active={true}>
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-[4px] sm:border-[5px] border-amber-500 bg-white flex items-center justify-center shadow-md ring-4 ring-amber-100 animate-float-cute animate-halo-shimmer">
                <span className="text-5xl sm:text-6xl font-black text-amber-950 font-display leading-none select-none">
                  {targetLetter}
                </span>
              </div>
            </SparkleAura>
          </div>

          {/* ACTIVE CATEGORY INPUT CARD (DİKDÖRTGEN KART) */}
          <main className="bg-white border-2 border-amber-300 rounded-2xl p-3 sm:p-4 shadow-sm flex flex-col justify-between my-auto">
            
            {/* Category title & hint */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center shadow-2xs">
                  <CurrentIcon className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900 leading-tight">
                    {currentCategory.name}
                  </h2>
                  <span className="text-[10px] text-slate-500 font-semibold">
                    {currentCategory.subText}
                  </span>
                </div>
              </div>

              <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                {activeCategoryIndex + 1} / 6
              </span>
            </div>

            {/* Input field */}
            <div className="relative mb-3">
              <input
                ref={currentInputRef}
                type="text"
                value={answers[currentCategory.id] || ''}
                onChange={e => handleAnswerChange(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    if (activeCategoryIndex < CATEGORIES.length - 1) {
                      soundManager.playClick();
                      setActiveCategoryIndex(activeCategoryIndex + 1);
                    } else {
                      // Son kelime yazılıp Enter'a basıldığında turu bitir
                      handleDur();
                    }
                  }
                }}
                placeholder={`'${targetLetter}' ile başlayan ${currentCategory.placeholder}`}
                className="w-full pl-3.5 pr-3 py-3 rounded-xl bg-slate-50 border-2 border-slate-300 focus:bg-white focus:border-amber-500 focus:outline-none text-base font-bold text-slate-900 transition-all placeholder:text-slate-400 placeholder:font-normal"
              />
            </div>

            {/* Step navigation buttons */}
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  soundManager.playClick();
                  setActiveCategoryIndex(Math.max(0, activeCategoryIndex - 1));
                }}
                disabled={activeCategoryIndex === 0}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Önceki</span>
              </button>

              <div className="text-[11px] font-bold text-slate-400">
                {activeCategoryIndex + 1} / {CATEGORIES.length}
              </div>

              {activeCategoryIndex === CATEGORIES.length - 1 ? (
                <button
                  id="finish-step-button"
                  onClick={() => {
                    handleDur();
                  }}
                  disabled={isValidating}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-95 text-white font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-sm shadow-emerald-600/30 transition-all border border-emerald-500 ring-2 ring-emerald-400/30"
                  title="Turu Bitir ve Puanları Hesapla"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-100" />
                  <span>Bitir</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    soundManager.playClick();
                    setActiveCategoryIndex(Math.min(CATEGORIES.length - 1, activeCategoryIndex + 1));
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>Sonraki</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>

          </main>

          {/* THE PROMINENT RED "DUR!" BUTTON (Hemen 'Dur' de yazısı kalktı, kırmızı parlak buton geldi) */}
          <footer className="shrink-0 pt-0.5">
            <button
              id="dur-button"
              onClick={handleDur}
              disabled={isValidating}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-700 hover:to-red-800 text-white font-black text-lg sm:text-xl shadow-lg shadow-rose-500/40 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer border-2 border-red-400/80 ring-4 ring-rose-300/30 animate-pulse"
              title="Turu Bitir ve Puanları Hesapla"
            >
              {isValidating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Hesaplanıyor...</span>
                </>
              ) : (
                <>
                  <Flame className="w-6 h-6 text-amber-200 fill-current" />
                  <span className="font-display tracking-wider">DUR!</span>
                </>
              )}
            </button>
          </footer>

        </div>
      )}

    </div>
  );
}
