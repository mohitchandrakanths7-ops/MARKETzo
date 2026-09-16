import React, { useState, useEffect } from 'react';
import { ShoppingCart, User, MapPin, Search, X, CheckCircle2, Mic, MicOff, Clock, Tag, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { api } from '../../services/api';

export const MobileHeader = ({ onNavigate, onOpenAuthModal }) => {
  const { user, isAuthenticated } = useAuth();
  const { itemCount } = useCart();
  const [cartAnimate, setCartAnimate] = useState(false);
  
  // Location state
  const [locationPincode, setLocationPincode] = useState(() => {
    return localStorage.getItem('marketzo_pincode') || '94102';
  });
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [tempPincode, setTempPincode] = useState('');

  // Search & voice state
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [suggestions, setSuggestions] = useState({ products: [], categories: [] });
  const [showDropdown, setShowDropdown] = useState(false);
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const stored = localStorage.getItem('marketzo_recent_searches');
      return stored ? JSON.parse(stored) : ['Wireless Headphones', 'Gaming Mouse', 'Smartphones', 'Laptops'];
    } catch {
      return ['Wireless Headphones', 'Gaming Mouse', 'Smartphones'];
    }
  });

  const searchContainerRef = React.useRef(null);
  const recognitionRef = React.useRef(null);

  // Animate cart badge when item count changes
  useEffect(() => {
    if (itemCount > 0) {
      setCartAnimate(true);
      const t = setTimeout(() => setCartAnimate(false), 400);
      return () => clearTimeout(t);
    }
  }, [itemCount]);

  // Debounced live suggestions
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setSuggestions({ products: [], categories: [] });
      return;
    }

    const timer = setTimeout(() => {
      api.getSuggestions(query.trim())
        .then(res => {
          if (res.success && res.suggestions) {
            setSuggestions(res.suggestions);
          }
        })
        .catch(() => {});
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Dismiss dropdown on outside touch
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const saveRecentSearch = (term) => {
    const cleaned = term.trim();
    if (!cleaned) return;
    setRecentSearches(prev => {
      const updated = [cleaned, ...prev.filter(t => t.toLowerCase() !== cleaned.toLowerCase())].slice(0, 6);
      try {
        localStorage.setItem('marketzo_recent_searches', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (query.trim()) {
      saveRecentSearch(query);
      setShowDropdown(false);
      onNavigate('products', { search: query.trim() });
    }
  };

  const handleSelectRecent = (term) => {
    setQuery(term);
    saveRecentSearch(term);
    setShowDropdown(false);
    onNavigate('products', { search: term });
  };

  const handleSelectProduct = (product) => {
    setShowDropdown(false);
    onNavigate('product-detail', { id: product.id || product.slug });
  };

  const handleSelectCategory = (cat) => {
    setShowDropdown(false);
    onNavigate('products', { category: cat.slug || cat.id });
  };

  // Voice Search Handler
  const handleVoiceSearch = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice search is not supported in this browser. Please type in the search bar.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event) => {
        const transcript = Array.from(event.results).map(r => r[0].transcript).join('');
        setQuery(transcript);
        if (event.results[0].isFinal) {
          setIsListening(false);
          saveRecentSearch(transcript);
          setShowDropdown(false);
          onNavigate('products', { search: transcript.trim() });
        }
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Voice search error:', err);
      setIsListening(false);
    }
  };

  const handleApplyPincode = (e) => {
    e.preventDefault();
    if (tempPincode.trim()) {
      const code = tempPincode.trim();
      setLocationPincode(code);
      localStorage.setItem('marketzo_pincode', code);
      setShowLocationModal(false);
      setTempPincode('');
    }
  };

  return (
    <>
      <header
        className="sticky top-0 z-40 px-3.5 pt-3 pb-2.5 bg-[#080c14]/95 backdrop-blur-xl border-b border-white/10 transition-all space-y-2.5 shadow-lg"
        role="banner"
      >
        {/* ROW 1: Logo on Left | Cart & Profile on Right */}
        <div className="flex items-center justify-between">
          
          {/* MARKETZO Brand Logo */}
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 cursor-pointer press-feedback text-left"
            aria-label="Go to MARKETZO home"
          >
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-md"
              style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' }}
            >
              M
            </div>
            <div className="flex flex-col">
              <span className="text-white font-black text-base tracking-tight leading-none">
                MARKET<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">ZO</span>
              </span>
              <span className="text-[9px] font-bold text-slate-400 tracking-widest uppercase">Marketplace</span>
            </div>
          </button>

          {/* Right Action Icons: Cart & Profile */}
          <div className="flex items-center gap-2">
            
            {/* Cart Icon with Live Real Count */}
            <button
              onClick={() => onNavigate('cart')}
              className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-[#111827] hover:bg-[#1f293d] text-slate-200 border border-white/10 cursor-pointer press-feedback transition-colors"
              aria-label={`Cart${itemCount > 0 ? ` (${itemCount} items)` : ''}`}
            >
              <ShoppingCart className="w-4 h-4 text-blue-400" />
              {itemCount > 0 && (
                <span
                  className={`absolute -top-1.5 -right-1.5 text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center shadow-md ${cartAnimate ? 'animate-badge-pop' : ''}`}
                  style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
                >
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </button>

            {/* Profile Avatar / Icon */}
            <button
              onClick={() => isAuthenticated ? onNavigate('account') : onOpenAuthModal?.()}
              className="relative w-9 h-9 flex items-center justify-center rounded-xl overflow-hidden cursor-pointer press-feedback bg-[#111827] hover:bg-[#1f293d] border border-white/10 text-slate-200 transition-colors"
              aria-label="My Account"
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name || 'Profile'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-4 h-4 text-slate-300" />
              )}
            </button>
          </div>
        </div>

        {/* ROW 2: Deliver to Location Selector */}
        <div className="flex items-center justify-between text-[11px]">
          <button
            type="button"
            onClick={() => setShowLocationModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#111827] hover:bg-[#1a233a] text-slate-300 border border-white/10 cursor-pointer press-feedback transition-colors truncate max-w-full"
            title="Change delivery location"
          >
            <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="text-slate-400">Deliver to:</span>
            <span className="font-bold text-white truncate">{locationPincode}</span>
            <span className="text-[10px] text-blue-400 font-semibold ml-0.5">Change</span>
          </button>

          <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            2-Day Express
          </span>
        </div>

        {/* ROW 3: Large Premium Search Field Inspired by Reference */}
        <div ref={searchContainerRef} className="relative">
          <form onSubmit={handleSearchSubmit} className="flex items-center">
            <div className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-[#111827] border border-white/10 focus-within:border-blue-500 focus-within:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all">
              <Search className="w-4 h-4 text-blue-400 shrink-0" />
              
              <input
                id="mobile-search-input"
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                placeholder={isListening ? 'Listening... Speak now...' : 'Search products, brands, gear...'}
                className="flex-1 bg-transparent text-xs font-semibold text-white placeholder:text-slate-500 outline-none"
                aria-label="Search products"
              />

              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setSuggestions({ products: [], categories: [] });
                  }}
                  className="p-1 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Voice Search Button */}
              <button
                type="button"
                onClick={handleVoiceSearch}
                className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                  isListening
                    ? 'bg-rose-600 text-white animate-voice-recording'
                    : 'text-slate-400 hover:text-blue-400 hover:bg-[#1a233a]'
                }`}
                title="Search with Voice"
                aria-label="Voice Search"
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            </div>
          </form>

          {/* Voice Search Listening Alert */}
          {isListening && (
            <div className="mt-2 p-2.5 bg-rose-950/80 border border-rose-800 rounded-xl text-xs font-bold text-rose-300 flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                <span>Listening... Speak your query</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (recognitionRef.current) recognitionRef.current.stop();
                  setIsListening(false);
                }}
                className="text-[11px] underline text-rose-300 font-extrabold cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Autocomplete & Recent Searches Dropdown */}
          {showDropdown && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-[#111827] text-white rounded-2xl shadow-2xl border border-white/10 overflow-hidden z-50 divide-y divide-white/5 animate-in fade-in slide-in-from-top-2">
              
              {/* Recent Searches */}
              {!query.trim() && recentSearches.length > 0 && (
                <div className="p-3 bg-[#0d1322]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>Recent Searches</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setRecentSearches([]);
                        try { localStorage.removeItem('marketzo_recent_searches'); } catch {}
                      }}
                      className="text-[10px] font-bold text-slate-500 hover:text-slate-300"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {recentSearches.map((term, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectRecent(term)}
                        className="px-2.5 py-1 bg-[#1a233a] hover:bg-[#22304e] hover:text-blue-300 border border-white/5 rounded-xl text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Product Matches */}
              {suggestions.products && suggestions.products.length > 0 && (
                <div className="p-2">
                  <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider px-2.5 py-1">
                    Matching Products
                  </div>
                  {suggestions.products.map(product => (
                    <div
                      key={product.id}
                      onClick={() => handleSelectProduct(product)}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#1a233a] cursor-pointer transition-colors"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-9 h-9 object-contain rounded-lg bg-[#0b0f19] p-1 shrink-0 border border-white/5"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-200 truncate">{product.name}</div>
                        <div className="text-xs font-black text-blue-400">${product.price?.toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Category Matches */}
              {suggestions.categories && suggestions.categories.length > 0 && (
                <div className="p-2 bg-[#0d1322]">
                  <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider px-2.5 py-1">
                    Matching Categories
                  </div>
                  {suggestions.categories.map(cat => (
                    <div
                      key={cat.id}
                      onClick={() => handleSelectCategory(cat)}
                      className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#1a233a] text-xs font-bold text-slate-300 cursor-pointer transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5 text-purple-400" />
                        <span>In <strong className="text-white">{cat.name}</strong></span>
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold">View →</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Quick AI Search Trigger */}
              <div
                onClick={() => {
                  setShowDropdown(false);
                  onNavigate('products', { search: query || 'Trending Deals' });
                }}
                className="p-2.5 bg-gradient-to-r from-blue-950/80 to-purple-950/80 text-blue-300 hover:text-white flex items-center justify-between text-xs font-bold cursor-pointer"
              >
                <span className="flex items-center gap-1.5 truncate">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span className="truncate">Search all marketplace for "{query || 'products'}"</span>
                </span>
                <span className="shrink-0 ml-2">→</span>
              </div>

            </div>
          )}
        </div>
      </header>

      {/* Location Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] text-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-white/10 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-blue-950 text-blue-400 border border-blue-800">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-white">Delivery Location</h3>
                  <p className="text-[11px] text-slate-400">Check fast shipping speeds for your pin code</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowLocationModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#1f293d]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplyPincode} className="space-y-3 my-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tempPincode}
                  onChange={(e) => setTempPincode(e.target.value)}
                  placeholder="Enter postal code (e.g. 94102)"
                  className="flex-1 px-3.5 py-2.5 bg-[#0b1120] border border-white/10 rounded-xl text-xs font-semibold text-white outline-none focus:border-blue-500"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer"
                >
                  Apply
                </button>
              </div>
            </form>

            <div className="p-3 bg-[#0b1120] rounded-2xl border border-white/5 text-xs text-slate-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Current location: <strong className="text-white">{locationPincode}</strong></span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
