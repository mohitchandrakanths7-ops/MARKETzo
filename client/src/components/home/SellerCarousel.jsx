import React from 'react';
import { ChevronRight, ShieldCheck, Star, Store } from 'lucide-react';

export const SellerCarousel = ({ sellers = [], isLoading = false, onNavigate }) => {

  if (isLoading) {
    return (
      <div className="mb-6 animate-fade-in-up">
        <div className="px-3.5 mb-2.5 flex items-center justify-between">
          <div className="skeleton-dark h-5 w-36 rounded-lg" />
          <div className="skeleton-dark h-4 w-16 rounded-lg" />
        </div>
        <div className="px-3.5 flex gap-3 overflow-x-auto no-scrollbar">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="skeleton-dark shrink-0 rounded-3xl w-[135px] h-[155px]"
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
      <div className="px-3.5 mb-3 flex items-center justify-between">
        <h2 className="text-sm sm:text-base font-black text-white flex items-center gap-1.5">
          <span>🏆</span>
          <span>Verified Marketplace Stores</span>
        </h2>
        <button
          type="button"
          onClick={() => onNavigate('products', {})}
          className="flex items-center gap-0.5 text-xs font-bold text-blue-400 hover:text-blue-300 cursor-pointer press-feedback"
          aria-label="View all sellers"
        >
          <span>View All</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Horizontal carousel */}
      <div className="px-3.5 flex gap-3 overflow-x-auto no-scrollbar py-1">
        {sellers.map((seller) => (
          <button
            key={seller.id}
            type="button"
            onClick={() => onNavigate('products', { sellerId: seller.id })}
            className="shrink-0 flex flex-col items-center p-3 rounded-3xl bg-[#111827] border border-white/10 shadow-lg hover:border-white/20 transition-all cursor-pointer press-feedback w-[135px]"
            aria-label={`Visit ${seller.storeName} store`}
          >
            {/* Logo */}
            <div
              className="w-12 h-12 rounded-2xl overflow-hidden flex items-center justify-center mb-2 shrink-0 bg-[#0a0f1d] border border-white/5 p-1"
            >
              {seller.logo || seller.storeLogo ? (
                <img
                  src={seller.logo || seller.storeLogo}
                  alt={seller.storeName}
                  className="w-full h-full object-cover rounded-xl"
                  loading="lazy"
                />
              ) : (
                <Store className="w-5 h-5 text-blue-400" />
              )}
            </div>

            {/* Name */}
            <span
              className="text-xs font-bold text-white text-center line-clamp-1 w-full"
            >
              {seller.storeName}
            </span>

            {/* Rating */}
            {seller.rating > 0 && (
              <div className="flex items-center gap-1 mt-1 bg-[#1a233a] px-1.5 py-0.5 rounded-md border border-white/5">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span className="text-[10px] font-black text-amber-300">
                  {seller.rating.toFixed(1)}
                </span>
              </div>
            )}

            {/* Verified badge */}
            {seller.isVerified && (
              <div
                className="flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-300"
              >
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span className="text-[8px] font-black uppercase tracking-wider">Verified</span>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
