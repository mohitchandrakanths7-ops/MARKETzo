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
  Star
} from 'lucide-react';
import { ProductCard } from '../components/product/ProductCard';
import { FlashSaleBanner } from '../components/home/FlashSaleBanner';
import { api } from '../services/api';

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
  const [banners, setBanners] = useState([]);
  const [activeBanner, setActiveBanner] = useState(0);
  const [categories, setCategories] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [flashDeals, setFlashDeals] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Flash deal countdown state
  const [timeLeft, setTimeLeft] = useState({ hours: 8, minutes: 42, seconds: 19 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch home data
  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setIsLoading(true);
        const [banRes, catRes, prodRes] = await Promise.all([
          api.getBanners(),
          api.getCategories(),
          api.getProducts({ limit: 30 })
        ]);

        if (banRes.success) setBanners(banRes.banners || []);
        if (catRes.success) setCategories(catRes.categories || []);

        if (prodRes.success) {
          const all = prodRes.products || [];
          setTrendingProducts(all.filter(p => p.isTrending || p.rating >= 4.8).slice(0, 4));
          setBestSellers(all.filter(p => p.isBestSeller || p.reviewCount > 300).slice(0, 4));
          setNewArrivals(all.filter(p => p.isNewArrival).slice(0, 4));
          setFlashDeals(all.filter(p => p.discountPercent >= 20).slice(0, 4));
          setRecentlyViewed(all.slice(0, 5));
        }
      } catch (err) {
        console.error('Home load error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadHomeData();
  }, []);

  // Auto rotate hero banner
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveBanner(prev => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [banners.length]);

  return (
    <div className="space-y-8 sm:space-y-12 pb-16 overflow-x-hidden">
      
      {/* 1. Hero Promotional Carousel Section */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-3 sm:pt-6">
        {banners.length > 0 && (
          <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-slate-900 border border-slate-800 min-h-[480px] sm:min-h-[400px] md:min-h-[440px] flex items-center">
            
            {/* Background Slides */}
            {banners.map((banner, index) => {
              const isActive = index === activeBanner;
              return (
                <div
                  key={banner.id}
                  className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                    isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
                  } bg-gradient-to-r ${banner.bgGradient || 'from-slate-900 via-indigo-950 to-slate-950'} flex flex-col md:flex-row items-center justify-between p-5 sm:p-10 lg:p-16 gap-6 sm:gap-8`}
                >
                  {/* Left Hero Copy */}
                  <div className="flex-1 text-white space-y-3 sm:space-y-4 max-w-xl z-10 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-[10px] sm:text-xs font-black uppercase tracking-wider backdrop-blur-md">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{banner.tag}</span>
                    </div>

                    <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                      {banner.title}
                    </h1>

                    <p className="text-xs sm:text-sm md:text-base text-slate-300 leading-relaxed line-clamp-2 sm:line-clamp-3">
                      {banner.subtitle}
                    </p>

                    <div className="pt-1 sm:pt-2 flex flex-wrap items-center justify-center md:justify-start gap-2.5 sm:gap-3">
                      <button
                        onClick={() => onNavigate('products', {})}
                        className="w-full sm:w-auto px-6 sm:px-7 py-3 sm:py-3.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-lg shadow-indigo-600/40 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>{banner.buttonText || 'Shop Marketplace'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      <div className="px-3.5 py-2.5 sm:px-4 sm:py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-[11px] sm:text-xs font-bold text-amber-300 text-center">
                        {banner.badge}
                      </div>
                    </div>
                  </div>

                  {/* Right Hero Image */}
                  <div className="relative w-full md:w-1/2 flex justify-center items-center z-10">
                    <div className="relative w-40 sm:w-64 md:w-80 h-40 sm:h-64 md:h-80 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border-2 border-white/10 group">
                      <img
                        src={banner.image}
                        alt={banner.title}
                        className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Slider Navigation Dots & Arrows */}
            <div className="absolute bottom-3 sm:bottom-4 left-4 sm:left-12 z-20 flex items-center gap-1.5 sm:gap-2">
              {banners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveBanner(i)}
                  className={`h-2 sm:h-2.5 rounded-full transition-all cursor-pointer ${
                    activeBanner === i ? 'w-6 sm:w-8 bg-indigo-400' : 'w-2 sm:w-2.5 bg-white/30 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>

            <div className="absolute bottom-3 sm:bottom-4 right-4 sm:right-12 z-20 flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => setActiveBanner(prev => (prev - 1 + banners.length) % banners.length)}
                className="p-1.5 sm:p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveBanner(prev => (prev + 1) % banners.length)}
                className="p-1.5 sm:p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}
      </section>

      {/* 2. Top Department Categories Grid */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
              Explore Departments
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500">Over 50,000+ verified multi-vendor products</p>
          </div>
          <button
            onClick={() => onNavigate('products', {})}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 sm:gap-1 transition-colors cursor-pointer"
          >
            <span>All Categories</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 min-[480px]:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 sm:gap-4">
          {categories.map(cat => {
            const IconComponent = ICON_MAP[cat.icon] || ShoppingBag;
            return (
              <div
                key={cat.id}
                onClick={() => onNavigate('products', { category: cat.slug || cat.id })}
                className="group relative p-3 sm:p-4 bg-white rounded-2xl border border-slate-200/80 hover:border-indigo-500 hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col items-center text-center space-y-2 sm:space-y-3"
              >
                <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-indigo-50 group-hover:bg-indigo-600 text-indigo-600 group-hover:text-white transition-all duration-300 flex items-center justify-center shadow-sm">
                  <IconComponent className="w-5 h-5 sm:w-7 sm:h-7" />
                </div>
                <div>
                  <h3 className="font-bold text-[11px] sm:text-xs text-slate-800 group-hover:text-indigo-600 transition-colors truncate max-w-[100px] sm:max-w-[120px]">
                    {cat.name}
                  </h3>
                  <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium">
                    {cat.productCount ? `${cat.productCount} Products` : 'Explore'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Flash Deals Dynamic Banner with Countdown */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <FlashSaleBanner onNavigate={onNavigate} />
      </section>

      {/* 4. Trending & High Velocity Electronics & Fashion */}
      {trendingProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center gap-2 sm:gap-2.5">
              <div className="p-1.5 sm:p-2 rounded-xl bg-indigo-50 text-indigo-600">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">Trending Now on Marketzo</h2>
                <p className="text-[11px] sm:text-xs text-slate-500">Most viewed and ordered items across all departments today</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('products', { trending: 'true' })}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 min-[380px]:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {trendingProducts.map(p => (
              <ProductCard key={p.id} product={p} onNavigate={onNavigate} />
            ))}
          </div>
        </section>
      )}

      {/* 5. Promotional Double Split Banners */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          
          <div 
            onClick={() => onNavigate('products', { category: 'electronics-audio' })}
            className="relative rounded-3xl overflow-hidden p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white shadow-xl cursor-pointer group flex flex-col justify-between min-h-[200px] sm:min-h-[220px]"
          >
            <div className="space-y-2 z-10">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/20 px-2.5 py-1 rounded-full border border-indigo-400/30">
                Hi-Res Acoustic Gear
              </span>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight group-hover:text-indigo-300 transition-colors">
                Studio Quality ANC Audio
              </h3>
              <p className="text-xs text-slate-300 max-w-xs">Experience spatial acoustic precision with 55hr battery life and warp charge.</p>
            </div>
            <div className="pt-4 z-10">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 group-hover:translate-x-1 transition-transform">
                Explore Audio Hub <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          <div 
            onClick={() => onNavigate('products', { category: 'fashion-apparel' })}
            className="relative rounded-3xl overflow-hidden p-6 sm:p-8 bg-gradient-to-br from-stone-900 via-amber-950 to-stone-950 text-white shadow-xl cursor-pointer group flex flex-col justify-between min-h-[200px] sm:min-h-[220px]"
          >
            <div className="space-y-2 z-10">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/20 px-2.5 py-1 rounded-full border border-amber-400/30">
                Artisan Atelier
              </span>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight group-hover:text-amber-300 transition-colors">
                100% Virgin Merino Wool
              </h3>
              <p className="text-xs text-slate-300 max-w-xs">Double-faced tailored luxury overcoats crafted by independent artisans.</p>
            </div>
            <div className="pt-4 z-10">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
                Explore Fashion Line <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* 6. Best Sellers & Customer Favorites */}
      {bestSellers.length > 0 && (
        <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center gap-2 sm:gap-2.5">
              <div className="p-1.5 sm:p-2 rounded-xl bg-amber-50 text-amber-600">
                <Award className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">Marketzo Best Sellers</h2>
                <p className="text-[11px] sm:text-xs text-slate-500">Highest rated items backed by verified customer purchase reviews</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('products', { bestSeller: 'true' })}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 min-[380px]:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {bestSellers.map(p => (
              <ProductCard key={p.id} product={p} onNavigate={onNavigate} />
            ))}
          </div>
        </section>
      )}

      {/* 7. Become a Verified Seller Call to Action */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-12 border border-slate-800 text-white flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8 shadow-2xl relative overflow-hidden">
          
          <div className="space-y-3 sm:space-y-4 max-w-xl z-10 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400/20 text-amber-300 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Multi-Vendor Marketplace Partner Program</span>
            </div>
            <h2 className="text-xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight">
              Grow Your Brand on Marketzo. Sell to Millions.
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Join thousands of verified independent merchants and global suppliers. Benefit from our zero-hassle seller portal, instant order notifications, transparent commission rates, and same-week automated payouts.
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 sm:gap-4 text-[11px] sm:text-xs font-bold text-slate-300 pt-1">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Instant Store Setup</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Integrated Shipping</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Secure Escrow Payouts</span>
            </div>
          </div>

          <div className="shrink-0 z-10 w-full sm:w-auto">
            <button
              onClick={() => onNavigate('seller')}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Launch Seller Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Subtle background glow */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        </div>
      </section>

    </div>
  );
};
