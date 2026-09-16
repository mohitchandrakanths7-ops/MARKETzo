import React, { useState } from 'react';
import { Tag, ShieldCheck, ArrowRight, X, Sparkles, Truck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';

export const PriceSummary = ({ onProceedToCheckout, isCheckoutPage = false }) => {
  const { summary, appliedCoupon, couponDiscount, finalTotal, applyCoupon, removeCoupon } = useCart();
  const { formatPrice } = useCurrency();
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;
    setIsApplying(true);
    await applyCoupon(couponCodeInput.trim());
    setIsApplying(false);
    setCouponCodeInput('');
  };

  const discountSavings = (summary.totalDiscount || 0) + (couponDiscount || 0);

  return (
    <div className="bg-[#111827] md:bg-white rounded-3xl p-5 sm:p-6 border border-white/10 md:border-slate-200 shadow-xl space-y-5">
      
      {/* Title */}
      <h3 className="font-extrabold text-white md:text-slate-900 text-base uppercase tracking-wider pb-3 border-b border-white/10 md:border-slate-100">
        Order Summary
      </h3>

      {/* Coupon Apply Box */}
      {!isCheckoutPage && (
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 md:text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-blue-400 md:text-indigo-600" />
            <span>Apply Coupon Promo</span>
          </label>

          {appliedCoupon ? (
            <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-950/80 md:bg-emerald-50 border border-emerald-800 md:border-emerald-200 text-emerald-300 md:text-emerald-800 text-xs font-bold">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Code <strong>{appliedCoupon.code}</strong> applied (-{formatPrice(couponDiscount)})</span>
              </div>
              <button
                onClick={removeCoupon}
                className="p-1 text-emerald-400 hover:text-rose-400 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                value={couponCodeInput}
                onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                placeholder="MARKETZO10 or SUMMER25"
                className="flex-1 px-3.5 py-2 border border-white/10 md:border-slate-200 rounded-xl text-xs uppercase font-bold outline-none focus:border-blue-500 bg-[#0a0f1d] md:bg-slate-50 text-white md:text-slate-900"
              />
              <button
                type="submit"
                disabled={isApplying}
                className="px-4 py-2 bg-[#1a233a] md:bg-slate-900 hover:bg-[#233050] text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
              >
                {isApplying ? '...' : 'Apply'}
              </button>
            </form>
          )}

          {/* Quick coupon hint pills */}
          {!appliedCoupon && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => applyCoupon('MARKETZO10')}
                className="px-2 py-0.5 rounded-md bg-blue-950 md:bg-indigo-50 hover:bg-blue-900 text-blue-300 md:text-indigo-700 text-[10px] font-bold cursor-pointer border border-blue-800 md:border-transparent"
              >
                MARKETZO10 (10% off)
              </button>
              <button
                type="button"
                onClick={() => applyCoupon('SUMMER25')}
                className="px-2 py-0.5 rounded-md bg-purple-950 md:bg-amber-50 hover:bg-purple-900 text-purple-300 md:text-amber-800 text-[10px] font-bold cursor-pointer border border-purple-800 md:border-transparent"
              >
                SUMMER25 (25% off)
              </button>
            </div>
          )}
        </div>
      )}

      {/* Breakdown line items */}
      <div className="space-y-2.5 text-xs text-slate-300 md:text-slate-600 pt-2 border-t border-white/10 md:border-slate-100">
        <div className="flex justify-between">
          <span>Items Subtotal ({summary.itemCount || 0} items)</span>
          <span className="font-semibold text-white md:text-slate-800">{formatPrice(summary.originalSubtotal || summary.subtotal || 0)}</span>
        </div>

        {summary.totalDiscount > 0 && (
          <div className="flex justify-between text-emerald-400 md:text-emerald-600 font-medium">
            <span>Product Discounts</span>
            <span>-{formatPrice(summary.totalDiscount)}</span>
          </div>
        )}

        {couponDiscount > 0 && (
          <div className="flex justify-between text-emerald-400 md:text-emerald-600 font-bold">
            <span>Coupon Promo Savings</span>
            <span>-{formatPrice(couponDiscount)}</span>
          </div>
        )}

        <div className="flex justify-between">
          <span className="flex items-center gap-1">
            <Truck className="w-3.5 h-3.5 text-slate-400" />
            <span>Estimated Shipping</span>
          </span>
          <span className="font-semibold text-white md:text-slate-800">
            {summary.shippingFee === 0 ? <strong className="text-emerald-400 md:text-emerald-600">FREE</strong> : formatPrice(summary.shippingFee)}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Estimated Sales Tax (8%)</span>
          <span className="font-semibold text-white md:text-slate-800">{formatPrice(summary.estimatedTax || 0)}</span>
        </div>
      </div>

      {/* Total row */}
      <div className="pt-4 border-t border-white/10 md:border-slate-100">
        <div className="flex items-baseline justify-between mb-1">
          <span className="font-black text-sm text-white md:text-slate-900 uppercase tracking-wider">Total Amount</span>
          <span className="font-black text-2xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 md:text-indigo-600">
            {formatPrice(finalTotal)}
          </span>
        </div>

        {discountSavings > 0 && (
          <div className="text-[11px] font-bold text-emerald-300 md:text-emerald-600 bg-emerald-950/80 md:bg-emerald-50 border border-emerald-800 md:border-transparent px-2.5 py-1 rounded-lg text-center mt-2">
            🎉 You are saving {formatPrice(discountSavings)} on this order!
          </div>
        )}
      </div>

      {/* CTA Button */}
      {!isCheckoutPage && (
        <button
          onClick={onProceedToCheckout}
          disabled={summary.itemCount === 0}
          className="w-full py-4 text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-lg cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            boxShadow: '0 0 20px rgba(139, 92, 246, 0.4)'
          }}
        >
          <span>Proceed to Checkout</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      )}

      {/* Security note */}
      <div className="flex items-center gap-2 justify-center text-[11px] text-slate-400 pt-1">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>256-Bit SSL Encrypted Checkout Security</span>
      </div>

    </div>
  );
};
