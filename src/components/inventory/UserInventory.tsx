import React, { useState, useMemo } from 'react';
import { InventoryItem } from '../../types';
import { SKINS_MAP } from '../../data/skinsData';
import { ItemCard } from './ItemCard';
import { ArrowUpDown, Trash2, PackageOpen, Wrench } from 'lucide-react';

interface UserInventoryProps {
  inventory: InventoryItem[];
  selectedItemIds: string[];
  onToggleSelect: (instanceId: string) => void;
  onSellItem: (instanceId: string) => void;
  onSellAll: () => void;
  onInspectSkin: (skinId: string) => void;
  onMineScrap: () => void;
  disabled?: boolean;
}

export const UserInventory: React.FC<UserInventoryProps> = ({
  inventory,
  selectedItemIds,
  onToggleSelect,
  onSellItem,
  onSellAll,
  onInspectSkin,
  onMineScrap,
  disabled = false,
}) => {
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Compute total inventory value
  const totalValue = useMemo(() => {
    return inventory.reduce((sum, item) => {
      const skin = SKINS_MAP[item.skinId];
      return sum + (skin ? skin.price : 0);
    }, 0);
  }, [inventory]);

  // Sort inventory
  const sortedInventory = useMemo(() => {
    return [...inventory].sort((a, b) => {
      const priceA = SKINS_MAP[a.skinId]?.price || 0;
      const priceB = SKINS_MAP[b.skinId]?.price || 0;
      return sortOrder === 'desc' ? priceB - priceA : priceA - priceB;
    });
  }, [inventory, sortOrder]);

  return (
    <div className="w-full bg-surface-card border border-border-dark rounded-2xl p-4 md:p-5 flex flex-col justify-between h-full shadow-lg">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-border-dark/70 gap-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm md:text-base font-bold uppercase tracking-wider text-text-primary">
            МОЙ ИНВЕНТАРЬ
          </h3>
          <span className="px-2 py-0.5 rounded-full bg-[#1B202A] text-xs font-rajdhani font-bold text-text-secondary border border-border-dark">
            {inventory.length} шт
          </span>
        </div>

        {/* Total Value & Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0D0F12] border border-border-dark font-rajdhani font-bold text-sm text-[#FFD54F]">
            <span className="text-xs text-text-muted">ВСЕГО:</span>
            <span>⚙️ {totalValue.toFixed(2)}</span>
          </div>

          <button
            onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
            className="p-1.5 rounded-lg bg-[#1B202A] hover:bg-[#262B37] text-text-secondary hover:text-white border border-border-dark transition-colors"
            title={`Сортировка по цене (${sortOrder === 'desc' ? 'убывание' : 'возрастание'})`}
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>

          {inventory.length > 0 && !disabled && (
            <button
              onClick={onSellAll}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-500/15 hover:bg-red-500 text-[#FFCDD2] hover:text-white border border-red-500/30 text-xs font-bold uppercase tracking-wider transition-all"
              title="Продать все предметы за Scrap"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Продать всё</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid of Items / Empty State */}
      <div className="my-3 min-h-[380px] max-h-[520px] overflow-y-auto pr-1">
        {inventory.length === 0 ? (
          <div className="h-full min-h-[340px] flex flex-col items-center justify-center text-center p-6 bg-[#0D0F12]/60 rounded-xl border border-dashed border-border-dark">
            <PackageOpen className="w-16 h-16 text-text-muted/40 mb-3" />
            <h4 className="text-base font-bold text-white uppercase tracking-wider">
              У вас пока нет скинов
            </h4>
            <p className="text-xs text-text-muted max-w-xs mt-1">
              Добудьте Scrap кликером или используйте промокод <span className="text-white font-mono font-bold">START</span> (+25 ⚙️) в профиле!
            </p>
            <button
              onClick={onMineScrap}
              className="mt-4 px-4 py-2 rounded-xl bg-success-green hover:bg-success-green-hover text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(76,175,80,0.3)] transition-all"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>+ ДОБЫТЬ SCRAP</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {sortedInventory.map((item) => {
              const skin = SKINS_MAP[item.skinId];
              if (!skin) return null;
              const isSelected = selectedItemIds.includes(item.instanceId);

              return (
                <ItemCard
                  key={item.instanceId}
                  skin={skin}
                  isSelected={isSelected}
                  onSelect={() => !disabled && onToggleSelect(item.instanceId)}
                  onInspect={() => onInspectSkin(skin.id)}
                  onSell={() => !disabled && onSellItem(item.instanceId)}
                  showSellButton={true}
                  compact={true}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Inventory hint */}
      <div className="pt-2 border-t border-border-dark/60 text-[11px] text-text-muted flex items-center justify-between">
        <span>Кликните по скину для добавления в ставку</span>
        <span>Макс. 8 предметов</span>
      </div>
    </div>
  );
};
