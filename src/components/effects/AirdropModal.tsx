import React from 'react';
import { AirdropReward } from '../../hooks/useAirdropTimer';
import { Package, Clock, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

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
        <div className="fixed inset-x-0 top-20 z-40 flex flex-col items-center pointer-events-none animate-fade-in">
          {/* C-130 Plane Fly-by Silhouette */}
          <div className="absolute -top-10 w-full overflow-hidden pointer-events-none">
            <div className="w-24 h-8 bg-zinc-800/80 rounded-full animate-plane-fly filter blur-[1px] flex items-center justify-center">
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                C-130
              </span>
            </div>
          </div>

          {/* Falling Container with Red Smoke and Parachute */}
          <div
            onClick={onClaim}
            className="pointer-events-auto cursor-pointer flex flex-col items-center group transition-transform hover:scale-110 active:scale-95 animate-airdrop-descend"
          >
            {/* Parachute Canvas/Lines */}
            <div className="relative w-28 h-14 flex items-center justify-center">
              {/* Parachute Canopy */}
              <div className="w-24 h-12 rounded-t-full bg-gradient-to-b from-[#E53935] via-[#C62828] to-[#B71C1C] border-2 border-[#FFCDD2]/50 shadow-[0_0_25px_rgba(229,57,53,0.8)]" />
              {/* Lines */}
              <div className="absolute bottom-0 w-16 h-4 border-b border-white/40" />
            </div>

            {/* Parachute Rope Cords */}
            <div className="w-12 h-6 flex justify-between px-1">
              <div className="w-[1.5px] h-full bg-white/60 transform rotate-12" />
              <div className="w-[1.5px] h-full bg-white/60 transform -rotate-12" />
            </div>

            {/* Military Wooden Supply Crate */}
            <div className="relative w-20 h-20 rounded-xl bg-gradient-to-b from-[#5D4037] via-[#4E342E] to-[#3E2723] border-2 border-[#8D6E63] shadow-[0_10px_35px_rgba(0,0,0,0.9)] flex flex-col items-center justify-between p-2">
              {/* Red Smoke Signal Flare */}
              <div className="absolute -top-3 -right-2 w-6 h-6 rounded-full bg-[#E53935] animate-ping opacity-75" />
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#FFCDD2] shadow-[0_0_15px_#E53935]" />

              <span className="text-[9px] font-black uppercase tracking-wider text-amber-200/90">
                AIRDROP
              </span>

              <Package className="w-8 h-8 text-amber-100 drop-shadow" />

              {/* 10s Timer Pill */}
              <div className="w-full bg-black/60 rounded-md py-0.5 flex items-center justify-center gap-1 text-[10px] font-rajdhani font-bold text-red-400">
                <Clock className="w-3 h-3 animate-pulse" />
                <span>{timeLeft} сек</span>
              </div>
            </div>

            {/* Click to open badge */}
            <span className="mt-2 px-3 py-1 rounded-full bg-[#E53935] text-white text-[11px] font-bold uppercase tracking-wider shadow-lg group-hover:bg-[#F44336] transition-colors animate-bounce">
              Кликни чтобы захватить!
            </span>
          </div>
        </div>
      )}

      {/* Claimed Reward Celebration Modal */}
      {showClaimModal && lastReward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-surface-card border border-border-dark rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-success-green/20 border-2 border-success-green flex items-center justify-center text-success-green mb-3 shadow-[0_0_25px_rgba(76,175,80,0.4)]">
              <Sparkles className="w-8 h-8 animate-spin" />
            </div>

            <h3 className="text-xl md:text-2xl font-black uppercase tracking-wider text-white">
              AIRDROP ЗАХВАЧЕН!
            </h3>
            <p className="text-xs text-text-secondary mt-1">
              Военный контейнер успешно вскрыт. Ваша награда:
            </p>

            {/* Reward Display */}
            <div className="w-full bg-[#0D0F12] border border-border-dark rounded-2xl p-4 my-5 flex flex-col items-center gap-2">
              <div className="font-rajdhani font-black text-3xl text-success-green flex items-center gap-1.5 drop-shadow">
                <span>+{lastReward.scrap.toFixed(2)}</span>
                <span className="text-xl">⚙️ Scrap</span>
              </div>

              {lastReward.skin && (
                <div className="w-full pt-3 mt-1 border-t border-border-dark/60 flex flex-col items-center">
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
                  <span className="text-xs text-text-muted">
                    Стоимость: ⚙️ {lastReward.skin.price.toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={onCloseClaimModal}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-success-green to-[#43A047] hover:from-[#43A047] hover:to-[#388E3C] text-white font-bold text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(76,175,80,0.4)] transition-all"
            >
              Забрать награду
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
            transform: translateY(-80px);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          100% {
            transform: translateY(0);
          }
        }
        .animate-airdrop-descend {
          animation: airdropDescend 1.8s cubic-bezier(0.2, 0.8, 0.4, 1) forwards;
        }
      `}</style>
    </>
  );
};
