import React from 'react';
import { ChevronRight, Clock, Zap } from 'lucide-react';
import { MobileProductCard } from './MobileProductCard';

export const ProductCarousel = ({
  title,
  subtitle,
  emoji,
  products = [],
  isLoading = false,
  onNavigate,
  viewAllParams = {},
  isFlashDeal = false,
  timerText = null
}) => {

  const handleViewAll = () => {
    onNavigate('products', viewAllParams);
  };

  // Skeleton placeholder
  if (isLoading) {
    return (
      <div className="mb-6 animate-fade-in-up">
        <div className="px-3.5 mb-2.5 flex items-center justify-between">
          <div className="skeleton-dark h-5 w-36 rounded-lg" />
          <div className="skeleton-dark h-4 w-16 rounded-lg" />
        </div>
        <div className="px-3.5 flex gap-3 overflow-x-auto no-scrollbar">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="shrink-0 w-[170px] sm:w-[195px]">
              <div className="skeleton-dark rounded-3xl h-[170px]" />
              <div className="mt-2.5 skeleton-dark h-3.5 w-28 rounded" />
              <div className="mt-1.5 skeleton-dark h-3.5 w-16 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 animate-fade-in-up">
      {/* Section Header */}
      <div className="px-3.5 mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm sm:text-base font-black text-white flex items-center gap-1.5">
            {emoji && <span>{emoji}</span>}
            <span>{title}</span>
          </h2>

          {/* Flash Deals Live Timer Badge */}
          {(timerText || subtitle) && (
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-950/80 text-rose-300 border border-rose-800 text-[11px] font-black">
              <Clock className="w-3 h-3 text-rose-400 animate-spin" style={{ animationDuration: '6s' }} />
              <span>{timerText || subtitle}</span>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleViewAll}
          className="flex items-center gap-0.5 text-xs font-bold text-blue-400 hover:text-blue-300 cursor-pointer press-feedback"
          aria-label={`View all ${title}`}
        >
          <span>View All</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Horizontal product scroll */}
      <div className="px-3.5 flex gap-3 overflow-x-auto no-scrollbar py-1">
        {products.map((product) => (
          <MobileProductCard
            key={product.id}
            product={product}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    </div>
  );
};
