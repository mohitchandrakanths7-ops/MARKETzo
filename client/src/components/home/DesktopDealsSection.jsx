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
              className="group relative flex flex-col justify-between rounded-2xl p-3 border transition-all duration-300 hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/10 cursor-pointer"
              style={{
                background: '#101522',
                borderColor: 'rgba(255,255,255,0.07)'
              }}
            >
              {/* Product Image Box */}
              <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-900/80 mb-3 flex items-center justify-center">
                {img ? (
                  <img
                    src={img}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="text-3xl">🛍️</div>
                )}

                {/* Wishlist Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleWishlist(product);
                  }}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-slate-950/70 backdrop-blur-md flex items-center justify-center transition-all hover:scale-110"
                  aria-label="Toggle Wishlist"
                >
                  <Heart
                    className={`w-3.5 h-3.5 transition-colors ${
                      inWish ? 'text-rose-500 fill-rose-500' : 'text-slate-300 hover:text-white'
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
                  <h3 className="text-xs font-bold text-slate-200 line-clamp-1 group-hover:text-white transition-colors mt-0.5">
                    {product.name}
                  </h3>
                </div>

                {/* Price & Action Row */}
                <div className="pt-2 flex items-baseline justify-between">
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-sm font-black text-white">
                        {formatPrice(product.price)}
                      </span>
                      {hasDiscount && discountPct > 0 && (
                        <span className="text-[10px] font-bold text-emerald-400">
                          {discountPct}% OFF
                        </span>
                      )}
                    </div>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <div className="text-[10px] text-slate-500 line-through">
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
                    className="p-2 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-white transition-all shadow-sm cursor-pointer press-feedback"
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
