import { RingtoneId } from '../types';

class AudioService {
  private ctx: AudioContext | null = null;
  private isLooping = false;
  private loopTimer: number | null = null;
  private activeGainNodes: GainNode[] = [];

  private getAudioContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Must be called during user interaction to unlock audio context
   */
  public async unlock(): Promise<boolean> {
    try {
      const ctx = this.getAudioContext();
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
      // Play inaudible micro-tone to warm up the engine
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      gain.gain.value = 0.0001;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
      return true;
    } catch (e) {
      console.warn('Audio unlock failed:', e);
      return false;
    }
  }

  public isSoundPlaying(): boolean {
    return this.isLooping;
  }

  public startRingtone(ringtoneId: RingtoneId = 'crystal', volume = 0.7): void {
    this.stopRingtone();
    this.isLooping = true;

    const playCycle = () => {
      if (!this.isLooping) return;
      this.playMelody(ringtoneId, volume);

      // Loop intervals based on melody length
      const intervalMs = ringtoneId === 'zen' ? 3800 : ringtoneId === 'ocean' ? 4200 : 3000;
      this.loopTimer = window.setTimeout(playCycle, intervalMs);
    };

    playCycle();
  }

  public stopRingtone(): void {
    this.isLooping = false;
    if (this.loopTimer) {
      clearTimeout(this.loopTimer);
      this.loopTimer = null;
    }

    // Smoothly fade out active oscillators to avoid clicks
    if (this.ctx) {
      const now = this.ctx.currentTime;
      this.activeGainNodes.forEach(gain => {
        try {
          gain.gain.cancelScheduledValues(now);
          gain.gain.setValueAtTime(gain.gain.value, now);
          gain.gain.linearRampToValueAtTime(0.0001, now + 0.1);
        } catch {
          // ignore
        }
      });
    }
    this.activeGainNodes = [];
  }

  public playTest(ringtoneId: RingtoneId = 'crystal', volume = 0.7): void {
    this.stopRingtone();
    this.playMelody(ringtoneId, volume);
  }

  public playWaterDropSfx(volume = 0.7): void {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      // Pitch drop effect like a water bubble
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.15);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(Math.min(1, volume * 0.8), now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch (e) {
      console.warn('Water drop SFX error:', e);
    }
  }

  private playMelody(ringtoneId: RingtoneId, volume: number): void {
    try {
      const ctx = this.getAudioContext();
      const masterVolume = Math.max(0.05, Math.min(1, volume));

      if (ringtoneId === 'crystal') {
        this.playCrystalMelody(ctx, masterVolume);
      } else if (ringtoneId === 'zen') {
        this.playZenBell(ctx, masterVolume);
      } else if (ringtoneId === 'bubble') {
        this.playBubbleMelody(ctx, masterVolume);
      } else {
        this.playOceanChime(ctx, masterVolume);
      }
    } catch (e) {
      console.warn('Error playing melody:', e);
    }
  }

  private playCrystalMelody(ctx: AudioContext, masterVolume: number): void {
    const notes = [
      { freq: 523.25, time: 0.0, dur: 0.4 },  // C5
      { freq: 659.25, time: 0.2, dur: 0.4 },  // E5
      { freq: 783.99, time: 0.4, dur: 0.4 },  // G5
      { freq: 1046.50, time: 0.6, dur: 0.6 }, // C6
      { freq: 1318.51, time: 0.9, dur: 0.9 }, // E6 (lingering chime)
    ];

    notes.forEach(({ freq, time, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + time);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2500, ctx.currentTime + time);

      const noteStart = ctx.currentTime + time;
      gain.gain.setValueAtTime(0, noteStart);
      gain.gain.linearRampToValueAtTime(masterVolume * 0.7, noteStart + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, noteStart + dur);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      this.activeGainNodes.push(gain);
      osc.start(noteStart);
      osc.stop(noteStart + dur + 0.1);
    });
  }

  private playZenBell(ctx: AudioContext, masterVolume: number): void {
    const baseFreq = 440; // A4 harmonic series
    const harmonics = [1, 2.01, 3.02, 4.2];
    const baseStart = ctx.currentTime;

    harmonics.forEach((mult, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq * mult, baseStart);

      const amp = (masterVolume * 0.6) / (idx + 1);
      gain.gain.setValueAtTime(0, baseStart);
      gain.gain.linearRampToValueAtTime(amp, baseStart + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0005, baseStart + 3.0);

      osc.connect(gain);
      gain.connect(ctx.destination);

      this.activeGainNodes.push(gain);
      osc.start(baseStart);
      osc.stop(baseStart + 3.2);
    });
  }

  private playBubbleMelody(ctx: AudioContext, masterVolume: number): void {
    const bubbles = [
      { startFreq: 600, endFreq: 1200, time: 0.0 },
      { startFreq: 800, endFreq: 1500, time: 0.18 },
      { startFreq: 700, endFreq: 1350, time: 0.36 },
      { startFreq: 1000, endFreq: 1800, time: 0.54 },
      { startFreq: 1200, endFreq: 2200, time: 0.72 },
    ];

    bubbles.forEach(({ startFreq, endFreq, time }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const noteStart = ctx.currentTime + time;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(startFreq, noteStart);
      osc.frequency.exponentialRampToValueAtTime(endFreq, noteStart + 0.12);

      gain.gain.setValueAtTime(0, noteStart);
      gain.gain.linearRampToValueAtTime(masterVolume * 0.8, noteStart + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);

      this.activeGainNodes.push(gain);
      osc.start(noteStart);
      osc.stop(noteStart + 0.25);
    });
  }

  private playOceanChime(ctx: AudioContext, masterVolume: number): void {
    const chords = [
      { freq: 392.00, time: 0.0, dur: 2.5 }, // G4
      { freq: 587.33, time: 0.3, dur: 2.2 }, // D5
      { freq: 880.00, time: 0.6, dur: 2.5 }, // A5
      { freq: 1174.66, time: 0.9, dur: 2.8 },// D6
    ];

    chords.forEach(({ freq, time, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const noteStart = ctx.currentTime + time;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteStart);

      gain.gain.setValueAtTime(0, noteStart);
      gain.gain.linearRampToValueAtTime(masterVolume * 0.5, noteStart + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.0005, noteStart + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      this.activeGainNodes.push(gain);
      osc.start(noteStart);
      osc.stop(noteStart + dur + 0.2);
    });
  }
}

export const audioService = new AudioService();
