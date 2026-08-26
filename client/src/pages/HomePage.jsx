import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  TrendingUp, 
  Award, 
  Flame, 
  Clock, 
  Zap, 
  ShieldCheck, 
  ArrowRight,
  Headphones,
  Smartphone,
  Laptop,
  Shirt,
  Gem,
  Home,
  Sparkle,
  Activity,
  ShoppingBag,
  Watch,
  BookOpen,
  Gamepad2,
  CheckCircle2,
  Star,
  Camera,
  Layers,
  Store,
  Tag,
  DollarSign,
  Package,
  Eye,
  Search,
  SlidersHorizontal,
  Bot
} from 'lucide-react';
import { ProductCard } from '../components/product/ProductCard';
import { MakeDealModal } from '../components/home/MakeDealModal';
import { VisualSearchModal } from '../components/search/VisualSearchModal';
import { WholesaleRfqModal } from '../components/wholesale/WholesaleRfqModal';
import { AiShoppingAssistant } from '../components/ai/AiShoppingAssistant';
import { api } from '../services/api';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';

const ICON_MAP = {
  Headphones,
  Smartphone,
  Laptop,
  Shirt,
  Gem,
  Home,
  Sparkles,
  Activity,
  ShoppingBag,
  Watch,
  BookOpen,
  Gamepad2
};

