import React, { useState, useMemo } from 'react';
import { InventoryItem, SkinDefinition } from '../../types';
import { SKINS_DATA, SKINS_MAP } from '../../data/skinsData';
import { ItemCard } from './ItemCard';
import { ShoppingCart, ArrowUpDown, Trash2, Search, X } from 'lucide-react';
import { ScrapIcon } from '../common/ScrapIcon';

interface UserInventoryProps {
  inventory: InventoryItem[];
  userBalance: number;
  selectedItemIds: string[];
  onToggleSelect: (instanceId: string) => void;
  onSellItem: (instanceId: string) => void;
  onSellAll: () => void;
  onBuySkin: (skinId: string) => void;
  onInspectSkin: (skinId: string) => void;
  disabled?: boolean;
}

export const UserInventory: React.FC<UserInventoryProps> = ({
  inventory,
  userBalance,
  selectedItemIds,
  onToggleSelect,
  onSellItem,
  onSellAll,
  onBuySkin,
  onInspectSkin,
  disabled = false,
}) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'shop'>('inventory');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');

  // Total inventory value
  const totalInvValue = useMemo(() => {
    return inventory.reduce((sum, item) => {
      const skin = SKINS_MAP[item.skinId];
      return sum + (skin ? skin.price : 0);
    }, 0);
  }, [inventory]);

  // Filtered & Sorted Inventory
  const displayInventory = useMemo(() => {
    return inventory
      .filter((item) => {
        const skin = SKINS_MAP[item.skinId];
        if (!skin) return false;
        if (searchQuery && !skin.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        const min = parseFloat(minPrice);
        if (!isNaN(min) && skin.price < min) return false;
        const max = parseFloat(maxPrice);
        if (!isNaN(max) && skin.price > max) return false;
        return true;
      })
      .sort((a, b) => {
        const pA = SKINS_MAP[a.skinId]?.price || 0;
        const pB = SKINS_MAP[b.skinId]?.price || 0;
        return sortOrder === 'desc' ? pB - pA : pA - pB;
      });
  }, [inventory, searchQuery, minPrice, maxPrice, sortOrder]);

  // Filtered & Sorted Shop Items
  const displayShopSkins = useMemo(() => {
    return SKINS_DATA
      .filter((skin) => {
        if (searchQuery && !skin.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        const min = parseFloat(minPrice);
        if (!isNaN(min) && skin.price < min) return false;
        const max = parseFloat(maxPrice);
        if (!isNaN(max) && skin.price > max) return false;
        return true;
      })
      .sort((a, b) => {
        return sortOrder === 'desc' ? b.price - a.price : a.price - b.price;
      });
  }, [searchQuery, minPrice, maxPrice, sortOrder]);

  return (
    <div className="w-full bg-[#12141A]/95 border border-[#232731] rounded-lg p-3 flex flex-col justify-between h-full shadow-2xl">
      {/* Top Header strictly matching Photo 5 */}
      {/* Photo 5 shows: [Red AK Icon] [Cart Icon] МОЙ ИНВЕНТАРЬ   [⇅]       ВСЕГО СКИНОВ ⚙ 0.00 */}
      <div className="flex flex-wrap items-center justify-between pb-2.5 border-b border-[#232731] gap-2">
        <div className="flex items-center gap-2">
          {/* Tab 1: Inventory (Red button with AK rifle icon) */}
          <button
            onClick={() => setActiveTab('inventory')}
            className={`
              w-7 h-7 rounded flex items-center justify-center transition-all
              ${
                activeTab === 'inventory'
                  ? 'bg-[#C62828] text-white shadow-[0_0_10px_rgba(198,40,40,0.5)]'
                  : 'bg-[#1B202A] text-text-muted hover:text-white border border-[#2B313E]'
              }
            `}
            title="Мой инвентарь"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.5 13.5l3.5-1.5 2 1.5 10-4.5 1 2 2.5-1v2l-2.5 1-1-2-9 4-1 3-3.5 1.5-2-6z" opacity="0.9" />
            </svg>
          </button>

          {/* Tab 2: Shop (Cart icon) */}
          <button
            onClick={() => setActiveTab('shop')}
            className={`
              w-7 h-7 rounded flex items-center justify-center transition-all
              ${
                activeTab === 'shop'
                  ? 'bg-[#C62828] text-white shadow-[0_0_10px_rgba(198,40,40,0.5)]'
                  : 'bg-[#1B202A] text-text-muted hover:text-white border border-[#2B313E]'
              }
            `}
            title="Магазин скинов (Купить за Scrap)"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
          </button>

          {/* Title */}
          <span className="font-rajdhani font-black text-sm md:text-base text-white tracking-wider uppercase">
            {activeTab === 'inventory' ? 'МОЙ ИНВЕНТАРЬ' : 'МАГАЗИН СКИНОВ'}
          </span>

          {/* Sort button */}
          <button
            onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
            className="p-1 rounded bg-[#1B202A] hover:bg-[#252B38] text-text-muted hover:text-white border border-[#2B313E] transition-colors ml-1"
            title="Сортировать по цене"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right Info: ВСЕГО СКИНОВ ⚙ 0.00 (Фото 5) */}
        <div className="flex items-center gap-2">
          {activeTab === 'inventory' ? (
            <div className="flex items-center gap-1.5 text-xs font-bold">
              <span className="text-text-muted uppercase text-[11px]">ВСЕГО СКИНОВ</span>
              <div className="flex items-center gap-1 text-[#FFD54F] font-rajdhani font-black text-sm">
                <ScrapIcon size="xs" />
                <span>{totalInvValue.toFixed(2)}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs font-bold">
              <span className="text-text-muted uppercase text-[11px]">БАЛАНС:</span>
              <div className="flex items-center gap-1 text-success-green font-rajdhani font-black text-sm">
                <ScrapIcon size="xs" />
                <span>{userBalance.toFixed(2)}</span>
              </div>
            </div>
          )}

          {activeTab === 'inventory' && inventory.length > 0 && !disabled && (
            <button
              onClick={onSellAll}
              className="p-1 rounded bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800/40 text-[10px] font-bold uppercase transition-colors"
              title="Продать всё за Scrap"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Grid of Items strictly matching Photo 5 & Photo 2 */}
      <div className="my-2 min-h-[360px] max-h-[460px] overflow-y-auto pr-1">
        {activeTab === 'inventory' ? (
          displayInventory.length === 0 ? (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-6 text-text-muted">
              <span className="text-3xl mb-2">🎒</span>
              <span className="text-xs font-bold uppercase text-white">
                Инвентарь пуст
              </span>
              <p className="text-[11px] text-text-muted mt-1 max-w-xs">
                Купите скины во вкладке с корзиной за Scrap или добудьте Scrap кнопкой «ПОПОЛНИТЬ» в шапке!
              </p>
              <button
                onClick={() => setActiveTab('shop')}
                className="mt-3 px-3.5 py-1.5 rounded bg-[#C62828] hover:bg-[#D32F2F] text-white text-xs font-black uppercase tracking-wider transition-colors shadow"
              >
                Купить скины в магазине
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {displayInventory.map((item) => {
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
          )
        ) : (
          /* Shop Items (Фото 2) */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {displayShopSkins.map((skin) => (
              <ItemCard
                key={skin.id}
                skin={skin}
                isShopItem={true}
                onBuy={() => onBuySkin(skin.id)}
                onInspect={() => onInspectSkin(skin.id)}
                compact={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
