import React, { useState, useCallback } from 'react';
import { Heart, Plus, Star, ShoppingCart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCurrency } from '../../context/CurrencyContext';

export const MobileProductCard = ({ product, onNavigate }) => {
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
      setTimeout(() => setIsAdding(false), 600);
    }
  }, [addToCart, product, isAdding]);

  const handleWishlist = useCallback((e) => {
    e.stopPropagation();
    setHeartAnimating(true);
    toggleWishlist(product);
    setTimeout(() => setHeartAnimating(false), 400);
  }, [toggleWishlist, product]);

  const handleCardClick = () => {
    onNavigate('product-detail', { productId: product.id, slug: product.slug });
  };

  const productImage = product.images?.[0] || product.image;
  const hasDiscount = product.discountPercent > 0 || (product.originalPrice && product.originalPrice > product.price);
  const discountPct = product.discountPercent || (
    product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0
  );
  const rating = product.rating || product.averageRating || 0;

  return (
    <div
      className="shrink-0 relative flex flex-col cursor-pointer press-feedback"
      style={{
        width: '160px',
        background: '#111827',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '18px',
        overflow: 'hidden'
      }}
      onClick={handleCardClick}
      role="article"
      aria-label={`${product.name} — ${formatPrice(product.price)}`}
    >
      {/* Image container */}
      <div className="relative" style={{ paddingTop: '100%' }}>
        {productImage ? (
          <img
            src={productImage}
            alt={product.name}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ background: '#1a2035' }}
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center text-3xl"
            style={{ background: 'linear-gradient(135deg,#1a2035,#0f172a)' }}
          >
            🛍️
          </div>
        )}

        {/* Image overlay gradient */}
        <div className="absolute inset-0 product-img-overlay" />

        {/* Discount badge */}
        {hasDiscount && discountPct > 0 && (
          <div
            className="absolute top-2 left-2 px-1.5 py-0.5 rounded-lg text-[9px] font-black"
            style={{ background: 'rgba(239,68,68,0.9)', color: '#fff' }}
          >
            -{discountPct}%
          </div>
        )}

        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          className={`absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full cursor-pointer ${heartAnimating ? 'animate-heart-pop' : ''}`}
          style={{ background: 'rgba(8,12,20,0.7)', backdropFilter: 'blur(6px)' }}
          aria-label={inWishlist ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
        >
          <Heart
            className="w-3.5 h-3.5 transition-colors"
            style={{
              color: inWishlist ? '#f472b6' : 'rgba(203,213,225,0.8)',
              fill: inWishlist ? '#f472b6' : 'transparent'
            }}
          />
        </button>
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col gap-1.5 flex-1">
        {/* Category */}
        {(product.categoryName || product.category) && (
          <span
            className="text-[9px] font-bold uppercase tracking-wider truncate"
            style={{ color: 'rgba(99,102,241,0.9)' }}
          >
            {product.categoryName || product.category}
          </span>
        )}

        {/* Name */}
        <h3
          className="text-xs font-bold leading-tight line-clamp-2"
          style={{ color: '#e2e8f0' }}
        >
          {product.name}
        </h3>

        {/* Rating */}
        {rating > 0 && (
          <div className="flex items-center gap-1">
            <Star
              className="w-3 h-3"
              style={{ color: '#fbbf24', fill: '#fbbf24' }}
            />
            <span className="text-[10px] font-semibold" style={{ color: '#fbbf24' }}>
              {rating.toFixed(1)}
            </span>
            {product.reviewCount > 0 && (
              <span className="text-[9px]" style={{ color: 'rgba(148,163,184,0.6)' }}>
                ({product.reviewCount})
              </span>
            )}
          </div>
        )}

        {/* Price row */}
        <div className="flex items-center justify-between mt-auto pt-1">
          <div>
            <div className="text-sm font-black" style={{ color: '#f1f5f9' }}>
              {formatPrice(product.price)}
            </div>
            {hasDiscount && product.originalPrice && (
              <div className="text-[9px] line-through" style={{ color: 'rgba(148,163,184,0.5)' }}>
                {formatPrice(product.originalPrice)}
              </div>
            )}
          </div>

          {/* Add to cart button */}
          <button
            onClick={handleAddToCart}
            disabled={isAdding || product.stock === 0}
            className="flex items-center gap-0.5 px-2 py-1.5 rounded-xl text-[10px] font-bold cursor-pointer press-feedback disabled:opacity-50"
            style={{
              background: isAdding
                ? 'rgba(99,102,241,0.3)'
                : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              color: '#ffffff',
              minWidth: '52px',
              justifyContent: 'center'
            }}
            aria-label={`Add ${product.name} to cart`}
          >
            {isAdding ? (
              <span className="animate-pulse">✓</span>
            ) : (
              <>
                <Plus className="w-3 h-3" />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
