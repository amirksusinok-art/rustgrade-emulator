import React, { useState } from 'react';
import { Crosshair, Sliders, Minus, Plus } from 'lucide-react';

interface MultipliersProps {
  currentChance: number;
  onApplyMultiplier: (mult: 2 | 4 | 8) => void;
  onApplyChance: (chance: number, mode?: 'auto' | 'skin' | 'slider') => void;
  disabled?: boolean;
}

export const Multipliers: React.FC<MultipliersProps> = ({
  currentChance,
  onApplyMultiplier,
  onApplyChance,
  disabled = false,
}) => {
  const [customInput, setCustomInput] = useState<string>(
    currentChance > 0 ? currentChance.toFixed(2) : '50.00'
  );

  const handleApplyCustom = (mode: 'auto' | 'skin' | 'slider') => {
    const val = parseFloat(customInput);
    if (!isNaN(val) && val >= 1.0 && val <= 79.99) {
      onApplyChance(val, mode);
    }
  };

  const adjustCustom = (delta: number) => {
    const current = parseFloat(customInput) || 50;
    const next = Math.min(79.99, Math.max(1.0, current + delta));
    const formatted = next.toFixed(2);
    setCustomInput(formatted);
    onApplyChance(next, 'auto');
  };

  return (
    <div className="w-full flex flex-col items-center gap-2.5 my-2">
      {/* Row 1: Multipliers & Preset Chances */}
      <div className="w-full flex flex-wrap items-center justify-center gap-2">
        {/* Multipliers X2, X4, X8 */}
        <div className="flex items-center gap-1 bg-surface-card border border-border-dark p-1 rounded-xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted px-1.5">
            X:
          </span>
          {([2, 4, 8] as const).map((m) => (
            <button
              key={m}
              type="button"
              disabled={disabled}
              onClick={() => onApplyMultiplier(m)}
              className="px-2.5 py-1 rounded-lg bg-[#1B202A] hover:bg-[#262B37] text-white font-rajdhani font-bold text-xs md:text-sm tracking-wide border border-border-dark/60 hover:border-text-secondary/40 transition-all active:scale-95 disabled:opacity-40"
            >
              X{m}
            </button>
          ))}
        </div>

        {/* Preset Chances */}
        <div className="flex items-center gap-1 bg-surface-card border border-border-dark p-1 rounded-xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted px-1.5">
            ШАНСЫ:
          </span>

          {[
            { pct: 10, color: 'bg-red-500' },
            { pct: 25, color: 'bg-red-400' },
            { pct: 35, color: 'bg-primary-red' },
            { pct: 50, color: 'bg-warning-orange' },
            { pct: 55, color: 'bg-yellow-400' },
            { pct: 75, color: 'bg-success-green' },
          ].map(({ pct, color }) => (
            <button
              key={pct}
              type="button"
              disabled={disabled}
              onClick={() => {
                setCustomInput(pct.toFixed(2));
                onApplyChance(pct, 'auto');
              }}
              className="relative px-2 md:px-2.5 py-1 rounded-lg bg-[#1B202A] hover:bg-white/5 text-white font-rajdhani font-bold text-xs md:text-sm tracking-wide border border-border-dark/60 transition-all active:scale-95 disabled:opacity-40 group overflow-hidden"
            >
              <span>{pct}%</span>
              <div
                className={`absolute bottom-0 left-0 right-0 h-[2px] ${color} group-hover:h-[3px] transition-all`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Row 2: Custom Chance Input & Fine-Tuning */}
      <div className="w-full max-w-lg bg-surface-card border border-border-dark/80 rounded-2xl p-2.5 flex flex-wrap items-center justify-between gap-2 shadow-inner">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
            СВОЙ ШАНС:
          </span>

          {/* Minus button */}
          <button
            type="button"
            disabled={disabled}
            onClick={() => adjustCustom(-1)}
            className="p-1 rounded-lg bg-[#1B202A] hover:bg-[#262B37] text-text-secondary hover:text-white border border-border-dark transition-colors disabled:opacity-40"
            title="-1%"
          >
            <Minus className="w-3 h-3" />
          </button>

          {/* Number Input */}
          <div className="relative flex items-center">
            <input
              type="number"
              min="1.00"
              max="79.99"
              step="0.5"
              disabled={disabled}
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleApplyCustom('auto');
                }
              }}
              className="w-16 px-1.5 py-1 rounded-lg bg-[#0D0F12] border border-border-dark focus:border-primary-red focus:outline-none text-white font-rajdhani font-bold text-sm text-center"
            />
            <span className="text-xs text-text-muted font-rajdhani font-bold ml-1">%</span>
          </div>

          {/* Plus button */}
          <button
            type="button"
            disabled={disabled}
            onClick={() => adjustCustom(1)}
            className="p-1 rounded-lg bg-[#1B202A] hover:bg-[#262B37] text-text-secondary hover:text-white border border-border-dark transition-colors disabled:opacity-40"
            title="+1%"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>

        {/* Dual Actions: Match Skin vs Match Scrap */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={disabled}
            onClick={() => handleApplyCustom('skin')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#1B202A] hover:bg-[#262B37] text-text-secondary hover:text-white border border-border-dark text-[11px] font-bold uppercase tracking-wider transition-all disabled:opacity-40"
            title="Найти подходящий скин в каталоге под этот шанс"
          >
            <Crosshair className="w-3 h-3 text-primary-red" />
            <span>Скин</span>
          </button>

          <button
            type="button"
            disabled={disabled}
            onClick={() => handleApplyCustom('slider')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#1B202A] hover:bg-[#262B37] text-text-secondary hover:text-white border border-border-dark text-[11px] font-bold uppercase tracking-wider transition-all disabled:opacity-40"
            title="Рассчитать и выставить Scrap на слайдере под этот шанс"
          >
            <Sliders className="w-3 h-3 text-success-green" />
            <span>Scrap</span>
          </button>

          <button
            type="button"
            disabled={disabled}
            onClick={() => handleApplyCustom('auto')}
            className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-primary-red to-[#C62828] hover:from-primary-red-hover hover:to-primary-red text-white text-[11px] font-bold uppercase tracking-wider transition-all shadow-sm disabled:opacity-40"
          >
            ОК
          </button>
        </div>
      </div>
    </div>
  );
};
