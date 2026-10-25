import React from 'react';
import { AirdropReward } from '../../hooks/useAirdropTimer';
import { Sparkles, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ScrapIcon } from '../common/ScrapIcon';

interface AirdropModalProps {
  isActive: boolean;
  timeLeft: number;
  lastReward: AirdropReward | null;
  showClaimModal: boolean;
  onClaim: () => void;
  onCloseClaimModal: () => void;
}

export const AirdropModal: React.FC<AirdropModalProps> = ({
  isActive,
  timeLeft,
  lastReward,
  showClaimModal,
  onClaim,
  onCloseClaimModal,
}) => {
  // Fire confetti when claim modal opens
  React.useEffect(() => {
    if (showClaimModal) {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.5 },
          colors: ['#4CAF50', '#FFD54F', '#E53935'],
        });
      } catch {
        // Fallback
      }
    }
  }, [showClaimModal]);

  return (
    <>
      {/* Active in-flight Airdrop Banner & Parachute Crate */}
      {isActive && (
        <div className="fixed inset-x-0 top-16 z-40 flex flex-col items-center pointer-events-none select-none">
          {/* C-130 Cargo Plane silhouette in the sky */}
          <div className="absolute -top-8 w-full overflow-hidden pointer-events-none">
            <div className="w-28 h-6 bg-zinc-900/60 rounded-full animate-plane-fly filter blur-[1px] flex items-center justify-center">
              <span className="text-[9px] font-mono font-bold tracking-widest text-zinc-400 uppercase">
                ✈ C-130 HERCULES
              </span>
            </div>
          </div>

          {/* Authentic Rust Supply Drop (Parachute + Military Wood Crate + Red Flare Smoke) */}
          <div
            onClick={onClaim}
            className="pointer-events-auto cursor-pointer flex flex-col items-center group transition-all hover:scale-105 active:scale-95 animate-airdrop-descend"
            title="Кликните, чтобы захватить Airdrop!"
          >
            {/* 1. Realistic SVG Parachute */}
            <div className="relative w-44 h-24 flex items-center justify-center filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]">
              <svg width="176" height="96" viewBox="0 0 176 96" className="overflow-visible">
                <defs>
                  {/* Parachute Fabric Gradient */}
                  <linearGradient id="chuteRed" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#D32F2F" />
                    <stop offset="50%" stopColor="#B71C1C" />
                    <stop offset="100%" stopColor="#8E0000" />
                  </linearGradient>
                  <linearGradient id="chuteWhite" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ECEFF1" />
                    <stop offset="50%" stopColor="#CFD8DC" />
                    <stop offset="100%" stopColor="#90A4AE" />
                  </linearGradient>
                </defs>

                {/* Parachute Panels (Alternating Red & Khaki White Stripes) */}
                {/* Left Outer Panel (Red) */}
                <path d="M 8 56 Q 24 10 52 14 Q 30 46 8 56 Z" fill="url(#chuteRed)" stroke="#263238" strokeWidth="1" />
                {/* Left Inner Panel (White) */}
                <path d="M 52 14 Q 72 4 88 4 Q 68 50 44 58 Q 50 30 52 14 Z" fill="url(#chuteWhite)" stroke="#263238" strokeWidth="1" />
                {/* Right Inner Panel (Red) */}
                <path d="M 88 4 Q 104 4 124 14 Q 126 30 132 58 Q 108 50 88 4 Z" fill="url(#chuteRed)" stroke="#263238" strokeWidth="1" />
                {/* Right Outer Panel (White) */}
                <path d="M 124 14 Q 152 10 168 56 Q 146 46 124 14 Z" fill="url(#chuteWhite)" stroke="#263238" strokeWidth="1" />

                {/* Parachute Vent Cap */}
                <ellipse cx="88" cy="8" rx="14" ry="4" fill="#212121" opacity="0.6" />

                {/* Realistic Suspension Shroud Lines (8 lines converging to crate) */}
                <line x1="12" y1="56" x2="72" y2="96" stroke="#ECEFF1" strokeWidth="1" strokeOpacity="0.75" />
                <line x1="44" y1="58" x2="78" y2="96" stroke="#ECEFF1" strokeWidth="1" strokeOpacity="0.8" />
                <line x1="72" y1="56" x2="84" y2="96" stroke="#ECEFF1" strokeWidth="1" strokeOpacity="0.85" />
                <line x1="88" y1="54" x2="88" y2="96" stroke="#ECEFF1" strokeWidth="1" strokeOpacity="0.9" />
                <line x1="104" y1="56" x2="92" y2="96" stroke="#ECEFF1" strokeWidth="1" strokeOpacity="0.85" />
                <line x1="132" y1="58" x2="98" y2="96" stroke="#ECEFF1" strokeWidth="1" strokeOpacity="0.8" />
                <line x1="164" y1="56" x2="104" y2="96" stroke="#ECEFF1" strokeWidth="1" strokeOpacity="0.75" />
              </svg>
            </div>

            {/* 2. Authentic Rust Supply Drop Military Wooden Crate */}
            <div className="relative -mt-2 w-24 h-24 rounded-lg bg-gradient-to-b from-[#4E342E] via-[#3E2723] to-[#27140E] border-2 border-[#6D4C41] shadow-[0_12px_30px_rgba(0,0,0,0.95)] flex flex-col items-center justify-between p-2 overflow-visible">
              {/* Rust Metal Corner Brackets */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#B0BEC5]" />
              <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#B0BEC5]" />
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#B0BEC5]" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#B0BEC5]" />

              {/* Wooden Planks Horizontal Slits */}
              <div className="absolute inset-x-2 top-7 h-[1px] bg-black/50" />
              <div className="absolute inset-x-2 top-13 h-[1px] bg-black/50" />

              {/* Pulsing Red Emergency Flare on Crate Top */}
              <div className="absolute -top-3.5 right-2 flex items-center justify-center">
                {/* Billowing Red Smoke Particles */}
                <div className="absolute -top-4 w-4 h-4 rounded-full bg-red-600/40 animate-ping" />
                <div className="absolute -top-2 w-2.5 h-2.5 rounded-full bg-red-500/80 filter blur-[0.5px]" />
                {/* Glowing LED Beacon */}
                <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_14px_#FF1744] border border-white" />
              </div>

              {/* Top Stencil */}
              <div className="w-full flex items-center justify-between px-1">
                <span className="font-mono text-[8px] font-black uppercase tracking-wider text-amber-200/90">
                  SUPPLY DROP
                </span>
                <span className="text-[7px] font-mono text-zinc-400">942</span>
              </div>

              {/* Rust Crate Icon / Symbol */}
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded border border-amber-600/40 bg-black/40 flex items-center justify-center">
                  <span className="text-base">📦</span>
                </div>
              </div>

              {/* Timer Pill */}
              <div className="w-full bg-black/75 rounded py-0.5 px-1.5 flex items-center justify-center gap-1 text-[10px] font-rajdhani font-black text-red-400 border border-red-950">
                <Clock className="w-3 h-3 animate-pulse text-red-400" />
                <span>{timeLeft} СЕК</span>
              </div>
            </div>

            {/* Action Callout Button */}
            <div className="mt-1.5 px-3 py-1 rounded bg-[#C62828] hover:bg-[#D32F2F] text-white text-[10px] font-black uppercase tracking-wider shadow-[0_4px_14px_rgba(198,40,40,0.6)] border border-red-400/40 flex items-center gap-1 animate-pulse">
              <span>ЗАХВАТИТЬ AIRDROP</span>
            </div>
          </div>
        </div>
      )}

      {/* Claimed Reward Celebration Modal */}
      {showClaimModal && lastReward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-[#14161E] border border-[#2B313E] rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-success-green/20 border-2 border-success-green flex items-center justify-center text-success-green mb-3 shadow-[0_0_20px_rgba(76,175,80,0.4)]">
              <Sparkles className="w-7 h-7 animate-spin" />
            </div>

            <h3 className="text-xl md:text-2xl font-black uppercase tracking-wider text-white font-rajdhani">
              AIRDROP ЗАХВАЧЕН!
            </h3>
            <p className="text-xs text-text-secondary mt-1">
              Военный контейнер успешно вскрыт. Ваша добыча:
            </p>

            {/* Reward Display */}
            <div className="w-full bg-[#0D0F12] border border-[#232731] rounded-xl p-4 my-4 flex flex-col items-center gap-2">
              <div className="font-rajdhani font-black text-3xl text-success-green flex items-center gap-2 drop-shadow">
                <span>+{lastReward.scrap.toFixed(2)}</span>
                <ScrapIcon size="md" />
                <span className="text-xl">Scrap</span>
              </div>

              {lastReward.skin && (
                <div className="w-full pt-3 mt-1 border-t border-[#232731] flex flex-col items-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#FFD54F] mb-1">
                    БОНУСНЫЙ СКИН:
                  </span>
                  <img
                    src={`/images/skins/${lastReward.skin.localFile}`}
                    alt={lastReward.skin.name}
                    className="max-h-24 object-contain my-1 drop-shadow-lg"
                  />
                  <span className="text-sm font-bold text-white">
                    {lastReward.skin.name}
                  </span>
                  <span className="text-xs text-text-muted flex items-center gap-1">
                    <span>Стоимость:</span>
                    <ScrapIcon size="xs" />
                    <span>{lastReward.skin.price.toFixed(2)}</span>
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={onCloseClaimModal}
              className="w-full py-3 rounded-lg bg-[#4CAF50] hover:bg-[#43A047] text-white font-black text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(76,175,80,0.35)] transition-all"
            >
              Забрать в инвентарь
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes planeFly {
          0% {
            transform: translateX(-150px);
          }
          100% {
            transform: translateX(calc(100vw + 150px));
          }
        }
        .animate-plane-fly {
          animation: planeFly 7s linear forwards;
        }

        @keyframes airdropDescend {
          0% {
            transform: translateY(-90px);
            opacity: 0;
          }
          15% {
            opacity: 1;
          }
          100% {
            transform: translateY(0);
          }
        }
        .animate-airdrop-descend {
          animation: airdropDescend 2s cubic-bezier(0.2, 0.8, 0.4, 1) forwards;
        }
      `}</style>
    </>
  );
};
