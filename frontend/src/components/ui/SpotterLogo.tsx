import React from 'react'

interface SpotterLogoProps {
  size?: number
  className?: string
  showText?: boolean
  showTagline?: boolean
}

export const SpotterLogo: React.FC<SpotterLogoProps> = ({
  size = 40,
  className = '',
  showText = true,
  showTagline = false
}) => {
  return (
    <div className={`flex items-center gap-3 select-none group cursor-pointer ${className}`}>
      {/* ── Geometric Hexagonal Route & Radar S-Emblem ───────────────────────── */}
      <div 
        style={{ width: size, height: size }}
        className="relative flex items-center justify-center rounded-2xl bg-[#080D0A] border border-[#8AE922]/40 shadow-glow-lime transition-transform duration-300 group-hover:scale-105 group-hover:border-[#8AE922] p-1.5 shrink-0"
      >
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Outer Hexagonal Shield Path */}
          <path
            d="M24 4L40 13.2V34.8L24 44L8 34.8V13.2L24 4Z"
            stroke="url(#spotter_lime_grad)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-75"
          />

          {/* High-Speed Highway Route Waves (Geometric 'S') */}
          <path
            d="M34 16C34 16 28 14 20 18C12 22 14 30 24 30C34 30 36 38 28 42C20 46 14 44 14 44"
            stroke="url(#spotter_lime_grad)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Center Spotter Radar Target Reticle / Core Beacon */}
          <circle cx="24" cy="24" r="3.5" fill="#8AE922" className="animate-pulse" />
          <circle cx="24" cy="24" r="7" stroke="#8AE922" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.8" />

          {/* Color Gradients */}
          <defs>
            <linearGradient id="spotter_lime_grad" x1="8" y1="4" x2="40" y2="44" gradientUnits="userSpaceOnUse">
              <stop stopColor="#8AE922" />
              <stop offset="0.5" stopColor="#4ADE80" />
              <stop offset="1" stopColor="#10B981" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* ── Brand Typography ─────────────────────────────────────────────────── */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-2xl font-extrabold tracking-tight text-white font-heading leading-none">
              spotter<span className="text-[#8AE922] font-black">.ai</span>
            </span>
          </div>
          {showTagline && (
            <span className="text-[11px] text-slate-300 font-medium tracking-wide mt-0.5">
              HOS Route Intelligence &amp; ELD Logs
            </span>
          )}
        </div>
      )}
    </div>
  )
}
