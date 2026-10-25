import React, { useState, useMemo } from 'react';
import { InventoryItem, ItemRarity, SkinDefinition } from '../../types';
import { SKINS_DATA, SKINS_MAP } from '../../data/skinsData';
import { soundManager } from '../../utils/soundManager';
import { ScrapIcon } from '../common/ScrapIcon';
import { ItemCard } from '../inventory/ItemCard';
import { FlatElectricFurnace } from './FlatElectricFurnace';
import { Flame, Zap, RotateCcw, AlertTriangle, Sparkles, ChevronRight, X, TrendingUp, TrendingDown } from 'lucide-react';
import confetti from 'canvas-confetti';
import { adminManager } from '../../utils/adminManager';

interface FurnaceTradeUpProps {
  inventory: InventoryItem[];
  userBalance: number;
  onTradeUp: (removedInstanceIds: string[], gainedSkinId: string) => void;
  onBuySkin: (skinId: string) => void;
  onInspectSkin: (skinId: string) => void;
}

const RARITY_ORDER: ItemRarity[] = [
  'industrial',
  'mil-spec',
  'restricted',
  'classified',
  'master',
  'contraband',
];

const RARITY_NEXT: Record<ItemRarity, ItemRarity | null> = {
  industrial: 'mil-spec',
  'mil-spec': 'restricted',
  restricted: 'classified',
  classified: 'master',
  master: 'contraband',
  contraband: null, // max tier
};

const RARITY_LABELS: Record<ItemRarity, { name: string; color: string; border: string; bg: string }> = {
  industrial: { name: 'ШИРПОТРЕБ (СЕРЫЙ)', color: 'text-[#B0BEC5]', border: 'border-[#607D8B]', bg: 'bg-[#1C2028]' },
  'mil-spec': { name: 'АРМЕЙСКИЙ (ЗЕЛЁНЫЙ)', color: 'text-[#81C784]', border: 'border-[#43A047]', bg: 'bg-[#142A16]' },
  restricted: { name: 'ЗАПРЕЩЁННЫЙ (СИНИЙ)', color: 'text-[#64B5F6]', border: 'border-[#1E88E5]', bg: 'bg-[#122338]' },
  classified: { name: 'ЗАСЕКРЕЧЕННЫЙ (ФИОЛЕТОВЫЙ)', color: 'text-[#CE93D8]', border: 'border-[#8E24AA]', bg: 'bg-[#291338]' },
  master: { name: 'ТАЙНЫЙ (КРАСНЫЙ)', color: 'text-[#EF5350]', border: 'border-[#E53935]', bg: 'bg-[#331315]' },
  contraband: { name: 'КОНТРАБАНДА (ЗОЛОТОЙ)', color: 'text-[#FFD54F]', border: 'border-[#FFB800]', bg: 'bg-[#382B0D]' },
};

interface TradeUpResult {
  skin: SkinDefinition;
  spent: number;
  profit: number;
  isProfit: boolean;
  multiplier: number;
}

