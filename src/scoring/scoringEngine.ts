import { AnswerItem, SpecialEvent, Difficulty } from '../types';
import { validateAnswerLocally } from '../data/wordDatabase';
import { toTurkishLower, sanitizeAnswer } from '../utils/turkish';

export interface EvaluatedRound {
  playerScore: number;
  opponentScore: number;
  playerAnswers: Record<string, AnswerItem>;
  opponentAnswers: Record<string, AnswerItem>;
  playerCombo: number;
  playerValidCount: number;
  playerUniqueCount: number;
  playerFastCount: number;
  xpEarned: number;
  coinsEarned: number;
}

/**
 * Calculates Combo Multiplier based on consecutive valid answers:
 * 1 valid: x1
 * 3 valid: x2
 * 5 valid: x3
 * 8 valid: x4
 * 10+ valid: x5
 */
export function getComboMultiplier(validStreak: number): number {
  if (validStreak >= 10) return 5;
  if (validStreak >= 8) return 4;
  if (validStreak >= 5) return 3;
  if (validStreak >= 3) return 2;
  return 1;
}

/**
 * Evaluates both players' answers for a given round
 */
export function evaluateRound(params: {
  targetLetter: string;
  categoryIds: string[];
  goldenCategoryId: string;
  specialEvent: SpecialEvent;
  playerAnswers: Record<string, AnswerItem>;
  opponentAnswers?: Record<string, AnswerItem>;
  playerFinishRemainingTime: number; // seconds left
  totalRoundTime: number;
  difficulty: Difficulty;
}): EvaluatedRound {
  const {
    targetLetter,
    categoryIds,
    goldenCategoryId,
    specialEvent,
    playerAnswers,
    opponentAnswers = {},
    playerFinishRemainingTime,
    totalRoundTime,
  } = params;

  let playerTotal = 0;
  let opponentTotal = 0;

  let playerValidStreak = 0;
  let maxPlayerCombo = 1;
  let playerValidCount = 0;
  let playerUniqueCount = 0;
  let playerFastCount = 0;

  const evaluatedPlayerAnswers: Record<string, AnswerItem> = {};
  const evaluatedOpponentAnswers: Record<string, AnswerItem> = {};

  // Calculate speed ratio (0 to 1)
  const speedRatio = Math.max(0, Math.min(1, playerFinishRemainingTime / totalRoundTime));
  // Speed bonus up to 10 points if finished quickly (>30% time remaining)
  const generalSpeedBonus = speedRatio > 0.6 ? 10 : speedRatio > 0.3 ? 6 : speedRatio > 0.1 ? 3 : 0;

  categoryIds.forEach(catId => {
    const pAns = playerAnswers[catId] || { categoryId: catId, value: '', isLocked: false, timestamp: 0 };
    const oAns = opponentAnswers[catId] || { categoryId: catId, value: '', isLocked: false, timestamp: 0 };

    const pClean = sanitizeAnswer(pAns.value || '');
    const oClean = sanitizeAnswer(oAns.value || '');

    // Validate locally
    const pValidation = validateAnswerLocally(catId, pClean, targetLetter);
    const oValidation = validateAnswerLocally(catId, oClean, targetLetter);

    const isPValid = pValidation.isValid;
    const isOValid = oValidation.isValid;

    // Uniqueness test:
    // If both gave the same valid answer -> not unique (10 pts each)
    // If player gave valid answer and opponent didn't or gave DIFFERENT word -> unique (+10 bonus)
    const pLower = toTurkishLower(pClean);
    const oLower = toTurkishLower(oClean);

    let isPUnique = false;
    let isOUnique = false;

    if (isPValid) {
      if (!isOValid || pLower !== oLower) {
        isPUnique = true;
      }
    }

    if (isOValid) {
      if (!isPValid || pLower !== oLower) {
        isOUnique = true;
      }
    }

    // Player Combo tracking
    if (isPValid) {
      playerValidStreak++;
      playerValidCount++;
      const currentMultiplier = getComboMultiplier(playerValidStreak);
      if (currentMultiplier > maxPlayerCombo) {
        maxPlayerCombo = currentMultiplier;
      }
    } else if (pClean.length > 0) {
      // Invalid answer resets combo
      playerValidStreak = 0;
    }

    // Calculate player points for this category
    let pPoints = 0;
    let pSpeedBonus = 0;
    let pUniqueBonus = 0;
    let pLockBonus = 0;

    if (isPValid) {
      let base = 10;
      if (specialEvent === 'double_letter') base *= 2;
      if (specialEvent === 'golden_letter') base += 5;

      pUniqueBonus = isPUnique ? 10 : 0;
      pSpeedBonus = generalSpeedBonus;
      if (pSpeedBonus > 0) playerFastCount++;
      if (isPUnique) playerUniqueCount++;

      // Risk & Reward Lock
      if (pAns.isLocked) {
        pLockBonus = 5;
      }

      let subtotal = base + pUniqueBonus + pSpeedBonus + pLockBonus;

      // Golden category multiplier
      const goldenMultiplier = catId === goldenCategoryId ? 2 : 1;
      subtotal *= goldenMultiplier;

      // Apply combo multiplier
      const comboMult = getComboMultiplier(playerValidStreak);
      subtotal *= comboMult;

      pPoints = subtotal;
    } else if (pClean.length > 0) {
      // Invalid answer penalty
      pPoints = -5;
      if (pAns.isLocked) {
        pLockBonus = -5; // Penalty for locking incorrect answer
        pPoints += pLockBonus;
      }
    } else {
      pPoints = 0;
    }

    // Opponent scoring
    let oPoints = 0;
    if (isOValid) {
      let base = 10;
      const oUniqueBonus = isOUnique ? 10 : 0;
      const goldenMultiplier = catId === goldenCategoryId ? 2 : 1;
      oPoints = (base + oUniqueBonus) * goldenMultiplier;
    } else if (oClean.length > 0) {
      oPoints = -5;
    }

    playerTotal += pPoints;
    opponentTotal += oPoints;

    evaluatedPlayerAnswers[catId] = {
      ...pAns,
      isValid: isPValid,
      isUnique: isPUnique,
      isFast: pSpeedBonus > 0,
      basePoints: isPValid ? 10 : 0,
      uniqueBonus: pUniqueBonus,
      speedBonus: pSpeedBonus,
      lockBonus: pLockBonus,
      goldenMultiplier: catId === goldenCategoryId ? 2 : 1,
      totalPoints: pPoints,
      invalidReason: pValidation.reason
    };

    evaluatedOpponentAnswers[catId] = {
      ...oAns,
      isValid: isOValid,
      isUnique: isOUnique,
      isFast: false,
      totalPoints: oPoints,
      invalidReason: oValidation.reason
    };
  });

  // Calculate XP & Coins earned
  const baseXP = Math.max(20, Math.floor(playerTotal / 3));
  const winBonusXP = playerTotal > opponentTotal ? 50 : 10;
  const comboXP = maxPlayerCombo * 15;
  const xpEarned = baseXP + winBonusXP + comboXP;

  const coinsEarned = Math.max(5, Math.floor(playerTotal / 10));

  return {
    playerScore: Math.max(0, playerTotal),
    opponentScore: Math.max(0, opponentTotal),
    playerAnswers: evaluatedPlayerAnswers,
    opponentAnswers: evaluatedOpponentAnswers,
    playerCombo: maxPlayerCombo,
    playerValidCount,
    playerUniqueCount,
    playerFastCount,
    xpEarned,
    coinsEarned
  };
}