export const HomePage = ({ onNavigate }) => {
  const { user, isAuthenticated } = useAuth();
  const { formatPrice, currentCurrency, activeCurrencyInfo } = useCurrency();

  // Core Data States
  const [banners, setBanners] = useState([]);
  const [activeBanner, setActiveBanner] = useState(0);
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [flashDeals, setFlashDeals] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [trustedSellers, setTrustedSellers] = useState([]);
  const [pickedProducts, setPickedProducts] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [wholesaleProducts, setWholesaleProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // AI Hero Search State
  const [aiQuery, setAiQuery] = useState('');
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiSearchResults, setAiSearchResults] = useState(null);

  // Modals
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [aiPromptPreload, setAiPromptPreload] = useState('');
  const [showVisualModal, setShowVisualModal] = useState(false);
  const [dealModalProduct, setDealModalProduct] = useState(null);
  const [rfqModalProduct, setRfqModalProduct] = useState(null);

  // Live Flash Deals Countdown Timer
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 18, seconds: 42 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 8, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Home Page Data
  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setIsLoading(true);
        const [
          banRes,
          catRes,
          featRes,
          trendRes,
          pickRes,
          sellersRes,
          prodRes
        ] = await Promise.all([
          api.getBanners().catch(() => ({ success: false })),
          api.getCategories().catch(() => ({ success: false })),
          api.getFeaturedProducts().catch(() => ({ success: false })),
          api.getTrendingProducts().catch(() => ({ success: false })),
          api.getPickedForYou().catch(() => ({ success: false })),
          api.getExploreSellers().catch(() => ({ success: false })),
          api.getProducts({ limit: 40 }).catch(() => ({ success: false }))
        ]);

        if (banRes.success) setBanners(banRes.banners || []);
        if (catRes.success) setCategories(catRes.categories || []);
        if (featRes && featRes.success) setFeaturedProducts(featRes.products || []);
        if (trendRes && trendRes.success) setTrendingProducts(trendRes.products || []);
        if (pickRes && pickRes.success) setPickedProducts(pickRes.products || []);
        if (sellersRes && sellersRes.success) setTrustedSellers(sellersRes.sellers || []);

        if (prodRes && prodRes.success) {
          const all = prodRes.products || [];
          // Flash deals: products with >= 20% discount
          setFlashDeals(all.filter(p => (p.discountPercent || 0) >= 20 || p.isHotDeal).slice(0, 4));
          // Wholesale products: products with MOQ or high stock
          setWholesaleProducts(all.filter(p => (p.stock || 0) >= 15).slice(0, 4));

          // Load recently viewed from localStorage or fallback
          try {
            const storedRecent = JSON.parse(localStorage.getItem('marketzo_recently_viewed') || '[]');
            if (Array.isArray(storedRecent) && storedRecent.length > 0) {
              setRecentlyViewed(storedRecent.slice(0, 6));
            } else {
              setRecentlyViewed(all.slice(0, 5));
            }
          } catch (e) {
            setRecentlyViewed(all.slice(0, 5));
          }
        }
      } catch (err) {
        console.error('Home load error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadHomeData();
  }, []);

  // Handle AI Hero Search
  const handleAiHeroSubmit = async (e, customPrompt) => {
    if (e) e.preventDefault();
    const queryToSearch = customPrompt || aiQuery;
    if (!queryToSearch || !queryToSearch.trim()) return;

    try {
      setIsAiSearching(true);
      const res = await api.askAiAssistant({
        query: queryToSearch.trim(),
        currency: currentCurrency,
        exchangeRate: activeCurrencyInfo?.rate || 1
      });

      if (res && res.success) {
        setAiSearchResults({
          query: queryToSearch,
          reply: res.replyText || res.reply,
          products: res.recommendations || []
        });
      }
    } catch (err) {
      console.error('AI search error:', err);
    } finally {
      setIsAiSearching(false);
    }
  };

  const handleLaunchAiWithPrompt = (promptText) => {
    setAiPromptPreload(promptText);
    setShowAiAssistant(true);
  };

  return (
    <div className="space-y-12 sm:space-y-16 pb-20 overflow-x-hidden">
      
      {/* =========================================================================
          1. AI HERO — TELL MARKETZO WHAT YOU NEED
          ========================================================================= */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-8">
        <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 border border-slate-800 p-6 sm:p-12 lg:p-16 text-white text-center space-y-6">
          
          {/* Top AI Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-indigo-500/20 border border-amber-400/40 text-amber-300 text-xs font-black uppercase tracking-wider backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span>AI-Powered Marketplace Discovery</span>
          </div>

          {/* Headlines */}
          <div className="space-y-3 max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
              Tell MARKETZO What You Need
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
              Describe what you're looking for and our AI will find the best verified products for you.
            </p>
          </div>

          {/* Large AI Search Box */}
          <form onSubmit={handleAiHeroSubmit} className="max-w-2xl mx-auto relative">
            <div className="flex flex-col sm:flex-row items-center bg-slate-900/90 border-2 border-indigo-500/50 hover:border-indigo-400 focus-within:border-amber-400 rounded-2xl sm:rounded-full p-2 shadow-2xl backdrop-blur-lg transition-all gap-2">
              <div className="flex items-center w-full pl-3 gap-2">
                <Bot className="w-5 h-5 text-indigo-400 shrink-0" />
                <input
                  type="text"
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  placeholder="Example: Find a gaming laptop under ₹50,000"
                  className="w-full bg-transparent text-sm sm:text-base text-white placeholder:text-slate-400 outline-none py-2"
                />
              </div>

              <button
                type="submit"
                disabled={isAiSearching}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl sm:rounded-full font-bold text-xs sm:text-sm whitespace-nowrap shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{isAiSearching ? 'Searching...' : '🤖 Find Products'}</span>
              </button>
            </div>
          </form>

          {/* Quick Suggestions Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className="text-xs font-semibold text-slate-400">Quick Prompts:</span>
            {[
              { label: 'Under ₹1,000', query: 'Find high rated items under ₹1,000' },
              { label: '🔥 Best Deals', query: 'Show me products with the biggest discounts and best deals' },
              { label: '📈 Trending', query: 'What are the top trending products right now?' },
              { label: '✨ New Arrivals', query: 'Show the newest verified arrivals' },
              { label: '🎁 Gifts', query: 'Recommend premium gift items' },
              { label: '🎮 Gaming', query: 'Find pro gaming accessories and keyboards' },
              { label: '🎧 Electronics', query: 'Best wireless audio and electronics' }
            ].map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setAiQuery(chip.query);
                  handleAiHeroSubmit(null, chip.query);
                }}
                className="px-3 py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 hover:border-indigo-400 rounded-full text-xs font-medium transition-all cursor-pointer"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Inline AI Search Results Card if searched */}
          {aiSearchResults && (
            <div className="mt-8 p-6 bg-slate-900/95 border border-indigo-500/40 rounded-3xl text-left space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-sm text-white">AI Recommendations for "{aiSearchResults.query}"</span>
                </div>
                <button
                  onClick={() => setAiSearchResults(null)}
                  className="text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Close
                </button>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{aiSearchResults.reply}</p>
              
              {aiSearchResults.products?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                  {aiSearchResults.products.map(p => (
                    <ProductCard key={p.id} product={p} onNavigate={onNavigate} />
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">No exact items found within that specific criteria. Browse all catalog products below.</p>
              )}
            </div>
          )}

        </div>
      </section>

      {/* =========================================================================
          2. SHOP BY CATEGORY (Strict DB IDs)
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-indigo-600">Departments</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Shop by Category</h2>
          </div>
          <button
            onClick={() => onNavigate('products', {})}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
          >
            <span>View All Categories</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
          {[
            { id: 'cat_mobiles', name: 'Mobiles & Tablets', slug: 'mobiles-tablets', icon: Smartphone, bg: 'from-blue-500/10 to-indigo-500/10', border: 'border-blue-200' },
            { id: 'cat_laptops', name: 'Laptops & Computers', slug: 'laptops-computers', icon: Laptop, bg: 'from-purple-500/10 to-indigo-500/10', border: 'border-purple-200' },
            { id: 'cat_electronics', name: 'Electronics & Audio', slug: 'electronics-audio', icon: Headphones, bg: 'from-indigo-500/10 to-sky-500/10', border: 'border-indigo-200' },
            { id: 'cat_fashion', name: 'Fashion & Apparel', slug: 'fashion-apparel', icon: Shirt, bg: 'from-rose-500/10 to-amber-500/10', border: 'border-rose-200' },
            { id: 'cat_jewellery', name: 'Jewellery & Watches', slug: 'jewellery-watches', icon: Gem, bg: 'from-amber-500/10 to-yellow-500/10', border: 'border-amber-200' },
            { id: 'cat_home', name: 'Home & Kitchen', slug: 'home-kitchen', icon: Home, bg: 'from-emerald-500/10 to-teal-500/10', border: 'border-emerald-200' },
            { id: 'cat_sports', name: 'Sports & Fitness', slug: 'sports-fitness', icon: Activity, bg: 'from-cyan-500/10 to-blue-500/10', border: 'border-cyan-200' },
            { id: 'cat_beauty', name: 'Beauty & Skincare', slug: 'beauty-skincare', icon: Sparkles, bg: 'from-pink-500/10 to-rose-500/10', border: 'border-pink-200' },
            { id: 'cat_grocery', name: 'Gourmet & Organic', slug: 'gourmet-organic', icon: ShoppingBag, bg: 'from-green-500/10 to-emerald-500/10', border: 'border-green-200' },
            { id: 'all', name: 'All Departments', slug: '', icon: Layers, bg: 'from-slate-500/10 to-slate-700/10', border: 'border-slate-300' }
          ].map(cat => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => onNavigate('products', { category: cat.slug || cat.id })}
                className={`group p-4 sm:p-5 rounded-2xl bg-gradient-to-br ${cat.bg} border ${cat.border} hover:shadow-lg hover:scale-[1.02] transition-all flex flex-col items-center justify-center text-center space-y-2.5 cursor-pointer bg-white`}
              >
                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <span className="font-bold text-xs sm:text-sm text-slate-800 group-hover:text-indigo-600 transition-colors block">
                    {cat.name}
                  </span>
                  <span className="text-[10px] text-slate-400">Verified Products</span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          3. FLASH DEALS (Countdown + Real DB Deals)
          ========================================================================= */}
      {flashDeals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-slate-950 rounded-3xl p-6 sm:p-8 border border-rose-900/40 text-white shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-rose-600 text-white animate-bounce">
                  <Flame className="w-4 h-4" />
                </span>
                <span className="text-xs font-black uppercase tracking-wider text-rose-400">Limited Time Event</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">🔥 FLASH DEALS</h2>
              <p className="text-xs text-slate-300">Huge savings on verified products. Grab them before countdown ends!</p>
            </div>

            {/* Countdown Box */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 p-2.5 rounded-2xl shadow-inner text-center">
                <div className="px-2.5 py-1.5 rounded-xl bg-slate-800 font-mono text-base sm:text-lg font-black text-rose-400">
                  {String(timeLeft.hours).padStart(2, '0')}
                </div>
                <span className="font-bold text-slate-400">:</span>
                <div className="px-2.5 py-1.5 rounded-xl bg-slate-800 font-mono text-base sm:text-lg font-black text-rose-400">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </div>
                <span className="font-bold text-slate-400">:</span>
                <div className="px-2.5 py-1.5 rounded-xl bg-slate-800 font-mono text-base sm:text-lg font-black text-rose-400">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </div>
              </div>

              <button
                onClick={() => onNavigate('products', { hotDeals: 'true' })}
                className="px-5 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl font-bold text-xs shadow-lg transition-all cursor-pointer whitespace-nowrap"
              >
                View All Deals
              </button>
            </div>
          </div>

          {/* Flash Deals Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {flashDeals.map(product => (
              <div key={product.id} className="relative group">
                <ProductCard product={product} onNavigate={onNavigate} />
                {/* Stock Left Banner */}
                <div className="mt-1.5 px-3 py-1 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-extrabold flex items-center justify-between">
                  <span>⚡ Only {product.stock > 0 && product.stock <= 5 ? product.stock : 4} units left</span>
                  <span className="uppercase text-[9px] text-rose-500">Fast Selling</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* =========================================================================
          4. FEATURED PRODUCTS (Admin-Approved Feature on Home Page)
          ========================================================================= */}
      {featuredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-600">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Premier Selections</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">⭐ FEATURED PRODUCTS</h2>
            </div>
            <button
              onClick={() => onNavigate('products', { featured: 'true' })}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
            >
              <span>Explore All Featured</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
            ))}
          </div>
        </section>
      )}

      {/* =========================================================================
          5. AI SHOPPING ZONE (Interactive AI Prompts)
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 rounded-3xl p-6 sm:p-10 border border-indigo-800/40 text-white shadow-2xl space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase tracking-wider border border-indigo-400/30">
                <Bot className="w-3.5 h-3.5 text-amber-400" />
                <span>Smart Assistant</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">🤖 ASK MARKETZO AI</h2>
              <p className="text-xs text-slate-300">Click any prompt to get instant verified recommendations from our marketplace catalog.</p>
            </div>

            <button
              onClick={() => setShowAiAssistant(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-indigo-500 hover:from-amber-500 hover:to-indigo-600 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>Open AI Shopping Guide</span>
            </button>
          </div>

          {/* Prompt Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {[
              { prompt: 'Find a phone under ₹20,000', icon: '📱', desc: 'Flagship 5G cameras & battery life' },
              { prompt: 'Build a gaming setup under ₹30,000', icon: '🎮', desc: 'Low-latency headsets, mechanical keyboards' },
              { prompt: 'Find a birthday gift under ₹2,000', icon: '🎁', desc: 'Curated apparel, watches, and smart audio' },
              { prompt: 'Find the best earbuds for travel', icon: '🎧', desc: 'Active noise cancellation & long battery' },
              { prompt: 'Compare top programming laptops', icon: '💻', desc: 'Side-by-side performance breakdown' },
              { prompt: 'Show top 5-star rated products', icon: '⭐', desc: 'Highest rated merchant merchandise' }
            ].map((card, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleLaunchAiWithPrompt(card.prompt)}
                className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-indigo-400/80 hover:bg-slate-800 transition-all text-left group flex items-start gap-3.5 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
                  {card.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-xs sm:text-sm text-white group-hover:text-amber-300 transition-colors">
                    "{card.prompt}"
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{card.desc}</div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-white shrink-0 self-center" />
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* =========================================================================
          6. TRENDING NOW (Real Activity & Signals)
          ========================================================================= */}
      {trendingProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-rose-600">
                <TrendingUp className="w-3.5 h-3.5 text-rose-500" />
                <span>Buyer Demand</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">🔥 TRENDING NOW</h2>
            </div>
            <button
              onClick={() => onNavigate('products', { trending: 'true' })}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
            >
              <span>View All Trending</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {trendingProducts.map(product => (
              <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
            ))}
          </div>
        </section>
      )}

      {/* =========================================================================
          7. TRUSTED SELLERS (Trust Score & Verification)
          ========================================================================= */}
      {trustedSellers.length > 0 && (
        <section id="trusted-sellers-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-600">
                <Award className="w-3.5 h-3.5 text-emerald-500" />
                <span>Verified Multi-Vendor Network</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">🏆 TRUSTED SELLERS</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {trustedSellers.map(seller => (
              <div
                key={seller.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                {/* Seller Header */}
                <div className="flex items-center gap-3.5">
                  <img
                    src={seller.storeLogo}
                    alt={seller.storeName}
                    className="w-14 h-14 rounded-2xl object-cover bg-slate-100 border border-slate-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-extrabold text-sm text-slate-900 truncate">{seller.storeName}</h3>
                      {seller.isVerified && (
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" title="Verified Merchant" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                      <div className="flex items-center gap-1 text-amber-500 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{seller.rating.toFixed(1)}</span>
                      </div>
                      <span>•</span>
                      <span>{seller.productCount} Products</span>
                    </div>
                  </div>
                </div>

                {/* Trust Score & Metrics Banner */}
                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Trust Score</span>
                    <span className="font-black text-emerald-700 text-sm">{seller.trustScore}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Fulfillment</span>
                    <span className="font-bold text-slate-800 text-xs">{seller.deliveryPerformance}</span>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => onNavigate('products', { sellerId: seller.id })}
                  className="w-full py-2.5 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>View Store Products</span>
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* =========================================================================
          8. PICKED FOR YOU / POPULAR ON MARKETZO
          ========================================================================= */}
      {pickedProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-purple-600">
                <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                <span>{isAuthenticated ? 'Personalized Match' : 'High Satisfaction'}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {isAuthenticated ? '🧠 PICKED FOR YOU' : '✨ POPULAR ON MARKETZO'}
              </h2>
            </div>
            <button
              onClick={() => onNavigate('products', {})}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
            >
              <span>Explore More</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {pickedProducts.map(product => (
              <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
            ))}
          </div>
        </section>
      )}

      {/* =========================================================================
          9. SNAP & SHOP (Visual Similarity Search)
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 sm:p-12 border border-slate-800 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase tracking-wider border border-indigo-400/30">
              <Camera className="w-3.5 h-3.5 text-indigo-400" />
              <span>Visual AI Matcher</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white">📸 SNAP & SHOP</h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              See something you like in the real world? Upload a photo and MARKETZO AI will match visually similar items from our verified marketplace catalog.
            </p>
          </div>

          <button
            onClick={() => setShowVisualModal(true)}
            className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-2xl font-black text-sm shadow-xl flex items-center gap-2.5 shrink-0 cursor-pointer transition-all hover:scale-105"
          >
            <Camera className="w-5 h-5" />
            <span>Upload Image & Find</span>
          </button>
        </div>
      </section>

      {/* =========================================================================
          10. MAKE ME A DEAL (Offer Submission directly to Merchants)
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-600">
              <Tag className="w-3.5 h-3.5 text-amber-500" />
              <span>Dynamic Pricing</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">💰 MAKE ME A DEAL</h2>
            <p className="text-xs text-slate-500 mt-0.5">Found a product you love? Submit a custom price offer directly to verified sellers.</p>
          </div>
        </div>

        {/* Highlighted Deal Eligible Products */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {(trendingProducts.slice(0, 4)).map(product => (
            <div key={product.id} className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3">
              <img
                src={product.images?.[0] || product.image}
                alt={product.name}
                className="aspect-square w-full object-cover rounded-2xl bg-slate-50"
              />
              <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">{product.categoryName || 'Product'}</span>
                <h3 className="font-bold text-xs text-slate-800 line-clamp-1 mt-0.5">{product.name}</h3>
                <div className="text-sm font-black text-slate-900 mt-1">{formatPrice(product.price)}</div>
              </div>
              <button
                onClick={() => setDealModalProduct(product)}
                className="w-full py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Tag className="w-3.5 h-3.5" />
                <span>Make Custom Offer</span>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          11. WHOLESALE ZONE ("BUY MORE, SAVE MORE")
          ========================================================================= */}
      <section id="wholesale-zone-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-slate-950 rounded-3xl p-6 sm:p-10 border border-cyan-900/40 text-white shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-black uppercase tracking-wider border border-cyan-400/30">
              <Package className="w-3.5 h-3.5 text-cyan-400" />
              <span>B2B & Bulk Discounts</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">📦 BUY MORE, SAVE MORE</h2>
            <p className="text-xs text-slate-300">
              Support bulk unit discounts directly from manufacturer & authorized merchant tiers.
            </p>
            {/* Tier Structure Pill */}
            <div className="flex flex-wrap items-center gap-2 pt-2 text-[11px] font-bold text-slate-300">
              <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700">1–9 Units → Standard</span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-cyan-300">10–49 Units → 10% OFF</span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-cyan-300">50–99 Units → 18% OFF</span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-amber-300">100+ Units → 28% OFF</span>
            </div>
          </div>

          <button
            onClick={() => onNavigate('products', { wholesale: 'true' })}
            className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl font-bold text-xs shadow-lg transition-all cursor-pointer whitespace-nowrap self-start lg:self-auto"
          >
            Browse Wholesale Catalog
          </button>
        </div>

        {/* Wholesale Product Showcase with RFQ Modal Triggers */}
        {wholesaleProducts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {wholesaleProducts.map(product => (
              <div key={product.id} className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm space-y-3 flex flex-col justify-between">
                <img
                  src={product.images?.[0] || product.image}
                  alt={product.name}
                  className="aspect-square w-full object-cover rounded-2xl bg-slate-50"
                />
                <div>
                  <span className="text-[10px] font-bold text-cyan-700 uppercase tracking-wider">Bulk Tier Eligible</span>
                  <h3 className="font-bold text-xs text-slate-800 line-clamp-1 mt-0.5">{product.name}</h3>
                  <div className="text-xs text-slate-500 mt-1">Starting from <strong className="text-slate-900 font-black">{formatPrice(product.price * 0.72)} / unit</strong></div>
                </div>
                <button
                  onClick={() => setRfqModalProduct(product)}
                  className="w-full py-2 bg-slate-900 hover:bg-cyan-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>Request Bulk Quote (RFQ)</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* =========================================================================
          12. RECENTLY VIEWED (Continue Shopping)
          ========================================================================= */}
      {recentlyViewed.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-500">
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                <span>Browsing History</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">👀 CONTINUE SHOPPING</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {recentlyViewed.map(product => (
              <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
            ))}
          </div>
        </section>
      )}

      {/* =========================================================================
          Interactive Modals Mounts
          ========================================================================= */}
      <MakeDealModal
        isOpen={!!dealModalProduct}
        product={dealModalProduct}
        onClose={() => setDealModalProduct(null)}
      />

      <VisualSearchModal
        isOpen={showVisualModal}
        onClose={() => setShowVisualModal(false)}
        onNavigate={onNavigate}
      />

      <WholesaleRfqModal
        isOpen={!!rfqModalProduct}
        product={rfqModalProduct}
        onClose={() => setRfqModalProduct(null)}
      />

      <AiShoppingAssistant
        isOpen={showAiAssistant}
        initialPrompt={aiPromptPreload}
        onClose={() => {
          setShowAiAssistant(false);
          setAiPromptPreload('');
        }}
        onNavigate={onNavigate}
      />

    </div>
  );
};
