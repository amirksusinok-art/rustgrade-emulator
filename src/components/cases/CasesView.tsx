import React, { useState, useEffect } from 'react';
import { CaseDefinition, InventoryItem } from '../../types';
import { CASES_DATA } from '../../data/casesData';
import { SKINS_MAP } from '../../data/skinsData';
import { ScrapIcon } from '../common/ScrapIcon';
import { Package, ShieldCheck, Sparkles, AlertCircle, ArrowUpRight, Clock, Award } from 'lucide-react';

interface CasesViewProps {
  userBalance: number;
  userInventory: InventoryItem[];
  onSelectCase: (caseDef: CaseDefinition) => void;
}

export const CasesView: React.FC<CasesViewProps> = ({
  userBalance,
  userInventory,
  onSelectCase,
}) => {
  // Cooldown tracker for relief crate
  const [reliefCooldownLeft, setReliefCooldownLeft] = useState<number>(0);

  useEffect(() => {
    const checkCooldown = () => {
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
    };

    checkCooldown();
    const interval = setInterval(checkCooldown, 5000);
    return () => clearInterval(interval);
  }, []);

  const isReliefEligible = userBalance < 2.0 && userInventory.length === 0 && reliefCooldownLeft <= 0;

  return (
    <div className="w-full flex flex-col gap-6">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#171B26] via-[#1C2232] to-[#141722] border-2 border-[#2F3648] p-5 sm:p-7 shadow-[0_12px_36px_rgba(0,0,0,0.65)]">
        {/* Steel Rivets in Banner Corners */}
        <div className="absolute top-2.5 left-2.5 w-1.5 h-1.5 rounded-full bg-zinc-500 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]" />
        <div className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-zinc-500 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]" />
        <div className="absolute bottom-2.5 left-2.5 w-1.5 h-1.5 rounded-full bg-zinc-500 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]" />
        <div className="absolute bottom-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-zinc-500 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#2196F3]/20 border border-[#2196F3]/40 flex items-center justify-center text-[#2196F3] shadow-[0_0_15px_rgba(33,150,243,0.3)]">
                <Package className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="px-2.5 py-0.5 rounded bg-[#2196F3]/15 border border-[#2196F3]/35 text-[#90CAF9] text-[11px] font-black tracking-widest uppercase font-mono">
                CRATES ARENA • RTP 92.7%
              </span>
            </div>

            <h1 className="font-rajdhani font-black text-2xl sm:text-3xl text-white tracking-wider uppercase">
              Оригинальные Ящики <span className="text-[#2196F3]">Rust</span>
            </h1>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans">
              Реалистичные 3D-ящики из мира Rust с расширенным пулом скинов и честным возвратом игроку (RTP ~93%). Выигранный скин можно моментально продать, положить в инвентарь или зарядить напрямую в Upgrade!
            </p>
          </div>

          {/* Quick Balance & Fair info pill */}
          <div className="flex items-center gap-3 bg-[#0D0F14]/90 border border-[#2A3040] p-3 rounded-xl backdrop-blur-md shadow-inner">
            <div className="flex flex-col">
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Твой баланс</span>
              <div className="flex items-center gap-1.5">
                <ScrapIcon size="sm" />
                <span className="font-rajdhani font-black text-lg text-white">
                  {userBalance.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="h-8 w-px bg-zinc-800" />

            <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-mono">
              <ShieldCheck className="w-4 h-4 text-[#4CAF50]" />
              <span>Provably Fair</span>
            </div>
          </div>
        </div>

        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#2196F3]/5 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 2. Four Crates Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {CASES_DATA.map((crate) => {
          // Find best drop
          const sortedItems = [...crate.items]
            .map((i) => SKINS_MAP[i.skinId])
            .filter(Boolean)
            .sort((a, b) => b.price - a.price);
          const topDrop = sortedItems[0];
          const canAfford = userBalance >= crate.price || crate.isFree;

          return (
            <div
              key={crate.id}
              onClick={() => onSelectCase(crate)}
              className="group relative rounded-2xl bg-gradient-to-b from-[#181C26] via-[#12151E] to-[#0E1017] border-2 border-[#282F40] hover:border-zinc-400 p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.85)] cursor-pointer overflow-hidden select-none"
            >
              {/* Four Corner Metal Rivets */}
              <div className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full bg-zinc-600 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]" />
              <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-zinc-600 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]" />
              <div className="absolute bottom-2 left-2 w-1.5 h-1.5 rounded-full bg-zinc-600 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]" />
              <div className="absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full bg-zinc-600 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]" />

              {/* Glowing hover backdrop */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at 50% 30%, ${crate.glowColor}, transparent 70%)`,
                }}
              />

              {/* Top Row: Volatility Badge & Free indicator */}
              <div className="relative z-10 flex items-center justify-between gap-2 mb-2">
                <span
                  className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider font-mono shadow-sm"
                  style={{
                    backgroundColor: `${crate.color}25`,
                    color: crate.color,
                    border: `1px solid ${crate.color}60`,
                  }}
                >
                  {crate.badge}
                </span>

                {crate.isFree && isReliefEligible && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/25 text-amber-300 border border-amber-500/40 text-[10px] font-black animate-pulse">
                    <Sparkles className="w-3 h-3" />
                    ДОСТУПЕН
                  </span>
                )}
              </div>

              {/* Realistic 3D Rust Crate Render from Photos 2, 3, 4 */}
              <div className="relative z-10 py-2 flex flex-col items-center justify-center">
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <img
                    src={crate.image}
                    alt={crate.name}
                    className="w-full h-full object-contain rounded-xl drop-shadow-[0_12px_28px_rgba(0,0,0,0.95)] group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Ground Light Glow */}
                  <div
                    className="absolute -bottom-1 w-28 h-5 rounded-full blur-lg opacity-70 pointer-events-none"
                    style={{ backgroundColor: crate.glowColor }}
                  />
                </div>
              </div>

              {/* Crate Info */}
              <div className="relative z-10 space-y-1 text-center my-1.5">
                <h3 className="font-rajdhani font-black text-lg text-white group-hover:text-[#90CAF9] transition-colors tracking-wide uppercase">
                  {crate.name}
                </h3>
                <p className="text-[11px] text-zinc-400 line-clamp-1">
                  {crate.subtitle}
                </p>
              </div>

              {/* Top Drop Highlight Card */}
              {topDrop && (
                <div className="relative z-10 my-2.5 p-2.5 rounded-xl bg-[#0B0D13] border border-[#232A3B] flex items-center gap-2.5 shadow-inner">
                  <img
                    src={`/images/skins/${topDrop.localFile}`}
                    alt={topDrop.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = topDrop.iconUrl;
                    }}
                    className="w-10 h-10 object-contain rounded shrink-0 drop-shadow"
                  />
                  <div className="flex flex-col min-w-0 flex-1 text-left">
                    <span className="text-[9px] uppercase tracking-wider text-zinc-400 font-bold flex items-center gap-1">
                      <Award className="w-2.5 h-2.5 text-[#FFD54F]" />
                      Топ выигрыш
                    </span>
                    <span className="text-xs font-bold text-white truncate">
                      {topDrop.name}
                    </span>
                    <div className="flex items-center gap-1 font-rajdhani font-black text-xs text-[#FFD54F]">
                      <ScrapIcon size="xs" />
                      <span>{topDrop.price.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Mini Item Thumbnails Strip (Up to 7 items shown) */}
              <div className="relative z-10 flex items-center justify-center gap-1.5 py-1.5 mb-2.5 opacity-80 group-hover:opacity-100 transition-opacity">
                {crate.items.slice(0, 6).map((item) => {
                  const skin = SKINS_MAP[item.skinId];
                  if (!skin) return null;
                  return (
                    <div
                      key={skin.id}
                      className="w-7 h-7 rounded bg-[#171A24] border border-zinc-700/80 p-0.5 flex items-center justify-center shadow"
                      title={`${skin.name} (${skin.price} ⚙️)`}
                    >
                      <img
                        src={`/images/skins/${skin.localFile}`}
                        alt={skin.name}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = skin.iconUrl;
                        }}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  );
                })}
                {crate.items.length > 6 && (
                  <span className="text-[10px] text-zinc-400 font-mono font-bold bg-[#171A24] px-1.5 py-1 rounded border border-zinc-700">
                    +{crate.items.length - 6}
                  </span>
                )}
              </div>

              {/* Bottom Action Button & Price */}
              <div className="relative z-10 pt-2.5 border-t border-[#1F2536] flex items-center justify-between gap-3">
                <div className="flex flex-col">
                  <span className="text-[9px] text-zinc-400 uppercase tracking-wider font-bold">
                    Цена
                  </span>
                  {crate.isFree ? (
                    <span className="text-xs font-black text-amber-400 uppercase font-rajdhani">
                      0 ⚙️ Бесплатно
                    </span>
                  ) : (
                    <div className="flex items-center gap-1 font-rajdhani font-black text-sm text-white">
                      <ScrapIcon size="xs" />
                      <span>{crate.price.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  className={`
                    px-4 py-2 rounded-xl font-rajdhani font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md
                    ${
                      crate.isFree
                        ? isReliefEligible
                          ? 'bg-[#4CAF50] hover:bg-[#43A047] text-white shadow-[0_0_15px_rgba(76,175,80,0.5)]'
                          : reliefCooldownLeft > 0
                          ? 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                          : 'bg-[#252A38] text-zinc-300 hover:text-white border border-zinc-700'
                        : canAfford
                        ? 'bg-[#E53935] hover:bg-[#D32F2F] text-white shadow-[0_0_15px_rgba(229,57,53,0.45)]'
                        : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                    }
                  `}
                >
                  {crate.isFree ? (
                    reliefCooldownLeft > 0 ? (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {Math.ceil(reliefCooldownLeft / 60)}м
                      </span>
                    ) : isReliefEligible ? (
                      'ЗАБРАТЬ'
                    ) : (
                      'ОСМОТРЕТЬ'
                    )
                  ) : (
                    <>
                      <span>ОТКРЫТЬ</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Mathematical Transparency & Details */}
      <div className="rounded-xl bg-[#10131B]/90 border border-[#232938] p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-400 shadow-md">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-zinc-400 shrink-0" />
          <span>
            Каждый ящик расширен до <strong className="text-white">10–12 предметов</strong> и строго откалиброван под <strong className="text-zinc-200">RTP 92.7%</strong> с честной генерацией семян.
          </span>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-mono text-zinc-400">
          <span>🪵 Safe: 12 скинов (x3 окуп)</span>
          <span>🪖 Military: 12 скинов (x8 джекпот)</span>
          <span>💎 Elite: 12 скинов (Big Grin x7)</span>
        </div>
      </div>
    </div>
  );
};
