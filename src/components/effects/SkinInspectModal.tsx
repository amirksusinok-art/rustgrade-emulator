import React, { useState, useRef, MouseEvent } from 'react';
import { SkinDefinition } from '../../types';
import { X, Crosshair, Sparkles } from 'lucide-react';

interface SkinInspectModalProps {
  skin: SkinDefinition | null;
  onClose: () => void;
  onSelectAsTarget?: (skin: SkinDefinition) => void;
}

export const SkinInspectModal: React.FC<SkinInspectModalProps> = ({
  skin,
  onClose,
  onSelectAsTarget,
}) => {
  const [rotateX, setRotateX] = useState<number>(0);
  const [rotateY, setRotateY] = useState<number>(0);
  const [glarePos, setGlarePos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const cardRef = useRef<HTMLDivElement | null>(null);

  if (!skin) return null;

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Tilt angle max +/- 18 deg
    const rX = -((y - centerY) / centerY) * 18;
    const rY = ((x - centerX) / centerX) * 18;

    setRotateX(rX);
    setRotateY(rY);
    setGlarePos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
    });
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setGlarePos({ x: 50, y: 50 });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-surface-card border border-border-dark rounded-3xl p-6 shadow-2xl flex flex-col items-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-[#1B202A] hover:bg-[#262B37] text-text-muted hover:text-white transition-colors z-20"
          title="Закрыть"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center w-full pb-2">
          <div className="flex items-center justify-center gap-1.5 text-xs uppercase font-bold tracking-widest text-[#FFD54F] mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>3D ОСМОТР СКИНА</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-white tracking-wide truncate">
            {skin.name}
          </h2>
          <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#1B202A] text-text-secondary border border-border-dark mt-1 inline-block">
            {skin.type} • {skin.rarity}
          </span>
        </div>

        {/* 3D Interactive Card Showcase */}
        <div
          style={{ perspective: 1000 }}
          className="w-full flex items-center justify-center my-6 py-4"
        >
          <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
              transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
              transition: 'transform 0.1s ease-out',
            }}
            className="relative w-72 h-80 rounded-2xl bg-gradient-to-b from-[#1E2430] to-[#12151B] border-2 border-border-light shadow-[0_20px_45px_rgba(0,0,0,0.8)] p-6 flex flex-col items-center justify-between cursor-grab active:cursor-grabbing overflow-hidden group select-none"
          >
            {/* Dynamic Glare Reflection */}
            <div
              className="absolute inset-0 pointer-events-none transition-opacity duration-300 opacity-60"
              style={{
                background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0) 60%)`,
              }}
            />

            {/* Ambient Background Aura */}
            <div className="absolute inset-0 bg-radial-vignette opacity-30 pointer-events-none" />

            {/* High-res Image */}
            <div className="relative z-10 w-full h-full flex items-center justify-center">
              <img
                src={`/images/skins/${skin.localFile}`}
                alt={skin.name}
                className="max-h-56 max-w-full object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.9)] transition-transform duration-200"
              />
            </div>

            {/* Bottom Card Price */}
            <div className="relative z-10 w-full flex items-center justify-between pt-2 border-t border-border-dark/60">
              <span className="text-[10px] font-bold text-text-muted uppercase">ЦЕНА В SCRAP:</span>
              <span className="font-rajdhani font-black text-xl text-[#FFD54F] flex items-center gap-1">
                <span className="text-sm">⚙️</span>
                <span>{skin.price.toFixed(2)}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Tip */}
        <p className="text-[11px] text-text-muted text-center mb-4">
          Двигайте курсором мыши над карточкой для 3D наклона и световых бликов
        </p>

        {/* Actions */}
        <div className="flex items-center gap-3 w-full">
          {onSelectAsTarget && (
            <button
              onClick={() => {
                onSelectAsTarget(skin);
                onClose();
              }}
              className="flex-1 py-3 rounded-xl bg-primary-red hover:bg-primary-red-hover text-white font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(229,57,53,0.4)] transition-all"
            >
              <Crosshair className="w-4 h-4" />
              <span>Выбрать целью</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="px-5 py-3 rounded-xl bg-[#1B202A] hover:bg-[#262B37] text-text-secondary hover:text-white font-bold text-sm uppercase tracking-wider transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
