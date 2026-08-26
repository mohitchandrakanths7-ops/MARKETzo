import React from 'react';
import { Store, Star, ChevronRight, ShieldCheck } from 'lucide-react';

export const DesktopTopStores = ({ sellers = [], onNavigate }) => {
  if (!sellers || sellers.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
          <span>Top Stores</span>
        </h2>
        <button
          onClick={() => onNavigate('products', {})}
          className="flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
        >
          <span>View All</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sellers.slice(0, 3).map((seller) => (
          <div
            key={seller.id}
            onClick={() => onNavigate('products', { sellerId: seller.id })}
            className="flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 hover:border-indigo-500/40 hover:bg-slate-850 cursor-pointer"
            style={{
              background: '#101522',
              borderColor: 'rgba(255,255,255,0.07)'
            }}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center shrink-0 border border-white/10">
                {seller.storeLogo ? (
                  <img src={seller.storeLogo} alt={seller.storeName} className="w-full h-full object-cover" />
                ) : (
                  <Store className="w-6 h-6 text-indigo-400" />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-black text-white truncate">{seller.storeName}</h3>
                  {seller.isVerified && (
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                  <div className="flex items-center gap-1 text-amber-400 font-bold">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{seller.rating ? seller.rating.toFixed(1) : '4.8'}</span>
                  </div>
                  <span>•</span>
                  <span>{seller.followerCount || '12.4k'} Followers</span>
                </div>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onNavigate('products', { sellerId: seller.id });
              }}
              className="px-4 py-1.5 rounded-xl text-xs font-bold text-indigo-300 hover:text-white bg-indigo-500/10 hover:bg-indigo-600/30 border border-indigo-500/20 transition-all shrink-0 cursor-pointer"
            >
              Follow
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
