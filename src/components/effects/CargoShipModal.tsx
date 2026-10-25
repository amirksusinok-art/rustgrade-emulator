import React, { useState, useEffect, useRef } from 'react';
import { CargoReward } from '../../hooks/useCargoShipTimer';
import { soundManager } from '../../utils/soundManager';
import { ScrapIcon } from '../common/ScrapIcon';
import {
  Ship,
  Terminal,
  ShieldAlert,
  Lock,
  Unlock,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Flame,
  X,
  Volume2,
} from 'lucide-react';

interface CargoShipModalProps {
  isOpen: boolean;
  reward: CargoReward | null;
  onClose: () => void;
  onClaimToInventory: (reward: CargoReward) => void;
  onSendToUpgrader: (skinId: string, bonusScrap: number) => void;
}

type ModalPhase = 'locked' | 'hacking' | 'opened';

const TERMINAL_LOGS = [
  'INITIALIZING COBALT EXPLOIT INJECTION...',
  'BYPASSING HARDWARE ROOT OF TRUST (TPM 2.0)...',
  'CRACKING 4096-BIT CRYPTO SECURITY KEY...',
  'OVERRIDING PNEUMATIC LOCKING VALVES...',
  'BROADCASTING DISTRESS BEACON TO ISLAND CLANS...',
  'SIGNAL INTERCEPTED BY HEAVY SCIENTISTS...',
  'NEUTRALIZING AUTOMATED TURRET SENSORS...',
  'DRAINING NITROGEN STABILIZER CHAMBER...',
  'DISABLING INTERNAL LOCKDOWN CLAMPS...',
  'ACCESS GRANTED! RELEASING HYDRAULIC PRESSURE...',
];

