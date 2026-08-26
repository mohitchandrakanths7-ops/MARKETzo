import React, { useState } from 'react';
import { Search, Sparkles, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export const DesktopHero = ({ onNavigate, onOpenAiAssistant }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate('products', { search: searchQuery.trim() });
    }
  };

  return (
    <div
      className="relative rounded-2xl overflow-hidden flex flex-col justify-between p-8 border"
      style={{
        background: 'linear-gradient(135deg, #0a0f1e 0%, #0e162e 50%, #15103a 100%)',
        borderColor: 'rgba(255,255,255,0.08)',
        minHeight: '520px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
      }}
    >
      {/* Background Radial Glow */}
      <div
        className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, rgba(139,92,246,0.08) 40%, transparent 70%)',
          transform: 'translate(20%, -20%)'
        }}
      />
      <div
        className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 60%)'
        }}
      />

      <div className="grid grid-cols-12 gap-6 items-center h-full relative z-10">
        {/* Left Copy & Action Section */}
        <div className="col-span-7 flex flex-col justify-center space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border w-fit backdrop-blur-md"
            style={{
              background: 'rgba(59,130,246,0.1)',
              borderColor: 'rgba(59,130,246,0.3)',
              color: '#60a5fa'
            }}
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span className="text-[11px] font-extrabold uppercase tracking-wider">AI-POWERED MARKETPLACE</span>
          </div>

          {/* Headline */}
          <div className="space-y-1">
            <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15]">
              Shop Smarter.
            </h1>
            <h1
              className="text-4xl lg:text-5xl font-black tracking-tight leading-[1.15]"
              style={{
                background: 'linear-gradient(90deg, #60a5fa 0%, #a78bfa 50%, #c084fc 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Live Better.
            </h1>
          </div>

          {/* Subtitle */}
          <p className="text-sm font-medium leading-relaxed max-w-md" style={{ color: '#9CA3AF' }}>
            Discover millions of products from trusted sellers with fast delivery and buyer protection.
          </p>

          {/* Search bar inside Hero */}
          <form onSubmit={handleSearchSubmit} className="relative max-w-md w-full">
            <div
              className="flex items-center rounded-xl p-1.5 border shadow-inner backdrop-blur-md transition-all focus-within:border-blue-500"
              style={{
                background: 'rgba(16,21,34,0.85)',
                borderColor: 'rgba(255,255,255,0.12)'
              }}
            >
              <Search className="w-4 h-4 ml-3 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, brands & more..."
                className="w-full bg-transparent text-xs text-white placeholder:text-slate-400 outline-none px-3 py-2"
              />
              <button
                type="button"
                onClick={() => onOpenAiAssistant?.()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-white shrink-0 cursor-pointer press-feedback transition-all shadow-md"
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Find</span>
              </button>
            </div>
          </form>

          {/* CTA Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('products', {})}
              className="px-6 py-3 rounded-xl text-xs font-black text-white flex items-center gap-2 cursor-pointer press-feedback transition-all shadow-lg hover:shadow-indigo-500/30"
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
              }}
            >
              <span>Shop Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('products', { hotDeals: 'true' })}
              className="px-6 py-3 rounded-xl text-xs font-bold text-slate-200 border cursor-pointer press-feedback transition-all hover:bg-slate-800/60 hover:text-white"
              style={{
                borderColor: 'rgba(255,255,255,0.14)',
                background: 'rgba(255,255,255,0.03)'
              }}
            >
              Explore Deals
            </button>
          </div>
        </div>

        {/* Right Composition Section */}
        <div className="col-span-5 relative flex items-center justify-center h-full">
          <div className="relative w-full max-w-sm rounded-2xl overflow-hidden group">
            {/* Subtle glow behind image */}
            <div
              className="absolute inset-0 rounded-2xl blur-xl opacity-60 pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, rgba(59,130,246,0.2) 60%, transparent 80%)'
              }}
            />
            <img
              src="/hero-products.jpg"
              alt="MARKETZO Featured Tech Products"
              className="relative z-10 w-full object-contain rounded-2xl transition-transform duration-500 group-hover:scale-[1.03]"
              onError={(e) => {
                // Fallback styling if local image is loading
                e.target.style.display = 'none';
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
