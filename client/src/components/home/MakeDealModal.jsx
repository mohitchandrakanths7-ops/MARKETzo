import React, { useState } from 'react';
import { X, Tag, DollarSign, Send, CheckCircle, ShieldCheck, Sparkles } from 'lucide-react';
import { api } from '../../services/api';
import { useCurrency } from '../../context/CurrencyContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

export const MakeDealModal = ({ isOpen, onClose, product }) => {
  const { user } = useAuth();
  const { formatPrice, currentCurrency, activeCurrencyInfo } = useCurrency();
  const { showSuccess, showError } = useToast();

  const [offerPrice, setOfferPrice] = useState('');
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [customerNote, setCustomerNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen || !product) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numOffer = parseFloat(offerPrice);
    if (isNaN(numOffer) || numOffer <= 0) {
      showError('Please enter a valid offer price.');
      return;
    }

    if (numOffer >= product.price) {
      showError(`Your offer must be less than the listed price of ${formatPrice(product.price)}.`);
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.submitMakeDeal({
        productId: product.id,
        offerPrice: numOffer,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim(),
        customerNote: customerNote.trim()
      });

      if (res.success) {
        setIsSubmitted(true);
        showSuccess('Offer submitted successfully to the merchant!');
      } else {
        showError(res.message || 'Could not submit offer.');
      }
    } catch (err) {
      console.error('Submit deal error:', err);
      showError('Failed to send offer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateDiscount = () => {
    const num = parseFloat(offerPrice);
    if (!num || num >= product.price) return 0;
    return Math.round(((product.price - num) / product.price) * 100);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {isSubmitted ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-slate-900">Offer Submitted!</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Your custom price offer of <strong className="text-slate-800">{formatPrice(parseFloat(offerPrice))}</strong> has been delivered directly to the seller for <strong>{product.name}</strong>.
            </p>
            <p className="text-[11px] text-slate-400">
              The merchant can accept, counter-offer, or reject within 24 hours. You will receive updates via email & notifications.
            </p>
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all"
            >
              Done & Return
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-black uppercase tracking-wider mb-2">
                <Tag className="w-3 h-3 text-amber-500" />
                <span>Make Me a Deal</span>
              </div>
              <h2 className="text-xl font-black text-slate-900">Name Your Price</h2>
              <p className="text-xs text-slate-500">Submit a reasonable price offer directly to the verified merchant.</p>
            </div>

            {/* Product Summary Mini Card */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
              <img
                src={product.images?.[0] || product.image || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=200'}
                alt={product.name}
                className="w-14 h-14 object-cover rounded-xl bg-white shrink-0 border border-slate-200"
              />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-xs text-slate-800 line-clamp-1">{product.name}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Listed Price: <strong className="text-slate-900">{formatPrice(product.price)}</strong></div>
                <div className="text-[10px] text-indigo-600 font-semibold">{product.sellerName || 'Verified Merchant'}</div>
              </div>
            </div>

            {/* Offer Input Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Your Offer Amount ({currentCurrency})</label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  required
                  placeholder={`e.g. ${Math.round(product.price * 0.85)}`}
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                  className="w-full pl-4 pr-16 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 focus:bg-white transition-all"
                />
                {offerPrice && calculateDiscount() > 0 && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black bg-rose-100 text-rose-700 px-2 py-0.5 rounded-md">
                    {calculateDiscount()}% OFF
                  </span>
                )}
              </div>
            </div>

            {/* Note to Seller */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Message / Note for Merchant (Optional)</label>
              <textarea
                rows={2}
                value={customerNote}
                onChange={(e) => setCustomerNote(e.target.value)}
                placeholder="e.g. Ready for immediate checkout if you can accept this offer."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-indigo-500 focus:bg-white transition-all"
              />
            </div>

            {/* Contact Details */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600">Your Name</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600">Email Address</label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="name@email.com"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Sending Offer...' : 'Submit Offer to Seller'}</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
