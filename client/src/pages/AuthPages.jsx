import React, { useState, useEffect, useRef } from 'react';
import { 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ShieldCheck, 
  KeyRound, 
  Copy, 
  Check, 
  Download, 
  Loader2, 
  X,
  HelpCircle,
  Shield,
  ArrowLeft
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { MarketzoLogo } from '../components/common/MarketzoLogo';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

// Curated Creative MARKETzo Usernames for local instant rotation
const CREATIVE_PRESETS = [
  'ZoNova',
  'NexoraX',
  'ZoElite',
  'PixelNova',
  'RoyalNova',
  'ShadowByte',
  'ZoVortex',
  'AstroVex',
  'CyberZo',
  'NovaApex',
  'PulseVex',
  'ZenithZo',
  'ZoMatrix',
  'HyperNova',
  'ZoQuantum',
  'VortexX',
  'ZoPrime',
  'EchoByte',
  'ZoCosmo',
  'PhantomZo'
];

// =========================================================================
// 1. LOGIN FORM COMPONENT (Username & Password Only)
// =========================================================================
export const LoginForm = ({ onNavigate, onSwitchMode, onSuccess, isModal = false }) => {
  const { login } = useAuth();
  const { showSuccess, showError } = useToast();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const usernameInputRef = useRef(null);

  useEffect(() => {
    // Focus username input on mount
    usernameInputRef.current?.focus();
  }, []);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (isLoading) return;

    setErrorMessage('');
    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    if (!cleanUsername) {
      setErrorMessage('Please enter your username.');
      usernameInputRef.current?.focus();
      return;
    }

    if (!cleanPassword) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await login({ username: cleanUsername, password: cleanPassword });
      if (res && res.success) {
        showSuccess(res.message || `Welcome back, ${res.user?.username || res.user?.name}!`);
        if (onSuccess) onSuccess(res.user);

        // Redirect based on user role
        if (res.user?.role === 'seller') {
          onNavigate?.('seller');
        } else if (res.user?.role === 'admin') {
          onNavigate?.('admin');
        } else {
          onNavigate?.('home');
        }
      } else {
        const msg = res?.message || 'Incorrect username or password. Please verify your credentials.';
        setErrorMessage(msg);
        showError(msg);
      }
    } catch (err) {
      console.error('[AUTH] Login failure:', err);
      const msg = err.message || 'Incorrect username or password. Please try again.';
      setErrorMessage(msg);
      showError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header Info */}
      <div className="text-center space-y-1.5">
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Welcome to <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-300 bg-clip-text text-transparent">MARKETzo</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-400">
          Sign in using your unique MARKETzo username and password
        </p>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div 
          id="login-error-alert"
          role="alert"
          className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-3 animate-in fade-in slide-in-from-top-2 shadow-lg shadow-rose-950/40"
        >
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
        </div>
      )}

      {/* Form Fields */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Username Field */}
        <div>
          <label 
            htmlFor="login-username" 
            className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider"
          >
            Username
          </label>
          <div className="relative group">
            <User className="w-4 h-4 text-slate-400 group-focus-within:text-blue-400 absolute left-4 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
            <input
              id="login-username"
              name="username"
              ref={usernameInputRef}
              type="text"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck="false"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (errorMessage) setErrorMessage('');
              }}
              placeholder="e.g. ZoNova"
              disabled={isLoading}
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#0b1120] border border-slate-700/80 text-white placeholder-slate-500 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all shadow-inner disabled:opacity-50"
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label 
              htmlFor="login-password" 
              className="block text-xs font-bold text-slate-300 uppercase tracking-wider"
            >
              Password
            </label>
            <button
              type="button"
              id="forgot-password-link"
              onClick={() => onSwitchMode?.('forgot')}
              className="text-xs font-bold text-amber-400 hover:text-amber-300 hover:underline transition-colors cursor-pointer"
            >
              Forgot Password?
            </button>
          </div>
          <div className="relative group">
            <Lock className="w-4 h-4 text-slate-400 group-focus-within:text-blue-400 absolute left-4 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
            <input
              id="login-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errorMessage) setErrorMessage('');
              }}
              placeholder="Enter your password"
              disabled={isLoading}
              className="w-full pl-11 pr-12 py-3 rounded-2xl bg-[#0b1120] border border-slate-700/80 text-white placeholder-slate-500 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all shadow-inner disabled:opacity-50"
            />
            <button
              type="button"
              id="toggle-login-password-visibility"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              title={showPassword ? 'Hide password' : 'Show password'}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          id="login-submit-button"
          disabled={isLoading}
          className="w-full mt-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm tracking-wide transition-all duration-200 shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Authenticating...</span>
            </>
          ) : (
            <>
              <span>Sign In to MARKETzo</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Switch to Register */}
      <div className="pt-4 border-t border-slate-800/80 text-center text-xs text-slate-400">
        New to MARKETzo?{' '}
        <button
          type="button"
          id="go-to-register-link"
          onClick={() => onSwitchMode?.('register')}
          className="font-bold text-blue-400 hover:text-blue-300 hover:underline cursor-pointer transition-colors"
        >
          Create an Account
        </button>
      </div>
    </div>
  );
};

