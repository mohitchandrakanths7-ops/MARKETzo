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
    <header className="hidden md:block sticky top-0 z-40 bg-[#081225] text-[#F8FAFC] shadow-xl border-b border-[rgba(100,149,237,0.22)]">
      {/* Top promotional bar */}
      <div className="bg-[#050B18] px-4 lg:px-8 py-1.5 text-xs text-[#A8B5CC] border-b border-[rgba(100,149,237,0.15)] flex items-center justify-between gap-4">
        {/* Left: Summer Sale Offer */}
        <div className="flex items-center gap-2 font-medium shrink-0">
          <span className="text-amber-400 text-sm">👑</span>
          <span className="text-amber-300 font-semibold flex items-center gap-1.5">
            <span>Summer Sale: Extra 25% Off with code</span>
            <span className="px-2 py-0.5 rounded-md bg-[#702EFF] text-white font-black text-[11px] shadow-sm tracking-wide">
              SUMMER25
            </span>
          </span>
        </div>

        {/* Center: Trust Indicators */}
        <div className="hidden lg:flex items-center gap-3 text-[#A8B5CC] text-[11px] font-medium tracking-wide">
          <span className="flex items-center gap-1.5">
            <span className="text-blue-400">🚚</span>
            <span>100% Genuine Products</span>
          </span>
          <span className="text-slate-700">•</span>
          <span className="flex items-center gap-1.5">
            <span className="text-amber-400">⚡</span>
            <span>2-Day Express Shipping</span>
          </span>
          <span className="text-slate-700">•</span>
          <span className="flex items-center gap-1.5">
            <span className="text-emerald-400">🛡️</span>
            <span>Buyer Protection</span>
          </span>
        </div>

        {/* Right: Currency, Theme & Sell Link */}
        <div className="flex items-center gap-3 shrink-0 text-xs">
          {/* Currency / Location Selector Dropdown */}
          <div className="relative" ref={currencyRef}>
            <button
              onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0B1427] hover:bg-[#101B32] text-slate-200 border border-[rgba(100,149,237,0.3)] text-[11px] font-bold transition-all cursor-pointer shadow-xs"
              title="Select Marketplace Currency"
            >
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>{currentCurrency}</span>
              <span className="text-amber-400 font-black">{activeCurrencyInfo?.symbol || '₹'}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showCurrencyDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-[#0B1427] rounded-2xl shadow-2xl border border-[rgba(100,149,237,0.3)] py-2 z-50 text-slate-100 animate-in fade-in zoom-in-95 backdrop-blur-xl">
                <div className="px-4 py-2.5 border-b border-[rgba(100,149,237,0.15)] flex items-center justify-between">
                  <div>
                    <div className="font-extrabold text-xs text-white">Regional Currency</div>
                    <div className="text-[10px] text-[#A8B5CC]">Indian Rupee (INR) Default</div>
                  </div>
                  {isAuto ? (
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-black rounded-full border border-emerald-500/30">
                      AUTO
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setAutoDetection();
                        setShowCurrencyDropdown(false);
                      }}
                      className="text-[11px] text-blue-400 hover:underline font-bold cursor-pointer"
                    >
                      Reset to Auto
                    </button>
                  )}
                </div>

                <div className="max-h-64 overflow-y-auto divide-y divide-[rgba(100,149,237,0.1)] py-1">
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
                        className={`w-full px-4 py-2.5 text-left flex items-center justify-between text-xs hover:bg-[#101B32] transition-colors cursor-pointer ${
                          isSelected ? 'bg-blue-600/20 font-black text-blue-300 border-l-2 border-blue-500' : 'text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg shrink-0">{c.flag}</span>
                          <div>
                            <div className="font-bold flex items-center gap-1.5">
                              <span>{c.code}</span>
                              <span className="text-blue-400 font-extrabold">({c.symbol})</span>
                            </div>
                            <div className="text-[10px] text-slate-400">{c.name}</div>
                          </div>
                        </div>
                        {isSelected && (
                          <CheckCircle className="w-4 h-4 text-blue-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Theme Icon */}
          <div className="p-1 rounded-lg text-amber-400 hover:text-amber-300 cursor-pointer" title="Marketplace Theme">
            ☀️
          </div>

          {/* Quick link to sell on Marketzo */}
          <button
            onClick={() => onNavigate('seller')}
            className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors cursor-pointer text-xs font-semibold"
          >
            <span>{isSeller ? 'Seller Portal' : 'Sell on Marketzo'}</span>
            <span className="text-blue-400 font-bold">→</span>
          </button>
          
          {isAdmin && (
            <button
              onClick={() => onNavigate('admin')}
              className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer text-xs"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Header Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between gap-4 lg:gap-6">
          
          {/* Left: MARKETZO Brand Logo */}
          <div className="shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="transition-all cursor-pointer flex items-center hover:opacity-95 text-left"
              title="MARKETZO Main Marketplace"
            >
              <MarketzoLogo showTagline={true} light={true} />
            </button>
          </div>

          {/* Center: Search Bar & Distinct AI Find Button */}
          <div className="flex-1 flex items-center gap-3 max-w-3xl">
            {/* Main Rounded Search Bar */}
            <div ref={searchRef} className="flex-1 relative">
              <form
                onSubmit={handleSearchSubmit}
                className="flex items-center rounded-full bg-[#081225] border border-[rgba(100,149,237,0.35)] shadow-inner overflow-hidden focus-within:border-[#2583FF] focus-within:shadow-[0_0_15px_rgba(37,131,255,0.25)] transition-all"
              >
                {/* Search Icon */}
                <div className="pl-4 pr-1 text-slate-400 shrink-0">
                  <Search className="w-4 h-4" />
                </div>

                {/* Input Field */}
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Search for products, brands and more..."
                  className="w-full py-2.5 px-2 text-xs lg:text-sm bg-transparent text-white outline-none placeholder:text-slate-400"
                />

                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="p-1 text-slate-400 hover:text-white mr-1 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                {/* Visual Search Trigger Icon */}
                <button
                  type="button"
                  onClick={() => setShowVisualSearchModal(true)}
                  title="Search with Image / Camera"
                  className="p-2 text-slate-400 hover:text-[#00C8FF] transition-colors cursor-pointer shrink-0"
                >
                  <Camera className="w-4 h-4" />
                </button>

                {/* Category Dropdown Selector inside Search Bar */}
                <div className="relative hidden sm:block bg-[#0B1427] border-l border-[rgba(100,149,237,0.2)]">
                  <select
                    value={selectedCat}
                    onChange={(e) => setSelectedCat(e.target.value)}
                    className="bg-transparent text-xs font-semibold py-2.5 pl-3 pr-7 appearance-none cursor-pointer text-slate-300 hover:text-white outline-none"
                  >
                    <option value="all" className="bg-[#0B1427] text-white">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.slug || cat.id} className="bg-[#0B1427] text-white">
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* Blue-to-Violet Gradient Search Button */}
                <button
                  type="submit"
                  className="bg-gradient-to-r from-[#2583FF] to-[#702EFF] hover:from-[#1d70e0] hover:to-[#5e22db] text-white px-5 py-2.5 transition-all flex items-center justify-center shrink-0 cursor-pointer shadow-md rounded-r-full"
                >
                  <Search className="w-4 h-4" />
                </button>
              </form>

              {/* Instant Search Suggestions Floating Panel */}
              {showSuggestions && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-[#0B1427] text-white rounded-2xl shadow-2xl border border-[rgba(100,149,237,0.3)] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                  {/* When query is empty, show recent searches */}
                  {!searchTerm.trim() && recentSearches.length > 0 && (
                    <div className="p-3 border-b border-[rgba(100,149,237,0.15)]">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Recent Searches</div>
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
                            className="px-2.5 py-1 text-xs bg-[#101B32] hover:bg-[#2583FF]/20 hover:text-[#00C8FF] text-slate-300 rounded-lg transition-colors cursor-pointer border border-white/5"
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Live Products Matches */}
                  {suggestions.products?.length > 0 && (
                    <div className="p-2 border-b border-[rgba(100,149,237,0.15)]">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-2 py-1">Products</div>
                      {suggestions.products.map(p => (
                        <div
                          key={p.id}
                          onClick={() => handleSelectSuggestion(p, 'product')}
                          className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#101B32] cursor-pointer transition-colors"
                        >
                          <img src={p.image} alt={p.name} className="w-9 h-9 object-cover rounded-lg bg-white shrink-0 p-0.5" />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-white truncate">{p.name}</div>
                            <div className="text-xs font-black text-[#00C8FF]">₹{p.price?.toFixed(0)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Categories & Brands Matches */}
                  {(suggestions.categories?.length > 0 || suggestions.brands?.length > 0) && (
                    <div className="p-2 bg-[#081225] flex flex-col gap-1">
                      {suggestions.categories?.map(c => (
                        <div
                          key={c.id}
                          onClick={() => handleSelectSuggestion(c, 'category')}
                          className="flex items-center justify-between px-3 py-1.5 rounded-lg hover:bg-[#101B32] text-xs font-medium text-slate-300 cursor-pointer"
                        >
                          <span>In Category: <strong className="text-white">{c.name}</strong></span>
                          <Tag className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Distinct AI Find Button (Beside Search Bar) */}
            <button
              type="button"
              onClick={() => setShowAiAssistant(true)}
              className="relative group flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-black transition-all duration-300 cursor-pointer shrink-0 border shadow-md"
              style={{
                background: 'linear-gradient(135deg, rgba(11,20,39,0.95) 0%, rgba(16,27,50,0.95) 100%)',
                borderColor: 'rgba(168,85,247,0.5)',
                boxShadow: '0 0 16px rgba(112,46,255,0.25), inset 0 0 10px rgba(168,85,247,0.1)'
              }}
              title="Find Products using AI Assistant"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform" />
              <span className="font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-purple-300 to-cyan-300">
                AI Find
              </span>
              {/* NEW Badge */}
              <span className="absolute -top-1.5 -right-1 px-1.5 py-0.2 rounded-full text-[9px] font-black uppercase bg-[#702EFF] text-white border border-purple-400/40 shadow-xs">
                NEW
              </span>
            </button>
          </div>

          {/* Right: Wishlist, Cart & Sign In / Register */}
          <div className="flex items-center gap-3 lg:gap-4 shrink-0">
            {/* Wishlist Link */}
            <button
              onClick={() => onNavigate('wishlist')}
              className="flex items-center gap-1.5 p-2 rounded-xl text-slate-300 hover:text-white hover:bg-[#101B32] transition-colors cursor-pointer text-xs font-semibold"
              title="View Wishlist"
            >
              <Heart className="w-4 h-4 text-slate-300" />
              <span className="hidden xl:inline">Wishlist</span>
              {wishlistCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-[#702EFF] text-white text-[10px] font-black">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart with Live Item Count Badge */}
            <button
              onClick={() => onNavigate('cart')}
              className="relative flex items-center gap-2 p-2 rounded-xl text-slate-300 hover:text-white hover:bg-[#101B32] transition-colors cursor-pointer text-xs font-semibold"
              title="View Cart"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5 text-white" />
                <span className="absolute -top-2 -right-2.5 w-4 h-4 rounded-full bg-[#702EFF] text-white text-[10px] font-black flex items-center justify-center shadow-[0_0_8px_rgba(112,46,255,0.6)]">
                  {itemCount}
                </span>
              </div>
              <span className="hidden xl:inline">Cart</span>
            </button>

            {/* Sign In / Register Button or User Profile */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0B1427] hover:bg-[#101B32] border border-[rgba(100,149,237,0.3)] transition-all cursor-pointer text-left"
                >
                  <img
                    src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'User')}`}
                    alt={user?.name}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'User')}`;
                    }}
                    className="w-7 h-7 rounded-full border border-blue-400 object-cover"
                  />
                  <span className="text-xs font-bold text-white max-w-[90px] truncate">
                    {(user?.username || user?.name || 'User').split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-[#0B1427] text-white rounded-2xl shadow-2xl border border-[rgba(100,149,237,0.3)] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 backdrop-blur-xl">
                    <div className="p-3 bg-[#081225] border-b border-[rgba(100,149,237,0.15)]">
                      <div className="text-xs font-bold text-white truncate">@{user?.username || user?.name}</div>
                      <div className="mt-1 inline-block px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded-full text-[10px] font-bold uppercase tracking-wider border border-blue-500/30">
                        {user?.role} Account
                      </div>
                    </div>

                    <div className="p-1.5 text-xs font-medium space-y-0.5">
                      <button
                        onClick={() => { setShowUserMenu(false); onNavigate('account', { tab: 'profile' }); }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#101B32] text-slate-200 hover:text-white text-left cursor-pointer"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        <span>My Profile</span>
                      </button>

                      <button
                        onClick={() => { setShowUserMenu(false); onNavigate('account', { tab: 'orders' }); }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#101B32] text-slate-200 hover:text-white text-left cursor-pointer"
                      >
                        <Package className="w-4 h-4 text-slate-400" />
                        <span>My Orders</span>
                      </button>

                      <button
                        onClick={() => { setShowUserMenu(false); onNavigate('account', { tab: 'addresses' }); }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#101B32] text-slate-200 hover:text-white text-left cursor-pointer"
                      >
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span>Saved Addresses</span>
                      </button>

                      {isSeller && (
                        <button
                          onClick={() => { setShowUserMenu(false); onNavigate('seller'); }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-blue-600/20 text-blue-300 font-semibold text-left cursor-pointer"
                        >
                          <Store className="w-4 h-4" />
                          <span>Seller Dashboard</span>
                        </button>
                      )}

                      {isAdmin && (
                        <button
                          onClick={() => { setShowUserMenu(false); onNavigate('admin'); }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-emerald-600/20 text-emerald-300 font-semibold text-left cursor-pointer"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>Admin Control</span>
                        </button>
                      )}
                    </div>

                    <div className="p-1.5 border-t border-[rgba(100,149,237,0.15)] bg-[#081225]">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-rose-500/20 text-rose-300 text-xs font-semibold text-left cursor-pointer"
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
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#0B1427] hover:bg-[#101B32] border border-[rgba(100,149,237,0.4)] text-white text-xs font-black transition-all shadow-sm hover:border-blue-400 cursor-pointer"
              >
                <User className="w-4 h-4 text-[#2583FF]" />
                <span>Sign In / Register</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Secondary Navigation Strip */}
      <div className="bg-[#050B18] px-4 sm:px-6 lg:px-8 border-t border-[rgba(100,149,237,0.18)]">
        <div className="max-w-7xl mx-auto flex items-center gap-2 py-2 text-xs text-[#A8B5CC] font-semibold whitespace-nowrap overflow-x-auto no-scrollbar">
          
          {/* All Categories Button */}
          <button
            onClick={() => onNavigate('products', {})}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#00C8FF]/50 text-white hover:bg-[#00C8FF]/10 text-xs font-black transition-all shrink-0 cursor-pointer shadow-[0_0_12px_rgba(0,200,255,0.15)]"
          >
            <Menu className="w-3.5 h-3.5 text-[#00C8FF]" />
            <span>All Categories</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Home Active Pill */}
          <button
            onClick={() => onNavigate('home')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-black text-xs transition-all shrink-0 cursor-pointer ${
              currentRoute === 'home'
                ? 'bg-gradient-to-r from-[#2583FF] to-[#702EFF] text-white shadow-[0_0_15px_rgba(112,46,255,0.4)]'
                : 'text-slate-300 hover:text-white hover:bg-[#101B32]'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>

          {/* Categories */}
          <button
            onClick={() => onNavigate('products', {})}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-[#101B32] text-slate-300 hover:text-white transition-colors shrink-0 cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <span>Categories</span>
          </button>

          {/* Deals */}
          <button
            onClick={() => onNavigate('products', { hotDeals: 'true' })}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-[#101B32] text-amber-400 hover:text-amber-300 font-bold transition-colors shrink-0 cursor-pointer"
          >
            <span>🔥</span>
            <span>Deals</span>
          </button>

          {/* Stores */}
          <button
            onClick={() => {
              if (currentRoute === 'home') {
                const el = document.getElementById('top-stores-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                else onNavigate('products', {});
              } else {
                onNavigate('products', {});
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-[#101B32] text-slate-300 hover:text-white transition-colors shrink-0 cursor-pointer"
          >
            <Store className="w-3.5 h-3.5 text-emerald-400" />
            <span>Stores</span>
          </button>

          {/* Wholesale */}
          <button
            onClick={() => onNavigate('products', { wholesale: 'true' })}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-[#101B32] text-slate-300 hover:text-white transition-colors shrink-0 cursor-pointer"
          >
            <Package className="w-3.5 h-3.5 text-cyan-400" />
            <span>Wholesale</span>
          </button>

          {/* Gaming Zone PRO */}
          <button
            onClick={() => onNavigate('gaming')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-black text-xs transition-all shrink-0 cursor-pointer border ${
              currentRoute === 'gaming'
                ? 'bg-gradient-to-r from-purple-900 to-indigo-900 text-purple-200 border-purple-400/50 shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                : 'bg-purple-950/30 text-purple-300 hover:bg-purple-900/40 border-purple-500/30'
            }`}
          >
            <span>🎮</span>
            <span>Gaming Zone</span>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-[#702EFF] text-white">
              PRO
            </span>
          </button>

          <div className="h-4 w-px bg-white/10 mx-1 shrink-0" />

          {/* Specific Departments matching Screenshot */}
          <button
            onClick={() => onNavigate('products', { category: 'electronics-audio' })}
            className="px-3 py-1.5 rounded-full hover:bg-[#101B32] hover:text-white transition-colors shrink-0 text-slate-300 cursor-pointer"
          >
            Electronics & Audio
          </button>

          <button
            onClick={() => onNavigate('products', { category: 'mobiles-tablets' })}
            className="px-3 py-1.5 rounded-full hover:bg-[#101B32] hover:text-white transition-colors shrink-0 text-slate-300 cursor-pointer"
          >
            Mobiles & Tablets
          </button>

          <button
            onClick={() => onNavigate('products', { category: 'laptops-computers' })}
            className="px-3 py-1.5 rounded-full hover:bg-[#101B32] hover:text-white transition-colors shrink-0 text-slate-300 cursor-pointer"
          >
            Laptops & Computers
          </button>

          <button
            onClick={() => onNavigate('products', { category: 'fashion-apparel' })}
            className="px-3 py-1.5 rounded-full hover:bg-[#101B32] hover:text-white transition-colors shrink-0 text-slate-300 cursor-pointer"
          >
            Fashion & Apparel
          </button>

          <button
            onClick={() => onNavigate('products', { category: 'jewellery-watches' })}
            className="px-3 py-1.5 rounded-full hover:bg-[#101B32] hover:text-white transition-colors shrink-0 text-slate-300 cursor-pointer"
          >
            Jewellery & Watches
          </button>

          <button
            onClick={() => onNavigate('products', {})}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full hover:bg-[#101B32] hover:text-white transition-colors shrink-0 text-slate-400 cursor-pointer"
          >
            <span>More</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
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
