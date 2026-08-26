import React, { useState } from 'react';
import { Heart, Star, ShoppingCart, Zap, Check, Eye, Share2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCurrency } from '../../context/CurrencyContext';
import { ShareProductModal } from './ShareProductModal';

export const ProductCard = ({ product, onNavigate, layout = 'grid' }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { formatPrice } = useCurrency();
  const [isShareOpen, setIsShareOpen] = useState(false);

  const isLiked = isInWishlist(product.id);
  const primaryImage = product.images?.[0] || product.image || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80';
  const secondaryImage = product.images?.[1] || primaryImage;

  const handleCardClick = () => {
    onNavigate('product-detail', { id: product.id || product.slug });
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product, 1);
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
          className="group relative flex flex-col sm:flex-row bg-[#121829] rounded-2xl border border-white/10 hover:border-indigo-500/50 p-4 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 cursor-pointer overflow-hidden"
        >
          {/* Thumbnail */}
          <div className="relative sm:w-56 h-48 sm:h-auto rounded-xl overflow-hidden bg-white shrink-0">
            <img
              src={primaryImage}
              alt={product.name}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80';
              }}
              className="w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-105"
            />
            {product.discountPercent > 0 && (
              <span className="absolute top-2.5 left-2.5 bg-rose-600 text-white font-black text-[11px] px-2 py-0.5 rounded-md shadow-md">
                {product.discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 sm:pl-6 pt-4 sm:pt-0 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span className="font-semibold text-indigo-400 uppercase tracking-wider">{product.categoryName || 'Marketplace'}</span>
                <span className="text-slate-400 text-[11px]">Sold by {product.sellerName || 'Verified Merchant'}</span>
              </div>

              <h3 className="font-semibold text-[#F5F7FF] text-base group-hover:text-indigo-400 transition-colors line-clamp-2 leading-[1.35]">
                {product.name}
              </h3>

              <div className="flex items-center gap-2 my-2">
                <div className="flex items-center gap-1 bg-amber-400/10 border border-amber-400/20 text-amber-300 px-2 py-0.5 rounded-lg text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{product.rating?.toFixed(1) || '4.8'}</span>
                </div>
                <span className="text-xs text-slate-400">({product.reviewCount || 120} reviews)</span>
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 ml-2">
                  <Check className="w-3.5 h-3.5" /> In Stock
                </span>
              </div>

              <p className="text-xs text-slate-300 line-clamp-2 hidden sm:block">
                {product.description}
              </p>
            </div>

            {/* Pricing & CTA */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-white/10 mt-2">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-black text-[#F5F7FF]">{formatPrice(product.price)}</span>
                  {product.originalPrice > product.price && (
                    <span className="text-xs text-slate-400 line-through">{formatPrice(product.originalPrice)}</span>
                  )}
                </div>
                <span className="text-[10px] text-emerald-400 font-medium">Free Delivery</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleShareClick}
                  className="p-2.5 rounded-xl border border-white/10 hover:border-indigo-400/50 text-slate-300 hover:text-indigo-400 bg-slate-900/60 transition-colors cursor-pointer"
                  title="Share Product"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  onClick={handleToggleWishlist}
                  className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                    isLiked ? 'bg-rose-500/20 border-rose-500/40 text-rose-300' : 'border-white/10 hover:border-white/20 text-slate-300 hover:text-rose-400 bg-slate-900/60'
                  }`}
                  title={isLiked ? 'Remove from wishlist' : 'Save to wishlist'}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                </button>

                <button
                  onClick={handleAddToCart}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-[#1a233a] hover:bg-[#222e4c] text-white border border-white/10 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>

                <button
                  onClick={handleBuyNow}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-900/20 cursor-pointer"
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

  return (
    <>
      <div
        onClick={handleCardClick}
        className="group relative flex flex-col bg-[#121829] rounded-2xl border border-white/10 hover:border-indigo-500/50 p-3 sm:p-3.5 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1.5 cursor-pointer overflow-hidden"
      >
        {/* Image Container with Badges */}
        <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-white">
          <img
            src={primaryImage}
            alt={product.name}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80';
            }}
            className="w-full h-full object-contain p-2 transition-transform duration-700 group-hover:scale-108"
          />

          {/* Top Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
            {product.discountPercent > 0 && (
              <span className="bg-rose-600 text-white font-black text-[10px] sm:text-[11px] px-2 py-0.5 rounded-md shadow-md tracking-wider">
                {product.discountPercent}% OFF
              </span>
            )}
            {product.isBestSeller && (
              <span className="bg-amber-500 text-slate-950 font-black text-[9px] sm:text-[10px] px-2 py-0.5 rounded-md shadow-md uppercase tracking-wider">
                BESTSELLER
              </span>
            )}
          </div>

          {/* Floating Share & Wishlist buttons */}
          <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
            <button
              onClick={handleShareClick}
              className="p-2 rounded-xl backdrop-blur-md bg-slate-900/80 hover:bg-slate-900 text-slate-200 hover:text-indigo-400 shadow-sm transition-all cursor-pointer border border-white/10"
              title="Share Product"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleToggleWishlist}
              className={`p-2 rounded-xl backdrop-blur-md transition-all cursor-pointer border border-white/10 ${
                isLiked 
                  ? 'bg-rose-500/90 text-white shadow-md' 
                  : 'bg-slate-900/80 hover:bg-slate-900 text-slate-200 hover:text-rose-400 shadow-sm'
              }`}
              title={isLiked ? 'Remove from wishlist' : 'Save to wishlist'}
            >
              <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Quick View overlay hint */}
          <div className="absolute inset-x-2 bottom-2 bg-slate-950/80 backdrop-blur-md text-white py-1.5 rounded-lg text-center text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 shadow-lg">
            <Eye className="w-3.5 h-3.5" />
            <span>Quick View</span>
          </div>
        </div>

        {/* Product Details */}
        <div className="flex-1 flex flex-col justify-between pt-3">
          <div>
            {/* Category & Rating */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
              <span className="truncate max-w-[130px] font-semibold text-indigo-400 uppercase tracking-wider text-[10px]">{product.categoryName || 'Marketplace'}</span>
              <div className="flex items-center gap-0.5 text-amber-400 font-bold bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>{product.rating?.toFixed(1) || '4.8'}</span>
              </div>
            </div>

            {/* Title (Enhanced Readability: 16px-18px, font-semibold, #F5F7FF, line-height 1.35) */}
            <h3 className="font-semibold text-[#F5F7FF] text-[15px] sm:text-base line-clamp-2 leading-[1.35] group-hover:text-indigo-400 transition-colors mb-1.5">
              {product.name}
            </h3>
          </div>

          {/* Pricing and CTAs */}
          <div className="pt-2 border-t border-white/10 mt-1">
            <div className="flex items-baseline gap-1.5 mb-2.5">
              <span className="text-base sm:text-lg font-black text-[#F5F7FF]">{formatPrice(product.price)}</span>
              {product.originalPrice > product.price && (
                <span className="text-xs text-slate-400 line-through">{formatPrice(product.originalPrice)}</span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={handleAddToCart}
                className="w-full py-2 bg-[#1a233a] hover:bg-[#222e4c] text-white border border-white/10 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>

              <button
                onClick={handleBuyNow}
                className="w-full py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1 cursor-pointer"
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
