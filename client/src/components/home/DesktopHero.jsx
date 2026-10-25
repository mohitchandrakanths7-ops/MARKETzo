import React, { useState } from 'react';
import {
  Search,
  Sparkles,
  ArrowRight,
  Truck,
  ShieldCheck,
  Shield,
  Headphones
} from 'lucide-react';

export const DesktopHero = ({ onNavigate, onOpenAiAssistant }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSlide, setActiveSlide] = useState(0);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate('products', { search: searchQuery.trim() });
    }
  };

  return (
    <div
      className="relative rounded-3xl overflow-hidden flex flex-col justify-between p-6 lg:p-8 border shadow-2xl"
      style={{
        background: 'linear-gradient(135deg, #081225 0%, #0d1b38 55%, #160e3d 100%)',
        borderColor: 'rgba(100, 149, 237, 0.25)',
        minHeight: '520px',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
      }}
    >
      {/* Background Radial Ambient Glows */}
      <div
        className="absolute top-0 right-10 w-[550px] h-[550px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(112,46,255,0.22) 0%, rgba(37,131,255,0.12) 40%, transparent 70%)',
          transform: 'translate(10%, -15%)'
        }}
      />
      <div
        className="absolute bottom-0 left-1/4 w-[450px] h-[450px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(0,200,255,0.15) 0%, transparent 65%)'
        }}
      />

      <div className="grid grid-cols-12 gap-6 items-center h-full relative z-10">
        
        {/* Left Copy & Action Section */}
        <div className="col-span-12 lg:col-span-7 flex flex-col justify-center space-y-5">
          {/* AI Badge */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border w-fit backdrop-blur-md shadow-[0_0_15px_rgba(0,200,255,0.2)]"
            style={{
              background: 'rgba(37, 131, 255, 0.12)',
              borderColor: 'rgba(0, 200, 255, 0.45)',
              color: '#00C8FF'
            }}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#00C8FF] animate-spin" style={{ animationDuration: '6s' }} />
            <span className="text-[11px] font-black uppercase tracking-wider">AI-POWERED MARKETPLACE</span>
          </div>

          {/* Main Headline */}
          <div className="space-y-0.5">
            <h1 className="text-4xl xl:text-5xl font-black text-white tracking-tight leading-[1.12]">
              Shop Smarter.
            </h1>
            <h1
              className="text-4xl xl:text-5xl font-black tracking-tight leading-[1.12]"
              style={{
                background: 'linear-gradient(90deg, #00C8FF 0%, #2583FF 45%, #A855F7 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 30px rgba(112,46,255,0.3)'
              }}
            >
              Live Better.
            </h1>
          </div>

          {/* Subtitle */}
          <p className="text-xs xl:text-sm font-medium leading-relaxed max-w-md text-[#A8B5CC]">
            Discover millions of products from trusted sellers with fast delivery and buyer protection.
          </p>

          {/* Search bar inside Hero */}
          <form onSubmit={handleSearchSubmit} className="relative max-w-md w-full">
            <div
              className="flex items-center rounded-full p-1.5 border shadow-inner backdrop-blur-md transition-all focus-within:border-[#00C8FF] focus-within:shadow-[0_0_20px_rgba(0,200,255,0.25)]"
              style={{
                background: 'rgba(11, 20, 39, 0.9)',
                borderColor: 'rgba(100, 149, 237, 0.35)'
              }}
            >
              <Search className="w-4 h-4 ml-3.5 text-slate-400 shrink-0" />
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
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black text-white shrink-0 cursor-pointer transition-all shadow-md hover:brightness-110"
                style={{
                  background: 'linear-gradient(135deg, #702EFF 0%, #2583FF 100%)',
                  boxShadow: '0 0 12px rgba(112, 46, 255, 0.4)'
                }}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>AI Find</span>
              </button>
            </div>
          </form>

          {/* 4 Compact Trust Indicators */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] text-[#A8B5CC] font-semibold">
            <div className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-[#2583FF] shrink-0" />
              <span className="truncate">Fast & Free Delivery</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00C8FF] shrink-0" />
              <span className="truncate">100% Genuine Products</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#A855F7] shrink-0" />
              <span className="truncate">Buyer Protection</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Headphones className="w-3.5 h-3.5 text-[#22C55E] shrink-0" />
              <span className="truncate">24/7 Support</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('products', {})}
              className="px-6 py-2.5 rounded-full text-xs font-black text-white flex items-center gap-2 cursor-pointer transition-all shadow-lg hover:shadow-[0_0_20px_rgba(112,46,255,0.5)] hover:scale-[1.02]"
              style={{
                background: 'linear-gradient(135deg, #2583FF 0%, #702EFF 100%)',
              }}
            >
              <span>Shop Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('products', { hotDeals: 'true' })}
              className="px-6 py-2.5 rounded-full text-xs font-bold text-slate-200 border cursor-pointer transition-all hover:bg-[#101B32] hover:text-white hover:border-[#00C8FF]/50"
              style={{
                borderColor: 'rgba(100, 149, 237, 0.3)',
                background: 'rgba(11, 20, 39, 0.7)'
              }}
            >
              Explore Deals
            </button>
          </div>
        </div>

        {/* Right 3D Gadgets Showcase Composition */}
        <div className="col-span-12 lg:col-span-5 relative flex items-center justify-center">
          <div className="relative w-full max-w-md rounded-2xl overflow-hidden group">
            
            {/* "Better Choices Bigger Dreams" stylized text in top-right */}
            <div className="absolute top-2 right-4 z-20 text-right pointer-events-none">
              <span
                className="text-xs xl:text-sm font-bold tracking-wider italic"
                style={{
                  fontFamily: 'cursive, system-ui',
                  background: 'linear-gradient(135deg, #FFFFFF 0%, #A8B5CC 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 2px 10px rgba(0,0,0,0.8)'
                }}
              >
                Better Choices<br />Bigger Dreams
              </span>
            </div>

            {/* Glowing circular backdrop lighting */}
            <div
              className="absolute inset-0 rounded-2xl blur-2xl opacity-70 pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(112,46,255,0.4) 0%, rgba(0,200,255,0.3) 50%, transparent 75%)'
              }}
            />

            {/* High-Resolution 3D Gadgets Showcase Image */}
            <img
              src="/hero-showcase.jpg"
              alt="MARKETZO Premium Tech Ecosystem"
              className="relative z-10 w-full object-cover rounded-2xl transition-transform duration-500 group-hover:scale-[1.03]"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/hero-products.jpg';
              }}
            />

            {/* Interactive Carousel Pagination Dots */}
            <div className="absolute bottom-3 right-4 z-20 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
              {[0, 1, 2, 3].map((dot) => (
                <button
                  key={dot}
                  type="button"
                  onClick={() => setActiveSlide(dot)}
                  className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                    activeSlide === dot
                      ? 'w-4 bg-[#00C8FF] shadow-[0_0_8px_#00C8FF]'
                      : 'bg-white/40 hover:bg-white/70'
                  }`}
                  title={`Slide ${dot + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
