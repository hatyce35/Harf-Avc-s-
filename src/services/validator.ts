import { toTurkishLower, getFirstTurkishLetter } from '../utils/turkish';
import { TURKISH_DICTIONARY } from '../data/wordDatabase';

export interface ValidationResult {
  isValid: boolean;
  status: 'valid' | 'typo' | 'wrong' | 'empty' | 'pisti';
  points: number;
  word: string;
  corrected?: string;
  reason?: string;
  example?: string;
}

// Keyboard smash patterns and repeated characters
const GIBBERISH_REGEX = /^(asdf|qwer|zxcv|ghjk|hjkl|dfgh|bnm|jkl|qaz|wsx|edc|rfv|tgb|yhn|ujm)/i;
const REPEATED_CHAR_REGEX = /(.)\1{3,}/;

function hasTurkishVowel(str: string): boolean {
  return /[aeıioöuüAEIİOÖUÜ]/.test(str);
}

/**
 * Calculates Levenshtein edit distance between two Turkish strings.
 */
export function levenshteinDistance(a: string, b: string): number {
  const an = a ? a.length : 0;
  const bn = b ? b.length : 0;
  if (an === 0) return bn;
  if (bn === 0) return an;
  const matrix: number[][] = Array.from({ length: bn + 1 }, () => new Array(an + 1).fill(0));
  for (let i = 0; i <= an; ++i) matrix[0][i] = i;
  for (let j = 0; j <= bn; ++j) matrix[j][0] = j;
  for (let j = 1; j <= bn; ++j) {
    for (let i = 1; i <= an; ++i) {
      if (a[i - 1] === b[j - 1]) {
        matrix[j][i] = matrix[j - 1][i - 1];
      } else {
        matrix[j][i] = Math.min(
          matrix[j - 1][i - 1] + 1, // substitution
          matrix[j][i - 1] + 1,     // insertion
          matrix[j - 1][i] + 1      // deletion
        );
      }
    }
  }
  return matrix[bn][an];
}

/**
 * Finds exact or fuzzy/typo matches in the local dictionary.
 * Supports missing/extra letter detection (e.g. zynep -> Zeynep, zonguldk -> Zonguldak).
 */
export function findLocalFuzzyMatch(
  categoryId: string,
  word: string,
  targetLetter: string
): { isExact: boolean; isTypo: boolean; matchedWord?: string } {
  const categoryDict = TURKISH_DICTIONARY[categoryId];
  if (!categoryDict) return { isExact: false, isTypo: false };

  const list = categoryDict[targetLetter] || [];
  const lowerAnswer = toTurkishLower(word);

  // 1. Exact match check
  for (const item of list) {
    const lowerItem = toTurkishLower(item);
    if (lowerItem === lowerAnswer) {
      return { isExact: true, isTypo: false, matchedWord: item };
    }
    if (lowerItem.startsWith(lowerAnswer + ' ') || lowerAnswer.startsWith(lowerItem + ' ')) {
      return { isExact: true, isTypo: false, matchedWord: item };
    }
  }

  // 2. Fuzzy / Typo match check (1-2 letters missing, extra, or substituted)
  if (lowerAnswer.length < 3) {
    return { isExact: false, isTypo: false };
  }

  let bestMatch: string | undefined;
  let minDistance = 999;

  for (const item of list) {
    const lowerItem = toTurkishLower(item);
    // Both must start with the target letter
    if (lowerItem.length === 0 || lowerAnswer.length === 0) continue;
    if (lowerItem[0] !== lowerAnswer[0]) continue;

    const dist = levenshteinDistance(lowerAnswer, lowerItem);
    const maxLen = Math.max(lowerAnswer.length, lowerItem.length);

    // If word length 4-6: allow distance 1 (e.g. zynep -> zeynep)
    // If word length >= 7: allow distance 1 or 2 (e.g. zonguldk -> zonguldak)
    const allowedDist = maxLen >= 7 ? 2 : 1;

    if (dist <= allowedDist && dist < minDistance) {
      minDistance = dist;
      bestMatch = item;
    }
  }

  if (bestMatch && minDistance > 0) {
    return { isExact: false, isTypo: true, matchedWord: bestMatch };
  }

  return { isExact: false, isTypo: false };
}

/**
 * Checks local dictionary for a match.
 * Flexible matching supports compound names, e.g. "Elma" matches "Elma" or "Elma Ağacı".
 */
