import React from 'react';
import { SriLankaLocation, VehicleTypeId } from '../types/godude';

export const GoDudeBrandLogo: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClass =
    size === 'lg' ? 'text-3xl' : size === 'sm' ? 'text-xl' : 'text-2xl';
  return (
    <div className="inline-flex items-center select-none">
      <span
        className={`font-display font-extrabold tracking-tight ${sizeClass} text-sky-400 drop-shadow-[0_2px_10px_rgba(56,189,248,0.45)]`}
      >
        GO
      </span>
      <span
        className={`font-display font-extrabold tracking-tight ${sizeClass} text-white ml-1.5 drop-shadow-[0_2px_8px_rgba(255,255,255,0.25)]`}
      >
        dUDe
      </span>
    </div>
  );
};

export const FoodIllustration: React.FC<{
  type:
    | 'kottu'
    | 'cheese_kottu'
    | 'biriyani'
    | 'fried_rice'
    | 'burger'
    | 'lamprais'
    | 'hoppers'
    | 'isso_wade'
    | 'wattalappan'
    | 'faluda';
  className?: string;
}> = ({ type, className = 'w-full h-full' }) => {
  const configs: Record<
    string,
    { bg: string; plate: string; accent1: string; accent2: string; label: string }
  > = {
    kottu: {
      bg: 'from-amber-900 via-orange-800 to-stone-900',
      plate: '#fef3c7',
      accent1: '#ea580c',
      accent2: '#16a34a',
      label: 'Griddle Chicken Kottu',
    },
    cheese_kottu: {
      bg: 'from-amber-700 via-yellow-600 to-orange-900',
      plate: '#fffbeb',
      accent1: '#facc15',
      accent2: '#dc2626',
      label: 'Creamy Cheese Kottu',
    },
    biriyani: {
      bg: 'from-orange-900 via-amber-800 to-red-950',
      plate: '#fde68a',
      accent1: '#f59e0b',
      accent2: '#b91c1c',
      label: 'Saffron Dhum Biriyani',
    },
    fried_rice: {
      bg: 'from-emerald-900 via-teal-800 to-slate-900',
      plate: '#ecfdf5',
      accent1: '#ef4444',
      accent2: '#10b981',
      label: 'Wok Devilled Fried Rice',
    },
    burger: {
      bg: 'from-stone-900 via-amber-950 to-orange-950',
      plate: '#fed7aa',
      accent1: '#f97316',
      accent2: '#eab308',
      label: 'Charcoal Smash Burger',
    },
    lamprais: {
      bg: 'from-green-900 via-emerald-800 to-stone-900',
      plate: '#bbf7d0',
      accent1: '#15803d',
      accent2: '#b45309',
      label: 'Banana Leaf Lamprais',
    },
    hoppers: {
      bg: 'from-amber-800 via-orange-900 to-stone-900',
      plate: '#fff7ed',
      accent1: '#fbbf24',
      accent2: '#dc2626',
      label: 'Crisp Egg Hoppers',
    },
    isso_wade: {
      bg: 'from-red-900 via-orange-800 to-amber-950',
      plate: '#ffedd5',
      accent1: '#ef4444',
      accent2: '#f97316',
      label: 'Galle Face Prawn Wade',
    },
    wattalappan: {
      bg: 'from-amber-950 via-yellow-900 to-stone-900',
      plate: '#fef08a',
      accent1: '#a16207',
      accent2: '#fde047',
      label: 'Kithul Wattalappan',
    },
    faluda: {
      bg: 'from-rose-900 via-pink-800 to-slate-900',
      plate: '#fce7f3',
      accent1: '#f43f5e',
      accent2: '#fbcfe8',
      label: 'Iced Milo & Royal Faluda',
    },
  };

  const cfg = configs[type] || configs.kottu;

  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br ${cfg.bg} flex items-center justify-center ${className}`}
    >
      <svg
        viewBox="0 0 200 140"
        className="w-full h-full object-cover"
        aria-label={cfg.label}
      >
        <defs>
          <radialGradient id={`glow-${type}`} cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor={cfg.accent1} stopOpacity="0.45" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="100" cy="70" r="65" fill={`url(#glow-${type})`} />
        {/* Banana leaf / Plate rim */}
        <ellipse
          cx="100"
          cy="76"
          rx="62"
          ry="42"
          fill="#1c1917"
          stroke={cfg.plate}
          strokeWidth="2.5"
          opacity="0.9"
        />
        <ellipse cx="100" cy="73" rx="54" ry="35" fill={cfg.accent1} opacity="0.85" />
        {/* Textured culinary garnishes */}
        <path
          d="M65 68 Q95 45 132 68 Q105 92 65 68 Z"
          fill={cfg.plate}
          opacity="0.85"
        />
        <circle cx="86" cy="66" r="11" fill={cfg.accent2} />
        <circle cx="114" cy="72" r="10" fill="#fbbf24" />
        {/* Fried Egg / Prawn / Topping highlight */}
        <circle cx="102" cy="63" r="13" fill="#ffffff" opacity="0.95" />
        <circle cx="102" cy="63" r="6.5" fill="#f59e0b" />
        {/* Curry leaves & herbs */}
        <circle cx="76" cy="80" r="3.5" fill="#22c55e" />
        <circle cx="122" cy="58" r="3.5" fill="#22c55e" />
        <circle cx="92" cy="83" r="3" fill="#ef4444" />
        <circle cx="112" cy="82" r="2.5" fill="#22c55e" />
      </svg>
    </div>
  );
};

