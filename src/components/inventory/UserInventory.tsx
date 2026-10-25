import React, { useState, useMemo } from 'react';
import { InventoryItem, SkinDefinition } from '../../types';
import { SKINS_DATA, SKINS_MAP } from '../../data/skinsData';
import { ItemCard } from './ItemCard';
import { ShoppingCart, ArrowUpDown, Trash2, Search, X, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 12;

  // Total inventory value
  const totalInvValue = useMemo(() => {
    return inventory.reduce((sum, item) => {
      const skin = SKINS_MAP[item.skinId];
      return sum + (skin ? skin.price : 0);
    }, 0);
  }, [inventory]);

  // Helper to parse price input allowing comma, dot, spaces
  const parsePriceInput = (val: string): number => {
    if (!val) return NaN;
    const normalized = val.replace(',', '.').replace(/[^0-9.]/g, '').trim();
    if (!normalized) return NaN;
    const num = parseFloat(normalized);
    return isNaN(num) ? NaN : num;
  };

  // Filtered & Sorted Inventory
  const displayInventory = useMemo(() => {
    return inventory
      .filter((item) => {
        const skin = SKINS_MAP[item.skinId];
        if (!skin) return false;
        if (searchQuery && !skin.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        const min = parsePriceInput(minPrice);
        if (!isNaN(min) && skin.price < min) return false;
        const max = parsePriceInput(maxPrice);
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
        if (searchQuery && !skin.name.toLowerCase().includes(searchQuery.toLowerCase()) && !skin.type.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        const min = parsePriceInput(minPrice);
        if (!isNaN(min) && skin.price < min) return false;
        const max = parsePriceInput(maxPrice);
        if (!isNaN(max) && skin.price > max) return false;
        return true;
      })
      .sort((a, b) => {
        return sortOrder === 'desc' ? b.price - a.price : a.price - b.price;
      });
  }, [searchQuery, minPrice, maxPrice, sortOrder]);

  // Pagination calculation based on active tab
  const currentItemsCount = activeTab === 'inventory' ? displayInventory.length : displayShopSkins.length;
  const totalPages = Math.max(1, Math.ceil(currentItemsCount / itemsPerPage));

  const paginatedInventory = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return displayInventory.slice(start, start + itemsPerPage);
  }, [displayInventory, currentPage, itemsPerPage]);

  const paginatedShopSkins = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return displayShopSkins.slice(start, start + itemsPerPage);
  }, [displayShopSkins, currentPage, itemsPerPage]);

  return (
    <div className="w-full bg-[#12141A]/95 border border-[#232731] rounded-lg p-3 flex flex-col justify-between h-full shadow-2xl">
      {/* Top Header strictly matching Photo 5 */}
      {/* Photo 5 shows: [Red AK Icon] [Cart Icon] МОЙ ИНВЕНТАРЬ   [⇅]       ВСЕГО СКИНОВ ⚙ 0.00 */}
      <div className="flex flex-wrap items-center justify-between pb-2.5 border-b border-[#232731] gap-2">
        <div className="flex items-center gap-2">
          {/* Tab 1: Inventory (Red button with AK rifle icon) */}
          <button
            onClick={() => {
              setActiveTab('inventory');
              setCurrentPage(1);
            }}
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
            onClick={() => {
              setActiveTab('shop');
              setCurrentPage(1);
            }}
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

        {/* Filters: MIN, MAX, Search */}
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            inputMode="decimal"
            value={minPrice}
            onChange={(e) => {
              setMinPrice(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="MIN"
            className="w-14 sm:w-16 px-1.5 py-0.5 rounded bg-[#0D0F12] border border-[#232731] text-xs font-rajdhani font-black text-white text-center placeholder-text-muted focus:outline-none focus:border-primary-red"
          />

          <input
            type="text"
            inputMode="decimal"
            value={maxPrice}
            onChange={(e) => {
              setMaxPrice(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="MAX"
            className="w-14 sm:w-16 px-1.5 py-0.5 rounded bg-[#0D0F12] border border-[#232731] text-xs font-rajdhani font-black text-white text-center placeholder-text-muted focus:outline-none focus:border-primary-red"
          />

          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Поиск..."
              className="w-20 sm:w-24 pl-5 pr-2 py-0.5 rounded bg-[#0D0F12] border border-[#232731] text-[11px] text-white placeholder-text-muted focus:outline-none focus:border-primary-red"
            />
            <Search className="w-2.5 h-2.5 text-text-muted absolute left-1.5 top-1/2 -translate-y-1/2" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-1 top-1/2 -translate-y-1/2 text-text-muted hover:text-white"
              >
                <X className="w-2 h-2" />
              </button>
            )}
          </div>
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
      <div className="my-2 min-h-[420px] max-h-[560px] overflow-y-auto pr-1">
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
                onClick={() => {
                  setActiveTab('shop');
                  setCurrentPage(1);
                }}
                className="mt-3 px-3.5 py-1.5 rounded bg-[#C62828] hover:bg-[#D32F2F] text-white text-xs font-black uppercase tracking-wider transition-colors shadow"
              >
                Купить скины в магазине
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {paginatedInventory.map((item) => {
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
          paginatedShopSkins.length === 0 ? (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-6 text-text-muted">
              <span className="text-xs font-bold uppercase text-white">
                Скины не найдены
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {paginatedShopSkins.map((skin) => (
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
          )
        )}
      </div>

      {/* Pagination Bar */}
      <div className="pt-2 border-t border-[#232731] flex items-center justify-between text-xs text-text-muted">
        <span>
          Страница {currentPage} из {totalPages} ({currentItemsCount} скинов)
        </span>

        <div className="flex items-center gap-1.5">
          <button
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="p-1 rounded bg-[#1C1F26] hover:bg-[#2A2E38] text-text-muted hover:text-white disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="font-rajdhani font-bold px-1.5 text-white">
            {currentPage}
          </span>

          <button
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="p-1 rounded bg-[#1C1F26] hover:bg-[#2A2E38] text-text-muted hover:text-white disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
