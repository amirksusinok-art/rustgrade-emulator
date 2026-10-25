import React from 'react';
import { InputSlot } from './InputSlot';
import { UpgradeWheel } from './UpgradeWheel';
import { TargetSlot } from './TargetSlot';
import { Multipliers } from './Multipliers';
import { InventoryItem, SkinDefinition } from '../../types';
import { ChevronUp, AlertTriangle } from 'lucide-react';

interface UpgradeStageProps {
  selectedItems: InventoryItem[];
  scrapSlider: number;
  userBalance: number;
  totalInputValue: number;
  targetSkin: SkinDefinition | null;
  winProbability: number;
  safetyStatus: {
    label: string;
    color: string;
    bg: string;
  };
  wheelRotation: number;
  isSpinning: boolean;
  turboMode: boolean;
  statusMessage: string | null;
  onRemoveItem: (instanceId: string) => void;
  onClearAll: () => void;
  onSliderChange: (val: number) => void;
  onApplyMultiplier: (mult: 2 | 4 | 8) => void;
  onApplyChance: (chance: number, mode?: 'auto' | 'skin' | 'slider') => void;
  onExecuteUpgrade: () => void;
  onInspectTarget?: () => void;
}

export const UpgradeStage: React.FC<UpgradeStageProps> = ({
  selectedItems,
  scrapSlider,
  userBalance,
  totalInputValue,
  targetSkin,
  winProbability,
  safetyStatus,
  wheelRotation,
  isSpinning,
  turboMode,
  statusMessage,
  onRemoveItem,
  onClearAll,
  onSliderChange,
  onApplyMultiplier,
  onApplyChance,
  onExecuteUpgrade,
  onInspectTarget,
}) => {
  return (
    <div className="w-full flex flex-col items-center select-none">
      {/* Center Logo & Mini Icons strictly matching Photo 4 */}
      <div className="flex flex-col items-center mb-3">
        <div className="flex items-center gap-1.5 cursor-pointer">
          <div className="w-6 h-6 rounded bg-[#E53935] flex items-center justify-center text-white shadow-[0_0_10px_rgba(229,57,53,0.5)]">
            <ChevronUp className="w-4 h-4 stroke-[3]" />
          </div>
          <span className="font-rajdhani font-black text-2xl text-white tracking-widest">
            RUST<span className="text-[#E53935]">GRADE</span>
          </span>
        </div>
      </div>

      {/* Warning banner */}
      {statusMessage && (
        <div className="mb-2 px-3 py-1 rounded bg-red-600/20 border border-red-500/40 text-red-200 text-xs font-bold flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-primary-red" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Arena 3-Column Grid matching Photo 4 */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-3 md:gap-4 items-start">
        {/* Left Slot: 4 cols */}
        <div className="lg:col-span-4 flex flex-col">
          <InputSlot
            selectedItems={selectedItems}
            scrapSlider={scrapSlider}
            userBalance={userBalance}
            totalInputValue={totalInputValue}
            onRemoveItem={onRemoveItem}
            onClearAll={onClearAll}
            onSliderChange={onSliderChange}
            disabled={isSpinning}
          />
        </div>

        {/* Center: Wheel & Red Button: 4 cols */}
        <div className="lg:col-span-4 flex flex-col items-center justify-between">
          <UpgradeWheel
            winProbability={winProbability}
            rotation={wheelRotation}
            isSpinning={isSpinning}
            turboMode={turboMode}
            safetyStatus={safetyStatus}
            onSetCustomChance={(ch) => onApplyChance(ch, 'auto')}
          />

          {/* Big Red UPGRADE Button strictly matching Photo 4 */}
          <div className="w-full px-2 mt-3">
            <button
              disabled={isSpinning}
              onClick={onExecuteUpgrade}
              className={`
                w-full py-3.5 rounded font-black text-lg md:text-xl uppercase tracking-widest transition-all
                ${
                  isSpinning
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    : 'bg-[#C62828] hover:bg-[#D32F2F] active:bg-[#B71C1C] text-white shadow-[0_4px_15px_rgba(198,40,40,0.5)] active:scale-[0.98]'
                }
              `}
            >
              {isSpinning ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span className="font-rajdhani">КРУТИМ...</span>
                </div>
              ) : (
                <span className="font-rajdhani tracking-wider">
                  АПГРЕЙД
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Right Slot: 4 cols */}
        <div className="lg:col-span-4 flex flex-col gap-2">
          <TargetSlot
            targetSkin={targetSkin}
            onInspect={onInspectTarget}
          />

          {/* Multipliers & Chances directly below Right Slot (Фото 4) */}
          <Multipliers
            currentChance={winProbability}
            onApplyMultiplier={onApplyMultiplier}
            onApplyChance={onApplyChance}
            disabled={isSpinning}
          />
        </div>
      </div>
    </div>
  );
};
