import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { api } from '../../services/api';

const FALLBACK_BANNERS = [
  {
    id: 'fb1',
    title: 'Summer Mega Sale',
    subtitle: 'Extra 25% Off with code SUMMER25',
    cta: 'Shop Deals',
    badge: '⚡ Limited Time',
    gradient: 'linear-gradient(135deg, #312e81 0%, #4338ca 60%, #6366f1 100%)',
    tag: 'hotDeals',
    emoji: '🛍️'
  },
  {
    id: 'fb2',
    title: 'Flagship Mobiles & Tech',
    subtitle: 'Next-Gen 5G Smartphones & Audio',
    cta: 'Explore Tech',
    badge: '✨ Top Picks',
    gradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #334155 100%)',
    tag: 'featured',
    emoji: '📱'
  },
  {
    id: 'fb3',
    title: 'Tailored Luxury Fashion',
    subtitle: 'Italian Merino Wool & Streetwear',
    cta: 'View Collection',
    badge: '⭐ Designer',
    gradient: 'linear-gradient(135deg, #451a03 0%, #78350f 60%, #b45309 100%)',
    tag: 'new',
    emoji: '👔'
  }
];

export const HeroCarousel = ({ onNavigate }) => {
  const [banners, setBanners] = useState([]);
  const [active, setActive] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.getBanners()
      .then(res => {
        if (res.success && res.banners?.length > 0) {
          setBanners(res.banners.map(b => ({
            id: b.id,
            title: b.title || 'Special Offer',
            subtitle: b.subtitle || b.description || 'Discover top verified marketplace listings',
            cta: b.ctaText || 'Shop Now',
            badge: b.badge || '🔥 Hot Deal',
            image: b.imageUrl || b.image,
            gradient: 'linear-gradient(135deg, #312e81 0%, #4338ca 100%)',
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

  // Auto advance
  useEffect(() => {
    if (banners.length <= 1) return;
    const t = setInterval(() => setActive(a => (a + 1) % banners.length), 4500);
    return () => clearInterval(t);
  }, [banners.length]);

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
      <div className="px-3 sm:px-4 pb-3">
        <div className="skeleton-light h-40 rounded-3xl" />
      </div>
    );
  }

  const current = banners[active] || banners[0];
  if (!current) return null;

  return (
    <div className="px-3 sm:px-4 pb-3 animate-fade-in-up">
      <div
        className="relative rounded-3xl overflow-hidden shadow-md"
        style={{ height: '165px', background: current.gradient || 'linear-gradient(135deg, #312e81 0%, #4338ca 100%)' }}
      >
        {/* Background image if available */}
        {current.image && (
          <img
            src={current.image}
            alt={current.title}
            className="absolute inset-0 w-full h-full object-cover opacity-25"
            loading="lazy"
          />
        )}

        {/* Content overlay */}
        <div className="absolute inset-0 flex flex-col justify-between p-4 sm:p-5 z-10 text-white">
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 backdrop-blur-md border border-white/25 mb-1.5">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>{current.badge}</span>
            </div>

            {/* Title */}
            <h2 className="text-lg sm:text-xl font-black text-white leading-tight tracking-tight">
              {current.title}
            </h2>

            {/* Subtitle */}
            <p className="text-xs font-medium text-slate-200 mt-0.5 line-clamp-1">
              {current.subtitle}
            </p>
          </div>

          {/* CTA */}
          <button
            type="button"
            onClick={() => handleCta(current)}
            className="self-start flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-white text-indigo-900 shadow-md cursor-pointer press-feedback hover:bg-slate-50"
            aria-label={`${current.cta} — ${current.title}`}
          >
            <span>{current.cta}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Decorative large emoji */}
        {current.emoji && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-7xl opacity-25 select-none pointer-events-none">
            {current.emoji}
          </div>
        )}

        {/* Navigation Arrows */}
        {banners.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center bg-black/30 hover:bg-black/50 text-white cursor-pointer"
              aria-label="Previous banner"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center bg-black/30 hover:bg-black/50 text-white cursor-pointer"
              aria-label="Next banner"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Dots Indicator */}
      {banners.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-2">
          {banners.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              className="rounded-full transition-all cursor-pointer"
              style={{
                width: i === active ? '18px' : '6px',
                height: '5px',
                background: i === active ? '#4f46e5' : '#cbd5e1'
              }}
              aria-label={`Go to banner ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
