import React from 'react';
import { ChevronRight, ShieldCheck, Star, Store } from 'lucide-react';

export const SellerCarousel = ({ sellers = [], isLoading = false, onNavigate }) => {

  if (isLoading) {
    return (
      <div className="mb-6">
        <div className="px-4 mb-3 flex items-center justify-between">
          <div className="skeleton-dark h-5 w-36 rounded" />
          <div className="skeleton-dark h-4 w-16 rounded" />
        </div>
        <div className="px-4 flex gap-3 overflow-x-auto no-scrollbar">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="skeleton-dark shrink-0 rounded-2xl"
              style={{ width: '130px', height: '160px' }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!sellers || sellers.length === 0) return null;

  return (
    <div className="mb-6 animate-fade-in-up">
      {/* Header */}
      <div className="px-4 mb-3 flex items-center justify-between">
        <h2 className="text-base font-black" style={{ color: '#f1f5f9' }}>
          🏆 Popular Sellers
        </h2>
        <button
          onClick={() => onNavigate('products', {})}
          className="flex items-center gap-0.5 text-xs font-semibold cursor-pointer press-feedback"
          style={{ color: '#818cf8' }}
          aria-label="View all sellers"
        >
          <span>View All</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Horizontal carousel */}
      <div className="px-4 flex gap-3 overflow-x-auto no-scrollbar">
        {sellers.map((seller) => (
          <button
            key={seller.id}
            onClick={() => onNavigate('products', { sellerId: seller.id })}
            className="shrink-0 flex flex-col items-center p-3 rounded-2xl cursor-pointer press-feedback"
            style={{
              width: '130px',
              background: '#111827',
              border: '1px solid rgba(255,255,255,0.06)'
            }}
            aria-label={`Visit ${seller.storeName} store`}
          >
            {/* Logo */}
            <div
              className="w-14 h-14 rounded-2xl overflow-hidden flex items-center justify-center mb-2 shrink-0"
              style={{ background: 'linear-gradient(135deg,#1e2d45,#0f172a)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              {seller.storeLogo ? (
                <img
                  src={seller.storeLogo}
                  alt={seller.storeName}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <Store className="w-6 h-6" style={{ color: '#818cf8' }} />
              )}
            </div>

            {/* Name */}
            <span
              className="text-xs font-bold text-center line-clamp-1 w-full"
              style={{ color: '#e2e8f0' }}
            >
              {seller.storeName}
            </span>

            {/* Rating */}
            {seller.rating > 0 && (
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-3 h-3" style={{ color: '#fbbf24', fill: '#fbbf24' }} />
                <span className="text-[10px] font-semibold" style={{ color: '#fbbf24' }}>
                  {seller.rating.toFixed(1)}
                </span>
              </div>
            )}

            {/* Verified badge */}
            {seller.isVerified && (
              <div
                className="flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}
              >
                <ShieldCheck className="w-2.5 h-2.5" style={{ color: '#10b981' }} />
                <span className="text-[9px] font-bold" style={{ color: '#10b981' }}>Verified</span>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
