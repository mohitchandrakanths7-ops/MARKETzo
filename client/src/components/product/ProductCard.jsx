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
          className="group relative flex flex-col sm:flex-row bg-[#111827] md:bg-white rounded-3xl border border-white/10 md:border-slate-200/90 hover:border-blue-500/50 p-3 sm:p-4 transition-all duration-200 hover:shadow-lg cursor-pointer overflow-hidden shadow-md"
        >
          {/* Thumbnail */}
          <div className="relative sm:w-52 h-44 sm:h-auto rounded-2xl overflow-hidden bg-[#0a0f1d] md:bg-slate-50 border border-white/5 md:border-slate-100 shrink-0 flex items-center justify-center p-3">
            <img
              src={primaryImage}
              alt={product.name}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80';
              }}
              className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
            />
            {product.discountPercent > 0 && (
              <span className="absolute top-2.5 left-2.5 bg-rose-600 text-white font-black text-[10px] sm:text-[11px] px-2 py-0.5 rounded-lg shadow-md uppercase tracking-wider">
                {product.discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 sm:pl-5 pt-3 sm:pt-0 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 md:text-slate-500 mb-1">
                <span className="font-extrabold text-blue-400 uppercase tracking-wider text-[10px]">{product.categoryName || 'Marketplace'}</span>
                <span className="text-slate-400 md:text-slate-500 text-[11px]">Sold by {product.sellerName || 'Verified Merchant'}</span>
              </div>

              <h3 className="font-bold text-white md:text-slate-900 text-sm sm:text-base group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
                {product.name}
              </h3>

              <div className="flex items-center gap-2 my-2">
                <div className="flex items-center gap-1 bg-[#1a233a] md:bg-amber-50 border border-white/5 md:border-amber-200 text-amber-300 md:text-amber-800 px-2 py-0.5 rounded-lg text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{product.rating?.toFixed(1) || '4.8'}</span>
                </div>
                <span className="text-xs text-slate-400 md:text-slate-500">({product.reviewCount || 42} reviews)</span>
                <span className="text-xs text-emerald-400 md:text-emerald-600 font-bold flex items-center gap-1 ml-1">
                  <Check className="w-3.5 h-3.5" /> In Stock
                </span>
              </div>

              <p className="text-xs text-slate-300 md:text-slate-600 line-clamp-2 hidden sm:block">
                {product.description}
              </p>
            </div>

            {/* Pricing & CTA */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-white/5 md:border-slate-100 mt-2">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg sm:text-xl font-black text-white md:text-slate-900">{formatPrice(product.price)}</span>
                  {product.originalPrice > product.price && (
                    <span className="text-xs text-slate-500 md:text-slate-400 line-through">{formatPrice(product.originalPrice)}</span>
                  )}
                </div>
                <span className="text-[10px] text-emerald-400 md:text-emerald-700 font-bold flex items-center gap-1">
                  <Truck className="w-3 h-3" /> Free Express Delivery
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleShareClick}
                  className="p-2.5 rounded-xl border border-white/10 md:border-slate-200 hover:border-blue-400 text-slate-300 md:text-slate-600 hover:text-blue-400 bg-[#1a233a] md:bg-slate-50 transition-colors cursor-pointer"
                  title="Share Product"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleToggleWishlist}
                  className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                    isLiked ? 'bg-rose-950/80 border-rose-600 text-rose-400' : 'border-white/10 md:border-slate-200 text-slate-300 md:text-slate-600 hover:text-rose-400 bg-[#1a233a] md:bg-slate-50'
                  }`}
                  title={isLiked ? 'Remove from wishlist' : 'Save to wishlist'}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                </button>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-[#1a233a] md:bg-slate-100 hover:bg-[#22304e] md:hover:bg-slate-200 text-white md:text-slate-900 border border-white/10 md:border-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4 text-blue-400 md:text-indigo-600" />
                  <span>{isAdding ? 'Added!' : 'Add to Cart'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
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

  // Grid Layout (Matching Reference Screenshot & Premium Dark Theme)
  return (
    <>
      <div
        onClick={handleCardClick}
        className="group relative flex flex-col rounded-2xl border transition-all duration-300 hover:scale-[1.02] cursor-pointer overflow-hidden p-3 shadow-lg hover:shadow-[0_12px_30px_rgba(0,0,0,0.5)]"
        style={{
          background: '#0B1427',
          borderColor: 'rgba(100, 149, 237, 0.22)'
        }}
        role="article"
      >
        {/* Clean White/Light Product Image Surface (makes product pop against dark theme) */}
        <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-white flex items-center justify-center p-3 mb-3 shadow-sm group-hover:shadow-md transition-shadow">
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

          {/* Top Discount & Bestseller Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
            {product.discountPercent > 0 && (
              <span className="bg-[#E11D48] text-white font-black text-[9px] sm:text-[10px] px-2 py-0.5 rounded-md shadow-md uppercase tracking-wider">
                {product.discountPercent}% OFF
              </span>
            )}
            {product.isHotDeal && (
              <span className="bg-[#FF8A00] text-slate-950 font-black text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded-md shadow-md uppercase tracking-wider">
                HOT DEAL
              </span>
            )}
          </div>

          {/* Floating Wishlist button */}
          <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
            <button
              type="button"
              onClick={handleToggleWishlist}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all cursor-pointer border shadow-sm ${
                isLiked 
                  ? 'bg-rose-50 border-rose-300 text-rose-600' 
                  : 'bg-white/90 hover:bg-white border-slate-200 text-slate-400 hover:text-rose-500'
              }`}
              title={isLiked ? 'Remove from wishlist' : 'Save to wishlist'}
              aria-label={isLiked ? 'Remove from wishlist' : 'Save to wishlist'}
            >
              <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Product Info */}
        <div className="flex-1 flex flex-col justify-between space-y-2">
          <div>
            {/* Category & Rating */}
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="truncate max-w-[110px] font-bold text-[#00C8FF] uppercase tracking-wider">
                {product.categoryName || 'Electronics'}
              </span>
              <div className="flex items-center gap-1 text-amber-400 font-black text-[11px]">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>{product.rating?.toFixed(1) || '4.8'}</span>
              </div>
            </div>

            {/* Product Title (High Contrast Clean White) */}
            <h3 className="font-bold text-[#F8FAFC] text-xs sm:text-sm line-clamp-2 leading-snug group-hover:text-[#00C8FF] transition-colors">
              {product.name}
            </h3>
          </div>

          {/* Pricing & Add to Cart */}
          <div className="pt-2 border-t border-[rgba(100,149,237,0.15)] flex items-center justify-between gap-2 mt-auto">
            <div className="flex flex-col">
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm sm:text-base font-black text-white">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice > product.price && (
                  <span className="text-[10px] text-slate-400 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-[#22C55E] font-bold flex items-center gap-0.5">
                <Truck className="w-2.5 h-2.5 shrink-0" /> Free Delivery
              </span>
            </div>

            {/* Add to Cart Button */}
            <button
              type="button"
              onClick={handleAddToCart}
              className="px-3 py-1.5 rounded-lg text-xs font-black text-white transition-all flex items-center justify-center gap-1 cursor-pointer shadow-md hover:scale-105 active:scale-95 shrink-0"
              style={{ background: 'linear-gradient(135deg, #2583FF 0%, #702EFF 100%)' }}
              title="Add to Cart"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span className="hidden min-[360px]:inline">{isAdding ? 'Added' : 'Add'}</span>
            </button>
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
