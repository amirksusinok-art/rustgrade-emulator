import React, { useState, useEffect } from 'react';
import { UserProfile, AvatarId } from '../../types';
import { soundManager } from '../../utils/soundManager';
import { Volume2, VolumeX, ShieldCheck, Zap, User, ChevronUp, Bell, Plus, Flame } from 'lucide-react';
import { ScrapIcon } from '../common/ScrapIcon';

interface HeaderProps {
  profile: UserProfile;
  turboMode: boolean;
  mineCooldown?: number;
  activeTab?: 'upgrade' | 'furnace';
  onSelectTab?: (tab: 'upgrade' | 'furnace') => void;
  onToggleTurbo: () => void;
  onOpenFairModal: () => void;
  onOpenProfile: () => void;
  onMineScrap: (e?: React.MouseEvent) => void;
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
  mineCooldown = 0,
  activeTab = 'upgrade',
  onSelectTab,
  onToggleTurbo,
  onOpenFairModal,
  onOpenProfile,
  onMineScrap,
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
    <header className="w-full bg-[#12141A]/95 border-b border-[#232731] sticky top-0 z-30 px-3 md:px-5 py-2 select-none">
      <div className="w-full flex items-center justify-between gap-3">
        {/* Left: Brand Logo & Navigation (Фото 5) */}
        <div className="flex items-center gap-4">
          <div
            onClick={() => onSelectTab && onSelectTab('upgrade')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-7 h-7 rounded bg-[#E53935] flex items-center justify-center text-white shadow-[0_0_12px_rgba(229,57,53,0.6)]">
              <ChevronUp className="w-5 h-5 stroke-[3]" />
            </div>
            <span className="font-rajdhani font-black text-xl text-white tracking-wider">
              RUST<span className="text-[#E53935]">GRADE</span>
            </span>
          </div>

          {/* Navigation Tabs: UPGRADE & ПЕРЕПЛАВКА */}
          <nav className="flex items-center gap-1.5 ml-2">
            <button
              onClick={() => onSelectTab && onSelectTab('upgrade')}
              className={`flex items-center gap-1.5 px-3 md:px-4 py-1.5 rounded-t text-xs font-black uppercase tracking-wider transition-all ${
                activeTab === 'upgrade'
                  ? 'bg-[#2A1618] border-t-2 border-[#E53935] text-white shadow-sm'
                  : 'bg-transparent text-text-muted hover:text-white'
              }`}
            >
              <ChevronUp className="w-3.5 h-3.5 text-[#E53935]" />
              <span>UPGRADE</span>
            </button>

            <button
              onClick={() => onSelectTab && onSelectTab('furnace')}
              className={`flex items-center gap-1.5 px-3 md:px-4 py-1.5 rounded-t text-xs font-black uppercase tracking-wider transition-all ${
                activeTab === 'furnace'
                  ? 'bg-[#2E180E] border-t-2 border-[#FF9800] text-white shadow-sm'
                  : 'bg-transparent text-text-muted hover:text-white'
              }`}
            >
              <Flame className={`w-3.5 h-3.5 ${activeTab === 'furnace' ? 'text-[#FF9800] fill-current' : 'text-amber-500'}`} />
              <span>ПЕРЕПЛАВКА</span>
            </button>
          </nav>
        </div>

        {/* Right: Controls + Scrap Balance (Фото 4) + Green ПОПОЛНИТЬ + Bell + Profile */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Quick Sound, Turbo & Fair controls */}
          <div className="hidden sm:flex items-center gap-1 bg-[#1A1D24] border border-[#232731] p-0.5 rounded">
            <button
              onClick={onOpenFairModal}
              className="p-1.5 rounded hover:bg-[#252934] text-text-muted hover:text-success-green transition-colors"
              title="Provably Fair (Честная игра)"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleToggleMute}
              className="p-1.5 rounded hover:bg-[#252934] text-text-muted hover:text-white transition-colors"
              title={isMuted ? 'Включить звук' : 'Выключить звук'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-primary-red" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={onToggleTurbo}
              className={`p-1.5 rounded text-xs font-bold transition-colors ${
                turboMode ? 'bg-yellow-500/20 text-yellow-300' : 'text-text-muted hover:text-white hover:bg-[#252934]'
              }`}
              title="Турбо режим (0.8с)"
            >
              <Zap className={`w-3.5 h-3.5 ${turboMode ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Balance Pill with authentic Rust Scrap icon (Фото 4) */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#0D0F12] border border-[#232731]">
            <ScrapIcon size="sm" />
            <span className="font-rajdhani font-black text-sm md:text-base text-white tracking-wide">
              {profile.balance.toFixed(2)}
            </span>
          </div>

          {/* Green ПОПОЛНИТЬ Button (Кликер Scrap: +1 scrap раз в 15 секунд) */}
          <button
            onClick={onMineScrap}
            disabled={mineCooldown > 0}
            className={`flex items-center gap-1.5 px-3 md:px-4 py-1.5 rounded text-xs font-black uppercase tracking-wider transition-all ${
              mineCooldown > 0
                ? 'bg-[#1E222B] text-zinc-500 border border-[#2B313E] cursor-not-allowed shadow-none'
                : 'bg-[#4CAF50] hover:bg-[#43A047] text-white shadow-[0_0_15px_rgba(76,175,80,0.35)] active:scale-95 cursor-pointer'
            }`}
            title={
              mineCooldown > 0
                ? `Перезарядка: подождите ${mineCooldown} сек.`
                : 'Добыть +0.50 Scrap (раз в 15 секунд)'
            }
          >
            <Plus className={`w-3.5 h-3.5 stroke-[3] ${mineCooldown > 0 ? 'text-zinc-500 opacity-60' : 'text-white'}`} />
            <span>{mineCooldown > 0 ? `ПОПОЛНИТЬ (${mineCooldown}с)` : 'ПОПОЛНИТЬ'}</span>
          </button>

          {/* Bell Notifications */}
          <button
            onClick={onOpenProfile}
            className="p-2 rounded bg-[#1A1D24] hover:bg-[#252934] border border-[#232731] text-text-muted hover:text-white transition-colors"
            title="Уведомления и профиль"
          >
            <Bell className="w-3.5 h-3.5" />
          </button>

          {/* User Avatar */}
          <button
            onClick={onOpenProfile}
            className="w-8 h-8 rounded bg-[#202530] border border-[#2B313E] flex items-center justify-center text-sm shadow hover:border-primary-red transition-all"
            title="Мой профиль"
          >
            {AVATAR_ICONS[profile.avatar as AvatarId] || <User className="w-4 h-4 text-white" />}
          </button>
        </div>
      </div>
    </header>
  );
};