// =========================================================================
// 2. REGISTRATION FORM COMPONENT (Username, Password, Confirm Password)
// =========================================================================
export const RegisterForm = ({ onNavigate, onSwitchMode, onSuccess }) => {
  const { register } = useAuth();
  const { showSuccess, showError } = useToast();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Real-time username availability state
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState(null); // { available: boolean, message: string }
  const [isGenerating, setIsGenerating] = useState(false);

  // Recovery Key Presentation State after registration
  const [recoveryCode, setRecoveryCode] = useState(null);
  const [hasCopiedKey, setHasCopiedKey] = useState(false);
  const [hasConfirmedSaved, setHasConfirmedSaved] = useState(false);
  const [registeredUser, setRegisteredUser] = useState(null);

  // Debounced username availability checker
  useEffect(() => {
    const trimmed = username.trim();
    if (!trimmed) {
      setUsernameStatus(null);
      setIsCheckingUsername(false);
      return;
    }

    if (trimmed.length < 3) {
      setUsernameStatus({ available: false, message: 'Username must be at least 3 characters.' });
      setIsCheckingUsername(false);
      return;
    }

    if (trimmed.length > 24) {
      setUsernameStatus({ available: false, message: 'Username cannot exceed 24 characters.' });
      setIsCheckingUsername(false);
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
      setUsernameStatus({ available: false, message: 'Only letters, numbers, and underscores allowed.' });
      setIsCheckingUsername(false);
      return;
    }

    setIsCheckingUsername(true);
    const timer = setTimeout(async () => {
      try {
        const res = await api.checkUsername(trimmed);
        if (res && res.success) {
          setUsernameStatus({
            available: res.available,
            message: res.message
          });
        }
      } catch (e) {
        setUsernameStatus(null);
      } finally {
        setIsCheckingUsername(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [username]);

  // Username generator handler
  const handleGenerateUsername = async () => {
    setIsGenerating(true);
    try {
      const res = await api.generateUsername();
      if (res && res.success && res.username) {
        setUsername(res.username);
      } else {
        // Fallback to random preset
        const rand = CREATIVE_PRESETS[Math.floor(Math.random() * CREATIVE_PRESETS.length)];
        setUsername(rand);
      }
    } catch (e) {
      const rand = CREATIVE_PRESETS[Math.floor(Math.random() * CREATIVE_PRESETS.length)];
      setUsername(rand);
    } finally {
      setIsGenerating(false);
    }
  };

  // Password matching check
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword;
  const isPasswordLongEnough = password.length >= 8;

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (isLoading) return;

    setErrorMessage('');
    const cleanUsername = username.trim();

    if (!cleanUsername || cleanUsername.length < 3) {
      setErrorMessage('Username must be at least 3 characters long.');
      return;
    }

    if (cleanUsername.length > 24) {
      setErrorMessage('Username cannot exceed 24 characters.');
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
      setErrorMessage('Username may only contain letters, numbers, and underscores.');
      return;
    }

    if (usernameStatus && !usernameStatus.available) {
      setErrorMessage(usernameStatus.message || 'This username is already taken. Please choose another.');
      return;
    }

    if (!password || password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify both password fields.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await register({
        username: cleanUsername,
        password: password,
        confirmPassword: confirmPassword,
        role: 'customer'
      });

      if (res && res.success) {
        setRegisteredUser(res.user);
        setRecoveryCode(res.recoveryCode);
        showSuccess('Account created successfully! Save your Recovery Key.');

        // Fire celebratory confetti!
        try {
          confetti({
            particleCount: 90,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch (e) {}
      } else {
        const msg = res?.message || 'Registration failed. Please try a different username.';
        setErrorMessage(msg);
        showError(msg);
      }
    } catch (err) {
      console.error('[AUTH] Registration failure:', err);
      const msg = err.message || 'Registration failed. Please try again.';
      setErrorMessage(msg);
      showError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Copy Recovery Key to clipboard
  const handleCopyRecoveryKey = () => {
    if (!recoveryCode) return;
    navigator.clipboard.writeText(recoveryCode);
    setHasCopiedKey(true);
    showSuccess('Account Recovery Key copied to clipboard!');
    setTimeout(() => setHasCopiedKey(false), 4000);
  };

  // Download Recovery Key text file
  const handleDownloadRecoveryKey = () => {
    if (!recoveryCode) return;
    const content = `=====================================================
MARKETZO SECURE ACCOUNT RECOVERY KEY
=====================================================

Username:      ${registeredUser?.username || username}
Account ID:    ${registeredUser?.id || 'MARKETZO-USER'}
Created On:    ${new Date().toLocaleString()}

RECOVERY KEY:  ${recoveryCode}

IMPORTANT SECURITY NOTICE:
Because MARKETzo strictly protects your privacy, we DO NOT 
collect or store your email address or mobile phone number. 

This Account Recovery Key is your ONLY cryptographic method 
to regain access if you ever forget your password.

Keep this file stored in a private, encrypted vault or print
it and keep it in a secure location.
=====================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `marketzo-recovery-key-${username || 'account'}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showSuccess('Recovery key file downloaded safely!');
  };

  // Finish registration & proceed
  const handleFinishRegistration = () => {
    if (onSuccess) onSuccess(registeredUser);
    onNavigate?.('home');
  };

  // -------------------------------------------------------------
  // POST-REGISTRATION RECOVERY KEY PRESENTATION STEP
  // -------------------------------------------------------------
  if (recoveryCode) {
    return (
      <div className="w-full space-y-6 animate-in fade-in zoom-in-95">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Account Created Successfully!
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
            Welcome to MARKETzo, <span className="font-bold text-amber-300">@{registeredUser?.username || username}</span>. Below is your private Account Recovery Key.
          </p>
        </div>

        {/* Security Alert Banner */}
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-3">
          <Shield className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed font-medium">
            <strong>Save this key immediately!</strong> Because MARKETzo does not require your email or phone number, this key is the <u>only way</u> to reset your password if forgotten.
          </div>
        </div>

        {/* Recovery Key Display Box */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#070b14] border-2 border-amber-400/40 shadow-xl space-y-3 relative overflow-hidden">
          <div className="text-[10px] uppercase font-black tracking-widest text-amber-400/90 flex items-center justify-between">
            <span>Your Recovery Key</span>
            <span className="text-slate-400">Cryptographic 128-bit</span>
          </div>

          <div 
            id="recovery-key-display"
            className="text-center py-3 px-2 rounded-xl bg-[#0d1322] border border-amber-400/30 text-amber-300 font-mono text-base sm:text-lg font-bold tracking-widest select-all shadow-inner"
          >
            {recoveryCode}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              id="copy-recovery-key-button"
              onClick={handleCopyRecoveryKey}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-all cursor-pointer"
            >
              {hasCopiedKey ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-300" />
                  <span>Copy Key</span>
                </>
              )}
            </button>

            <button
              type="button"
              id="download-recovery-key-button"
              onClick={handleDownloadRecoveryKey}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Download (.txt)</span>
            </button>
          </div>
        </div>

        {/* Confirmation Checkbox */}
        <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer text-xs text-slate-300 select-none">
          <input
            type="checkbox"
            id="confirm-saved-recovery-key-checkbox"
            checked={hasConfirmedSaved}
            onChange={(e) => setHasConfirmedSaved(e.target.checked)}
            className="mt-0.5 rounded border-slate-700 text-amber-500 focus:ring-amber-500 w-4 h-4 cursor-pointer"
          />
          <span className="leading-snug">
            I have securely copied or saved my Recovery Key. I understand MARKETzo cannot recover my account without it.
          </span>
        </label>

        {/* Continue Button */}
        <button
          type="button"
          id="finish-registration-button"
          onClick={handleFinishRegistration}
          disabled={!hasConfirmedSaved}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm tracking-wide transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span>Continue to MARKETzo Marketplace</span>
          <ArrowRight className="w-4 h-4 text-slate-950" />
        </button>
      </div>
    );
  }

  // -------------------------------------------------------------
  // REGISTRATION FORM
  // -------------------------------------------------------------
  return (
    <div className="w-full space-y-5">
      {/* Header Info */}
      <div className="text-center space-y-1.5">
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Create <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-300 bg-clip-text text-transparent">MARKETzo</span> Account
        </h2>
        <p className="text-xs sm:text-sm text-slate-400">
          Only a username and password required. No email or phone needed.
        </p>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div 
          id="register-error-alert"
          role="alert"
          className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-3 animate-in fade-in slide-in-from-top-2 shadow-lg shadow-rose-950/40"
        >
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
        </div>
      )}

      {/* Form Fields */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 1. Username Field with Generator & Availability Status */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label 
              htmlFor="register-username" 
              className="block text-xs font-bold text-slate-300 uppercase tracking-wider"
            >
              Username
            </label>
            <button
              type="button"
              id="generate-username-button"
              onClick={handleGenerateUsername}
              disabled={isGenerating}
              className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors cursor-pointer"
              title="Generate a unique, creative MARKETzo username"
            >
              <Sparkles className={`w-3.5 h-3.5 text-amber-400 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Generating...' : 'Generate Username'}</span>
            </button>
          </div>

          <div className="relative group">
            <User className="w-4 h-4 text-slate-400 group-focus-within:text-blue-400 absolute left-4 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
            <input
              id="register-username"
              name="username"
              type="text"
              autoComplete="off"
              autoCapitalize="none"
              spellCheck="false"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (errorMessage) setErrorMessage('');
              }}
              placeholder="e.g. ZoNova"
              disabled={isLoading}
              className={`w-full pl-11 pr-10 py-3 rounded-2xl bg-[#0b1120] border text-white placeholder-slate-500 text-sm font-semibold outline-none focus:ring-2 transition-all shadow-inner disabled:opacity-50 ${
                usernameStatus?.available === true
                  ? 'border-emerald-500/70 focus:border-emerald-500 focus:ring-emerald-500/30'
                  : usernameStatus?.available === false
                  ? 'border-rose-500/70 focus:border-rose-500 focus:ring-rose-500/30'
                  : 'border-slate-700/80 focus:border-blue-500 focus:ring-blue-500/30'
              }`}
            />
            {/* Availability Indicator Icon */}
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
              {isCheckingUsername ? (
                <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
              ) : usernameStatus?.available === true ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : usernameStatus?.available === false ? (
                <AlertCircle className="w-4 h-4 text-rose-400" />
              ) : null}
            </div>
          </div>

          {/* Availability Feedback Message */}
          {username.trim() && usernameStatus && (
            <p className={`mt-1.5 text-[11px] font-medium flex items-center gap-1 ${
              usernameStatus.available ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              <span>{usernameStatus.message}</span>
            </p>
          )}
          {!username.trim() && (
            <p className="mt-1 text-[10px] text-slate-500">
              3 to 24 characters. Letters, numbers, and underscores allowed. Case-insensitive.
            </p>
          )}
        </div>

        {/* 2. Password Field */}
        <div>
          <label 
            htmlFor="register-password" 
            className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider"
          >
            Password
          </label>
          <div className="relative group">
            <Lock className="w-4 h-4 text-slate-400 group-focus-within:text-blue-400 absolute left-4 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
            <input
              id="register-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errorMessage) setErrorMessage('');
              }}
              placeholder="Minimum 8 characters"
              disabled={isLoading}
              className="w-full pl-11 pr-12 py-3 rounded-2xl bg-[#0b1120] border border-slate-700/80 text-white placeholder-slate-500 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all shadow-inner disabled:opacity-50"
            />
            <button
              type="button"
              id="toggle-register-password-visibility"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              title={showPassword ? 'Hide password' : 'Show password'}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <div className="flex items-center justify-between mt-1 text-[10px]">
            <span className={password.length === 0 ? 'text-slate-500' : isPasswordLongEnough ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
              {password.length === 0
                ? 'Must be at least 8 characters long'
                : isPasswordLongEnough
                ? '✓ Password length requirement met'
                : `Need ${8 - password.length} more characters`}
            </span>
          </div>
        </div>

        {/* 3. Confirm Password Field */}
        <div>
          <label 
            htmlFor="register-confirm-password" 
            className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider"
          >
            Confirm Password
          </label>
          <div className="relative group">
            <Lock className="w-4 h-4 text-slate-400 group-focus-within:text-blue-400 absolute left-4 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
            <input
              id="register-confirm-password"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errorMessage) setErrorMessage('');
              }}
              placeholder="Re-enter your password"
              disabled={isLoading}
              className={`w-full pl-11 pr-12 py-3 rounded-2xl bg-[#0b1120] border text-white placeholder-slate-500 text-sm font-semibold outline-none focus:ring-2 transition-all shadow-inner disabled:opacity-50 ${
                passwordsMatch
                  ? 'border-emerald-500/70 focus:border-emerald-500 focus:ring-emerald-500/30'
                  : passwordMismatch
                  ? 'border-rose-500/70 focus:border-rose-500 focus:ring-rose-500/30'
                  : 'border-slate-700/80 focus:border-blue-500 focus:ring-blue-500/30'
              }`}
            />
            <button
              type="button"
              id="toggle-register-confirm-password-visibility"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              title={showConfirmPassword ? 'Hide password' : 'Show password'}
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {confirmPassword.length > 0 && (
            <p className={`mt-1 text-[11px] font-medium ${passwordsMatch ? 'text-emerald-400' : 'text-rose-400'}`}>
              {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
            </p>
          )}
        </div>

        {/* Submit Registration Button */}
        <button
          type="submit"
          id="register-submit-button"
          disabled={isLoading || (usernameStatus && !usernameStatus.available) || (password.length > 0 && password.length < 8) || passwordMismatch}
          className="w-full mt-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm tracking-wide transition-all duration-200 shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Creating Account...</span>
            </>
          ) : (
            <>
              <span>Create My Account</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Switch to Login */}
      <div className="pt-4 border-t border-slate-800/80 text-center text-xs text-slate-400">
        Already have a MARKETzo account?{' '}
        <button
          type="button"
          id="go-to-login-link"
          onClick={() => onSwitchMode?.('login')}
          className="font-bold text-blue-400 hover:text-blue-300 hover:underline cursor-pointer transition-colors"
        >
          Sign In
        </button>
      </div>
    </div>
  );
};

// =========================================================================
// 3. SECURE FORGOT PASSWORD / ACCOUNT RECOVERY FORM COMPONENT
// =========================================================================
export const ForgotPasswordForm = ({ onNavigate, onSwitchMode }) => {
  const { showSuccess, showError } = useToast();

  const [username, setUsername] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [freshRecoveryCode, setFreshRecoveryCode] = useState('');

  const passwordsMatch = confirmNewPassword.length > 0 && newPassword === confirmNewPassword;
  const isPasswordLongEnough = newPassword.length >= 8;

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (isLoading) return;

    setErrorMessage('');
    const cleanUsername = username.trim();
    const cleanKey = recoveryCode.trim().toUpperCase();

    if (!cleanUsername) {
      setErrorMessage('Please enter your username.');
      return;
    }

    if (!cleanKey) {
      setErrorMessage('Please enter your Account Recovery Key.');
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      setErrorMessage('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setErrorMessage('New password and confirmation do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await api.recoverPassword({
        username: cleanUsername,
        recoveryCode: cleanKey,
        newPassword: newPassword,
        confirmPassword: confirmNewPassword
      });

      if (res && res.success) {
        setIsSuccess(true);
        if (res.newRecoveryCode) {
          setFreshRecoveryCode(res.newRecoveryCode);
        }
        showSuccess(res.message || 'Password successfully updated! You can now log in.');
      } else {
        const msg = res?.message || 'Invalid recovery key or username. Please check your credentials.';
        setErrorMessage(msg);
        showError(msg);
      }
    } catch (err) {
      console.error('[AUTH] Recovery failure:', err);
      const msg = err.message || 'Could not reset password. Please check your Account Recovery Key.';
      setErrorMessage(msg);
      showError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Success view
  if (isSuccess) {
    return (
      <div className="w-full space-y-6 text-center animate-in fade-in zoom-in-95">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-2xl font-black text-white tracking-tight">
            Password Successfully Reset!
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-sm mx-auto">
            Your password has been securely updated. You can now log in with your new password.
          </p>
        </div>

        {freshRecoveryCode && (
          <div className="p-4 rounded-2xl bg-[#070b14] border border-amber-400/40 text-left space-y-2">
            <div className="text-[10px] font-bold uppercase text-amber-400">
              New Account Recovery Key
            </div>
            <div className="font-mono text-sm text-amber-300 font-bold bg-[#0d1322] p-2.5 rounded-xl border border-amber-400/20 text-center select-all">
              {freshRecoveryCode}
            </div>
            <p className="text-[10px] text-slate-400">
              Please save this new key. Your previous recovery key has been superseded.
            </p>
          </div>
        )}

        <button
          type="button"
          id="return-to-login-after-reset-button"
          onClick={() => onSwitchMode?.('login')}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm tracking-wide transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Sign In with New Password</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-5">
      {/* Header Info */}
      <div className="text-center space-y-1.5">
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Reset Your Password
        </h2>
        <p className="text-xs sm:text-sm text-slate-400">
          Enter your username and the private Account Recovery Key generated during registration.
        </p>
      </div>

      {/* Explanation Banner */}
      <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-200 text-xs flex items-start gap-3">
        <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed font-medium">
          MARKETzo accounts are password-protected without tracking personal phone or email. Your Recovery Key verifies your authentic ownership.
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div 
          id="recover-error-alert"
          role="alert"
          className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-3 animate-in fade-in slide-in-from-top-2 shadow-lg shadow-rose-950/40"
        >
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
        </div>
      )}

      {/* Form Fields */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Username */}
        <div>
          <label 
            htmlFor="recover-username" 
            className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider"
          >
            Username
          </label>
          <div className="relative group">
            <User className="w-4 h-4 text-slate-400 group-focus-within:text-blue-400 absolute left-4 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
            <input
              id="recover-username"
              name="username"
              type="text"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck="false"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (errorMessage) setErrorMessage('');
              }}
              placeholder="e.g. ZoNova"
              disabled={isLoading}
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#0b1120] border border-slate-700/80 text-white placeholder-slate-500 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all shadow-inner disabled:opacity-50"
            />
          </div>
        </div>

        {/* Account Recovery Key */}
        <div>
          <label 
            htmlFor="recover-key" 
            className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider"
          >
            Account Recovery Key
          </label>
          <div className="relative group">
            <KeyRound className="w-4 h-4 text-amber-400 group-focus-within:text-amber-300 absolute left-4 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
            <input
              id="recover-key"
              name="recoveryCode"
              type="text"
              autoComplete="off"
              spellCheck="false"
              value={recoveryCode}
              onChange={(e) => {
                setRecoveryCode(e.target.value);
                if (errorMessage) setErrorMessage('');
              }}
              placeholder="MZ-XXXX-XXXX-XXXX"
              disabled={isLoading}
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#0b1120] border border-amber-500/40 text-amber-300 font-mono placeholder-slate-500 text-sm font-bold tracking-wider outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/30 transition-all shadow-inner disabled:opacity-50"
            />
          </div>
        </div>

        {/* New Password */}
        <div>
          <label 
            htmlFor="recover-new-password" 
            className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider"
          >
            New Password
          </label>
          <div className="relative group">
            <Lock className="w-4 h-4 text-slate-400 group-focus-within:text-blue-400 absolute left-4 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
            <input
              id="recover-new-password"
              name="newPassword"
              type={showNewPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (errorMessage) setErrorMessage('');
              }}
              placeholder="Minimum 8 characters"
              disabled={isLoading}
              className="w-full pl-11 pr-12 py-3 rounded-2xl bg-[#0b1120] border border-slate-700/80 text-white placeholder-slate-500 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all shadow-inner disabled:opacity-50"
            />
            <button
              type="button"
              id="toggle-recover-new-password-visibility"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              title={showNewPassword ? 'Hide password' : 'Show password'}
              aria-label={showNewPassword ? 'Hide password' : 'Show password'}
            >
              {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {newPassword.length > 0 && (
            <p className={`mt-1 text-[10px] ${isPasswordLongEnough ? 'text-emerald-400' : 'text-amber-400'}`}>
              {isPasswordLongEnough ? '✓ Minimum 8 characters met' : 'Password must be at least 8 characters'}
            </p>
          )}
        </div>

        {/* Confirm New Password */}
        <div>
          <label 
            htmlFor="recover-confirm-new-password" 
            className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider"
          >
            Confirm New Password
          </label>
          <div className="relative group">
            <Lock className="w-4 h-4 text-slate-400 group-focus-within:text-blue-400 absolute left-4 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
            <input
              id="recover-confirm-new-password"
              name="confirmNewPassword"
              type={showConfirmNewPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={confirmNewPassword}
              onChange={(e) => {
                setConfirmNewPassword(e.target.value);
                if (errorMessage) setErrorMessage('');
              }}
              placeholder="Re-enter your new password"
              disabled={isLoading}
              className="w-full pl-11 pr-12 py-3 rounded-2xl bg-[#0b1120] border border-slate-700/80 text-white placeholder-slate-500 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all shadow-inner disabled:opacity-50"
            />
            <button
              type="button"
              id="toggle-recover-confirm-password-visibility"
              onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              title={showConfirmNewPassword ? 'Hide password' : 'Show password'}
              aria-label={showConfirmNewPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {confirmNewPassword.length > 0 && (
            <p className={`mt-1 text-[10px] ${passwordsMatch ? 'text-emerald-400' : 'text-rose-400'}`}>
              {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          id="recover-submit-button"
          disabled={isLoading || (newPassword.length > 0 && newPassword.length < 8) || (confirmNewPassword.length > 0 && !passwordsMatch)}
          className="w-full mt-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm tracking-wide transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Verifying Key & Resetting...</span>
            </>
          ) : (
            <>
              <span>Reset Password & Regain Access</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Return to login */}
      <div className="pt-4 border-t border-slate-800/80 text-center text-xs text-slate-400">
        Remember your password?{' '}
        <button
          type="button"
          id="return-to-login-link"
          onClick={() => onSwitchMode?.('login')}
          className="font-bold text-blue-400 hover:text-blue-300 hover:underline cursor-pointer transition-colors"
        >
          Return to Sign In
        </button>
      </div>
    </div>
  );
};

// =========================================================================
// 4. GLOBAL AUTH MODAL
// =========================================================================
export const AuthModal = ({ isOpen, onClose, onNavigate, defaultMode = 'login' }) => {
  const [mode, setMode] = useState(defaultMode);

  useEffect(() => {
    if (defaultMode) setMode(defaultMode);
  }, [defaultMode, isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      id="marketzo-auth-modal"
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-[#040711]/85 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      {/* Outer ambient glow */}
      <div className="relative w-full max-w-md my-8">
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-amber-500/20 blur-xl opacity-75 pointer-events-none" />

        <div className="relative bg-[#080d1a] border border-slate-700/60 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-white max-h-[92vh] overflow-y-auto scrollbar-none">
          {/* Close button */}
          <button
            type="button"
            id="close-auth-modal-button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close authentication modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Logo Brand Header */}
          <div className="flex flex-col items-center text-center">
            <MarketzoLogo size="lg" showTagline={true} light={true} />
          </div>

          {/* Render Active Form */}
          {mode === 'login' && (
            <LoginForm
              onNavigate={onNavigate}
              onSwitchMode={(newMode) => setMode(newMode)}
              onSuccess={() => onClose()}
              isModal={true}
            />
          )}

          {mode === 'register' && (
            <RegisterForm
              onNavigate={onNavigate}
              onSwitchMode={(newMode) => setMode(newMode)}
              onSuccess={() => onClose()}
            />
          )}

          {mode === 'forgot' && (
            <ForgotPasswordForm
              onNavigate={onNavigate}
              onSwitchMode={(newMode) => setMode(newMode)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// 5. DEDICATED FULL-PAGE AUTH CONTAINER (FOR /login, /register, etc.)
// =========================================================================
const AuthPageContainer = ({ children, onNavigate }) => {
  return (
    <div className="min-h-[85vh] bg-[#060913] text-white flex flex-col justify-center items-center px-4 py-10 sm:py-16 relative overflow-hidden">
      {/* Dynamic ambient lights */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Back to Marketplace pill */}
      <div className="mb-6 z-10">
        <button
          type="button"
          onClick={() => onNavigate?.('home')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-bold transition-all shadow-sm cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-blue-400" />
          <span>Back to Marketplace</span>
        </button>
      </div>

      {/* Card wrapper */}
      <div className="w-full max-w-md relative z-10">
        <div className="relative bg-[#080d1a] border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80 space-y-6">
          <div className="flex flex-col items-center text-center">
            <MarketzoLogo size="lg" showTagline={true} light={true} />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

// Dedicated Page: /login
export const LoginPage = ({ onNavigate }) => {
  return (
    <AuthPageContainer onNavigate={onNavigate}>
      <LoginForm
        onNavigate={onNavigate}
        onSwitchMode={(newMode) => {
          if (newMode === 'register') onNavigate('register');
          else if (newMode === 'forgot') onNavigate('forgot-password');
        }}
      />
    </AuthPageContainer>
  );
};

// Dedicated Page: /register
export const RegisterPage = ({ onNavigate }) => {
  return (
    <AuthPageContainer onNavigate={onNavigate}>
      <RegisterForm
        onNavigate={onNavigate}
        onSwitchMode={(newMode) => {
          if (newMode === 'login') onNavigate('login');
          else if (newMode === 'forgot') onNavigate('forgot-password');
        }}
      />
    </AuthPageContainer>
  );
};

// Dedicated Page: /forgot-password
export const ForgotPasswordPage = ({ onNavigate }) => {
  return (
    <AuthPageContainer onNavigate={onNavigate}>
      <ForgotPasswordForm
        onNavigate={onNavigate}
        onSwitchMode={(newMode) => {
          if (newMode === 'login') onNavigate('login');
          else if (newMode === 'register') onNavigate('register');
        }}
      />
    </AuthPageContainer>
  );
};
