import React, { useState, useEffect } from 'react';
import { UserProfile, AvatarId } from '../../types';
import { soundManager } from '../../utils/soundManager';
import { Volume2, VolumeX, ShieldCheck, Zap, User, ChevronUp, Bell, Plus } from 'lucide-react';

interface HeaderProps {
  profile: UserProfile;
  turboMode: boolean;
  onToggleTurbo: () => void;
  onOpenFairModal: () => void;
  onOpenProfile: () => void;
  onMineScrap: () => void;
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
          <div className="flex items-center gap-2 cursor-pointer group">
            <div className="w-7 h-7 rounded bg-[#E53935] flex items-center justify-center text-white shadow-[0_0_12px_rgba(229,57,53,0.6)]">
              <ChevronUp className="w-5 h-5 stroke-[3]" />
            </div>
            <span className="font-rajdhani font-black text-xl text-white tracking-wider">
              RUST<span className="text-[#E53935]">GRADE</span>
            </span>
          </div>

          {/* Navigation Tabs (Фото 5: Только UPGRADE, REWARDS убран) */}
          <nav className="hidden md:flex items-center ml-2">
            <button
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-t bg-[#2A1618] border-t-2 border-[#E53935] text-white text-xs font-black uppercase tracking-wider shadow-sm"
            >
              <ChevronUp className="w-3.5 h-3.5 text-[#E53935]" />
              <span>UPGRADE</span>
            </button>
          </nav>
        </div>

        {/* Right: Socials (VK, TG, DS) + Scrap + Green ПОПОЛНИТЬ + Bell + Profile (Фото 5) */}
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

          {/* Social Icons matching Photo 5 (VK, Telegram, Discord) */}
          <div className="hidden lg:flex items-center gap-1.5">
            {/* VK */}
            <a
              href="https://vk.com"
              target="_blank"
              rel="noreferrer"
              className="w-7 h-7 rounded bg-[#C62828] hover:bg-[#D32F2F] flex items-center justify-center text-white text-xs font-black tracking-tighter transition-colors shadow-sm"
              title="ВКонтакте"
            >
              VK
            </a>
            {/* Telegram */}
            <a
              href="https://t.me"
              target="_blank"
              rel="noreferrer"
              className="w-7 h-7 rounded bg-[#C62828] hover:bg-[#D32F2F] flex items-center justify-center text-white text-xs transition-colors shadow-sm"
              title="Telegram"
            >
              ✈
            </a>
            {/* Discord */}
            <a
              href="https://discord.com"
              target="_blank"
              rel="noreferrer"
              className="w-7 h-7 rounded bg-[#C62828] hover:bg-[#D32F2F] flex items-center justify-center text-white text-xs transition-colors shadow-sm"
              title="Discord"
            >
              🎮
            </a>
          </div>

          {/* Balance Pill with scrap icon (Фото 5) */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#0D0F12] border border-[#232731]">
            <span className="text-xs">⚙️</span>
            <span className="font-rajdhani font-black text-sm md:text-base text-white tracking-wide">
              {profile.balance.toFixed(2)}
            </span>
          </div>

          {/* Green ПОПОЛНИТЬ Button (Фото 5: с иконкой плюс) */}
          <button
            onClick={onMineScrap}
            className="flex items-center gap-1.5 px-3 md:px-4 py-1.5 rounded bg-[#4CAF50] hover:bg-[#43A047] text-white text-xs font-black uppercase tracking-wider shadow-[0_0_15px_rgba(76,175,80,0.35)] transition-all active:scale-95"
            title="Добыть +1.00 Scrap"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>ПОПОЛНИТЬ</span>
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
