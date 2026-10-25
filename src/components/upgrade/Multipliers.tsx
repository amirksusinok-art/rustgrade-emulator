import React, { useState, useEffect } from 'react';

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
  const [sliderChance, setSliderChance] = useState<number>(currentChance > 0 ? currentChance : 50);

  useEffect(() => {
    if (currentChance > 0 && !disabled) {
      setSliderChance(currentChance);
    }
  }, [currentChance, disabled]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setSliderChance(val);
    onApplyChance(val, 'auto');
  };

  return (
    <div className="w-full flex flex-col items-center gap-2 select-none">
      {/* 1. Multipliers & Chances Row strictly matching Photo 5 */}
      {/* Photo 5 shows: X2   X4   X8   35%   55%   75% in a single clean row */}
      <div className="w-full grid grid-cols-6 gap-1.5 bg-[#12151B] border border-[#232731] p-1.5 rounded-lg">
        {/* X2 */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => onApplyMultiplier(2)}
          className="py-1.5 rounded bg-[#1B202A] hover:bg-[#252B38] text-white font-rajdhani font-black text-xs md:text-sm tracking-wider border border-[#2B313E] transition-all active:scale-95 disabled:opacity-40"
        >
          X2
        </button>

        {/* X4 */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => onApplyMultiplier(4)}
          className="py-1.5 rounded bg-[#1B202A] hover:bg-[#252B38] text-white font-rajdhani font-black text-xs md:text-sm tracking-wider border border-[#2B313E] transition-all active:scale-95 disabled:opacity-40"
        >
          X4
        </button>

        {/* X8 */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => onApplyMultiplier(8)}
          className="py-1.5 rounded bg-[#1B202A] hover:bg-[#252B38] text-white font-rajdhani font-black text-xs md:text-sm tracking-wider border border-[#2B313E] transition-all active:scale-95 disabled:opacity-40"
        >
          X8
        </button>

        {/* 35% */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => onApplyChance(35, 'auto')}
          className="py-1.5 rounded bg-[#1B202A] hover:bg-[#252B38] text-white font-rajdhani font-black text-xs md:text-sm tracking-wider border border-[#2B313E] transition-all active:scale-95 disabled:opacity-40"
        >
          35%
        </button>

        {/* 55% */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => onApplyChance(55, 'auto')}
          className="py-1.5 rounded bg-[#1B202A] hover:bg-[#252B38] text-white font-rajdhani font-black text-xs md:text-sm tracking-wider border border-[#2B313E] transition-all active:scale-95 disabled:opacity-40"
        >
          55%
        </button>

        {/* 75% */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => onApplyChance(75, 'auto')}
          className="py-1.5 rounded bg-[#1B202A] hover:bg-[#252B38] text-white font-rajdhani font-black text-xs md:text-sm tracking-wider border border-[#2B313E] transition-all active:scale-95 disabled:opacity-40"
        >
          75%
        </button>
      </div>

      {/* 2. Interactive Chance Slider (1.00% .. 95.00%) as requested */}
      <div className="w-full bg-[#12151B] border border-[#232731] rounded-lg p-2 flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-[11px] font-bold">
          <span className="text-text-muted uppercase tracking-wider">
            ПОЛЗУНОК ШАНСА:
          </span>
          <span className="font-rajdhani font-black text-sm text-[#FFD54F]">
            {sliderChance.toFixed(2)}%
          </span>
        </div>

        <div className="relative flex items-center">
          <input
            type="range"
            min="1.00"
            max="95.00"
            step="0.5"
            disabled={disabled}
            value={sliderChance}
            onChange={handleSliderChange}
            className="w-full h-1.5 bg-[#0A0C0F] rounded-lg appearance-none cursor-pointer accent-[#E53935] disabled:cursor-not-allowed"
          />
        </div>

        <div className="flex items-center justify-between text-[9px] font-rajdhani font-bold text-text-muted px-0.5">
          <span>1.00%</span>
          <span>50.00%</span>
          <span>95.00%</span>
        </div>
      </div>
    </div>
  );
};
