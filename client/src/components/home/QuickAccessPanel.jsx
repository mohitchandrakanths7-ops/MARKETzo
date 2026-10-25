import React from 'react';
import {
  Package,
  Heart,
  Tag,
  Clock,
  CreditCard,
  Settings,
  CheckCircle2,
  Gamepad2,
  Store,
  ChevronRight,
  ArrowRight,
  User,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const QuickAccessPanel = ({ onNavigate, onOpenAuthModal, sellers = [] }) => {
  const { user, isAuthenticated } = useAuth();

  const quickLinks = [
    { label: 'My Orders', icon: Package, action: () => isAuthenticated ? onNavigate('account', { tab: 'orders' }) : onOpenAuthModal?.('login') },
    { label: 'My Wishlist', icon: Heart, action: () => onNavigate('wishlist') },
    { label: 'Coupons', icon: Tag, action: () => onNavigate('account', { tab: 'coupons' }) },
    { label: 'Recently Viewed', icon: Clock, action: () => onNavigate('account', { tab: 'recent' }) },
    { label: 'Saved Cards', icon: CreditCard, action: () => onNavigate('account', { tab: 'cards' }) },
    { label: 'Account Settings', icon: Settings, action: () => isAuthenticated ? onNavigate('account', { tab: 'settings' }) : onOpenAuthModal?.('login') },
  ];

  // Default official top stores matching the reference screenshot
  const defaultStores = [
    { id: 'apple', name: 'Apple', badge: 'Official', icon: '🍎' },
    { id: 'samsung', name: 'Samsung', badge: 'Official', icon: '📱' },
    { id: 'nike', name: 'Nike', badge: 'Official', icon: '👟' },
    { id: 'adidas', name: 'Adidas', badge: 'Official', icon: '⚡' },
    { id: 'boat', name: 'boAt', badge: 'Official', icon: '⛵' }
  ];

  return (
    <div className="flex flex-col space-y-4 h-full">
      
      {/* 1. Account / Welcome Card */}
      <div
        className="p-5 rounded-2xl border shadow-xl flex flex-col justify-between"
        style={{
          background: '#0B1427',
          borderColor: 'rgba(100, 149, 237, 0.22)'
        }}
      >
        {isAuthenticated ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <img
                src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'User')}`}
                alt={user?.name}
                className="w-12 h-12 rounded-full border-2 border-[#2583FF] object-cover shadow-[0_0_12px_rgba(37,131,255,0.3)]"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'User')}`;
                }}
              />
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-medium text-[#A8B5CC]">Welcome back,</div>
                <div className="text-sm font-black text-white truncate">{user?.name || 'Member'}</div>
                <div className="flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="w-3 h-3 text-[#22C55E]" />
                  <span className="text-[10px] font-bold text-[#22C55E]">Verified Buyer</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigate('account', { tab: 'profile' })}
              className="w-full py-2.5 rounded-xl text-xs font-black text-white cursor-pointer transition-all flex items-center justify-center gap-2 shadow-md hover:brightness-110"
              style={{ background: 'linear-gradient(135deg, #2583FF 0%, #702EFF 100%)' }}
            >
              <span>Manage Account</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="space-y-3.5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full flex items-center justify-center bg-[#2583FF]/20 text-[#00C8FF] border border-[#2583FF]/40 shadow-[0_0_15px_rgba(0,200,255,0.2)]">
                <User className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-black text-white">Welcome to MARKETZO</div>
                <div className="text-xs text-[#A8B5CC]">Sign in for the best experience</div>
              </div>
            </div>

            <button
              onClick={() => onOpenAuthModal?.('login')}
              className="w-full py-2.5 rounded-full text-xs font-black text-white cursor-pointer transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-[0_0_20px_rgba(37,131,255,0.4)] hover:scale-[1.01]"
              style={{ background: 'linear-gradient(135deg, #2583FF 0%, #702EFF 100%)' }}
            >
              <span>Sign In / Register</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Quick Access Links */}
        <div className="mt-4 pt-3 border-t space-y-1" style={{ borderColor: 'rgba(100, 149, 237, 0.15)' }}>
          <div className="text-[10px] font-black uppercase tracking-wider mb-2 text-[#A8B5CC]">
            QUICK ACCESS
          </div>
          {quickLinks.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                onClick={item.action}
                className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left transition-all hover:bg-[#101B32] cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 text-[#A8B5CC] group-hover:text-[#00C8FF] transition-colors" />
                  <span className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors">
                    {item.label}
                  </span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#00C8FF] group-hover:translate-x-0.5 transition-all" />
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Gaming Zone Promotional Card */}
      <div
        onClick={() => onNavigate('gaming')}
        className="rounded-2xl border cursor-pointer group relative overflow-hidden transition-all duration-300 p-4 flex items-center justify-between hover:border-purple-400/60 shadow-xl"
        style={{
          background: 'linear-gradient(135deg, #0e072b 0%, #160c3d 50%, #1c0d4a 100%)',
          borderColor: 'rgba(168, 85, 247, 0.35)',
          boxShadow: '0 8px 30px rgba(112, 46, 255, 0.2)'
        }}
      >
        {/* Ambient Glow */}
        <div
          className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full pointer-events-none blur-xl opacity-60"
          style={{ background: 'radial-gradient(circle, #702EFF 0%, transparent 70%)' }}
        />

        {/* Left Text */}
        <div className="relative z-10 flex flex-col justify-between space-y-2 pr-2">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-purple-500/20 text-purple-300">
              <Gamepad2 className="w-4 h-4" />
            </div>
            <span className="text-xs font-black tracking-wider uppercase text-white">GAMING ZONE</span>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-[#702EFF] text-white">
              PRO
            </span>
          </div>
          <p className="text-[11px] text-purple-200/90 font-medium leading-tight">
            Level up your gaming experience.
          </p>
          <div className="flex items-center gap-1.5 text-xs font-black text-purple-300 group-hover:text-white transition-colors pt-1">
            <span>Explore Now</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Right Gamer Illustration */}
        <div className="relative z-10 w-24 h-24 shrink-0 rounded-xl overflow-hidden border border-purple-500/30 shadow-md">
          <img
            src="/gaming-avatar.jpg"
            alt="Gaming Zone Pro"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </div>

      {/* 3. Top Stores Panel */}
      <div
        className="p-4 rounded-2xl border shadow-xl"
        style={{
          background: '#0B1427',
          borderColor: 'rgba(100, 149, 237, 0.22)'
        }}
        id="top-stores-section"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-black text-white uppercase tracking-wider">Top Stores</span>
          <button
            onClick={() => onNavigate('products', {})}
            className="text-[11px] font-bold text-[#00C8FF] hover:underline cursor-pointer flex items-center gap-1"
          >
            <span>View All</span>
            <span>→</span>
          </button>
        </div>

        {/* Circular Store Badges Row matching screenshot */}
        <div className="grid grid-cols-5 gap-2 pt-1">
          {(sellers.length > 0
            ? sellers.slice(0, 5).map(s => ({
                id: s.id,
                name: s.storeName,
                badge: 'Official',
                icon: '🏬',
                img: s.storeLogo
              }))
            : defaultStores
          ).map((store) => (
            <button
              key={store.id}
              onClick={() => onNavigate('products', { search: store.name })}
              className="flex flex-col items-center group cursor-pointer text-center"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center border border-[rgba(100,149,237,0.3)] group-hover:border-[#00C8FF] transition-all bg-[#081225] shadow-sm group-hover:scale-105 overflow-hidden"
              >
                {store.img ? (
                  <img src={store.img} alt={store.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-base">{store.icon}</span>
                )}
              </div>
              <span className="text-[10px] font-bold text-white mt-1.5 truncate max-w-full group-hover:text-[#00C8FF] transition-colors">
                {store.name}
              </span>
              <span className="text-[9px] text-[#A8B5CC] leading-none">
                {store.badge}
              </span>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};

