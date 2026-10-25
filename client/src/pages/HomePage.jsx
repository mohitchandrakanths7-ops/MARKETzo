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

// ── Mobile Homepage Components ────────────────────────────────────────────────
import { MobileHeader } from '../components/home/MobileHeader';
import { CategoryScroller } from '../components/home/CategoryScroller';
import { HeroCarousel } from '../components/home/HeroCarousel';
import { ProductCarousel } from '../components/home/ProductCarousel';
import { GamingZoneBanner } from '../components/home/GamingZoneBanner';
import { SellerCarousel } from '../components/home/SellerCarousel';
import { MarketzoPromise } from '../components/home/MarketzoPromise';
import { FloatingCartBar } from '../components/home/FloatingCartBar';
// ─────────────────────────────────────────────────────────────────────────────

// ── Desktop Homepage Components ───────────────────────────────────────────────
import { DesktopCategorySidebar } from '../components/home/DesktopCategorySidebar';
import { DesktopHero } from '../components/home/DesktopHero';
import { DesktopPromoCards } from '../components/home/DesktopPromoCards';
import { QuickAccessPanel } from '../components/home/QuickAccessPanel';
import { DesktopTrustStrip } from '../components/home/DesktopTrustStrip';
import { DesktopDealsSection } from '../components/home/DesktopDealsSection';
import { DesktopCategoryGrid } from '../components/home/DesktopCategoryGrid';
import { DesktopTopStores } from '../components/home/DesktopTopStores';
import { DesktopRecommended } from '../components/home/DesktopRecommended';
// ─────────────────────────────────────────────────────────────────────────────

