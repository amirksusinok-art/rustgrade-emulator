import React, { useState, useEffect } from 'react';
import { CaseDefinition, InventoryItem } from '../../types';
import { CASES_DATA } from '../../data/casesData';
import { SKINS_MAP } from '../../data/skinsData';
import { ScrapIcon } from '../common/ScrapIcon';
import { Package, ShieldCheck, Sparkles, AlertCircle, ArrowUpRight, Flame, Clock } from 'lucide-react';

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

  // Custom crate SVG illustration renderer
  const renderCrateVisual = (crate: CaseDefinition) => {
    switch (crate.id) {
      case 'wooden_crate':
        return (
          <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
            {/* Wooden Crate SVG */}
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_8px_20px_rgba(141,110,99,0.35)]">
              <rect x="15" y="25" width="70" height="55" rx="4" fill="#5D4037" stroke="#8D6E63" strokeWidth="2.5" />
              {/* Planks */}
              <line x1="15" y1="43" x2="85" y2="43" stroke="#3E2723" strokeWidth="2" />
              <line x1="15" y1="61" x2="85" y2="61" stroke="#3E2723" strokeWidth="2" />
              {/* Metal Brackets */}
              <polygon points="15,25 27,25 15,37" fill="#2E1C14" />
              <polygon points="85,25 73,25 85,37" fill="#2E1C14" />
              <polygon points="15,80 27,80 15,68" fill="#2E1C14" />
              <polygon points="85,80 73,80 85,68" fill="#2E1C14" />
              {/* Diagonal Straps */}
              <line x1="22" y1="28" x2="78" y2="77" stroke="#2E1C14" strokeWidth="3" opacity="0.6" />
              <line x1="78" y1="28" x2="22" y2="77" stroke="#2E1C14" strokeWidth="3" opacity="0.6" />
              {/* Central Lock */}
              <rect x="44" y="47" width="12" height="15" rx="2" fill="#D7CCC8" stroke="#3E2723" strokeWidth="1.5" />
              <circle cx="50" cy="53" r="2" fill="#3E2723" />
            </svg>
            <div className="absolute inset-0 bg-radial from-[#8D6E63]/20 to-transparent blur-xl pointer-events-none" />
          </div>
        );

      case 'military_crate':
        return (
          <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
            {/* Military Crate SVG */}
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_8px_20px_rgba(76,175,80,0.4)]">
              <rect x="12" y="24" width="76" height="56" rx="4" fill="#2E4A28" stroke="#4CAF50" strokeWidth="2" />
              {/* Reinforced Ribs */}
              <rect x="22" y="28" width="6" height="48" rx="2" fill="#1C3018" />
              <rect x="47" y="28" width="6" height="48" rx="2" fill="#1C3018" />
              <rect x="72" y="28" width="6" height="48" rx="2" fill="#1C3018" />
              {/* Military Star / Stencil */}
              <polygon points="50,42 53,50 61,50 55,54 57,62 50,57 43,62 45,54 39,50 47,50" fill="#FFEB3B" opacity="0.85" />
              {/* Latches */}
              <rect x="28" y="22" width="10" height="6" rx="1" fill="#FFEB3B" />
              <rect x="62" y="22" width="10" height="6" rx="1" fill="#FFEB3B" />
            </svg>
            <div className="absolute inset-0 bg-radial from-[#4CAF50]/20 to-transparent blur-xl pointer-events-none" />
          </div>
        );

      case 'elite_crate':
        return (
          <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
            {/* Elite Crate SVG */}
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_8px_25px_rgba(171,71,188,0.5)]">
              <rect x="14" y="24" width="72" height="56" rx="5" fill="#241434" stroke="#AB47BC" strokeWidth="2.5" />
              {/* Carbon / High-tech Plates */}
              <rect x="20" y="30" width="60" height="44" rx="3" fill="#170A24" stroke="#CE93D8" strokeWidth="1" strokeDasharray="4 2" />
              {/* Neon Biohazard / Core Symbol */}
              <circle cx="50" cy="52" r="10" fill="none" stroke="#E1BEE7" strokeWidth="2" />
              <circle cx="50" cy="52" r="4" fill="#E040FB" />
              {/* Glowing Corner Locks */}
              <circle cx="22" cy="32" r="2.5" fill="#E040FB" />
              <circle cx="78" cy="32" r="2.5" fill="#E040FB" />
              <circle cx="22" cy="72" r="2.5" fill="#E040FB" />
              <circle cx="78" cy="72" r="2.5" fill="#E040FB" />
            </svg>
            <div className="absolute inset-0 bg-radial from-[#AB47BC]/30 to-transparent blur-xl pointer-events-none" />
          </div>
        );

      case 'relief_crate':
      default:
        return (
          <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
            {/* Supply Drop Crate SVG */}
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_8px_20px_rgba(255,152,0,0.45)]">
              {/* Parachute strings */}
              <line x1="20" y1="10" x2="35" y2="30" stroke="#FFE082" strokeWidth="1.5" strokeDasharray="2 2" />
              <line x1="80" y1="10" x2="65" y2="30" stroke="#FFE082" strokeWidth="1.5" strokeDasharray="2 2" />
              <line x1="50" y1="8" x2="50" y2="30" stroke="#FFE082" strokeWidth="1.5" strokeDasharray="2 2" />
              {/* Container */}
              <rect x="18" y="30" width="64" height="52" rx="4" fill="#4E342E" stroke="#FF9800" strokeWidth="2.5" />
              {/* Hazard Stripes */}
              <line x1="24" y1="42" x2="38" y2="30" stroke="#FF9800" strokeWidth="3" />
              <line x1="38" y1="42" x2="52" y2="30" stroke="#FF9800" strokeWidth="3" />
              <line x1="52" y1="42" x2="66" y2="30" stroke="#FF9800" strokeWidth="3" />
              <line x1="66" y1="42" x2="78" y2="32" stroke="#FF9800" strokeWidth="3" />
              {/* Cross Relief Symbol */}
              <rect x="46" y="52" width="8" height="22" rx="1" fill="#FFFFFF" />
              <rect x="39" y="59" width="22" height="8" rx="1" fill="#FFFFFF" />
            </svg>
            <div className="absolute inset-0 bg-radial from-[#FF9800]/25 to-transparent blur-xl pointer-events-none" />
          </div>
        );
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#171A24] via-[#1E2330] to-[#171A24] border border-[#2B313E] p-5 sm:p-7 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#2196F3]/20 border border-[#2196F3]/40 flex items-center justify-center text-[#2196F3]">
                <Package className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="px-2.5 py-0.5 rounded bg-[#2196F3]/10 border border-[#2196F3]/30 text-[#90CAF9] text-[11px] font-black tracking-widest uppercase">
                CRATES ARENA • RTP 93%
              </span>
            </div>

            <h1 className="font-rajdhani font-black text-2xl sm:text-3xl text-white tracking-wider uppercase">
              Оригинальные Ящики <span className="text-[#2196F3]">Rust</span>
            </h1>

            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Открывай аутентичные кейсы с откалиброванным возвратом игроку (RTP ~93%). Выигранный скин можно моментально продать за скрап, положить в инвентарь или зарядить напрямую в Upgrade для дальнейшего умножения!
            </p>
          </div>

          {/* Quick Balance & Fair info pill */}
          <div className="flex items-center gap-3 bg-[#0D0F14]/90 border border-[#232731] p-3 rounded-xl backdrop-blur-md">
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
              className="group relative rounded-2xl bg-[#141720] border border-[#232731] hover:border-zinc-500/80 p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(0,0,0,0.6)] cursor-pointer overflow-hidden"
              style={{
                borderColor: undefined,
              }}
            >
              {/* Glowing hover backdrop */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at 50% 30%, ${crate.glowColor}, transparent 70%)`,
                }}
              />

              {/* Top Row: Volatility Badge & Free indicator */}
              <div className="relative z-10 flex items-center justify-between gap-2 mb-3">
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider font-mono"
                  style={{
                    backgroundColor: `${crate.color}20`,
                    color: crate.color,
                    border: `1px solid ${crate.color}40`,
                  }}
                >
                  {crate.badge}
                </span>

                {crate.isFree && isReliefEligible && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-black animate-pulse">
                    <Sparkles className="w-3 h-3" />
                    ДОСТУПЕН
                  </span>
                )}
              </div>

              {/* Crate Visual Presentation */}
              <div className="relative z-10 py-3 group-hover:scale-105 transition-transform duration-300">
                {renderCrateVisual(crate)}
              </div>

              {/* Crate Info */}
              <div className="relative z-10 space-y-1 text-center my-2">
                <h3 className="font-rajdhani font-black text-lg text-white group-hover:text-[#90CAF9] transition-colors">
                  {crate.name}
                </h3>
                <p className="text-[11px] text-zinc-400 line-clamp-1">
                  {crate.subtitle}
                </p>
              </div>

              {/* Top Drop Highlight Card */}
              {topDrop && (
                <div className="relative z-10 my-3 p-2.5 rounded-xl bg-[#0D0F14] border border-[#1E2330] flex items-center gap-2.5">
                  <img
                    src={`/images/skins/${topDrop.localFile}`}
                    alt={topDrop.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = topDrop.iconUrl;
                    }}
                    className="w-10 h-10 object-contain rounded"
                  />
                  <div className="flex flex-col min-w-0 flex-1 text-left">
                    <span className="text-[9px] uppercase tracking-wider text-zinc-400 font-bold">
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

              {/* Mini Item Thumbnails Strip */}
              <div className="relative z-10 flex items-center justify-center gap-1.5 py-1.5 mb-3 opacity-70 group-hover:opacity-100 transition-opacity">
                {crate.items.slice(0, 5).map((item) => {
                  const skin = SKINS_MAP[item.skinId];
                  if (!skin) return null;
                  return (
                    <div
                      key={skin.id}
                      className="w-7 h-7 rounded bg-[#1A1D24] border border-zinc-700/60 p-0.5 flex items-center justify-center"
                      title={skin.name}
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
                {crate.items.length > 5 && (
                  <span className="text-[10px] text-zinc-400 font-mono">
                    +{crate.items.length - 5}
                  </span>
                )}
              </div>

              {/* Bottom Action Button & Price */}
              <div className="relative z-10 pt-2 border-t border-[#1F232E] flex items-center justify-between gap-3">
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
                    px-3.5 py-2 rounded-xl font-rajdhani font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all
                    ${
                      crate.isFree
                        ? isReliefEligible
                          ? 'bg-[#4CAF50] hover:bg-[#43A047] text-white shadow-[0_0_15px_rgba(76,175,80,0.4)]'
                          : reliefCooldownLeft > 0
                          ? 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                          : 'bg-[#2A2D37] text-zinc-300 hover:text-white'
                        : canAfford
                        ? 'bg-[#E53935] hover:bg-[#D32F2F] text-white shadow-[0_0_12px_rgba(229,57,53,0.35)]'
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

      {/* 3. Safe Guidelines & Mathematical Transparency Footer */}
      <div className="rounded-xl bg-[#12141C] border border-[#232731] p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-zinc-500 shrink-0" />
          <span>
            Каждый ящик сбалансирован под <strong className="text-zinc-200">RTP 92.6% – 92.7%</strong> с криптографическим хэшированием семян на клиенте.
          </span>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-mono text-zinc-400">
          <span>🪵 Safe: x2 окуп</span>
          <span>🪖 Balanced: x8 джекпот</span>
          <span>💎 High Risk: Big Grin x7</span>
        </div>
      </div>
    </div>
  );
};
