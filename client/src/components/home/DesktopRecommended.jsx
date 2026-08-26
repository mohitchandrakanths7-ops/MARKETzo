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
              className="group relative flex flex-col justify-between rounded-2xl p-3 border transition-all duration-300 hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/10 cursor-pointer"
              style={{
                background: '#101522',
                borderColor: 'rgba(255,255,255,0.07)'
              }}
            >
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

              <div className="space-y-1.5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-amber-400">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{rating.toFixed(1)}</span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-200 line-clamp-1 group-hover:text-white transition-colors mt-0.5">
                    {product.name}
                  </h3>
                </div>

                <div className="pt-2 flex items-baseline justify-between">
                  <span className="text-sm font-black text-white">
                    {formatPrice(product.price)}
                  </span>
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
