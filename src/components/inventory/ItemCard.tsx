import React from 'react';
import { SkinDefinition, ItemRarity } from '../../types';
import { Eye, Trash2, Check, ShoppingCart } from 'lucide-react';
import { ScrapIcon } from '../common/ScrapIcon';

interface ItemCardProps {
  skin: SkinDefinition;
  isSelected?: boolean;
  onSelect?: () => void;
  onInspect?: () => void;
  onSell?: () => void;
  onRemove?: () => void;
  onBuy?: () => void;
  isShopItem?: boolean;
  showSellButton?: boolean;
  compact?: boolean;
}

const RARITY_THEMES: Record<
  ItemRarity,
  {
    bg: string;
    borderTop: string;
    textColor: string;
  }
> = {
  contraband: {
    bg: 'bg-gradient-to-b from-[#5c4a16] via-[#3d310e] to-[#1c1606]',
    borderTop: 'border-t-[#FFB800]',
    textColor: 'text-[#FFD54F]',
  },
  master: {
    bg: 'bg-gradient-to-b from-[#4a1818] via-[#320f0f] to-[#170606]',
    borderTop: 'border-t-[#E53935]',
    textColor: 'text-[#EF5350]',
  },
  classified: {
    bg: 'bg-gradient-to-b from-[#3d184a] via-[#280e30] to-[#120617]',
    borderTop: 'border-t-[#8E24AA]',
    textColor: 'text-[#CE93D8]',
  },
  restricted: {
    bg: 'bg-gradient-to-b from-[#162e45] via-[#0d1d2b] to-[#060c13]',
    borderTop: 'border-t-[#1E88E5]',
    textColor: 'text-[#64B5F6]',
  },
  'mil-spec': {
    bg: 'bg-gradient-to-b from-[#1b3d1b] via-[#102410] to-[#061006]',
    borderTop: 'border-t-[#43A047]',
    textColor: 'text-[#81C784]',
  },
  industrial: {
    bg: 'bg-gradient-to-b from-[#2b2e34] via-[#1c1e22] to-[#0e0f11]',
    borderTop: 'border-t-[#78909C]',
    textColor: 'text-[#B0BEC5]',
  },
};

export const ItemCard: React.FC<ItemCardProps> = ({
  skin,
  isSelected = false,
  onSelect,
  onInspect,
  onSell,
  onRemove,
  onBuy,
  isShopItem = false,
  showSellButton = false,
  compact = false,
}) => {
  const theme = RARITY_THEMES[skin.rarity] || RARITY_THEMES.industrial;

  return (
    <div
      onClick={isShopItem ? onBuy : onSelect}
      className={`
        relative group rounded-md border border-[#232731] border-t-2 ${theme.borderTop}
        ${theme.bg} ${isSelected ? 'ring-2 ring-primary-red ring-offset-1 ring-offset-[#0D0F12]' : ''}
        transition-all duration-150 cursor-pointer overflow-hidden flex flex-col justify-between
        hover:brightness-110 active:scale-[0.98]
        ${compact ? 'p-2 min-h-[135px]' : 'p-2.5 min-h-[160px]'}
      `}
    >
      {/* Top action icons */}
      <div className="flex items-center justify-between w-full z-10">
        <span className="text-[9px] uppercase tracking-wider font-bold text-white/50 truncate max-w-[75%]">
          {skin.type}
        </span>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onInspect && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onInspect();
              }}
              className="p-1 rounded bg-black/60 hover:bg-black text-white/70 hover:text-white transition-colors"
              title="3D Осмотр"
            >
              <Eye className="w-3 h-3" />
            </button>
          )}

          {onRemove && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="p-1 rounded bg-red-600/80 hover:bg-red-600 text-white transition-colors"
              title="Убрать"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Selected Indicator Checkmark */}
      {isSelected && (
        <div className="absolute top-1.5 right-1.5 bg-primary-red text-white p-0.5 rounded z-20 shadow">
          <Check className="w-3 h-3 stroke-[3]" />
        </div>
      )}

      {/* Item Image */}
      <div className="relative w-full flex items-center justify-center my-1.5 py-1">
        <img
          src={`/images/skins/${skin.localFile}`}
          alt={skin.name}
          onError={(e) => {
            (e.target as HTMLImageElement).src = skin.iconUrl;
          }}
          className={`
            object-contain drop-shadow-[0_6px_10px_rgba(0,0,0,0.8)]
            group-hover:scale-105 transition-transform duration-200 ease-out
            ${compact ? 'max-h-16 w-auto' : 'max-h-20 w-auto'}
          `}
          loading="lazy"
        />
      </div>

      {/* Bottom info: Name & Price strictly styled like Photo 2 */}
      <div className="w-full z-10 flex flex-col items-center text-center mt-1">
        <span
          className={`text-[11px] font-extrabold uppercase tracking-wide truncate w-full block ${theme.textColor}`}
          title={skin.name}
        >
          {skin.name}
        </span>

        <div className="flex items-center justify-center gap-1 mt-0.5 font-rajdhani font-black text-xs text-[#FFD54F]">
          <ScrapIcon size="xs" />
          <span>{skin.price.toFixed(2)}</span>
        </div>

        {/* Hover Action Badge: BUY in shop, SELL in inventory */}
        {isShopItem && onBuy && (
          <div className="mt-1 w-full opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBuy();
              }}
              className="w-full py-0.5 rounded bg-success-green hover:bg-success-green-hover text-white text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 shadow"
            >
              <ShoppingCart className="w-2.5 h-2.5" />
              <span>Купить</span>
            </button>
          </div>
        )}

        {!isShopItem && showSellButton && onSell && (
          <div className="mt-1 w-full opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSell();
              }}
              className="w-full py-0.5 rounded bg-zinc-700 hover:bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider transition-colors"
            >
              Продать
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
