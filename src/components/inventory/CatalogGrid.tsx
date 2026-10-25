import React, { useState, useMemo } from 'react';
import { SkinDefinition, ItemRarity } from '../../types';
import { SKINS_DATA } from '../../data/skinsData';
import { ItemCard } from './ItemCard';
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, X, Filter } from 'lucide-react';
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
  const [selectedRarity, setSelectedRarity] = useState<ItemRarity | 'all'>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 12;

  // Filter & Sort
  const filteredSkins = useMemo(() => {
    return SKINS_DATA.filter((skin) => {
      // Name filter
      if (
        searchQuery &&
        !skin.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !skin.type.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Rarity filter
      if (selectedRarity !== 'all' && skin.rarity !== selectedRarity) {
        return false;
      }

      // Min price
      const min = parseFloat(minPrice);
      if (!isNaN(min) && skin.price < min) return false;

      // Max price
      const max = parseFloat(maxPrice);
      if (!isNaN(max) && skin.price > max) return false;

      return true;
    }).sort((a, b) => {
      return sortOrder === 'asc' ? a.price - b.price : b.price - a.price;
    });
  }, [searchQuery, selectedRarity, minPrice, maxPrice, sortOrder]);

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
    <div className="w-full bg-surface-card border border-border-dark rounded-2xl p-4 md:p-5 flex flex-col justify-between h-full shadow-lg">
      {/* Top Bar with Title & Filters */}
      <div className="flex flex-col gap-2.5 pb-3 border-b border-border-dark/70">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h3 className="text-sm md:text-base font-bold uppercase tracking-wider text-text-primary">
              ПРЕДМЕТЫ ДЛЯ АПГРЕЙДА
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-[#1B202A] text-xs font-rajdhani font-bold text-text-secondary border border-border-dark">
              {filteredSkins.length} из {SKINS_DATA.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Sort price toggle */}
            <button
              onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#1B202A] hover:bg-[#262B37] text-xs font-medium text-text-secondary hover:text-white border border-border-dark transition-colors"
              title={`Сортировка (${sortOrder === 'asc' ? 'дешевые первыми' : 'дорогие первыми'})`}
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>{sortOrder === 'asc' ? 'По возрастанию' : 'По убыванию'}</span>
            </button>
          </div>
        </div>

        {/* Search & Price Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-1">
          {/* Search box (6 cols) */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Поиск по названию..."
              className="w-full pl-9 pr-8 py-1.5 rounded-xl bg-[#0D0F12] border border-border-dark focus:border-primary-red/70 focus:outline-none text-xs text-text-primary placeholder-text-muted"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* MIN price (3 cols) */}
          <div className="sm:col-span-3">
            <input
              type="number"
              value={minPrice}
              onChange={(e) => {
                setMinPrice(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="MIN цена"
              className="w-full px-3 py-1.5 rounded-xl bg-[#0D0F12] border border-border-dark focus:border-primary-red/70 focus:outline-none text-xs text-text-primary placeholder-text-muted font-rajdhani"
            />
          </div>

          {/* MAX price (3 cols) */}
          <div className="sm:col-span-3">
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => {
                setMaxPrice(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="MAX цена"
              className="w-full px-3 py-1.5 rounded-xl bg-[#0D0F12] border border-border-dark focus:border-primary-red/70 focus:outline-none text-xs text-text-primary placeholder-text-muted font-rajdhani"
            />
          </div>
        </div>

        {/* Rarity filter pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted flex items-center gap-1">
            <Filter className="w-3 h-3" /> РЕДКОСТЬ:
          </span>
          {(
            [
              { id: 'all', label: 'Все', color: 'bg-zinc-700/30 text-white' },
              { id: 'contraband', label: 'Gold', color: 'bg-[#FFB800]/20 text-[#FFB800] border-[#FFB800]/40' },
              { id: 'master', label: 'Master', color: 'bg-[#E53935]/20 text-[#E53935] border-[#E53935]/40' },
              { id: 'classified', label: 'Classified', color: 'bg-[#8E24AA]/20 text-[#BA68C8] border-[#8E24AA]/40' },
              { id: 'restricted', label: 'Restricted', color: 'bg-[#1E88E5]/20 text-[#64B5F6] border-[#1E88E5]/40' },
              { id: 'mil-spec', label: 'Mil-Spec', color: 'bg-[#43A047]/20 text-[#81C784] border-[#43A047]/40' },
              { id: 'industrial', label: 'Industrial', color: 'bg-[#616161]/20 text-[#B0BEC5] border-[#616161]/40' },
            ] as const
          ).map((tier) => (
            <button
              key={tier.id}
              onClick={() => {
                setSelectedRarity(tier.id);
                setCurrentPage(1);
              }}
              className={`
                px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border transition-all
                ${
                  selectedRarity === tier.id
                    ? `${tier.color} ring-1 ring-white/40 shadow-sm`
                    : 'bg-[#14171E] text-text-muted border-border-dark hover:text-white'
                }
              `}
            >
              {tier.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Catalog items */}
      <div className="my-3 min-h-[380px] max-h-[520px] overflow-y-auto pr-1">
        {paginatedSkins.length === 0 ? (
          <div className="h-full min-h-[340px] flex flex-col items-center justify-center text-center p-6 bg-[#0D0F12]/60 rounded-xl border border-dashed border-border-dark">
            <span className="text-sm font-bold text-white uppercase tracking-wider">
              Ничего не найдено
            </span>
            <p className="text-xs text-text-muted mt-1">
              Попробуйте изменить поисковый запрос или сбросить фильтры
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
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
      <div className="pt-2 border-t border-border-dark/60 flex items-center justify-between text-xs text-text-muted">
        <span>
          Страница {currentPage} из {totalPages}
        </span>

        <div className="flex items-center gap-1.5">
          <button
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="p-1.5 rounded-lg bg-[#1B202A] hover:bg-[#262B37] text-text-secondary hover:text-white disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="font-rajdhani font-bold px-2 text-white">
            {currentPage}
          </span>

          <button
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="p-1.5 rounded-lg bg-[#1B202A] hover:bg-[#262B37] text-text-secondary hover:text-white disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
