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
  barrel_hit: { file: '/audio/barrel_hit.mp3', volume: 0.8 },
  fuse_burn: { file: '/audio/fuse_burn.mp3', volume: 0.7 },
  wheel_tick: { file: '/audio/wheel_tick.mp3', volume: 0.45 },
  win: { file: '/audio/win.mp3', volume: 0.9 },
  jackpot: { file: '/audio/jackpot.mp3', volume: 1.0 },
  lose: { file: '/audio/lose.mp3', volume: 0.8 },
  item_select: { file: '/audio/item_select.mp3', volume: 0.6 },
  scrap_sell: { file: '/audio/scrap_sell.mp3', volume: 0.75 },
  codelock_error: { file: '/audio/codelock_error.mp3', volume: 0.7 },
  airdrop_plane: { file: '/audio/airdrop-plane.mp3', volume: 0.85 },
  airdrop_land: { file: '/audio/airdrop_land.mp3', volume: 0.9 },
};

class SoundManager {
  private isMuted: boolean = false;
  private audioCache: Map<SoundId, HTMLAudioElement[]> = new Map();
  private poolSize: number = 5;
  private listeners: Set<(muted: boolean) => void> = new Set();
  private wheelTickTimeouts: number[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      const savedMute = localStorage.getItem('rustgrade_muted');
      if (savedMute !== null) {
        this.isMuted = savedMute === 'true';
      }
    }
  }

  public subscribe(listener: (muted: boolean) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener(this.isMuted));
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('rustgrade_muted', String(muted));
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

  public play(id: SoundId): void {
    if (this.isMuted || typeof window === 'undefined') return;

    const config = SOUND_CONFIGS[id];
    if (!config) return;

    try {
      if (!this.audioCache.has(id)) {
        this.audioCache.set(id, []);
      }

      const pool = this.audioCache.get(id)!;
      let audio = pool.find((a) => a.paused || a.ended);

      if (!audio) {
        if (pool.length < this.poolSize) {
          audio = new Audio(config.file);
          audio.volume = config.volume;
          pool.push(audio);
        } else {
          audio = pool[0];
          audio.currentTime = 0;
        }
      }

      audio.currentTime = 0;
      audio.volume = config.volume;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Ignore auto-play restriction before user interaction
        });
      }
    } catch (e) {
      console.warn(`[SoundManager] Error playing ${id}:`, e);
    }
  }

  /**
   * Schedules a realistic sequence of ticks that decelerates over the spin duration.
   */
  public startWheelTicks(durationMs: number): void {
    this.stopWheelTicks();
    if (this.isMuted) return;

    // Generate tick times based on cubic-bezier deceleration
    const totalTicks = durationMs < 1200 ? 14 : 32;
    let accumulatedTime = 0;

    for (let i = 0; i < totalTicks; i++) {
      const progress = i / totalTicks;
      // Interval increases as wheel slows down (from ~40ms to ~250ms)
      const baseInterval = durationMs < 1200 ? 25 : 45;
      const expansion = Math.pow(progress, 2.5) * (durationMs < 1200 ? 160 : 320);
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
