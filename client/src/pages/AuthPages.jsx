import React, { useState } from 'react';
import { User, Lock, Mail, Store, Shield, X, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { MarketzoLogo } from '../components/common/MarketzoLogo';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const AuthModal = ({ isOpen, onClose, onNavigate, defaultMode = 'login' }) => {
  const { login, register } = useAuth();
  const { showSuccess, showError } = useToast();

  const [mode, setMode] = useState(defaultMode); // 'login' | 'register' | 'forgot'
  const [role, setRole] = useState('customer'); // 'customer' | 'seller'

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [storeName, setStoreName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const res = await login({ email, password });
        if (res.success) {
          showSuccess(`Welcome back, ${res.user.name}!`);
          onClose();
        }
      } else if (mode === 'register') {
        const sanitizedName = (name || '').trim();
        const sanitizedEmail = (email || '').trim().toLowerCase();
        const sanitizedStoreName = (storeName || '').trim();

        if (role === 'seller' && (!sanitizedStoreName || sanitizedStoreName.length < 2)) {
          showError('Please enter a valid store or business name (at least 2 characters).');
          setIsLoading(false);
          return;
        }

        const res = await register({
          name: sanitizedName,
          email: sanitizedEmail,
          password,
          role,
          storeName: role === 'seller' ? sanitizedStoreName : undefined
        });
        if (res && res.success) {
          showSuccess(res.message || 'Account registered successfully!');
          onClose();
          if (role === 'seller') onNavigate('seller');
        }
      } else if (mode === 'forgot') {
        showSuccess('Password reset link has been dispatched to your email address!');
        setMode('login');
      }
    } catch (err) {
      showError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 space-y-6 relative overflow-hidden">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <MarketzoLogo size="lg" showTagline={true} />
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            {mode === 'login' && 'Sign In to Your Account'}
            {mode === 'register' && (role === 'seller' ? 'Join as a Marketplace Seller' : 'Create Customer Account')}
            {mode === 'forgot' && 'Reset Your Password'}
          </h2>
          <p className="text-xs text-slate-500">
            {mode === 'login' && 'Access your orders, saved wishlist, and checkout instantly'}
            {mode === 'register' && 'Get access to millions of products with buyer protection'}
            {mode === 'forgot' && 'Enter your registered email to receive a secure recovery code'}
          </p>
        </div>

        {/* Role Toggle for Registration */}
        {mode === 'register' && (
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => setRole('customer')}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                role === 'customer' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600'
              }`}
            >
              Shopper / Customer
            </button>
            <button
              type="button"
              onClick={() => setRole('seller')}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                role === 'seller' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600'
              }`}
            >
              Marketplace Seller
            </button>
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {mode === 'register' && (
            <div>
              <label className="font-bold text-slate-700 block mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jordan Hayes"
                  className="w-full pl-10 pr-3.5 py-2.5 border border-slate-200 rounded-xl font-semibold outline-none focus:border-indigo-600 bg-slate-50"
                  required
                />
              </div>
            </div>
          )}

          {mode === 'register' && role === 'seller' && (
            <div>
              <label className="font-bold text-slate-700 block mb-1">Store / Business Name</label>
              <div className="relative">
                <Store className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="e.g. Nexus Electronics Lab"
                  className="w-full pl-10 pr-3.5 py-2.5 border border-slate-200 rounded-xl font-semibold outline-none focus:border-indigo-600 bg-slate-50"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="font-bold text-slate-700 block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-3.5 py-2.5 border border-slate-200 rounded-xl font-semibold outline-none focus:border-indigo-600 bg-slate-50"
                required
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-700">Password</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-[11px] text-indigo-600 hover:underline font-bold"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 border border-slate-200 rounded-xl font-semibold outline-none focus:border-indigo-600 bg-slate-50"
                  required
                />
              </div>
            </div>
          )}

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>{isLoading ? 'Processing...' : mode === 'login' ? 'Sign In' : mode === 'register' ? 'Create Account' : 'Send Reset Link'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer switch between login and register */}
        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          {mode === 'login' ? (
            <p>
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={() => setMode('register')}
                className="font-bold text-indigo-600 hover:underline"
              >
                Sign Up Free
              </button>
            </p>
          ) : (
            <p>
              Already have a Marketzo account?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="font-bold text-indigo-600 hover:underline"
              >
                Sign In
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
};
