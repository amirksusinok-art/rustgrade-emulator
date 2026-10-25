import React from 'react';
import { SkinDefinition, ItemRarity } from '../../types';
import { Eye, Trash2, Check } from 'lucide-react';

interface ItemCardProps {
  skin: SkinDefinition;
  isSelected?: boolean;
  onSelect?: () => void;
  onInspect?: () => void;
  onSell?: () => void;
  onRemove?: () => void;
  showSellButton?: boolean;
  compact?: boolean;
}

const RARITY_CONFIG: Record<
  ItemRarity,
  {
    border: string;
    bg: string;
    badge: string;
    glow: string;
    label: string;
  }
> = {
  contraband: {
    border: 'border-[#FFB800]',
    bg: 'from-[#3d3514] to-[#171610]',
    badge: 'bg-[#FFB800]/20 text-[#FFB800] border-[#FFB800]/40',
    glow: 'hover:shadow-[0_0_15px_rgba(255,184,0,0.35)]',
    label: 'Contraband',
  },
  master: {
    border: 'border-[#E53935]',
    bg: 'from-[#381616] to-[#181111]',
    badge: 'bg-[#E53935]/20 text-[#E53935] border-[#E53935]/40',
    glow: 'hover:shadow-[0_0_15px_rgba(229,57,53,0.35)]',
    label: 'Master',
  },
  classified: {
    border: 'border-[#8E24AA]',
    bg: 'from-[#2a1538] to-[#141018]',
    badge: 'bg-[#8E24AA]/20 text-[#BA68C8] border-[#8E24AA]/40',
    glow: 'hover:shadow-[0_0_15px_rgba(142,36,170,0.3)]',
    label: 'Classified',
  },
  restricted: {
    border: 'border-[#1E88E5]',
    bg: 'from-[#122538] to-[#0f1418]',
    badge: 'bg-[#1E88E5]/20 text-[#64B5F6] border-[#1E88E5]/40',
    glow: 'hover:shadow-[0_0_15px_rgba(30,136,229,0.3)]',
    label: 'Restricted',
  },
  'mil-spec': {
    border: 'border-[#43A047]',
    bg: 'from-[#153018] to-[#0f1810]',
    badge: 'bg-[#43A047]/20 text-[#81C784] border-[#43A047]/40',
    glow: 'hover:shadow-[0_0_15px_rgba(67,160,71,0.3)]',
    label: 'Mil-Spec',
  },
  industrial: {
    border: 'border-[#616161]',
    bg: 'from-[#22252a] to-[#141517]',
    badge: 'bg-[#616161]/20 text-[#B0BEC5] border-[#616161]/40',
    glow: 'hover:shadow-[0_0_10px_rgba(150,150,150,0.2)]',
    label: 'Industrial',
  },
};

export const ItemCard: React.FC<ItemCardProps> = ({
  skin,
  isSelected = false,
  onSelect,
  onInspect,
  onSell,
  onRemove,
  showSellButton = false,
  compact = false,
}) => {
  const rarity = RARITY_CONFIG[skin.rarity] || RARITY_CONFIG.industrial;

  return (
    <div
      onClick={onSelect}
      className={`
        relative group rounded-xl border bg-gradient-to-b ${rarity.bg}
        ${isSelected ? `${rarity.border} ring-2 ring-primary-red/80 shadow-[0_0_18px_rgba(229,57,53,0.4)]` : `${rarity.border}/70 hover:${rarity.border}`}
        ${rarity.glow} transition-all duration-200 cursor-pointer overflow-hidden flex flex-col justify-between
        ${compact ? 'p-2 min-h-[120px]' : 'p-2.5 min-h-[155px]'}
      `}
    >
      {/* Top badges bar */}
      <div className="flex items-center justify-between w-full z-10 gap-1">
        <span
          className={`
            text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border
            ${rarity.badge}
          `}
        >
          {skin.type}
        </span>

        {/* Quick action icons */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onInspect && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onInspect();
              }}
              className="p-1 rounded bg-[#1B202A]/80 hover:bg-[#262B37] text-text-secondary hover:text-white transition-colors"
              title="3D Осмотр"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          )}

          {onRemove && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="p-1 rounded bg-[#E53935]/20 hover:bg-[#E53935] text-[#FFCDD2] hover:text-white transition-colors"
              title="Убрать"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Selected Indicator Checkmark */}
      {isSelected && (
        <div className="absolute top-2 right-2 bg-primary-red text-white p-0.5 rounded-full z-20 shadow-md">
          <Check className="w-3.5 h-3.5 stroke-[3]" />
        </div>
      )}

      {/* Item Image with hover zoom */}
      <div className="relative w-full flex items-center justify-center my-1 py-1">
        <img
          src={`/images/skins/${skin.localFile}`}
          alt={skin.name}
          onError={(e) => {
            // Fallback to Steam CDN if local fails
            (e.target as HTMLImageElement).src = skin.iconUrl;
          }}
          className={`
            object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.6)]
            group-hover:scale-110 transition-transform duration-300 ease-out
            ${compact ? 'max-h-16 w-auto' : 'max-h-20 w-auto'}
          `}
          loading="lazy"
        />
      </div>

      {/* Bottom Info: Name & Price */}
      <div className="w-full z-10 flex flex-col gap-0.5">
        <span
          className="text-xs font-semibold text-text-primary truncate block"
          title={skin.name}
        >
          {skin.name}
        </span>

        <div className="flex items-center justify-between mt-0.5">
          <div className="flex items-center gap-1 font-rajdhani font-bold text-sm text-[#FFD54F]">
            <span className="text-xs">⚙️</span>
            <span>{skin.price.toFixed(2)}</span>
          </div>

          {showSellButton && onSell && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSell();
              }}
              className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#4CAF50]/20 hover:bg-[#4CAF50] text-[#A5D6A7] hover:text-white transition-colors"
              title="Продать за Scrap"
            >
              Продать
            </button>
          )}
        </div>
      </div>

      {/* Subtle shine overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </div>
  );
};
