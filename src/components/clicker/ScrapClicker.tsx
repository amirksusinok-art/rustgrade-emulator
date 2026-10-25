import React, { useState } from 'react';
import { soundManager } from '../../utils/soundManager';
import { useUserStore } from '../../hooks/useUserStore';
import { Wrench } from 'lucide-react';

interface ClickParticle {
  id: number;
  x: number;
  y: number;
}

export const ScrapClicker: React.FC = () => {
  const { addScrap } = useUserStore();
  const [particles, setParticles] = useState<ClickParticle[]>([]);
  const [isPressed, setIsPressed] = useState<boolean>(false);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    soundManager.play('barrel_hit');
    addScrap(1.0);

    const newParticle: ClickParticle = {
      id: Date.now() + Math.random(),
      x,
      y,
    };

    setParticles((prev) => [...prev, newParticle]);

    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => p.id !== newParticle.id));
    }, 900);
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={handleClick}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onMouseLeave={() => setIsPressed(false)}
        className={`
          relative overflow-hidden group
          px-3.5 py-1.5 md:px-4 md:py-2 rounded-lg font-bold
          bg-gradient-to-r from-[#4CAF50] to-[#43A047]
          hover:from-[#43A047] hover:to-[#388E3C]
          border border-[#81C784]/40
          text-white shadow-[0_0_15px_rgba(76,175,80,0.35)]
          hover:shadow-[0_0_22px_rgba(76,175,80,0.55)]
          transition-all duration-150 ease-out flex items-center gap-2
          active:scale-95 text-xs md:text-sm uppercase tracking-wider
          ${isPressed ? 'scale-95' : ''}
        `}
        title="Ударить по бочке и получить 1.00 Scrap"
      >
        <span className="p-1 rounded bg-black/20 text-[#C8E6C9] group-hover:rotate-45 transition-transform duration-300">
          <Wrench className="w-3.5 h-3.5 md:w-4 md:h-4" />
        </span>
        <span className="font-rajdhani font-bold text-sm md:text-base tracking-wide flex items-center gap-1">
          + ДОБЫТЬ SCRAP
        </span>
        <span className="text-xs">⚙️</span>
      </button>

      {/* Floating Scrap Particles */}
      {particles.map((p) => (
        <span
          key={p.id}
          style={{ left: `${p.x}px`, top: `${p.y}px` }}
          className="absolute pointer-events-none font-rajdhani font-bold text-sm text-[#A5D6A7] animate-float-fade flex items-center gap-0.5 z-50 text-shadow-glow"
        >
          +1.00 ⚙️
        </span>
      ))}

      <style>{`
        @keyframes floatFade {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            opacity: 0.9;
            transform: translate(-50%, -120%) scale(1.15);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -180%) scale(0.9);
          }
        }
        .animate-float-fade {
          animation: floatFade 0.9s cubic-bezier(0.2, 0.8, 0.4, 1) forwards;
        }
      `}</style>
    </div>
  );
};
