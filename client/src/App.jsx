import React, { useState, useEffect } from 'react';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { MobileBottomNav } from './components/common/MobileBottomNav';
import { AuthModal } from './pages/AuthPages';

// Dynamic Lazy-Loaded Page Components for Lightning-Fast Initial Load
const HomePage = React.lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })));
const GamingZonePage = React.lazy(() => import('./pages/GamingZonePage').then(m => ({ default: m.GamingZonePage })));
const ProductListingPage = React.lazy(() => import('./pages/ProductListingPage').then(m => ({ default: m.ProductListingPage })));
const ProductDetailPage = React.lazy(() => import('./pages/ProductDetailPage').then(m => ({ default: m.ProductDetailPage })));
const CartPage = React.lazy(() => import('./pages/CartPage').then(m => ({ default: m.CartPage })));
const CheckoutPage = React.lazy(() => import('./pages/CheckoutPage').then(m => ({ default: m.CheckoutPage })));
const AccountPage = React.lazy(() => import('./pages/AccountPage').then(m => ({ default: m.AccountPage })));
const SellerDashboard = React.lazy(() => import('./pages/SellerDashboard').then(m => ({ default: m.SellerDashboard })));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })));

// Sleek Page Loading Fallback
const PageLoadingFallback = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-4">
    <div className="relative w-12 h-12">
      <div className="w-12 h-12 rounded-2xl bg-indigo-600 animate-ping opacity-25" />
      <div className="absolute inset-0 w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-lg shadow-indigo-500/40 flex items-center justify-center text-white font-black text-lg">
        M
      </div>
    </div>
    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest animate-pulse">
      Loading MARKETZO...
    </div>
  </div>
);

function MainLayout() {
  const [currentRoute, setCurrentRoute] = useState(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path.includes('gaming') || hash.includes('gaming')) return 'gaming';
      if (path.includes('cart') || hash.includes('cart')) return 'cart';
      if (path.includes('checkout') || hash.includes('checkout')) return 'checkout';
      if (path.includes('seller') || hash.includes('seller')) return 'seller';
      if (path.includes('admin') || hash.includes('admin')) return 'admin';
    }
    return 'home';
  });
  const [routeParams, setRouteParams] = useState({});
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');

  const navigate = (route, params = {}) => {
    setCurrentRoute(route);
    setRouteParams(params);
    if (typeof window !== 'undefined' && window.history) {
      const url = route === 'home' ? '/' : `/${route}`;
      window.history.pushState({ route, params }, '', url);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handlePopState = (e) => {
      if (e.state && e.state.route) {
        setCurrentRoute(e.state.route);
        setRouteParams(e.state.params || {});
      } else {
        const path = window.location.pathname.toLowerCase();
        if (path.includes('gaming')) setCurrentRoute('gaming');
        else setCurrentRoute('home');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const openAuthModal = (mode = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#060914] text-slate-100 selection:bg-indigo-500 selection:text-white">
      
      {/* Top Navbar */}
      <Header
        onNavigate={navigate}
        currentRoute={currentRoute}
        onOpenAuthModal={() => openAuthModal('login')}
      />

      {/* Main View Router with Suspense */}
      <main className="flex-1">
        <React.Suspense fallback={<PageLoadingFallback />}>
          {currentRoute === 'home' && (
            <HomePage onNavigate={navigate} />
          )}

          {currentRoute === 'gaming' && (
            <GamingZonePage onNavigate={navigate} />
          )}

          {currentRoute === 'products' && (
            <ProductListingPage
              routeParams={routeParams}
              onNavigate={navigate}
            />
          )}

          {currentRoute === 'product-detail' && (
            <ProductDetailPage
              routeParams={routeParams}
              onNavigate={navigate}
            />
          )}

          {currentRoute === 'cart' && (
            <CartPage
              onNavigate={navigate}
              onOpenAuthModal={() => openAuthModal('login')}
            />
          )}

          {currentRoute === 'checkout' && (
            <CheckoutPage
              onNavigate={navigate}
            />
          )}

          {(currentRoute === 'account' || currentRoute === 'wishlist') && (
            <AccountPage
              routeParams={{ ...routeParams, tab: currentRoute === 'wishlist' ? 'wishlist' : (routeParams.tab || 'orders') }}
              onNavigate={navigate}
            />
          )}

          {currentRoute === 'seller' && (
            <SellerDashboard
              onNavigate={navigate}
            />
          )}

          {currentRoute === 'admin' && (
            <AdminDashboard
              onNavigate={navigate}
            />
          )}
        </React.Suspense>
      </main>

      {/* Marketplace Multi-Column Footer */}
      <Footer onNavigate={navigate} />

      {/* Mobile App Bottom Navigation Bar */}
      <MobileBottomNav
        currentRoute={currentRoute}
        onNavigate={navigate}
        onOpenAuthModal={() => openAuthModal('login')}
      />

      {/* Global Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onNavigate={navigate}
        defaultMode={authModalMode}
      />

    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CurrencyProvider>
          <CartProvider>
            <WishlistProvider>
              <MainLayout />
            </WishlistProvider>
          </CartProvider>
        </CurrencyProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
