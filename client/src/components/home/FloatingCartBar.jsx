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
      className="fixed left-0 right-0 z-40 px-4 animate-slide-up"
      style={{
        bottom: 'calc(64px + env(safe-area-inset-bottom, 0px) + 8px)',
        pointerEvents: 'auto'
      }}
    >
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl"
        style={{
          background: 'rgba(17, 24, 39, 0.97)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 -4px 30px rgba(59,130,246,0.15), 0 8px 32px rgba(0,0,0,0.4)'
        }}
      >
        {/* Cart icon + item count */}
        <button
          onClick={handleCartOpen}
          className="relative flex items-center gap-2 cursor-pointer press-feedback flex-1"
          aria-label={`Cart with ${itemCount} items`}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(59,130,246,0.15)' }}
          >
            <ShoppingCart className="w-4 h-4" style={{ color: '#60a5fa' }} />
          </div>
          <div>
            <div className="text-[11px] font-black" style={{ color: '#e2e8f0' }}>
              {itemCount} {itemCount === 1 ? 'Item' : 'Items'}
            </div>
            <div
              className="text-xs font-black"
              style={{ color: '#f1f5f9' }}
            >
              {formatPrice(displayTotal)}
            </div>
          </div>
        </button>

        {/* Divider */}
        <div
          className="w-px h-8 shrink-0"
          style={{ background: 'rgba(255,255,255,0.1)' }}
        />

        {/* Checkout CTA */}
        <button
          onClick={handleCheckout}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black cursor-pointer press-feedback shrink-0"
          style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: '#ffffff' }}
          aria-label="Proceed to checkout"
        >
          <span>Checkout</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