export const FurnaceTradeUp: React.FC<FurnaceTradeUpProps> = ({
  inventory,
  userBalance,
  onTradeUp,
  onBuySkin,
  onInspectSkin,
}) => {
  // Config: 5 or 10 items trade-up
  const [requiredCount, setRequiredCount] = useState<5 | 10>(5);
  const [selectedRarity, setSelectedRarity] = useState<ItemRarity>('industrial');
  const [selectedInstanceIds, setSelectedInstanceIds] = useState<string[]>([]);
  const [isSmelting, setIsSmelting] = useState<boolean>(false);
  const [smeltResult, setSmeltResult] = useState<TradeUpResult | null>(null);

  const nextRarity = RARITY_NEXT[selectedRarity];

  // User's inventory items matching current tier
  const availableItems = useMemo(() => {
    return inventory.filter((item) => {
      const skin = SKINS_MAP[item.skinId];
      return skin && skin.rarity === selectedRarity;
    });
  }, [inventory, selectedRarity]);

  // Candidate outcomes in next rarity tier
  const targetPool = useMemo(() => {
    if (!nextRarity) return [];
    return SKINS_DATA.filter((s) => s.rarity === nextRarity);
  }, [nextRarity]);

  // Total input value
  const totalInputValue = useMemo(() => {
    return selectedInstanceIds.reduce((sum, id) => {
      const item = inventory.find((i) => i.instanceId === id);
      const skin = item ? SKINS_MAP[item.skinId] : null;
      return sum + (skin ? skin.price : 0);
    }, 0);
  }, [selectedInstanceIds, inventory]);

  // Statistics for possible outcomes: Min, Max, Profit probability
  const poolStats = useMemo(() => {
    if (targetPool.length === 0) {
      return { min: 0, max: 0, profitChance: 0, profitableCount: 0 };
    }
    const prices = targetPool.map((s) => s.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);

    const profitableCount = targetPool.filter((s) => s.price >= (totalInputValue > 0 ? totalInputValue : 1)).length;
    const profitChance = Math.round((profitableCount / targetPool.length) * 100);

    return { min, max, profitChance, profitableCount };
  }, [targetPool, totalInputValue]);

  // Toggle item selection
  const handleToggleItem = (instanceId: string) => {
    if (isSmelting) return;
    if (selectedInstanceIds.includes(instanceId)) {
      setSelectedInstanceIds((prev) => prev.filter((id) => id !== instanceId));
      soundManager.play('item_select');
    } else {
      if (selectedInstanceIds.length >= requiredCount) {
        soundManager.play('codelock_error');
        return;
      }
      setSelectedInstanceIds((prev) => [...prev, instanceId]);
      soundManager.play('item_select');
    }
  };

  // Auto-Fill 5 or 10 items
  const handleAutoFill = () => {
    if (isSmelting) return;
    if (availableItems.length === 0) {
      soundManager.play('codelock_error');
      return;
    }

    // Sort available items by lowest price first
    const sorted = [...availableItems].sort((a, b) => {
      const pA = SKINS_MAP[a.skinId]?.price || 0;
      const pB = SKINS_MAP[b.skinId]?.price || 0;
      return pA - pB;
    });

    const chosen = sorted.slice(0, requiredCount).map((i) => i.instanceId);
    setSelectedInstanceIds(chosen);
    soundManager.play('item_select');
  };

  // Clear slots
  const handleClearSlots = () => {
    if (isSmelting) return;
    setSelectedInstanceIds([]);
  };

  // Execute Smelt
  const handleStartSmelt = async () => {
    if (isSmelting || selectedInstanceIds.length < requiredCount || !nextRarity || targetPool.length === 0) {
      soundManager.play('codelock_error');
      return;
    }

    const currentSpent = totalInputValue;
    setIsSmelting(true);
    setSmeltResult(null);

    // 1. Play turn-on electric switch surge
    soundManager.play('furnace_turn_on');

    // 2. Start furnace heating loop
    soundManager.play('furnace_loop');

    // Pick outcome: If admin rigged furnace is on, pick highest value skin (guaranteed max profit)
    const isRigged = adminManager.getRigging().riggedFurnace;
    let pickedSkin: SkinDefinition;
    if (isRigged) {
      const sortedPool = [...targetPool].sort((a, b) => b.price - a.price);
      pickedSkin = sortedPool[0];
    } else {
      pickedSkin = targetPool[Math.floor(Math.random() * targetPool.length)];
    }

    const profit = pickedSkin.price - currentSpent;
    const isProfit = profit >= 0;
    const multiplier = currentSpent > 0 ? Number((pickedSkin.price / currentSpent).toFixed(2)) : 1.0;

    // Smelt animation duration (2.8s)
    setTimeout(() => {
      soundManager.stop('furnace_loop');

      if (isProfit) {
        soundManager.play('win');
        try {
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.5 },
            colors: ['#FF9800', '#FFB800', '#4CAF50', '#FFFFFF'],
          });
        } catch {
          // Confetti fallback
        }
      } else {
        soundManager.play('lose');
      }

      setSmeltResult({
        skin: pickedSkin,
        spent: currentSpent,
        profit,
        isProfit,
        multiplier,
      });
      setIsSmelting(false);

      // Apply changes to user profile
      onTradeUp(selectedInstanceIds, pickedSkin.id);
      setSelectedInstanceIds([]);
    }, 2800);
  };

  const handleResetOutcome = () => {
    setSmeltResult(null);
  };

  return (
    <div className="w-full flex flex-col items-center select-none pb-8 animate-fade-in">
      {/* Title Header */}
      <div className="flex flex-col items-center text-center mb-5">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-[#E65100] to-[#BF360C] flex items-center justify-center text-white shadow-[0_0_20px_rgba(230,81,0,0.6)]">
            <Flame className="w-5 h-5 fill-current" />
          </div>
          <h2 className="font-rajdhani font-black text-2xl md:text-3xl text-white tracking-widest uppercase">
            ЭЛЕКТРИЧЕСКАЯ <span className="text-[#FF9800]">ПЕЧЬ RUST</span>
          </h2>
        </div>
        <p className="text-xs text-text-muted max-w-lg">
          Загрузите {requiredCount} предметов для переплавки в скин следующего тира. Дроп случаен: крафт может принести как солидный куш, так и уйти в минус!
        </p>
      </div>

      {/* Tier Selector Bar */}
      <div className="w-full max-w-4xl bg-[#12141A]/95 border border-[#232731] rounded-xl p-3 mb-5 shadow-2xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold uppercase text-text-muted mr-1">
            РЕДКОСТЬ ПЛАВКИ:
          </span>
          {RARITY_ORDER.slice(0, 5).map((rarity) => {
            const meta = RARITY_LABELS[rarity];
            const isSelected = selectedRarity === rarity;
            const countInInv = inventory.filter((i) => SKINS_MAP[i.skinId]?.rarity === rarity).length;

            return (
              <button
                key={rarity}
                disabled={isSmelting}
                onClick={() => {
                  setSelectedRarity(rarity);
                  setSelectedInstanceIds([]);
                  setSmeltResult(null);
                  soundManager.play('item_select');
                }}
                className={`
                  px-3 py-1.5 rounded-lg border text-xs font-rajdhani font-black tracking-wide uppercase transition-all
                  ${
                    isSelected
                      ? `${meta.border} ${meta.bg} text-white shadow-[0_0_15px_rgba(255,152,0,0.3)] scale-105`
                      : 'border-[#232731] bg-[#161821] text-text-muted hover:text-white hover:border-zinc-700'
                  }
                `}
              >
                <span>{meta.name.split(' ')[0]}</span>
                <span className="ml-1 text-[10px] opacity-70">({countInInv})</span>
              </button>
            );
          })}
        </div>

        {/* Count Toggle: 5 items vs 10 items */}
        <div className="flex items-center gap-1 bg-[#0D0F12] p-1 rounded-lg border border-[#232731]">
          <button
            disabled={isSmelting}
            onClick={() => {
              setRequiredCount(5);
              setSelectedInstanceIds((prev) => prev.slice(0, 5));
              soundManager.play('item_select');
            }}
            className={`px-3 py-1 rounded text-xs font-rajdhani font-black transition-all ${
              requiredCount === 5 ? 'bg-[#FF9800] text-black shadow' : 'text-text-muted hover:text-white'
            }`}
          >
            5 СКИНОВ
          </button>
          <button
            disabled={isSmelting}
            onClick={() => {
              setRequiredCount(10);
              soundManager.play('item_select');
            }}
            className={`px-3 py-1 rounded text-xs font-rajdhani font-black transition-all ${
              requiredCount === 10 ? 'bg-[#FF9800] text-black shadow' : 'text-text-muted hover:text-white'
            }`}
          >
            10 СКИНОВ
          </button>
        </div>
      </div>

      {/* Main Furnace Smelting Stage */}
      <div className="w-full max-w-4xl bg-[#12141A]/95 border border-[#232731] rounded-2xl p-4 md:p-6 shadow-2xl relative overflow-hidden mb-6">
        {smeltResult ? (
          /* Result Outcome Screen: Clear Profit or Loss Banner */
          <div className="flex flex-col items-center text-center py-6 animate-fade-in z-10 relative">
            {/* Profit or Loss Status Badge */}
            {smeltResult.isProfit ? (
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 font-rajdhani font-black text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(16,185,129,0.4)] mb-2">
                <TrendingUp className="w-4 h-4 text-emerald-400 stroke-[3]" />
                <span>ОКУПИЛОСЬ! (+{smeltResult.profit.toFixed(2)} Scrap, X{smeltResult.multiplier})</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-950/80 border border-red-500/60 text-red-300 font-rajdhani font-black text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(239,68,68,0.4)] mb-2">
                <TrendingDown className="w-4 h-4 text-red-400 stroke-[3]" />
                <span>НЕ ОКУПИЛОСЬ ({smeltResult.profit.toFixed(2)} Scrap)</span>
              </div>
            )}

            {/* Dropped Skin Image */}
            <div className="relative my-4 w-48 h-48 flex items-center justify-center">
              <div
                className={`absolute inset-0 rounded-full blur-xl animate-pulse ${
                  smeltResult.isProfit ? 'bg-amber-500/30' : 'bg-red-500/20'
                }`}
              />
              <img
                src={`/images/skins/${smeltResult.skin.localFile}`}
                alt={smeltResult.skin.name}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = smeltResult.skin.iconUrl;
                }}
                className="max-h-40 max-w-full object-contain scale-125 drop-shadow-[0_12px_24px_rgba(0,0,0,0.9)] animate-bounce"
              />
            </div>

            <h3 className="font-rajdhani font-black text-2xl text-white uppercase tracking-wider">
              {smeltResult.skin.name}
            </h3>

            <div className="flex items-center gap-2 mt-1 mb-4">
              <span className={`text-xs font-bold uppercase tracking-wider ${RARITY_LABELS[smeltResult.skin.rarity].color}`}>
                {smeltResult.skin.type} • {RARITY_LABELS[smeltResult.skin.rarity].name}
              </span>
              <span className="text-zinc-600">|</span>
              <div className="flex items-center gap-1 font-rajdhani font-black text-base text-[#FFD54F]">
                <ScrapIcon size="sm" />
                <span>{smeltResult.skin.price.toFixed(2)}</span>
              </div>
            </div>

            {/* Price breakdown pill */}
            <div className="flex items-center gap-3 px-4 py-1.5 rounded-lg bg-[#0D0F12] border border-[#232731] text-xs font-mono text-text-muted mb-4">
              <span>Вложено: {smeltResult.spent.toFixed(2)} Scrap</span>
              <span>➔</span>
              <span className={smeltResult.isProfit ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                Получено: {smeltResult.skin.price.toFixed(2)} Scrap
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleResetOutcome}
                className="px-6 py-2.5 rounded-lg bg-[#FF9800] hover:bg-[#F57C00] active:scale-95 text-black font-rajdhani font-black text-sm uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(255,152,0,0.4)]"
              >
                ПЕРЕПЛАВИТЬ ЕЩЁ
              </button>
            </div>
          </div>
        ) : (
          /* Active Furnace & Slots Stage */
          <div className="flex flex-col items-center">
            {/* Center: The Flat 2D Electric Furnace (Вид строго спереди, без искажения) */}
            <div className="my-1">
              <FlatElectricFurnace isSmelting={isSmelting} />
            </div>

            {/* Input Slots Grid (5 or 10 slots) */}
            <div className="w-full my-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1 text-xs font-bold text-text-muted">
                  <span className="uppercase">СЛОТЫ ПЕЧИ:</span>
                  <span className="text-white font-rajdhani font-black">
                    {selectedInstanceIds.length} / {requiredCount}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    disabled={isSmelting}
                    onClick={handleAutoFill}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#1C2028] hover:bg-[#252B36] border border-[#2B313E] text-text-muted hover:text-white text-xs font-bold transition-colors"
                  >
                    <Zap className="w-3 h-3 text-[#FF9800]" />
                    <span>АВТО-ЗАПОЛНЕНИЕ</span>
                  </button>

                  {selectedInstanceIds.length > 0 && (
                    <button
                      disabled={isSmelting}
                      onClick={handleClearSlots}
                      className="p-1 rounded bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-300 transition-colors"
                      title="Очистить слоты"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              <div
                className={`grid gap-2 w-full ${
                  requiredCount === 5 ? 'grid-cols-5' : 'grid-cols-5 sm:grid-cols-10'
                }`}
              >
                {Array.from({ length: requiredCount }).map((_, index) => {
                  const instanceId = selectedInstanceIds[index];
                  const item = instanceId ? inventory.find((i) => i.instanceId === instanceId) : null;
                  const skin = item ? SKINS_MAP[item.skinId] : null;

                  return (
                    <div
                      key={index}
                      className={`
                        relative h-28 rounded-lg border flex flex-col items-center justify-between p-1.5 transition-all
                        ${
                          skin
                            ? 'border-[#FF9800]/80 bg-[#1A1813] shadow-[0_0_12px_rgba(255,152,0,0.2)]'
                            : 'border-dashed border-[#232731] bg-[#0E1015]/60'
                        }
                      `}
                    >
                      {skin ? (
                        <>
                          <button
                            disabled={isSmelting}
                            onClick={() => handleToggleItem(instanceId!)}
                            className="absolute top-1 right-1 z-10 w-4 h-4 rounded-full bg-red-600/90 hover:bg-red-600 text-white flex items-center justify-center transition-transform hover:scale-110"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>

                          <div className="h-14 w-full flex items-center justify-center overflow-hidden my-0.5">
                            <img
                              src={`/images/skins/${skin.localFile}`}
                              alt={skin.name}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = skin.iconUrl;
                              }}
                              className="max-h-full max-w-full object-contain scale-115 drop-shadow"
                            />
                          </div>

                          <span className="text-[9px] font-bold text-white truncate w-full text-center">
                            {skin.name}
                          </span>
                          <span className="text-[10px] font-rajdhani font-black text-[#FFD54F] flex items-center gap-0.5">
                            <ScrapIcon size="xs" />
                            <span>{skin.price.toFixed(2)}</span>
                          </span>
                        </>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-text-muted opacity-40">
                          <Flame className="w-5 h-5 mb-1 stroke-1" />
                          <span className="text-[9px] font-mono">#{index + 1}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Risk & Profit Odds Pre-flight Bar */}
            <div className="w-full bg-[#0D0F12] border border-[#232731] rounded-lg p-2.5 my-2 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-text-muted uppercase font-bold">ВЛОЖЕНИЯ:</span>
                <div className="flex items-center gap-1 font-rajdhani font-black text-sm text-[#FFD54F]">
                  <ScrapIcon size="xs" />
                  <span>{totalInputValue.toFixed(2)}</span>
                </div>
              </div>

              {nextRarity && targetPool.length > 0 && (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-text-muted uppercase font-bold">ВОЗМОЖНЫЙ ДРОП:</span>
                    <span className="font-rajdhani font-black text-white text-sm">
                      {poolStats.min.toFixed(2)} – {poolStats.max.toFixed(2)} Scrap
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-text-muted uppercase font-bold">ШАНС ОКУПА:</span>
                    <span
                      className={`font-rajdhani font-black text-sm px-2 py-0.5 rounded ${
                        poolStats.profitChance >= 50
                          ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-400'
                          : poolStats.profitChance >= 25
                          ? 'bg-amber-950/60 border border-amber-500/40 text-amber-400'
                          : 'bg-red-950/60 border border-red-500/40 text-red-400'
                      }`}
                    >
                      {totalInputValue > 0 ? `${poolStats.profitChance}%` : '—'}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Smelt Action Bar */}
            <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#232731]">
              <div className="flex items-center gap-1.5 text-xs font-bold text-text-muted">
                {nextRarity && (
                  <div className="flex items-center gap-1">
                    <ChevronRight className="w-3.5 h-3.5 text-[#FF9800]" />
                    <span className="uppercase text-white">ВЫХОД: {RARITY_LABELS[nextRarity].name.split(' ')[0]}</span>
                    <span className="text-[11px] text-zinc-500">({targetPool.length} вариантов в пуле)</span>
                  </div>
                )}
              </div>

              {/* Big Red/Orange IGNITE Button */}
              <button
                disabled={isSmelting || selectedInstanceIds.length < requiredCount}
                onClick={handleStartSmelt}
                className={`
                  w-full sm:w-auto px-8 py-3 rounded-lg font-rajdhani font-black text-sm md:text-base uppercase tracking-wider transition-all flex items-center justify-center gap-2
                  ${
                    selectedInstanceIds.length === requiredCount && !isSmelting
                      ? 'bg-gradient-to-r from-[#D84315] via-[#E65100] to-[#F57C00] hover:brightness-110 active:scale-95 text-white shadow-[0_0_25px_rgba(230,81,0,0.6)] cursor-pointer'
                      : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/40'
                  }
                `}
              >
                {isSmelting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>ПЛАВИМ СКИНЫ...</span>
                  </>
                ) : (
                  <>
                    <Flame className="w-4 h-4 fill-current" />
                    <span>
                      {selectedInstanceIds.length === requiredCount
                        ? '🔥 ВКЛЮЧИТЬ ПЕЧЬ (РАСПЛАВИТЬ)'
                        : `ЗАГРУЗИТЕ ЕЩЁ ${requiredCount - selectedInstanceIds.length} СКИНА`}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User's Available Inventory for the Selected Tier */}
      <div className="w-full max-w-4xl bg-[#12141A]/95 border border-[#232731] rounded-xl p-4 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-[#232731] mb-3">
          <div className="flex items-center gap-2">
            <h4 className="font-rajdhani font-black text-sm md:text-base text-white uppercase tracking-wider">
              ДОСТУПНЫЕ СКИНЫ ДЛЯ ПЛАВКИ: {RARITY_LABELS[selectedRarity].name}
            </h4>
            <span className="text-xs font-mono text-text-muted">({availableItems.length})</span>
          </div>

          <span className="text-[11px] text-text-muted">
            Кликайте по скинам, чтобы загрузить их в печь
          </span>
        </div>

        {availableItems.length === 0 ? (
          <div className="py-10 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-text-muted mb-2">
              <AlertTriangle className="w-6 h-6 text-amber-500/70" />
            </div>
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              У вас нет скинов категории «{RARITY_LABELS[selectedRarity].name.split(' ')[0]}»
            </span>
            <p className="text-[11px] text-text-muted max-w-sm mt-1">
              Купите недорогие скины этого тира во вкладке магазина инвентаря за Scrap или выиграйте в апгрейде!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-[380px] overflow-y-auto pr-1">
            {availableItems.map((item) => {
              const skin = SKINS_MAP[item.skinId];
              if (!skin) return null;
              const isSelected = selectedInstanceIds.includes(item.instanceId);

              return (
                <ItemCard
                  key={item.instanceId}
                  skin={skin}
                  isSelected={isSelected}
                  onSelect={() => handleToggleItem(item.instanceId)}
                  onInspect={() => onInspectSkin(skin.id)}
                  compact={true}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};