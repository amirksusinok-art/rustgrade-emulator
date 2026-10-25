import React from 'react';
import { SkinDefinition } from '../../types';
import { Eye } from 'lucide-react';
import { ScrapIcon } from '../common/ScrapIcon';

interface TargetSlotProps {
  targetSkin: SkinDefinition | null;
  onInspect?: () => void;
}

export const TargetSlot: React.FC<TargetSlotProps> = ({ targetSkin, onInspect }) => {
  return (
    <div className="w-full flex flex-col justify-between bg-[#12141A]/95 border border-[#232731] rounded-lg p-4 shadow-xl relative min-h-[360px]">
      {/* Header strictly matching Photo 4 */}
      <div className="flex items-center justify-between pb-2 border-b border-[#232731]">
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-white">
            ВЫБЕРИТЕ ПРЕДМЕТ ДЛЯ АПГРЕЙДА
          </h3>
          <p className="text-[10px] text-text-muted uppercase tracking-wider mt-0.5">
            ЖЕЛАЕМЫЙ СКИН ИЗ КАТАЛОГА СПРАВА
          </p>
        </div>

        {targetSkin && onInspect && (
          <button
            onClick={onInspect}
            className="p-1 rounded hover:bg-[#20242E] text-text-muted hover:text-white transition-colors"
            title="3D Осмотр цели"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Main Body: Target skin display OR transparent AK silhouette */}
      <div className="my-auto py-3 min-h-[220px] flex items-center justify-center">
        {targetSkin ? (
          <div className="flex flex-col items-center justify-center w-full">
            <div className="relative h-36 w-full flex items-center justify-center">
              <img
                src={`/images/skins/${targetSkin.localFile}`}
                alt={targetSkin.name}
                className="max-h-32 object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]"
              />
            </div>

            <span className="text-xs uppercase font-extrabold text-white mt-2 tracking-wide text-center">
              {targetSkin.name}
            </span>

            <span className="text-[10px] uppercase font-bold text-text-muted">
              {targetSkin.type}
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center opacity-25 select-none pointer-events-none">
            <svg
              className="w-44 h-24 stroke-white/60 fill-transparent"
              viewBox="0 0 240 100"
            >
              <path
                d="M 10 55 L 45 55 L 55 45 L 90 45 L 105 40 L 155 40 L 165 42 L 230 42 L 230 46 L 195 46 L 190 52 L 145 52 L 135 70 L 115 70 L 125 52 L 80 52 L 70 75 L 55 75 L 62 55 L 10 55 Z"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-[10px] uppercase font-bold tracking-widest text-text-muted mt-1">
              Выберите предмет для апгрейда
            </span>
          </div>
        )}
      </div>

      {/* Bottom Summary strictly matching Photo 4 */}
      <div className="pt-2 border-t border-[#232731] flex items-center justify-between text-xs">
        <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
          СТОИМОСТЬ ПРЕДМЕТА:
        </span>

        <span className="font-rajdhani font-black text-base text-[#FFD54F] flex items-center gap-1.5">
          <ScrapIcon size="sm" />
          <span>{targetSkin ? targetSkin.price.toFixed(2) : '0.00'}</span>
        </span>
      </div>
    </div>
  );
};
