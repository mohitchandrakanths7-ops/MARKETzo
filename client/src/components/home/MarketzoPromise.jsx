import React from 'react';
import { Truck, Lock, ShieldCheck, RotateCcw } from 'lucide-react';

const PROMISES = [
  { icon: Truck, emoji: '🚚', label: 'Fast Express Delivery', desc: 'Direct to your doorstep' },
  { icon: Lock, emoji: '🔒', label: 'Secure Payments', desc: '100% encrypted & safe' },
  { icon: ShieldCheck, emoji: '🛡️', label: 'Verified Sellers', desc: '100% authentic merchants' },
  { icon: RotateCcw, emoji: '↩️', label: 'Easy 7-Day Returns', desc: 'Hassle-free guarantee' }
];

export const MarketzoPromise = () => {
  return (
    <div className="px-3.5 mb-6 animate-fade-in-up">
      {/* Header */}
      <h2 className="text-sm sm:text-base font-black text-white mb-3 flex items-center gap-1.5">
        <span>🛡️</span>
        <span>MARKETZO Buyer Promise</span>
      </h2>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {PROMISES.map(({ emoji, label, desc }, i) => (
          <div
            key={i}
            className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#111827] border border-white/10 shadow-md"
          >
            {/* Icon */}
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base shrink-0 bg-[#0a0f1d] border border-white/5">
              {emoji}
            </div>
            {/* Text */}
            <div className="min-w-0">
              <div className="text-xs font-bold text-white leading-tight">
                {label}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                {desc}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
