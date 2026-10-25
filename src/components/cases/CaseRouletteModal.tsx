import React, { useState, useEffect, useRef, useMemo } from 'react';
import { CaseDefinition, SkinDefinition, InventoryItem } from '../../types';
import { SKINS_MAP } from '../../data/skinsData';
import { soundManager } from '../../utils/soundManager';
import { ScrapIcon } from '../common/ScrapIcon';
import { adminManager } from '../../utils/adminManager';
import { X, Zap, RotateCcw, CheckCircle, Package, ArrowUp, ArrowDown, ChevronRight, Award, Trash2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CaseRouletteModalProps {
  caseDef: CaseDefinition | null;
  isOpen: boolean;
  onClose: () => void;
  userBalance: number;
  userInventory: InventoryItem[];
  onDeductScrap: (amount: number) => boolean;
  onAddScrap: (amount: number) => void;
  onAddSkin: (skinId: string) => string;
  onSendToUpgrader: (skinId: string) => void;
  onRecordCaseOpened?: () => void;
}

export const CaseRouletteModal: React.FC<CaseRouletteModalProps> = ({
  caseDef,
  isOpen,
  onClose,
  userBalance,
  userInventory,
  onDeductScrap,
  onAddScrap,
  onAddSkin,
  onSendToUpgrader,
  onRecordCaseOpened,
}) => {
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [turboMode, setTurboMode] = useState<boolean>(false);
  const [wonSkin, setWonSkin] = useState<SkinDefinition | null>(null);
  const [rollStrip, setRollStrip] = useState<SkinDefinition[]>([]);
  const [stripOffset, setStripOffset] = useState<number>(0);
  const [transitionDuration, setTransitionDuration] = useState<number>(0);

  // Free crate timer check
  const [reliefCooldownLeft, setReliefCooldownLeft] = useState<number>(0);

  const stripRef = useRef<HTMLDivElement>(null);
  const cardWidth = 140; // 132px width + 8px gap
  const winnerIndex = 36; // target index in the strip of 45 items

  // Check relief cooldown
  useEffect(() => {
    if (caseDef?.isFree) {
      try {
        const last = localStorage.getItem('rustgrade_last_relief_crate_time');
        if (last) {
          const elapsed = (Date.now() - parseInt(last, 10)) / 1000;
          const fourHours = 4 * 3600;
          if (elapsed < fourHours) {
            setReliefCooldownLeft(Math.ceil(fourHours - elapsed));
          } else {
            setReliefCooldownLeft(0);
          }
        }
      } catch {
        setReliefCooldownLeft(0);
      }
    }
  }, [caseDef, isOpen]);

  // Reset state on modal open
  useEffect(() => {
    if (isOpen && caseDef) {
      setIsRolling(false);
      setWonSkin(null);
      setStripOffset(0);
      setTransitionDuration(0);
      generatePreviewStrip();
    }
  }, [isOpen, caseDef]);

  // Generate initial static preview strip
  const generatePreviewStrip = () => {
    if (!caseDef) return;
    const pool = caseDef.items.map((i) => SKINS_MAP[i.skinId]).filter(Boolean);
    const strip: SkinDefinition[] = [];
    for (let i = 0; i < 45; i++) {
      strip.push(pool[Math.floor(Math.random() * pool.length)]);
    }
    setRollStrip(strip);
  };

  // Pick winning skin by weights (or admin rigging)
  const pickWinningSkin = (): SkinDefinition => {
    if (!caseDef) return SKINS_MAP['hatchet_from_hell'];

    // 1. Check Admin 100% Jackpot Rigging
    const isRigged = adminManager.consumeRiggedCaseJackpot();
    if (isRigged) {
      const sortedByPrice = [...caseDef.items]
        .map((i) => SKINS_MAP[i.skinId])
        .filter(Boolean)
        .sort((a, b) => b.price - a.price);
      return sortedByPrice[0];
    }

    // 2. Normal weighted roll
    const totalWeight = caseDef.items.reduce((s, i) => s + i.weight, 0);
    let randomWeight = Math.random() * totalWeight;

    for (const item of caseDef.items) {
      if (randomWeight < item.weight) {
        return SKINS_MAP[item.skinId] || SKINS_MAP['hatchet_from_hell'];
      }
      randomWeight -= item.weight;
    }
    return SKINS_MAP[caseDef.items[0].skinId];
  };

  // Start Open Case
  const handleOpenCase = () => {
    if (!caseDef || isRolling) return;

    // Validation
    if (caseDef.isFree) {
      if (userBalance >= 2.0) {
        soundManager.play('codelock_error');
        alert('Ящик новичка доступен только когда баланс меньше 2.00 ⚙️!');
        return;
      }
      if (userInventory.length > 0) {
        soundManager.play('codelock_error');
        alert('Ящик новичка доступен только при пустом инвентаре!');
        return;
      }
      if (reliefCooldownLeft > 0) {
        soundManager.play('codelock_error');
        const mins = Math.ceil(reliefCooldownLeft / 60);
        alert(`Перезарядка ящика помощи: подождите ${mins} мин.`);
        return;
      }
      localStorage.setItem('rustgrade_last_relief_crate_time', Date.now().toString());
    } else {
      if (userBalance < caseDef.price) {
        soundManager.play('codelock_error');
        return;
      }
      onDeductScrap(caseDef.price);
    }

    setIsRolling(true);
    setWonSkin(null);
    soundManager.play('fuse_burn');
    if (onRecordCaseOpened) onRecordCaseOpened();

    // Pick winner
    const winningSkin = pickWinningSkin();

    // Build rolling strip with winner at index 36
    const pool = caseDef.items.map((i) => SKINS_MAP[i.skinId]).filter(Boolean);
    const newStrip: SkinDefinition[] = [];
    for (let i = 0; i < 45; i++) {
      if (i === winnerIndex) {
        newStrip.push(winningSkin);
      } else {
        newStrip.push(pool[Math.floor(Math.random() * pool.length)]);
      }
    }
    setRollStrip(newStrip);

    // Calculate target offset to align winner with center needle
    const viewportWidth = stripRef.current ? stripRef.current.clientWidth : 650;
    const centerPoint = viewportWidth / 2;
    // Jitter: slight random offset within [-35px, +35px] inside the 140px card
    const jitter = (Math.random() - 0.5) * 60;
    const targetOffset = winnerIndex * cardWidth + cardWidth / 2 - centerPoint + jitter;

    const durationSec = turboMode ? 0.35 : 4.5;
    const durationMs = durationSec * 1000;

    // Reset offset first without transition
    setTransitionDuration(0);
    setStripOffset(0);

    requestAnimationFrame(() => {
      // Start rolling animation
      setTransitionDuration(durationSec);
      setStripOffset(targetOffset);
      soundManager.startWheelTicks(durationMs);
    });

    // Complete roll
    setTimeout(() => {
      soundManager.stopWheelTicks();
      soundManager.play('win');
      setWonSkin(winningSkin);
      setIsRolling(false);

      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#FF9800', '#4CAF50', '#2196F3', '#FFFFFF'],
        });
      } catch {
        // fallback
      }
    }, durationMs + 100);
  };

  // Actions after win
  const handleKeepItem = () => {
    if (!wonSkin) return;
    onAddSkin(wonSkin.id);
    soundManager.play('item_select');
    onClose();
  };

  const handleSellInstantly = () => {
    if (!wonSkin) return;
    onAddScrap(wonSkin.price);
    soundManager.play('scrap_sell');
    onClose();
  };

  const handleSendToUpgraderClick = () => {
    if (!wonSkin) return;
    onSendToUpgrader(wonSkin.id);
    onClose();
  };

  if (!isOpen || !caseDef) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-4xl bg-[#0E1015] border-2 border-[#232731] rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden relative">
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#151821] border-b border-[#232731]">
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center p-0.5 overflow-hidden shadow-inner"
              style={{ backgroundColor: `${caseDef.color}20`, border: `1px solid ${caseDef.color}60` }}
            >
              <img src={caseDef.image} alt={caseDef.name} className="w-full h-full object-contain drop-shadow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-rajdhani font-black text-lg text-white tracking-wider">
                  {caseDef.name}
                </span>
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider"
                  style={{ backgroundColor: `${caseDef.color}20`, color: caseDef.color, border: `1px solid ${caseDef.color}50` }}
                >
                  {caseDef.badge}
                </span>
              </div>
              <span className="text-[11px] text-zinc-400 font-mono">{caseDef.subtitle}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Turbo Mode Toggle */}
            <button
              onClick={() => setTurboMode(!turboMode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                turboMode
                  ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40 shadow-[0_0_12px_rgba(234,179,8,0.3)]'
                  : 'bg-[#1E222B] text-zinc-400 border-zinc-700 hover:text-white'
              }`}
              title="Турбо открытие (без ожидания прокрутки)"
            >
              <Zap className={`w-3.5 h-3.5 ${turboMode ? 'fill-current' : ''}`} />
              <span>ТУРБО</span>
            </button>

            <button
              onClick={onClose}
              disabled={isRolling}
              className="p-1.5 rounded-lg bg-[#1E222B] hover:bg-[#2A303C] text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* 1. HORIZONTAL ROULETTE STRIP */}
          <div className="relative w-full bg-[#12141A] border-2 border-[#232731] rounded-2xl p-2 overflow-hidden shadow-inner">
            {/* Center Pointer Needles */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex flex-col items-center">
              <div className="w-0 h-0 border-l-[9px] border-l-transparent border-r-[9px] border-r-transparent border-t-[14px] border-t-[#E53935] filter drop-shadow-[0_2px_8px_rgba(229,57,53,0.9)]" />
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex flex-col items-center">
              <div className="w-0 h-0 border-l-[9px] border-l-transparent border-r-[9px] border-r-transparent border-b-[14px] border-b-[#E53935] filter drop-shadow-[0_-2px_8px_rgba(229,57,53,0.9)]" />
            </div>

            {/* Center Vertical Red Indicator Line */}
            <div className="absolute top-2 bottom-2 left-1/2 -translate-x-1/2 w-0.5 bg-gradient-to-b from-[#E53935] via-[#E53935]/40 to-[#E53935] z-10 pointer-events-none shadow-[0_0_10px_rgba(229,57,53,0.8)]" />

            {/* Left/Right Vignette Shadows */}
            <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#12141A] via-[#12141A]/80 to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#12141A] via-[#12141A]/80 to-transparent z-10 pointer-events-none" />

            {/* Moving Strip Track */}
            <div ref={stripRef} className="overflow-hidden py-3">
              <div
                className="flex items-center gap-2 will-change-transform"
                style={{
                  transform: `translateX(-${stripOffset}px)`,
                  transition: transitionDuration > 0
                    ? `transform ${transitionDuration}s cubic-bezier(0.12, 0.8, 0.32, 1)`
                    : 'none',
                }}
              >
                {rollStrip.map((skin, idx) => {
                  if (!skin) return null;
                  return (
                    <div
                      key={idx}
                      className="w-[132px] h-[155px] flex-shrink-0 bg-[#171A23] border border-[#232731] rounded-xl p-2 flex flex-col justify-between items-center text-center relative group"
                    >
                      <span className="text-[10px] font-bold text-zinc-300 truncate w-full">
                        {skin.name}
                      </span>

                      <img
                        src={`/images/skins/${skin.localFile}`}
                        alt={skin.name}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = skin.iconUrl;
                        }}
                        className="w-16 h-16 object-contain my-1 drop-shadow"
                      />

                      <div className="flex items-center gap-1 font-rajdhani font-black text-xs text-[#FFD54F]">
                        <ScrapIcon size="xs" />
                        <span>{skin.price.toFixed(2)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 2. WINNER RESULT OVERLAY / OR OPEN BUTTON */}
          {wonSkin ? (
            /* VICTORY SCREEN */
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#1E2E1F] via-[#142015] to-[#0D150E] border-2 border-[#4CAF50] shadow-[0_0_35px_rgba(76,175,80,0.35)] flex flex-col sm:flex-row items-center justify-between gap-4 animate-scale-up">
              <div className="flex items-center gap-4">
                <img
                  src={`/images/skins/${wonSkin.localFile}`}
                  alt={wonSkin.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = wonSkin.iconUrl;
                  }}
                  className="w-20 h-20 object-contain drop-shadow-[0_4px_16px_rgba(76,175,80,0.5)] animate-bounce"
                />
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-success-green font-black uppercase tracking-wider mb-1">
                    <CheckCircle className="w-4 h-4" />
                    <span>ВЫПАЛ ПРЕДМЕТ!</span>
                  </div>
                  <h3 className="font-rajdhani font-black text-xl text-white tracking-wide">
                    {wonSkin.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-sm font-rajdhani font-black text-[#FFD54F] mt-0.5">
                    <span>Стоимость:</span>
                    <ScrapIcon size="sm" />
                    <span>{wonSkin.price.toFixed(2)} Scrap</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleKeepItem}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-[#4CAF50] hover:bg-[#43A047] text-white font-rajdhani font-black text-xs uppercase tracking-wider shadow-md transition-all active:scale-95"
                >
                  В инвентарь
                </button>

                <button
                  onClick={handleSellInstantly}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#1E222B] hover:bg-[#2B313E] text-zinc-200 border border-zinc-700 font-rajdhani font-black text-xs uppercase tracking-wider transition-all"
                >
                  <span>Продать (+{wonSkin.price.toFixed(2)})</span>
                  <ScrapIcon size="xs" />
                </button>

                <button
                  onClick={handleSendToUpgraderClick}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-[#E53935] hover:bg-[#D32F2F] text-white font-rajdhani font-black text-xs uppercase tracking-wider shadow transition-all active:scale-95"
                  title="Отправить в Upgrader для умножения!"
                >
                  В Апгрейдер
                </button>

                <button
                  onClick={handleOpenCase}
                  disabled={caseDef.price > userBalance && !caseDef.isFree}
                  className="p-2.5 rounded-xl bg-[#1E222B] hover:bg-[#2B313E] text-zinc-300 border border-zinc-700"
                  title="Открыть ещё раз"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* OPEN CASE ACTION BAR */
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-[#151821] border border-[#232731]">
              <div className="flex items-center gap-3">
                <span className="text-xs text-zinc-400">Стоимость открытия:</span>
                {caseDef.isFree ? (
                  <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 font-rajdhani font-black text-sm uppercase">
                    БЕСПЛАТНО
                  </span>
                ) : (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#0D0F12] border border-[#232731]">
                    <ScrapIcon size="sm" />
                    <span className="font-rajdhani font-black text-base text-white">
                      {caseDef.price.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={handleOpenCase}
                disabled={isRolling || (caseDef.price > userBalance && !caseDef.isFree)}
                className={`
                  w-full sm:w-auto px-8 py-3.5 rounded-xl font-rajdhani font-black text-base uppercase tracking-widest transition-all
                  ${
                    isRolling
                      ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                      : caseDef.price > userBalance && !caseDef.isFree
                      ? 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed'
                      : 'bg-[#E53935] hover:bg-[#D32F2F] text-white shadow-[0_4px_20px_rgba(229,57,53,0.5)] active:scale-95 cursor-pointer'
                  }
                `}
              >
                {isRolling
                  ? 'ОТКРЫТИЕ...'
                  : caseDef.price > userBalance && !caseDef.isFree
                  ? 'НЕДОСТАТОЧНО SCRAP'
                  : `ОТКРЫТЬ ЯЩИК ${caseDef.isFree ? 'БЕСПЛАТНО' : `ЗА ${caseDef.price.toFixed(2)} ⚙️`}`}
              </button>
            </div>
          )}

          {/* 3. CASE CONTENTS GRID WITH DROP CHANCES */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-zinc-400 uppercase tracking-wider font-bold">
                Содержимое ящика ({caseDef.items.length} предметов)
              </span>
              <span className="text-[11px] text-zinc-500 font-mono">
                Математический возврат: RTP ~93%
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
              {caseDef.items.map((item) => {
                const skin = SKINS_MAP[item.skinId];
                if (!skin) return null;
                const totalWeight = caseDef.items.reduce((s, i) => s + i.weight, 0);
                const chance = ((item.weight / totalWeight) * 100).toFixed(1);

                return (
                  <div
                    key={skin.id}
                    className="p-2.5 rounded-xl bg-[#151821] border border-[#232731] hover:border-zinc-500 flex flex-col justify-between items-center text-center transition-all group"
                  >
                    <span className="text-[10px] text-zinc-400 font-mono mb-1">
                      {chance}% шанс
                    </span>

                    <img
                      src={`/images/skins/${skin.localFile}`}
                      alt={skin.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = skin.iconUrl;
                      }}
                      className="w-16 h-16 object-contain my-1 group-hover:scale-105 transition-transform"
                    />

                    <span className="text-[11px] font-bold text-white truncate w-full" title={skin.name}>
                      {skin.name}
                    </span>

                    <div className="flex items-center gap-1 font-rajdhani font-black text-xs text-[#FFD54F] mt-1">
                      <ScrapIcon size="xs" />
                      <span>{skin.price.toFixed(2)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
