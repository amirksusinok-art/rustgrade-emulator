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
    gradient: string;
    border: string;
    borderHover: string;
    textColor: string;
    auraColor: string;
  }
> = {
  contraband: {
    gradient: 'from-[#3a2c0d] via-[#1c1506] to-[#0e0a03]',
    border: 'border-[#FFB800]',
    borderHover: 'group-hover:border-[#FFD54F] group-hover:shadow-[0_0_18px_rgba(255,184,0,0.4)]',
    textColor: 'text-[#FFD54F]',
    auraColor: 'radial-gradient(circle, rgba(255,184,0,0.28) 0%, transparent 70%)',
  },
  master: {
    gradient: 'from-[#3a1415] via-[#1e0a0b] to-[#0f0505]',
    border: 'border-[#E53935]',
    borderHover: 'group-hover:border-[#EF5350] group-hover:shadow-[0_0_18px_rgba(229,57,53,0.4)]',
    textColor: 'text-[#EF5350]',
    auraColor: 'radial-gradient(circle, rgba(229,57,53,0.28) 0%, transparent 70%)',
  },
  classified: {
    gradient: 'from-[#34143f] via-[#1c0a22] to-[#0e0511]',
    border: 'border-[#8E24AA]',
    borderHover: 'group-hover:border-[#BA68C8] group-hover:shadow-[0_0_18px_rgba(142,36,170,0.4)]',
    textColor: 'text-[#CE93D8]',
    auraColor: 'radial-gradient(circle, rgba(142,36,170,0.28) 0%, transparent 70%)',
  },
  restricted: {
    gradient: 'from-[#12283d] via-[#091520] to-[#040a10]',
    border: 'border-[#1E88E5]',
    borderHover: 'group-hover:border-[#64B5F6] group-hover:shadow-[0_0_18px_rgba(30,136,229,0.4)]',
    textColor: 'text-[#64B5F6]',
    auraColor: 'radial-gradient(circle, rgba(30,136,229,0.28) 0%, transparent 70%)',
  },
  'mil-spec': {
    gradient: 'from-[#143317] via-[#0a1a0c] to-[#050e06]',
    border: 'border-[#43A047]',
    borderHover: 'group-hover:border-[#81C784] group-hover:shadow-[0_0_18px_rgba(67,160,71,0.4)]',
    textColor: 'text-[#81C784]',
    auraColor: 'radial-gradient(circle, rgba(67,160,71,0.28) 0%, transparent 70%)',
  },
  industrial: {
    gradient: 'from-[#22262e] via-[#13151a] to-[#0a0b0d]',
    border: 'border-[#546E7A]',
    borderHover: 'group-hover:border-[#90A4AE] group-hover:shadow-[0_0_14px_rgba(84,110,122,0.3)]',
    textColor: 'text-[#B0BEC5]',
    auraColor: 'radial-gradient(circle, rgba(84,110,122,0.18) 0%, transparent 70%)',
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
        relative group rounded-lg border-2 ${theme.border} ${theme.borderHover}
        bg-gradient-to-b ${theme.gradient}
        ${isSelected ? 'ring-2 ring-primary-red ring-offset-2 ring-offset-[#0D0F12] scale-[1.02]' : ''}
        transition-all duration-200 cursor-pointer overflow-hidden flex flex-col justify-between
        hover:brightness-110 active:scale-[0.98] select-none
        ${compact ? 'p-2 min-h-[160px]' : 'p-3 min-h-[185px]'}
      `}
    >
      {/* Top action bar: Item category label and quick action buttons */}
      <div className="flex items-center justify-between w-full z-10">
        <span className="text-[10px] font-bold uppercase tracking-wider text-white/60 truncate max-w-[75%]">
          {skin.type}
        </span>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onInspect && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onInspect();
              }}
              className="p-1 rounded bg-black/70 hover:bg-black text-white/80 hover:text-white transition-colors"
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
              className="p-1 rounded bg-red-600/90 hover:bg-red-600 text-white transition-colors"
              title="Убрать"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Selected Indicator Checkmark */}
      {isSelected && (
        <div className="absolute top-2 right-2 bg-primary-red text-white p-0.5 rounded z-20 shadow-lg">
          <Check className="w-3.5 h-3.5 stroke-[3]" />
        </div>
      )}

      {/* Item Image with atmospheric rarity glow & large scale */}
      <div className="relative w-full flex items-center justify-center my-1 h-24 sm:h-28 overflow-hidden">
        {/* Soft Radial Aura behind the skin */}
        <div
          className="absolute inset-0 rounded-full blur-md pointer-events-none opacity-45 group-hover:opacity-85 transition-opacity"
          style={{ background: theme.auraColor }}
        />

        <img
          src={`/images/skins/${skin.localFile}`}
          alt={skin.name}
          onError={(e) => {
            (e.target as HTMLImageElement).src = skin.iconUrl;
          }}
          className="max-h-full max-w-full object-contain scale-125 group-hover:scale-135 transition-transform duration-300 ease-out drop-shadow-[0_8px_16px_rgba(0,0,0,0.9)] filter"
          loading="lazy"
        />
      </div>

      {/* Bottom info: Name & Price strictly styled like original Rustgrade */}
      <div className="w-full z-10 flex flex-col items-center text-center mt-1">
        <span
          className={`font-rajdhani font-black text-xs sm:text-sm uppercase tracking-wide truncate w-full block ${theme.textColor}`}
          title={skin.name}
        >
          {skin.name}
        </span>

        <div className="flex items-center justify-center gap-1 mt-0.5 font-rajdhani font-black text-xs sm:text-sm text-[#FFD54F]">
          <ScrapIcon size="xs" />
          <span>{skin.price.toFixed(2)}</span>
        </div>

        {/* Hover Action Badge: BUY in shop, SELL in inventory */}
        {isShopItem && onBuy && (
          <div className="mt-1.5 w-full opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBuy();
              }}
              className="w-full py-1 rounded bg-[#4CAF50] hover:bg-[#43A047] text-white text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 shadow-md transition-all active:scale-95"
            >
              <ShoppingCart className="w-3 h-3 stroke-[2.5]" />
              <span>Купить</span>
            </button>
          </div>
        )}

        {!isShopItem && showSellButton && onSell && (
          <div className="mt-1.5 w-full opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSell();
              }}
              className="w-full py-1 rounded bg-zinc-800 hover:bg-red-700 text-white text-[10px] font-black uppercase tracking-wider transition-colors shadow-md active:scale-95"
            >
              Продать
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
