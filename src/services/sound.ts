/**
 * Sound & Haptic Manager for Harf Avcısı
 * Uses Web Audio API synthesizer to generate crisp, zero-latency cute arcade sounds
 * without needing external MP3 files. Guarantees 100% offline availability and zero 404s.
 */

class SoundService {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private vibrationEnabled: boolean = true;

  constructor() {
    // Lazy initialize on first user gesture
  }

  private getAudioContext(): AudioContext | null {
    if (!this.soundEnabled) return null;
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  public setVibrationEnabled(enabled: boolean) {
    this.vibrationEnabled = enabled;
  }

  public triggerHaptic(pattern: number | number[] = 25) {
    if (!this.vibrationEnabled || typeof window === 'undefined') return;
    try {
      if ('vibrate' in navigator) {
        navigator.vibrate(pattern);
      }
    } catch {
      // Ignore if not supported
    }
  }

  // Cute bubble pop for button clicks & navigation
  public playClick() {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    this.triggerHaptic(15);

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(580, now);
    osc.frequency.exponentialRampToValueAtTime(820, now + 0.04);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.08);

    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  // Cheerful bubble pop
  public playPop() {
    this.playClick();
  }

  // Cute musical marimba typing sound (pentatonic scale for fun keyboard feedback)
  public playType() {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const pentatonic = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50]; // C5, D5, E5, G5, A5, C6
    const randomFreq = pentatonic[Math.floor(Math.random() * pentatonic.length)];

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(randomFreq, now);
    osc.frequency.exponentialRampToValueAtTime(randomFreq * 0.98, now + 0.06);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  // Sparkling fairy dust / magical shimmer sound
  public playSparkle() {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    this.triggerHaptic(20);

    const notes = [1046.50, 1318.51, 1567.98, 2093.00, 2637.02]; // C6, E6, G6, C7, E7
    const now = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.035);

      gain.gain.setValueAtTime(0.08, now + idx * 0.035);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.035 + 0.16);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.035);
      osc.stop(now + idx * 0.035 + 0.16);
    });
  }

  // Cute letter reveal whoosh + bell twinkle
  public playLetterReveal() {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    this.triggerHaptic([20, 20, 35]);

    const now = ctx.currentTime;

    // Upward soft whoosh
    const sweep = ctx.createOscillator();
    const sweepGain = ctx.createGain();
    sweep.type = 'sine';
    sweep.frequency.setValueAtTime(320, now);
    sweep.frequency.exponentialRampToValueAtTime(900, now + 0.18);
    sweepGain.gain.setValueAtTime(0.08, now);
    sweepGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    sweep.connect(sweepGain);
    sweepGain.connect(ctx.destination);
    sweep.start(now);
    sweep.stop(now + 0.18);

    // Twinkling bell chord
    const bells = [659.25, 880.00, 1318.51];
    bells.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + 0.12 + i * 0.03);
      gain.gain.setValueAtTime(0.12, now + 0.12 + i * 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12 + i * 0.03 + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + 0.12 + i * 0.03);
      osc.stop(now + 0.12 + i * 0.03 + 0.28);
    });
  }

  // Cute "DUR!" exciting cartoon chime
  public playDur() {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    this.triggerHaptic([40, 20, 50]);

    const now = ctx.currentTime;
    const notes = [
      { freq: 440, time: 0.0, dur: 0.08 },
      { freq: 554.37, time: 0.06, dur: 0.08 },
      { freq: 659.25, time: 0.12, dur: 0.1 },
      { freq: 880, time: 0.18, dur: 0.25 }
    ];

    notes.forEach(n => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.freq, now + n.time);
      osc.frequency.exponentialRampToValueAtTime(n.freq * 1.05, now + n.time + n.dur);

      gain.gain.setValueAtTime(0.15, now + n.time);
      gain.gain.exponentialRampToValueAtTime(0.001, now + n.time + n.dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + n.time);
      osc.stop(now + n.time + n.dur);
    });
  }

  // Correct answer chime (2 harmonized cute bell notes)
  public playCorrect() {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    this.triggerHaptic(30);

    const now = ctx.currentTime;
    const notes = [587.33, 880.00]; // D5, A5 (bright & cute)
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);

      gain.gain.setValueAtTime(0.16, now + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.25);
    });
  }

  public playSuccess() {
    this.playCorrect();
  }

  public playFanfare() {
    this.playVictory();
  }

  public playSpecialEvent() {
    this.playSparkle();
  }

  public playStop() {
    this.playDur();
  }

  // Unique answer special magical arpeggio
  public playUnique() {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    this.triggerHaptic([30, 20, 45]);

    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.045);

      gain.gain.setValueAtTime(0.12, now + idx * 0.045);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.045 + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.045);
      osc.stop(now + idx * 0.045 + 0.3);
    });
  }

  // Cute gentle boing/wobble for typo or invalid word (not harsh!)
  public playInvalid() {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    this.triggerHaptic([30, 30]);

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.14);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.22);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.22);
  }

  // Countdown tick
  public playCountdownTick() {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(650, now);
    osc.frequency.exponentialRampToValueAtTime(450, now + 0.03);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.03);
  }

  // Urgent tick
  public playUrgentTick() {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    this.triggerHaptic(20);

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(660, now + 0.04);

    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  // Cute victory melody
  public playVictory() {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    this.triggerHaptic([40, 30, 40, 30, 80]);

    const now = ctx.currentTime;
    const melody = [
      { freq: 523.25, time: 0.0, dur: 0.1 },   // C5
      { freq: 659.25, time: 0.11, dur: 0.1 },  // E5
      { freq: 783.99, time: 0.22, dur: 0.1 },  // G5
      { freq: 1046.50, time: 0.33, dur: 0.12 },// C6
      { freq: 880.00, time: 0.46, dur: 0.08 }, // A5
      { freq: 1046.50, time: 0.55, dur: 0.35 } // C6
    ];

    melody.forEach(item => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(item.freq, now + item.time);

      gain.gain.setValueAtTime(0.16, now + item.time);
      gain.gain.exponentialRampToValueAtTime(0.001, now + item.time + item.dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + item.time);
      osc.stop(now + item.time + item.dur);
    });
  }

  // Cute soft defeat
  public playDefeat() {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [493.88, 440.00, 392.00, 349.23];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);

      gain.gain.setValueAtTime(0.1, now + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.22);
    });
  }
}

export const soundManager = new SoundService();
