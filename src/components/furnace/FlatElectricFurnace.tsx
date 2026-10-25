import React, { useId } from 'react';

interface FlatElectricFurnaceProps {
  isSmelting: boolean;
}

export const FlatElectricFurnace: React.FC<FlatElectricFurnaceProps> = ({ isSmelting }) => {
  const clipId = useId();

  return (
    <div className="relative flex flex-col items-center select-none">
      {/* Sparks / Smoke rising from top burners during smelting */}
      {isSmelting && (
        <div className="absolute -top-10 inset-x-0 h-12 flex justify-center items-end pointer-events-none overflow-visible">
          {/* Spark 1 */}
          <div className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-ping absolute left-12 bottom-2" />
          {/* Spark 2 */}
          <div className="w-1 h-1 rounded-full bg-yellow-200 animate-pulse absolute right-14 bottom-4" />
          {/* Spark 3 */}
          <div className="w-2 h-2 rounded-full bg-orange-400 blur-[1px] animate-bounce absolute left-20 bottom-6" />
          {/* Heat distortion haze */}
          <div className="w-24 h-8 bg-orange-500/20 blur-md rounded-full animate-pulse" />
        </div>
      )}

      {/* SVG Flat 2D Front-Facing Rust Electric Furnace (Строго вид спереди, без 3D-скоса) */}
      <div className={`relative transition-transform duration-200 ${isSmelting ? 'animate-[pulse_0.6s_ease-in-out_infinite]' : ''}`}>
        <svg
          width="190"
          height="250"
          viewBox="0 0 190 250"
          className="overflow-visible drop-shadow-[0_12px_24px_rgba(0,0,0,0.9)]"
        >
          <defs>
            {/* Metal casing gradient */}
            <linearGradient id="casingGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#252A34" />
              <stop offset="20%" stopColor="#373E4D" />
              <stop offset="80%" stopColor="#2F3642" />
              <stop offset="100%" stopColor="#1E222A" />
            </linearGradient>

            {/* Top burner plate */}
            <linearGradient id="topPlateGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3F4655" />
              <stop offset="100%" stopColor="#20242D" />
            </linearGradient>

            {/* Internal Chamber Clip Path (Strictly keeps all heat inside the window) */}
            <clipPath id={clipId}>
              <rect x="36" y="94" width="118" height="92" rx="4" />
            </clipPath>

            {/* Glowing heating element filter */}
            <filter id="coilGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* 1. Base Mounting Plate */}
          <rect x="22" y="234" width="146" height="10" rx="2" fill="#181B22" stroke="#0D0F12" strokeWidth="2" />
          <line x1="28" y1="238" x2="162" y2="238" stroke="#3A4150" strokeWidth="1" strokeDasharray="4 4" />

          {/* 2. Main Furnace Metal Body (Flat Front View) */}
          <rect
            x="28"
            y="26"
            width="134"
            height="210"
            rx="5"
            fill="url(#casingGrad)"
            stroke="#12151B"
            strokeWidth="3"
          />

          {/* Steel Rivets along outer frame */}
          {[36, 56, 76, 96, 116, 136, 154].map((x) => (
            <circle key={`r_top_${x}`} cx={x} cy="33" r="1.8" fill="#5A6478" stroke="#12151B" strokeWidth="0.8" />
          ))}
          {[46, 70, 95, 120, 145, 170, 195, 220].map((y) => (
            <React.Fragment key={`r_sides_${y}`}>
              <circle cx="33" cy={y} r="1.8" fill="#5A6478" stroke="#12151B" strokeWidth="0.8" />
              <circle cx="157" cy={y} r="1.8" fill="#5A6478" stroke="#12151B" strokeWidth="0.8" />
            </React.Fragment>
          ))}

          {/* 3. Top Burners & Exhaust Surface */}
          <rect x="20" y="16" width="150" height="14" rx="3" fill="url(#topPlateGrad)" stroke="#14171E" strokeWidth="2" />
          {/* 4 Circular Burners */}
          {[42, 74, 116, 148].map((bx, i) => (
            <g key={`burner_${i}`}>
              <circle cx={bx} cy="23" r="6" fill="#181B22" stroke="#4B5563" strokeWidth="1.2" />
              <circle
                cx={bx}
                cy="23"
                r="3.5"
                fill={isSmelting ? '#EA580C' : '#2D333F'}
                className="transition-colors duration-500"
              />
            </g>
          ))}

          {/* 4. Top Control Panel (Knobs & Digital Dials) */}
          <rect x="36" y="44" width="118" height="36" rx="3" fill="#1A1D24" stroke="#0F1116" strokeWidth="1.5" />
          {/* Status LEDs */}
          <circle cx="48" cy="54" r="2.2" fill={isSmelting ? '#EF4444' : '#10B981'} className="transition-colors" />
          <circle cx="56" cy="54" r="2.2" fill={isSmelting ? '#F59E0B' : '#374151'} className="transition-colors" />
          <rect x="66" y="50" width="22" height="8" rx="1.5" fill="#0B0D11" stroke="#252A36" strokeWidth="1" />
          <text x="77" y="56.5" fill={isSmelting ? '#F59E0B' : '#4B5563'} fontSize="6" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
            {isSmelting ? '850°C' : 'OFF'}
          </text>

          {/* 4 Rotary Control Dials (as on original Rust Electric Furnace) */}
          {[48, 76, 108, 138].map((kx, i) => (
            <g key={`knob_${i}`}>
              <circle cx={kx} cy="68" r="6" fill="#2E3440" stroke="#12151B" strokeWidth="1.5" />
              <circle cx={kx} cy="68" r="4" fill="#1C2028" />
              {/* Dial Notch */}
              <line
                x1={kx}
                y1="64"
                x2={kx}
                y2="66"
                stroke={isSmelting ? '#F59E0B' : '#9CA3AF'}
                strokeWidth="1.5"
                strokeLinecap="round"
                transform={isSmelting ? `rotate(${45 * (i + 1)}, ${kx}, 68)` : `rotate(0, ${kx}, 68)`}
                className="transition-transform duration-700"
              />
            </g>
          ))}

          {/* 5. Central Smelting Window Chamber (Strictly Clipped) */}
          {/* Outer Window Bezel */}
          <rect x="34" y="92" width="122" height="96" rx="5" fill="#1C2027" stroke="#101217" strokeWidth="2.5" />

          {/* Inside the Grate Window (Clipped) */}
          <g clipPath={`url(#${clipId})`}>
            {/* Deep furnace interior darkness */}
            <rect x="36" y="94" width="118" height="92" fill="#090B0E" />

            {/* Fire / Electric Heat Radiance (Only active inside window) */}
            <rect
              x="36"
              y="94"
              width="118"
              height="92"
              fill={isSmelting ? 'url(#heatRad)' : 'transparent'}
              className="transition-all duration-700"
            />
            <linearGradient id="heatRad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#DC2626" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#EA580C" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#FBBF24" stopOpacity="0.95" />
            </linearGradient>

            {/* 3 Electric Heating Coil Spirals */}
            {[112, 138, 164].map((cy, i) => (
              <path
                key={`coil_${i}`}
                d={`M 44 ${cy} Q 54 ${cy - 8} 64 ${cy} T 84 ${cy} T 104 ${cy} T 124 ${cy} T 146 ${cy}`}
                fill="none"
                stroke={isSmelting ? '#FEF08A' : '#7C2D12'}
                strokeWidth={isSmelting ? 4 : 2.5}
                strokeLinecap="round"
                filter={isSmelting ? 'url(#coilGlow)' : undefined}
                className="transition-all duration-500"
              />
            ))}

            {/* Subtle heat wave distortion inside */}
            {isSmelting && (
              <rect
                x="36"
                y="94"
                width="118"
                height="92"
                fill="#FEF08A"
                opacity="0.15"
                className="animate-pulse"
              />
            )}
          </g>

          {/* 6. Heavy Vertical Steel Grate Bars (Over the window) */}
          {[48, 62, 76, 90, 104, 118, 132, 144].map((gx) => (
            <line
              key={`grate_${gx}`}
              x1={gx}
              y1="93"
              x2={gx}
              y2="187"
              stroke="#2B323E"
              strokeWidth="4"
              strokeLinecap="round"
            />
          ))}
          {/* Grate Rivet Accents */}
          {[48, 76, 104, 132].map((gx) => (
            <React.Fragment key={`gr_r_${gx}`}>
              <circle cx={gx} cy="97" r="1.5" fill="#717D96" />
              <circle cx={gx} cy="183" r="1.5" fill="#717D96" />
            </React.Fragment>
          ))}

          {/* 7. Yellow Hazard Triangle Decal on Lower Door Panel */}
          <g transform="translate(85, 200)">
            <polygon
              points="10,0 20,18 0,18"
              fill="#EAB308"
              stroke="#1F242D"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <polygon points="10,3 17,16 3,16" fill="#111827" />
            {/* Exclamation point */}
            <line x1="10" y1="6" x2="10" y2="11" stroke="#EAB308" strokeWidth="1.4" strokeLinecap="round" />
            <circle cx="10" cy="14" r="0.8" fill="#EAB308" />
          </g>
        </svg>
      </div>

      {/* Status Label Below Flat Furnace */}
      <div className="mt-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0D0F12] border border-[#232731] text-[11px] font-rajdhani font-black">
        <span className={`w-2 h-2 rounded-full ${isSmelting ? 'bg-orange-500 animate-ping' : 'bg-emerald-500'}`} />
        <span className="text-white uppercase tracking-wider">
          {isSmelting ? 'ИДЁТ ПЕРЕПЛАВКА...' : 'ПЕЧЬ ГОТОВА К ЗАГРУЗКЕ'}
        </span>
      </div>
    </div>
  );
};