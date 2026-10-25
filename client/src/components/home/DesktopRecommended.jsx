import React from 'react';
import { Sparkles, ChevronRight, Heart, Star, ShoppingCart } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';

export const DesktopRecommended = ({ products = [], onNavigate, title = "Recommended For You" }) => {
  const { formatPrice } = useCurrency();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (!products || products.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <span>{title}</span>
        </h2>
        <button
          onClick={() => onNavigate('products', {})}
          className="flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
        >
          <span>View All</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {products.slice(0, 10).map((product) => {
          const inWish = isInWishlist(product.id);
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

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleWishlist(product);
                  }}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 hover:bg-white border border-slate-200 shadow-sm flex items-center justify-center transition-all hover:scale-110"
                  aria-label="Toggle Wishlist"
                >
                  <Heart
                    className={`w-3.5 h-3.5 transition-colors ${
                      inWish ? 'text-rose-500 fill-rose-500' : 'text-slate-400 hover:text-rose-500'
                    }`}
                  />
                </button>
              </div>

              <div className="space-y-1.5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-amber-400">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{rating.toFixed(1)}</span>
                  </div>
                  <h3 className="text-xs font-bold text-white line-clamp-1 group-hover:text-[#00C8FF] transition-colors mt-0.5">
                    {product.name}
                  </h3>
                </div>

                <div className="pt-2 border-t border-[rgba(100,149,237,0.15)] flex items-baseline justify-between">
                  <span className="text-sm font-black text-white">
                    {formatPrice(product.price)}
                  </span>
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
