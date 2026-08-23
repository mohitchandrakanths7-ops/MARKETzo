import React, { useState } from 'react';
import { 
  Package, 
  X, 
  Send, 
  Loader2, 
  Layers, 
  DollarSign,
  Building2 
} from 'lucide-react';
import { api } from '../../services/api';
import { useCurrency } from '../../context/CurrencyContext';
import { useToast } from '../../context/ToastContext';

export const WholesaleRfqModal = ({ isOpen, onClose, product }) => {
  const { currentCurrency, formatPrice } = useCurrency();
  const { showSuccess, showError } = useToast();

  const [quantity, setQuantity] = useState(product?.moq || 20);
  const [targetPrice, setTargetPrice] = useState(+(product?.price * 0.8).toFixed(2) || 100);
  const [destination, setDestination] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!quantity || quantity < 1) {
      showError('Please enter a valid bulk target quantity.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.submitRfq({
        productId: product.id,
        targetQuantity: parseInt(quantity),
        targetPricePerUnit: parseFloat(targetPrice),
        shippingDestination: destination.trim() || 'Default Delivery Address',
        buyerMessage: message.trim(),
        currency: currentCurrency
      });

      if (res.success) {
        showSuccess('Bulk Quote Request (RFQ) dispatched to seller!');
        onClose();
      } else {
        showError(res.message || 'Failed to submit RFQ.');
      }
    } catch (err) {
      showError(err.message || 'Error submitting RFQ.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm text-white">Wholesale Bulk Request for Quote (RFQ)</h3>
                <span className="px-2 py-0.5 bg-amber-400 text-slate-950 rounded-full text-[9px] font-black uppercase">
                  B2B Bulk
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Direct volume negotiation with verified manufacturer</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Product Context */}
        <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center gap-3 text-xs shrink-0">
          <img
            src={product.images?.[0] || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=120&auto=format&fit=crop&q=80'}
            alt={product.name}
            className="w-10 h-10 rounded-xl object-cover bg-white border border-slate-200 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-slate-900 truncate">{product.name}</h4>
            <div className="text-[11px] text-slate-500">
              Retail Price: <strong className="text-slate-800">{formatPrice(product.price)}</strong> • Minimum MOQ: <strong>{product.moq || 5} units</strong>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1.5">Required Quantity (Units)</label>
              <input
                type="number"
                min={product.moq || 1}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1.5">Target Price / Unit ({currentCurrency})</label>
              <input
                type="number"
                step="0.01"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1.5">Destination Port / Delivery Address</label>
            <input
              type="text"
              placeholder="e.g. San Francisco, California, United States / Mumbai, India"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:border-indigo-600"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1.5">Procurement Inquiry Details & Specifications</label>
            <textarea
              rows={3}
              placeholder="Specify branding requirements, packaging specifications, delivery timeline..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:border-indigo-600 resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-black transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-amber-500/20"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>Send Bulk RFQ to Seller</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
