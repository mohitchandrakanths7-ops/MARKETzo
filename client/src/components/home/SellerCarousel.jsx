import React from 'react';
import { ChevronRight, ShieldCheck, Star, Store } from 'lucide-react';

export const SellerCarousel = ({ sellers = [], isLoading = false, onNavigate }) => {

  if (isLoading) {
    return (
      <div className="mb-5">
        <div className="px-3 sm:px-4 mb-2.5 flex items-center justify-between">
          <div className="skeleton-light h-5 w-36 rounded" />
          <div className="skeleton-light h-4 w-16 rounded" />
        </div>
        <div className="px-3 sm:px-4 flex gap-3 overflow-x-auto no-scrollbar">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="skeleton-light shrink-0 rounded-2xl w-[130px] h-[150px]"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!sellers || sellers.length === 0) return null;

  return (
    <div className="mb-5 animate-fade-in-up">
      {/* Header */}
      <div className="px-3 sm:px-4 mb-2.5 flex items-center justify-between">
        <h2 className="text-sm sm:text-base font-black text-slate-900">
          🏆 Verified Merchants & Stores
        </h2>
        <button
          type="button"
          onClick={() => onNavigate('products', {})}
          className="flex items-center gap-0.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer press-feedback"
          aria-label="View all sellers"
        >
          <span>View All</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Horizontal carousel */}
      <div className="px-3 sm:px-4 flex gap-3 overflow-x-auto no-scrollbar py-1">
        {sellers.map((seller) => (
          <button
            key={seller.id}
            type="button"
            onClick={() => onNavigate('products', { sellerId: seller.id })}
            className="shrink-0 flex flex-col items-center p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-all cursor-pointer press-feedback w-[135px]"
            aria-label={`Visit ${seller.storeName} store`}
          >
            {/* Logo */}
            <div
              className="w-13 h-13 rounded-2xl overflow-hidden flex items-center justify-center mb-2 shrink-0 bg-slate-50 border border-slate-200/80 p-1"
            >
              {seller.logo || seller.storeLogo ? (
                <img
                  src={seller.logo || seller.storeLogo}
                  alt={seller.storeName}
                  className="w-full h-full object-cover rounded-xl"
                  loading="lazy"
                />
              ) : (
                <Store className="w-6 h-6 text-indigo-600" />
              )}
            </div>

            {/* Name */}
            <span
              className="text-xs font-extrabold text-slate-900 text-center line-clamp-1 w-full"
            >
              {seller.storeName}
            </span>

            {/* Rating */}
            {seller.rating > 0 && (
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                <span className="text-[10px] font-bold text-amber-900">
                  {seller.rating.toFixed(1)}
                </span>
              </div>
            )}

            {/* Verified badge */}
            {seller.isVerified && (
              <div
                className="flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200"
              >
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span className="text-[9px] font-black text-emerald-700 uppercase tracking-wider">Verified</span>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
