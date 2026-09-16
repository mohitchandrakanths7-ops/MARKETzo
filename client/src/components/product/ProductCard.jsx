import React, { useState } from 'react';
import { Heart, Star, ShoppingCart, Zap, Check, Share2, Truck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCurrency } from '../../context/CurrencyContext';
import { ShareProductModal } from './ShareProductModal';

export const ProductCard = ({ product, onNavigate, layout = 'grid' }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { formatPrice } = useCurrency();
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const isLiked = isInWishlist(product.id);
  const primaryImage = product.images?.[0] || product.image || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80';

  const handleCardClick = () => {
    onNavigate('product-detail', { id: product.id || product.slug });
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    setIsAdding(true);
    addToCart(product, 1);
    setTimeout(() => setIsAdding(false), 500);
  };

  const handleBuyNow = (e) => {
    e.stopPropagation();
    addToCart(product, 1);
    onNavigate('checkout');
  };

  const handleToggleWishlist = (e) => {
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleShareClick = (e) => {
    e.stopPropagation();
    setIsShareOpen(true);
  };

  if (layout === 'list') {
    return (
      <>
        <div 
          onClick={handleCardClick}
          className="group relative flex flex-col sm:flex-row bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 hover:border-indigo-500/50 p-3 sm:p-4 transition-all duration-200 hover:shadow-lg cursor-pointer overflow-hidden shadow-2xs"
        >
          {/* Thumbnail */}
          <div className="relative sm:w-52 h-44 sm:h-auto rounded-xl sm:rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shrink-0 flex items-center justify-center p-3">
            <img
              src={primaryImage}
              alt={product.name}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80';
              }}
              className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
            />
            {product.discountPercent > 0 && (
              <span className="absolute top-2.5 left-2.5 bg-rose-600 text-white font-black text-[10px] sm:text-[11px] px-2 py-0.5 rounded-md shadow-xs">
                {product.discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 sm:pl-5 pt-3 sm:pt-0 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span className="font-extrabold text-indigo-600 uppercase tracking-wider text-[10px]">{product.categoryName || 'Marketplace'}</span>
                <span className="text-slate-500 text-[11px]">Sold by {product.sellerName || 'Verified Merchant'}</span>
              </div>

              <h3 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
                {product.name}
              </h3>

              <div className="flex items-center gap-2 my-2">
                <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-800 px-2 py-0.5 rounded-lg text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{product.rating?.toFixed(1) || '4.8'}</span>
                </div>
                <span className="text-xs text-slate-500">({product.reviewCount || 42} reviews)</span>
                <span className="text-xs text-emerald-600 font-bold flex items-center gap-1 ml-1">
                  <Check className="w-3.5 h-3.5" /> In Stock
                </span>
              </div>

              <p className="text-xs text-slate-600 line-clamp-2 hidden sm:block">
                {product.description}
              </p>
            </div>

            {/* Pricing & CTA */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 mt-2">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg sm:text-xl font-black text-slate-900">{formatPrice(product.price)}</span>
                  {product.originalPrice > product.price && (
                    <span className="text-xs text-slate-400 line-through">{formatPrice(product.originalPrice)}</span>
                  )}
                </div>
                <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                  <Truck className="w-3 h-3" /> Free Express Delivery
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleShareClick}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-indigo-400 text-slate-600 hover:text-indigo-600 bg-slate-50 transition-colors cursor-pointer"
                  title="Share Product"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleToggleWishlist}
                  className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                    isLiked ? 'bg-rose-50 border-rose-200 text-rose-600' : 'border-slate-200 hover:border-slate-300 text-slate-600 hover:text-rose-600 bg-slate-50'
                  }`}
                  title={isLiked ? 'Remove from wishlist' : 'Save to wishlist'}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                </button>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4 text-indigo-600" />
                  <span>{isAdding ? 'Added!' : 'Add to Cart'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <Zap className="w-4 h-4" />
                  <span>Buy Now</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <ShareProductModal
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
          product={product}
        />
      </>
    );
  }

  // Grid Layout (Mobile 2-Column Friendly, Clean Light Theme)
  return (
    <>
      <div
        onClick={handleCardClick}
        className="group relative flex flex-col bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 hover:border-indigo-400 p-2.5 sm:p-3.5 transition-all duration-200 hover:shadow-lg cursor-pointer overflow-hidden shadow-2xs"
        role="article"
      >
        {/* Image Container with Badges */}
        <div className="relative aspect-square w-full rounded-xl sm:rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center p-2 mb-2">
          <img
            src={primaryImage}
            alt={product.name}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80';
            }}
            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
          />

          {/* Top Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
            {product.discountPercent > 0 && (
              <span className="bg-rose-600 text-white font-black text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-md shadow-xs uppercase tracking-wider">
                {product.discountPercent}% OFF
              </span>
            )}
            {product.isBestSeller && (
              <span className="bg-amber-500 text-slate-950 font-black text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded-md shadow-xs uppercase tracking-wider">
                BESTSELLER
              </span>
            )}
          </div>

          {/* Floating Wishlist & Share buttons */}
          <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
            <button
              type="button"
              onClick={handleToggleWishlist}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all cursor-pointer border ${
                isLiked 
                  ? 'bg-rose-50 border-rose-200 text-rose-600 shadow-xs' 
                  : 'bg-white/90 border-slate-200/80 text-slate-500 hover:text-rose-600 hover:bg-white shadow-2xs'
              }`}
              title={isLiked ? 'Remove from wishlist' : 'Save to wishlist'}
              aria-label={isLiked ? 'Remove from wishlist' : 'Save to wishlist'}
            >
              <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isLiked ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Product Details */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            {/* Category & Rating */}
            <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
              <span className="truncate max-w-[100px] font-extrabold text-indigo-600 uppercase tracking-wider">{product.categoryName || 'Marketplace'}</span>
              <div className="flex items-center gap-0.5 text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60">
                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                <span>{product.rating?.toFixed(1) || '4.8'}</span>
              </div>
            </div>

            {/* Title (Enhanced Readability: 13px-15px, font-bold, slate-900, 2-line clamp) */}
            <h3 className="font-bold text-slate-900 text-xs sm:text-[14px] line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors mb-1.5">
              {product.name}
            </h3>

            {/* Delivery tag */}
            <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-semibold mb-2">
              <Truck className="w-3 h-3 text-emerald-600 shrink-0" />
              <span className="truncate">Free Express Delivery</span>
            </div>
          </div>

          {/* Pricing and Action CTAs */}
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2 mt-auto">
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm sm:text-base font-black text-slate-900">{formatPrice(product.price)}</span>
              {product.originalPrice > product.price && (
                <span className="text-[10px] sm:text-xs text-slate-400 line-through">{formatPrice(product.originalPrice)}</span>
              )}
            </div>

            {/* Mobile Touch Action Buttons */}
            <div className="grid grid-cols-2 gap-1 sm:gap-1.5">
              <button
                type="button"
                onClick={handleAddToCart}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200/80 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer press-feedback min-h-[36px]"
              >
                <ShoppingCart className="w-3.5 h-3.5 text-indigo-600" />
                <span>{isAdding ? '✓' : 'Add'}</span>
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1 cursor-pointer press-feedback min-h-[36px]"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Buy</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <ShareProductModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        product={product}
      />
    </>
  );
};
