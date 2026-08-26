import React from 'react';
import { Truck, Lock, ShieldCheck, RotateCcw } from 'lucide-react';

const PROMISES = [
  { icon: Truck, emoji: '🚚', label: 'Fast Delivery', desc: 'Delivered to your door' },
  { icon: Lock, emoji: '🔒', label: 'Secure Payment', desc: '100% safe & encrypted' },
  { icon: ShieldCheck, emoji: '✓', label: 'Verified Sellers', desc: 'All merchants reviewed' },
  { icon: RotateCcw, emoji: '↩️', label: 'Easy Returns', desc: '7-day hassle-free returns' }
];

export const MarketzoPromise = () => {
  return (
    <div className="px-4 mb-6 animate-fade-in-up">
      {/* Header */}
      <h2
        className="text-base font-black mb-3"
        style={{ color: '#f1f5f9' }}
      >
        🛡️ MARKETZO Promise
      </h2>

      {/* Grid */}
      <div
        className="grid grid-cols-2 gap-2.5"
        style={{ borderRadius: '20px', overflow: 'hidden' }}
      >
        {PROMISES.map(({ icon: Icon, emoji, label, desc }, i) => (
          <div
            key={i}
            className="flex items-start gap-3 p-3.5 rounded-2xl"
            style={{
              background: '#111827',
              border: '1px solid rgba(255,255,255,0.05)'
            }}
          >
            {/* Icon */}
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
              style={{ background: 'rgba(99,102,241,0.12)' }}
            >
              {emoji}
            </div>
            {/* Text */}
            <div>
              <div className="text-xs font-bold" style={{ color: '#e2e8f0' }}>
                {label}
              </div>
              <div className="text-[10px] mt-0.5 leading-relaxed" style={{ color: 'rgba(148,163,184,0.7)' }}>
                {desc}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
