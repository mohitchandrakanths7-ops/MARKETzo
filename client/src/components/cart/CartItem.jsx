import React from 'react';
import { Plus, Minus, Trash2, Bookmark, Store } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';

export const CartItem = ({
  item,
  onUpdateQty,
  onRemove,
  onSaveForLater,
  onNavigate
}) => {
  const { formatPrice } = useCurrency();

  return (
    <div className="flex flex-row gap-3 sm:gap-4 p-3.5 sm:p-5 bg-[#111827] md:bg-white rounded-3xl border border-white/10 md:border-slate-200/90 shadow-md transition-all">
      
      {/* Thumbnail */}
      <div 
        onClick={() => onNavigate('product-detail', { id: item.productId || item.slug })}
        className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl bg-[#0a0f1d] md:bg-slate-100 overflow-hidden shrink-0 cursor-pointer border border-white/5 md:border-transparent flex items-center justify-center p-1.5"
      >
        <img
          src={item.image}
          alt={item.name}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80';
          }}
          className="w-full h-full object-contain hover:scale-105 transition-transform"
        />
      </div>

      {/* Item info */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3
              onClick={() => onNavigate('product-detail', { id: item.productId || item.slug })}
              className="font-bold text-xs sm:text-sm text-white md:text-slate-800 hover:text-blue-400 cursor-pointer line-clamp-2 leading-snug"
            >
              {item.name}
            </h3>

            {/* Price */}
            <div className="text-right shrink-0">
              <div className="font-black text-sm sm:text-base text-white md:text-slate-900">
                {formatPrice(item.price * item.quantity)}
              </div>
              {item.quantity > 1 && (
                <div className="text-[10px] sm:text-[11px] text-slate-400">
                  {formatPrice(item.price)} each
                </div>
              )}
            </div>
          </div>

          {/* Variant & Seller details */}
          <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-400 md:text-slate-500">
            {item.variant && (
              <span className="px-2 py-0.5 rounded-lg bg-blue-950 md:bg-indigo-50 text-blue-300 md:text-indigo-700 font-semibold text-[10px] border border-blue-800 md:border-transparent">
                {item.variant}
              </span>
            )}
            <span className="flex items-center gap-1 text-[10px] sm:text-[11px] text-slate-400">
              <Store className="w-3 h-3 text-blue-400" />
              <span>{item.sellerName || 'Marketzo Merchant'}</span>
            </span>
          </div>
        </div>

        {/* Action Controls: Quantity, Save for later, Remove */}
        <div className="flex items-center justify-between pt-2.5 border-t border-white/5 md:border-slate-100 mt-2.5">
          
          {/* Quantity Stepper */}
          <div className="flex items-center border border-white/10 md:border-slate-200 rounded-xl overflow-hidden bg-[#0a0f1d] md:bg-slate-50">
            <button
              onClick={() => onUpdateQty(item.id, item.quantity - 1)}
              className="p-1.5 hover:bg-[#1a233a] md:hover:bg-slate-200 text-slate-300 md:text-slate-600 transition-colors cursor-pointer"
              disabled={item.quantity <= 1}
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="px-3 text-xs font-bold text-white md:text-slate-900 min-w-[28px] text-center">
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdateQty(item.id, item.quantity + 1)}
              className="p-1.5 hover:bg-[#1a233a] md:hover:bg-slate-200 text-slate-300 md:text-slate-600 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Secondary buttons */}
          <div className="flex items-center gap-3 text-xs font-semibold">
            <button
              onClick={() => onSaveForLater(item.id)}
              className="flex items-center gap-1 text-slate-400 hover:text-blue-400 transition-colors cursor-pointer"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>{item.savedForLater ? 'Move to Cart' : 'Save'}</span>
            </button>

            <button
              onClick={() => onRemove(item.id)}
              className="flex items-center gap-1 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove</span>
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};
