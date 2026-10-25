import React, { useState, useEffect } from 'react';
import { LiveDrop } from '../../types';
import { SKINS_DATA } from '../../data/skinsData';
import { Radio } from 'lucide-react';

const BOTS = [
  'SoloGrinder',
  'NakedWithRock',
  'Roofcamper',
  'OilRig_Raider',
  'SulfurFarmer',
  'AK_God',
  'BanditKing',
  'CodelockWarrior',
  'ScrapHoarder',
  'BunkerLord',
];

const BOT_AVATARS = ['scientist', 'naked', 'big_grin', 'wolf'];

export const LiveDropsBar: React.FC = () => {
  const [drops, setDrops] = useState<LiveDrop[]>(() => {
    // Generate initial 8 drops
    return Array.from({ length: 8 }).map((_, i) => {
      const skin = SKINS_DATA[Math.floor(Math.random() * SKINS_DATA.length)];
      const botName = BOTS[Math.floor(Math.random() * BOTS.length)];
      const avatar = BOT_AVATARS[Math.floor(Math.random() * BOT_AVATARS.length)];
      const chance = Number((Math.random() * 70 + 8).toFixed(2));
      return {
        id: `drop_${Date.now()}_${i}`,
        botName,
        avatar,
        skin,
        chance,
        timestamp: Date.now() - i * 6000,
      };
    });
  });

  // Periodically add new drops
  useEffect(() => {
    const interval = setInterval(() => {
      const skin = SKINS_DATA[Math.floor(Math.random() * SKINS_DATA.length)];
      const botName = BOTS[Math.floor(Math.random() * BOTS.length)];
      const avatar = BOT_AVATARS[Math.floor(Math.random() * BOT_AVATARS.length)];
      const chance = Number((Math.random() * 72 + 6).toFixed(2));

      const newDrop: LiveDrop = {
        id: `drop_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        botName,
        avatar,
        skin,
        chance,
        timestamp: Date.now(),
      };

      setDrops((prev) => [newDrop, ...prev.slice(0, 15)]);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-[#0D0F12]/95 border-b border-border-dark py-1.5 px-4 overflow-hidden relative flex items-center z-20">
      {/* Live Badge */}
      <div className="flex items-center gap-1.5 shrink-0 pr-3 border-r border-border-dark mr-3 text-xs font-bold text-text-secondary uppercase tracking-wider">
        <Radio className="w-3.5 h-3.5 text-primary-red animate-pulse" />
        <span className="hidden sm:inline">LIVE DROPS</span>
      </div>

      {/* Ticker Row */}
      <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-0.5">
        {drops.map((drop) => (
          <div
            key={drop.id}
            className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-[#14171E] border border-border-dark hover:border-border-light shrink-0 transition-all hover:scale-105 shadow-sm group"
          >
            <img
              src={`/images/skins/${drop.skin.localFile}`}
              alt={drop.skin.name}
              className="w-7 h-7 object-contain drop-shadow"
              loading="lazy"
            />

            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-text-muted truncate max-w-[90px]">
                {drop.botName}
              </span>
              <div className="flex items-center gap-1 text-[11px] font-rajdhani font-bold">
                <span className="text-[#FFD54F]">⚙️{drop.skin.price.toFixed(0)}</span>
                <span className="text-[9px] text-text-muted">({drop.chance}%)</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
