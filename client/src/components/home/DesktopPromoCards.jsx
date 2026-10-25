import React from 'react';
import { Flame, Package, Sparkles, ArrowRight } from 'lucide-react';

export const DesktopPromoCards = ({ onNavigate, onOpenAiAssistant }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
      
      {/* Card 1: Crazy Deals */}
      <div
        onClick={() => onNavigate('products', { hotDeals: 'true' })}
        className="relative rounded-2xl overflow-hidden p-5 flex items-center justify-between cursor-pointer group transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_10px_30px_rgba(255,70,0,0.25)] border"
        style={{
          background: 'linear-gradient(135deg, #1f0707 0%, #3d0c0c 45%, #63140b 100%)',
          borderColor: 'rgba(255, 100, 50, 0.35)',
        }}
      >
        {/* Glow */}
        <div
          className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full pointer-events-none blur-2xl opacity-60"
          style={{ background: 'radial-gradient(circle, #ff4500 0%, transparent 70%)' }}
        />

        {/* Left Content */}
        <div className="relative z-10 flex flex-col justify-between h-full space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xl animate-pulse">🔥</span>
            <h3 className="text-base font-black text-white tracking-wide">
              Crazy Deals
            </h3>
          </div>
          <p className="text-xs text-orange-200/80 font-medium">
            Limited time offers
          </p>
          <div className="pt-2 flex items-center gap-1.5 text-xs font-black text-orange-400 group-hover:text-white transition-colors">
            <span>Up to 70% Off</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Right 3D Illustration */}
        <div className="relative z-10 w-24 h-24 shrink-0 flex items-center justify-center">
          <img
            src="/deals-giftbox.jpg"
            alt="Crazy Deals Gift Box"
            className="w-full h-full object-contain rounded-xl drop-shadow-[0_10px_15px_rgba(0,0,0,0.6)] group-hover:scale-110 transition-transform duration-300"
          />
        </div>
      </div>

      {/* Card 2: Wholesale */}
      <div
        onClick={() => onNavigate('products', { wholesale: 'true' })}
        className="relative rounded-2xl overflow-hidden p-5 flex items-center justify-between cursor-pointer group transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_10px_30px_rgba(0,200,255,0.25)] border"
        style={{
          background: 'linear-gradient(135deg, #051923 0%, #082d38 45%, #0d4a52 100%)',
          borderColor: 'rgba(0, 200, 255, 0.35)',
        }}
      >
        {/* Glow */}
        <div
          className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full pointer-events-none blur-2xl opacity-60"
          style={{ background: 'radial-gradient(circle, #00C8FF 0%, transparent 70%)' }}
        />

        {/* Left Content */}
        <div className="relative z-10 flex flex-col justify-between h-full space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-teal-500/20 text-[#00C8FF]">
              <Package className="w-4 h-4" />
            </div>
            <h3 className="text-base font-black text-white tracking-wide">
              Wholesale
            </h3>
          </div>
          <p className="text-xs text-teal-200/80 font-medium">
            Bulk Price, Bigger Savings
          </p>
          <div className="pt-2 flex items-center gap-1.5 text-xs font-black text-[#00C8FF] group-hover:text-white transition-colors">
            <span>Starting at ₹99</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Right 3D Illustration */}
        <div className="relative z-10 w-24 h-24 shrink-0 flex items-center justify-center">
          <img
            src="/wholesale-boxes.jpg"
            alt="Wholesale Bulk Packages"
            className="w-full h-full object-contain rounded-xl drop-shadow-[0_10px_15px_rgba(0,0,0,0.6)] group-hover:scale-110 transition-transform duration-300"
          />
        </div>
      </div>

      {/* Card 3: AI Find */}
      <div
        onClick={() => onOpenAiAssistant?.()}
        className="relative rounded-2xl overflow-hidden p-5 flex items-center justify-between cursor-pointer group transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_10px_30px_rgba(112,46,255,0.3)] border"
        style={{
          background: 'linear-gradient(135deg, #100a26 0%, #1e1045 45%, #2e1666 100%)',
          borderColor: 'rgba(168, 85, 247, 0.4)',
        }}
      >
        {/* Glow */}
        <div
          className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full pointer-events-none blur-2xl opacity-60"
          style={{ background: 'radial-gradient(circle, #702EFF 0%, transparent 70%)' }}
        />

        {/* Left Content */}
        <div className="relative z-10 flex flex-col justify-between h-full space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-purple-500/20 text-[#A855F7]">
              <Sparkles className="w-4 h-4 text-purple-300" />
            </div>
            <h3 className="text-base font-black text-white tracking-wide">
              AI Find
            </h3>
          </div>
          <p className="text-xs text-purple-200/80 font-medium">
            Find products with AI
          </p>
          <div className="pt-2 flex items-center gap-1.5 text-xs font-black text-[#A855F7] group-hover:text-white transition-colors">
            <span>Smarter. Faster.</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Right 3D Illustration */}
        <div className="relative z-10 w-24 h-24 shrink-0 flex items-center justify-center">
          <img
            src="/ai-robot.jpg"
            alt="AI Assistant Robot"
            className="w-full h-full object-contain rounded-xl drop-shadow-[0_10px_15px_rgba(0,0,0,0.6)] group-hover:scale-110 transition-transform duration-300"
          />
        </div>
      </div>

    </div>
  );
};
