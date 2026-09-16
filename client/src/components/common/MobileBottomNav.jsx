import React from 'react';
import { Home, LayoutGrid, ReceiptText, Heart, User } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';

const NAV_ITEMS = [
  { id: 'home',       label: 'Home',       icon: Home,        route: 'home' },
  { id: 'categories', label: 'Categories', icon: LayoutGrid,  route: 'products' },
  { id: 'orders',     label: 'Orders',     icon: ReceiptText, route: 'account', tab: 'orders', authRequired: true },
  { id: 'wishlist',   label: 'Wishlist',   icon: Heart,       route: 'wishlist' },
  { id: 'profile',    label: 'Profile',    icon: User,        route: 'account', tab: 'profile', authRequired: true },
];

export const MobileBottomNav = ({ currentRoute, routeParams = {}, onNavigate, onOpenAuthModal }) => {
  const { wishlistCount } = useWishlist();
  const { isAuthenticated } = useAuth();

  const getBadge = (item) => {
    if (item.id === 'wishlist') return wishlistCount;
    return 0;
  };

  const isItemActive = (item) => {
    if (item.id === 'home') return currentRoute === 'home';
    if (item.id === 'categories') return currentRoute === 'products';
    if (item.id === 'wishlist') return currentRoute === 'wishlist';
    if (item.id === 'orders') return currentRoute === 'account' && routeParams?.tab === 'orders';
    if (item.id === 'profile') return (currentRoute === 'account' && routeParams?.tab !== 'orders') || currentRoute === 'seller' || currentRoute === 'admin';
    return false;
  };

  const handleNav = (item) => {
    if (item.authRequired && !isAuthenticated) {
      onOpenAuthModal?.();
      return;
    }
    if (item.tab) {
      onNavigate(item.route, { tab: item.tab });
    } else {
      onNavigate(item.route, {});
    }
  };

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#080c14]/95 backdrop-blur-xl border-t border-white/10 shadow-[0_-8px_30px_rgba(0,0,0,0.6)]"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)'
      }}
      aria-label="Main mobile navigation"
    >
      <div className="flex items-center justify-around px-2 py-1.5 max-w-md mx-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isItemActive(item);
          const badge = getBadge(item);

          return (
            <button
              key={item.id}
              onClick={() => handleNav(item)}
              className="flex-1 flex flex-col items-center justify-center py-1 rounded-2xl transition-all relative cursor-pointer press-feedback"
              style={{
                minWidth: '48px',
                minHeight: '48px',
              }}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
            >
              {/* Active top glow indicator */}
              {active && (
                <div
                  className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full shadow-[0_0_10px_rgba(139,92,246,0.8)]"
                  style={{ background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)' }}
                />
              )}

              {/* Icon wrapper */}
              <div className="relative">
                <div
                  className={`w-9 h-7 rounded-xl flex items-center justify-center transition-all ${
                    active
                      ? 'text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 transition-transform ${
                      active ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'
                    }`}
                    style={{
                      fill: active && item.id === 'wishlist' ? '#f43f5e' : 'transparent',
                      color: active ? '#818cf8' : undefined
                    }}
                  />
                </div>

                {/* Badge for Wishlist */}
                {badge > 0 && (
                  <span
                    className="absolute -top-1 -right-1 text-white text-[8px] font-black rounded-full flex items-center justify-center animate-badge-pop shadow-md"
                    style={{
                      background: '#f43f5e',
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
                  active ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 font-extrabold' : 'text-slate-400'
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
