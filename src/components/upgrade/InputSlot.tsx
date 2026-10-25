import React from 'react';
import { InventoryItem } from '../../types';
import { SKINS_MAP } from '../../data/skinsData';
import { X, Plus, Trash2 } from 'lucide-react';

interface InputSlotProps {
  selectedItems: InventoryItem[];
  scrapSlider: number;
  userBalance: number;
  totalInputValue: number;
  onRemoveItem: (instanceId: string) => void;
  onClearAll: () => void;
  onSliderChange: (val: number) => void;
  disabled?: boolean;
}

export const InputSlot: React.FC<InputSlotProps> = ({
  selectedItems,
  scrapSlider,
  userBalance,
  totalInputValue,
  onRemoveItem,
  onClearAll,
  onSliderChange,
  disabled = false,
}) => {
  const maxSlots = 8;
  const emptySlotsCount = Math.max(0, maxSlots - selectedItems.length);

  return (
    <div className="w-full flex flex-col justify-between bg-surface-card border border-border-dark rounded-2xl p-4 md:p-5 shadow-lg relative overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border-dark/70">
        <div>
          <h3 className="text-xs md:text-sm font-bold uppercase tracking-wider text-text-primary flex items-center gap-2">
            <span>ВАША СТАВКА</span>
            <span className="text-[11px] font-normal text-text-muted">
              ({selectedItems.length}/{maxSlots} предметов)
            </span>
          </h3>
          <p className="text-[11px] text-text-muted mt-0.5">
            Выберите скины из инвентаря слева или добавьте Scrap
          </p>
        </div>

        {selectedItems.length > 0 && !disabled && (
          <button
            onClick={onClearAll}
            className="flex items-center gap-1 text-[11px] text-text-muted hover:text-primary-red transition-colors font-medium px-2 py-1 rounded bg-[#1B202A] hover:bg-red-500/10"
            title="Очистить ставку"
          >
            <Trash2 className="w-3 h-3" />
            <span>Очистить</span>
          </button>
        )}
      </div>

      {/* Selected Items Grid (8 slots) */}
      <div className="grid grid-cols-4 gap-2 my-3 min-h-[148px]">
        {selectedItems.map((item) => {
          const skin = SKINS_MAP[item.skinId];
          if (!skin) return null;

          return (
            <div
              key={item.instanceId}
              className="relative group rounded-xl border border-border-dark bg-[#1B202A] p-1.5 flex flex-col items-center justify-between hover:border-primary-red/60 transition-all overflow-hidden shadow-sm"
            >
              <button
                disabled={disabled}
                onClick={() => onRemoveItem(item.instanceId)}
                className="absolute top-1 right-1 z-10 w-4 h-4 rounded-full bg-red-500/80 hover:bg-red-500 text-white flex items-center justify-center transition-transform hover:scale-110"
                title="Удалить из ставки"
              >
                <X className="w-2.5 h-2.5" />
              </button>

              <div className="h-12 w-full flex items-center justify-center my-0.5">
                <img
                  src={`/images/skins/${skin.localFile}`}
                  alt={skin.name}
                  className="max-h-12 object-contain drop-shadow"
                />
              </div>

              <div className="w-full text-center">
                <span className="text-[10px] font-medium text-text-secondary truncate block">
                  {skin.name}
                </span>
                <span className="text-[11px] font-rajdhani font-bold text-[#FFD54F]">
                  ⚙️ {skin.price.toFixed(2)}
                </span>
              </div>
            </div>
          );
        })}

        {/* Empty Slots */}
        {Array.from({ length: emptySlotsCount }).map((_, idx) => (
          <div
            key={`empty_${idx}`}
            className="rounded-xl border border-dashed border-border-dark/60 bg-[#101318]/50 flex flex-col items-center justify-center min-h-[70px] text-border-light"
          >
            <Plus className="w-4 h-4 opacity-30" />
            <span className="text-[9px] uppercase tracking-wider text-text-muted/40 mt-1">
              Слот {selectedItems.length + idx + 1}
            </span>
          </div>
        ))}
      </div>

      {/* Scrap Slider Section */}
      <div className="bg-[#0D0F12] border border-border-dark rounded-xl p-3 mt-1 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
            <span>ДОБАВИТЬ SCRAP</span>
            <span className="text-[10px] text-text-muted">
              (Баланс: ⚙️ {userBalance.toFixed(2)})
            </span>
          </span>

          <span className="font-rajdhani font-bold text-sm text-success-green flex items-center gap-1">
            + {scrapSlider.toFixed(2)} ⚙️
          </span>
        </div>

        {/* Range Slider */}
        <input
          type="range"
          min="0"
          max={userBalance > 0 ? userBalance : 0}
          step="0.05"
          value={scrapSlider}
          disabled={disabled || userBalance <= 0}
          onChange={(e) => onSliderChange(parseFloat(e.target.value) || 0)}
          className="w-full h-1.5"
        />

        {/* Quick scrap buttons */}
        <div className="flex items-center justify-between gap-1 pt-1">
          <div className="flex items-center gap-1">
            {[1, 5, 25].map((amt) => (
              <button
                key={amt}
                type="button"
                disabled={disabled || userBalance < amt}
                onClick={() => onSliderChange(Math.min(userBalance, scrapSlider + amt))}
                className="px-2 py-0.5 rounded bg-[#1B202A] hover:bg-[#262B37] disabled:opacity-30 text-[10px] font-rajdhani font-bold text-text-secondary hover:text-white transition-colors"
              >
                +{amt}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={disabled || scrapSlider === 0}
              onClick={() => onSliderChange(0)}
              className="px-2 py-0.5 rounded bg-[#1B202A] hover:bg-[#262B37] disabled:opacity-30 text-[10px] uppercase font-bold text-text-muted hover:text-white transition-colors"
            >
              Сброс
            </button>
            <button
              type="button"
              disabled={disabled || userBalance <= 0}
              onClick={() => onSliderChange(userBalance)}
              className="px-2.5 py-0.5 rounded bg-success-green/20 hover:bg-success-green text-success-green hover:text-white border border-success-green/30 disabled:opacity-30 text-[10px] uppercase font-bold transition-all"
            >
              MAX
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Summary Pill */}
      <div className="flex items-center justify-between pt-3 mt-3 border-t border-border-dark/60">
        <span className="text-xs uppercase tracking-wider text-text-muted font-semibold">
          ИТОГОВАЯ СТАВКА
        </span>
        <div className="flex items-center gap-1.5 font-rajdhani font-extrabold text-xl text-white">
          <span className="text-success-green text-base">⚙️</span>
          <span>{totalInputValue.toFixed(2)}</span>
          <span className="text-xs text-text-muted font-normal">Scrap</span>
        </div>
      </div>
    </div>
  );
};
