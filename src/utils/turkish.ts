/**
 * Turkish Alphabet and Localization Utilities
 * Handles proper Turkish character casing and weighted letter selection.
 */

export const TURKISH_ALPHABET = [
  'A', 'B', 'C', 'Ç', 'D', 'E', 'F', 'G', 'Ğ', 'H',
  'I', 'İ', 'J', 'K', 'L', 'M', 'N', 'O', 'Ö', 'P',
  'R', 'S', 'Ş', 'T', 'U', 'Ü', 'V', 'Y', 'Z'
];

export const EASY_LETTERS = ['A', 'B', 'D', 'E', 'K', 'L', 'M', 'N', 'P', 'R', 'S', 'T', 'Y'];
export const NORMAL_LETTERS = ['A', 'B', 'C', 'Ç', 'D', 'E', 'F', 'G', 'H', 'İ', 'K', 'L', 'M', 'N', 'O', 'P', 'R', 'S', 'Ş', 'T', 'U', 'V', 'Y', 'Z'];
export const HARD_LETTERS = ['C', 'Ç', 'F', 'G', 'H', 'I', 'İ', 'Ö', 'Ş', 'U', 'Ü', 'V', 'Z'];
export const EXPERT_LETTERS = ['Ç', 'I', 'J', 'Ö', 'Ş', 'Ü', 'V', 'Z'];

/**
 * Normalizes text to Turkish lowercase
 */
export function toTurkishLower(str: string): string {
  if (!str) return '';
  return str.trim().toLocaleLowerCase('tr-TR');
}

/**
 * Normalizes text to Turkish uppercase
 */
export function toTurkishUpper(str: string): string {
  if (!str) return '';
  return str.trim().toLocaleUpperCase('tr-TR');
}

/**
 * Gets the first Turkish letter of a string in uppercase
 */
export function getFirstTurkishLetter(str: string): string {
  if (!str || str.trim().length === 0) return '';
  const trimmed = str.trim();
  const firstChar = trimmed.charAt(0);
  return toTurkishUpper(firstChar);
}

/**
 * Checks if a word begins with the given letter according to Turkish rules
 */
export function startsWithTurkishLetter(word: string, letter: string): boolean {
  if (!word || !letter) return false;
  const wordLetter = getFirstTurkishLetter(word);
  const targetLetter = toTurkishUpper(letter);
  return wordLetter === targetLetter;
}

/**
 * Clean up a player's raw answer:
 * Strips superfluous punctuations, keeps letters, numbers, spaces, and hyphens.
 */
export function sanitizeAnswer(raw: string): string {
  return raw
    .trim()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?"'<>]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Selects a random letter based on difficulty
 */
export function getRandomLetterByDifficulty(difficulty: 'easy' | 'normal' | 'hard' | 'expert', exclude?: string): string {
  let pool: string[];
  switch (difficulty) {
    case 'easy':
      pool = EASY_LETTERS;
      break;
    case 'normal':
      pool = NORMAL_LETTERS;
      break;
    case 'hard':
      pool = HARD_LETTERS;
      break;
    case 'expert':
      pool = EXPERT_LETTERS;
      break;
    default:
      pool = NORMAL_LETTERS;
  }

  const filteredPool = exclude ? pool.filter(l => l !== exclude) : pool;
  const validPool = filteredPool.length > 0 ? filteredPool : pool;
  return validPool[Math.floor(Math.random() * validPool.length)];
}
