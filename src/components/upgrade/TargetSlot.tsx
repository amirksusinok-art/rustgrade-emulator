import React from 'react';
import { SkinDefinition } from '../../types';
import { Crosshair, Eye } from 'lucide-react';

interface TargetSlotProps {
  targetSkin: SkinDefinition | null;
  onInspect?: () => void;
}

export const TargetSlot: React.FC<TargetSlotProps> = ({ targetSkin, onInspect }) => {
  return (
    <div className="w-full flex flex-col justify-between bg-surface-card border border-border-dark rounded-2xl p-4 md:p-5 shadow-lg relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border-dark/70">
        <div>
          <h3 className="text-xs md:text-sm font-bold uppercase tracking-wider text-text-primary flex items-center gap-2">
            <span>ПРЕДМЕТ ДЛЯ АПГРЕЙДА</span>
          </h3>
          <p className="text-[11px] text-text-muted mt-0.5">
            Желаемый скин из каталога справа
          </p>
        </div>

        {targetSkin && onInspect && (
          <button
            onClick={onInspect}
            className="flex items-center gap-1 text-[11px] text-text-secondary hover:text-white transition-colors font-medium px-2 py-1 rounded bg-[#1B202A] hover:bg-[#262B37]"
            title="3D Осмотр цели"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Осмотр</span>
          </button>
        )}
      </div>

      {/* Main Target Body */}
      {targetSkin ? (
        <div className="flex flex-col items-center justify-center my-4 py-3 relative group">
          {/* Subtle background glow */}
          <div
            className="absolute inset-0 rounded-2xl opacity-15 pointer-events-none transition-opacity"
            style={{
              background: `radial-gradient(circle, #E53935 0%, transparent 70%)`,
            }}
          />

          {/* Skin Image */}
          <div className="relative h-44 w-full flex items-center justify-center">
            <img
              src={`/images/skins/${targetSkin.localFile}`}
              alt={targetSkin.name}
              className="max-h-40 max-w-[85%] object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.7)] group-hover:scale-105 transition-transform duration-300 ease-out"
            />
          </div>

          {/* Rarity & Name */}
          <div className="text-center mt-2 w-full z-10">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border border-border-dark bg-[#1B202A] text-text-secondary">
              {targetSkin.type}
            </span>
            <h4 className="text-base md:text-lg font-bold text-white mt-1 truncate">
              {targetSkin.name}
            </h4>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center my-8 py-8 text-text-muted">
          <div className="w-16 h-16 rounded-full bg-[#1B202A] border border-dashed border-border-dark flex items-center justify-center text-border-light mb-3">
            <Crosshair className="w-8 h-8 opacity-40 animate-pulse" />
          </div>
          <span className="text-xs uppercase font-bold tracking-wider text-text-secondary">
            Скин не выбран
          </span>
          <span className="text-[11px] text-text-muted mt-1">
            Кликните по любому скину в каталоге справа
          </span>
        </div>
      )}

      {/* Bottom Summary Pill */}
      <div className="flex items-center justify-between pt-3 mt-1 border-t border-border-dark/60">
        <span className="text-xs uppercase tracking-wider text-text-muted font-semibold">
          СТОИМОСТЬ ЦЕЛИ
        </span>
        <div className="flex items-center gap-1.5 font-rajdhani font-extrabold text-xl text-[#FFD54F]">
          <span className="text-sm">⚙️</span>
          <span>{targetSkin ? targetSkin.price.toFixed(2) : '0.00'}</span>
          <span className="text-xs text-text-muted font-normal">Scrap</span>
        </div>
      </div>
    </div>
  );
};
