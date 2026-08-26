import React, { useRef } from 'react';
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
      <div className="mb-6 animate-fade-in-up">
        <div className="px-4 mb-3 flex items-center justify-between">
          <div className="skeleton-dark h-5 w-36 rounded" />
          <div className="skeleton-dark h-4 w-16 rounded" />
        </div>
        <div className="px-4 flex gap-3 overflow-x-auto no-scrollbar">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="shrink-0" style={{ width: '160px' }}>
              <div className="skeleton-dark rounded-2xl" style={{ height: '160px' }} />
              <div className="mt-2 skeleton-dark h-3 w-24 rounded" />
              <div className="mt-1.5 skeleton-dark h-3 w-16 rounded" />
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
      <div className="px-4 mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-base font-black" style={{ color: '#f1f5f9' }}>
            {emoji && <span className="mr-1.5">{emoji}</span>}
            {title}
          </h2>
          {subtitle && (
            <p className="text-[11px] mt-0.5" style={{ color: 'rgba(148,163,184,0.7)' }}>
              {subtitle}
            </p>
          )}
        </div>
        <button
          onClick={handleViewAll}
          className="flex items-center gap-0.5 text-xs font-semibold cursor-pointer press-feedback"
          style={{ color: '#818cf8' }}
          aria-label={`View all ${title}`}
        >
          <span>View All</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Horizontal product scroll */}
      <div className="px-4 flex gap-3 overflow-x-auto no-scrollbar">
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