export function checkLocalDictionary(
  categoryId: string,
  word: string,
  targetLetter: string
): boolean {
  const match = findLocalFuzzyMatch(categoryId, word, targetLetter);
  return match.isExact;
}

/**
 * Fast synchronous pre-validation checks:
 * 1. Empty check
 * 2. Letter check
 * 3. Minimum length
 * 4. Keyboard smash / repeated chars
 * 5. Turkish vowel check
 * 6. Local dictionary exact & typo check
 */
export function validateAnswerBasic(
  categoryId: string,
  rawAnswer: string,
  targetLetter: string
): {
  status: 'empty' | 'wrong_letter' | 'too_short' | 'gibberish' | 'no_vowel' | 'dict_matched' | 'dict_typo' | 'needs_ai_check';
  word: string;
  matchedWord?: string;
  reason?: string;
  example?: string;
} {
  const word = rawAnswer.trim();

  // Helper to pick an example
  const getExample = (): string | undefined => {
    const list = TURKISH_DICTIONARY[categoryId]?.[targetLetter];
    return list && list.length > 0 ? list[0] : undefined;
  };

  // 1. Empty Check
  if (!word || word.length === 0) {
    return {
      status: 'empty',
      word,
      reason: 'Cevap yazılmadı',
      example: getExample()
    };
  }

  // 2. Letter Check
  const firstLetter = getFirstTurkishLetter(word);
  if (firstLetter !== targetLetter) {
    return {
      status: 'wrong_letter',
      word,
      reason: `'${targetLetter}' harfi ile başlamalı ('${firstLetter}' ile başladı)`,
      example: getExample()
    };
  }

  // 3. Minimum length
  if (word.length < 2) {
    return {
      status: 'too_short',
      word,
      reason: 'En az 2 harfli olmalıdır',
      example: getExample()
    };
  }

  // 4. Repeated character or keyboard smash
  if (REPEATED_CHAR_REGEX.test(word) || GIBBERISH_REGEX.test(word)) {
    return {
      status: 'gibberish',
      word,
      reason: 'Geçersiz harf dizilimi / uydurma sözcük',
      example: getExample()
    };
  }

  // 5. Must contain at least one Turkish vowel
  if (!hasTurkishVowel(word)) {
    return {
      status: 'no_vowel',
      word,
      reason: 'Geçersiz kelime (sesli harf içermiyor)',
      example: getExample()
    };
  }

  // 6. Check against rich local dictionary (exact and typo)
  const fuzzy = findLocalFuzzyMatch(categoryId, word, targetLetter);
  if (fuzzy.isExact) {
    return {
      status: 'dict_matched',
      word,
      matchedWord: fuzzy.matchedWord
    };
  }

  if (fuzzy.isTypo && fuzzy.matchedWord) {
    return {
      status: 'dict_typo',
      word,
      matchedWord: fuzzy.matchedWord,
      reason: `${fuzzy.matchedWord} (küçük yazım hatası / 1 harf eksik)`
    };
  }

  // If word is plausible and well-formed, it needs verification
  return {
    status: 'needs_ai_check',
    word,
    example: getExample()
  };
}

/**
 * Validates a single answer synchronously (fallback)
 */
export function validateAnswer(
  categoryId: string,
  rawAnswer: string,
  targetLetter: string
): ValidationResult {
  const basic = validateAnswerBasic(categoryId, rawAnswer, targetLetter);

  if (basic.status === 'dict_matched') {
    return {
      isValid: true,
      status: 'valid',
      points: 10,
      word: basic.word
    };
  }

  if (basic.status === 'dict_typo') {
    return {
      isValid: true,
      status: 'typo',
      points: 5,
      word: basic.word,
      corrected: basic.matchedWord,
      reason: basic.reason || `${basic.matchedWord} (yazım yanlışı / 1 harf eksik)`
    };
  }

  if (basic.status === 'needs_ai_check') {
    const fuzzy = findLocalFuzzyMatch(categoryId, basic.word, targetLetter);
    if (fuzzy.isTypo && fuzzy.matchedWord) {
      return {
        isValid: true,
        status: 'typo',
        points: 5,
        word: basic.word,
        corrected: fuzzy.matchedWord,
        reason: `${fuzzy.matchedWord} (küçük yazım hatası)`
      };
    }

    if (basic.word.length >= 3) {
      return {
        isValid: true,
        status: 'valid',
        points: 10,
        word: basic.word
      };
    }
  }

  return {
    isValid: false,
    status: basic.status === 'empty' ? 'empty' : 'wrong',
    points: 0,
    word: basic.word,
    reason: basic.reason || 'Kategoriye uygun bulunamadı',
    example: basic.example
  };
}