export const CargoShipModal: React.FC<CargoShipModalProps> = ({
  isOpen,
  reward,
  onClose,
  onClaimToInventory,
  onSendToUpgrader,
}) => {
  const [phase, setPhase] = useState<ModalPhase>('locked');
  const [hackSeconds, setHackSeconds] = useState<number>(15);
  const [logIndex, setLogIndex] = useState<number>(0);
  const audioStartedRef = useRef<boolean>(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setPhase('locked');
      setHackSeconds(15);
      setLogIndex(0);
      audioStartedRef.current = false;
    } else {
      soundManager.stop('crack_system');
      soundManager.stop('pipi');
    }
  }, [isOpen]);

  // Hacking countdown loop
  useEffect(() => {
    if (phase !== 'hacking') return;

    if (!audioStartedRef.current) {
      audioStartedRef.current = true;
      soundManager.play('crack_system');
    }

    const interval = setInterval(() => {
      setHackSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleFinishHacking();
          return 0;
        }

        // Trigger pipi sound on final 3 seconds
        if (prev === 4) {
          soundManager.play('pipi');
        }

        return prev - 1;
      });

      setLogIndex((prev) => (prev + 1) % TERMINAL_LOGS.length);
    }, 1000);

    return () => clearInterval(interval);
  }, [phase]);

  const handleStartHack = () => {
    setPhase('hacking');
    setHackSeconds(15);
  };

  const handleFinishHacking = () => {
    soundManager.stop('crack_system');
    soundManager.stop('pipi');
    soundManager.play('cargo_open');
    setPhase('opened');
  };

  if (!isOpen || !reward) return null;

  const progressPercent = Math.min(100, Math.round(((15 - hackSeconds) / 15) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#161B26] via-[#10131B] to-[#0A0D12] border-2 border-[#2C3549] rounded-2xl shadow-[0_20px_70px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col">
        {/* Metal corner rivets */}
        <div className="absolute top-2.5 left-2.5 w-2 h-2 rounded-full bg-zinc-500 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] pointer-events-none" />
        <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-zinc-500 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] pointer-events-none" />
        <div className="absolute bottom-2.5 left-2.5 w-2 h-2 rounded-full bg-zinc-500 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] pointer-events-none" />
        <div className="absolute bottom-2.5 right-2.5 w-2 h-2 rounded-full bg-zinc-500 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] pointer-events-none" />

        {/* Tactical Header */}
        <div className="bg-[#121620] border-b border-[#252D3D] px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400">
              <Ship className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="font-rajdhani font-black text-sm text-white tracking-wider uppercase">
                Грузовой Корабль Cobalt • Верхняя Палуба
              </span>
              <span className="font-mono text-[10px] text-zinc-400">
                LOCKED CRATE [CH47-CRATE-09] • СЕКТОР [E-8]
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#181D28] hover:bg-[#222A3A] text-zinc-400 hover:text-white transition-colors border border-[#2B3448]"
            title="Покинуть корабль"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Phase 1: Locked Hackable Crate */}
        {phase === 'locked' && (
          <div className="p-6 sm:p-8 flex flex-col items-center text-center space-y-6">
            {/* Visual Army Locked Crate */}
            <div className="relative group">
              <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-2xl bg-gradient-to-br from-[#2D3A24] via-[#1E2618] to-[#12170E] border-4 border-[#4E623A] shadow-[0_0_40px_rgba(78,98,58,0.4)] flex flex-col items-center justify-between p-4 relative overflow-hidden">
                {/* Warning Hazard Stripes */}
                <div className="absolute top-0 inset-x-0 h-2 bg-[repeating-linear-gradient(45deg,#F59E0B,#F59E0B_10px,#000_10px,#000_20px)] opacity-80" />

                {/* Laptop on crate */}
                <div className="mt-2 w-full bg-[#0B0F14] border border-[#2A3B24] rounded-lg p-2.5 flex flex-col items-center">
                  <div className="w-full flex items-center justify-between mb-1 text-[8px] font-mono text-emerald-400">
                    <span>COBALT OS v10.4</span>
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  </div>
                  <Lock className="w-8 h-8 text-red-500 stroke-[2.5] my-1 animate-pulse" />
                  <span className="text-[10px] font-mono font-black text-red-400 tracking-wider">
                    LOCKED • 00:15:00
                  </span>
                </div>

                {/* Military stencil */}
                <div className="w-full text-center font-mono text-[9px] text-[#A3B88A] font-bold tracking-widest uppercase border-t border-[#354327] pt-1">
                  PROPERTY OF COBALT
                </div>
              </div>
            </div>

            <div className="space-y-2 max-w-lg">
              <h3 className="font-rajdhani font-black text-2xl sm:text-3xl text-white tracking-wide uppercase">
                Запертый ящик учёных Кобальта
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300 font-sans leading-relaxed">
                Ящик защищен криптографическим протоколом. Активируй дешифратор ноутбука: взлом займёт <strong className="text-amber-400 font-mono">15 секунд</strong> со звуковым сопровождением. После вскрытия ты заберёшь армейский ствол и крупный запас скрапа!
              </p>
            </div>

            {/* Start Hack Action Button */}
            <button
              onClick={handleStartHack}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-rajdhani font-black text-base uppercase tracking-wider shadow-[0_0_30px_rgba(16,185,129,0.5)] active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer group"
            >
              <Terminal className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span>АКТИВИРОВАТЬ ВЗЛОМ НОУТБУКА (15 СЕК)</span>
            </button>
          </div>
        )}

        {/* Phase 2: Hacking In Progress */}
        {phase === 'hacking' && (
          <div className="p-6 sm:p-8 flex flex-col items-center text-center space-y-6">
            {/* Countdown Badge & Circular Pulse */}
            <div className="relative flex items-center justify-center">
              <div
                className={`w-32 h-32 sm:w-36 sm:h-36 rounded-full border-4 flex flex-col items-center justify-center transition-all ${
                  hackSeconds <= 3
                    ? 'border-red-500 bg-red-950/40 shadow-[0_0_35px_rgba(239,68,68,0.7)] animate-ping-short'
                    : 'border-amber-500 bg-amber-950/30 shadow-[0_0_30px_rgba(245,158,11,0.4)]'
                }`}
              >
                <span className="text-[10px] text-zinc-400 font-mono font-bold uppercase tracking-wider">
                  ВЗЛОМ СИСТЕМЫ
                </span>
                <span className="font-rajdhani font-black text-4xl sm:text-5xl text-white tracking-widest my-0.5">
                  00:{hackSeconds < 10 ? `0${hackSeconds}` : hackSeconds}
                </span>
                <span
                  className={`text-[10px] font-mono font-black ${
                    hackSeconds <= 3 ? 'text-red-400 animate-pulse' : 'text-amber-400'
                  }`}
                >
                  {hackSeconds <= 3 ? 'ТРЕВОГА (PI-PI-PI)!' : `${progressPercent}% ЗАВЕРШЕНО`}
                </span>
              </div>
            </div>

            {/* Terminal Hacker Log Box */}
            <div className="w-full bg-[#0A0D12] border border-[#252E40] rounded-xl p-3.5 text-left font-mono text-xs shadow-inner">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#1C2331] text-[10px] text-zinc-500">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <Terminal className="w-3.5 h-3.5" />
                  DECRYPTION CONSOLE • SSH ROOT
                </span>
                <span className="text-amber-400">AUDIO ACTIVE 🔊</span>
              </div>
              <div className="space-y-1 text-emerald-400/90 text-[11px] h-16 overflow-hidden flex flex-col justify-end">
                <div className="text-zinc-600 truncate">{TERMINAL_LOGS[(logIndex + 1) % TERMINAL_LOGS.length]}</div>
                <div className="text-emerald-500/70 truncate">{TERMINAL_LOGS[(logIndex + 2) % TERMINAL_LOGS.length]}</div>
                <div className="text-emerald-300 font-bold flex items-center gap-1.5 truncate">
                  <span className="animate-pulse">❯</span>
                  <span>{TERMINAL_LOGS[logIndex]}</span>
                </div>
              </div>
            </div>

            {/* Warning text */}
            <div className="flex items-center gap-2 text-xs text-amber-300/90 font-mono">
              <ShieldAlert className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
              <span>Внимание: сигнал взлома виден всем кланам острова. Удерживайте позицию!</span>
            </div>
          </div>
        )}

        {/* Phase 3: Opened & Loot Revealed */}
        {phase === 'opened' && (
          <div className="p-6 sm:p-8 flex flex-col items-center text-center space-y-6 animate-fade-in">
            {/* Header Success */}
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 font-rajdhani font-black text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                <CheckCircle2 className="w-4 h-4" />
                <span>КОНТЕЙНЕР УСПЕШНО ВЗЛОМАН!</span>
              </div>
              <h3 className="font-rajdhani font-black text-2xl sm:text-3xl text-white tracking-wide uppercase">
                Трофеи с палубы Cargo Ship
              </h3>
            </div>

            {/* Reward Grid: Scrap Slot + Weapon Skin Slot */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              {/* Slot 1: Scrap Reward */}
              <div className="p-4 rounded-xl bg-gradient-to-b from-[#1C2433] to-[#121622] border-2 border-emerald-500/50 flex flex-col items-center justify-between gap-3 shadow-[0_0_25px_rgba(16,185,129,0.2)]">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 font-mono">
                  СЛОТ #1 • МЕТАЛЛОЛОМ УЧЁНЫХ
                </span>
                <div className="w-16 h-16 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-3xl">
                  ⚙️
                </div>
                <div className="flex items-center gap-1.5 font-rajdhani font-black text-2xl text-emerald-400">
                  <ScrapIcon size="md" />
                  <span>+{reward.scrap.toFixed(2)}</span>
                </div>
                <span className="text-[10px] text-zinc-400 font-sans">
                  Моментально зачисляется на твой баланс
                </span>
              </div>

              {/* Slot 2: Military Skin Reward */}
              <div className="p-4 rounded-xl bg-gradient-to-b from-[#251E33] to-[#161220] border-2 border-purple-500/50 flex flex-col items-center justify-between gap-3 shadow-[0_0_25px_rgba(168,85,247,0.2)]">
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-400 font-mono">
                  СЛОТ #2 • ВОЕННОЕ ОРУЖИЕ
                </span>
                <img
                  src={`/images/skins/${reward.skin.localFile}`}
                  alt={reward.skin.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = reward.skin.iconUrl;
                  }}
                  className="w-20 h-20 object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)] hover:scale-105 transition-transform"
                />
                <div className="flex flex-col items-center">
                  <span className="text-xs font-black text-white font-rajdhani uppercase tracking-wide">
                    {reward.skin.name}
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-400">
                    {reward.skin.price.toFixed(2)} ⚙️
                  </span>
                </div>
                <span className="text-[10px] text-purple-300/80 font-sans">
                  Редкий армейский скин с корабля
                </span>
              </div>
            </div>

            {/* Action Buttons: To Inventory VS To Upgrader */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full pt-2">
              <button
                onClick={() => {
                  onClaimToInventory(reward);
                  onClose();
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-[#1F2636] hover:bg-[#2B354C] text-white font-rajdhani font-black text-sm uppercase tracking-wider border border-[#35435E] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>ЗАБРАТЬ В ИНВЕНТАРЬ</span>
              </button>

              <button
                onClick={() => {
                  onSendToUpgrader(reward.skin.id, reward.scrap);
                  onClose();
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#E53935] to-[#D32F2F] hover:from-[#EF5350] hover:to-[#E53935] text-white font-rajdhani font-black text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(229,57,53,0.5)] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer group"
              >
                <Flame className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
                <span>ОТПРАВИТЬ СТВОЛ В АПГРЕЙДЕР</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
