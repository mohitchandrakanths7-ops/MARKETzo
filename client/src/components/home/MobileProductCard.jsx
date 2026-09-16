import React, { useState, useCallback } from 'react';
import { Heart, Plus, Star, ShoppingCart, Truck, Zap } from 'lucide-react';
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
  const reviewCount = product.reviewCount || 42;

  return (
    <div
      className={`relative flex flex-col bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-2.5 sm:p-3 shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer press-feedback overflow-hidden ${
        isGridItem ? 'w-full' : 'shrink-0 w-[165px] sm:w-[190px]'
      }`}
      style={{
        minHeight: '290px'
      }}
      onClick={handleCardClick}
      role="article"
      aria-label={`${product.name} — ${formatPrice(product.price)}`}
    >
      {/* Product Image Container */}
      <div className="relative aspect-square w-full rounded-xl sm:rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center p-2 mb-2">
        <img
          src={productImage}
          alt={product.name}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80';
          }}
          className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
        />

        {/* Top Badges: Discount */}
        {hasDiscount && discountPct > 0 && (
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white shadow-xs">
            {discountPct}% OFF
          </div>
        )}

        {/* Wishlist Heart Button */}
        <button
          type="button"
          onClick={handleWishlist}
          className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-transform cursor-pointer border ${
            inWishlist
              ? 'bg-rose-50 border-rose-200 text-rose-600 shadow-xs'
              : 'bg-white/90 border-slate-200/80 text-slate-500 hover:text-rose-600 hover:bg-white'
          } ${heartAnimating ? 'animate-heart-pop' : ''}`}
          aria-label={inWishlist ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
        >
          <Heart
            className={`w-4 h-4 ${inWishlist ? 'fill-rose-500 text-rose-500' : ''}`}
          />
        </button>
      </div>

      {/* Product Info & Typography */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Rating Row */}
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 truncate max-w-[90px]">
              {product.categoryName || product.category || 'Marketplace'}
            </span>
            <div className="flex items-center gap-1 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200/60 shrink-0">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span className="text-[10px] font-black text-amber-800">{rating.toFixed(1)}</span>
            </div>
          </div>

          {/* Product Name (Clear readable font: 13px-14px font-bold, high contrast slate-900, 2-line clamp) */}
          <h3 className="text-xs sm:text-[13px] font-bold text-slate-900 leading-snug line-clamp-2 mb-1">
            {product.name}
          </h3>

          {/* Delivery Information */}
          <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-semibold mb-2">
            <Truck className="w-3 h-3 text-emerald-600 shrink-0" />
            <span className="truncate">Free Express Delivery</span>
          </div>
        </div>

        {/* Pricing & Add to Cart Footer */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between mt-auto">
          <div>
            <div className="text-sm sm:text-base font-black text-slate-900 leading-tight">
              {formatPrice(product.price)}
            </div>
            {hasDiscount && product.originalPrice > product.price && (
              <div className="text-[10px] text-slate-400 line-through">
                {formatPrice(product.originalPrice)}
              </div>
            )}
          </div>

          {/* Quick Add Button */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isAdding || product.stock === 0}
            className="flex items-center justify-center gap-1 px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer press-feedback disabled:opacity-50 min-h-[34px]"
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
