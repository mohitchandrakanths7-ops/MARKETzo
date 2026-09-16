import React from 'react';
import { ShoppingBag, ArrowLeft, Trash2, Bookmark, Sparkles, ShieldCheck } from 'lucide-react';
import { CartItem } from '../components/cart/CartItem';
import { PriceSummary } from '../components/cart/PriceSummary';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export const CartPage = ({ onNavigate, onOpenAuthModal }) => {
  const { items, savedItems, updateQuantity, removeFromCart, toggleSaveForLater, clearCart, summary } = useCart();
  const { isAuthenticated } = useAuth();

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      onOpenAuthModal();
    } else {
      onNavigate('checkout');
    }
  };

  if (items.length === 0 && savedItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#080c14] md:bg-transparent text-white md:text-slate-900 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-[#111827] md:bg-white rounded-3xl border border-white/10 md:border-slate-200 p-8 sm:p-12 text-center max-w-lg mx-auto shadow-2xl space-y-4">
          <div className="w-20 h-20 rounded-3xl bg-[#0a0f1d] md:bg-indigo-50 text-blue-400 md:text-indigo-600 flex items-center justify-center mx-auto shadow-inner border border-white/5 md:border-transparent">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-white md:text-slate-900 tracking-tight">Your Cart is Empty</h2>
          <p className="text-xs text-slate-400 md:text-slate-500 leading-relaxed max-w-xs mx-auto">
            Discover thousands of top deals, flagship electronics, and curated designer pieces with lightning fast shipping.
          </p>
          <div className="pt-2">
            <button
              onClick={() => onNavigate('products', {})}
              className="px-8 py-3.5 text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-lg cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                boxShadow: '0 0 20px rgba(139, 92, 246, 0.4)'
              }}
            >
              Start Shopping Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080c14] md:bg-transparent text-white md:text-slate-900 pb-28 md:pb-16 max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 sm:space-y-8 transition-colors">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10 md:border-slate-200">
        <div>
          <button
            onClick={() => onNavigate('products', {})}
            className="text-xs font-bold text-blue-400 md:text-indigo-600 hover:underline flex items-center gap-1.5 mb-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Continue Shopping</span>
          </button>
          <h1 className="text-xl sm:text-3xl font-black text-white md:text-slate-900 tracking-tight">
            Shopping Cart ({summary.itemCount || items.length} items)
          </h1>
        </div>

        {items.length > 0 && (
          <button
            onClick={clearCart}
            className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Cart</span>
          </button>
        )}
      </div>

      {/* Main Grid: Item List + Price Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        
        {/* Cart items list */}
        <div className="lg:col-span-8 space-y-3.5">
          {items.map(item => (
            <CartItem
              key={item.id}
              item={item}
              onUpdateQty={updateQuantity}
              onRemove={removeFromCart}
              onSaveForLater={toggleSaveForLater}
              onNavigate={onNavigate}
            />
          ))}

          {/* Saved for Later Section */}
          {savedItems.length > 0 && (
            <div className="pt-6 space-y-3">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-black text-white md:text-slate-900 uppercase tracking-wider">
                <Bookmark className="w-4 h-4 text-purple-400" />
                <span>Saved for Later ({savedItems.length})</span>
              </div>

              <div className="space-y-3 opacity-90">
                {savedItems.map(item => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onUpdateQty={updateQuantity}
                    onRemove={removeFromCart}
                    onSaveForLater={toggleSaveForLater}
                    onNavigate={onNavigate}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Price Breakdown Sidebar */}
        <div className="lg:col-span-4 sticky top-28">
          <PriceSummary
            onProceedToCheckout={handleProceedToCheckout}
          />
        </div>

      </div>

    </div>
  );
};
