import React from 'react';
import { Clock, ChevronRight, Heart, Star, ShoppingCart } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';

export const DesktopDealsSection = ({ products = [], timeLeft, onNavigate }) => {
  const { formatPrice } = useCurrency();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (!products || products.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Today's Best Deals</span>
          </h2>
          {timeLeft && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold">
              <Clock className="w-3.5 h-3.5" />
              <span>
                Ends in {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
              </span>
            </div>
          )}
        </div>

        <button
          onClick={() => onNavigate('products', { hotDeals: 'true' })}
          className="flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
        >
          <span>View All</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {products.slice(0, 5).map((product) => {
          const inWish = isInWishlist(product.id);
          const hasDiscount = product.discountPercent > 0 || (product.originalPrice && product.originalPrice > product.price);
          const discountPct = product.discountPercent || (
            product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0
          );
          const rating = product.rating || product.averageRating || 4.5;
          const img = product.images?.[0] || product.image;

          return (
            <div
              key={product.id}
              onClick={() => onNavigate('product-detail', { id: product.id, slug: product.slug })}
              className="group relative flex flex-col justify-between rounded-2xl p-3 border transition-all duration-300 hover:scale-[1.02] hover:border-[#2583FF] hover:shadow-xl hover:shadow-[0_10px_25px_rgba(0,0,0,0.5)] cursor-pointer"
              style={{
                background: '#0B1427',
                borderColor: 'rgba(100, 149, 237, 0.22)'
              }}
            >
              {/* Product Image Box with White Surface */}
              <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-white mb-3 flex items-center justify-center p-3 shadow-sm">
                {img ? (
                  <img
                    src={img}
                    alt={product.name}
                    className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="text-3xl">🛍️</div>
                )}

                {hasDiscount && discountPct > 0 && (
                  <span className="absolute top-2 left-2 bg-[#E11D48] text-white font-black text-[9px] px-1.5 py-0.5 rounded shadow-sm">
                    {discountPct}% OFF
                  </span>
                )}

                {/* Wishlist Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleWishlist(product);
                  }}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 hover:bg-white shadow-sm flex items-center justify-center transition-all hover:scale-110 border border-slate-200"
                  aria-label="Toggle Wishlist"
                >
                  <Heart
                    className={`w-3.5 h-3.5 transition-colors ${
                      inWish ? 'text-rose-500 fill-rose-500' : 'text-slate-400 hover:text-rose-500'
                    }`}
                  />
                </button>
              </div>

              {/* Product Info */}
              <div className="space-y-1.5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-amber-400">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{rating.toFixed(1)}</span>
                    <span className="text-slate-500 font-normal">({product.reviewCount || 120})</span>
                  </div>
                  <h3 className="text-xs font-bold text-white line-clamp-1 group-hover:text-[#00C8FF] transition-colors mt-0.5">
                    {product.name}
                  </h3>
                </div>

                {/* Price & Action Row */}
                <div className="pt-2 border-t border-[rgba(100,149,237,0.15)] flex items-baseline justify-between">
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-sm font-black text-white">
                        {formatPrice(product.price)}
                      </span>
                    </div>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <div className="text-[10px] text-slate-400 line-through">
                        {formatPrice(product.originalPrice)}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(product, 1);
                    }}
                    className="p-2 rounded-lg text-white transition-all shadow-md cursor-pointer hover:scale-105 active:scale-95"
                    style={{ background: 'linear-gradient(135deg, #2583FF 0%, #702EFF 100%)' }}
                    title="Add to Cart"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
