import React from 'react';
import { ChevronRight, Gamepad2, Sparkles, ArrowRight } from 'lucide-react';

export const GamingZoneBanner = ({ onNavigate }) => {
  return (
    <div className="px-3.5 mb-4 animate-fade-in-up">
      <div
        className="relative rounded-3xl overflow-hidden gaming-glow cursor-pointer press-feedback border border-purple-500/30"
        style={{
          background: 'linear-gradient(135deg, #090d1c 0%, #170d36 50%, #0c081d 100%)',
          minHeight: '135px'
        }}
        onClick={() => onNavigate('gaming')}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onNavigate('gaming')}
        aria-label="Enter MARKETZO Gaming Zone"
      >
        {/* Futuristic Glowing Orbs */}
        <div
          className="absolute -left-10 top-1/2 -translate-y-1/2 w-36 h-36 rounded-full opacity-35 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)' }}
        />
        <div
          className="absolute -right-6 -bottom-6 w-36 h-36 rounded-full opacity-40 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #a855f7 0%, transparent 70%)' }}
        />

        {/* Content */}
        <div className="relative z-10 p-4 sm:p-5 flex items-center justify-between gap-3">
          <div className="space-y-1.5 max-w-[70%]">
            
            {/* Dedicated Destination Badge */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <span className="text-xs">🎮</span>
              <span>GAMING ZONE</span>
            </div>

            {/* Headline */}
            <h2 className="text-base sm:text-lg font-black tracking-tight text-white uppercase leading-tight">
              LEVEL UP YOUR SETUP
            </h2>

            <p className="text-xs text-purple-200/90 font-semibold line-clamp-1">
              Discover esports gear, 240Hz monitors & rapid triggers
            </p>
          </div>

          {/* Action CTA Button */}
          <div className="shrink-0 flex flex-col items-end gap-1">
            <div
              className="flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-white shadow-lg cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)',
                boxShadow: '0 0 16px rgba(124, 58, 237, 0.5)'
              }}
            >
              <span>Explore</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
            <span className="text-[9px] text-purple-400 font-bold uppercase tracking-wider">/gaming</span>
          </div>
        </div>
      </div>
    </div>
  );
};
