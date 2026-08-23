import React from 'react';

export const MarketzoLogo = ({ size = 'default', showTagline = false, light = false }) => {
  const isSmall = size === 'sm';
  const isLarge = size === 'lg';

  return (
    <div className="flex items-center gap-2.5 select-none cursor-pointer group">
      {/* Dynamic Monogram Mark */}
      <div className={`relative flex items-center justify-center shrink-0 rounded-xl overflow-hidden shadow-lg transition-transform duration-300 group-hover:scale-105 ${
        isSmall ? 'w-8 h-8 rounded-lg' : isLarge ? 'w-12 h-12 rounded-2xl' : 'w-10 h-10'
      } bg-gradient-to-tr from-indigo-900 via-slate-900 to-indigo-950 border border-indigo-500/30 shadow-indigo-500/20`}>
        {/* Stylized M-Grid Logo Glyph */}
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full p-1.5"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="mGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#818CF8" />
              <stop offset="50%" stopColor="#4F46E5" />
              <stop offset="100%" stopColor="#38BDF8" />
            </linearGradient>
            <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#EF4444" />
            </linearGradient>
          </defs>

          {/* Geometric Marketplace Monogram */}
          <path
            d="M24 74V26L48 50L72 26V74M38 74V48L48 58L58 48V74"
            stroke="url(#mGrad)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Dynamic Sparkle Node */}
          <circle cx="76" cy="24" r="5.5" fill="url(#accentGrad)" className="animate-pulse" />
        </svg>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col">
        <div className="flex items-center leading-none">
          <span className={`font-black tracking-tight ${
            isSmall ? 'text-lg' : isLarge ? 'text-2xl' : 'text-xl'
          } ${light ? 'text-white' : 'text-slate-900'}`}>
            MARKET
          </span>
          <span className={`font-black tracking-tight ${
            isSmall ? 'text-lg' : isLarge ? 'text-2xl' : 'text-xl'
          } text-indigo-600 dark:text-indigo-400`}>
            ZO
          </span>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 ml-0.5 mb-1.5" />
        </div>
        {showTagline && (
          <span className={`font-medium tracking-wider uppercase text-[10px] ${
            light ? 'text-slate-400' : 'text-slate-500'
          }`}>
            Buy More. Sell More.
          </span>
        )}
      </div>
    </div>
  );
};
