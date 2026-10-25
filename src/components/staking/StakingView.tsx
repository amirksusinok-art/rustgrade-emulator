import React, { useState, useEffect } from 'react';
import { UserProfile, InventoryItem, StakedSkinItem } from '../../types';
import { SKINS_MAP } from '../../data/skinsData';
import { calculateSkinYield } from '../../hooks/useUserStore';
import { ScrapIcon } from '../common/ScrapIcon';
import { Building2, Coins, ArrowUpRight, ArrowDownLeft, ShieldCheck, Sparkles, AlertCircle, Clock, Zap } from 'lucide-react';

interface StakingViewProps {
  profile: UserProfile;
  onStakeSkin: (instanceId: string) => boolean;
  onUnstakeSkin: (instanceId: string) => boolean;
  onClaimYield: () => number;
  onInspectSkin: (skinId: string) => void;
  onSelectTab?: (tab: 'upgrade' | 'furnace' | 'cases' | 'staking' | 'leaderboard') => void;
}

export const StakingView: React.FC<StakingViewProps> = ({
  profile,
  onStakeSkin,
  onUnstakeSkin,
  onClaimYield,
  onInspectSkin,
  onSelectTab,
}) => {
  const stakedItems = profile.stakedItems || [];

  // Live timer for real-time accrued yield
  const [livePending, setLivePending] = useState<number>(0);

  const totalHourlyYield = stakedItems.reduce((sum, item) => sum + (item.yieldPerHour || 0), 0);

  // Recalculate pending yield every second
  useEffect(() => {
    const updatePending = () => {
      if (stakedItems.length === 0 || totalHourlyYield <= 0) {
        setLivePending(0);
        return;
      }
      const now = Date.now();
      const lastClaim = profile.lastYieldClaimAt || now;
      const elapsedHours = Math.max(0, (now - lastClaim) / 3600000);
      const earned = Number((totalHourlyYield * elapsedHours).toFixed(2));
      setLivePending(earned);
    };

    updatePending();
    const interval = setInterval(updatePending, 1000);
    return () => clearInterval(interval);
  }, [stakedItems, totalHourlyYield, profile.lastYieldClaimAt]);

  // Qualifying inventory skins (price >= 50)
  const eligibleInventory = profile.inventory.filter((item) => {
    const skin = SKINS_MAP[item.skinId];
    return skin && skin.price >= 50;
  });

  const totalStakedValue = stakedItems.reduce((sum, item) => {
    const skin = SKINS_MAP[item.skinId];
    return sum + (skin ? skin.price : 0);
  }, 0);

  return (
    <div className="w-full flex flex-col gap-6 select-none">
      {/* 1. Header Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#171C26] via-[#1F2636] to-[#141722] border-2 border-[#2F384C] p-5 sm:p-7 shadow-[0_12px_36px_rgba(0,0,0,0.65)]">
        {/* Metal Rivets */}
        <div className="absolute top-2.5 left-2.5 w-1.5 h-1.5 rounded-full bg-zinc-500 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]" />
        <div className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-zinc-500 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]" />
        <div className="absolute bottom-2.5 left-2.5 w-1.5 h-1.5 rounded-full bg-zinc-500 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]" />
        <div className="absolute bottom-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-zinc-500 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#4CAF50]/20 border border-[#4CAF50]/40 flex items-center justify-center text-[#4CAF50] shadow-[0_0_15px_rgba(76,175,80,0.3)]">
                <Building2 className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="px-2.5 py-0.5 rounded bg-[#4CAF50]/15 border border-[#4CAF50]/35 text-[#81C784] text-[11px] font-black tracking-widest uppercase font-mono">
                SKIN LENDING VAULT • ПАССИВНЫЙ ДОХОД
              </span>
            </div>

            <h1 className="font-rajdhani font-black text-2xl sm:text-3xl text-white tracking-wider uppercase">
              Аренда Скинов <span className="text-[#4CAF50]">Кланам Острова</span>
            </h1>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans">
              Сдавай топовые скины в аренду кланам Rust и строй свою финансовую империю. Каждый заложенный скин пассивно приносит скрап каждый час — <strong className="text-white">даже когда вкладка браузера закрыта!</strong>
            </p>
          </div>

          {/* Real-time Yield Claim Widget */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-[#0C0F15]/90 border border-[#2B3345] p-4 rounded-xl backdrop-blur-md shadow-2xl">
            <div className="flex flex-col pr-0 sm:pr-4 sm:border-r border-[#242C3D]">
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <Zap className="w-3 h-3 text-[#FFD54F]" />
                Доход в час
              </span>
              <div className="flex items-center gap-1.5 font-rajdhani font-black text-xl text-[#81C784]">
                <ScrapIcon size="sm" />
                <span>+{totalHourlyYield.toFixed(2)}</span>
                <span className="text-xs text-zinc-400 font-mono">/ч</span>
              </div>
            </div>

            <div className="flex flex-col min-w-[130px]">
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <Coins className="w-3 h-3 text-[#4CAF50]" />
                Накоплено
              </span>
              <div className="flex items-center gap-1.5 font-rajdhani font-black text-xl text-white">
                <ScrapIcon size="sm" />
                <span>{livePending.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => onClaimYield()}
              disabled={livePending <= 0}
              className={`
                px-5 py-3 rounded-xl font-rajdhani font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2
                ${
                  livePending > 0
                    ? 'bg-[#4CAF50] hover:bg-[#43A047] text-white shadow-[0_0_20px_rgba(76,175,80,0.5)] active:scale-95 cursor-pointer animate-pulse'
                    : 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed'
                }
              `}
            >
              <Coins className="w-4 h-4" />
              <span>ЗАБРАТЬ</span>
            </button>
          </div>
        </div>

        {/* Highlight Quick Rates Banner */}
        <div className="relative z-10 mt-5 pt-4 border-t border-[#252E40] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center gap-2 bg-[#10141D] p-2 rounded-lg border border-[#202738]">
            <span className="text-amber-400 font-bold">Helk's Mask:</span>
            <span className="text-white font-mono font-bold">+100 ⚙️/ч</span>
          </div>
          <div className="flex items-center gap-2 bg-[#10141D] p-2 rounded-lg border border-[#202738]">
            <span className="text-purple-400 font-bold">Big Grin:</span>
            <span className="text-white font-mono font-bold">+25 ⚙️/ч</span>
          </div>
          <div className="flex items-center gap-2 bg-[#10141D] p-2 rounded-lg border border-[#202738]">
            <span className="text-cyan-400 font-bold">Dark Matter AK:</span>
            <span className="text-white font-mono font-bold">+175 ⚙️/ч</span>
          </div>
          <div className="flex items-center gap-2 bg-[#10141D] p-2 rounded-lg border border-[#202738]">
            <span className="text-emerald-400 font-bold">Titanium Crown:</span>
            <span className="text-white font-mono font-bold">+750 ⚙️/ч</span>
          </div>
        </div>
      </div>

      {/* 2. Main Two-Column Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
        {/* Left Column: Currently Staked Skins */}
        <div className="rounded-2xl bg-gradient-to-b from-[#181C26] via-[#12151E] to-[#0E1017] border-2 border-[#282F40] p-5 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#232A3B]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#4CAF50]" />
                <h3 className="font-rajdhani font-black text-lg text-white uppercase tracking-wider">
                  Скины в аренде ({stakedItems.length})
                </h3>
              </div>
              <div className="text-xs text-zinc-400 font-mono">
                Ценность: <strong className="text-white">{totalStakedValue.toFixed(2)} ⚙️</strong>
              </div>
            </div>

            {stakedItems.length === 0 ? (
              <div className="py-16 flex flex-col items-center justify-center text-center text-zinc-400 space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-[#1A1F2B] border border-zinc-700 flex items-center justify-center text-3xl">
                  🏦
                </div>
                <h4 className="font-rajdhani font-black text-lg text-white uppercase">Хранилище пусто</h4>
                <p className="text-xs max-w-sm text-zinc-400">
                  У вас пока нет заложенных скинов. Выберите дорогой скин из инвентаря справа, чтобы начать получать пассивный доход!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin">
                {stakedItems.map((item) => {
                  const skin = SKINS_MAP[item.skinId];
                  if (!skin) return null;

                  return (
                    <div
                      key={item.instanceId}
                      className="p-3 rounded-xl bg-[#0F1219] border border-[#252C3D] hover:border-zinc-500 flex flex-col justify-between gap-2.5 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={`/images/skins/${skin.localFile}`}
                          alt={skin.name}
                          onClick={() => onInspectSkin(skin.id)}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = skin.iconUrl;
                          }}
                          className="w-14 h-14 object-contain rounded-lg bg-[#161A24] p-1 cursor-pointer group-hover:scale-105 transition-transform"
                        />
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="text-xs font-bold text-white truncate" title={skin.name}>
                            {skin.name}
                          </span>
                          <span className="text-[10px] text-zinc-400 font-mono">
                            {skin.price.toFixed(2)} ⚙️
                          </span>
                          <div className="flex items-center gap-1 font-rajdhani font-black text-xs text-[#81C784] mt-1">
                            <Zap className="w-3 h-3" />
                            <span>+{item.yieldPerHour.toFixed(2)} ⚙️/ч</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => onUnstakeSkin(item.instanceId)}
                        className="w-full py-1.5 px-3 rounded-lg bg-[#242A38] hover:bg-[#2F374A] text-zinc-300 hover:text-white border border-zinc-700 text-xs font-rajdhani font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <ArrowDownLeft className="w-3 h-3 text-amber-400" />
                        <span>ВЕРНУТЬ В ИНВЕНТАРЬ</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Inventory Skins Eligible for Staking (>= 50 Scrap) */}
        <div className="rounded-2xl bg-gradient-to-b from-[#181C26] via-[#12151E] to-[#0E1017] border-2 border-[#282F40] p-5 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#232A3B]">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-[#FFD54F]" />
                <h3 className="font-rajdhani font-black text-lg text-white uppercase tracking-wider">
                  Доступно для аренды ({eligibleInventory.length})
                </h3>
              </div>
              <span className="text-[11px] text-zinc-400 font-mono">
                Требуется цена: <strong className="text-zinc-200">≥ 50.00 ⚙️</strong>
              </span>
            </div>

            {eligibleInventory.length === 0 ? (
              <div className="py-14 flex flex-col items-center justify-center text-center text-zinc-400 space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-[#1A1F2B] border border-zinc-700 flex items-center justify-center text-3xl">
                  🎒
                </div>
                <h4 className="font-rajdhani font-black text-lg text-white uppercase">Нет скинов от 50 ⚙️</h4>
                <p className="text-xs max-w-sm text-zinc-400 leading-relaxed font-sans">
                  Чтобы сдать скин в аренду кланам, получите скин стоимостью от 50 ⚙️ в Апгрейдере или открывайте Военные и Элитные кейсы!
                </p>
                {onSelectTab && (
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => onSelectTab('upgrade')}
                      className="px-3.5 py-2 rounded-xl bg-[#E53935] hover:bg-[#D32F2F] text-white font-rajdhani font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(229,57,53,0.3)] cursor-pointer"
                    >
                      В Апгрейдер
                    </button>
                    <button
                      onClick={() => onSelectTab('cases')}
                      className="px-3.5 py-2 rounded-xl bg-[#2196F3] hover:bg-[#1E88E5] text-white font-rajdhani font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(33,150,243,0.3)] cursor-pointer"
                    >
                      Кейсы
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin">
                {eligibleInventory.map((item) => {
                  const skin = SKINS_MAP[item.skinId];
                  if (!skin) return null;
                  const estimatedYield = calculateSkinYield(skin.id);

                  return (
                    <div
                      key={item.instanceId}
                      className="p-3 rounded-xl bg-[#0F1219] border border-[#252C3D] hover:border-zinc-500 flex flex-col justify-between gap-2.5 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={`/images/skins/${skin.localFile}`}
                          alt={skin.name}
                          onClick={() => onInspectSkin(skin.id)}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = skin.iconUrl;
                          }}
                          className="w-14 h-14 object-contain rounded-lg bg-[#161A24] p-1 cursor-pointer group-hover:scale-105 transition-transform"
                        />
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="text-xs font-bold text-white truncate" title={skin.name}>
                            {skin.name}
                          </span>
                          <span className="text-[10px] text-zinc-400 font-mono">
                            {skin.price.toFixed(2)} ⚙️
                          </span>
                          <div className="flex items-center gap-1 font-rajdhani font-black text-xs text-[#4CAF50] mt-1">
                            <Zap className="w-3 h-3" />
                            <span>+{estimatedYield.toFixed(2)} ⚙️/ч</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => onStakeSkin(item.instanceId)}
                        className="w-full py-1.5 px-3 rounded-lg bg-[#2E4A28] hover:bg-[#385E30] text-white border border-[#4CAF50]/60 text-xs font-rajdhani font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5 text-[#81C784]" />
                        <span>СДАТЬ В АРЕНДУ</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
