import React from 'react';
import { Ship, Radio, ChevronRight, X } from 'lucide-react';

interface CargoShipBannerProps {
  isActive: boolean;
  timeLeft: number;
  onBoard: () => void;
  onDismiss: () => void;
}

export const CargoShipBanner: React.FC<CargoShipBannerProps> = ({
  isActive,
  timeLeft,
  onBoard,
  onDismiss,
}) => {
  if (!isActive) return null;

  return (
    <div className="fixed top-14 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-3 animate-slide-down select-none">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#141A24]/95 via-[#1E2536]/95 to-[#121622]/95 border-2 border-amber-500/70 p-3 sm:p-4 shadow-[0_10px_35px_rgba(245,158,11,0.35)] backdrop-blur-md flex items-center justify-between gap-3">
        {/* Metal rivets */}
        <div className="absolute top-1.5 left-1.5 w-1.5 h-1.5 rounded-full bg-zinc-500 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]" />
        <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-zinc-500 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]" />
        <div className="absolute bottom-1.5 left-1.5 w-1.5 h-1.5 rounded-full bg-zinc-500 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]" />
        <div className="absolute bottom-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-zinc-500 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]" />

        {/* Left: Ship Icon with Radar beacon */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-500/60 flex items-center justify-center text-amber-400 shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.4)]">
            <Ship className="w-6 h-6 stroke-[2]" />
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-500 animate-ping" />
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400" />
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 font-mono flex items-center gap-1">
                <Radio className="w-3 h-3 animate-pulse" />
                СОБЫТИЕ • CARGO SHIP
              </span>
              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-mono font-bold">
                {timeLeft}с
              </span>
            </div>

            <h4 className="font-rajdhani font-black text-sm sm:text-base text-white tracking-wide uppercase whitespace-nowrap">
              СУХОГРУЗ COBALT [CARGO SHIP]
            </h4>
            <p className="text-[11px] text-zinc-300 font-sans whitespace-nowrap">
              Запертый ящик ученых на палубе
            </p>
          </div>
        </div>

        {/* Right: Board Button & Close */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onBoard}
            className="px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-rajdhani font-black text-xs sm:text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.5)] active:scale-95 transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap animate-pulse"
          >
            <span>НА БОРТ</span>
            <ChevronRight className="w-4 h-4 stroke-[3]" />
          </button>

          <button
            onClick={onDismiss}
            className="p-1.5 rounded-lg bg-[#141822] hover:bg-[#202534] text-zinc-400 hover:text-white transition-colors border border-[#2B3448]"
            title="Скрыть оповещение"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
