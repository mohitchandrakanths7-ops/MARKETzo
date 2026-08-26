import React from 'react';
import { ShieldCheck, Truck, Lock, RotateCcw, Headphones } from 'lucide-react';

export const DesktopTrustStrip = () => {
  const items = [
    {
      icon: ShieldCheck,
      title: '100% Original',
      desc: 'Genuine Products'
    },
    {
      icon: Truck,
      title: 'Fast Delivery',
      desc: 'At your doorstep'
    },
    {
      icon: Lock,
      title: 'Secure Payment',
      desc: '100% Protected'
    },
    {
      icon: RotateCcw,
      title: 'Buyer Protection',
      desc: 'Easy Returns'
    },
    {
      icon: Headphones,
      title: '24/7 Support',
      desc: "We're here"
    }
  ];

  return (
    <div
      className="rounded-2xl p-4 border"
      style={{
        background: '#101522',
        borderColor: 'rgba(255,255,255,0.07)'
      }}
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 divide-y lg:divide-y-0 lg:divide-x divide-white/5">
        {items.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className={`flex items-center gap-3.5 ${idx !== 0 ? 'lg:pl-6' : ''} ${idx > 0 ? 'pt-3 lg:pt-0' : ''}`}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
                style={{
                  background: 'rgba(59,130,246,0.08)',
                  borderColor: 'rgba(59,130,246,0.2)',
                  color: '#60a5fa'
                }}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">{item.title}</div>
                <div className="text-[11px] text-slate-400 truncate">{item.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
