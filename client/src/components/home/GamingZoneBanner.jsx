import React from 'react';
import { ChevronRight, Gamepad2, Zap, Sparkles } from 'lucide-react';

export const GamingZoneBanner = ({ onNavigate }) => {
  return (
    <div className="px-3 sm:px-4 mb-4 animate-fade-in-up">
      <div
        className="relative rounded-2xl sm:rounded-3xl overflow-hidden gaming-glow cursor-pointer press-feedback border border-purple-500/30 shadow-lg"
        style={{
          background: 'linear-gradient(135deg, #090d1c 0%, #150d30 50%, #080718 100%)',
          minHeight: '130px'
        }}
        onClick={() => onNavigate('gaming')}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onNavigate('gaming')}
        aria-label="Enter MARKETZO Gaming Zone"
      >
        {/* Ambient Glows */}
        <div
          className="absolute -left-10 top-1/2 -translate-y-1/2 w-36 h-36 rounded-full opacity-25"
          style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }}
        />
        <div
          className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full opacity-30"
          style={{ background: 'radial-gradient(circle, #a855f7 0%, transparent 70%)' }}
        />

        {/* Content */}
        <div className="relative z-10 p-4 sm:p-5 flex items-center justify-between">
          <div className="space-y-1.5 max-w-[70%]">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <Sparkles className="w-3 h-3 text-purple-400 animate-spin" style={{ animationDuration: '4s' }} />
              <span>Dedicated Destination</span>
            </div>

            {/* Headline */}
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl">🎮</span>
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-white uppercase leading-tight">
                GAMING ZONE
              </h2>
            </div>

            <p className="text-[11px] sm:text-xs text-purple-200/90 font-medium line-clamp-1">
              Esports Gear • 240Hz Monitors • Rapid Trigger
            </p>
          </div>

          {/* Action CTA Button */}
          <div className="shrink-0 flex flex-col items-end gap-1">
            <div className="flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 shadow-md shadow-purple-900/50">
              <span>EXPLORE</span>
              <ChevronRight className="w-4 h-4" />
            </div>
            <span className="text-[9px] text-purple-400 font-bold uppercase tracking-wider">/gaming</span>
          </div>
        </div>
      </div>
    </div>
  );
};
