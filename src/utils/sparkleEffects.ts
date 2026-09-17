import confetti from 'canvas-confetti';

/**
 * Triggers a cute burst of golden stars and sparkles
 */
export const triggerStarSparkles = (origin = { x: 0.5, y: 0.5 }) => {
  try {
    confetti({
      particleCount: 25,
      spread: 60,
      origin,
      shapes: ['star', 'circle'],
      colors: ['#F59E0B', '#FBBF24', '#FCD34D', '#EC4899', '#10B981'],
      scalar: 0.9,
      ticks: 70,
      gravity: 0.8,
      startVelocity: 15,
      disableForReducedMotion: true
    });
  } catch {
    // Ignore in non-browser environments
  }
};

/**
 * Large celebration confetti for round wins and tournament victories
 */
export const triggerCelebrationConfetti = () => {
  try {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      colors: ['#F59E0B', '#10B981', '#6366F1', '#EC4899', '#3B82F6', '#FBBF24']
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio)
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
      shapes: ['star']
    });
    fire(0.2, {
      spread: 60,
      shapes: ['circle', 'star']
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      shapes: ['circle']
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 45
    });
  } catch {
    // Ignore in non-browser environments
  }
};
