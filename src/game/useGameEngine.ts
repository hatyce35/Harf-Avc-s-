import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  GameMode, Difficulty, SpecialEvent, Category, 
  AnswerItem, CustomGameConfig, PlayerProfile, DailyChallengeConfig 
} from '../types';
import { selectRandomCategories, CATEGORY_MAP } from '../data/categories';
import { getRandomLetterByDifficulty } from '../utils/turkish';
import { AI_PROFILES, AI_REACTIONS, generateAIAnswers } from '../ai/aiPlayer';
import { evaluateRound, EvaluatedRound } from '../scoring/scoringEngine';
import { soundManager } from '../services/sound';
import { 
  getStoredProfile, saveProfile, addLeaderboardEntry, 
  getDailyChallengeConfig, saveDailyChallengeProgress, getTitleForLevel 
} from '../services/storage';
import { checkRoundAchievements } from '../missions/achievements';

export function useGameEngine() {
  const [profile, setProfile] = useState<PlayerProfile>(getStoredProfile());
  const [gameMode, setGameMode] = useState<GameMode>('quick');
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [gameState, setGameState] = useState<'idle' | 'countdown' | 'playing' | 'friend_handoff' | 'evaluating' | 'review'>('idle');

  const [roundNumber, setRoundNumber] = useState<number>(1);
  const [targetLetter, setTargetLetter] = useState<string>('K');
  const [categories, setCategories] = useState<Category[]>([]);
  const [goldenCategoryId, setGoldenCategoryId] = useState<string>('');
  const [specialEvent, setSpecialEvent] = useState<SpecialEvent>('none');

  const [totalRoundTime, setTotalRoundTime] = useState<number>(60);
  const [timeRemaining, setTimeRemaining] = useState<number>(60);

  const [player1Answers, setPlayer1Answers] = useState<Record<string, AnswerItem>>({});
  const [player2Answers, setPlayer2Answers] = useState<Record<string, AnswerItem>>({});
  const [currentFriendTurn, setCurrentFriendTurn] = useState<1 | 2>(1);

  const [survivalStreak, setSurvivalStreak] = useState<number>(0);
  const [evaluatedRound, setEvaluatedRound] = useState<EvaluatedRound | null>(null);

  // AI states
  const [aiReaction, setAiReaction] = useState<string>('');
  const aiAnswersRef = useRef<Record<string, AnswerItem>>({});

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const previousCategoryIdsRef = useRef<string[]>([]);

  // Sound and settings
  const updateProfileAndSave = useCallback((newProfile: PlayerProfile) => {
    setProfile(newProfile);
    saveProfile(newProfile);
  }, []);

  // Timer Tick Handling
  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleTimeUp();
            return 0;
          }
          if (prev <= 10) {
            soundManager.playUrgentTick();
          } else if (prev % 5 === 0) {
            soundManager.playCountdownTick();
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, []);

  /**
   * Starts a new match with full configuration
   */
  const startNewGame = useCallback((
    mode: GameMode,
    customConfig?: CustomGameConfig
  ) => {
    soundManager.playClick();
    setGameMode(mode);

    let roundDifficulty: Difficulty = 'normal';
    let catCount = 6;
    let roundTime = 60;
    let allowSpecialEvents = true;

    if (mode === 'quick') {
      roundDifficulty = 'normal';
      catCount = 6;
      roundTime = 60;
    } else if (mode === 'ai_battle') {
      roundDifficulty = customConfig?.difficulty || 'normal';
      catCount = 6;
      roundTime = 60;
    } else if (mode === 'friend') {
      roundDifficulty = 'normal';
      catCount = 6;
      roundTime = 60;
      setCurrentFriendTurn(1);
    } else if (mode === 'daily') {
      const daily = getDailyChallengeConfig();
      roundDifficulty = 'hard';
      catCount = daily.categoryIds.length;
      roundTime = 60;
      allowSpecialEvents = false;
    } else if (mode === 'survival') {
      roundDifficulty = 'easy';
      catCount = 4;
      roundTime = 45;
      setSurvivalStreak(0);
    } else if (mode === 'custom' && customConfig) {
      roundDifficulty = customConfig.difficulty;
      catCount = customConfig.categoryCount;
      roundTime = customConfig.timeLimit;
      allowSpecialEvents = customConfig.specialEventsEnabled;
    }

    setDifficulty(roundDifficulty);
    setTotalRoundTime(roundTime);
    setTimeRemaining(roundTime);
    setRoundNumber(1);

    // Pick target letter
    let newLetter: string;
    if (mode === 'daily') {
      newLetter = getDailyChallengeConfig().letter;
    } else {
      newLetter = getRandomLetterByDifficulty(roundDifficulty);
    }
    setTargetLetter(newLetter);

    // Pick categories
    let selectedCats: Category[];
    if (mode === 'daily') {
      const daily = getDailyChallengeConfig();
      selectedCats = daily.categoryIds.map(id => CATEGORY_MAP.get(id)!).filter(Boolean);
    } else {
      selectedCats = selectRandomCategories(catCount, roundDifficulty, previousCategoryIdsRef.current);
      previousCategoryIdsRef.current = selectedCats.map(c => c.id);
    }
    setCategories(selectedCats);

    // Pick Golden Category (random one from selected)
    const randomGoldCat = selectedCats[Math.floor(Math.random() * selectedCats.length)]?.id || selectedCats[0]?.id;
    setGoldenCategoryId(randomGoldCat);

    // Special Letter Events
    if (allowSpecialEvents && Math.random() < 0.35) {
      const events: SpecialEvent[] = ['double_letter', 'chaos_letter', 'last_chance', 'golden_letter'];
      const pickedEvent = events[Math.floor(Math.random() * events.length)];
      setSpecialEvent(pickedEvent);
      if (pickedEvent === 'last_chance') {
        setTotalRoundTime(roundTime + 10);
        setTimeRemaining(roundTime + 10);
      }
      soundManager.playSpecialEvent();
    } else {
      setSpecialEvent('none');
    }

    // Initialize answer containers
    const initAns: Record<string, AnswerItem> = {};
    selectedCats.forEach(c => {
      initAns[c.id] = {
        categoryId: c.id,
        value: '',
        isLocked: false,
        timestamp: 0
      };
    });
    setPlayer1Answers(initAns);
    setPlayer2Answers(initAns);

    // Prepare AI answers if in AI Battle or Quick mode
    if (mode === 'ai_battle' || mode === 'quick' || mode === 'survival') {
      const generated = generateAIAnswers(newLetter, selectedCats.map(c => c.id), roundDifficulty);
      aiAnswersRef.current = generated.answers;
      setAiReaction(AI_REACTIONS.gameStart[Math.floor(Math.random() * AI_REACTIONS.gameStart.length)]);
    }

    setEvaluatedRound(null);
    setGameState('playing');
  }, []);

  /**
   * Advances to next round in Survival Mode or continues game
   */
  const nextSurvivalRound = useCallback(() => {
    soundManager.playClick();
    const newStreak = survivalStreak + 1;
    setSurvivalStreak(newStreak);

    // Scale difficulty
    const nextDiff: Difficulty = newStreak < 2 ? 'easy' : newStreak < 4 ? 'normal' : newStreak < 7 ? 'hard' : 'expert';
    const nextCatsCount = Math.min(8, 4 + Math.floor(newStreak / 2));
    const nextTime = Math.max(30, 50 - (newStreak * 3));

    setDifficulty(nextDiff);
    setTotalRoundTime(nextTime);
    setTimeRemaining(nextTime);
    setRoundNumber(prev => prev + 1);

    const newLetter = getRandomLetterByDifficulty(nextDiff, targetLetter);
    setTargetLetter(newLetter);

    const selectedCats = selectRandomCategories(nextCatsCount, nextDiff, previousCategoryIdsRef.current);
    previousCategoryIdsRef.current = selectedCats.map(c => c.id);
    setCategories(selectedCats);

    const randomGoldCat = selectedCats[Math.floor(Math.random() * selectedCats.length)]?.id;
    setGoldenCategoryId(randomGoldCat);

    const initAns: Record<string, AnswerItem> = {};
    selectedCats.forEach(c => {
      initAns[c.id] = { categoryId: c.id, value: '', isLocked: false, timestamp: 0 };
    });
    setPlayer1Answers(initAns);

    const generated = generateAIAnswers(newLetter, selectedCats.map(c => c.id), nextDiff);
    aiAnswersRef.current = generated.answers;

    setEvaluatedRound(null);
    setGameState('playing');
  }, [survivalStreak, targetLetter]);

  /**
   * Answer text update for current active player
   */
  const updateAnswer = useCallback((categoryId: string, value: string) => {
    if (gameState !== 'playing') return;

    if (gameMode === 'friend' && currentFriendTurn === 2) {
      setPlayer2Answers(prev => ({
        ...prev,
        [categoryId]: {
          ...(prev[categoryId] || { categoryId, isLocked: false }),
          value,
          timestamp: Date.now()
        }
      }));
    } else {
      setPlayer1Answers(prev => ({
        ...prev,
        [categoryId]: {
          ...(prev[categoryId] || { categoryId, isLocked: false }),
          value,
          timestamp: Date.now()
        }
      }));
    }
  }, [gameState, gameMode, currentFriendTurn]);

  /**
   * Toggle Lock for Risk & Reward (+5 / -5)
   */
  const toggleLock = useCallback((categoryId: string) => {
    if (gameState !== 'playing') return;

    if (gameMode === 'friend' && currentFriendTurn === 2) {
      setPlayer2Answers(prev => {
        const item = prev[categoryId];
        if (!item || !item.value.trim()) return prev;
        return {
          ...prev,
          [categoryId]: { ...item, isLocked: !item.isLocked }
        };
      });
    } else {
      setPlayer1Answers(prev => {
        const item = prev[categoryId];
        if (!item || !item.value.trim()) return prev;
        return {
          ...prev,
          [categoryId]: { ...item, isLocked: !item.isLocked }
        };
      });
    }
  }, [gameState, gameMode, currentFriendTurn]);

  /**
   * Finalize round and evaluate
   */
  const finalizeRound = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    soundManager.playClick();

    // In Friend mode: If turn 1 just finished, hand off to Player 2
    if (gameMode === 'friend' && currentFriendTurn === 1) {
      setCurrentFriendTurn(2);
      setTimeRemaining(totalRoundTime);
      setGameState('friend_handoff');
      return;
    }

    // Determine opponent answers
    const opponentAns = gameMode === 'friend' ? player2Answers : aiAnswersRef.current;

    // Run evaluation engine
    const evaluation = evaluateRound({
      targetLetter,
      categoryIds: categories.map(c => c.id),
      goldenCategoryId,
      specialEvent,
      playerAnswers: player1Answers,
      opponentAnswers: opponentAns,
      playerFinishRemainingTime: timeRemaining,
      totalRoundTime,
      difficulty
    });

    setEvaluatedRound(evaluation);

    // Update Player Profile stats, XP, level and achievements
    const isWin = evaluation.playerScore > evaluation.opponentScore;
    const isTie = evaluation.playerScore === evaluation.opponentScore;

    const currentP = getStoredProfile();
    const newXP = currentP.xp + evaluation.xpEarned;
    const newCoins = currentP.coins + evaluation.coinsEarned;

    // Calculate level progression (level * 100 XP per level)
    let calcLevel = currentP.level;
    let xpCounter = newXP;
    while (xpCounter >= calcLevel * 100) {
      xpCounter -= calcLevel * 100;
      calcLevel++;
    }

    const updatedProfile: PlayerProfile = {
      ...currentP,
      level: calcLevel,
      title: getTitleForLevel(calcLevel),
      xp: newXP,
      coins: newCoins,
      stats: {
        ...currentP.stats,
        gamesPlayed: currentP.stats.gamesPlayed + 1,
        wins: isWin ? currentP.stats.wins + 1 : currentP.stats.wins,
        losses: (!isWin && !isTie) ? currentP.stats.losses + 1 : currentP.stats.losses,
        highestScore: Math.max(currentP.stats.highestScore, evaluation.playerScore),
        maxCombo: Math.max(currentP.stats.maxCombo, evaluation.playerCombo),
        totalValidAnswers: currentP.stats.totalValidAnswers + evaluation.playerValidCount,
        totalUniqueAnswers: currentP.stats.totalUniqueAnswers + evaluation.playerUniqueCount,
        survivalBestStreak: gameMode === 'survival' 
          ? Math.max(currentP.stats.survivalBestStreak, survivalStreak)
          : currentP.stats.survivalBestStreak
      }
    };

    updateProfileAndSave(updatedProfile);

    // Check Achievements
    checkRoundAchievements({
      playerScore: evaluation.playerScore,
      opponentScore: evaluation.opponentScore,
      combo: evaluation.playerCombo,
      validCount: evaluation.playerValidCount,
      totalCategories: categories.length,
      uniqueCount: evaluation.playerUniqueCount,
      isSpeedy: timeRemaining >= totalRoundTime * 0.5,
      profile: updatedProfile
    });

    // Save to local leaderboard
    addLeaderboardEntry({
      playerName: currentP.name,
      avatar: currentP.avatar,
      score: evaluation.playerScore,
      mode: gameMode,
      difficulty,
      date: 'Bugün',
      letter: targetLetter
    });

    // Save daily progress if in daily mode
    if (gameMode === 'daily') {
      saveDailyChallengeProgress(evaluation.playerScore);
    }

    setGameState('review');
  }, [
    gameMode, currentFriendTurn, targetLetter, categories, goldenCategoryId,
    specialEvent, player1Answers, player2Answers, timeRemaining, totalRoundTime,
    difficulty, survivalStreak, updateProfileAndSave
  ]);

  /**
   * Called when timer hits zero
   */
  const handleTimeUp = useCallback(() => {
    finalizeRound();
  }, [finalizeRound]);

  /**
   * Start Player 2 turn in Friend mode
   */
  const startPlayer2Turn = useCallback(() => {
    soundManager.playClick();
    setTimeRemaining(totalRoundTime);
    setGameState('playing');
  }, [totalRoundTime]);

  /**
   * Return to Main Menu
   */
  const returnToMainMenu = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    soundManager.playClick();
    setGameState('idle');
  }, []);

  return {
    profile,
    updateProfileAndSave,
    gameMode,
    difficulty,
    gameState,
    roundNumber,
    targetLetter,
    categories,
    goldenCategoryId,
    specialEvent,
    timeRemaining,
    totalRoundTime,
    player1Answers,
    player2Answers,
    currentFriendTurn,
    survivalStreak,
    evaluatedRound,
    aiProfile: AI_PROFILES[difficulty],
    aiReaction,
    startNewGame,
    nextSurvivalRound,
    updateAnswer,
    toggleLock,
    finishRound: finalizeRound,
    startPlayer2Turn,
    returnToMainMenu
  };
}
