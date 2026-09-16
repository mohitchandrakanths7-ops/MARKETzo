import React from 'react';
import { ShoppingCart, ChevronRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';

export const FloatingCartBar = ({ onNavigate }) => {
  const { itemCount, summary, finalTotal } = useCart();
  const { formatPrice } = useCurrency();

  // Only render when cart has items
  if (!itemCount || itemCount === 0) return null;

  const displayTotal = finalTotal > 0 ? finalTotal : (summary?.totalAmount || 0);

  const handleCheckout = () => {
    onNavigate('checkout');
  };

  const handleCartOpen = () => {
    onNavigate('cart');
  };

  return (
    <div
      className="fixed left-0 right-0 z-30 px-3 sm:px-4 animate-slide-up"
      style={{
        bottom: 'calc(58px + env(safe-area-inset-bottom, 0px) + 6px)',
        pointerEvents: 'auto'
      }}
    >
      <div
        className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xl max-w-md mx-auto"
      >
        {/* Cart icon + item count */}
        <button
          type="button"
          onClick={handleCartOpen}
          className="relative flex items-center gap-2.5 cursor-pointer press-feedback flex-1"
          aria-label={`Cart with ${itemCount} items`}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-indigo-50 text-indigo-600 border border-indigo-100"
          >
            <ShoppingCart className="w-4 h-4" />
          </div>
          <div className="text-left">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 leading-none">
              {itemCount} {itemCount === 1 ? 'Item' : 'Items'} in Cart
            </div>
            <div
              className="text-sm font-black text-slate-900 leading-tight mt-0.5"
            >
              {formatPrice(displayTotal)}
            </div>
          </div>
        </button>

        {/* Divider */}
        <div className="w-px h-7 bg-slate-200 shrink-0" />

        {/* Checkout CTA */}
        <button
          type="button"
          onClick={handleCheckout}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200 cursor-pointer press-feedback shrink-0"
          aria-label="Proceed to checkout"
        >
          <span>Checkout</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
