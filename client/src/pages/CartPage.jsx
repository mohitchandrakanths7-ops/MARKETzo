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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-sm space-y-4">
          <div className="w-20 h-20 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-inner">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Your Cart is Empty</h2>
          <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
            Discover thousands of top deals, flagship electronics, and curated designer pieces with lightning fast shipping.
          </p>
          <div className="pt-2">
            <button
              onClick={() => onNavigate('products', {})}
              className="px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-lg shadow-indigo-200"
            >
              Start Shopping Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <button
            onClick={() => onNavigate('products', {})}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Continue Shopping</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Shopping Cart ({summary.itemCount || items.length} items)
          </h1>
        </div>

        {items.length > 0 && (
          <button
            onClick={clearCart}
            className="text-xs font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1 self-start sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Cart</span>
          </button>
        )}
      </div>

      {/* Main Grid: Item List + Price Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Cart items list */}
        <div className="lg:col-span-8 space-y-4">
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
            <div className="pt-8 space-y-4">
              <div className="flex items-center gap-2 text-sm font-black text-slate-900 uppercase tracking-wider">
                <Bookmark className="w-4 h-4 text-indigo-600" />
                <span>Saved for Later ({savedItems.length})</span>
              </div>

              <div className="space-y-4 opacity-90">
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
