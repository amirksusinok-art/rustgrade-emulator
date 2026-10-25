import React from 'react';
import { InputSlot } from './InputSlot';
import { UpgradeWheel } from './UpgradeWheel';
import { TargetSlot } from './TargetSlot';
import { Multipliers } from './Multipliers';
import { InventoryItem, SkinDefinition } from '../../types';
import { Zap, AlertTriangle, Flame } from 'lucide-react';

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
    <div className="w-full flex flex-col items-center">
      {/* Status Warning Banner */}
      {statusMessage && (
        <div className="mb-3 px-4 py-2 rounded-xl bg-red-500/15 border border-red-500/30 text-[#FFCDD2] text-xs font-semibold flex items-center gap-2 animate-bounce">
          <AlertTriangle className="w-4 h-4 text-primary-red shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Arena Grid: Left Slot | Wheel & Action | Right Slot */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 items-stretch">
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

        {/* Center: Wheel and Main Upgrade Action: 4 cols */}
        <div className="lg:col-span-4 flex flex-col items-center justify-between py-2">
          {/* Wheel Dial */}
          <UpgradeWheel
            winProbability={winProbability}
            rotation={wheelRotation}
            isSpinning={isSpinning}
            turboMode={turboMode}
            safetyStatus={safetyStatus}
            onSetCustomChance={(ch) => onApplyChance(ch, 'auto')}
          />

          {/* Multiplier and Custom Chance Controls */}
          <Multipliers
            currentChance={winProbability}
            onApplyMultiplier={onApplyMultiplier}
            onApplyChance={onApplyChance}
            disabled={isSpinning}
          />

          {/* Big Red UPGRADE Button */}
          <div className="w-full px-2 mt-2">
            <button
              disabled={isSpinning}
              onClick={onExecuteUpgrade}
              className={`
                w-full py-4 rounded-2xl font-black text-xl uppercase tracking-widest
                transition-all duration-200 relative overflow-hidden flex items-center justify-center gap-2.5
                ${
                  isSpinning
                    ? 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#E53935] via-[#D32F2F] to-[#C62828] hover:from-[#F44336] hover:to-[#D32F2F] text-white border border-[#FF8A80]/30 shadow-[0_0_25px_rgba(229,57,53,0.5)] hover:shadow-[0_0_35px_rgba(229,57,53,0.7)] active:scale-[0.98]'
                }
              `}
            >
              {isSpinning ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span className="font-rajdhani">КРУТИМ КОЛЕСО...</span>
                </>
              ) : (
                <>
                  <Flame className="w-6 h-6 text-yellow-300 animate-pulse" />
                  <span className="font-rajdhani tracking-wider drop-shadow-md">
                    АПГРЕЙД
                  </span>
                  {turboMode && (
                    <span className="flex items-center gap-0.5 text-xs font-bold text-yellow-300 bg-black/30 px-2 py-0.5 rounded-full ml-1">
                      <Zap className="w-3 h-3 fill-current" /> 0.8s
                    </span>
                  )}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Slot: 4 cols */}
        <div className="lg:col-span-4 flex flex-col">
          <TargetSlot
            targetSkin={targetSkin}
            onInspect={onInspectTarget}
          />
        </div>
      </div>
    </div>
  );
};
