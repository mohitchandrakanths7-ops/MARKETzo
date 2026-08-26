import React, { useState, useEffect } from 'react';
import { Heart, ShoppingCart, User, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

export const MobileHeader = ({ onNavigate, onOpenAuthModal }) => {
  const { user, isAuthenticated } = useAuth();
  const { itemCount } = useCart();
  const { wishlistCount } = useWishlist();
  const [cartAnimate, setCartAnimate] = useState(false);

  // Animate cart badge when item count changes
  useEffect(() => {
    if (itemCount > 0) {
      setCartAnimate(true);
      const t = setTimeout(() => setCartAnimate(false), 400);
      return () => clearTimeout(t);
    }
  }, [itemCount]);

  return (
    <header
      className="sticky top-0 z-50 flex items-center justify-between px-4 py-3"
      style={{ background: 'rgba(8, 12, 20, 0.96)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* Brand */}
      <button
        onClick={() => onNavigate('home')}
        className="flex items-center gap-2 cursor-pointer press-feedback"
        aria-label="Go to MARKETZO home"
      >
        {/* Logo mark */}
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-black text-sm"
          style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
        >
          M
        </div>
        <span className="text-white font-black text-base tracking-tight">
          MARKET<span style={{ background: 'linear-gradient(90deg,#3b82f6,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>ZO</span>
        </span>
      </button>

      {/* Right actions */}
      <div className="flex items-center gap-1">

        {/* Wishlist */}
        <button
          onClick={() => isAuthenticated ? onNavigate('wishlist') : onOpenAuthModal?.()}
          className="relative w-10 h-10 flex items-center justify-center rounded-full cursor-pointer press-feedback"
          style={{ background: 'rgba(255,255,255,0.06)' }}
          aria-label={`Wishlist${wishlistCount > 0 ? ` (${wishlistCount} items)` : ''}`}
        >
          <Heart className="w-5 h-5 text-slate-300" />
          {wishlistCount > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center animate-badge-pop"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
            >
              {wishlistCount > 9 ? '9+' : wishlistCount}
            </span>
          )}
        </button>

        {/* Cart */}
        <button
          onClick={() => onNavigate('cart')}
          className="relative w-10 h-10 flex items-center justify-center rounded-full cursor-pointer press-feedback"
          style={{ background: 'rgba(255,255,255,0.06)' }}
          aria-label={`Cart${itemCount > 0 ? ` (${itemCount} items)` : ''}`}
        >
          <ShoppingCart className="w-5 h-5 text-slate-300" />
          {itemCount > 0 && (
            <span
              className={`absolute -top-0.5 -right-0.5 text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center ${cartAnimate ? 'animate-badge-pop' : ''}`}
              style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
            >
              {itemCount > 9 ? '9+' : itemCount}
            </span>
          )}
        </button>

        {/* Profile */}
        <button
          onClick={() => isAuthenticated ? onNavigate('account') : onOpenAuthModal?.()}
          className="relative w-10 h-10 flex items-center justify-center rounded-full overflow-hidden cursor-pointer press-feedback"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.1)' }}
          aria-label="My Account"
        >
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name || 'Profile'}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-5 h-5 text-slate-300" />
          )}
        </button>
      </div>
    </header>
  );
};
