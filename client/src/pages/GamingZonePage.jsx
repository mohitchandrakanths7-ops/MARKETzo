import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Gamepad2,
  Sparkles,
  Zap,
  Flame,
  ShieldCheck,
  Search,
  SlidersHorizontal,
  ArrowRight,
  ArrowLeft,
  ShoppingCart,
  Heart,
  Star,
  CheckCircle,
  Truck,
  RotateCcw,
  Cpu,
  Monitor,
  Headphones,
  Mouse,
  Keyboard,
  Crosshair,
  Radio,
  Share2,
  ThumbsUp,
  X,
  RefreshCw,
  Plus
} from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { ShareProductModal } from '../components/product/ShareProductModal';
import { api } from '../services/api';

export const GamingZonePage = ({ onNavigate }) => {
  const { currentCurrency, formatPrice, exchangeRates } = useCurrency();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { showSuccess, showInfo, showError } = useToast();

  // State
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Filters & Search State
  const [selectedSubCategory, setSelectedSubCategory] = useState('all');
  const [selectedLoadout, setSelectedLoadout] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy] = useState('relevance');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [onlyDeals, setOnlyDeals] = useState(false);
  const [onlyInStock, setOnlyInStock] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Community Setups
  const [communitySetups, setCommunitySetups] = useState([]);
  const [likedSetups, setLikedSetups] = useState({});

  // AI Setup Builder State
  const [aiBudget, setAiBudget] = useState(currentCurrency === 'INR' ? 30000 : 400);
  const [aiStyle, setAiStyle] = useState('FPS');
  const [aiExperience, setAiExperience] = useState('Advanced');
  const [isBuildingAiSetup, setIsBuildingAiSetup] = useState(false);
  const [aiSetupResult, setAiSetupResult] = useState(null);

  // Quick View / Complete Setup Modal
  const [selectedProductForSetup, setSelectedProductForSetup] = useState(null);
  const [shareProduct, setShareProduct] = useState(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch Gaming Products
  const fetchGamingProducts = async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      const res = await api.getGamingProducts({
        subCategory: selectedSubCategory !== 'all' ? selectedSubCategory : undefined,
        loadout: selectedLoadout !== 'all' ? selectedLoadout : undefined,
        search: debouncedSearch.trim() || undefined,
        sort: sortBy,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
        isDeal: onlyDeals || undefined,
        inStock: onlyInStock || undefined,
        limit: 36
      });

      if (res.success) {
        setProducts(res.products || []);
        setTotalProducts(res.total || 0);
      } else {
        setHasError(true);
      }
    } catch (err) {
      console.error('Failed to fetch gaming products:', err);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGamingProducts();
  }, [selectedSubCategory, selectedLoadout, debouncedSearch, sortBy, minPrice, maxPrice, onlyDeals, onlyInStock]);

  // Fetch Community Setups on mount
  useEffect(() => {
    api.getGamingCommunitySetups().then(res => {
      if (res.success) setCommunitySetups(res.setups || []);
    }).catch(() => {});

    // Generate initial AI setup
    handleGenerateAiSetup();
  }, []);

  // Generate AI Setup
  const handleGenerateAiSetup = async () => {
    setIsBuildingAiSetup(true);
    try {
      const currentRate = exchangeRates?.[currentCurrency] || (currentCurrency === 'INR' ? 86.5 : 1);
      const res = await api.buildAiGamingSetup({
        budget: aiBudget,
        style: aiStyle,
        experience: aiExperience,
        currency: currentCurrency,
        exchangeRate: currentRate
      });

      if (res.success && res.setup) {
        setAiSetupResult(res.setup);
      }
    } catch (err) {
      console.error('AI Setup builder error:', err);
    } finally {
      setIsBuildingAiSetup(false);
    }
  };

  // Add Entire AI Setup to Cart
  const handleAddEntireSetup = () => {
    if (!aiSetupResult || !aiSetupResult.items || aiSetupResult.items.length === 0) return;
    aiSetupResult.items.forEach(item => {
      addToCart(item, 1);
    });
    showSuccess(`🔥 Added entire ${aiSetupResult.title} (${aiSetupResult.items.length} items) to your Cart!`);
  };

  // Toggle Like on Community Setup
  const handleToggleLike = (id) => {
    setLikedSetups(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Categories list
  const gamingCategories = [
    { id: 'all', label: '⚡ All Gear', icon: Zap },
    { id: 'mouse', label: '🖱️ Mice', icon: Mouse },
    { id: 'keyboard', label: '⌨️ Keyboards', icon: Keyboard },
    { id: 'headset', label: '🎧 Headsets', icon: Headphones },
    { id: 'controller', label: '🎮 Controllers', icon: Gamepad2 },
    { id: 'monitor', label: '🖥️ Monitors', icon: Monitor },
    { id: 'chair', label: '🪑 Chairs', icon: Cpu },
    { id: 'streaming', label: '🎙️ Streaming', icon: Radio },
    { id: 'rgb', label: '🌈 RGB & Accessories', icon: Sparkles }
  ];

  // Loadouts list
  const loadouts = [
    { id: 'fps', title: '🔫 FPS Dominance', desc: 'Ultra-lightweight mice, 240Hz Fast IPS, rapid trigger magnetic switches', tag: 'Fast-Paced' },
    { id: 'esports', title: '🏆 Tournament Pro', desc: 'Zero-latency wireless peripherals, spatial audio, esports tuning', tag: 'Pro Ranked' },
    { id: 'racing', title: '🏎️ Sim Racing', desc: 'Curved ultrawide immersive displays, tactile feedback controls', tag: 'High Immersion' },
    { id: 'console', title: '🎮 Console Pro', desc: 'Hall Effect zero-drift gamepads, multi-platform 7.1 headsets', tag: 'Cross-Play' },
    { id: 'rpg', title: '🧙 MMO & RPG', desc: 'Programmable multi-macro buttons, high-fidelity soundscapes', tag: 'Epic Worlds' },
    { id: 'streaming', title: '📹 Streamer Rig', desc: '24-bit studio cardioid mics, dynamic RGB desk pads, multi-mounts', tag: 'Broadcast' }
  ];

  // Gamer Deals derived from products
  const gamerDeals = useMemo(() => {
    return products.filter(p => p.discountPercent >= 18 || p.isHotDeal).slice(0, 4);
  }, [products]);

  // Hot with Gamers derived from products
  const hotGamers = useMemo(() => {
    return [...products].sort((a, b) => (b.gamerScore || 90) - (a.gamerScore || 90)).slice(0, 4);
  }, [products]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-purple-600 selection:text-white font-sans antialiased overflow-x-hidden">
      
      {/* 1. TOP GAMING HEADER STRIP & RETURN TO MARKETZO */}
      <div className="bg-slate-900/90 backdrop-blur-md border-b border-purple-900/40 sticky top-0 z-30 px-3 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all border border-slate-700 shadow-xs cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>← Back to MARKETZO</span>
            </button>

            <div className="hidden sm:flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-500/20 text-purple-300 border border-purple-500/40 animate-pulse">
                LIVE DESTINATION
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Verified Hardware • Esports Tuned • 0 Latency
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const el = document.getElementById('ai-setup-builder-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs transition-all shadow-[0_0_15px_rgba(168,85,247,0.4)] cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>🤖 AI Setup Builder</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:py-20 border-b border-purple-950/60 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-950/40 via-slate-950 to-slate-950">
        
        {/* Glow ambient backgrounds */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-12 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Hero Copy */}
            <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-900/40 border border-purple-500/30 text-purple-300 text-xs font-black uppercase tracking-wider shadow-[0_0_20px_rgba(168,85,247,0.25)]">
                <Gamepad2 className="w-4 h-4 text-cyan-400" />
                <span>MARKETZO GAMING ZONE</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white uppercase leading-[1.08]">
                LEVEL UP <br />
                <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(168,85,247,0.3)]">
                  YOUR GAME.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed">
                Discover tournament-grade gaming gear, battle-ready PC setups, magnetic switch keyboards, and low-latency audio engineered exclusively for gamers.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                <button
                  onClick={() => {
                    const el = document.getElementById('gaming-catalog-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-black text-sm uppercase tracking-wider transition-all duration-300 shadow-[0_0_25px_rgba(168,85,247,0.5)] hover:scale-[1.02] cursor-pointer flex items-center gap-2"
                >
                  <Gamepad2 className="w-4 h-4" />
                  <span>EXPLORE GAMING GEAR</span>
                </button>

                <button
                  onClick={() => {
                    const el = document.getElementById('ai-setup-builder-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-6 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-purple-200 hover:text-white font-black text-sm uppercase tracking-wider transition-all duration-300 border border-purple-700/60 shadow-lg cursor-pointer flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>🤖 BUILD MY GAMING SETUP</span>
                </button>
              </div>

              {/* Trust Metric Badges */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-purple-900/30 max-w-md mx-auto lg:mx-0 text-center">
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <div className="text-lg font-black text-cyan-300">240Hz+</div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Tournament Panels</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <div className="text-lg font-black text-purple-300">0.1ms</div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Rapid Actuation</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <div className="text-lg font-black text-emerald-300">99.4%</div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Gamer Satisfaction</div>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden border border-purple-500/30 bg-gradient-to-b from-purple-950/40 via-slate-900 to-slate-950 p-2 shadow-[0_0_40px_rgba(168,85,247,0.3)]">
                <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-900">
                  <img
                    src="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1000&auto=format&fit=crop&q=80"
                    alt="Marketzo Pro Gaming Battlestation"
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

                  {/* Floating feature pill */}
                  <div className="absolute bottom-4 left-4 right-4 p-3 rounded-2xl bg-slate-950/85 backdrop-blur-md border border-purple-500/40 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-black uppercase text-purple-400 tracking-wider">Featured Gear</div>
                      <div className="font-extrabold text-sm text-white truncate">Apex Pro TKL + Viper 26K DPI</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-black border border-emerald-500/30">
                      In Stock
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. GAMING CATEGORY NAVIGATION BAR */}
      <section className="bg-slate-900/80 border-b border-purple-900/30 py-4 sticky top-12 z-20 backdrop-blur-md overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 sm:gap-3 whitespace-nowrap">
            {gamingCategories.map(cat => {
              const Icon = cat.icon;
              const isSelected = selectedSubCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedSubCategory(cat.id);
                    const el = document.getElementById('gaming-catalog-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 shrink-0 cursor-pointer border ${
                    isSelected
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.45)]'
                      : 'bg-slate-950/60 text-slate-300 border-slate-800 hover:border-purple-800 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-purple-400'}`} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. CHOOSE YOUR LOADOUT */}
      <section className="py-12 border-b border-purple-950/40 bg-slate-950 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-cyan-400 tracking-wider mb-1">
                <Crosshair className="w-3.5 h-3.5" />
                <span>Tailored Gear Bundles</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                🎯 CHOOSE YOUR LOADOUT
              </h2>
            </div>

            {selectedLoadout !== 'all' && (
              <button
                onClick={() => setSelectedLoadout('all')}
                className="text-xs font-bold text-purple-400 hover:text-purple-300 underline cursor-pointer"
              >
                Reset Loadout
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {loadouts.map(l => {
              const isSelected = selectedLoadout === l.id;
              return (
                <div
                  key={l.id}
                  onClick={() => {
                    setSelectedLoadout(isSelected ? 'all' : l.id);
                    const el = document.getElementById('gaming-catalog-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`p-4 rounded-2xl cursor-pointer transition-all duration-300 border flex flex-col justify-between ${
                    isSelected
                      ? 'bg-purple-950/80 border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.4)] scale-[1.02]'
                      : 'bg-slate-900/70 border-slate-800/80 hover:border-purple-800/80 hover:bg-slate-900 hover:shadow-lg'
                  }`}
                >
                  <div>
                    <span className="inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 mb-2">
                      {l.tag}
                    </span>
                    <h3 className="font-extrabold text-sm text-white mb-1">{l.title}</h3>
                    <p className="text-[11px] text-slate-400 leading-snug">{l.desc}</p>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[11px] font-bold text-cyan-400">
                    <span>{isSelected ? '✓ Active' : 'Filter Loadout'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 5. GAMER DEALS (🔥 GAMER DEALS) */}
      {gamerDeals.length > 0 && (
        <section className="py-12 border-b border-purple-950/40 bg-gradient-to-b from-slate-950 via-slate-900/40 to-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                    🔥 GAMER DEALS
                  </h2>
                  <p className="text-xs text-slate-400">Limited-time verified discounts on tournament-ready gear</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setOnlyDeals(true);
                  const el = document.getElementById('gaming-catalog-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-xs font-extrabold text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer"
              >
                <span>View All Deals</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {gamerDeals.map(deal => (
                <div
                  key={deal.id}
                  className="bg-slate-900/90 rounded-2xl overflow-hidden border border-slate-800 hover:border-purple-600/80 transition-all duration-300 flex flex-col justify-between group shadow-md"
                >
                  <div className="relative aspect-square bg-slate-950 overflow-hidden">
                    <img
                      src={deal.images?.[0] || deal.image}
                      alt={deal.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-lg bg-rose-600 text-white font-black text-[10px] uppercase shadow-xs">
                      {deal.discountPercent}% OFF
                    </div>
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1 z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShareProduct(deal);
                        }}
                        className="p-1.5 rounded-full bg-slate-900/80 text-slate-300 hover:text-purple-400 transition-colors cursor-pointer"
                        title="Share Deal"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => toggleWishlist(deal)}
                        className="p-1.5 rounded-full bg-slate-900/80 text-slate-300 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Wishlist"
                      >
                        <Heart className={`w-3.5 h-3.5 ${isInWishlist(deal.id) ? 'fill-rose-500 text-rose-500' : ''}`} />
                      </button>
                    </div>
                  </div>

                  <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1 text-[10px] text-amber-400 font-bold mb-1">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{deal.rating || 4.9}</span>
                        <span className="text-slate-500">({deal.reviewCount || 40})</span>
                      </div>
                      <h3 className="font-bold text-xs text-white line-clamp-2 leading-snug group-hover:text-purple-300 transition-colors">
                        {deal.name}
                      </h3>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80">
                      <div className="flex items-baseline gap-1.5 mb-2">
                        <span className="text-base font-black text-white">{formatPrice(deal.price)}</span>
                        {deal.originalPrice && (
                          <span className="text-xs text-slate-500 line-through">{formatPrice(deal.originalPrice)}</span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-rose-400 font-bold mb-2">
                        <span>⚡ Only {deal.stock || 4} left</span>
                        <span className="text-slate-400 font-normal">{deal.sellerName}</span>
                      </div>

                      <button
                        onClick={() => {
                          addToCart(deal, 1);
                          showSuccess(`Added ${deal.name} to your Cart!`);
                        }}
                        className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Add to Cart</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>
      )}

      {/* 6. AI GAMING SETUP BUILDER (🤖 BUILD MY GAMING SETUP) */}
      <section id="ai-setup-builder-section" className="py-14 border-b border-purple-950/60 bg-slate-900/60 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-black uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>MARKETZO AI HARDWARE ENGINE</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              🤖 BUILD MY GAMING SETUP
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Select your budget and competitive playstyle. Our AI engine curates a compatible, high-performance battlestation using verified market inventory.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Setup Configuration Controls */}
            <div className="lg:col-span-4 bg-slate-950 p-6 rounded-3xl border border-purple-900/50 shadow-xl space-y-5">
              <h3 className="font-extrabold text-sm text-white uppercase tracking-wider flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-purple-400" />
                <span>Setup Specifications</span>
              </h3>

              {/* Budget selector */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-2">
                  <span>Target Budget</span>
                  <span className="text-cyan-400 font-extrabold text-sm">{formatPrice(aiBudget)}</span>
                </div>
                <input
                  type="range"
                  min={currentCurrency === 'INR' ? 10000 : 150}
                  max={currentCurrency === 'INR' ? 150000 : 2000}
                  step={currentCurrency === 'INR' ? 5000 : 50}
                  value={aiBudget}
                  onChange={(e) => setAiBudget(parseFloat(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>{formatPrice(currentCurrency === 'INR' ? 10000 : 150)}</span>
                  <span>{formatPrice(currentCurrency === 'INR' ? 150000 : 2000)}</span>
                </div>
              </div>

              {/* Gaming Style */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Gaming Style</label>
                <div className="grid grid-cols-3 gap-2">
                  {['FPS', 'Esports', 'Racing', 'RPG', 'Console', 'Streaming'].map(style => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => setAiStyle(style)}
                      className={`py-2 px-1 rounded-xl text-xs font-black transition-all border text-center ${
                        aiStyle === style
                          ? 'bg-purple-600 text-white border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              {/* Experience tier */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Experience Tier</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Beginner', 'Advanced', 'Pro'].map(exp => (
                    <button
                      key={exp}
                      type="button"
                      onClick={() => setAiExperience(exp)}
                      className={`py-2 px-1 rounded-xl text-xs font-bold transition-all border text-center ${
                        aiExperience === exp
                          ? 'bg-indigo-600 text-white border-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.4)]'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {exp}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleGenerateAiSetup}
                disabled={isBuildingAiSetup}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-black text-xs uppercase tracking-wider transition-all duration-300 shadow-[0_0_20px_rgba(168,85,247,0.4)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isBuildingAiSetup ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Assembling Rig...</span>
                  </>
                ) : (
                  <>
                    <Cpu className="w-4 h-4" />
                    <span>GENERATE BATTLE SETUP</span>
                  </>
                )}
              </button>
            </div>

            {/* Right Assembled Rig Display */}
            <div className="lg:col-span-8 bg-slate-950 p-6 rounded-3xl border border-purple-900/50 shadow-2xl">
              {aiSetupResult ? (
                <div className="space-y-6">
                  
                  {/* Setup Header Summary */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                    <div>
                      <div className="inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 mb-1 border border-emerald-500/30">
                        AI Verified Match
                      </div>
                      <h3 className="text-lg sm:text-xl font-black text-white">{aiSetupResult.title}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{aiSetupResult.verdict}</p>
                    </div>

                    <div className="text-right sm:shrink-0">
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Total Bundle Price</div>
                      <div className="text-2xl font-black text-cyan-300">{formatPrice(aiSetupResult.totalUSD)}</div>
                    </div>
                  </div>

                  {/* Components List */}
                  <div className="space-y-3">
                    {aiSetupResult.items?.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-purple-800/80 flex items-center justify-between gap-3 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 rounded-xl object-cover bg-slate-950 shrink-0 border border-slate-800"
                          />
                          <div className="min-w-0">
                            <span className="text-[10px] font-black text-purple-400 uppercase">{item.role}</span>
                            <h4 className="text-xs font-bold text-white truncate max-w-sm">{item.name}</h4>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                              <span className="text-amber-400">★ {item.rating}</span>
                              <span>•</span>
                              <span className="text-cyan-400 font-bold">Gamer Score: {item.gamerScore || 94}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-sm font-black text-white">{formatPrice(item.price)}</div>
                          <button
                            onClick={() => {
                              addToCart(item, 1);
                              showSuccess(`Added ${item.name} to Cart`);
                            }}
                            className="text-[10px] text-purple-400 hover:text-purple-300 font-bold underline cursor-pointer"
                          >
                            + Add Single
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
                    <div className="text-xs text-slate-400 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>All components in stock & ready for 2-Day Express delivery</span>
                    </div>

                    <button
                      onClick={handleAddEntireSetup}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider transition-all duration-300 shadow-[0_0_20px_rgba(168,85,247,0.5)] cursor-pointer flex items-center gap-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>🛒 ADD ENTIRE SETUP ({aiSetupResult.items?.length || 5} Items)</span>
                    </button>
                  </div>

                </div>
              ) : (
                <div className="p-12 text-center text-slate-500">
                  <Cpu className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-xs font-bold">Click "Generate Battle Setup" to curate your gear</p>
                </div>
              )}
            </div>

          </div>

        </div>
      </section>

      {/* 7. STRICT GAMING CATALOG & FACETED FILTERS */}
      <section id="gaming-catalog-section" className="py-14 border-b border-purple-950/40 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header & Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-purple-400 tracking-wider mb-1">
                <Gamepad2 className="w-3.5 h-3.5" />
                <span>Zero Latency Marketplace</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                🎮 EXPLORE GAMING GEAR
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Showing {products.length} of {totalProducts} strictly verified gaming products
              </p>
            </div>

            {/* Dedicated Gaming Search Field */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search gaming gear (e.g. 240Hz, mouse, mechanical)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 text-white placeholder-slate-500 text-xs font-semibold border border-slate-800 focus:border-purple-500 outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Grid Layout with Sidebar Filters */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Desktop Filters Sidebar */}
            <div className="hidden lg:block lg:col-span-3 space-y-6 bg-slate-900/60 p-5 rounded-3xl border border-slate-800/80">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="font-extrabold text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-purple-400" />
                  <span>Gaming Filters</span>
                </h3>

                {(selectedSubCategory !== 'all' || selectedLoadout !== 'all' || minPrice || maxPrice || onlyDeals) && (
                  <button
                    onClick={() => {
                      setSelectedSubCategory('all');
                      setSelectedLoadout('all');
                      setMinPrice('');
                      setMaxPrice('');
                      setOnlyDeals(false);
                      setSearchQuery('');
                    }}
                    className="text-[10px] text-purple-400 hover:underline font-bold"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Sub-Category Filter */}
              <div>
                <label className="block text-[11px] font-black uppercase text-slate-400 tracking-wider mb-2">Category</label>
                <div className="space-y-1">
                  {gamingCategories.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedSubCategory(c.id)}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-bold text-left transition-colors ${
                        selectedSubCategory === c.id
                          ? 'bg-purple-600 text-white font-extrabold shadow-xs'
                          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <span>{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div>
                <label className="block text-[11px] font-black uppercase text-slate-400 tracking-wider mb-2">Price Range</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="Min"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-purple-500"
                  />
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="Max"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Quick Toggles */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="flex items-center gap-2 text-xs text-slate-300 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onlyDeals}
                    onChange={(e) => setOnlyDeals(e.target.checked)}
                    className="rounded accent-purple-600 cursor-pointer"
                  />
                  <span>🔥 Deals & Hot Discounts Only</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-300 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onlyInStock}
                    onChange={(e) => setOnlyInStock(e.target.checked)}
                    className="rounded accent-purple-600 cursor-pointer"
                  />
                  <span>⚡ In Stock Only</span>
                </label>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-[11px] font-black uppercase text-slate-400 tracking-wider mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-purple-500 cursor-pointer"
                >
                  <option value="relevance">Gamer Score (Best Match)</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">Newest Arrivals</option>
                  <option value="discount">Biggest Discount</option>
                </select>
              </div>

            </div>

            {/* Products Grid */}
            <div className="lg:col-span-9">
              
              {/* Active Filter Badges */}
              {(selectedSubCategory !== 'all' || selectedLoadout !== 'all' || searchQuery || onlyDeals) && (
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="text-xs text-slate-400 font-medium">Active filters:</span>
                  {selectedSubCategory !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-900/60 text-purple-300 border border-purple-700">
                      <span>Category: {selectedSubCategory}</span>
                      <button onClick={() => setSelectedSubCategory('all')}>✕</button>
                    </span>
                  )}
                  {selectedLoadout !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-900/60 text-cyan-300 border border-cyan-700">
                      <span>Loadout: {selectedLoadout}</span>
                      <button onClick={() => setSelectedLoadout('all')}>✕</button>
                    </span>
                  )}
                  {searchQuery && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-900/60 text-indigo-300 border border-indigo-700">
                      <span>Search: "{searchQuery}"</span>
                      <button onClick={() => setSearchQuery('')}>✕</button>
                    </span>
                  )}
                </div>
              )}

              {/* Product Cards Grid */}
              {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map(n => (
                    <div key={n} className="h-80 rounded-2xl bg-slate-900 animate-pulse border border-slate-800" />
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="p-12 text-center bg-slate-900/40 rounded-3xl border border-slate-800 my-4 space-y-3">
                  <span className="text-4xl">🎮</span>
                  <h3 className="font-extrabold text-base text-white">No gaming products available yet.</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Check back soon for new gaming gear or try adjusting your search and filter parameters.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedSubCategory('all');
                      setSelectedLoadout('all');
                      setSearchQuery('');
                      setMinPrice('');
                      setMaxPrice('');
                    }}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {products.map(prod => (
                    <div
                      key={prod.id}
                      className="bg-slate-900/90 rounded-2xl overflow-hidden border border-slate-800 hover:border-purple-600/80 transition-all duration-300 flex flex-col justify-between group shadow-lg hover:shadow-[0_0_25px_rgba(168,85,247,0.2)]"
                    >
                      <div className="relative aspect-square bg-slate-950 overflow-hidden cursor-pointer" onClick={() => onNavigate('product-detail', { id: prod.id || prod.slug })}>
                        <img
                          src={prod.images?.[0] || prod.image}
                          alt={prod.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        
                        {/* Gamer Score Badge */}
                        <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-lg bg-slate-950/85 backdrop-blur-md border border-purple-500/40 text-cyan-300 font-black text-[10px] flex items-center gap-1 shadow-md">
                          <Zap className="w-3 h-3 text-cyan-400" />
                          <span>GS {prod.gamerScore || 94}</span>
                        </div>

                        {prod.discountPercent > 0 && (
                          <div className="absolute top-2.5 right-10 px-1.5 py-0.5 rounded bg-rose-600 text-white font-black text-[10px]">
                            -{prod.discountPercent}%
                          </div>
                        )}

                        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 z-10">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShareProduct(prod);
                            }}
                            className="p-1.5 rounded-full bg-slate-900/80 text-slate-300 hover:text-purple-400 transition-colors cursor-pointer"
                            title="Share Product"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleWishlist(prod);
                            }}
                            className="p-1.5 rounded-full bg-slate-900/80 text-slate-300 hover:text-rose-400 transition-colors cursor-pointer"
                            title="Wishlist"
                          >
                            <Heart className={`w-3.5 h-3.5 ${isInWishlist(prod.id) ? 'fill-rose-500 text-rose-500' : ''}`} />
                          </button>
                        </div>
                      </div>

                      <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                            <span className="font-bold text-purple-400 truncate">{prod.sellerName}</span>
                            <div className="flex items-center gap-0.5 text-amber-400 font-bold shrink-0">
                              <Star className="w-3 h-3 fill-amber-400" />
                              <span>{prod.rating || 4.8}</span>
                            </div>
                          </div>

                          <h3
                            onClick={() => onNavigate('product-detail', { id: prod.id || prod.slug })}
                            className="font-bold text-xs text-white line-clamp-2 leading-snug group-hover:text-purple-300 transition-colors cursor-pointer"
                          >
                            {prod.name}
                          </h3>
                        </div>

                        <div className="pt-2 border-t border-slate-800/80">
                          <div className="flex items-baseline gap-1.5 mb-2.5">
                            <span className="text-base font-black text-white">{formatPrice(prod.price)}</span>
                            {prod.originalPrice && (
                              <span className="text-xs text-slate-500 line-through">{formatPrice(prod.originalPrice)}</span>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-1.5">
                            <button
                              onClick={() => {
                                addToCart(prod, 1);
                                showSuccess(`Added ${prod.name} to Cart!`);
                              }}
                              className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                            >
                              <ShoppingCart className="w-3.5 h-3.5" />
                              <span>Add</span>
                            </button>

                            <button
                              onClick={() => setSelectedProductForSetup(prod)}
                              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-purple-300 hover:text-white rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer border border-slate-700"
                              title="View complementary setup products"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Match Rig</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>

          </div>

        </div>
      </section>

      {/* 8. GAMERS OF MARKETZO (COMMUNITY SETUPS) */}
      <section className="py-14 border-b border-purple-950/60 bg-gradient-to-b from-slate-950 via-slate-900/60 to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-cyan-400 tracking-wider mb-1">
                <Share2 className="w-3.5 h-3.5" />
                <span>Community Rig Showcase</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                📸 GAMERS OF MARKETZO
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Real battlestations built by community players with one-click gear matching.
              </p>
            </div>

            <button
              onClick={() => showInfo('Setup submissions are open! Post with tag #MarketzoGamer to be featured.')}
              className="px-4 py-2 rounded-xl bg-purple-900/50 hover:bg-purple-800 text-purple-200 border border-purple-700 text-xs font-bold transition-all cursor-pointer"
            >
              + SHOW MY SETUP
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {communitySetups.map(setup => {
              const isLiked = !!likedSetups[setup.id];
              const likeCount = setup.likes + (isLiked ? 1 : 0);
              return (
                <div
                  key={setup.id}
                  className="bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 hover:border-purple-500/60 transition-all duration-300 shadow-xl flex flex-col justify-between"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-950">
                    <img
                      src={setup.image}
                      alt={setup.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-xl bg-slate-950/80 backdrop-blur-md border border-purple-500/40 text-[10px] font-black text-purple-300">
                      {setup.rank}
                    </div>
                  </div>

                  <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                        <span className="font-bold text-white">{setup.author}</span>
                        <button
                          onClick={() => handleToggleLike(setup.id)}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                            isLiked ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : 'bg-slate-800 text-slate-300 hover:text-white'
                          }`}
                        >
                          <ThumbsUp className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500' : ''}`} />
                          <span>{likeCount}</span>
                        </button>
                      </div>

                      <h3 className="font-extrabold text-sm text-white">{setup.title}</h3>
                    </div>

                    <div className="pt-3 border-t border-slate-800 space-y-2">
                      <div className="text-[10px] font-black uppercase text-purple-400">Products in this Rig:</div>
                      <div className="space-y-1.5">
                        {setup.products?.map(p => (
                          <div key={p.id} className="flex items-center justify-between text-xs text-slate-300 bg-slate-950/60 p-1.5 rounded-lg">
                            <span className="truncate max-w-[180px]">{p.name}</span>
                            <span className="font-bold text-cyan-300">{formatPrice(p.price)}</span>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => {
                          setup.products?.forEach(p => addToCart(p, 1));
                          showSuccess(`Added all products from ${setup.title} to your Cart!`);
                        }}
                        className="w-full mt-2 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-xs"
                      >
                        🛒 Shop This Setup
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 9. GAMING TRUST INDICATORS */}
      <section className="py-10 bg-slate-950 border-b border-purple-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            
            <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
              <ShieldCheck className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
              <div className="font-bold text-xs text-white">Verified Gaming Sellers</div>
              <div className="text-[10px] text-slate-400">100% genuine brand hardware</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
              <CheckCircle className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <div className="font-bold text-xs text-white">Zero Latency Rating</div>
              <div className="text-[10px] text-slate-400">Gamer Score spec validation</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
              <Truck className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
              <div className="font-bold text-xs text-white">2-Day Express Delivery</div>
              <div className="text-[10px] text-slate-400">Fast priority dispatch</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
              <RotateCcw className="w-6 h-6 text-amber-400 mx-auto mb-2" />
              <div className="font-bold text-xs text-white">30-Day Hassle Free Returns</div>
              <div className="text-[10px] text-slate-400">Complete buyer protection</div>
            </div>

          </div>
        </div>
      </section>

      {/* COMPLETE YOUR SETUP MODAL */}
      {selectedProductForSetup && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-purple-500/50 text-white rounded-3xl max-w-xl w-full p-6 shadow-[0_0_50px_rgba(168,85,247,0.3)] animate-in fade-in zoom-in-95">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xl">🎮</span>
                <div>
                  <h3 className="font-black text-sm text-white">Complete Your Gaming Setup</h3>
                  <p className="text-[11px] text-slate-400">Recommended peripherals to accompany {selectedProductForSetup.name}</p>
                </div>
              </div>
              <button onClick={() => setSelectedProductForSetup(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 my-4">
              <div className="p-3 bg-purple-950/40 rounded-2xl border border-purple-800/60 flex items-center gap-3">
                <img
                  src={selectedProductForSetup.images?.[0] || selectedProductForSetup.image}
                  alt={selectedProductForSetup.name}
                  className="w-14 h-14 rounded-xl object-cover bg-slate-950 border border-slate-800"
                />
                <div>
                  <div className="text-[10px] font-black uppercase text-purple-400">Selected Anchor Gear</div>
                  <h4 className="font-bold text-xs text-white">{selectedProductForSetup.name}</h4>
                  <div className="text-xs font-black text-cyan-300 mt-0.5">{formatPrice(selectedProductForSetup.price)}</div>
                </div>
              </div>

              <div className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
                Compatible Match Peripherals:
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {products.filter(p => p.id !== selectedProductForSetup.id).slice(0, 3).map(comp => (
                  <div key={comp.id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img src={comp.images?.[0] || comp.image} alt={comp.name} className="w-10 h-10 rounded-lg object-cover bg-slate-900 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">{comp.name}</div>
                        <div className="text-[10px] text-cyan-400 font-bold">{formatPrice(comp.price)}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        addToCart(comp, 1);
                        showSuccess(`Added ${comp.name} to Cart`);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold shrink-0 cursor-pointer"
                    >
                      + Add
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
              <button
                onClick={() => setSelectedProductForSetup(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700"
              >
                Close
              </button>
              <button
                onClick={() => {
                  addToCart(selectedProductForSetup, 1);
                  products.filter(p => p.id !== selectedProductForSetup.id).slice(0, 2).forEach(p => addToCart(p, 1));
                  showSuccess(`Added complete matched rig to your Cart!`);
                  setSelectedProductForSetup(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-black hover:from-purple-500 hover:to-indigo-500 shadow-md"
              >
                🛒 Add Matched Rig (3 Items)
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Share Modal */}
      <ShareProductModal
        isOpen={!!shareProduct}
        onClose={() => setShareProduct(null)}
        product={shareProduct}
      />

    </div>
  );
};
