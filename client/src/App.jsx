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

import { HomePage } from './pages/HomePage';
import { ProductListingPage } from './pages/ProductListingPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { AccountPage } from './pages/AccountPage';
import { SellerDashboard } from './pages/SellerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';

function MainLayout() {
  const [currentRoute, setCurrentRoute] = useState('home');
  const [routeParams, setRouteParams] = useState({});
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');

  const navigate = (route, params = {}) => {
    setCurrentRoute(route);
    setRouteParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openAuthModal = (mode = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white">
      
      {/* Top Navbar */}
      <Header
        onNavigate={navigate}
        currentRoute={currentRoute}
        onOpenAuthModal={() => openAuthModal('login')}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentRoute === 'home' && (
          <HomePage onNavigate={navigate} />
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
