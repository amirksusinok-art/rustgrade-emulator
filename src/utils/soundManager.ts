export type SoundId =
  | 'barrel_hit'
  | 'fuse_burn'
  | 'wheel_tick'
  | 'win'
  | 'jackpot'
  | 'lose'
  | 'item_select'
  | 'scrap_sell'
  | 'codelock_error'
  | 'airdrop_plane'
  | 'airdrop_land';

interface SoundConfig {
  file: string;
  volume: number;
}

const SOUND_CONFIGS: Record<SoundId, SoundConfig> = {
  barrel_hit: { file: '/audio/barrel_hit.mp3', volume: 0.75 },
  fuse_burn: { file: '/audio/fuse_burn.mp3', volume: 0.65 },
  wheel_tick: { file: '/audio/wheel_tick.mp3', volume: 0.4 },
  win: { file: '/audio/win.mp3', volume: 0.85 },
  jackpot: { file: '/audio/jackpot.mp3', volume: 0.95 },
  lose: { file: '/audio/lose.mp3', volume: 0.75 },
  item_select: { file: '/audio/item_select.mp3', volume: 0.55 },
  scrap_sell: { file: '/audio/scrap_sell.mp3', volume: 0.7 },
  codelock_error: { file: '/audio/codelock_error.mp3', volume: 0.65 },
  airdrop_plane: { file: '/audio/airdrop-plane.mp3', volume: 0.18 },
  airdrop_land: { file: '/audio/airdrop_land.mp3', volume: 0.22 },
};

class SoundManager {
  private isMuted: boolean = false;
  private audioPool: Map<SoundId, HTMLAudioElement[]> = new Map();
  private poolSize: number = 4;
  private listeners: Set<(muted: boolean) => void> = new Set();
  private wheelTickTimeouts: number[] = [];
  private isUnlocked: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const savedMute = localStorage.getItem('rustgrade_muted');
      if (savedMute !== null) {
        this.isMuted = savedMute === 'true';
      }

      // Safe user interaction listener to unlock audio on first click
      const unlockAudio = () => {
        this.isUnlocked = true;
        window.removeEventListener('click', unlockAudio);
        window.removeEventListener('keydown', unlockAudio);
        window.removeEventListener('touchstart', unlockAudio);
      };
      window.addEventListener('click', unlockAudio, { passive: true, once: true });
      window.addEventListener('keydown', unlockAudio, { passive: true, once: true });
      window.addEventListener('touchstart', unlockAudio, { passive: true, once: true });
    }
  }

  public subscribe(listener: (muted: boolean) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((listener) => {
      try {
        listener(this.isMuted);
      } catch {
        // Ignore subscriber errors
      }
    });
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('rustgrade_muted', String(muted));
      } catch {
        // Ignore storage errors
      }
    }
    if (muted) {
      this.stopWheelTicks();
    }
    this.notify();
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  /**
   * Safely play sound with zero uncaught promise rejections
   */
  public play(id: SoundId): void {
    if (this.isMuted || typeof window === 'undefined') return;

    const config = SOUND_CONFIGS[id];
    if (!config) return;

    try {
      if (!this.audioPool.has(id)) {
        this.audioPool.set(id, []);
      }

      const pool = this.audioPool.get(id)!;
      let audio = pool.find((a) => a.paused || a.ended);

      if (!audio) {
        if (pool.length < this.poolSize) {
          audio = new Audio(config.file);
          audio.preload = 'auto';
          pool.push(audio);
        } else {
          audio = pool[0];
          try {
            audio.pause();
            audio.currentTime = 0;
          } catch {
            // Ignore
          }
        }
      }

      audio.volume = config.volume;
      audio.currentTime = 0;

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Silent swallow: browser autoplay policies without error logs
        });
      }
    } catch {
      // Safe fallback
    }
  }

  /**
   * Schedules a synchronized sequence of ticks that decelerates over the spin duration.
   */
  public startWheelTicks(durationMs: number): void {
    this.stopWheelTicks();
    if (this.isMuted || typeof window === 'undefined') return;

    const totalTicks = durationMs < 1200 ? 14 : 34;
    let accumulatedTime = 0;

    for (let i = 0; i < totalTicks; i++) {
      const progress = i / totalTicks;
      const baseInterval = durationMs < 1200 ? 25 : 45;
      const expansion = Math.pow(progress, 2.6) * (durationMs < 1200 ? 170 : 340);
      const interval = baseInterval + expansion;

      accumulatedTime += interval;
      if (accumulatedTime >= durationMs - 50) break;

      const timeoutId = window.setTimeout(() => {
        this.play('wheel_tick');
      }, accumulatedTime);

      this.wheelTickTimeouts.push(timeoutId);
    }
  }

  public stopWheelTicks(): void {
    this.wheelTickTimeouts.forEach((id) => clearTimeout(id));
    this.wheelTickTimeouts = [];
  }
}

export const soundManager = new SoundManager();
