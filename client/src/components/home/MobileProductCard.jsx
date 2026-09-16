import React, { useState, useCallback } from 'react';
import { Heart, Plus, Star, Truck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCurrency } from '../../context/CurrencyContext';

export const MobileProductCard = ({ product, onNavigate, isGridItem = false }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { formatPrice } = useCurrency();
  const [isAdding, setIsAdding] = useState(false);
  const [heartAnimating, setHeartAnimating] = useState(false);

  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = useCallback(async (e) => {
    e.stopPropagation();
    if (isAdding) return;
    try {
      setIsAdding(true);
      await addToCart(product, 1, null);
    } finally {
      setTimeout(() => setIsAdding(false), 500);
    }
  }, [addToCart, product, isAdding]);

  const handleWishlist = useCallback((e) => {
    e.stopPropagation();
    setHeartAnimating(true);
    toggleWishlist(product);
    setTimeout(() => setHeartAnimating(false), 350);
  }, [toggleWishlist, product]);

  const handleCardClick = () => {
    onNavigate('product-detail', { id: product.id, slug: product.slug });
  };

  const productImage = product.images?.[0] || product.image || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80';
  const hasDiscount = product.discountPercent > 0 || (product.originalPrice && product.originalPrice > product.price);
  const discountPct = product.discountPercent || (
    product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0
  );
  const rating = product.rating || product.averageRating || 4.8;

  return (
    <div
      className={`relative flex flex-col bg-[#111827] border border-white/10 rounded-3xl p-3 shadow-lg hover:border-white/20 transition-all duration-200 cursor-pointer press-feedback overflow-hidden ${
        isGridItem ? 'w-full' : 'shrink-0 w-[170px] sm:w-[195px]'
      }`}
      style={{
        minHeight: '300px'
      }}
      onClick={handleCardClick}
      role="article"
      aria-label={`${product.name} — ${formatPrice(product.price)}`}
    >
      {/* Product Image Container on Dark Background */}
      <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-[#0a0f1d] border border-white/5 flex items-center justify-center p-2.5 mb-2.5">
        <img
          src={productImage}
          alt={product.name}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80';
          }}
          className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
        />

        {/* Top Badges: Discount */}
        {hasDiscount && discountPct > 0 && (
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white shadow-md">
            {discountPct}% OFF
          </div>
        )}

        {/* Wishlist Heart Button */}
        <button
          type="button"
          onClick={handleWishlist}
          className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-transform cursor-pointer border ${
            inWishlist
              ? 'bg-rose-950/80 border-rose-600 text-rose-400 shadow-md'
              : 'bg-[#111827]/80 border-white/10 text-slate-300 hover:text-rose-400 hover:bg-[#1a233a]'
          } ${heartAnimating ? 'animate-heart-pop' : ''}`}
          aria-label={inWishlist ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
        >
          <Heart
            className={`w-4 h-4 ${inWishlist ? 'fill-rose-500 text-rose-500' : ''}`}
          />
        </button>
      </div>

      {/* Product Info & High-Contrast Typography */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          {/* Category & ⭐ Rating Row */}
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-400 truncate max-w-[95px]">
              {product.categoryName || product.category || 'Marketplace'}
            </span>
            <div className="flex items-center gap-1 bg-[#1a233a] px-1.5 py-0.5 rounded-md border border-white/5 shrink-0">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span className="text-[10px] font-black text-amber-300">{rating.toFixed(1)}</span>
            </div>
          </div>

          {/* Product Name (Clear readable font: 13px-14px font-bold, crisp white #f8fafc, 2-line clamp) */}
          <h3 className="text-[13px] sm:text-sm font-bold text-white leading-snug line-clamp-2 mb-1.5">
            {product.name}
          </h3>

          {/* Delivery Information */}
          <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold mb-2">
            <Truck className="w-3 h-3 text-emerald-400 shrink-0" />
            <span className="truncate">Free Express Delivery</span>
          </div>
        </div>

        {/* Pricing & Add to Cart Footer */}
        <div className="pt-2 border-t border-white/5 flex items-center justify-between mt-auto">
          <div>
            <div className="text-sm sm:text-base font-black text-white leading-tight">
              {formatPrice(product.price)}
            </div>
            {hasDiscount && product.originalPrice > product.price && (
              <div className="text-[10px] text-slate-500 line-through">
                {formatPrice(product.originalPrice)}
              </div>
            )}
          </div>

          {/* Compact Add Button */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isAdding || product.stock === 0}
            className="flex items-center justify-center gap-1 px-3 py-1.5 text-white rounded-xl text-xs font-black transition-all shadow-md cursor-pointer press-feedback disabled:opacity-50 min-h-[34px]"
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              boxShadow: '0 0 12px rgba(139, 92, 246, 0.35)'
            }}
            aria-label={`Add ${product.name} to cart`}
          >
            {isAdding ? (
              <span className="text-[11px] font-extrabold animate-pulse">✓ Added</span>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span className="text-[11px]">Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
