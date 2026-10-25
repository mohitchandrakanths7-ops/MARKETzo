import React from 'react';

export const MarketzoLogo = ({ size = 'default', showTagline = true, light = true }) => {
  const isSmall = size === 'sm';
  const isLarge = size === 'lg';

  return (
    <div className="flex items-center gap-2.5 select-none cursor-pointer group">
      {/* Dynamic Futuristic Geometric M Monogram */}
      <div
        className={`relative flex items-center justify-center shrink-0 rounded-xl overflow-hidden transition-all duration-300 group-hover:scale-105 ${
          isSmall ? 'w-8 h-8 rounded-lg' : isLarge ? 'w-12 h-12 rounded-2xl' : 'w-10 h-10'
        }`}
        style={{
          background: 'linear-gradient(135deg, #0a1128 0%, #101b3b 100%)',
          border: '1px solid rgba(0, 200, 255, 0.4)',
          boxShadow: '0 0 20px rgba(0, 200, 255, 0.25), 0 0 35px rgba(112, 46, 255, 0.2)'
        }}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full p-1.5"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="mNeonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00C8FF" />
              <stop offset="50%" stopColor="#2583FF" />
              <stop offset="100%" stopColor="#A855F7" />
            </linearGradient>
            <filter id="mGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Futuristic Geometric Marketzo M */}
          <path
            d="M20 76V24L50 54L80 24V76"
            stroke="url(#mNeonGrad)"
            strokeWidth="9"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#mGlow)"
          />
          <path
            d="M34 76V48L50 62L66 48V76"
            stroke="#00C8FF"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.9"
          />
        </svg>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col text-left">
        <div className="flex items-center tracking-wider leading-none">
          <span
            className={`font-black tracking-tight ${
              isSmall ? 'text-lg' : isLarge ? 'text-2xl' : 'text-xl'
            } text-white`}
          >
            MARKET
          </span>
          <span
            className={`font-black tracking-tight ${
              isSmall ? 'text-lg' : isLarge ? 'text-2xl' : 'text-xl'
            }`}
            style={{
              background: 'linear-gradient(90deg, #00C8FF 0%, #2583FF 50%, #A855F7 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            ZO
          </span>
        </div>
        {showTagline && (
          <span
            className="font-bold tracking-[0.2em] text-[9px] uppercase mt-0.5"
            style={{ color: '#A8B5CC' }}
          >
            SHOP · SELL · GROW
          </span>
        )}
      </div>
    </div>
  );
};
