import React from 'react';
import { ChevronRight } from 'lucide-react';
import { MobileProductCard } from './MobileProductCard';

export const ProductCarousel = ({
  title,
  subtitle,
  emoji,
  products = [],
  isLoading = false,
  onNavigate,
  viewAllParams = {}
}) => {

  const handleViewAll = () => {
    onNavigate('products', viewAllParams);
  };

  // Skeleton placeholder
  if (isLoading) {
    return (
      <div className="mb-5 animate-fade-in-up">
        <div className="px-3 sm:px-4 mb-2.5 flex items-center justify-between">
          <div className="skeleton-light h-5 w-36 rounded-lg" />
          <div className="skeleton-light h-4 w-16 rounded-lg" />
        </div>
        <div className="px-3 sm:px-4 flex gap-3 overflow-x-auto no-scrollbar">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="shrink-0 w-[165px] sm:w-[190px]">
              <div className="skeleton-light rounded-2xl h-[165px]" />
              <div className="mt-2 skeleton-light h-3.5 w-28 rounded" />
              <div className="mt-1.5 skeleton-light h-3.5 w-16 rounded" />
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
    <div className="mb-5 animate-fade-in-up">
      {/* Section Header */}
      <div className="px-3 sm:px-4 mb-2.5 flex items-center justify-between">
        <div>
          <h2 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-1.5">
            {emoji && <span>{emoji}</span>}
            <span>{title}</span>
          </h2>
          {subtitle && (
            <p className="text-[11px] font-bold text-rose-600 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={handleViewAll}
          className="flex items-center gap-0.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer press-feedback"
          aria-label={`View all ${title}`}
        >
          <span>See All</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Horizontal product scroll */}
      <div className="px-3 sm:px-4 flex gap-3 overflow-x-auto no-scrollbar py-1">
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
