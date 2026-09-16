import React, { useState, useEffect, useRef } from 'react';
import { Search, Mic, MicOff, X, SlidersHorizontal, ArrowUpDown, Clock, Tag, Sparkles } from 'lucide-react';
import { api } from '../../services/api';

export const MobileSearchBar = ({ onNavigate, onFilterClick, onSortClick }) => {
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [suggestions, setSuggestions] = useState({ products: [], categories: [] });
  const [showDropdown, setShowDropdown] = useState(false);
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const stored = localStorage.getItem('marketzo_recent_searches');
      return stored ? JSON.parse(stored) : ['Headphones', 'Smartphones', 'Laptops', 'Gaming Mouse', 'Coffee'];
    } catch {
      return ['Headphones', 'Smartphones', 'Laptops', 'Gaming Mouse'];
    }
  });

  const searchContainerRef = useRef(null);
  const recognitionRef = useRef(null);

  // Debounced search suggestions from real backend API
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

  // Click outside to dismiss dropdown
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

  const handleSearch = (e) => {
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

  // Voice Search Handler with Web Speech API
  const handleVoiceSearch = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice search is not supported in your current browser. You can type your query in the search bar.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        setQuery(transcript);
        if (event.results[0].isFinal) {
          setIsListening(false);
          saveRecentSearch(transcript);
          setShowDropdown(false);
          onNavigate('products', { search: transcript.trim() });
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Voice recognition error:', err);
      setIsListening(false);
    }
  };

  return (
    <div ref={searchContainerRef} className="px-3 sm:px-4 pb-3 relative animate-fade-in-up">
      {/* Search Input Box */}
      <form onSubmit={handleSearch} className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2.5 px-3.5 py-3 rounded-2xl bg-white border-2 border-slate-200/90 focus-within:border-indigo-600 focus-within:shadow-md transition-all shadow-xs">
          <Search className="w-4 h-4 text-indigo-600 shrink-0" />
          
          <input
            id="mobile-search-input"
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            placeholder={isListening ? 'Listening... Speak now...' : 'Search products, brands, or tech...'}
            className="flex-1 bg-transparent text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none"
            aria-label="Search products"
          />

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setSuggestions({ products: [], categories: [] });
              }}
              className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Voice Search Button */}
          <button
            type="button"
            onClick={handleVoiceSearch}
            className={`p-1.5 rounded-xl transition-all cursor-pointer ${
              isListening
                ? 'bg-rose-500 text-white animate-voice-recording'
                : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-100'
            }`}
            title="Search with Voice"
            aria-label="Voice Search"
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
        </div>

        {/* Submit Search Button */}
        <button
          type="submit"
          className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-2xl transition-all shadow-xs cursor-pointer press-feedback shrink-0 flex items-center justify-center min-w-[48px] min-h-[48px]"
          aria-label="Submit search"
        >
          <Search className="w-4 h-4" />
        </button>
      </form>

      {/* Voice Listening Active Banner */}
      {isListening && (
        <div className="mt-2 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping"></span>
            <span>Listening... Speak your search query</span>
          </div>
          <button
            type="button"
            onClick={() => {
              if (recognitionRef.current) recognitionRef.current.stop();
              setIsListening(false);
            }}
            className="text-[11px] underline text-rose-800 font-extrabold"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Live Suggestions & Recent Searches Dropdown Modal/Panel */}
      {showDropdown && (
        <div className="absolute left-3 right-3 sm:left-4 sm:right-4 top-full mt-1.5 bg-white text-slate-900 rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 divide-y divide-slate-100 animate-in fade-in slide-in-from-top-2">
          
          {/* Recent Searches Header & Pills */}
          {!query.trim() && recentSearches.length > 0 && (
            <div className="p-3.5 bg-slate-50/70">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Recent Searches</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setRecentSearches([]);
                    try { localStorage.removeItem('marketzo_recent_searches'); } catch {}
                  }}
                  className="text-[10px] font-bold text-slate-400 hover:text-slate-700"
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
                    className="px-3 py-1.5 bg-white hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
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
              <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-2.5 py-1">
                Matching Products
              </div>
              {suggestions.products.map(product => (
                <div
                  key={product.id}
                  onClick={() => handleSelectProduct(product)}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-10 h-10 object-contain rounded-lg bg-slate-100 p-1 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">{product.name}</div>
                    <div className="text-xs font-black text-indigo-600">${product.price?.toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Category Matches */}
          {suggestions.categories && suggestions.categories.length > 0 && (
            <div className="p-2 bg-slate-50/50">
              <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-2.5 py-1">
                Matching Categories
              </div>
              {suggestions.categories.map(cat => (
                <div
                  key={cat.id}
                  onClick={() => handleSelectCategory(cat)}
                  className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-white text-xs font-bold text-slate-700 cursor-pointer transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5 text-indigo-500" />
                    <span>In <strong>{cat.name}</strong></span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">View Category →</span>
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
            className="p-3 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 hover:from-indigo-100 flex items-center justify-between text-xs font-bold cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Search all marketplace listings for "{query || 'products'}"</span>
            </span>
            <span>→</span>
          </div>

        </div>
      )}
    </div>
  );
};
