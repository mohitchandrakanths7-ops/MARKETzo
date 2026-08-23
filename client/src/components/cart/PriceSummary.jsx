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
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
      
      {/* Title */}
      <h3 className="font-extrabold text-slate-900 text-base uppercase tracking-wider pb-3 border-b border-slate-100">
        Order Summary
      </h3>

      {/* Coupon Apply Box */}
      {!isCheckoutPage && (
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-indigo-600" />
            <span>Apply Coupon Promo</span>
          </label>

          {appliedCoupon ? (
            <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Code <strong>{appliedCoupon.code}</strong> applied (-{formatPrice(couponDiscount)})</span>
              </div>
              <button
                onClick={removeCoupon}
                className="p-1 text-emerald-700 hover:text-rose-600 rounded-lg cursor-pointer"
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
                placeholder="Try MARKETZO10 or SUMMER25"
                className="flex-1 px-3.5 py-2 border border-slate-200 rounded-xl text-xs uppercase font-bold outline-none focus:border-indigo-600 bg-slate-50"
              />
              <button
                type="submit"
                disabled={isApplying}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
              >
                {isApplying ? 'Applying...' : 'Apply'}
              </button>
            </form>
          )}

          {/* Quick coupon hint pills */}
          {!appliedCoupon && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => applyCoupon('MARKETZO10')}
                className="px-2 py-0.5 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold cursor-pointer"
              >
                MARKETZO10 (10% off)
              </button>
              <button
                type="button"
                onClick={() => applyCoupon('SUMMER25')}
                className="px-2 py-0.5 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-800 text-[10px] font-bold cursor-pointer"
              >
                SUMMER25 (25% off)
              </button>
            </div>
          )}
        </div>
      )}

      {/* Breakdown line items */}
      <div className="space-y-2.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
        <div className="flex justify-between">
          <span>Items Subtotal ({summary.itemCount || 0} items)</span>
          <span className="font-semibold text-slate-800">{formatPrice(summary.originalSubtotal || summary.subtotal || 0)}</span>
        </div>

        {summary.totalDiscount > 0 && (
          <div className="flex justify-between text-emerald-600 font-medium">
            <span>Product Discounts</span>
            <span>-{formatPrice(summary.totalDiscount)}</span>
          </div>
        )}

        {couponDiscount > 0 && (
          <div className="flex justify-between text-emerald-600 font-bold">
            <span>Coupon Promo Savings</span>
            <span>-{formatPrice(couponDiscount)}</span>
          </div>
        )}

        <div className="flex justify-between">
          <span className="flex items-center gap-1">
            <Truck className="w-3.5 h-3.5 text-slate-400" />
            <span>Estimated Shipping</span>
          </span>
          <span className="font-semibold text-slate-800">
            {summary.shippingFee === 0 ? <strong className="text-emerald-600">FREE</strong> : formatPrice(summary.shippingFee)}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Estimated Sales Tax (8%)</span>
          <span className="font-semibold text-slate-800">{formatPrice(summary.estimatedTax || 0)}</span>
        </div>
      </div>

      {/* Total row */}
      <div className="pt-4 border-t-2 border-slate-100">
        <div className="flex items-baseline justify-between mb-1">
          <span className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">Total Amount</span>
          <span className="font-black text-2xl text-indigo-600">{formatPrice(finalTotal)}</span>
        </div>

        {discountSavings > 0 && (
          <div className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg text-center mt-2">
            🎉 You are saving {formatPrice(discountSavings)} on this order!
          </div>
        )}
      </div>

      {/* CTA Button */}
      {!isCheckoutPage && (
        <button
          onClick={onProceedToCheckout}
          disabled={summary.itemCount === 0}
          className="w-full py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <span>Proceed to Checkout</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      )}

      {/* Security note */}
      <div className="flex items-center gap-2 justify-center text-[11px] text-slate-400 pt-1">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>256-Bit SSL Encrypted Checkout Security</span>
      </div>

    </div>
  );
};
