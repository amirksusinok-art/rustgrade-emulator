import React, { useState } from 'react';
import { Edit2, Check, X } from 'lucide-react';

interface UpgradeWheelProps {
  winProbability: number;
  rotation: number;
  isSpinning: boolean;
  turboMode: boolean;
  safetyStatus: {
    label: string;
    color: string;
    bg: string;
  };
  onSetCustomChance?: (chance: number) => void;
}

export const UpgradeWheel: React.FC<UpgradeWheelProps> = ({
  winProbability,
  rotation,
  isSpinning,
  turboMode,
  safetyStatus,
  onSetCustomChance,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editValue, setEditValue] = useState<string>(winProbability.toFixed(2));

  const size = 320;
  const center = size / 2;
  const outerRadius = 146;
  const innerRadius = 96;

  // Win Sector arc angle in degrees (1° to 359.99°)
  const angle = Math.min(359.99, Math.max(1, (winProbability / 100) * 360));

  // Determine sector color
  const sectorColor =
    winProbability >= 75
      ? '#4CAF50'
      : winProbability >= 50
      ? '#FF9800'
      : '#E53935';

  const sectorGlow =
    winProbability >= 75
      ? 'rgba(76, 175, 80, 0.45)'
      : winProbability >= 50
      ? 'rgba(255, 152, 0, 0.45)'
      : 'rgba(229, 57, 53, 0.45)';

  // Polar to Cartesian (0° is at top 12:00)
  const polarToCartesian = (cx: number, cy: number, r: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: cx + r * Math.cos(angleInRadians),
      y: cy + r * Math.sin(angleInRadians),
    };
  };

  const startAngle = 0;
  const endAngle = angle;
  const largeArcFlag = angle > 180 ? 1 : 0;

  const startOuter = polarToCartesian(center, center, outerRadius, startAngle);
  const endOuter = polarToCartesian(center, center, outerRadius, endAngle);
  const startInner = polarToCartesian(center, center, innerRadius, startAngle);
  const endInner = polarToCartesian(center, center, innerRadius, endAngle);

  // SVG path for static victory sector arc
  const sectorPath = `
    M ${startOuter.x} ${startOuter.y}
    A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${endOuter.x} ${endOuter.y}
    L ${endInner.x} ${endInner.y}
    A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${startInner.x} ${startInner.y}
    Z
  `;

  // Rivets on the outer steel ring (24 rivets)
  const rivets = Array.from({ length: 24 }).map((_, i) => {
    const rivetAngle = (i * 360) / 24;
    const pos = polarToCartesian(center, center, outerRadius + 8, rivetAngle);
    return { id: i, ...pos };
  });

  const handleSaveCustom = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const parsed = parseFloat(editValue);
    if (!isNaN(parsed) && parsed >= 1.0 && parsed <= 79.99 && onSetCustomChance) {
      onSetCustomChance(parsed);
    }
    setIsEditing(false);
  };

  return (
    <div className="relative flex items-center justify-center select-none my-2">
      {/* Outer Glow Halo */}
      <div
        className="absolute w-72 h-72 rounded-full pointer-events-none transition-colors duration-500"
        style={{
          boxShadow: `0 0 45px ${sectorGlow}`,
          opacity: isSpinning ? 0.9 : 0.4,
        }}
      />

      {/* SVG Wheel Stage (320x320) */}
      <div className="relative w-[320px] h-[320px]">
        {/* 1. COMPLETELY STATIC WHEEL PLATE (Фото 4: колесо стоит на месте, не крутится) */}
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
          <defs>
            <linearGradient id="wheelMetal" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#252A36" />
              <stop offset="50%" stopColor="#14171E" />
              <stop offset="100%" stopColor="#2B3240" />
            </linearGradient>

            <linearGradient id="sectorFill" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={sectorColor} stopOpacity="0.95" />
              <stop offset="100%" stopColor={sectorColor} stopOpacity="0.80" />
            </linearGradient>
          </defs>

          {/* Base dark rusty wheel plate */}
          <circle
            cx={center}
            cy={center}
            r={outerRadius}
            fill="#12151B"
            stroke="#20242E"
            strokeWidth="3"
          />

          {/* Dark empty loss track */}
          <circle
            cx={center}
            cy={center}
            r={(outerRadius + innerRadius) / 2}
            fill="none"
            stroke="#0A0C0F"
            strokeWidth={outerRadius - innerRadius}
          />

          {/* Win Sector Arc (Static in place) */}
          <path
            d={sectorPath}
            fill="url(#sectorFill)"
            stroke={sectorColor}
            strokeWidth="1.5"
            filter="drop-shadow(0px 0px 6px rgba(0,0,0,0.6))"
          />

          {/* Sector start divider line at 12:00 */}
          <line
            x1={center}
            y1={center - innerRadius}
            x2={center}
            y2={center - outerRadius}
            stroke="#ffffff"
            strokeWidth="2"
            opacity="0.8"
          />

          {/* Outer Steel Rim with Rivets */}
          <circle
            cx={center}
            cy={center}
            r={outerRadius + 8}
            fill="none"
            stroke="url(#wheelMetal)"
            strokeWidth="14"
          />
          <circle
            cx={center}
            cy={center}
            r={outerRadius + 15}
            fill="none"
            stroke="#0A0C0F"
            strokeWidth="2"
          />
          <circle
            cx={center}
            cy={center}
            r={outerRadius + 1}
            fill="none"
            stroke="#0A0C0F"
            strokeWidth="2"
          />

          {/* Rivets */}
          {rivets.map((r) => (
            <circle
              key={r.id}
              cx={r.x}
              cy={r.y}
              r="2.5"
              fill="#78909C"
              stroke="#14171E"
              strokeWidth="1"
            />
          ))}
        </svg>

        {/* 2. ROTATING POINTER / ARROW LAYER (Крутится только стрелка вокруг колеса!) */}
        <div
          className="absolute inset-0 pointer-events-none z-20"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: isSpinning
              ? `transform ${turboMode ? 0.8 : 3.5}s cubic-bezier(0.12, 0.8, 0.33, 1)`
              : 'none',
          }}
        >
          {/* Arrow Pointer positioned at the outer top perimeter, pointing toward the center */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex flex-col items-center filter drop-shadow-[0_4px_12px_rgba(229,57,53,0.8)]">
            <svg width="26" height="30" viewBox="0 0 26 30">
              {/* Rustgrade Arrow Triangle */}
              <polygon
                points="13,28 1,4 25,4"
                fill="#E53935"
                stroke="#FFFFFF"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              {/* Internal white chevron emblem */}
              <polyline
                points="8,10 13,16 18,10"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* 3. STATIC CENTER HUB (Никогда не крутится, текст всегда строго вертикален) */}
        <div
          className="absolute inset-0 m-auto w-[184px] h-[184px] rounded-full bg-gradient-to-b from-[#1C2029] via-[#12151B] to-[#0A0C0F] border-4 border-[#242934] shadow-[inset_0_4px_16px_rgba(0,0,0,0.9)] flex flex-col items-center justify-center z-10"
        >
          {/* Subtle metal crosshair */}
          <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
            <div className="w-full h-[1px] bg-white" />
            <div className="h-full w-[1px] bg-white absolute" />
          </div>

          <span className="text-[10px] tracking-widest uppercase font-bold text-text-muted mb-0.5">
            ШАНС
          </span>

          {isEditing ? (
            <form onSubmit={handleSaveCustom} className="flex flex-col items-center z-20">
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="1"
                  max="79.99"
                  step="0.1"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-20 px-1 py-0.5 rounded bg-[#0D0F12] border border-primary-red text-center font-rajdhani font-black text-2xl text-white focus:outline-none"
                  autoFocus
                />
                <span className="text-xl font-rajdhani font-bold text-text-secondary">%</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <button
                  type="submit"
                  className="p-1 rounded bg-success-green hover:bg-success-green-hover text-white text-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="p-1 rounded bg-zinc-700 text-white text-xs"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          ) : (
            <div
              onClick={() => {
                if (!isSpinning && onSetCustomChance) {
                  setEditValue(winProbability.toFixed(2));
                  setIsEditing(true);
                }
              }}
              className={`flex items-center gap-1 group ${!isSpinning && onSetCustomChance ? 'cursor-pointer hover:scale-105' : ''} transition-transform`}
              title="Кликните, чтобы задать свой шанс"
            >
              <span className="font-rajdhani font-black text-4xl text-white tracking-tight drop-shadow-md">
                {winProbability.toFixed(2)}
                <span className="text-2xl text-text-secondary ml-0.5">%</span>
              </span>
              {!isSpinning && onSetCustomChance && (
                <Edit2 className="w-3 h-3 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </div>
          )}

          <div
            className={`
              mt-1.5 px-3 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border
              ${safetyStatus.color} ${safetyStatus.bg} border-current/30 shadow-sm
            `}
          >
            {safetyStatus.label}
          </div>
        </div>
      </div>
    </div>
  );
};