/**
 * Validates all round answers in batch:
 * Checks local dictionary first (exact & typo), then calls AI endpoint to check appropriateness of any words not in local dictionary.
 */
export async function validateRoundAnswers(
  targetLetter: string,
  answers: Record<string, string>,
  categories: { id: string; [key: string]: any }[] = [
    { id: 'name' }, { id: 'city' }, { id: 'animal' }, { id: 'plant' }, { id: 'object' }, { id: 'country' }
  ]
): Promise<Record<string, ValidationResult>> {
  const results: Record<string, ValidationResult> = {};
  const candidatesForAI: Record<string, string> = {};

  // Step 1: Run fast local validation on all categories
  for (const cat of categories) {
    const rawAnswer = answers[cat.id] || '';
    const basic = validateAnswerBasic(cat.id, rawAnswer, targetLetter);

    if (basic.status === 'dict_matched') {
      results[cat.id] = {
        isValid: true,
        status: 'valid',
        points: 10,
        word: basic.word
      };
    } else if (basic.status === 'dict_typo') {
      // Deterministic yellow match for minor typo/missing letter
      results[cat.id] = {
        isValid: true,
        status: 'typo',
        points: 5,
        word: basic.word,
        corrected: basic.matchedWord,
        reason: basic.reason || `${basic.matchedWord} (1 harf eksik / yazım hatası)`
      };
    } else if (basic.status === 'needs_ai_check') {
      candidatesForAI[cat.id] = basic.word;
    } else {
      // Definite failure (empty, wrong letter, too short, gibberish, no vowel)
      results[cat.id] = {
        isValid: false,
        status: basic.status === 'empty' ? 'empty' : 'wrong',
        points: 0,
        word: basic.word,
        reason: basic.reason,
        example: basic.example
      };
    }
  }

  // Step 2: If there are words that need appropriateness verification, query server
  const pendingCount = Object.keys(candidatesForAI).length;
  if (pendingCount > 0) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const response = await fetch('/api/verify-answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetLetter,
          answers: candidatesForAI
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data && data.results && !data.fallback) {
          for (const [catId, word] of Object.entries(candidatesForAI)) {
            const aiResult = data.results[catId];
            if (aiResult && typeof aiResult.isValid === 'boolean') {
              const isTypo = aiResult.status === 'typo' || (aiResult.isValid && aiResult.points === 5);
              results[catId] = {
                isValid: aiResult.isValid,
                status: isTypo ? 'typo' : aiResult.isValid ? 'valid' : 'wrong',
                points: aiResult.isValid ? (isTypo ? 5 : 10) : 0,
                word,
                corrected: aiResult.corrected,
                reason: aiResult.isValid
                  ? (isTypo ? (aiResult.reason || `${aiResult.corrected || ''} (yazım hatası)`) : undefined)
                  : (aiResult.reason || 'Kategoriye uygun bulunamadı'),
                example: TURKISH_DICTIONARY[catId]?.[targetLetter]?.[0]
              };
              continue;
            }
          }
        }
      }
    } catch {
      // Network error or timeout - handled gracefully below
    }

    // Step 3: For any remaining candidates where AI did not answer or timed out:
    for (const [catId, word] of Object.entries(candidatesForAI)) {
      if (!results[catId]) {
        // Check if there's a fuzzy match in local dictionary
        const fuzzy = findLocalFuzzyMatch(catId, word, targetLetter);
        if (fuzzy.isTypo && fuzzy.matchedWord) {
          results[catId] = {
            isValid: true,
            status: 'typo',
            points: 5,
            word,
            corrected: fuzzy.matchedWord,
            reason: `${fuzzy.matchedWord} (küçük yazım hatası / 1 harf eksik)`
          };
        } else if (word.length >= 3 && hasTurkishVowel(word)) {
          results[catId] = {
            isValid: true,
            status: 'valid',
            points: 10,
            word
          };
        } else {
          results[catId] = {
            isValid: false,
            status: 'wrong',
            points: 0,
            word,
            reason: 'Kategoriye uygun bulunamadı',
            example: TURKISH_DICTIONARY[catId]?.[targetLetter]?.[0]
          };
        }
      }
    }
  }

  return results;
}
