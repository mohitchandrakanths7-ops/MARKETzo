import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, ChevronLeft, Sparkles, ArrowRight } from 'lucide-react';
import { api } from '../../services/api';

const FALLBACK_BANNERS = [
  {
    id: 'fb1',
    title: 'Summer Mega Sale',
    subtitle: 'Up to 40% OFF Top Tech & Fashion',
    cta: 'Shop Now',
    badge: '⚡ Limited Time Deal',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80',
    tag: 'hotDeals',
    emoji: '🎧'
  },
  {
    id: 'fb2',
    title: 'Next-Gen Flagships',
    subtitle: 'Ultra 5G Smartphones & OLEDs',
    cta: 'Explore Devices',
    badge: '✨ Trending Picks',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=80',
    tag: 'featured',
    emoji: '📱'
  },
  {
    id: 'fb3',
    title: 'Designer Collections',
    subtitle: 'Premium Italian Merino & Streetwear',
    cta: 'View Collection',
    badge: '⭐ Luxury Fashion',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=500&auto=format&fit=crop&q=80',
    tag: 'new',
    emoji: '👔'
  }
];

export const HeroCarousel = ({ onNavigate }) => {
  const [banners, setBanners] = useState([]);
  const [active, setActive] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Touch swipe handling
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  useEffect(() => {
    api.getBanners()
      .then(res => {
        if (res.success && res.banners?.length > 0) {
          setBanners(res.banners.map(b => ({
            id: b.id,
            title: b.title || 'Special Offer',
            subtitle: b.subtitle || b.description || 'Up to 40% OFF marketplace listings',
            cta: b.ctaText || 'Shop Now',
            badge: b.badge || '⚡ Limited Time Deal',
            image: b.imageUrl || b.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80',
            tag: b.tag || 'hotDeals',
            emoji: b.emoji || '🛍️'
          })));
        } else {
          setBanners(FALLBACK_BANNERS);
        }
      })
      .catch(() => setBanners(FALLBACK_BANNERS))
      .finally(() => setIsLoading(false));
  }, []);

  // Auto advance every 4.5s
  useEffect(() => {
    if (banners.length <= 1) return;
    const t = setInterval(() => setActive(a => (a + 1) % banners.length), 4500);
    return () => clearInterval(t);
  }, [banners.length]);

  const prev = () => setActive(a => (a - 1 + banners.length) % banners.length);
  const next = () => setActive(a => (a + 1) % banners.length);

  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > 50) next();
    if (distance < -50) prev();
  };

  const handleCta = (banner) => {
    if (banner.tag === 'gaming') {
      onNavigate('gaming');
    } else {
      onNavigate('products', { [banner.tag || 'hotDeals']: 'true' });
    }
  };

  if (isLoading) {
    return (
      <div className="px-3.5 pb-3">
        <div className="skeleton-dark h-44 rounded-3xl" />
      </div>
    );
  }

  const current = banners[active] || banners[0];
  if (!current) return null;

  return (
    <div className="px-3.5 pb-3.5 animate-fade-in-up">
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative rounded-3xl overflow-hidden border border-white/10 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)]"
        style={{
          background: 'linear-gradient(135deg, #0b1329 0%, #111a33 50%, #151638 100%)',
          minHeight: '160px'
        }}
      >
        {/* Soft Glowing Ambient Backlights */}
        <div
          className="absolute -top-10 -left-10 w-40 h-40 rounded-full opacity-30 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-10 right-10 w-44 h-44 rounded-full opacity-30 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)' }}
        />

        {/* Content Layout: Left Text & CTA, Right Product Image */}
        <div className="relative z-10 p-4 sm:p-5 flex items-center justify-between gap-3">
          
          {/* Left Area: Badge, Title, Subtitle, Gradient CTA */}
          <div className="flex-1 min-w-0 pr-1 space-y-1.5">
            
            {/* Small Badge */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>{current.badge}</span>
            </div>

            {/* Headline */}
            <h2 className="text-base sm:text-lg font-black text-white leading-snug tracking-tight line-clamp-1">
              {current.title}
            </h2>

            {/* Subtitle */}
            <p className="text-xs font-semibold text-slate-300 line-clamp-1">
              {current.subtitle}
            </p>

            {/* Gradient Blue/Purple CTA Button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => handleCta(current)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-white shadow-md cursor-pointer press-feedback hover:opacity-95"
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  boxShadow: '0 0 16px rgba(139, 92, 246, 0.4)'
                }}
                aria-label={`${current.cta} — ${current.title}`}
              >
                <span>{current.cta}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right Area: Large High-Quality Product Image */}
          <div className="shrink-0 w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-[#0a0f1d]/80 border border-white/10 p-1.5 flex items-center justify-center shadow-md">
            {current.image ? (
              <img
                src={current.image}
                alt={current.title}
                className="w-full h-full object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80';
                }}
              />
            ) : (
              <span className="text-5xl select-none">{current.emoji || '🛍️'}</span>
            )}
          </div>
        </div>

        {/* Carousel Slide Indicators */}
        {banners.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
            {banners.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActive(i)}
                className="rounded-full transition-all cursor-pointer"
                style={{
                  width: i === active ? '16px' : '5px',
                  height: '4px',
                  background: i === active ? 'linear-gradient(90deg, #3b82f6, #8b5cf6)' : 'rgba(255, 255, 255, 0.25)'
                }}
                aria-label={`Go to banner ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
