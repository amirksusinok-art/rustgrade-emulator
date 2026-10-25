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
  const outerRadius = 148;
  const innerRadius = 100;

  // Arc angle in degrees
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

  // Calculate sector path (donut arc)
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
    <div className="relative flex items-center justify-center select-none my-2 md:my-0">
      {/* Outer Glow Halo */}
      <div
        className="absolute w-72 h-72 rounded-full pointer-events-none transition-colors duration-500"
        style={{
          boxShadow: `0 0 45px ${sectorGlow}`,
          opacity: isSpinning ? 0.9 : 0.45,
        }}
      />

      {/* SVG Wheel Stage */}
      <div className="relative w-[320px] h-[320px]">
        {/* ROTATING DISK */}
        <div
          className="w-full h-full"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: isSpinning
              ? `transform ${turboMode ? 0.8 : 3.5}s cubic-bezier(0.12, 0.8, 0.33, 1)`
              : 'none',
          }}
        >
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
            <defs>
              <linearGradient id="steelRim" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2A303C" />
                <stop offset="50%" stopColor="#14171E" />
                <stop offset="100%" stopColor="#363C4E" />
              </linearGradient>

              <linearGradient id="sectorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={sectorColor} stopOpacity="0.95" />
                <stop offset="100%" stopColor={sectorColor} stopOpacity="0.75" />
              </linearGradient>
            </defs>

            {/* Base dark wheel disk */}
            <circle
              cx={center}
              cy={center}
              r={outerRadius}
              fill="#14171E"
              stroke="#262B37"
              strokeWidth="4"
            />

            {/* Empty / Loss Track (dark graphite) */}
            <circle
              cx={center}
              cy={center}
              r={(outerRadius + innerRadius) / 2}
              fill="none"
              stroke="#0D0F12"
              strokeWidth={outerRadius - innerRadius}
            />

            {/* Win Sector Arc */}
            <path
              d={sectorPath}
              fill="url(#sectorGradient)"
              stroke={sectorColor}
              strokeWidth="1.5"
              filter="drop-shadow(0px 0px 6px rgba(0,0,0,0.5))"
            />

            {/* Sector boundary divider line at 0 deg */}
            <line
              x1={center}
              y1={center - innerRadius}
              x2={center}
              y2={center - outerRadius}
              stroke="#ffffff"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.8"
            />

            {/* Outer Steel Rim with Rivets */}
            <circle
              cx={center}
              cy={center}
              r={outerRadius + 8}
              fill="none"
              stroke="url(#steelRim)"
              strokeWidth="14"
            />
            <circle
              cx={center}
              cy={center}
              r={outerRadius + 15}
              fill="none"
              stroke="#0D0F12"
              strokeWidth="2"
            />
            <circle
              cx={center}
              cy={center}
              r={outerRadius + 1}
              fill="none"
              stroke="#0D0F12"
              strokeWidth="2"
            />

            {/* Rivets */}
            {rivets.map((r) => (
              <circle
                key={r.id}
                cx={r.x}
                cy={r.y}
                r="2.5"
                fill="#8E9BAE"
                stroke="#1B202A"
                strokeWidth="1"
              />
            ))}
          </svg>
        </div>

        {/* STATIC CENTER HUB */}
        <div
          className="absolute inset-0 m-auto w-[184px] h-[184px] rounded-full bg-gradient-to-b from-[#1B202A] via-[#14171E] to-[#0D0F12] border-4 border-[#262B37] shadow-[inset_0_4px_12px_rgba(0,0,0,0.8)] flex flex-col items-center justify-center z-10"
        >
          {/* Subtle metal crosshair */}
          <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
            <div className="w-full h-[1px] bg-white" />
            <div className="h-full w-[1px] bg-white absolute" />
          </div>

          <span className="text-[10px] tracking-widest uppercase font-bold text-text-muted mb-0.5">
            ШАНС УДАЧИ
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
              title="Кликните, чтобы задать свой точный шанс"
            >
              <span className="font-rajdhani font-black text-4xl text-white tracking-tight drop-shadow-md">
                {winProbability.toFixed(2)}
                <span className="text-2xl text-text-secondary ml-0.5">%</span>
              </span>
              {!isSpinning && onSetCustomChance && (
                <Edit2 className="w-3.5 h-3.5 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </div>
          )}

          <div
            className={`
              mt-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border
              ${safetyStatus.color} ${safetyStatus.bg} border-current/30 shadow-sm
            `}
          >
            {safetyStatus.label}
          </div>
        </div>

        {/* FIXED ARROW POINTER AT 12:00 */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center filter drop-shadow-[0_4px_10px_rgba(229,57,53,0.7)] pointer-events-none">
          <svg width="28" height="28" viewBox="0 0 28 28">
            <polygon
              points="14,24 2,4 26,4"
              fill="#E53935"
              stroke="#FFFFFF"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <circle cx="14" cy="9" r="3.5" fill="#FFFFFF" />
          </svg>
        </div>
      </div>
    </div>
  );
};
