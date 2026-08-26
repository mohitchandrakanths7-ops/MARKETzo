import React from 'react';
import { ChevronRight } from 'lucide-react';

const CATEGORY_ITEMS = [
  { name: 'Mobiles', slug: 'mobiles-tablets', emoji: '📱', color: 'from-blue-600/20 to-indigo-600/20' },
  { name: 'Laptops', slug: 'laptops-computers', emoji: '💻', color: 'from-indigo-600/20 to-purple-600/20' },
  { name: 'Fashion', slug: 'fashion-apparel', emoji: '👗', color: 'from-pink-600/20 to-rose-600/20' },
  { name: 'Electronics', slug: 'electronics-audio', emoji: '🎧', color: 'from-cyan-600/20 to-blue-600/20' },
  { name: 'Home & Kitchen', slug: 'home-kitchen', emoji: '🍳', color: 'from-amber-600/20 to-orange-600/20' },
  { name: 'Beauty', slug: 'beauty-skincare', emoji: '💄', color: 'from-rose-600/20 to-red-600/20' },
  { name: 'Sports', slug: 'sports-fitness', emoji: '⚽', color: 'from-emerald-600/20 to-teal-600/20' },
  { name: 'Furniture', slug: 'furniture', emoji: '🛋️', color: 'from-amber-700/20 to-yellow-600/20' },
];

export const DesktopCategoryGrid = ({ onNavigate }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-white tracking-tight">
          Shop by Category
        </h2>
        <button
          onClick={() => onNavigate('products', {})}
          className="flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
        >
          <span>View All</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
        {CATEGORY_ITEMS.map((cat, idx) => (
          <button
            key={idx}
            onClick={() => onNavigate('products', { category: cat.slug })}
            className="flex flex-col items-center p-4 rounded-2xl border transition-all duration-300 hover:scale-105 hover:border-indigo-500/40 group cursor-pointer"
            style={{
              background: '#101522',
              borderColor: 'rgba(255,255,255,0.07)'
            }}
          >
            {/* Category Avatar / Icon Box */}
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl mb-2.5 bg-gradient-to-br ${cat.color} border border-white/10 group-hover:shadow-lg group-hover:shadow-indigo-500/20 transition-all`}
            >
              <span className="transition-transform group-hover:scale-110">{cat.emoji}</span>
            </div>
            <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors text-center truncate w-full">
              {cat.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
