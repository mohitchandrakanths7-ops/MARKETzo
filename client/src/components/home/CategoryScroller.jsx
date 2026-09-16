import React, { useState } from 'react';
import {
  Layers, Headphones, Shirt, Smartphone, Gamepad2, Home, Sparkles, Activity
} from 'lucide-react';

const MARKETZO_CATEGORIES = [
  { id: 'all', name: 'All', categoryKey: '', icon: Layers, emoji: '✨' },
  { id: 'cat_electronics', name: 'Electronics', categoryKey: 'cat_electronics', slug: 'electronics-audio', icon: Headphones, emoji: '🎧' },
  { id: 'cat_fashion', name: 'Fashion', categoryKey: 'cat_fashion', slug: 'fashion-apparel', icon: Shirt, emoji: '👕' },
  { id: 'cat_home', name: 'Home', categoryKey: 'cat_home', slug: 'home-kitchen', icon: Home, emoji: '🏠' },
  { id: 'cat_beauty', name: 'Beauty', categoryKey: 'cat_beauty', slug: 'beauty-skincare', icon: Sparkles, emoji: '💄' },
  { id: 'cat_gaming', name: 'Gaming', categoryKey: 'cat_gaming', slug: 'gaming-zone', icon: Gamepad2, emoji: '🎮', isGaming: true },
  { id: 'cat_sports', name: 'Sports', categoryKey: 'cat_sports', slug: 'sports-fitness', icon: Activity, emoji: '⚡' },
  { id: 'cat_mobiles', name: 'Mobiles', categoryKey: 'cat_mobiles', slug: 'mobiles-tablets', icon: Smartphone, emoji: '📱' },
];

export const CategoryScroller = ({ onNavigate, selectedCategory = 'all' }) => {
  const [activeId, setActiveId] = useState(selectedCategory);

  const handleCategoryClick = (cat) => {
    setActiveId(cat.id);
    if (cat.isGaming) {
      onNavigate('gaming');
    } else if (cat.id === 'all') {
      onNavigate('products', {});
    } else {
      // Pass the specific category ID to strictly filter matching products in backend
      onNavigate('products', { category: cat.categoryKey || cat.id });
    }
  };

  return (
    <div className="px-3.5 pb-3 pt-1 animate-fade-in-up">
      <div 
        className="flex gap-2 overflow-x-auto no-scrollbar py-1 scroll-smooth items-center"
        style={{
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none'
        }}
      >
        {MARKETZO_CATEGORIES.map((cat) => {
          const isActive = activeId === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat)}
              className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer press-feedback transition-all duration-200 border ${
                isActive
                  ? 'text-white border-transparent shadow-[0_0_16px_rgba(139,92,246,0.45)]'
                  : 'bg-[#111827] text-slate-400 border-white/10 hover:text-slate-200 hover:bg-[#1a233a]'
              }`}
              style={{
                minHeight: '38px',
                background: isActive ? 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' : undefined
              }}
              aria-pressed={isActive}
            >
              <span className="text-sm">{cat.emoji}</span>
              <span className="font-extrabold tracking-wide">{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
