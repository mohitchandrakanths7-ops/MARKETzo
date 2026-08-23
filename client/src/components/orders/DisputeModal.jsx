import React, { useState } from 'react';
import { 
  ShieldCheck, 
  X, 
  AlertTriangle, 
  Upload, 
  Loader2, 
  CheckCircle2, 
  Image as ImageIcon 
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const DisputeModal = ({ isOpen, onClose, order, onDisputeCreated }) => {
  const { showSuccess, showError } = useToast();

  const [reason, setReason] = useState('damaged_product');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reasons = [
    { value: 'damaged_product', label: 'Damaged during transit / broken seal' },
    { value: 'defective', label: 'Defective item / not functioning' },
    { value: 'wrong_product', label: 'Wrong product or variant delivered' },
    { value: 'missing_items', label: 'Missing parts or accessories' },
    { value: 'not_as_described', label: 'Significantly different from description' },
    { value: 'not_received', label: 'Package marked delivered but not received' }
  ];

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim().startsWith('http')) {
      showError('Please enter a valid image URL starting with http:// or https://');
      return;
    }
    setImages(prev => [...prev, imageUrlInput.trim()]);
    setImageUrlInput('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      showError('Please provide a detailed description of the issue.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.createDispute({
        orderId: order.id,
        reason,
        description: description.trim(),
        images
      });

      if (res.success) {
        showSuccess('Buyer protection claim submitted successfully!');
        if (onDisputeCreated) onDisputeCreated(res.dispute);
        onClose();
      } else {
        showError(res.message || 'Failed to submit protection claim.');
      }
    } catch (err) {
      showError(err.message || 'Error submitting claim.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm text-white">Marketzo Buyer Protection</h3>
              <p className="text-[11px] text-slate-400">Return & Refund Claim for Order #{order.orderNumber}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          
          <div>
            <label className="font-bold text-slate-700 block mb-1.5">Reason for Return / Refund</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:border-indigo-600"
            >
              {reasons.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1.5">Detailed Description</label>
            <textarea
              rows={4}
              placeholder="Explain the problem encountered with the item or delivery in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:border-indigo-600 resize-none"
            />
          </div>

          {/* Evidence Photos */}
          <div className="space-y-2">
            <label className="font-bold text-slate-700 block">Photo Evidence (Optional but recommended)</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Paste image URL of package/defect..."
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:border-indigo-600 text-xs"
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold cursor-pointer transition-all shrink-0"
              >
                Add Photo
              </button>
            </div>

            {images.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {images.map((img, idx) => (
                  <div key={idx} className="relative group">
                    <img src={img} alt="Evidence" className="w-14 h-14 object-cover rounded-xl border border-slate-200" />
                    <button
                      type="button"
                      onClick={() => setImages(prev => prev.filter((_, i) => i !== idx))}
                      className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] cursor-pointer"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              Your claim will be forwarded to the seller for response. If unresolved within 48 hours, Marketzo Platform Arbitration will step in.
            </p>
          </div>

          {/* Submit */}
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
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-black transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-indigo-600/20"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              <span>Submit Protection Claim</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
