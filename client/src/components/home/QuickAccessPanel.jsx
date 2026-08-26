import React from 'react';
import {
  Package, Heart, Tag, Clock, CreditCard, Settings,
  CheckCircle2, Gamepad2, Store, Star, ArrowRight, User
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const QuickAccessPanel = ({ onNavigate, onOpenAuthModal, sellers = [] }) => {
  const { user, isAuthenticated } = useAuth();

  const quickLinks = [
    { label: 'My Orders', icon: Package, action: () => isAuthenticated ? onNavigate('account', { tab: 'orders' }) : onOpenAuthModal?.() },
    { label: 'My Wishlist', icon: Heart, action: () => onNavigate('wishlist') },
    { label: 'Coupons', icon: Tag, action: () => onNavigate('account', { tab: 'coupons' }) },
    { label: 'Recently Viewed', icon: Clock, action: () => onNavigate('account', { tab: 'recent' }) },
    { label: 'Saved Cards', icon: CreditCard, action: () => onNavigate('account', { tab: 'cards' }) },
    { label: 'Account Settings', icon: Settings, action: () => isAuthenticated ? onNavigate('account', { tab: 'settings' }) : onOpenAuthModal?.() },
  ];

  return (
    <div className="flex flex-col space-y-4 h-full">
      {/* User Welcome / Auth Card */}
      <div
        className="p-4 rounded-2xl border flex flex-col justify-between"
        style={{
          background: '#101522',
          borderColor: 'rgba(255,255,255,0.07)'
        }}
      >
        {isAuthenticated ? (
          <div className="flex items-center gap-3">
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'User')}`}
              alt={user?.name}
              className="w-11 h-11 rounded-full border-2 border-indigo-500/40 object-cover"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'User')}`;
              }}
            />
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-medium" style={{ color: '#9CA3AF' }}>Welcome back,</div>
              <div className="text-sm font-black text-white truncate">{user?.name || 'Member'}</div>
              <div className="flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span className="text-[10px] font-bold text-emerald-400">Verified User</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-indigo-500/10 text-indigo-400">
                <User className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Welcome to MARKETZO</div>
                <div className="text-[10px]" style={{ color: '#9CA3AF' }}>Sign in for the best experience</div>
              </div>
            </div>
            <button
              onClick={() => onOpenAuthModal?.('login')}
              className="w-full py-2 rounded-xl text-xs font-black text-white cursor-pointer press-feedback shadow-sm"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
            >
              Sign In / Register
            </button>
          </div>
        )}

        {/* Quick Access Links */}
        <div className="mt-4 pt-3 border-t space-y-1" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: '#6B7280' }}>
            Quick Access
          </div>
          {quickLinks.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                onClick={item.action}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left transition-all hover:bg-slate-800/60 cursor-pointer group"
              >
                <Icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                <span className="text-xs text-slate-300 group-hover:text-white transition-colors">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Gaming Zone Card */}
      <div
        onClick={() => onNavigate('gaming')}
        className="p-4 rounded-2xl border cursor-pointer group relative overflow-hidden transition-all hover:border-purple-500/40"
        style={{
          background: 'linear-gradient(135deg, #0f0a2e 0%, #15103a 60%, #0d1b2a 100%)',
          borderColor: 'rgba(168,85,247,0.25)',
          boxShadow: '0 8px 24px rgba(139,92,246,0.12)'
        }}
      >
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <Gamepad2 className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-black tracking-wider uppercase text-purple-300">Gaming Zone</span>
          </div>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-extrabold border border-purple-500/30">
            PRO
          </span>
        </div>
        <p className="text-[11px] text-slate-300 mb-3 leading-tight">
          Level up your gaming experience.
        </p>
        <button
          className="flex items-center gap-1.5 text-xs font-bold text-purple-300 group-hover:text-white transition-colors"
        >
          <span>Explore Now</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Top Stores Quick Widget */}
      {sellers.length > 0 && (
        <div
          className="p-4 rounded-2xl border flex-1"
          style={{
            background: '#101522',
            borderColor: 'rgba(255,255,255,0.07)'
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-white">Top Stores</span>
            <button
              onClick={() => onNavigate('products', {})}
              className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="space-y-2.5">
            {sellers.slice(0, 3).map((seller) => (
              <div
                key={seller.id}
                onClick={() => onNavigate('products', { sellerId: seller.id })}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 transition-all cursor-pointer border border-white/5"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg overflow-hidden bg-slate-800 flex items-center justify-center shrink-0 border border-white/10">
                    {seller.storeLogo ? (
                      <img src={seller.storeLogo} alt={seller.storeName} className="w-full h-full object-cover" />
                    ) : (
                      <Store className="w-3.5 h-3.5 text-indigo-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-200 truncate">{seller.storeName}</div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400">
                      <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                      <span>{seller.rating || 4.8}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate('products', { sellerId: seller.id });
                  }}
                  className="px-2 py-1 rounded-md text-[10px] font-bold bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20 shrink-0"
                >
                  Follow
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
