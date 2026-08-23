import React, { useState } from 'react';
import { UserCheck, Store, Shield, LogOut, ChevronUp, ChevronDown, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const PersonaSwitcher = ({ onNavigate }) => {
  const { user, demoLogin, logout, isAuthenticated } = useAuth();
  const { showSuccess } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const handleSwitch = async (role) => {
    try {
      const res = await demoLogin(role);
      showSuccess(res.message);
      setIsOpen(false);
      if (role === 'seller') {
        onNavigate('seller');
      } else if (role === 'admin') {
        onNavigate('admin');
      } else {
        onNavigate('home');
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed bottom-16 md:bottom-6 left-4 z-40">
      <div className="bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700/80 overflow-hidden backdrop-blur-md text-xs">
        
        {/* Header pill */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-800/90 hover:bg-slate-750 font-semibold transition-colors cursor-pointer w-full text-left"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-bold text-slate-200">
            {isAuthenticated ? `Role: ${user?.role.toUpperCase()}` : 'Quick Switch Persona'}
          </span>
          {isOpen ? <ChevronDown className="w-3.5 h-3.5 ml-auto text-slate-400" /> : <ChevronUp className="w-3.5 h-3.5 ml-auto text-slate-400" />}
        </button>

        {/* Persona Options Drawer */}
        {isOpen && (
          <div className="p-2 space-y-1.5 bg-slate-950/95 min-w-[240px] animate-in fade-in slide-in-from-bottom-2">
            <div className="text-[10px] uppercase font-bold text-slate-500 px-2 py-1 tracking-wider">
              1-Click Demo Accounts
            </div>

            {/* Customer */}
            <button
              onClick={() => handleSwitch('customer')}
              className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left transition-all ${
                user?.role === 'customer' ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40' : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
                <UserCheck className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-white leading-tight">Customer</div>
                <div className="text-[10px] text-slate-400 truncate">Alex Mercer (Cart & Orders)</div>
              </div>
            </button>

            {/* Seller */}
            <button
              onClick={() => handleSwitch('seller')}
              className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left transition-all ${
                user?.role === 'seller' ? 'bg-amber-600/30 text-amber-300 border border-amber-500/40' : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                <Store className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-white leading-tight">Verified Seller</div>
                <div className="text-[10px] text-slate-400 truncate">Apex Tech Labs (Products & Sales)</div>
              </div>
            </button>

            {/* Super Admin */}
            <button
              onClick={() => handleSwitch('admin')}
              className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left transition-all ${
                user?.role === 'admin' ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40' : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                <Shield className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-white leading-tight">Super Admin</div>
                <div className="text-[10px] text-slate-400 truncate">Platform Moderation & Metrics</div>
              </div>
            </button>

            {/* Sign Out */}
            {isAuthenticated && (
              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                  onNavigate('home');
                }}
                className="w-full flex items-center gap-2 p-2 rounded-xl text-left text-rose-400 hover:bg-rose-950/40 transition-colors pt-2 border-t border-slate-800"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold">Sign Out to Guest</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
