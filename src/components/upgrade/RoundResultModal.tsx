import React from 'react';
import { UpgradeRound } from '../../types';
import { SKINS_MAP } from '../../data/skinsData';
import { CheckCircle2, XCircle, Sparkles, Flame } from 'lucide-react';

interface RoundResultModalProps {
  round: UpgradeRound | null;
  isOpen: boolean;
  onClose: () => void;
}

export const RoundResultModal: React.FC<RoundResultModalProps> = ({
  round,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !round) return null;

  const targetSkin = SKINS_MAP[round.targetSkinId];
  const isJackpot = round.isWin && (round.winProbability < 10.0 || targetSkin?.rarity === 'contraband');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-surface-card border border-border-dark rounded-3xl p-6 md:p-7 shadow-2xl flex flex-col items-center text-center animate-scale-up">
        {/* Glow halo */}
        <div
          className="absolute -top-10 w-48 h-48 rounded-full pointer-events-none opacity-40 blur-3xl"
          style={{
            background: round.isWin
              ? isJackpot
                ? '#FFB800'
                : '#4CAF50'
              : '#E53935',
          }}
        />

        {/* Top Result Icon */}
        <div
          className={`
            w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-xl border-2
            ${
              round.isWin
                ? isJackpot
                  ? 'bg-amber-500/20 border-amber-400 text-amber-400 shadow-[0_0_25px_rgba(255,184,0,0.5)]'
                  : 'bg-success-green/20 border-success-green text-success-green shadow-[0_0_25px_rgba(76,175,80,0.4)]'
                : 'bg-primary-red/20 border-primary-red text-primary-red shadow-[0_0_25px_rgba(229,57,53,0.4)]'
            }
          `}
        >
          {round.isWin ? (
            isJackpot ? (
              <Flame className="w-9 h-9 animate-bounce" />
            ) : (
              <CheckCircle2 className="w-9 h-9 animate-pulse" />
            )
          ) : (
            <XCircle className="w-9 h-9" />
          )}
        </div>

        {/* Title */}
        <h3 className="text-2xl md:text-3xl font-black uppercase tracking-wider text-white">
          {round.isWin
            ? isJackpot
              ? '🔥 ДЖЕКПОТ!'
              : 'ПОБЕДА!'
            : 'СТАВКА СГОРЕЛА'}
        </h3>

        <p className="text-xs text-text-secondary mt-1">
          {round.isWin
            ? `Вы успешно апгрейдили с шансом ${round.winProbability.toFixed(2)}%!`
            : `К сожалению, колесо остановилось вне победного сектора (${round.winProbability.toFixed(2)}%).`}
        </p>

        {/* Item Showcase */}
        {targetSkin && (
          <div className="w-full bg-[#0D0F12] border border-border-dark rounded-2xl p-4 my-5 flex flex-col items-center">
            <span className="text-[10px] uppercase font-bold tracking-wider text-text-muted mb-1">
              {round.isWin ? 'ВАШ ВЫИГРЫШ' : 'ЦЕЛЕВОЙ ПРЕДМЕТ'}
            </span>

            <div className="h-32 w-full flex items-center justify-center my-1">
              <img
                src={`/images/skins/${targetSkin.localFile}`}
                alt={targetSkin.name}
                className={`
                  max-h-28 object-contain drop-shadow-2xl transition-transform duration-300
                  ${round.isWin ? 'scale-110 drop-shadow-[0_0_20px_rgba(255,215,79,0.5)]' : 'grayscale opacity-60'}
                `}
              />
            </div>

            <span className="text-base font-bold text-white mt-1">
              {targetSkin.name}
            </span>

            <div className="flex items-center gap-1 font-rajdhani font-black text-lg text-[#FFD54F] mt-0.5">
              <span>⚙️ {targetSkin.price.toFixed(2)}</span>
              <span className="text-xs text-text-muted font-normal">Scrap</span>
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={onClose}
          className={`
            w-full py-3.5 rounded-xl text-white font-black text-sm uppercase tracking-wider shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2
            ${
              round.isWin
                ? 'bg-gradient-to-r from-success-green to-[#43A047] hover:from-[#43A047] hover:to-[#388E3C] shadow-[0_0_20px_rgba(76,175,80,0.4)]'
                : 'bg-[#1B202A] hover:bg-[#262B37] border border-border-dark text-text-secondary hover:text-white'
            }
          `}
        >
          {round.isWin ? (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Забрать в инвентарь</span>
            </>
          ) : (
            <span>Попробовать снова</span>
          )}
        </button>
      </div>

      <style>{`
        @keyframes scaleUp {
          0% {
            opacity: 0;
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-up {
          animation: scaleUp 0.25s cubic-bezier(0.2, 0.8, 0.4, 1) forwards;
        }
      `}</style>
    </div>
  );
};
