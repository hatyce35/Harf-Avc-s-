import { TURKISH_DICTIONARY } from '../data/wordDatabase';
import { Difficulty, AnswerItem } from '../types';

export interface AIAvatar {
  name: string;
  avatar: string;
  tagline: string;
  difficulty: Difficulty;
}

export const AI_PROFILES: Record<Difficulty, AIAvatar> = {
  easy: {
    name: 'Çaylak Çetin',
    avatar: '🤖',
    tagline: 'Yeni öğreniyorum, bazen kelimeleri unutabilirim!',
    difficulty: 'easy'
  },
  normal: {
    name: 'Bilge Baykuş',
    avatar: '🦉',
    tagline: 'Klasik kelimeleri hiç kaçırmam, dikkat et!',
    difficulty: 'normal'
  },
  hard: {
    name: 'Kelime Cambazı',
    avatar: '🦊',
    tagline: 'Nadir kelimeler benim uzmanlık alanımdır.',
    difficulty: 'hard'
  },
  expert: {
    name: 'Türkçe Şampiyonu',
    avatar: '👑',
    tagline: 'Hız ve yaratıcılık bir arada. Beni geçmek imkansıza yakın!',
    difficulty: 'expert'
  }
};

export const AI_REACTIONS = {
  gameStart: [
    'Bakalım bu harfte kim daha yaratıcı olacak!',
    'Zaman hızla akacak, parmaklarını hazırla!',
    'Harika bir tur bizi bekliyor!'
  ],
  playerAhead: [
    'Çok hızlısın! Biraz yavaşla yahu!',
    'O cevabı ben bile akıl edemezdim!',
    'Tebrikler, gerçekten formundasın!'
  ],
  aiAhead: [
    'Bunu geçebilecek misin bakalım?',
    'Süre daralıyor, acele et!',
    'Ben cevaplarımı kilitledim bile!'
  ],
  tied: [
    'Kafa kafaya gidiyoruz, son saniyeler belirleyecek!',
    'Nefes kesen bir yarış!'
  ],
  finish: [
    'Tur bitti! Bakalım kim daha çok puan toplamış?',
    'Güzel mücadeleydi, skorları görelim!'
  ]
};

/**
 * Generates AI answers tailored to difficulty level
 */
export function generateAIAnswers(
  letter: string,
  categoryIds: string[],
  difficulty: Difficulty
): { answers: Record<string, AnswerItem>; finishTime: number } {
  const result: Record<string, AnswerItem> = {};

  // Accuracy probabilities and answer timing by difficulty
  let accuracyChance = 0.65;
  let emptyChance = 0.25;
  let minTime = 16;
  let maxTime = 25;

  if (difficulty === 'easy') {
    accuracyChance = 0.55;
    emptyChance = 0.35;
    minTime = 20;
    maxTime = 30;
  } else if (difficulty === 'normal') {
    accuracyChance = 0.78;
    emptyChance = 0.15;
    minTime = 15;
    maxTime = 22;
  } else if (difficulty === 'hard') {
    accuracyChance = 0.90;
    emptyChance = 0.05;
    minTime = 10;
    maxTime = 16;
  } else if (difficulty === 'expert') {
    accuracyChance = 0.98;
    emptyChance = 0.01;
    minTime = 6;
    maxTime = 12;
  }

  const simulatedFinishTime = Math.floor(minTime + Math.random() * (maxTime - minTime));

  categoryIds.forEach((catId, index) => {
    const isBlank = Math.random() < emptyChance;
    if (isBlank) {
      result[catId] = {
        categoryId: catId,
        value: '',
        isLocked: false,
        timestamp: Date.now() + (index * 1200)
      };
      return;
    }

    const dict = TURKISH_DICTIONARY[catId];
    const wordsForLetter = dict ? dict[letter] : null;

    let pickedWord = '';

    if (wordsForLetter && wordsForLetter.length > 0) {
      const willBeAccurate = Math.random() < accuracyChance;
      if (willBeAccurate) {
        // High difficulty chooses rarer words (later in list or random)
        const wordIndex = Math.floor(Math.random() * wordsForLetter.length);
        pickedWord = wordsForLetter[wordIndex];
      } else {
        // Deliberate AI typo or close misjudgment
        pickedWord = `${letter}xxx`;
      }
    } else {
      // Fallback sensible word starting with the letter
      pickedWord = `${letter}al`;
    }

    // AI sometimes locks answer if confident
    const isLocked = difficulty === 'hard' || difficulty === 'expert' ? Math.random() > 0.4 : false;

    result[catId] = {
      categoryId: catId,
      value: pickedWord,
      isLocked,
      timestamp: Date.now() + (index * 1500)
    };
  });

  return {
    answers: result,
    finishTime: simulatedFinishTime
  };
}
