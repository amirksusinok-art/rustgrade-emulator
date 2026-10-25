import React from 'react';
import { UpgradeRound } from '../../types';
import { SKINS_DATA, SKINS_MAP } from '../../data/skinsData';
import { ChevronRight, Users, Flame } from 'lucide-react';

interface LeftSidebarProps {
  roundHistory: UpgradeRound[];
  onInspectSkin?: (skinId: string) => void;
}

interface SidebarItem {
  id: string;
  skinId: string;
  chance: number;
  isWin: boolean;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  roundHistory,
  onInspectSkin,
}) => {
  // Combine real user round history with authentic default history
  const defaultHistory: SidebarItem[] = React.useMemo(() => {
    return [
      { id: 'def_1', skinId: 'neon_dragon_garage_door', chance: 24.33, isWin: true },
      { id: 'def_2', skinId: 'camo_netting', chance: 70.04, isWin: true },
      { id: 'def_3', skinId: 'plate_carrier___black', chance: 27.82, isWin: true },
      { id: 'def_4', skinId: 'christmas_lights', chance: 75.03, isWin: true },
      { id: 'def_5', skinId: 'crime_bag', chance: 70.59, isWin: true },
      { id: 'def_6', skinId: 'stainless_facemask', chance: 27.33, isWin: true },
      { id: 'def_7', skinId: 'forest_raiders_roadsign_pants', chance: 70.55, isWin: true },
      { id: 'def_8', skinId: 'glory_ak47', chance: 18.42, isWin: true },
    ];
  }, []);

  const items: SidebarItem[] = React.useMemo(() => {
    const userItems: SidebarItem[] = roundHistory.map((r) => ({
      id: r.id,
      skinId: r.targetSkinId,
      chance: r.winProbability,
      isWin: r.isWin,
    }));
    return [...userItems, ...defaultHistory].slice(0, 12);
  }, [roundHistory, defaultHistory]);

  return (
    <aside className="hidden xl:flex flex-col w-32 shrink-0 bg-[#0E1015]/95 border-r border-[#232731] min-h-screen p-2 select-none z-20">
      {/* 1. Wipe Battlepass Banner (Фото 4) */}
      <div className="w-full bg-gradient-to-r from-[#B71C1C] via-[#C62828] to-[#D32F2F] hover:brightness-110 rounded p-1.5 flex flex-col items-center text-center cursor-pointer shadow-md mb-2 transition-all">
        <span className="text-[10px] font-black uppercase tracking-wider text-white flex items-center gap-0.5">
          <span>ВАЙП</span>
          <ChevronRight className="w-3 h-3" />
        </span>
        <span className="text-[8px] font-bold text-amber-200/90 tracking-wide uppercase">
          БОЕВОЙ ПРОПУСК
        </span>
      </div>

      {/* 2. Online & Total Upgrades stats (Фото 4) */}
      <div className="flex flex-col gap-1 pb-2 border-b border-[#232731] mb-2 px-1 text-[9px] font-bold">
        <div className="flex items-center gap-1 text-[#81C784]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4CAF50] animate-pulse" />
          <span className="text-text-muted uppercase">ОНЛАЙН:</span>
          <span className="text-white font-rajdhani text-[11px] font-extrabold ml-auto">
            1 006
          </span>
        </div>

        <div className="flex items-center gap-1 text-[#FF8A80]">
          <Flame className="w-2.5 h-2.5 text-primary-red" />
          <span className="text-text-muted uppercase">АПГРЕЙДОВ:</span>
          <span className="text-white font-rajdhani text-[11px] font-extrabold ml-auto">
            42 815 958
          </span>
        </div>
      </div>

      {/* 3. Vertical Cards Stream (Фото 4) */}
      <div className="flex flex-col gap-2 overflow-y-auto pr-0.5 no-scrollbar">
        {items.map((item) => {
          const skin = SKINS_MAP[item.skinId] || SKINS_DATA[0];

          return (
            <div
              key={item.id}
              onClick={() => onInspectSkin && onInspectSkin(skin.id)}
              className="relative rounded border border-[#232731] bg-[#14161E] hover:border-[#383E4E] p-1.5 flex flex-col items-center justify-between min-h-[96px] cursor-pointer group transition-all shadow-sm"
              title={`${skin.name} (${item.chance.toFixed(2)}%)`}
            >
              {/* Top Chance Pill with icon */}
              <div className="w-full flex items-center justify-center">
                <span className="px-1.5 py-0.5 rounded text-[9px] font-rajdhani font-black tracking-wide bg-[#0A0C0F]/90 text-[#FFD54F] border border-[#262B37] flex items-center gap-0.5">
                  <span className="text-[8px]">⚡</span>
                  <span>{item.chance.toFixed(2)}%</span>
                </span>
              </div>

              {/* Skin Image */}
              <div className="h-12 w-full flex items-center justify-center my-0.5">
                <img
                  src={`/images/skins/${skin.localFile}`}
                  alt={skin.name}
                  className="max-h-11 object-contain drop-shadow group-hover:scale-105 transition-transform"
                  loading="lazy"
                />
              </div>

              {/* Skin Title */}
              <span className="text-[9px] font-bold uppercase tracking-wider text-text-muted group-hover:text-white truncate w-full text-center">
                {skin.name}
              </span>
            </div>
          );
        })}
      </div>
    </aside>
  );
};
