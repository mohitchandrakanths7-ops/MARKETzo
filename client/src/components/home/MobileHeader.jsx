import React, { useState, useEffect } from 'react';
import { Heart, ShoppingCart, User, MapPin, Search, X, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

export const MobileHeader = ({ onNavigate, onOpenAuthModal, onFocusSearch }) => {
  const { user, isAuthenticated } = useAuth();
  const { itemCount } = useCart();
  const { wishlistCount } = useWishlist();
  const [cartAnimate, setCartAnimate] = useState(false);
  
  // Location state (saved in localStorage for realistic marketplace experience)
  const [locationPincode, setLocationPincode] = useState(() => {
    return localStorage.getItem('marketzo_pincode') || '94102';
  });
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [tempPincode, setTempPincode] = useState('');

  // Animate cart badge when item count changes
  useEffect(() => {
    if (itemCount > 0) {
      setCartAnimate(true);
      const t = setTimeout(() => setCartAnimate(false), 400);
      return () => clearTimeout(t);
    }
  }, [itemCount]);

  const handleApplyPincode = (e) => {
    e.preventDefault();
    if (tempPincode.trim()) {
      const code = tempPincode.trim();
      setLocationPincode(code);
      localStorage.setItem('marketzo_pincode', code);
      setShowLocationModal(false);
      setTempPincode('');
    }
  };

  return (
    <>
      <header
        className="sticky top-0 z-40 flex items-center justify-between px-3 sm:px-4 py-2.5 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs transition-all"
        role="banner"
      >
        {/* Left: Brand Logo */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-1.5 sm:gap-2 cursor-pointer press-feedback shrink-0"
          aria-label="Go to MARKETZO home"
        >
          {/* Logo Mark */}
          <div
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-white font-black text-xs sm:text-sm shadow-sm"
            style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }}
          >
            M
          </div>
          <div className="flex flex-col text-left">
            <span className="text-slate-900 font-black text-sm sm:text-base tracking-tight leading-none">
              MARKET<span className="text-indigo-600">ZO</span>
            </span>
            <span className="text-[8px] font-bold text-slate-600 tracking-wider uppercase">Marketplace</span>
          </div>
        </button>

        {/* Center/Location Selector Pill */}
        <button
          type="button"
          onClick={() => setShowLocationModal(true)}
          className="flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold border border-slate-200/80 transition-colors max-w-[120px] xs:max-w-[140px] truncate cursor-pointer press-feedback mx-1"
          title="Change delivery postal code"
        >
          <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
          <span className="truncate">{locationPincode}</span>
        </button>

        {/* Right Actions: Search, Cart, Profile */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          
          {/* Quick Search Focus Button */}
          <button
            onClick={() => {
              if (onFocusSearch) {
                onFocusSearch();
              } else {
                const searchInput = document.getElementById('mobile-search-input');
                if (searchInput) {
                  searchInput.focus();
                  searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else {
                  onNavigate('products', {});
                }
              }
            }}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100/80 hover:bg-slate-200/80 text-slate-700 cursor-pointer press-feedback border border-slate-200/60"
            aria-label="Search"
          >
            <Search className="w-4 h-4 text-slate-700" />
          </button>

          {/* Cart with Live Badge */}
          <button
            onClick={() => onNavigate('cart')}
            className="relative w-9 h-9 flex items-center justify-center rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 cursor-pointer press-feedback border border-indigo-100"
            aria-label={`Cart${itemCount > 0 ? ` (${itemCount} items)` : ''}`}
          >
            <ShoppingCart className="w-4 h-4 text-indigo-600" />
            {itemCount > 0 && (
              <span
                className={`absolute -top-1 -right-1 text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center shadow-xs ${cartAnimate ? 'animate-badge-pop' : ''}`}
                style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
              >
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </button>

          {/* Profile / Sign In */}
          <button
            onClick={() => isAuthenticated ? onNavigate('account') : onOpenAuthModal?.()}
            className="relative w-9 h-9 flex items-center justify-center rounded-full overflow-hidden cursor-pointer press-feedback bg-slate-100 hover:bg-slate-200 border border-slate-200/80"
            aria-label="My Account"
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name || 'Profile'}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-4 h-4 text-slate-700" />
            )}
          </button>

        </div>
      </header>

      {/* Location Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900">Delivery Location</h3>
                  <p className="text-[11px] text-slate-500">Check fast shipping speeds for your pin code</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowLocationModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplyPincode} className="space-y-3 my-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tempPincode}
                  onChange={(e) => setTempPincode(e.target.value)}
                  placeholder="Enter postal code (e.g. 94102)"
                  className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-indigo-600 focus:bg-white"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  Apply
                </button>
              </div>
            </form>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Current location: <strong>{locationPincode}</strong></span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
