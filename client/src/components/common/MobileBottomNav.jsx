import React from 'react';
import { Home, LayoutGrid, Search, ShoppingCart, User, Heart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export const MobileBottomNav = ({ currentRoute, onNavigate, onOpenAuthModal }) => {
  const { itemCount } = useCart();
  const { isAuthenticated } = useAuth();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'products', label: 'Browse', icon: LayoutGrid },
    { id: 'cart', label: 'Cart', icon: ShoppingCart, badge: itemCount },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    {
      id: isAuthenticated ? 'account' : 'auth',
      label: isAuthenticated ? 'Account' : 'Sign In',
      icon: User,
      action: isAuthenticated ? null : onOpenAuthModal
    }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 text-slate-400 px-2 py-1.5 shadow-2xl">
      <div className="flex items-center justify-around">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentRoute === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.action) {
                  item.action();
                } else {
                  onNavigate(item.id);
                }
              }}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all relative ${
                isActive ? 'text-indigo-400 font-bold scale-105' : 'hover:text-white'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-amber-400 text-slate-950 text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
