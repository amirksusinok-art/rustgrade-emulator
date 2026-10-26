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
  Flame,
  X,
  Volume2,
  Crown,
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
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-gradient-to-b from-[#161B26] via-[#10131B] to-[#0A0D12] border-2 border-[#2C3549] rounded-2xl shadow-[0_20px_70px_rgba(0,0,0,0.95)] flex flex-col">
        {/* Metal corner rivets */}
        <div className="absolute top-2.5 left-2.5 w-2 h-2 rounded-full bg-zinc-500 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] pointer-events-none" />
        <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-zinc-500 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] pointer-events-none" />
        <div className="absolute bottom-2.5 left-2.5 w-2 h-2 rounded-full bg-zinc-500 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] pointer-events-none" />
        <div className="absolute bottom-2.5 right-2.5 w-2 h-2 rounded-full bg-zinc-500 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] pointer-events-none" />

        {/* Tactical Header */}
        <div className="sticky top-0 z-20 bg-[#121620]/95 backdrop-blur-md border-b border-[#252D3D] px-4 sm:px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 shrink-0">
              <Ship className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="font-rajdhani font-black text-sm text-white tracking-wider uppercase">
                Грузовой Корабль Cobalt • Верхняя Палуба
              </span>
              <span className="font-mono text-[10px] text-zinc-400">
                HACKABLE CRATE [CH47-CRATE-09] • СЕКТОР [E-8]
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#181D28] hover:bg-[#222A3A] text-zinc-400 hover:text-white transition-colors border border-[#2B3448] cursor-pointer"
            title="Покинуть корабль"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ========================================================================= */}
        {/* PHASES 1 & 2: The Rust Crate + Laptop on top (Locked or Hacking)         */}
        {/* ========================================================================= */}
        {(phase === 'locked' || phase === 'hacking') && (
          <div className="p-4 sm:p-6 flex flex-col items-center text-center space-y-4">
            
            {/* Unified Crate + Toughbook Laptop Container */}
            <div className="relative w-full max-w-md flex flex-col items-center">
              
              {/* --- TOUGHBOOK LAPTOP ON TOP OF CRATE --- */}
              <div className="relative z-10 w-[90%] sm:w-[85%] bg-[#121820] border-2 border-[#2F3C52] rounded-t-xl shadow-[0_-5px_25px_rgba(0,0,0,0.8)] overflow-hidden">
                {/* Laptop Top Bezel with Webcam and Status LED */}
                <div className="bg-[#18202C] px-3 py-1.5 border-b border-[#263244] flex items-center justify-between text-[9px] font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-zinc-600 border border-zinc-400 inline-block" />
                    <span className="text-zinc-400 font-bold uppercase tracking-wider">
                      PANASONIC TOUGHBOOK • COBALT OS
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {phase === 'hacking' ? (
                      <span className="flex items-center gap-1 text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        <span className="font-bold">HACKING</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        <span className="font-bold">SECURE</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Laptop Active Display Screen */}
                <div
                  className={`p-2 sm:p-3 text-left font-mono transition-all duration-300 ${
                    phase === 'hacking' && hackSeconds <= 3
                      ? 'bg-red-950/60 border-y-2 border-red-500 shadow-[inset_0_0_20px_rgba(239,68,68,0.5)]'
                      : phase === 'hacking'
                      ? 'bg-[#080E14] border-y border-emerald-500/40 shadow-[inset_0_0_20px_rgba(16,185,129,0.2)]'
                      : 'bg-[#0A0D12] border-y border-[#1E2636]'
                  }`}
                >
                  {phase === 'locked' ? (
                    // LOCKED SCREEN
                    <div className="flex flex-col items-center justify-center py-1 text-center space-y-1">
                      <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/40 flex items-center justify-center text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                        <Lock className="w-4 h-4 stroke-[2.5] animate-pulse" />
                      </div>
                      <span className="text-red-400 font-black text-xs sm:text-sm tracking-widest font-mono">
                        ACCESS DENIED • LOCKED
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        Защитный протокол: <strong className="text-amber-400">00:15:00</strong>
                      </span>
                    </div>
                  ) : (
                    // ACTIVE HACKING SCREEN (PHOTO 4 DIRECTLY ON LAPTOP)
                    <div className="flex flex-col space-y-2.5">
                      {/* Top Timer & Progress in screen */}
                      <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800">
                        <div>
                          <div className="text-[9px] text-zinc-400 uppercase tracking-widest">
                            {hackSeconds <= 3 ? '⚠️ КРИТИЧЕСКАЯ ТРЕВОГА' : 'ВЗЛОМ СИСТЕМЫ COBALT'}
                          </div>
                          <div
                            className={`font-rajdhani font-black text-2xl sm:text-3xl tracking-widest leading-none ${
                              hackSeconds <= 3 ? 'text-red-400 animate-pulse' : 'text-amber-400'
                            }`}
                          >
                            00:{hackSeconds < 10 ? `0${hackSeconds}` : hackSeconds}
                          </div>
                        </div>

                        <div className="text-right">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                              hackSeconds <= 3
                                ? 'bg-red-500/30 text-red-300 border border-red-500 animate-ping-short'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            }`}
                          >
                            {progressPercent}% ЗАВЕРШЕНО
                          </span>
                          <div className="text-[9px] text-zinc-400 mt-1 flex items-center gap-1 justify-end">
                            <Volume2 className="w-3 h-3 text-amber-400" />
                            <span>AUDIO SYNC 🔊</span>
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar inside laptop screen */}
                      <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-700">
                        <div
                          className={`h-full transition-all duration-500 ${
                            hackSeconds <= 3
                              ? 'bg-gradient-to-r from-red-600 to-red-400 shadow-[0_0_10px_rgba(239,68,68,0.8)]'
                              : 'bg-gradient-to-r from-amber-500 via-emerald-400 to-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]'
                          }`}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>

                      {/* Real-time terminal log scrolling */}
                      <div className="bg-[#05070A] rounded p-2 text-[10px] space-y-0.5 h-14 overflow-hidden flex flex-col justify-end border border-zinc-900">
                        <div className="text-zinc-600 truncate text-[9px]">
                          {TERMINAL_LOGS[(logIndex + 1) % TERMINAL_LOGS.length]}
                        </div>
                        <div className="text-emerald-500/70 truncate text-[9px]">
                          {TERMINAL_LOGS[(logIndex + 2) % TERMINAL_LOGS.length]}
                        </div>
                        <div className="text-emerald-300 font-bold flex items-center gap-1 truncate">
                          <span className="animate-pulse text-amber-400">❯</span>
                          <span>{TERMINAL_LOGS[logIndex]}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Laptop Keyboard & Trackpad base */}
                <div className="bg-[#12161E] px-3 py-1 border-t border-[#1F2736] flex items-center justify-between">
                  {/* Keyboard simulated stripes */}
                  <div className="flex gap-1">
                    <span className="w-3 h-1 rounded-sm bg-zinc-700" />
                    <span className="w-3 h-1 rounded-sm bg-zinc-700" />
                    <span className="w-5 h-1 rounded-sm bg-zinc-600" />
                    <span className="w-8 h-1 rounded-sm bg-zinc-700" />
                  </div>
                  {/* Warning Hazard Line */}
                  <div className="h-1.5 w-20 bg-[repeating-linear-gradient(45deg,#F59E0B,#F59E0B_6px,#000_6px,#000_12px)] opacity-70 rounded-xs" />
                  {/* Trackpad */}
                  <div className="w-7 h-2 rounded bg-zinc-800 border border-zinc-700" />
                </div>
              </div>

              {/* --- AUTHENTIC RUST SUPPLY CRATE (PHOTO 3) --- */}
              <div className="relative -mt-2 w-full max-w-[240px] sm:max-w-[270px] flex flex-col items-center">
                {/* Glow under crate during hack */}
                {phase === 'hacking' && (
                  <div className="absolute inset-0 bg-amber-500/15 blur-2xl rounded-full -z-10 animate-pulse" />
                )}

                <div className="relative rounded-xl overflow-hidden border border-[#3E4F32]/50 shadow-[0_10px_25px_rgba(0,0,0,0.85)] bg-[#10140D]">
                  <img
                    src="/images/crates/cargo_supply_crate.png"
                    alt="Authentic Rust Supply Drop Crate"
                    className="w-full h-28 sm:h-36 object-cover object-center drop-shadow-[0_10px_20px_rgba(0,0,0,0.9)]"
                  />
                  {/* Ambient dark gradient overlay to blend into maritime deck */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0E121A] via-transparent to-transparent opacity-80 pointer-events-none" />

                  {/* Stencil badge bottom */}
                  <div className="absolute bottom-1.5 inset-x-0 flex items-center justify-center">
                    <span className="px-2 py-0.2 rounded bg-black/70 border border-[#485C38] text-[8px] font-mono font-bold tracking-widest text-[#B5CD98] uppercase backdrop-blur-xs">
                      SUPPLIES • CH47 SECURE CONTAINER
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description & Status */}
            {phase === 'locked' ? (
              <div className="space-y-2.5 max-w-lg">
                <div className="space-y-0.5">
                  <h3 className="font-rajdhani font-black text-lg sm:text-xl text-white tracking-wide uppercase">
                    Запертый ящик учёных Кобальта
                  </h3>
                  <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                    Взлом ноутбука продлится <strong className="text-amber-400 font-mono">15 секунд</strong>. Внутри гарантирован металлолом <strong className="text-emerald-400 font-mono">50–100 ⚙️</strong> и армейский ствол с шансом 5% на редкий джекпот!
                  </p>
                </div>

                {/* Start Hack Action Button */}
                <button
                  onClick={handleStartHack}
                  className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-rajdhani font-black text-sm sm:text-base uppercase tracking-wider shadow-[0_0_25px_rgba(16,185,129,0.5)] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px] group"
                >
                  <Terminal className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  <span>АКТИВИРОВАТЬ ВЗЛОМ НОУТБУКА (15 СЕК)</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-amber-300/90 font-mono bg-amber-950/30 border border-amber-500/30 px-3.5 py-2 rounded-xl">
                <ShieldAlert className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
                <span>Внимание: сигнал дешифровки виден всем кланам острова. Удерживайте позицию!</span>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* PHASE 3: Container Opened & Loot Dropped                                 */}
        {/* ========================================================================= */}
        {phase === 'opened' && (
          <div className="p-4 sm:p-6 flex flex-col items-center text-center space-y-5 animate-fade-in">
            {/* Header Success & JackPot Alert */}
            <div className="space-y-1.5">
              {reward.isJackpot ? (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/30 to-yellow-500/30 border border-amber-400 text-amber-300 font-rajdhani font-black text-xs sm:text-sm uppercase tracking-widest shadow-[0_0_20px_rgba(245,158,11,0.6)] animate-pulse">
                  <Crown className="w-4 h-4 text-amber-300 fill-amber-300" />
                  <span>⭐ ЛЕГЕНДАРНЫЙ ДЖЕКПОТ (ШАНС 5%)! ⭐</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 font-rajdhani font-black text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>КОНТЕЙНЕР УСПЕШНО ВЗЛОМАН!</span>
                </div>
              )}
              <h3 className="font-rajdhani font-black text-2xl sm:text-3xl text-white tracking-wide uppercase">
                Трофеи с палубы Cargo Ship
              </h3>
            </div>

            {/* Reward Grid: Scrap Slot + Weapon Skin Slot */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              {/* Slot 1: Scrap Reward (50 - 100) */}
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

              {/* Slot 2: Military Skin or Legendary Jackpot */}
              <div
                className={`p-4 rounded-xl flex flex-col items-center justify-between gap-3 transition-all ${
                  reward.isJackpot
                    ? 'bg-gradient-to-b from-amber-950/40 via-[#261E16] to-[#16120E] border-2 border-amber-400 shadow-[0_0_35px_rgba(245,158,11,0.5)]'
                    : 'bg-gradient-to-b from-[#251E33] to-[#161220] border-2 border-purple-500/50 shadow-[0_0_25px_rgba(168,85,247,0.2)]'
                }`}
              >
                <span
                  className={`text-[10px] font-black uppercase tracking-wider font-mono flex items-center gap-1 ${
                    reward.isJackpot ? 'text-amber-400' : 'text-purple-400'
                  }`}
                >
                  {reward.isJackpot ? (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      СЛОТ #2 • РЕДКИЙ СУПЕР-КУШ
                    </>
                  ) : (
                    'СЛОТ #2 • ВОЕННЫЙ ТРОФЕЙ'
                  )}
                </span>

                <img
                  src={`/images/skins/${reward.skin.localFile}`}
                  alt={reward.skin.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = reward.skin.iconUrl;
                  }}
                  className={`w-24 h-24 object-contain transition-transform hover:scale-105 ${
                    reward.isJackpot
                      ? 'drop-shadow-[0_0_20px_rgba(245,158,11,0.8)]'
                      : 'drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)]'
                  }`}
                />

                <div className="flex flex-col items-center">
                  <span className="text-xs sm:text-sm font-black text-white font-rajdhani uppercase tracking-wide">
                    {reward.skin.name}
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-400">
                    {reward.skin.price.toFixed(2)} ⚙️
                  </span>
                </div>

                <span
                  className={`text-[10px] font-sans ${
                    reward.isJackpot ? 'text-amber-300 font-semibold' : 'text-purple-300/80'
                  }`}
                >
                  {reward.isJackpot ? '🔥 Легендарная добыча острова!' : 'Армейский скин с корабля'}
                </span>
              </div>
            </div>

            {/* Action Buttons: To Inventory VS To Upgrader */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full pt-1">
              <button
                onClick={() => {
                  onClaimToInventory(reward);
                  onClose();
                }}
                className="w-full py-3 px-4 rounded-xl bg-[#1F2636] hover:bg-[#2B354C] text-white font-rajdhani font-black text-sm uppercase tracking-wider border border-[#35435E] transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
              >
                <span>ЗАБРАТЬ В ИНВЕНТАРЬ</span>
              </button>

              <button
                onClick={() => {
                  onSendToUpgrader(reward.skin.id, reward.scrap);
                  onClose();
                }}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#E53935] to-[#D32F2F] hover:from-[#EF5350] hover:to-[#E53935] text-white font-rajdhani font-black text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(229,57,53,0.5)] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer group min-h-[44px]"
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