export const HomePage = ({ onNavigate }) => {
  const { user, isAuthenticated } = useAuth();
  const { formatPrice, currentCurrency, activeCurrencyInfo } = useCurrency();

  // Core Data States
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [flashDeals, setFlashDeals] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [trustedSellers, setTrustedSellers] = useState([]);
  const [pickedProducts, setPickedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [aiPromptPreload, setAiPromptPreload] = useState('');
  const [showVisualModal, setShowVisualModal] = useState(false);
  const [dealModalProduct, setDealModalProduct] = useState(null);
  const [rfqModalProduct, setRfqModalProduct] = useState(null);

  // Live Flash Deals Countdown Timer (02:18:45)
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 18, seconds: 45 });

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
          setFlashDeals(all.filter(p => (p.discountPercent || 0) >= 20 || p.isHotDeal).slice(0, 6));
        }
      } catch (err) {
        console.error('Home load error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadHomeData();
  }, []);

  const formattedTimer = `${String(timeLeft.hours).padStart(2,'0')}:${String(timeLeft.minutes).padStart(2,'0')}:${String(timeLeft.seconds).padStart(2,'0')}`;

  return (
    <div className="overflow-x-hidden bg-[#030712] text-white">

      {/* =======================================================================
          MOBILE HOMEPAGE — Premium Futuristic Dark Interface (hidden on md+)
          ======================================================================= */}
      <div className="md:hidden min-h-screen pb-36 bg-[#030712] text-white">
        {/* Sticky compact header with Logo, Cart, Profile, Location, and Search Field */}
        <MobileHeader onNavigate={onNavigate} />

        {/* 1. Category horizontal scrollable pills */}
        <CategoryScroller onNavigate={onNavigate} />

        {/* 2. Hero promotional carousel below categories */}
        <HeroCarousel onNavigate={onNavigate} />

        {/* 3. Promotional Feature Cards (Crazy Deals, Wholesale, AI Find) */}
        <div className="px-3.5 my-3">
          <DesktopPromoCards
            onNavigate={onNavigate}
            onOpenAiAssistant={() => setShowAiAssistant(true)}
          />
        </div>

        {/* 4. 🎮 Gaming Zone Top-Level Destination Card */}
        <GamingZoneBanner onNavigate={onNavigate} />

        {/* 5. Featured Products horizontal carousel */}
        <ProductCarousel
          title="Featured Products"
          emoji="⭐"
          products={featuredProducts}
          isLoading={isLoading}
          onNavigate={onNavigate}
          viewAllParams={{ featured: 'true' }}
        />

        {/* 6. ⚡ Flash Deals with live countdown timer */}
        {(flashDeals.length > 0 || isLoading) && (
          <ProductCarousel
            title="Flash Deals"
            emoji="⚡"
            timerText={formattedTimer}
            isFlashDeal={true}
            products={flashDeals}
            isLoading={isLoading}
            onNavigate={onNavigate}
            viewAllParams={{ hotDeals: 'true' }}
          />
        )}

        {/* 7. 2-Column Responsive Mobile Product Grid Showcase */}
        <div className="px-3.5 mb-6 animate-fade-in-up">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm sm:text-base font-black text-white flex items-center gap-1.5">
                <span>🔥</span>
                <span>Trending Products</span>
              </h2>
              <p className="text-[11px] text-[#A8B5CC] font-medium">Top picks with 2-Day Express Shipping</p>
            </div>
            <button
              onClick={() => onNavigate('products', { trending: 'true' })}
              className="text-xs font-bold text-[#00C8FF] hover:underline cursor-pointer"
            >
              See All →
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5">
            {(trendingProducts.length > 0 ? trendingProducts : featuredProducts).slice(0, 8).map(p => (
              <ProductCard
                key={p.id}
                product={p}
                onNavigate={onNavigate}
                layout="grid"
              />
            ))}
          </div>
        </div>

        {/* 8. Popular Verified Merchants */}
        <SellerCarousel
          sellers={trustedSellers}
          isLoading={isLoading}
          onNavigate={onNavigate}
        />

        {/* 9. MARKETZO Promise trust section */}
        <MarketzoPromise />

        {/* 10. Floating cart summary bar (appears when cart has items) */}
        <FloatingCartBar onNavigate={onNavigate} />

        {/* Modals */}
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
          onClose={() => { setShowAiAssistant(false); setAiPromptPreload(''); }}
          onNavigate={onNavigate}
        />
      </div>


      {/* =======================================================================
          DESKTOP HOMEPAGE — Modern 3-Column Dark Premium Layout (hidden on mobile)
          ======================================================================= */}
      <div className="hidden md:block space-y-8 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5">
        
        {/* 3-Column Top Section: Categories Sidebar | Main Hero & Promo Cards & Trending Products | Right Sidebar */}
        <div className="grid grid-cols-12 gap-5 items-start">
          
          {/* Left Column: Categories Sidebar (~250-270px) */}
          <div className="col-span-3 lg:col-span-3 xl:col-span-2">
            <DesktopCategorySidebar onNavigate={onNavigate} />
          </div>

          {/* Center Column: Hero Banner + 3 Promo Cards + Trending Products */}
          <div className="col-span-6 lg:col-span-6 xl:col-span-7 flex flex-col space-y-5">
            
            {/* 1. Large Central Shopping Hero */}
            <DesktopHero
              onNavigate={onNavigate}
              onOpenAiAssistant={() => setShowAiAssistant(true)}
            />

            {/* 2. Three Promotional Feature Cards (Crazy Deals, Wholesale, AI Find) */}
            <DesktopPromoCards
              onNavigate={onNavigate}
              onOpenAiAssistant={() => setShowAiAssistant(true)}
            />

            {/* 3. Trending Products Section matching Reference Screenshot */}
            <div
              className="rounded-3xl p-5 border shadow-xl"
              style={{
                background: '#081225',
                borderColor: 'rgba(100, 149, 237, 0.22)'
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🔥</span>
                  <h2 className="text-base sm:text-lg font-black text-white tracking-wide">
                    Trending Products
                  </h2>
                </div>
                <button
                  onClick={() => onNavigate('products', { trending: 'true' })}
                  className="text-xs font-bold text-[#00C8FF] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>View All</span>
                  <span>→</span>
                </button>
              </div>

              {/* Grid of Product Cards with Clean White Image Surfaces */}
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5">
                {(trendingProducts.length > 0 ? trendingProducts : featuredProducts).slice(0, 8).map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onNavigate={onNavigate}
                    layout="grid"
                  />
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Account Panel | Gaming Zone | Top Stores (~360-390px) */}
          <div className="col-span-3 lg:col-span-3 xl:col-span-3">
            <QuickAccessPanel
              onNavigate={onNavigate}
              onOpenAuthModal={() => { setAiPromptPreload(''); setShowAiAssistant(false); }}
              sellers={trustedSellers}
            />
          </div>
        </div>

        {/* 100% Genuine Trust Badges Strip */}
        <DesktopTrustStrip />

        {/* Today's Best Deals Section with Live Countdown Timer */}
        <DesktopDealsSection
          products={flashDeals.length > 0 ? flashDeals : featuredProducts}
          timeLeft={timeLeft}
          onNavigate={onNavigate}
        />

        {/* Dedicated Gaming Zone Banner */}
        <GamingZoneBanner onNavigate={onNavigate} />

        {/* Shop By Category Modern Visual Grid */}
        <DesktopCategoryGrid onNavigate={onNavigate} />

        {/* Top Verified Marketplace Stores */}
        <DesktopTopStores
          sellers={trustedSellers}
          onNavigate={onNavigate}
        />

        {/* Recommended / Just For You Section */}
        <DesktopRecommended
          products={pickedProducts.length > 0 ? pickedProducts : trendingProducts}
          title={isAuthenticated ? `Recommended For You, ${user?.name ? user.name.split(' ')[0] : ''}` : "Popular on MARKETZO"}
          onNavigate={onNavigate}
        />

        {/* Trending Now Extended Section */}
        {trendingProducts.length > 8 && (
          <DesktopRecommended
            products={trendingProducts.slice(8)}
            title="More Trending Discoveries"
            onNavigate={onNavigate}
          />
        )}

        {/* Interactive Modals Mounts */}
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

    </div>
  );
};
