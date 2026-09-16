import React from 'react';
import { Home, LayoutGrid, ShoppingCart, Heart, User } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';

const NAV_ITEMS = [
  { id: 'home',     label: 'Home',       icon: Home,         authRequired: false },
  { id: 'products', label: 'Categories', icon: LayoutGrid,   authRequired: false },
  { id: 'cart',     label: 'Cart',       icon: ShoppingCart, authRequired: false },
  { id: 'wishlist', label: 'Wishlist',   icon: Heart,        authRequired: false },
  { id: 'account',  label: 'Account',    icon: User,         authRequired: false, navId: 'profile' },
];

export const MobileBottomNav = ({ currentRoute, onNavigate, onOpenAuthModal }) => {
  const { itemCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { isAuthenticated } = useAuth();

  const getBadge = (item) => {
    if (item.id === 'cart') return itemCount;
    if (item.id === 'wishlist') return wishlistCount;
    return 0;
  };

  const isActive = (item) => {
    if (item.id === 'account') {
      return currentRoute === 'account' || currentRoute === 'seller' || currentRoute === 'admin';
    }
    return currentRoute === item.id;
  };

  const handleNav = (item) => {
    if (item.authRequired && !isAuthenticated) {
      onOpenAuthModal?.();
      return;
    }
    if (item.id === 'account' && !isAuthenticated) {
      onOpenAuthModal?.();
      return;
    }
    if (item.id === 'account') {
      onNavigate('account', { tab: 'profile' });
    } else if (item.routeParams) {
      onNavigate(item.id, item.routeParams);
    } else {
      onNavigate(item.id);
    }
  };

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)'
      }}
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around px-1 py-1.5 max-w-md mx-auto">
        {NAV_ITEMS.map((item, index) => {
          const Icon = item.icon;
          const active = isActive(item);
          const badge = getBadge(item);
          const key = `${item.id}-${index}`;

          return (
            <button
              key={key}
              onClick={() => handleNav(item)}
              className="flex-1 flex flex-col items-center justify-center py-1 rounded-xl transition-all relative cursor-pointer press-feedback"
              style={{
                minWidth: '48px',
                minHeight: '48px',
              }}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
            >
              {/* Active indicator pill */}
              {active && (
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-indigo-600"
                />
              )}

              {/* Icon wrapper */}
              <div className="relative">
                <div
                  className={`w-9 h-7 rounded-xl flex items-center justify-center transition-all ${
                    active
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 transition-transform ${
                      active ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'
                    }`}
                    style={{
                      fill: active && item.id === 'wishlist' ? '#6366f1' : 'transparent',
                    }}
                  />
                </div>

                {/* Badge for Cart and Wishlist */}
                {badge > 0 && (
                  <span
                    className="absolute -top-1 -right-1 text-white text-[8px] font-black rounded-full flex items-center justify-center animate-badge-pop shadow-xs"
                    style={{
                      background: item.id === 'wishlist' ? '#f43f5e' : '#4f46e5',
                      minWidth: '15px',
                      height: '15px',
                      padding: '0 3px'
                    }}
                  >
                    {badge > 99 ? '99+' : badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className={`text-[10px] font-bold mt-0.5 tracking-tight transition-colors ${
                  active ? 'text-indigo-600 font-extrabold' : 'text-slate-500'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
