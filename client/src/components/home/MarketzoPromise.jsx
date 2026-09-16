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
    <div className="px-3 sm:px-4 mb-6 animate-fade-in-up">
      {/* Header */}
      <h2 className="text-sm sm:text-base font-black text-slate-900 mb-2.5">
        🛡️ MARKETZO Buyer Promise
      </h2>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
        {PROMISES.map(({ emoji, label, desc }, i) => (
          <div
            key={i}
            className="flex items-start gap-2.5 p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs"
          >
            {/* Icon */}
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base shrink-0 bg-indigo-50 border border-indigo-100">
              {emoji}
            </div>
            {/* Text */}
            <div className="min-w-0">
              <div className="text-xs font-black text-slate-900 leading-tight">
                {label}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                {desc}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
