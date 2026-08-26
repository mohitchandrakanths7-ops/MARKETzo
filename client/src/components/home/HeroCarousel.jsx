import React, { useState, useEffect, useCallback } from 'react';
import { ChevronRight, ChevronLeft, Tag } from 'lucide-react';
import { api } from '../../services/api';

const FALLBACK_BANNERS = [
  {
    id: 'fb1',
    title: 'Summer Sale',
    subtitle: 'Up to 40% OFF on top brands',
    cta: 'Shop Now',
    badge: '⚡ Limited Time',
    gradient: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #312e81 100%)',
    accentColor: '#818cf8',
    tag: 'hotDeals',
    emoji: '🛍️'
  },
  {
    id: 'fb2',
    title: 'New Arrivals',
    subtitle: 'Fresh drops every day',
    cta: 'Explore',
    badge: '✨ Just In',
    gradient: 'linear-gradient(135deg, #0f172a 0%, #0c1a2e 60%, #0f3460 100%)',
    accentColor: '#38bdf8',
    tag: 'new',
    emoji: '🆕'
  },
  {
    id: 'fb3',
    title: 'Top Rated',
    subtitle: 'Products loved by millions',
    cta: 'Browse',
    badge: '⭐ Best Rated',
    gradient: 'linear-gradient(135deg, #0f172a 0%, #1a0f2e 60%, #3b0764 100%)',
    accentColor: '#a78bfa',
    tag: 'featured',
    emoji: '🏆'
  }
];

export const HeroCarousel = ({ onNavigate }) => {
  const [banners, setBanners] = useState([]);
  const [active, setActive] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    api.getBanners()
      .then(res => {
        if (res.success && res.banners?.length > 0) {
          setBanners(res.banners.map(b => ({
            id: b.id,
            title: b.title || 'Special Offer',
            subtitle: b.subtitle || b.description || 'Check out our latest deals',
            cta: b.ctaText || 'Shop Now',
            badge: b.badge || '🔥 Hot Deal',
            image: b.imageUrl || b.image,
            gradient: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
            accentColor: '#818cf8',
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

  // Auto-advance carousel
  useEffect(() => {
    if (banners.length <= 1 || isPaused) return;
    const t = setInterval(() => setActive(a => (a + 1) % banners.length), 4000);
    return () => clearInterval(t);
  }, [banners.length, isPaused]);

  const prev = () => setActive(a => (a - 1 + banners.length) % banners.length);
  const next = () => setActive(a => (a + 1) % banners.length);

  const handleCta = (banner) => {
    if (banner.tag === 'gaming') {
      onNavigate('gaming');
    } else {
      onNavigate('products', { [banner.tag || 'hotDeals']: 'true' });
    }
  };

  if (isLoading) {
    return (
      <div className="px-4 pb-4">
        <div className="skeleton-dark h-44 rounded-3xl" />
      </div>
    );
  }

  const current = banners[active] || banners[0];
  if (!current) return null;

  return (
    <div
      className="px-4 pb-4 animate-fade-in-up animate-fade-in-up-delay-2"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        className="relative rounded-3xl overflow-hidden"
        style={{ height: '180px', background: current.gradient || 'linear-gradient(135deg,#0f172a,#1e1b4b)' }}
      >
        {/* Background image if available */}
        {current.image && (
          <img
            src={current.image}
            alt={current.title}
            className="absolute inset-0 w-full h-full object-cover opacity-30"
            loading="lazy"
          />
        )}

        {/* Content overlay */}
        <div className="absolute inset-0 flex flex-col justify-center p-6 z-10">
          {/* Badge */}
          <div
            className="inline-flex items-center self-start gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold mb-3"
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: current.accentColor || '#a78bfa' }}
          >
            {current.badge}
          </div>

          {/* Title */}
          <h2 className="text-2xl font-black text-white leading-tight mb-1">
            {current.emoji && <span className="mr-2">{current.emoji}</span>}
            {current.title}
          </h2>

          {/* Subtitle */}
          <p className="text-xs font-medium mb-4" style={{ color: 'rgba(203,213,225,0.8)' }}>
            {current.subtitle}
          </p>

          {/* CTA */}
          <button
            onClick={() => handleCta(current)}
            className="self-start flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold cursor-pointer press-feedback"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: '#ffffff' }}
            aria-label={`${current.cta} — ${current.title}`}
          >
            <span>{current.cta}</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* Decorative circles */}
        <div
          className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-15"
          style={{ background: current.accentColor || '#818cf8' }}
        />
        <div
          className="absolute -right-4 bottom-0 w-20 h-20 rounded-full opacity-10"
          style={{ background: current.accentColor || '#818cf8' }}
        />

        {/* Emoji large decoration */}
        {current.emoji && (
          <div className="absolute right-6 top-1/2 -translate-y-1/2 text-7xl opacity-20 select-none">
            {current.emoji}
          </div>
        )}

        {/* Nav arrows (only if multiple banners) */}
        {banners.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer"
              style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}
              aria-label="Previous banner"
            >
              <ChevronLeft className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer"
              style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}
              aria-label="Next banner"
            >
              <ChevronRight className="w-4 h-4 text-white" />
            </button>
          </>
        )}
      </div>

      {/* Dots */}
      {banners.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-2.5">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className="rounded-full transition-all cursor-pointer"
              style={{
                width: i === active ? '20px' : '6px',
                height: '6px',
                background: i === active
                  ? 'linear-gradient(90deg, #3b82f6, #8b5cf6)'
                  : 'rgba(255,255,255,0.2)'
              }}
              aria-label={`Go to banner ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
