import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile } from '../../types';
import { SKINS_MAP } from '../../data/skinsData';
import { ScrapIcon } from '../common/ScrapIcon';
import { Trophy, Target, Package, Crown, Zap, Shield, ArrowRight, Sparkles } from 'lucide-react';

interface LeaderboardViewProps {
  profile: UserProfile;
  onInspectSkin?: (skinId: string) => void;
  onSelectTab?: (tab: 'upgrade' | 'furnace' | 'cases' | 'staking' | 'leaderboard') => void;
}

type LeaderboardCategory = 'wealth' | 'sniper' | 'cases';

interface RealPlayerRecord {
  steamId: string;
  nickname: string;
  avatar: string;
  totalWealth: number;
  bestDropChance: number | null;
  bestDropSkinId: string | null;
  casesOpened: number;
  updatedAt: number;
}

interface DisplayEntry {
  rank: number;
  nickname: string;
  avatar: string;
  steamId: string;
  isUser: boolean;
  scoreDisplay: string;
  scoreNumeric: number;
  secondaryInfo?: string;
  trophy?: 'gold' | 'silver' | 'bronze';
}

const STORAGE_KEY = 'rustgrade_real_players_v1';

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  profile,
  onInspectSkin,
  onSelectTab,
}) => {
  const [activeCategory, setActiveCategory] = useState<LeaderboardCategory>('wealth');
  const [realPlayers, setRealPlayers] = useState<RealPlayerRecord[]>([]);

  // 1. Calculate User's current Total Wealth (Balance + Inventory + Staked Items)
  const inventoryValue = useMemo(() => {
    return profile.inventory.reduce((sum, item) => {
      const s = SKINS_MAP[item.skinId];
      return sum + (s ? s.price : 0);
    }, 0);
  }, [profile.inventory]);

  const stakedValue = useMemo(() => {
    return (profile.stakedItems || []).reduce((sum, item) => {
      const s = SKINS_MAP[item.skinId];
      return sum + (s ? s.price : 0);
    }, 0);
  }, [profile.stakedItems]);

  const userTotalWealth = Number((profile.balance + inventoryValue + stakedValue).toFixed(2));
  const userCasesCount = profile.stats.totalCasesOpened || 0;
  const userBestChance = profile.stats.bestDropChance !== null ? profile.stats.bestDropChance : null;

  // 2. Synchronize current player with persistent real player registry
  useEffect(() => {
    let saved: RealPlayerRecord[] = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          // Filter out any legacy fake bot entries
          saved = parsed.filter(
            (p) =>
              p &&
              p.steamId &&
              !['Trausi_God', 'Hjune_Official', 'Posty_Clips', 'Bchillz_AK', 'AloneInTokyo', 'Warrior_Rust', 'Frost_Movie', 'Spoonkid_Monke', 'LuckyNaked_777'].includes(p.nickname)
          );
        }
      }
    } catch {
      saved = [];
    }

    const currentSteamId = profile.steamId || profile.id;
    const currentAvatar =
      profile.avatar === 'naked'
        ? '🪨'
        : profile.avatar === 'big_grin'
        ? '😈'
        : profile.avatar === 'wolf'
        ? '🐺'
        : '👨‍🔬';

    const existingIdx = saved.findIndex((p) => p.steamId === currentSteamId);

    const userRecord: RealPlayerRecord = {
      steamId: currentSteamId,
      nickname: profile.nickname,
      avatar: currentAvatar,
      totalWealth: userTotalWealth,
      bestDropChance: userBestChance,
      bestDropSkinId: profile.stats.bestDropSkinId || null,
      casesOpened: userCasesCount,
      updatedAt: Date.now(),
    };

    if (existingIdx >= 0) {
      saved[existingIdx] = userRecord;
    } else {
      saved.push(userRecord);
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    } catch {
      // ignore
    }

    setRealPlayers(saved);
  }, [
    profile.nickname,
    profile.steamId,
    profile.id,
    profile.avatar,
    userTotalWealth,
    userBestChance,
    userCasesCount,
    profile.stats.bestDropSkinId,
  ]);

  const currentSteamId = profile.steamId || profile.id;

  // 3. Category 1: Wealth List (Король Острова)
  const wealthList: DisplayEntry[] = useMemo(() => {
    return [...realPlayers]
      .filter((p) => p.totalWealth >= 0)
      .sort((a, b) => b.totalWealth - a.totalWealth)
      .map((p, idx) => ({
        rank: idx + 1,
        nickname: p.nickname,
        avatar: p.avatar,
        steamId: p.steamId,
        scoreNumeric: p.totalWealth,
        scoreDisplay: `${p.totalWealth.toFixed(2)} ⚙️`,
        isUser: p.steamId === currentSteamId,
        secondaryInfo: p.steamId === currentSteamId ? 'Твой активный профиль' : 'Выживший острова',
        trophy: idx === 0 ? 'gold' : idx === 1 ? 'silver' : idx === 2 ? 'bronze' : undefined,
      }));
  }, [realPlayers, currentSteamId]);

  // 4. Category 2: Sniper List (Снайпер Рулетки - lowest win % in upgrade)
  const sniperList: DisplayEntry[] = useMemo(() => {
    return [...realPlayers]
      .filter((p) => p.bestDropChance !== null && p.bestDropChance > 0)
      .sort((a, b) => (a.bestDropChance || 100) - (b.bestDropChance || 100))
      .map((p, idx) => {
        const skinName = p.bestDropSkinId ? SKINS_MAP[p.bestDropSkinId]?.name : null;
        return {
          rank: idx + 1,
          nickname: p.nickname,
          avatar: p.avatar,
          steamId: p.steamId,
          scoreNumeric: p.bestDropChance || 0,
          scoreDisplay: `${(p.bestDropChance || 0).toFixed(2)}% ШАНС`,
          isUser: p.steamId === currentSteamId,
          secondaryInfo: skinName ? `Выбит: ${skinName}` : 'Рекордный апгрейд',
          trophy: idx === 0 ? 'gold' : idx === 1 ? 'silver' : idx === 2 ? 'bronze' : undefined,
        };
      });
  }, [realPlayers, currentSteamId]);

  // 5. Category 3: Cases List (Кейс-магнат)
  const casesList: DisplayEntry[] = useMemo(() => {
    return [...realPlayers]
      .filter((p) => p.casesOpened > 0)
      .sort((a, b) => b.casesOpened - a.casesOpened)
      .map((p, idx) => ({
        rank: idx + 1,
        nickname: p.nickname,
        avatar: p.avatar,
        steamId: p.steamId,
        scoreNumeric: p.casesOpened,
        scoreDisplay: `${p.casesOpened} ящиков`,
        isUser: p.steamId === currentSteamId,
        secondaryInfo: p.steamId === currentSteamId ? 'Твои открытия' : 'Открыто на сервере',
        trophy: idx === 0 ? 'gold' : idx === 1 ? 'silver' : idx === 2 ? 'bronze' : undefined,
      }));
  }, [realPlayers, currentSteamId]);

  const currentList =
    activeCategory === 'wealth' ? wealthList : activeCategory === 'sniper' ? sniperList : casesList;

  const userEntry = currentList.find((e) => e.isUser);

  // Min required empty slots to show a solid 5-row table like authentic Rust server monitors
  const emptySlotsCount = Math.max(0, 5 - currentList.length);

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
              <div className="w-8 h-8 rounded-lg bg-[#FFD54F]/20 border border-[#FFD54F]/40 flex items-center justify-center text-[#FFD54F] shadow-[0_0_15px_rgba(255,213,79,0.3)]">
                <Trophy className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="px-2.5 py-0.5 rounded bg-[#FFD54F]/15 border border-[#FFD54F]/35 text-[#FFE082] text-[11px] font-black tracking-widest uppercase font-mono">
                РЕАЛЬНЫЙ СЕРВЕРНЫЙ РЕЙТИНГ • СЕЗОН #12
              </span>
            </div>

            <h1 className="font-rajdhani font-black text-2xl sm:text-3xl text-white tracking-wider uppercase">
              Доска Почёта <span className="text-[#FFD54F]">Выживших Острова</span>
            </h1>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans">
              Официальный рейтинг реальных игроков Rustgrade. Никаких фейковых ботов — только твои реальные достижения, выигранный скрап, удачные апгрейды и открытые кейсы!
            </p>
          </div>

          {/* User's Current Standing Card */}
          <div className="flex items-center gap-4 bg-[#0C0F15]/90 border border-[#2B3345] p-4 rounded-xl backdrop-blur-md shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#1B2232] border border-[#2D374D] flex items-center justify-center text-xl shadow">
                {userEntry?.trophy === 'gold' ? (
                  <span className="text-2xl drop-shadow-[0_0_8px_rgba(255,213,79,0.8)]">🥇</span>
                ) : userEntry?.trophy === 'silver' ? (
                  <span className="text-2xl drop-shadow-[0_0_8px_rgba(192,192,192,0.8)]">🥈</span>
                ) : userEntry?.trophy === 'bronze' ? (
                  <span className="text-2xl drop-shadow-[0_0_8px_rgba(205,127,50,0.8)]">🥉</span>
                ) : (
                  <span>👑</span>
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                  Твоя позиция
                </span>
                <span className="font-rajdhani font-black text-xl text-white">
                  {userEntry ? `#${userEntry.rank} в рейтинге` : 'Требуется квалификация'}
                </span>
                <span className="text-xs text-[#FFD54F] font-mono font-bold">
                  {userEntry ? userEntry.scoreDisplay : 'Соверши действие'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Category Switcher Tabs */}
        <div className="relative z-10 mt-6 pt-4 border-t border-[#252E40] flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveCategory('wealth')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-rajdhani font-black text-xs uppercase tracking-wider transition-all whitespace-nowrap shrink-0 ${
              activeCategory === 'wealth'
                ? 'bg-[#FFD54F] text-black shadow-[0_0_20px_rgba(255,213,79,0.4)]'
                : 'bg-[#121620] text-zinc-400 hover:text-white border border-[#242C3D]'
            }`}
          >
            <Crown className="w-4 h-4" />
            <span>🥇 КОРОЛЬ ОСТРОВА (КАПИТАЛ)</span>
          </button>

          <button
            onClick={() => setActiveCategory('sniper')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-rajdhani font-black text-xs uppercase tracking-wider transition-all whitespace-nowrap shrink-0 ${
              activeCategory === 'sniper'
                ? 'bg-[#E53935] text-white shadow-[0_0_20px_rgba(229,57,53,0.4)]'
                : 'bg-[#121620] text-zinc-400 hover:text-white border border-[#242C3D]'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>🎯 СНАЙПЕР РУЛЕТКИ (ЛУЧШИЙ КУШ)</span>
          </button>

          <button
            onClick={() => setActiveCategory('cases')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-rajdhani font-black text-xs uppercase tracking-wider transition-all whitespace-nowrap shrink-0 ${
              activeCategory === 'cases'
                ? 'bg-[#2196F3] text-white shadow-[0_0_20px_rgba(33,150,243,0.4)]'
                : 'bg-[#121620] text-zinc-400 hover:text-white border border-[#242C3D]'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>📦 КЕЙС-МАГНАТ (ОТКРЫТИЯ)</span>
          </button>
        </div>
      </div>

      {/* 2. Leaderboard Table Card */}
      <div className="rounded-2xl bg-gradient-to-b from-[#181C26] via-[#12151E] to-[#0E1017] border-2 border-[#282F40] p-5 shadow-2xl overflow-hidden flex flex-col gap-4">
        {/* Table Column Headers */}
        <div className="flex items-center justify-between pb-3 border-b border-[#232A3B] text-xs font-bold text-zinc-400 uppercase tracking-wider">
          <div className="flex items-center gap-4">
            <span className="w-8 text-center">#</span>
            <span>Реальный Игрок / SteamID</span>
          </div>
          <span>Показатель</span>
        </div>

        {/* Empty Category Call-To-Action if 0 qualifying players */}
        {currentList.length === 0 ? (
          <div className="py-12 px-4 rounded-xl bg-[#0D1017] border border-[#212736] flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[#1A1F2D] border border-zinc-700 flex items-center justify-center text-3xl">
              {activeCategory === 'sniper' ? '🎯' : '📦'}
            </div>
            <div className="space-y-1 max-w-md">
              <h3 className="font-rajdhani font-black text-xl text-white uppercase tracking-wider">
                {activeCategory === 'sniper'
                  ? 'Звание Снайпера вакантно'
                  : 'Звание Кейс-магната вакантно'}
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                {activeCategory === 'sniper'
                  ? 'В текущем сезоне ещё никто не зафиксировал победу в Апгрейдере. Сделай успешный апгрейд на низком шансе и займи #1 место!'
                  : 'В текущем сезоне ещё не открыто ни одного кейса. Открой первый ящик и возглавь Доску Почёта!'}
              </p>
            </div>
            {onSelectTab && (
              <button
                onClick={() => onSelectTab(activeCategory === 'sniper' ? 'upgrade' : 'cases')}
                className="py-2.5 px-6 rounded-xl bg-[#E53935] hover:bg-[#D32F2F] text-white font-rajdhani font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(229,57,53,0.4)] flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
              >
                <span>{activeCategory === 'sniper' ? 'ПЕРЕЙТИ В АПГРЕЙДЕР' : 'ОТКРЫТЬ КЕЙСЫ'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-[#1D2332]">
            {/* Real Player Rows */}
            {currentList.map((entry) => {
              const isTop1 = entry.rank === 1;
              const isTop2 = entry.rank === 2;
              const isTop3 = entry.rank === 3;

              return (
                <div
                  key={entry.rank + entry.steamId}
                  className={`flex items-center justify-between py-3.5 px-3 rounded-xl transition-all ${
                    entry.isUser
                      ? 'bg-[#2E2818] border-2 border-[#FFD54F]/70 shadow-[0_0_20px_rgba(255,213,79,0.2)] my-1'
                      : isTop1
                      ? 'bg-[#242013]/60 hover:bg-[#2A2516]'
                      : isTop2
                      ? 'bg-[#1B1F28]/60 hover:bg-[#202530]'
                      : isTop3
                      ? 'bg-[#221A16]/60 hover:bg-[#291F1A]'
                      : 'hover:bg-[#151922]'
                  }`}
                >
                  {/* Left: Rank + Avatar + Nickname & SteamID */}
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-8 flex items-center justify-center font-rajdhani font-black text-lg">
                      {isTop1 ? (
                        <span className="text-2xl drop-shadow-[0_0_8px_rgba(255,213,79,0.8)]">🥇</span>
                      ) : isTop2 ? (
                        <span className="text-2xl drop-shadow-[0_0_8px_rgba(192,192,192,0.8)]">🥈</span>
                      ) : isTop3 ? (
                        <span className="text-2xl drop-shadow-[0_0_8px_rgba(205,127,50,0.8)]">🥉</span>
                      ) : (
                        <span className="text-zinc-500">#{entry.rank}</span>
                      )}
                    </div>

                    <div className="w-10 h-10 rounded-xl bg-[#1A1F2C] border border-[#2B3448] flex items-center justify-center text-lg shadow shrink-0">
                      {entry.avatar}
                    </div>

                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-rajdhani font-bold text-sm sm:text-base truncate ${
                            entry.isUser ? 'text-[#FFE082]' : isTop1 ? 'text-[#FFD54F]' : 'text-white'
                          }`}
                        >
                          {entry.nickname}
                        </span>
                        {entry.isUser && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-black uppercase font-mono">
                            ТЫ
                          </span>
                        )}
                        {isTop1 && (
                          <span className="hidden sm:inline-flex px-1.5 py-0.2 rounded bg-yellow-500/20 text-yellow-300 text-[9px] font-black uppercase font-mono">
                            ЧЕМПИОН
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-zinc-400 font-mono truncate">
                        ID: {entry.steamId} {entry.secondaryInfo ? `• ${entry.secondaryInfo}` : ''}
                      </span>
                    </div>
                  </div>

                  {/* Right: Score Display */}
                  <div className="flex items-center gap-1.5 font-rajdhani font-black text-sm sm:text-base text-right shrink-0">
                    {activeCategory === 'wealth' && <ScrapIcon size="xs" />}
                    <span className={isTop1 ? 'text-[#FFD54F]' : 'text-white'}>
                      {entry.scoreDisplay}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Authentic Rust Empty Qualification Slots */}
            {Array.from({ length: emptySlotsCount }).map((_, i) => {
              const slotRank = currentList.length + i + 1;
              return (
                <div
                  key={`empty_${slotRank}`}
                  className="flex items-center justify-between py-3 px-3 rounded-xl opacity-40 hover:opacity-60 transition-opacity"
                >
                  <div className="flex items-center gap-4">
                    <span className="w-8 text-center font-rajdhani font-black text-sm text-zinc-600">
                      #{slotRank}
                    </span>
                    <div className="w-10 h-10 rounded-xl border border-dashed border-zinc-700 flex items-center justify-center text-xs text-zinc-600">
                      🔒
                    </div>
                    <div className="flex flex-col">
                      <span className="font-rajdhani font-bold text-xs text-zinc-500 uppercase tracking-wider">
                        [ ВАКАНТНЫЙ СЛОТ #{slotRank} ]
                      </span>
                      <span className="text-[10px] text-zinc-600 font-mono">
                        Ожидание нового выжившего Сезона 12
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-zinc-600 font-bold">—</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Server Season Footer Note */}
        <div className="mt-2 pt-3 border-t border-[#1F2533] flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-500 font-mono gap-2">
          <span>СЕРВЕР: [EU/RU] RUSTGRADE #1 • СИНХРОНИЗАЦИЯ: ОНЛАЙН</span>
          <span className="text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            ТОЛЬКО РЕАЛЬНЫЕ УЧАСТНИКИ СЕЗОНА
          </span>
        </div>
      </div>
    </div>
  );
};
