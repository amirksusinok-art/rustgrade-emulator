import React, { useState } from 'react';
import { AvatarId } from '../../types';
import { ScrapIcon } from '../common/ScrapIcon';
import { soundManager } from '../../utils/soundManager';
import { ShieldCheck, User, Key, Sparkles, Check, ChevronRight, X } from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  currentNickname: string;
  currentSteamId?: string;
  currentAvatar: AvatarId;
  onClose?: () => void;
  onComplete: (nickname: string, steamId: string, avatar: AvatarId) => void;
}

const AVATAR_OPTIONS: { id: AvatarId; label: string; icon: string; desc: string }[] = [
  { id: 'naked', label: 'Naked', icon: '🪨', desc: 'Кепка с камнем и факелом' },
  { id: 'scientist', label: 'Scientist', icon: '👨‍🔬', desc: 'Учёный с Cobalt Lab' },
  { id: 'wolf', label: 'Wolf Hunter', icon: '🐺', desc: 'Опытный бродяга пустоши' },
  { id: 'big_grin', label: 'Big Grin', icon: '😈', desc: 'Олигарх острова Rust' },
];

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  currentNickname,
  currentSteamId,
  currentAvatar,
  onClose,
  onComplete,
}) => {
  const [nickname, setNickname] = useState<string>(() => {
    if (currentNickname && currentNickname !== 'Player' && currentNickname !== 'RustSurvivor') {
      return currentNickname;
    }
    return `Rust_${Math.floor(1000 + Math.random() * 9000)}`;
  });

  const [steamId, setSteamId] = useState<string>(() => {
    if (currentSteamId && currentSteamId.length > 5) {
      return currentSteamId;
    }
    return `76561198${Math.floor(100000000 + Math.random() * 900000000)}`;
  });

  const [selectedAvatar, setSelectedAvatar] = useState<AvatarId>(currentAvatar || 'naked');
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const handleFinish = (cleanNick: string, cleanId: string, avatar: AvatarId) => {
    soundManager.play('scrap_sell');
    try {
      localStorage.setItem('rustgrade_onboarding_completed', 'true');
    } catch {
      // ignore
    }
    onComplete(cleanNick, cleanId, avatar);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanNick = nickname.trim();
    const cleanId = steamId.trim();

    if (!cleanNick) {
      setErrorMsg('Пожалуйста, введите ваш игровой никнейм');
      return;
    }

    if (!cleanId) {
      setErrorMsg('Пожалуйста, укажите ваш SteamID или ID аккаунта');
      return;
    }

    handleFinish(cleanNick, cleanId, selectedAvatar);
  };

  const handleSkip = () => {
    const cleanNick = nickname.trim() || `Survivor_${Math.floor(1000 + Math.random() * 9000)}`;
    const cleanId = steamId.trim() || `76561198${Math.floor(100000000 + Math.random() * 900000000)}`;
    handleFinish(cleanNick, cleanId, selectedAvatar);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-xl bg-gradient-to-b from-[#181C26] to-[#0E1118] border-2 border-[#2B3448] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col">
        {/* Metal corner rivets */}
        <div className="absolute top-2.5 left-2.5 w-2 h-2 rounded-full bg-zinc-500 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] pointer-events-none" />
        <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-zinc-500 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] pointer-events-none" />
        <div className="absolute bottom-2.5 left-2.5 w-2 h-2 rounded-full bg-zinc-500 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] pointer-events-none" />
        <div className="absolute bottom-2.5 right-2.5 w-2 h-2 rounded-full bg-zinc-500 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] pointer-events-none" />

        {/* Tactical Header Bar */}
        <div className="bg-[#12151E] border-b border-[#242C3C] px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[11px] font-black text-zinc-300 tracking-wider uppercase">
              ПОДКЛЮЧЕНИЕ К СЕРВЕРУ • [EU/RU] RUSTGRADE #1
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] text-zinc-500 hidden sm:inline">PORT: 28015</span>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-lg bg-[#1B202A] hover:bg-[#262B37] text-zinc-400 hover:text-white transition-colors"
                title="Закрыть"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-7 flex flex-col gap-5">
          {/* Server Welcome Banner */}
          <div className="flex flex-col gap-1.5 text-center sm:text-left">
            <h2 className="font-rajdhani font-black text-2xl sm:text-3xl text-white tracking-wide uppercase">
              Добро пожаловать в <span className="text-[#E53935]">RUSTGRADE</span>
            </h2>
            <p className="text-xs text-zinc-400 font-sans leading-relaxed">
              Укажи свой позывной выжившего и SteamID для участия в сезонных рейтингах, аренде скинов и борьбе за звание Короля Острова.
            </p>
          </div>

          {/* Starter Bonus Banner */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/60 to-[#122A1E]/40 border border-emerald-500/40 flex items-center justify-between gap-3 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shrink-0">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black text-white uppercase tracking-wider font-rajdhani">
                  Стартовый бонус новичка
                </span>
                <span className="text-[11px] text-zinc-300">
                  Мгновенное начисление на баланс при входе
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0D1812] border border-emerald-500/40 font-rajdhani font-black text-base text-emerald-400">
              <ScrapIcon size="sm" />
              <span>+10.00</span>
            </div>
          </div>

          {/* Input 1: Nickname */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#E53935]" />
              Твой Игровой Никнейм
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value);
                setErrorMsg('');
              }}
              maxLength={20}
              placeholder="Например: Rusty_Fox, Trausi..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D1017] border border-[#2B3549] text-sm font-bold text-white placeholder-zinc-600 focus:outline-none focus:border-[#E53935] focus:ring-1 focus:ring-[#E53935]/40 transition-all font-mono"
            />
          </div>

          {/* Input 2: SteamID */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-500" />
                SteamID / Игровой ID
              </label>
              <button
                type="button"
                onClick={() => setSteamId(`76561198${Math.floor(100000000 + Math.random() * 900000000)}`)}
                className="text-[10px] text-amber-400 hover:text-amber-300 font-mono transition-colors"
              >
                (Сгенерировать случайный)
              </button>
            </div>
            <input
              type="text"
              value={steamId}
              onChange={(e) => {
                setSteamId(e.target.value);
                setErrorMsg('');
              }}
              maxLength={24}
              placeholder="76561198000000000 или твой уникальный ID"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D1017] border border-[#2B3549] text-sm font-bold text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40 transition-all font-mono"
            />
            <span className="text-[10px] text-zinc-500 font-sans">
              Закрепляется за твоим инвентарем и отображается в рейтингах.
            </span>
          </div>

          {/* Avatar Selection */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
              Выбери аватар выжившего
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {AVATAR_OPTIONS.map((av) => {
                const isSelected = selectedAvatar === av.id;
                return (
                  <button
                    type="button"
                    key={av.id}
                    onClick={() => {
                      setSelectedAvatar(av.id);
                      soundManager.play('item_select');
                    }}
                    className={`flex flex-col items-center p-3 rounded-xl border transition-all text-center relative ${
                      isSelected
                        ? 'bg-[#1E2535] border-[#E53935] shadow-[0_0_15px_rgba(229,57,53,0.35)]'
                        : 'bg-[#0E1118] border-[#222A3B] hover:border-zinc-500 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#E53935] flex items-center justify-center text-white">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                    <span className="text-2xl mb-1">{av.icon}</span>
                    <span className="text-xs font-bold text-white font-rajdhani">{av.label}</span>
                    <span className="text-[9px] text-zinc-400 mt-0.5 leading-tight">{av.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-lg bg-red-950/50 border border-red-500/50 text-red-300 text-xs text-center font-bold">
              {errorMsg}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 mt-2">
            <button
              type="submit"
              onClick={() => handleSubmit()}
              className="w-full flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#4CAF50] to-[#388E3C] hover:from-[#43A047] hover:to-[#2E7D32] text-white font-rajdhani font-black text-base uppercase tracking-wider shadow-[0_6px_25px_rgba(76,175,80,0.45)] active:scale-[0.99] transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>ВОЙТИ НА СЕРВЕР (+10.00 ⚙️)</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform stroke-[2.5]" />
            </button>

            <button
              type="button"
              onClick={handleSkip}
              className="w-full sm:w-auto py-3.5 px-4 rounded-xl bg-[#171B24] hover:bg-[#202532] text-zinc-400 hover:text-white border border-[#2B3448] font-rajdhani font-bold text-xs uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap"
            >
              Пропустить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