export const VehicleIllustration: React.FC<{
  type: VehicleTypeId;
  className?: string;
}> = ({ type, className = 'w-12 h-9' }) => {
  if (type === 'bike') {
    return (
      <svg viewBox="0 0 64 44" className={className} aria-hidden="true">
        <circle cx="15" cy="33" r="7" fill="#1e293b" stroke="#0284c7" strokeWidth="2.5" />
        <circle cx="49" cy="33" r="7" fill="#1e293b" stroke="#0284c7" strokeWidth="2.5" />
        <path
          d="M15 33 L26 20 L38 20 L45 31 L24 31 Z"
          fill="#0ea5e9"
        />
        <path d="M40 12 L46 12 L49 33" stroke="#0284c7" strokeWidth="3" strokeLinecap="round" fill="none" />
        <rect x="20" y="16" width="14" height="5" rx="2.5" fill="#0f172a" />
      </svg>
    );
  }
  if (type === 'tuktuk') {
    return (
      <svg viewBox="0 0 64 44" className={className} aria-hidden="true">
        <circle cx="15" cy="34" r="6.5" fill="#1e293b" stroke="#f59e0b" strokeWidth="2.5" />
        <circle cx="49" cy="34" r="6.5" fill="#1e293b" stroke="#f59e0b" strokeWidth="2.5" />
        {/* Canopy */}
        <path d="M12 12 Q32 6 48 13 L52 24 L12 24 Z" fill="#eab308" />
        {/* Body */}
        <path d="M10 22 L53 22 L55 32 L10 32 Z" fill="#16a34a" />
        <rect x="16" y="14" width="14" height="8" rx="2" fill="#0f172a" opacity="0.7" />
        <rect x="33" y="14" width="12" height="8" rx="2" fill="#bae6fd" opacity="0.9" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 64 44" className={className} aria-hidden="true">
      <path
        d="M8 26 L16 14 L44 14 L54 25 L58 26 L58 34 L6 34 L6 26 Z"
        fill="#2563eb"
      />
      <path d="M18 16 L30 16 L30 24 L14 24 Z" fill="#bae6fd" />
      <path d="M33 16 L43 16 L49 24 L33 24 Z" fill="#bae6fd" />
      <circle cx="17" cy="34" r="6.5" fill="#0f172a" stroke="#93c5fd" strokeWidth="2.5" />
      <circle cx="47" cy="34" r="6.5" fill="#0f172a" stroke="#93c5fd" strokeWidth="2.5" />
    </svg>
  );
};

export const LiveRouteMap: React.FC<{
  origin: SriLankaLocation;
  destination?: SriLankaLocation;
  vehicleType: VehicleTypeId;
  distanceKm: number;
  etaMins: number;
  isFlexibleMode?: boolean;
  isTripActive?: boolean;
  progressPercent?: number;
}> = ({
  origin,
  destination,
  vehicleType,
  distanceKm,
  etaMins,
  isFlexibleMode = false,
  isTripActive = false,
  progressPercent = 45,
}) => {
  const clampedProgress = Math.max(10, Math.min(92, progressPercent));

  return (
    <div
      data-testid="live-route-map"
      className="relative w-full h-44 rounded-2xl overflow-hidden border border-slate-200 bg-[#e5eef7] select-none shadow-inner"
    >
      {/* Realistic Sri Lanka Coastal Map Vector Canvas */}
      <svg viewBox="0 0 400 180" className="w-full h-full object-cover">
        {/* Indian Ocean coastline on left */}
        <path d="M0 0 L68 0 Q78 90 62 180 L0 180 Z" fill="#bae6fd" />
        <path d="M55 0 Q66 90 50 180" stroke="#7dd3fc" strokeWidth="3" fill="none" />

        {/* Green parks (Viharamahadevi Park / Galle Face Green) */}
        <rect x="70" y="15" width="42" height="65" rx="8" fill="#bbf7d0" opacity="0.7" />
        <rect x="240" y="105" width="75" height="55" rx="12" fill="#dcfce7" opacity="0.8" />
        {/* Beira Lake water body */}
        <path d="M135 28 Q175 20 190 48 Q165 65 135 45 Z" fill="#93c5fd" opacity="0.75" />

        {/* Urban road grid */}
        <g stroke="#ffffff" strokeWidth="5" fill="none" opacity="0.9">
          <path d="M75 0 L82 180" />
          <path d="M150 0 L165 180" />
          <path d="M260 0 L245 180" />
          <path d="M340 0 L355 180" />
          <path d="M65 42 L400 35" />
          <path d="M68 95 L400 105" />
          <path d="M62 145 L400 138" />
        </g>

        {/* Secondary streets */}
        <g stroke="#cbd5e1" strokeWidth="1.5" fill="none">
          <path d="M115 0 L120 180" />
          <path d="M205 0 L210 180" />
          <path d="M300 0 L295 180" />
          <path d="M68 68 L400 68" />
          <path d="M68 122 L400 122" />
        </g>

        {/* Active Navigation Route Polyline */}
        <path
          d="M96 128 L138 78 L168 112 L222 48 L308 115"
          stroke="#1e293b"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity="0.2"
        />
        <path
          d="M96 128 L138 78 L168 112 L222 48 L308 115"
          stroke="#0284c7"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={isFlexibleMode && !isTripActive ? '6 5' : 'none'}
          fill="none"
        />

        {/* Origin Marker (Blue Pin) */}
        <g transform="translate(96, 128)">
          <circle cx="0" cy="0" r="11" fill="#0284c7" opacity="0.2" />
          <path
            d="M0 -18 C-7 -18 -12 -13 -12 -6 C-12 3 0 14 0 14 C0 14 12 3 12 -6 C12 -13 7 -18 0 -18 Z"
            fill="#0284c7"
          />
          <circle cx="0" cy="-7" r="4" fill="#ffffff" />
        </g>

        {/* Destination Marker (Orange Pin) when in Point-to-Point */}
        {!isFlexibleMode && (
          <g transform="translate(308, 115)">
            <circle cx="0" cy="0" r="11" fill="#ea580c" opacity="0.22" />
            <path
              d="M0 -18 C-7 -18 -12 -13 -12 -6 C-12 3 0 14 0 14 C0 14 12 3 12 -6 C12 -13 7 -18 0 -18 Z"
              fill="#ea580c"
            />
            <circle cx="0" cy="-7" r="4" fill="#ffffff" />
          </g>
        )}

        {/* Simulated Live Moving Rider Marker along route */}
        <g
          transform={`translate(${96 + (clampedProgress / 100) * 200}, ${
            115 - Math.sin((clampedProgress / 100) * Math.PI) * 48
          })`}
        >
          <circle cx="0" cy="0" r="14" fill="#2563eb" opacity="0.25" />
          <circle cx="0" cy="0" r="9" fill="#0f172a" stroke="#ffffff" strokeWidth="2" />
          <circle cx="0" cy="0" r="3.5" fill="#38bdf8" />
        </g>
      </svg>

      {/* Top-left Demo GPS Badge */}
      <div className="absolute top-2.5 left-2.5 bg-slate-900/85 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1.5">
        <span className="text-sky-300 font-semibold">Demo GPS</span>
        <span aria-hidden="true">·</span>
        <span>{origin.city} Live Map</span>
      </div>

      {/* Bottom Route Summary Overlay */}
      <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-white/95 backdrop-blur-sm border border-slate-200/80 rounded-xl px-3 py-1.5 flex items-center justify-between text-xs shadow-sm">
        <div className="truncate pr-2">
          <span className="font-semibold text-slate-900">{origin.name.split('·')[0].trim()}</span>
          <span className="mx-1.5 text-slate-400">→</span>
          <span className="font-semibold text-slate-800">
            {isFlexibleMode
              ? isTripActive
                ? 'Metered Open Route'
                : 'Flexible Open Destination'
              : destination?.name.split('·')[0].trim() || 'Destination'}
          </span>
        </div>
        <div className="shrink-0 font-mono-num font-semibold text-blue-700">
          {distanceKm.toFixed(1)} km · {etaMins} min
        </div>
      </div>
    </div>
  );
};
