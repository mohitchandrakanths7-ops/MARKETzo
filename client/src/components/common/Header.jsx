import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  ShoppingCart, 
  Heart, 
  User, 
  MapPin, 
  ChevronDown, 
  Store, 
  ShieldCheck, 
  Menu, 
  X, 
  Bell, 
  LogOut, 
  Package, 
  SlidersHorizontal,
  Sparkles,
  CheckCircle,
  Tag,
  Camera
} from 'lucide-react';
import { MarketzoLogo } from './MarketzoLogo';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCurrency } from '../../context/CurrencyContext';
import { api } from '../../services/api';
import { AiShoppingAssistant } from '../ai/AiShoppingAssistant';
import { VisualSearchModal } from '../search/VisualSearchModal';

export const Header = ({ onNavigate, currentRoute, onOpenAuthModal }) => {
  const { user, seller, isAuthenticated, isSeller, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { 
    currentCurrency, 
    activeCurrencyInfo, 
    isAuto, 
    currencies, 
    setCurrency, 
    setAutoDetection 
  } = useCurrency();

  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [suggestions, setSuggestions] = useState({ products: [], categories: [], brands: [] });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState(['Wireless Headphones', 'OLED Laptop', 'Merino Wool', 'Espresso Machine']);
  const searchRef = useRef(null);
  const currencyRef = useRef(null);

  // Currency Dropdown
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);

  // Categories & location state
  const [categories, setCategories] = useState([]);
  const [showCatMenu, setShowCatMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [locationPincode, setLocationPincode] = useState('94102');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [tempPincode, setTempPincode] = useState('');

  // AI Assistant & Visual Search modals
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [showVisualSearchModal, setShowVisualSearchModal] = useState(false);

  // Fetch categories & notifications
  useEffect(() => {
    api.getCategories().then(res => {
      if (res.success) setCategories(res.categories || []);
    }).catch(() => {});

    if (isAuthenticated) {
      api.getNotifications().then(res => {
        if (res.success) {
          setNotifications(res.notifications || []);
          setUnreadNotifs(res.unreadCount || 0);
        }
      }).catch(() => {});
    }
  }, [isAuthenticated]);

  // Debounced search suggestions
  useEffect(() => {
    if (!searchTerm.trim() || searchTerm.length < 2) {
      setSuggestions({ products: [], categories: [], brands: [] });
      return;
    }

    const timer = setTimeout(() => {
      api.getSuggestions(searchTerm).then(res => {
        if (res.success) setSuggestions(res.suggestions);
      }).catch(() => {});
    }, 200);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Click outside to dismiss suggestions & currency dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
      if (currencyRef.current && !currencyRef.current.contains(e.target)) {
        setShowCurrencyDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    if (!searchTerm.trim()) return;
    
    // Save to recent searches
    if (!recentSearches.includes(searchTerm)) {
      setRecentSearches(prev => [searchTerm, ...prev.slice(0, 4)]);
    }
    setShowSuggestions(false);
    onNavigate('products', { search: searchTerm, category: selectedCat !== 'all' ? selectedCat : undefined });
  };

  const handleSelectSuggestion = (item, type) => {
    setShowSuggestions(false);
    if (type === 'product') {
      onNavigate('product-detail', { id: item.id || item.slug });
    } else if (type === 'category') {
      onNavigate('products', { category: item.slug || item.id });
    } else {
      setSearchTerm(item.name);
      onNavigate('products', { search: item.name });
    }
  };

  const handleApplyPincode = () => {
    if (tempPincode.trim()) {
      setLocationPincode(tempPincode.trim());
      setShowLocationModal(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900 text-white shadow-md border-b border-slate-800">
      {/* Top micro bar for announcements & currency selector */}
      <div className="bg-slate-950 px-3 sm:px-4 py-1.5 text-xs text-slate-300 border-b border-slate-800/80 flex items-center justify-between gap-2 overflow-hidden">
        <div className="flex items-center gap-2 sm:gap-4 truncate">
          <span className="flex items-center gap-1.5 font-medium text-amber-400 truncate text-[11px] sm:text-xs">
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Summer Sale: Extra 25% Off with code <strong>SUMMER25</strong></span>
          </span>
          <span className="hidden lg:inline-block text-slate-600">|</span>
          <span className="hidden lg:inline-block text-slate-400 truncate">
            100% Genuine Products • 2-Day Express Shipping • Buyer Protection
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 text-xs shrink-0">
          
          {/* Currency / Location Selector Dropdown */}
          <div className="relative" ref={currencyRef}>
            <button
              onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 text-[11px] sm:text-xs font-bold transition-all cursor-pointer shadow-xs"
              title="Select Marketplace Currency"
            >
              <span className="text-sm">{activeCurrencyInfo?.flag}</span>
              <span className="hidden min-[400px]:inline">{currentCurrency}</span>
              <span className="text-amber-400 font-bold">{activeCurrencyInfo?.symbol}</span>
              {isAuto && (
                <span className="hidden sm:inline-block text-[9px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-extrabold border border-emerald-500/30">
                  AUTO
                </span>
              )}
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showCurrencyDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 text-slate-800 animate-in fade-in zoom-in-95">
                <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="font-extrabold text-xs text-slate-900">Regional Currency</div>
                    <div className="text-[10px] text-slate-500">Auto-detected from your location</div>
                  </div>
                  {isAuto ? (
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-full">
                      ACTIVE AUTO
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setAutoDetection();
                        setShowCurrencyDropdown(false);
                      }}
                      className="text-[11px] text-indigo-600 hover:underline font-bold cursor-pointer"
                    >
                      Reset to Auto
                    </button>
                  )}
                </div>

                <div className="max-h-64 overflow-y-auto divide-y divide-slate-50 py-1">
                  {currencies.map(c => {
                    const isSelected = currentCurrency === c.code;
                    return (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => {
                          setCurrency(c.code);
                          setShowCurrencyDropdown(false);
                        }}
                        className={`w-full px-4 py-2.5 text-left flex items-center justify-between text-xs hover:bg-slate-50 transition-colors cursor-pointer ${
                          isSelected ? 'bg-indigo-50/80 font-black text-indigo-600' : 'text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg shrink-0">{c.flag}</span>
                          <div>
                            <div className="font-bold flex items-center gap-1.5">
                              <span>{c.code}</span>
                              <span className="text-indigo-600 font-extrabold">({c.symbol})</span>
                            </div>
                            <div className="text-[10px] text-slate-400">{c.name}</div>
                          </div>
                        </div>
                        {isSelected && (
                          <CheckCircle className="w-4 h-4 text-indigo-600" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Quick links to seller / admin */}
          <button
            onClick={() => onNavigate('seller')}
            className="hidden sm:flex items-center gap-1.5 text-indigo-300 hover:text-white transition-colors cursor-pointer"
          >
            <Store className="w-3.5 h-3.5" />
            <span>{isSeller ? 'Seller Portal' : 'Sell on Marketzo'}</span>
          </button>
          
          {isAdmin && (
            <button
              onClick={() => onNavigate('admin')}
              className="hidden sm:flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-2 sm:gap-4 lg:gap-8">
          
          {/* Mobile Hamburger Button & Logo + GAMING ZONE Selector */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <button
              onClick={() => setShowMobileNav(true)}
              className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Top-Level MARKETZO & GAMING ZONE Navigation */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => onNavigate('home')}
                className={`p-1 rounded-xl transition-all cursor-pointer flex items-center ${
                  currentRoute === 'home'
                    ? 'ring-2 ring-indigo-500/40 bg-slate-800/40'
                    : 'opacity-90 hover:opacity-100 hover:bg-slate-800/30'
                }`}
                title="MARKETZO Main Marketplace"
              >
                <MarketzoLogo showTagline={false} light={true} />
              </button>

              <div className="h-6 w-px bg-slate-700/80 hidden xs:block" />

              {/* 🎮 GAMING ZONE Top-Level Destination Button */}
              <button
                type="button"
                onClick={() => onNavigate('gaming')}
                className={`group relative flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl font-black text-xs sm:text-xs transition-all duration-300 cursor-pointer border shadow-xs ${
                  currentRoute === 'gaming'
                    ? 'bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-950 text-white border-purple-500 shadow-[0_0_18px_rgba(168,85,247,0.45)] ring-1 ring-purple-400'
                    : 'bg-slate-950/70 text-purple-300 border-purple-900/60 hover:border-purple-400 hover:text-white hover:bg-slate-900 hover:shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                }`}
                title="Open Dedicated Gaming Zone"
              >
                <span className="text-sm sm:text-base animate-pulse">🎮</span>
                <span className="tracking-wider uppercase font-black bg-gradient-to-r from-purple-300 via-indigo-200 to-cyan-300 bg-clip-text text-transparent group-hover:from-purple-200 group-hover:to-cyan-200">
                  GAMING ZONE
                </span>
                <span className="hidden md:inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  PRO
                </span>
              </button>
            </div>
          </div>

          {/* Location Delivery Selector (Desktop) */}
          <button
            onClick={() => setShowLocationModal(true)}
            className="hidden xl:flex items-center gap-2 p-2 rounded-xl hover:bg-slate-800/80 border border-transparent hover:border-slate-700 text-left text-xs text-slate-300 transition-all shrink-0"
          >
            <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Deliver to</div>
              <div className="font-semibold text-white truncate max-w-[110px]">San Francisco {locationPincode}</div>
            </div>
          </button>

          {/* Desktop Search Bar with live autocomplete */}
          <div ref={searchRef} className="hidden md:block flex-1 relative max-w-2xl">
            <form onSubmit={handleSearchSubmit} className="flex items-center rounded-xl bg-white text-slate-900 overflow-hidden shadow-inner border-2 border-transparent focus-within:border-indigo-500 transition-all">
              
              {/* Category dropdown prefix */}
              <div className="relative hidden lg:block bg-slate-100 border-r border-slate-200">
                <select
                  value={selectedCat}
                  onChange={(e) => setSelectedCat(e.target.value)}
                  className="bg-transparent text-xs font-semibold py-2.5 pl-3 pr-7 appearance-none cursor-pointer text-slate-700 outline-none"
                >
                  <option value="all">All Departments</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.slug || cat.id}>{cat.name}</option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Input field */}
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Search products, brands, categories, or tell MARKETZO what you need..."
                className="w-full py-2.5 px-3.5 text-sm bg-transparent text-slate-900 outline-none placeholder:text-slate-400"
              />

              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="p-1 text-slate-400 hover:text-slate-600 mr-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Visual Search Trigger */}
              <button
                type="button"
                onClick={() => setShowVisualSearchModal(true)}
                title="Search with Image / Camera"
                className="p-2 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
              >
                <Camera className="w-4 h-4" />
              </button>

              {/* AI Find Products Trigger */}
              <button
                type="button"
                onClick={() => setShowAiAssistant(true)}
                title="Ask MARKETZO AI"
                className="px-2.5 py-1 text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shrink-0 mr-1.5 cursor-pointer border border-amber-200"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden xl:inline">AI Find</span>
              </button>

              {/* Search Submit Button */}
              <button
                type="submit"
                className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white px-5 py-3 transition-all flex items-center justify-center shrink-0 cursor-pointer"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>

            {/* Instant Search Suggestions Floating Panel */}
            {showSuggestions && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                
                {/* When query is empty, show recent searches */}
                {!searchTerm.trim() && recentSearches.length > 0 && (
                  <div className="p-3 border-b border-slate-100">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Recent Searches</div>
                    <div className="flex flex-wrap gap-1.5">
                      {recentSearches.map((term, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            setSearchTerm(term);
                            onNavigate('products', { search: term });
                            setShowSuggestions(false);
                          }}
                          className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 rounded-lg transition-colors"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Live Products Matches */}
                {suggestions.products?.length > 0 && (
                  <div className="p-2 border-b border-slate-100">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">Products</div>
                    {suggestions.products.map(p => (
                      <div
                        key={p.id}
                        onClick={() => handleSelectSuggestion(p, 'product')}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        <img src={p.image} alt={p.name} className="w-9 h-9 object-cover rounded-lg bg-slate-100 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-slate-800 truncate">{p.name}</div>
                          <div className="text-xs font-bold text-indigo-600">${p.price?.toFixed(2)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Categories & Brands Matches */}
                {(suggestions.categories?.length > 0 || suggestions.brands?.length > 0) && (
                  <div className="p-2 bg-slate-50 flex flex-col gap-1">
                    {suggestions.categories?.map(c => (
                      <div
                        key={c.id}
                        onClick={() => handleSelectSuggestion(c, 'category')}
                        className="flex items-center justify-between px-3 py-1.5 rounded-lg hover:bg-white text-xs font-medium text-slate-700 cursor-pointer"
                      >
                        <span>In Category: <strong>{c.name}</strong></span>
                        <Tag className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Action Badges */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">

            {/* AI Shopping Assistant Button */}
            <button
              onClick={() => setShowAiAssistant(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400/20 to-indigo-500/20 hover:from-amber-400/30 hover:to-indigo-500/30 border border-amber-400/40 text-amber-300 hover:text-amber-200 font-bold text-xs transition-all shadow-xs cursor-pointer"
              title="AI Shopping Assistant"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
              <span>AI Guide</span>
            </button>
            
            {/* Notifications Dropdown */}
            {isAuthenticated && (
              <div className="relative">
                <button
                  onClick={() => setShowNotifs(!showNotifs)}
                  className="relative p-2.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  {unreadNotifs > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                      {unreadNotifs}
                    </span>
                  )}
                </button>

                {showNotifs && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50">
                    <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                      <span className="font-bold text-xs uppercase tracking-wider text-slate-700">Notifications</span>
                      <button
                        onClick={async () => {
                          await api.markAllNotificationsRead();
                          setUnreadNotifs(0);
                          setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                        }}
                        className="text-xs text-indigo-600 hover:underline font-semibold"
                      >
                        Mark all read
                      </button>
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-400">No new notifications</div>
                      ) : (
                        notifications.map(n => (
                          <div
                            key={n.id}
                            onClick={() => {
                              api.markNotificationRead(n.id);
                              setShowNotifs(false);
                              if (n.link) onNavigate(n.link.replace('/', ''));
                            }}
                            className={`p-3 text-left hover:bg-slate-50 cursor-pointer ${!n.read ? 'bg-indigo-50/50' : ''}`}
                          >
                            <div className="text-xs font-bold text-slate-800">{n.title}</div>
                            <div className="text-xs text-slate-600 mt-0.5">{n.message}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Wishlist Icon */}
            <button
              onClick={() => onNavigate('wishlist')}
              className="relative p-2.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Icon & Count */}
            <button
              onClick={() => onNavigate('cart')}
              className="relative flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600/90 hover:bg-indigo-600 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-900/30"
              title="View Cart"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </div>
              <span className="hidden md:inline-block font-bold">Cart</span>
            </button>

            {/* User Account / Login Button */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl hover:bg-slate-800 text-left transition-colors"
                >
                  <img
                    src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'User')}`}
                    alt={user?.name}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'User')}`;
                    }}
                    className="w-8 h-8 rounded-full border border-indigo-400/40 object-cover"
                  />
                  <div className="hidden lg:block">
                    <div className="text-[10px] text-slate-400 leading-none">Hello,</div>
                    <div className="text-xs font-bold text-white truncate max-w-[90px] leading-tight">{user?.name.split(' ')[0]}</div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Account dropdown */}
                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="p-3 bg-slate-50 border-b border-slate-100">
                      <div className="text-xs font-bold text-slate-800 truncate">{user?.name}</div>
                      <div className="text-[11px] text-slate-500 truncate">{user?.email}</div>
                      <div className="mt-1 inline-block px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        {user?.role} Account
                      </div>
                    </div>

                    <div className="p-1.5 text-xs font-medium">
                      <button
                        onClick={() => { setShowUserMenu(false); onNavigate('account', { tab: 'profile' }); }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-50 text-left"
                      >
                        <User className="w-4 h-4 text-slate-500" />
                        <span>My Profile</span>
                      </button>

                      <button
                        onClick={() => { setShowUserMenu(false); onNavigate('account', { tab: 'orders' }); }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-50 text-left"
                      >
                        <Package className="w-4 h-4 text-slate-500" />
                        <span>My Orders & Live Tracking</span>
                      </button>

                      <button
                        onClick={() => { setShowUserMenu(false); onNavigate('account', { tab: 'addresses' }); }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-50 text-left"
                      >
                        <MapPin className="w-4 h-4 text-slate-500" />
                        <span>Saved Addresses</span>
                      </button>

                      {isSeller && (
                        <button
                          onClick={() => { setShowUserMenu(false); onNavigate('seller'); }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-indigo-50 text-indigo-600 font-semibold text-left"
                        >
                          <Store className="w-4 h-4" />
                          <span>Seller Dashboard</span>
                        </button>
                      )}

                      {isAdmin && (
                        <button
                          onClick={() => { setShowUserMenu(false); onNavigate('admin'); }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-emerald-50 text-emerald-700 font-semibold text-left"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>Admin Control Center</span>
                        </button>
                      )}
                    </div>

                    <div className="p-1.5 border-t border-slate-100 bg-slate-50">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-rose-50 text-rose-600 text-xs font-semibold text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-semibold transition-all shadow-sm cursor-pointer"
              >
                <User className="w-4 h-4 text-indigo-400" />
                <span className="hidden min-[480px]:inline">Sign In</span>
              </button>
            )}
          </div>
        </div>

        {/* Dedicated Full-Width Mobile Search Bar (< md screens) */}
        <div className="md:hidden pb-3 pt-1">
          <form onSubmit={handleSearchSubmit} className="flex items-center rounded-xl bg-white text-slate-900 overflow-hidden shadow-md border border-slate-700/50 focus-within:border-indigo-500">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Search products, brands, or tell MARKETZO what you need..."
              className="w-full py-2.5 px-3 text-xs bg-transparent text-slate-900 outline-none placeholder:text-slate-400"
            />
            {searchTerm && (
              <button type="button" onClick={() => setSearchTerm('')} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowAiAssistant(true)}
              title="Ask MARKETZO AI"
              className="p-1.5 text-amber-500 hover:text-amber-600"
            >
              <Sparkles className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setShowVisualSearchModal(true)}
              title="Search with Camera"
              className="p-2 text-slate-400 hover:text-indigo-600"
            >
              <Camera className="w-4 h-4" />
            </button>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2.5 flex items-center justify-center shrink-0 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Main & Categories secondary nav strip */}
      <div className="bg-slate-800/95 backdrop-blur-md px-3 sm:px-6 lg:px-8 border-t border-slate-700/60 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto flex items-center gap-1.5 py-1.5 text-xs text-slate-300 font-medium whitespace-nowrap">
          <button
            onClick={() => onNavigate('home')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors shrink-0 cursor-pointer ${
              currentRoute === 'home' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-200 hover:bg-slate-700'
            }`}
          >
            Home
          </button>

          <button
            onClick={() => onNavigate('products', {})}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-700 text-slate-200 hover:text-white font-semibold transition-colors shrink-0 cursor-pointer"
          >
            <Menu className="w-3.5 h-3.5 text-indigo-400" />
            <span>Categories</span>
          </button>

          <button
            onClick={() => onNavigate('products', { hotDeals: 'true' })}
            className="px-3 py-1.5 rounded-lg text-amber-400 hover:bg-slate-700 font-bold flex items-center gap-1 shrink-0 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Deals</span>
          </button>

          <button
            onClick={() => {
              if (currentRoute === 'home') {
                const el = document.getElementById('trusted-sellers-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              } else {
                onNavigate('home');
              }
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-slate-200 hover:bg-slate-700 hover:text-white font-semibold transition-colors shrink-0 cursor-pointer"
          >
            <Store className="w-3.5 h-3.5 text-emerald-400" />
            <span>Stores</span>
          </button>

          <button
            onClick={() => {
              if (currentRoute === 'home') {
                const el = document.getElementById('wholesale-zone-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              } else {
                onNavigate('products', { wholesale: 'true' });
              }
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-slate-200 hover:bg-slate-700 hover:text-white font-semibold transition-colors shrink-0 cursor-pointer"
          >
            <Package className="w-3.5 h-3.5 text-cyan-400" />
            <span>Wholesale</span>
          </button>

          <button
            onClick={() => onNavigate('gaming')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-black transition-all shrink-0 cursor-pointer ${
              currentRoute === 'gaming'
                ? 'bg-purple-900 text-purple-200 ring-1 ring-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                : 'text-purple-300 hover:bg-slate-700 hover:text-purple-100'
            }`}
          >
            <span>🎮</span>
            <span>Gaming Zone</span>
          </button>

          <div className="h-4 w-px bg-slate-700 mx-1 shrink-0" />

          {categories.slice(0, 8).map(cat => (
            <button
              key={cat.id}
              onClick={() => onNavigate('products', { category: cat.slug || cat.id })}
              className="px-2.5 sm:px-3 py-1.5 rounded-lg hover:bg-slate-700 hover:text-white transition-colors shrink-0 text-slate-300 cursor-pointer"
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Slide-Over Navigation Drawer */}
      {showMobileNav && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div 
            onClick={() => setShowMobileNav(false)}
            className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs transition-opacity animate-in fade-in"
          />

          {/* Drawer content */}
          <div className="relative w-4/5 max-w-xs bg-slate-900 text-white h-full shadow-2xl z-10 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-left duration-300 border-r border-slate-800">
            <div>
              {/* Header */}
              <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
                <MarketzoLogo showTagline={false} light={true} />
                <button
                  onClick={() => setShowMobileNav(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User profile banner in drawer */}
              <div className="p-4 bg-slate-800/50 border-b border-slate-800">
                {isAuthenticated ? (
                  <div className="flex items-center gap-3">
                    <img
                      src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'User')}`}
                      alt={user?.name}
                      className="w-10 h-10 rounded-full border border-indigo-400 object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-sm text-white truncate">{user?.name}</div>
                      <div className="text-[11px] text-slate-400 truncate">{user?.email}</div>
                      <span className="inline-block mt-0.5 px-2 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-extrabold uppercase">
                        {user?.role}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-300">Welcome to MARKETzo!</div>
                    <button
                      onClick={() => {
                        setShowMobileNav(false);
                        onOpenAuthModal();
                      }}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold text-center"
                    >
                      Sign In / Register
                    </button>
                  </div>
                )}
              </div>

              {/* Navigation Links */}
              <div className="p-3 space-y-1 text-xs font-semibold">
                <div className="text-[10px] uppercase font-black text-slate-500 px-3 py-1.5 tracking-wider">
                  Marketplace Portals
                </div>

                <button
                  onClick={() => {
                    setShowMobileNav(false);
                    onNavigate('gaming');
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-purple-950/60 border border-purple-800/80 text-purple-200 font-extrabold text-left shadow-[0_0_12px_rgba(168,85,247,0.25)]"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">🎮</span>
                    <span className="bg-gradient-to-r from-purple-300 to-cyan-300 bg-clip-text text-transparent">GAMING ZONE</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase bg-purple-500/30 text-purple-200">
                    Pro
                  </span>
                </button>

                <button
                  onClick={() => {
                    setShowMobileNav(false);
                    onNavigate('seller');
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 text-amber-300 font-bold text-left transition-colors"
                >
                  <Store className="w-4 h-4 text-amber-400" />
                  <span>{isSeller ? 'Seller Portal Dashboard' : 'Become a Marketzo Merchant'}</span>
                </button>

                {isAdmin && (
                  <button
                    onClick={() => {
                      setShowMobileNav(false);
                      onNavigate('admin');
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 text-emerald-300 font-bold text-left transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Admin Control Center</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setShowMobileNav(false);
                    setShowAiAssistant(true);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 text-indigo-300 text-left transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>AI Shopping Assistant</span>
                </button>

                <div className="text-[10px] uppercase font-black text-slate-500 px-3 pt-3 py-1.5 tracking-wider">
                  Shop Departments
                </div>

                <button
                  onClick={() => {
                    setShowMobileNav(false);
                    onNavigate('products', {});
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-200 text-left"
                >
                  <Menu className="w-4 h-4 text-slate-400" />
                  <span>All Products Catalog</span>
                </button>

                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setShowMobileNav(false);
                      onNavigate('products', { category: cat.slug || cat.id });
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-300 text-left"
                  >
                    <span>{cat.name}</span>
                    {cat.productCount && (
                      <span className="text-[10px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
                        {cat.productCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Footer actions in drawer */}
            {isAuthenticated && (
              <div className="p-4 border-t border-slate-800 bg-slate-950">
                <button
                  onClick={() => {
                    setShowMobileNav(false);
                    logout();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 text-rose-400 hover:bg-rose-950/40 rounded-xl text-xs font-bold transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pincode / Location modal */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Delivery Location</h3>
                  <p className="text-xs text-slate-500">Check real-time stock & delivery speeds for your area</p>
                </div>
              </div>
              <button onClick={() => setShowLocationModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 my-4">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Enter Postal / Zip Code</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tempPincode}
                  onChange={(e) => setTempPincode(e.target.value)}
                  placeholder="e.g. 94102, 10001, 90210"
                  className="flex-1 px-4 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold outline-none focus:border-indigo-600"
                />
                <button
                  onClick={handleApplyPincode}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all"
                >
                  Apply
                </button>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Current destination set to: <strong>San Francisco, CA ({locationPincode})</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* AI Shopping Assistant Widget */}
      <AiShoppingAssistant
        isOpen={showAiAssistant}
        onClose={() => setShowAiAssistant(false)}
        onNavigate={onNavigate}
      />

      {/* Visual Image Search Modal */}
      <VisualSearchModal
        isOpen={showVisualSearchModal}
        onClose={() => setShowVisualSearchModal(false)}
        onNavigate={onNavigate}
      />

    </header>
  );
};
