import React, { useState, useMemo } from 'react';
import { SkinDefinition } from '../../types';
import { SKINS_DATA } from '../../data/skinsData';
import { ItemCard } from './ItemCard';
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { soundManager } from '../../utils/soundManager';

interface CatalogGridProps {
  selectedTargetSkin: SkinDefinition | null;
  onSelectTarget: (skin: SkinDefinition) => void;
  onInspectSkin: (skinId: string) => void;
  disabled?: boolean;
}

export const CatalogGrid: React.FC<CatalogGridProps> = ({
  selectedTargetSkin,
  onSelectTarget,
  onInspectSkin,
  disabled = false,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 12;

  // Helper to parse price input allowing comma, dot, spaces
  const parsePriceInput = (val: string): number => {
    if (!val) return NaN;
    const normalized = val.replace(',', '.').replace(/[^0-9.]/g, '').trim();
    if (!normalized) return NaN;
    const num = parseFloat(normalized);
    return isNaN(num) ? NaN : num;
  };

  // Filter & Sort
  const filteredSkins = useMemo(() => {
    return SKINS_DATA.filter((skin) => {
      if (
        searchQuery &&
        !skin.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !skin.type.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      const min = parsePriceInput(minPrice);
      if (!isNaN(min) && skin.price < min) return false;
      const max = parsePriceInput(maxPrice);
      if (!isNaN(max) && skin.price > max) return false;
      return true;
    }).sort((a, b) => {
      return sortOrder === 'asc' ? a.price - b.price : b.price - a.price;
    });
  }, [searchQuery, minPrice, maxPrice, sortOrder]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredSkins.length / itemsPerPage));
  const paginatedSkins = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredSkins.slice(start, start + itemsPerPage);
  }, [filteredSkins, currentPage, itemsPerPage]);

  const handleSelect = (skin: SkinDefinition) => {
    if (disabled) return;
    soundManager.play('item_select');
    onSelectTarget(skin);
  };

  return (
    <div className="w-full bg-[#14161B]/95 border border-[#232731] rounded-lg p-3.5 flex flex-col justify-between h-full shadow-2xl">
      {/* Top Header strictly matching Photo 4 */}
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-[#232731] gap-2">
        <div className="flex items-center gap-2">
          <h3 className="text-xs md:text-sm font-bold uppercase tracking-wider text-white">
            ПРЕДМЕТЫ ДЛЯ АПГРЕЙДА
          </h3>
          <span className="text-[11px] font-mono text-text-muted">
            ({filteredSkins.length})
          </span>
        </div>

        {/* Filters: Sort, MIN, MAX, Search */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
            className="p-1.5 rounded bg-[#1C1F26] hover:bg-[#2A2E38] text-text-muted hover:text-white border border-[#232731] transition-colors"
            title="Сортировка по цене"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>

          <input
            type="text"
            inputMode="decimal"
            value={minPrice}
            onChange={(e) => {
              setMinPrice(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="MIN"
            className="w-14 sm:w-16 px-1.5 py-1 rounded bg-[#0D0F12] border border-[#232731] text-xs font-rajdhani font-black text-white text-center placeholder-text-muted focus:outline-none focus:border-primary-red"
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
            className="w-14 sm:w-16 px-1.5 py-1 rounded bg-[#0D0F12] border border-[#232731] text-xs font-rajdhani font-black text-white text-center placeholder-text-muted focus:outline-none focus:border-primary-red"
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

      {/* Grid of Catalog skins */}
      <div className="my-2 min-h-[420px] max-h-[560px] overflow-y-auto pr-1">
        {paginatedSkins.length === 0 ? (
          <div className="h-full min-h-[320px] flex flex-col items-center justify-center text-center p-6 text-text-muted">
            <span className="text-xs font-bold uppercase text-white">
              Скины не найдены
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {paginatedSkins.map((skin) => (
              <ItemCard
                key={skin.id}
                skin={skin}
                isSelected={selectedTargetSkin?.id === skin.id}
                onSelect={() => handleSelect(skin)}
                onInspect={() => onInspectSkin(skin.id)}
                compact={true}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination Bar */}
      <div className="pt-2 border-t border-[#232731] flex items-center justify-between text-xs text-text-muted">
        <span>
          Страница {currentPage} из {totalPages}
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
