import React, { useState, useEffect } from 'react';
import { UserProfile, AvatarId } from '../../types';
import { ScrapClicker } from '../clicker/ScrapClicker';
import { soundManager } from '../../utils/soundManager';
import { Volume2, VolumeX, ShieldCheck, Zap, User, Flame } from 'lucide-react';

interface HeaderProps {
  profile: UserProfile;
  turboMode: boolean;
  onToggleTurbo: () => void;
  onOpenFairModal: () => void;
  onOpenProfile: () => void;
}

const AVATAR_ICONS: Record<AvatarId, string> = {
  scientist: '👨‍🔬',
  naked: '🪨',
  big_grin: '😈',
  wolf: '🐺',
};

export const Header: React.FC<HeaderProps> = ({
  profile,
  turboMode,
  onToggleTurbo,
  onOpenFairModal,
  onOpenProfile,
}) => {
  const [isMuted, setIsMuted] = useState<boolean>(() => soundManager.getMuted());

  useEffect(() => {
    const unsubscribe = soundManager.subscribe((muted) => setIsMuted(muted));
    return () => unsubscribe();
  }, []);

  const handleToggleMute = () => {
    soundManager.toggleMute();
  };

  return (
    <header className="w-full bg-[#14171E]/90 backdrop-blur-md border-b border-border-dark sticky top-0 z-30 px-3 md:px-6 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Left: Brand Logo & Navigation */}
        <div className="flex items-center gap-3 md:gap-5">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#E53935] to-[#B71C1C] flex items-center justify-center text-white shadow-[0_0_15px_rgba(229,57,53,0.5)] group-hover:shadow-[0_0_22px_rgba(229,57,53,0.8)] transition-all">
              <Flame className="w-5 h-5 fill-current" />
            </div>
            <div className="flex flex-col">
              <span className="font-rajdhani font-black text-lg md:text-xl text-white tracking-wider leading-none">
                RUST<span className="text-primary-red">GRADE</span>
              </span>
              <span className="text-[9px] font-bold text-text-muted tracking-widest uppercase -mt-0.5">
                UPGRADE SIMULATOR
              </span>
            </div>
          </div>

          {/* Clicker Button in Header */}
          <div className="hidden sm:block">
            <ScrapClicker />
          </div>
        </div>

        {/* Right: Controls & Profile */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Mobile Clicker Button */}
          <div className="sm:hidden">
            <ScrapClicker />
          </div>

          {/* Scrap Balance Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0D0F12] border border-border-dark shadow-inner">
            <span className="text-xs">⚙️</span>
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-text-muted uppercase leading-none">
                БАЛАНС
              </span>
              <span className="font-rajdhani font-black text-sm md:text-base text-success-green leading-tight">
                {profile.balance.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Turbo Mode Toggle */}
          <button
            onClick={onToggleTurbo}
            className={`
              flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all
              ${
                turboMode
                  ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50 shadow-[0_0_12px_rgba(255,235,59,0.3)]'
                  : 'bg-[#1B202A] text-text-muted hover:text-white border-border-dark'
              }
            `}
            title="Турбо-режим: быстрое вращение колеса за 0.8 секунды"
          >
            <Zap className={`w-3.5 h-3.5 ${turboMode ? 'fill-current animate-pulse' : ''}`} />
            <span className="hidden md:inline">ТУРБО</span>
          </button>

          {/* Provably Fair Button */}
          <button
            onClick={onOpenFairModal}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#1B202A] hover:bg-[#262B37] text-text-secondary hover:text-white border border-border-dark text-xs font-bold uppercase tracking-wider transition-colors"
            title="Проверка честности игры Provably Fair"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-success-green" />
            <span className="hidden lg:inline">ЧЕСТНАЯ ИГРА</span>
          </button>

          {/* Sound Mute Toggle */}
          <button
            onClick={handleToggleMute}
            className={`
              p-2 rounded-xl border transition-colors
              ${
                isMuted
                  ? 'bg-red-500/15 text-primary-red border-red-500/30'
                  : 'bg-[#1B202A] hover:bg-[#262B37] text-text-secondary hover:text-white border-border-dark'
              }
            `}
            title={isMuted ? 'Включить звук' : 'Выключить звук'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* User Profile Pill */}
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-xl bg-[#1B202A] hover:bg-[#262B37] border border-border-dark text-left transition-all hover:border-primary-red/50"
            title="Открыть профиль игрока"
          >
            <div className="w-7 h-7 rounded-lg bg-[#262B37] flex items-center justify-center text-sm">
              {AVATAR_ICONS[profile.avatar as AvatarId] || <User className="w-4 h-4" />}
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-xs font-bold text-white leading-tight truncate max-w-[90px]">
                {profile.nickname}
              </span>
              <span className="text-[9px] text-text-muted font-mono leading-none">
                {profile.id}
              </span>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
