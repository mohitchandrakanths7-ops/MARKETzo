import React from 'react';
import { ChevronRight, Gamepad2, Zap } from 'lucide-react';

export const GamingZoneBanner = ({ onNavigate }) => {
  return (
    <div className="px-4 mb-6 animate-fade-in-up">
      <div
        className="relative rounded-3xl overflow-hidden gaming-glow cursor-pointer press-feedback"
        style={{
          background: 'linear-gradient(135deg, #0a0f1d 0%, #0d1b2a 40%, #0f0a2e 100%)',
          border: '1px solid rgba(139,92,246,0.25)',
          minHeight: '160px'
        }}
        onClick={() => onNavigate('gaming')}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onNavigate('gaming')}
        aria-label="Enter MARKETZO Gaming Zone"
      >
        {/* Glowing orbs */}
        <div
          className="absolute -left-10 top-1/2 -translate-y-1/2 w-40 h-40 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)' }}
        />
        <div
          className="absolute -right-10 bottom-0 w-32 h-32 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)' }}
        />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'linear-gradient(rgba(139,92,246,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.5) 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        />

        {/* Content */}
        <div className="relative z-10 p-6 flex flex-col justify-between h-full" style={{ minHeight: '160px' }}>
          <div>
            {/* Badge */}
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold mb-3"
              style={{
                background: 'rgba(139,92,246,0.2)',
                border: '1px solid rgba(139,92,246,0.4)',
                color: '#a78bfa'
              }}
            >
              <Gamepad2 className="w-3 h-3" />
              <span>MARKETZO GAMING</span>
            </div>

            {/* Title */}
            <h2
              className="text-2xl font-black leading-tight mb-1"
              style={{
                background: 'linear-gradient(135deg, #e0e7ff 0%, #a78bfa 50%, #3b82f6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              LEVEL UP<br />YOUR GAME
            </h2>

            <p className="text-xs font-medium mb-4" style={{ color: 'rgba(167,139,250,0.8)' }}>
              Consoles • PCs • Accessories
            </p>
          </div>

          {/* CTA */}
          <button
            className="self-start flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black cursor-pointer press-feedback"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: '#fff' }}
            aria-label="Enter Gaming Zone"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>ENTER GAMING</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Large decorative gaming emoji */}
        <div
          className="absolute right-4 top-1/2 -translate-y-1/2 text-8xl opacity-20 select-none pointer-events-none"
          style={{ filter: 'drop-shadow(0 0 20px #8b5cf6)' }}
        >
          🎮
        </div>
      </div>
    </div>
  );
};
