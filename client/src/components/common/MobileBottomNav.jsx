import React from 'react';
import { Home, LayoutGrid, Package, Heart, User } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';

const NAV_ITEMS = [
  { id: 'home',     label: 'Home',       icon: Home,        authRequired: false },
  { id: 'products', label: 'Categories', icon: LayoutGrid,  authRequired: false },
  { id: 'account',  label: 'Orders',     icon: Package,     authRequired: true,  authRoute: 'account', routeParams: { tab: 'orders' } },
  { id: 'wishlist', label: 'Wishlist',   icon: Heart,       authRequired: false },
  { id: 'account',  label: 'Profile',    icon: User,        authRequired: false, navId: 'profile' },
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
    if (item.navId === 'profile') return currentRoute === 'account' && !currentRoute.includes('order');
    return currentRoute === item.id;
  };

  const handleNav = (item) => {
    if (item.authRequired && !isAuthenticated) {
      onOpenAuthModal?.();
      return;
    }
    if (item.navId === 'profile') {
      onNavigate('account', { tab: 'profile' });
    } else if (item.routeParams) {
      onNavigate(item.id, item.routeParams);
    } else {
      onNavigate(item.id);
    }
  };

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40"
      style={{
        background: 'rgba(8,12,20,0.96)',
        backdropFilter: 'blur(24px)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 -8px 32px rgba(0,0,0,0.4)',
        borderRadius: '20px 20px 0 0',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)'
      }}
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around px-2 pt-2 pb-2">
        {NAV_ITEMS.map((item, index) => {
          const Icon = item.icon;
          const active = isActive(item);
          const badge = getBadge(item);
          const key = `${item.id}-${item.navId || index}`;

          return (
            <button
              key={key}
              onClick={() => handleNav(item)}
              className="flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all relative cursor-pointer press-feedback"
              style={{
                minWidth: '52px',
                minHeight: '52px',
              }}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
            >
              {/* Active indicator bar */}
              {active && (
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full nav-active-indicator"
                />
              )}

              {/* Icon wrapper */}
              <div className="relative">
                <div
                  className="w-10 h-8 rounded-xl flex items-center justify-center transition-all"
                  style={{
                    background: active
                      ? 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(139,92,246,0.2))'
                      : 'transparent'
                  }}
                >
                  <Icon
                    className="w-5 h-5 transition-all"
                    style={{
                      color: active ? '#818cf8' : 'rgba(148,163,184,0.7)',
                      fill: active && item.id === 'wishlist' ? '#818cf8' : 'transparent',
                      transform: active ? 'scale(1.1)' : 'scale(1)',
                      filter: active ? 'drop-shadow(0 0 6px rgba(129,140,248,0.6))' : 'none'
                    }}
                  />
                </div>

                {/* Badge */}
                {badge > 0 && (
                  <span
                    className="absolute -top-1 -right-1 text-white text-[8px] font-black rounded-full flex items-center justify-center animate-badge-pop"
                    style={{
                      background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                      width: '14px',
                      height: '14px'
                    }}
                  >
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className="text-[9px] font-semibold mt-0.5 transition-all"
                style={{
                  color: active ? '#818cf8' : 'rgba(148,163,184,0.6)',
                  letterSpacing: '0.02em'
                }}
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
