import React, { useState } from 'react';
import { UserProfile } from '../../types';
import { SKINS_MAP } from '../../data/skinsData';
import { ScrapIcon } from '../common/ScrapIcon';
import { Trophy, Target, Package, Crown, Medal, Award, Flame, Shield, Clock } from 'lucide-react';

interface LeaderboardViewProps {
  profile: UserProfile;
  onInspectSkin?: (skinId: string) => void;
}

type LeaderboardCategory = 'wealth' | 'sniper' | 'cases';

interface LeaderboardEntry {
  rank: number;
  nickname: string;
  avatar: string;
  steamId: string;
  isUser?: boolean;
  scoreDisplay: string;
  scoreNumeric: number;
  secondaryInfo?: string;
  trophy?: 'gold' | 'silver' | 'bronze';
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  profile,
  onInspectSkin,
}) => {
  const [activeCategory, setActiveCategory] = useState<LeaderboardCategory>('wealth');

  // Calculate User's Total Wealth (Balance + Inventory + Staked Items)
  const inventoryValue = profile.inventory.reduce((sum, item) => {
    const s = SKINS_MAP[item.skinId];
    return sum + (s ? s.price : 0);
  }, 0);

  const stakedValue = (profile.stakedItems || []).reduce((sum, item) => {
    const s = SKINS_MAP[item.skinId];
    return sum + (s ? s.price : 0);
  }, 0);

  const userTotalWealth = Number((profile.balance + inventoryValue + stakedValue).toFixed(2));
  const userCasesCount = profile.stats.totalCasesOpened || 0;
  const userBestChance = profile.stats.bestDropChance !== null ? profile.stats.bestDropChance : null;

  // 1. Category 1: Король Острова (Wealth)
  interface RawPlayerEntry {
    nickname: string;
    avatar: string;
    steamId: string;
    scoreNumeric: number;
    secondaryInfo?: string;
    isUser?: boolean;
  }

  const baseWealthPlayers: RawPlayerEntry[] = [
    { nickname: 'Trausi_God', avatar: '👨‍🔬', steamId: '76561198012849120', scoreNumeric: 285400.00 },
    { nickname: 'Hjune_Official', avatar: '😈', steamId: '76561198099124510', scoreNumeric: 198250.00 },
    { nickname: 'Posty_Clips', avatar: '🐺', steamId: '76561198124819201', scoreNumeric: 142800.00 },
    { nickname: 'Bchillz_AK', avatar: '🪨', steamId: '76561198001294812', scoreNumeric: 95400.00 },
    { nickname: 'AloneInTokyo', avatar: '👨‍🔬', steamId: '76561198334192012', scoreNumeric: 64200.00 },
    { nickname: 'Warrior_Rust', avatar: '🐺', steamId: '76561198201948102', scoreNumeric: 42100.00 },
    { nickname: 'Frost_Movie', avatar: '😈', steamId: '76561198114920194', scoreNumeric: 28900.00 },
    { nickname: 'Spoonkid_Monke', avatar: '🪨', steamId: '76561198059102941', scoreNumeric: 18200.00 },
  ];

  const wealthList: LeaderboardEntry[] = [
    ...baseWealthPlayers,
    {
      nickname: profile.nickname,
      avatar: profile.avatar === 'naked' ? '🪨' : profile.avatar === 'big_grin' ? '😈' : profile.avatar === 'wolf' ? '🐺' : '👨‍🔬',
      steamId: profile.steamId || profile.id,
      scoreNumeric: userTotalWealth,
      isUser: true,
    },
  ]
    .sort((a, b) => b.scoreNumeric - a.scoreNumeric)
    .map((p, idx) => ({
      ...p,
      rank: idx + 1,
      scoreDisplay: `${p.scoreNumeric.toFixed(2)} ⚙️`,
      secondaryInfo: p.isUser ? 'Твой профиль' : 'Клан [TITAN]',
      trophy: idx === 0 ? 'gold' : idx === 1 ? 'silver' : idx === 2 ? 'bronze' : undefined,
    }));

  // 2. Category 2: Снайпер Рулетки (Best Low Chance Upgrade)
  const baseSniperPlayers: RawPlayerEntry[] = [
    { nickname: 'LuckyNaked_777', avatar: '🪨', steamId: '76561198099912041', scoreNumeric: 0.85, secondaryInfo: 'Helk Mask с шансом 0.85%' },
    { nickname: 'Posty_Clips', avatar: '🐺', steamId: '76561198124819201', scoreNumeric: 1.20, secondaryInfo: 'Big Grin с шансом 1.20%' },
    { nickname: 'Trausi_God', avatar: '👨‍🔬', steamId: '76561198012849120', scoreNumeric: 1.50, secondaryInfo: 'Tempered AK с шансом 1.50%' },
    { nickname: 'Frost_Movie', avatar: '😈', steamId: '76561198114920194', scoreNumeric: 2.10, secondaryInfo: 'Glory Mask с шансом 2.10%' },
    { nickname: 'Warrior_Rust', avatar: '🐺', steamId: '76561198201948102', scoreNumeric: 2.80, secondaryInfo: 'Alien Relic с шансом 2.80%' },
  ];

  const sniperList: LeaderboardEntry[] = [
    ...baseSniperPlayers,
    ...(userBestChance !== null
      ? [
          {
            nickname: profile.nickname,
            avatar: profile.avatar === 'naked' ? '🪨' : profile.avatar === 'big_grin' ? '😈' : profile.avatar === 'wolf' ? '🐺' : '👨‍🔬',
            steamId: profile.steamId || profile.id,
            scoreNumeric: userBestChance,
            secondaryInfo: profile.stats.bestDropSkinId
              ? `${SKINS_MAP[profile.stats.bestDropSkinId]?.name || 'Скин'} (шанс ${userBestChance.toFixed(2)}%)`
              : `Шанс ${userBestChance.toFixed(2)}%`,
            isUser: true,
          },
        ]
      : []),
  ]
    .sort((a, b) => a.scoreNumeric - b.scoreNumeric)
    .map((p, idx) => ({
      ...p,
      rank: idx + 1,
      scoreDisplay: `${p.scoreNumeric.toFixed(2)}% ШАНС`,
      trophy: idx === 0 ? 'gold' : idx === 1 ? 'silver' : idx === 2 ? 'bronze' : undefined,
    }));

  // 3. Category 3: Кейс-магнат (Total Cases Opened)
  const baseCasesPlayers: RawPlayerEntry[] = [
    { nickname: 'Hjune_Official', avatar: '😈', steamId: '76561198099124510', scoreNumeric: 1420 },
    { nickname: 'Bchillz_AK', avatar: '🪨', steamId: '76561198001294812', scoreNumeric: 980 },
    { nickname: 'Trausi_God', avatar: '👨‍🔬', steamId: '76561198012849120', scoreNumeric: 740 },
    { nickname: 'Spoonkid_Monke', avatar: '🪨', steamId: '76561198059102941', scoreNumeric: 512 },
    { nickname: 'AloneInTokyo', avatar: '👨‍🔬', steamId: '76561198334192012', scoreNumeric: 310 },
  ];

  const casesList: LeaderboardEntry[] = [
    ...baseCasesPlayers,
    {
      nickname: profile.nickname,
      avatar: profile.avatar === 'naked' ? '🪨' : profile.avatar === 'big_grin' ? '😈' : profile.avatar === 'wolf' ? '🐺' : '👨‍🔬',
      steamId: profile.steamId || profile.id,
      scoreNumeric: userCasesCount,
      isUser: true,
      secondaryInfo: 'Твои открытия',
    },
  ]
    .sort((a, b) => b.scoreNumeric - a.scoreNumeric)
    .map((p, idx) => ({
      ...p,
      rank: idx + 1,
      scoreDisplay: `${p.scoreNumeric} ящиков`,
      trophy: idx === 0 ? 'gold' : idx === 1 ? 'silver' : idx === 2 ? 'bronze' : undefined,
    }));

  const currentList =
    activeCategory === 'wealth' ? wealthList : activeCategory === 'sniper' ? sniperList : casesList;

  const userEntry = currentList.find((e) => e.isUser);

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
                HALL OF FAME • СЕЗОН #12
              </span>
            </div>

            <h1 className="font-rajdhani font-black text-2xl sm:text-3xl text-white tracking-wider uppercase">
              Доска Почёта <span className="text-[#FFD54F]">Игроков Rust</span>
            </h1>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans">
              Рейтинги лучших игроков недели. Топ-3 каждого списка получают чемпионские золотые, серебряные и бронзовые кубки в профиль!
            </p>
          </div>

          {/* User's Current Standing Card */}
          <div className="flex items-center gap-4 bg-[#0C0F15]/90 border border-[#2B3345] p-4 rounded-xl backdrop-blur-md shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#1B2232] border border-[#2D374D] flex items-center justify-center text-xl shadow">
                {userEntry?.trophy === 'gold' ? '🥇' : userEntry?.trophy === 'silver' ? '🥈' : userEntry?.trophy === 'bronze' ? '🥉' : '👤'}
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                  Твоя позиция
                </span>
                <span className="font-rajdhani font-black text-xl text-white">
                  {userEntry ? `#${userEntry.rank} в рейтинге` : 'Вне топа'}
                </span>
                <span className="text-xs text-[#FFD54F] font-mono font-bold">
                  {userEntry?.scoreDisplay || '0'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Category Switcher Tabs */}
        <div className="relative z-10 mt-6 pt-4 border-t border-[#252E40] flex items-center gap-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveCategory('wealth')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-rajdhani font-black text-xs uppercase tracking-wider transition-all ${
              activeCategory === 'wealth'
                ? 'bg-[#FFD54F] text-black shadow-[0_0_20px_rgba(255,213,79,0.4)]'
                : 'bg-[#121620] text-zinc-400 hover:text-white border border-[#242C3D]'
            }`}
          >
            <Crown className="w-4 h-4" />
            <span>🥇 КОРОЛЬ ОСТРОВА (БОГАТЕЙШИЕ)</span>
          </button>

          <button
            onClick={() => setActiveCategory('sniper')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-rajdhani font-black text-xs uppercase tracking-wider transition-all ${
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
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-rajdhani font-black text-xs uppercase tracking-wider transition-all ${
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
      <div className="rounded-2xl bg-gradient-to-b from-[#181C26] via-[#12151E] to-[#0E1017] border-2 border-[#282F40] p-5 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#232A3B] text-xs font-bold text-zinc-400 uppercase tracking-wider">
          <div className="flex items-center gap-4">
            <span className="w-8 text-center">#</span>
            <span>Игрок / Профиль</span>
          </div>
          <span>Результат</span>
        </div>

        <div className="divide-y divide-[#1D2332]">
          {currentList.map((entry) => {
            const isTop1 = entry.rank === 1;
            const isTop2 = entry.rank === 2;
            const isTop3 = entry.rank === 3;

            return (
              <div
                key={entry.rank + entry.nickname}
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
        </div>
      </div>
    </div>
  );
};
