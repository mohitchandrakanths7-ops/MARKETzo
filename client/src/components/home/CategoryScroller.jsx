import React, { useState } from 'react';
import {
  Layers, Headphones, Shirt, Smartphone, Gamepad2, Home, Sparkles, Activity
} from 'lucide-react';

const MARKETZO_CATEGORIES = [
  { id: 'all', name: 'All Departments', categoryKey: '', icon: Layers, emoji: '✨' },
  { id: 'cat_electronics', name: 'Electronics', categoryKey: 'cat_electronics', slug: 'electronics-audio', icon: Headphones, emoji: '🎧' },
  { id: 'cat_fashion', name: 'Fashion', categoryKey: 'cat_fashion', slug: 'fashion-apparel', icon: Shirt, emoji: '👕' },
  { id: 'cat_mobiles', name: 'Mobiles', categoryKey: 'cat_mobiles', slug: 'mobiles-tablets', icon: Smartphone, emoji: '📱' },
  { id: 'cat_gaming', name: 'Gaming', categoryKey: 'cat_gaming', slug: 'gaming-zone', icon: Gamepad2, emoji: '🎮', isGaming: true },
  { id: 'cat_home', name: 'Home', categoryKey: 'cat_home', slug: 'home-kitchen', icon: Home, emoji: '🏠' },
  { id: 'cat_beauty', name: 'Beauty', categoryKey: 'cat_beauty', slug: 'beauty-skincare', icon: Sparkles, emoji: '💄' },
  { id: 'cat_sports', name: 'Sports', categoryKey: 'cat_sports', slug: 'sports-fitness', icon: Activity, emoji: '⚡' },
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
      // Pass the specific category ID to strictly filter matching products
      onNavigate('products', { category: cat.categoryKey || cat.id });
    }
  };

  return (
    <div className="px-3 sm:px-4 pb-3 animate-fade-in-up">
      <div 
        className="flex gap-2 overflow-x-auto no-scrollbar py-1 scroll-smooth"
        style={{
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none'
        }}
      >
        {MARKETZO_CATEGORIES.map((cat) => {
          const isActive = activeId === cat.id;
          const isGaming = cat.isGaming;

          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat)}
              className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap cursor-pointer press-feedback transition-all duration-200 shadow-2xs border ${
                isActive
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-200'
                  : isGaming
                  ? 'bg-purple-950/90 text-purple-200 border-purple-800 hover:bg-purple-900 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200/90 hover:border-slate-300 hover:bg-slate-50'
              }`}
              style={{
                minHeight: '42px'
              }}
              aria-pressed={isActive}
            >
              <span className="text-sm">{cat.emoji}</span>
              <span className="font-extrabold">{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
