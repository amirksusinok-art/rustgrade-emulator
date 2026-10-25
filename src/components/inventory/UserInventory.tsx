import React, { useState, useMemo } from 'react';
import { InventoryItem, SkinDefinition } from '../../types';
import { SKINS_DATA, SKINS_MAP } from '../../data/skinsData';
import { ItemCard } from './ItemCard';
import { ShoppingCart, Package, ArrowUpDown, Trash2, Search, X } from 'lucide-react';

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
    <div className="w-full bg-[#14161B]/95 border border-[#232731] rounded-lg p-3.5 flex flex-col justify-between h-full shadow-2xl">
      {/* Top Tabs & Filter Toolbar strictly matching Photo 2 & Photo 4 */}
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-[#232731] gap-2">
        {/* Tabs: AK Icon (Inventory) and Cart Icon (МАГАЗИН) */}
        <div className="flex items-center gap-1.5">
          {/* Tab 1: Inventory */}
          <button
            onClick={() => setActiveTab('inventory')}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all
              ${
                activeTab === 'inventory'
                  ? 'bg-primary-red text-white shadow'
                  : 'bg-[#1C1F26] text-text-muted hover:text-white border border-[#232731]'
              }
            `}
            title="Мой инвентарь"
          >
            <Package className="w-3.5 h-3.5" />
            <span>ИНВЕНТАРЬ ({inventory.length})</span>
          </button>

          {/* Tab 2: Shop (Фото 2) */}
          <button
            onClick={() => setActiveTab('shop')}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all
              ${
                activeTab === 'shop'
                  ? 'bg-primary-red text-white shadow'
                  : 'bg-[#1C1F26] text-text-muted hover:text-white border border-[#232731]'
              }
            `}
            title="Купить скины за Scrap"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>МАГАЗИН</span>
          </button>
        </div>

        {/* Filter controls: Sort, MIN, MAX, Search */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
            className="p-1.5 rounded bg-[#1C1F26] hover:bg-[#2A2E38] text-text-muted hover:text-white border border-[#232731] transition-colors"
            title="Сортировка по цене"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>

          <input
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="MIN"
            className="w-14 px-2 py-1 rounded bg-[#0D0F12] border border-[#232731] text-[11px] font-rajdhani text-white placeholder-text-muted focus:outline-none focus:border-primary-red"
          />

          <input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="MAX"
            className="w-14 px-2 py-1 rounded bg-[#0D0F12] border border-[#232731] text-[11px] font-rajdhani text-white placeholder-text-muted focus:outline-none focus:border-primary-red"
          />

          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск..."
              className="w-24 sm:w-28 pl-6 pr-2 py-1 rounded bg-[#0D0F12] border border-[#232731] text-[11px] text-white placeholder-text-muted focus:outline-none focus:border-primary-red"
            />
            <Search className="w-3 h-3 text-text-muted absolute left-2 top-1/2 -translate-y-1/2" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-white"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Action Strip: Total Value or Shop Status */}
      <div className="flex items-center justify-between py-1.5 text-[11px] text-text-muted">
        {activeTab === 'inventory' ? (
          <>
            <span className="font-rajdhani font-bold text-white text-xs">
              ВСЕГО СКИНОВ: <span className="text-[#FFD54F]">⚙️ {totalInvValue.toFixed(2)}</span>
            </span>

            {inventory.length > 0 && !disabled && (
              <button
                onClick={onSellAll}
                className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-red-400 hover:text-red-300 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                <span>Продать всё за Scrap</span>
              </button>
            )}
          </>
        ) : (
          <>
            <span className="text-[11px] text-text-muted">
              Кликните по любому скину, чтобы купить его за Scrap в инвентарь
            </span>
            <span className="font-rajdhani font-bold text-success-green">
              Баланс: ⚙️ {userBalance.toFixed(2)}
            </span>
          </>
        )}
      </div>

      {/* Grid of Items */}
      <div className="my-2 min-h-[380px] max-h-[500px] overflow-y-auto pr-1">
        {activeTab === 'inventory' ? (
          /* Inventory Items */
          displayInventory.length === 0 ? (
            <div className="h-full min-h-[320px] flex flex-col items-center justify-center text-center p-6 text-text-muted">
              <Package className="w-12 h-12 text-zinc-600 mb-2" />
              <span className="text-xs font-bold uppercase text-white">
                Инвентарь пуст
              </span>
              <p className="text-[11px] text-text-muted mt-1 max-w-xs">
                Купите скины во вкладке <strong>«МАГАЗИН»</strong> за Scrap или добудьте Scrap в шапке!
              </p>
              <button
                onClick={() => setActiveTab('shop')}
                className="mt-3 px-3 py-1.5 rounded bg-primary-red hover:bg-primary-red-hover text-white text-xs font-bold uppercase tracking-wider transition-colors shadow"
              >
                Перейти в магазин
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
