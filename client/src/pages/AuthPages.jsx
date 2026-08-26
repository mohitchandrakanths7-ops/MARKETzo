import React, { useState } from 'react';
import { 
  User, 
  Lock, 
  Mail, 
  Store, 
  Shield, 
  X, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  Eye,
  EyeOff,
  KeyRound,
  ShieldCheck
} from 'lucide-react';
import { MarketzoLogo } from '../components/common/MarketzoLogo';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

export const AuthModal = ({ isOpen, onClose, onNavigate, defaultMode = 'login' }) => {
  const { login, register } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();

  const [mode, setMode] = useState(defaultMode); // 'login' | 'register' | 'forgot' | 'reset'
  const [role, setRole] = useState('customer'); // 'customer' | 'seller'

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [storeName, setStoreName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  // One-click quick fill demo credentials
  const handleQuickFill = (demoEmail, demoRole) => {
    setEmail(demoEmail);
    setPassword('password123');
    showInfo(`Filled ${demoRole} credentials (password: password123)`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    try {
      if (mode === 'login') {
        if (!cleanEmail || !cleanPassword) {
          showError('Please enter your email and password.');
          setIsLoading(false);
          return;
        }

        const res = await login({ email: cleanEmail, password: cleanPassword });
        if (res && res.success) {
          showSuccess(`Welcome back, ${res.user?.name || 'User'}!`);
          onClose();
          if (res.user?.role === 'seller') {
            onNavigate('seller');
          }
        }
      } else if (mode === 'register') {
        const sanitizedName = (name || '').trim();
        const sanitizedStoreName = (storeName || '').trim();

        if (!sanitizedName || sanitizedName.length < 2) {
          showError('Please enter your full name (at least 2 characters).');
          setIsLoading(false);
          return;
        }

        if (role === 'seller' && (!sanitizedStoreName || sanitizedStoreName.length < 2)) {
          showError('Please enter a valid store or business name (at least 2 characters).');
          setIsLoading(false);
          return;
        }

        const res = await register({
          name: sanitizedName,
          email: cleanEmail,
          password: cleanPassword,
          role,
          storeName: role === 'seller' ? sanitizedStoreName : undefined
        });

        if (res && res.success) {
          showSuccess(res.message || 'Account registered and logged in successfully!');
          onClose();
          if (role === 'seller') onNavigate('seller');
        }
      } else if (mode === 'forgot') {
        if (!cleanEmail) {
          showError('Please enter your registered email address.');
          setIsLoading(false);
          return;
        }

        const res = await api.forgotPassword(cleanEmail);
        if (res && res.success) {
          showSuccess(res.message || 'Verification code sent to your email!');
          if (res.resetCode) setResetCode(res.resetCode);
          setMode('reset');
        }
      } else if (mode === 'reset') {
        if (!cleanEmail || !newPassword || newPassword.length < 4) {
          showError('Please enter a new password with at least 4 characters.');
          setIsLoading(false);
          return;
        }

        const res = await api.resetPassword({
          email: cleanEmail,
          resetCode: resetCode.trim(),
          newPassword: newPassword.trim()
        });

        if (res && res.success) {
          showSuccess(res.message || 'Password updated! Please log in.');
          setPassword(newPassword.trim());
          setMode('login');
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
      showError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 space-y-5 relative overflow-hidden max-h-[90vh] overflow-y-auto">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors cursor-pointer"
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
            {mode === 'reset' && 'Set New Password'}
          </h2>
          <p className="text-xs text-slate-500">
            {mode === 'login' && 'Access your orders, saved wishlist, and checkout instantly'}
            {mode === 'register' && 'Get access to millions of products with buyer protection'}
            {mode === 'forgot' && 'Enter your registered email to receive a secure recovery code'}
            {mode === 'reset' && 'Enter the verification code and choose your new password'}
          </p>
        </div>

        {/* One-Click Quick Demo Login Chips in Login Mode */}
        {mode === 'login' && (
          <div className="p-3 bg-indigo-50/60 rounded-2xl border border-indigo-100 space-y-1.5">
            <div className="text-[10px] font-black uppercase text-indigo-700 tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-600" />
              <span>Quick Demo Sign-In (Click to Fill)</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickFill('shopper@marketzo.com', 'Customer')}
                className="p-1.5 rounded-xl bg-white border border-indigo-200 text-indigo-900 text-[11px] font-bold hover:bg-indigo-600 hover:text-white transition-all shadow-xs cursor-pointer text-center truncate"
              >
                🛍️ Shopper
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('seller@marketzo.com', 'Merchant')}
                className="p-1.5 rounded-xl bg-white border border-indigo-200 text-indigo-900 text-[11px] font-bold hover:bg-indigo-600 hover:text-white transition-all shadow-xs cursor-pointer text-center truncate"
              >
                🏪 Seller
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('admin@marketzo.com', 'Admin')}
                className="p-1.5 rounded-xl bg-white border border-indigo-200 text-indigo-900 text-[11px] font-bold hover:bg-indigo-600 hover:text-white transition-all shadow-xs cursor-pointer text-center truncate"
              >
                👑 Admin
              </button>
            </div>
          </div>
        )}

        {/* Role Toggle for Registration */}
        {mode === 'register' && (
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => setRole('customer')}
              className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                role === 'customer' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600'
              }`}
            >
              Shopper / Customer
            </button>
            <button
              type="button"
              onClick={() => setRole('seller')}
              className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
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
                  placeholder="e.g. David Miller"
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

          {mode !== 'reset' && (
            <div>
              <label className="font-bold text-slate-700 block mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@marketzo.com"
                  className="w-full pl-10 pr-3.5 py-2.5 border border-slate-200 rounded-xl font-semibold outline-none focus:border-indigo-600 bg-slate-50"
                  required
                />
              </div>
            </div>
          )}

          {/* Reset Code in Reset mode */}
          {mode === 'reset' && (
            <>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Verification Code</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    placeholder="6-digit code"
                    className="w-full pl-10 pr-3.5 py-2.5 border border-slate-200 rounded-xl font-semibold outline-none focus:border-indigo-600 bg-slate-50"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 4 characters"
                    className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl font-semibold outline-none focus:border-indigo-600 bg-slate-50"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Password field in login/register modes */}
          {(mode === 'login' || mode === 'register') && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-700">Password</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-[11px] text-indigo-600 hover:underline font-bold cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl font-semibold outline-none focus:border-indigo-600 bg-slate-50"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>
              {isLoading
                ? 'Authenticating...'
                : mode === 'login'
                ? 'Sign In to Account'
                : mode === 'register'
                ? 'Create My Account'
                : mode === 'forgot'
                ? 'Send Verification Code'
                : 'Update Password & Sign In'}
            </span>
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
                className="font-bold text-indigo-600 hover:underline cursor-pointer"
              >
                Sign Up Free
              </button>
            </p>
          ) : mode === 'register' ? (
            <p>
              Already have a Marketzo account?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="font-bold text-indigo-600 hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </p>
          ) : (
            <p>
              Remember your password?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="font-bold text-indigo-600 hover:underline cursor-pointer"
              >
                Return to Sign In
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
};
