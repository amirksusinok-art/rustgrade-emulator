import React from 'react';
import { InventoryItem } from '../../types';
import { SKINS_MAP } from '../../data/skinsData';
import { X, Trash2 } from 'lucide-react';
import { ScrapIcon } from '../common/ScrapIcon';

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
  return (
    <div className="w-full flex flex-col justify-between bg-[#12141A]/95 border border-[#232731] rounded-lg p-4 shadow-xl relative min-h-[360px]">
      {/* Header strictly matching Photo 4 */}
      <div className="flex items-center justify-between pb-2 border-b border-[#232731]">
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-white">
            ВЫБЕРИТЕ СКИНЫ ИЛИ СКИНЫ И БАЛАНС
          </h3>
          <p className="text-[10px] text-text-muted uppercase tracking-wider mt-0.5">
            МОЖНО ВЫБРАТЬ НЕСКОЛЬКО ПРЕДМЕТОВ ({selectedItems.length}/8)
          </p>
        </div>

        {selectedItems.length > 0 && !disabled && (
          <button
            onClick={onClearAll}
            className="p-1 rounded hover:bg-red-500/10 text-text-muted hover:text-primary-red transition-colors"
            title="Очистить ставку"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Main Body: Selected items grid OR transparent AK-47 silhouette */}
      <div className="my-auto py-3 min-h-[180px] flex items-center justify-center">
        {selectedItems.length === 0 ? (
          /* Transparent AK Silhouette (как на фото 4) */
          <div className="flex flex-col items-center justify-center opacity-25 select-none pointer-events-none">
            <svg
              className="w-44 h-24 stroke-white/60 fill-transparent"
              viewBox="0 0 240 100"
            >
              {/* Stylized AK Silhouette outline */}
              <path
                d="M 10 55 L 45 55 L 55 45 L 90 45 L 105 40 L 155 40 L 165 42 L 230 42 L 230 46 L 195 46 L 190 52 L 145 52 L 135 70 L 115 70 L 125 52 L 80 52 L 70 75 L 55 75 L 62 55 L 10 55 Z"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-[10px] uppercase font-bold tracking-widest text-text-muted mt-1">
              Выберите скины в инвентаре снизу
            </span>
          </div>
        ) : (
          /* Selected items grid */
          <div className="grid grid-cols-4 gap-2 w-full">
            {selectedItems.map((item) => {
              const skin = SKINS_MAP[item.skinId];
              if (!skin) return null;

              return (
                <div
                  key={item.instanceId}
                  className="relative rounded border border-[#232731] bg-[#161821] p-1 flex flex-col items-center justify-between"
                >
                  <button
                    disabled={disabled}
                    onClick={() => onRemoveItem(item.instanceId)}
                    className="absolute top-1 right-1 z-10 w-3.5 h-3.5 rounded bg-red-600/90 text-white flex items-center justify-center hover:scale-110 transition-transform"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>

                  <img
                    src={`/images/skins/${skin.localFile}`}
                    alt={skin.name}
                    className="max-h-12 object-contain drop-shadow my-1"
                  />

                  <span className="text-[9px] font-bold text-white truncate w-full text-center">
                    {skin.name}
                  </span>
                  <span className="text-[10px] font-rajdhani font-bold text-[#FFD54F] flex items-center justify-center gap-0.5">
                    <ScrapIcon size="xs" />
                    <span>{skin.price.toFixed(2)}</span>
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Slider Section strictly matching Photo 4:
          ДОБАВИТЬ БАЛАНС: [Scrap icon] 0.00 (МАКС 0.00)
      */}
      <div className="pt-2 border-t border-[#232731] flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
            ДОБАВИТЬ БАЛАНС:
          </span>

          <span className="font-rajdhani font-bold text-xs text-white flex items-center gap-1">
            <ScrapIcon size="xs" />
            <span className="text-white text-sm">{scrapSlider.toFixed(2)}</span>
            <span className="text-[10px] text-text-muted">
              (МАКС {userBalance.toFixed(2)})
            </span>
          </span>
        </div>

        {/* Dark slim slider */}
        <input
          type="range"
          min="0"
          max={userBalance > 0 ? userBalance : 0}
          step="0.05"
          value={scrapSlider}
          disabled={disabled || userBalance <= 0}
          onChange={(e) => onSliderChange(parseFloat(e.target.value) || 0)}
          className="w-full h-1 bg-[#1C1F28] rounded cursor-pointer accent-[#E53935]"
        />

        {/* Quick scrap helpers */}
        <div className="flex items-center justify-between text-[10px] font-bold text-text-muted pt-0.5">
          <div className="flex items-center gap-1">
            {[1, 5, 25].map((amt) => (
              <button
                key={amt}
                type="button"
                disabled={disabled || userBalance < amt}
                onClick={() => onSliderChange(Math.min(userBalance, scrapSlider + amt))}
                className="px-1.5 py-0.5 rounded bg-[#1C1F28] hover:bg-[#2A2E3C] text-text-muted hover:text-white transition-colors font-rajdhani"
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
              className="px-1.5 py-0.5 rounded bg-[#1C1F28] hover:bg-[#2A2E3C] text-text-muted hover:text-white transition-colors"
            >
              СБРОС
            </button>
            <button
              type="button"
              disabled={disabled || userBalance <= 0}
              onClick={() => onSliderChange(userBalance)}
              className="px-1.5 py-0.5 rounded bg-primary-red/20 hover:bg-primary-red text-[#FF8A80] hover:text-white transition-colors"
            >
              МАКС
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
