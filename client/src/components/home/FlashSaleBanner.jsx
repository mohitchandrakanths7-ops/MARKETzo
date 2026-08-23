import React, { useState, useEffect } from 'react';
import { Flame, Clock, ArrowRight, Zap } from 'lucide-react';
import { api } from '../../services/api';
import { useCurrency } from '../../context/CurrencyContext';

export const FlashSaleBanner = ({ onNavigate }) => {
  const { formatPrice } = useCurrency();
  const [flashSales, setFlashSales] = useState([]);
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 25, seconds: 18 });

  useEffect(() => {
    loadFlashSales();
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 0, minutes: 0, seconds: 0 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const loadFlashSales = async () => {
    try {
      const res = await api.getActiveFlashSales();
      if (res.success && res.flashSales?.length > 0) {
        setFlashSales(res.flashSales);
      }
    } catch (err) {
      console.error('Fetch flash sales error:', err);
    }
  };

  if (flashSales.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-amber-500 via-rose-500 to-amber-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden my-8">
      {/* Background patterns */}
      <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-white/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 space-y-6">
        
        {/* Banner Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-300 animate-pulse" />
                <span>Limited-Time Flash Deals</span>
              </span>
              <span className="px-2.5 py-0.5 bg-slate-950 text-amber-400 rounded-full text-[10px] font-black uppercase">
                Up to 40% OFF
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Deals of the Day — Grab Before Stock Runs Out!
            </h2>
          </div>

          {/* Countdown Clock */}
          <div className="flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 self-start sm:self-auto shadow-inner">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="text-xs font-bold text-slate-300">Ends in:</div>
            <div className="flex items-center gap-1 font-mono text-xs font-black text-amber-300">
              <span className="bg-white/10 px-2 py-1 rounded-lg">{String(timeLeft.hours).padStart(2, '0')}h</span>
              <span>:</span>
              <span className="bg-white/10 px-2 py-1 rounded-lg">{String(timeLeft.minutes).padStart(2, '0')}m</span>
              <span>:</span>
              <span className="bg-white/10 px-2 py-1 rounded-lg">{String(timeLeft.seconds).padStart(2, '0')}s</span>
            </div>
          </div>
        </div>

        {/* Flash Sale Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {flashSales.slice(0, 4).map(sale => {
            const prod = sale.product;
            if (!prod) return null;
            const remaining = sale.saleStockRemaining || 5;
            const total = sale.saleStockTotal || 20;
            const percentSold = Math.min(100, Math.round(((total - remaining) / total) * 100));

            return (
              <div 
                key={sale.id}
                onClick={() => onNavigate && onNavigate('product-detail', { id: prod.id })}
                className="bg-white text-slate-900 rounded-2xl p-4 shadow-md hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="relative rounded-xl overflow-hidden aspect-square bg-slate-100">
                    <img 
                      src={prod.images?.[0] || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&auto=format&fit=crop&q=80'} 
                      alt={prod.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-rose-600 text-white rounded-lg text-[10px] font-black tracking-wide uppercase shadow-xs">
                      {sale.discountPercent}% OFF
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-xs text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                      {prod.name}
                    </h4>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="font-black text-sm text-indigo-600">
                        {formatPrice(sale.salePrice)}
                      </span>
                      <span className="text-xs text-slate-400 line-through">
                        {formatPrice(sale.originalPrice)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stock Progress Bar */}
                <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="text-rose-600 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-rose-500 fill-rose-500" />
                      Only {remaining} left
                    </span>
                    <span className="text-slate-400">{percentSold}% sold</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full transition-all"
                      style={{ width: `${percentSold}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
