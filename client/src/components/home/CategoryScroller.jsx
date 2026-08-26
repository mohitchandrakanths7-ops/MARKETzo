import React, { useState, useEffect } from 'react';
import {
  Layers, Smartphone, Laptop, Headphones, Shirt, Gem,
  Home, Activity, ShoppingBag, Watch, BookOpen, Gamepad2, Sparkles
} from 'lucide-react';
import { api } from '../../services/api';

const FALLBACK_CATEGORIES = [
  { id: 'all', name: 'All', slug: '', icon: Layers, emoji: '✦' },
  { id: 'cat_electronics', name: 'Electronics', slug: 'electronics-audio', icon: Headphones, emoji: '🎧' },
  { id: 'cat_mobiles', name: 'Mobiles', slug: 'mobiles-tablets', icon: Smartphone, emoji: '📱' },
  { id: 'cat_laptops', name: 'Laptops', slug: 'laptops-computers', icon: Laptop, emoji: '💻' },
  { id: 'cat_fashion', name: 'Fashion', slug: 'fashion-apparel', icon: Shirt, emoji: '👕' },
  { id: 'cat_home', name: 'Home', slug: 'home-kitchen', icon: Home, emoji: '🏠' },
  { id: 'cat_beauty', name: 'Beauty', slug: 'beauty-skincare', icon: Sparkles, emoji: '✨' },
  { id: 'cat_sports', name: 'Sports', slug: 'sports-fitness', icon: Activity, emoji: '⚡' },
  { id: 'cat_jewellery', name: 'Jewellery', slug: 'jewellery-watches', icon: Gem, emoji: '💎' },
  { id: 'gaming', name: '🎮 Gaming', slug: 'gaming', icon: Gamepad2, emoji: '🎮', isGaming: true },
];

export const CategoryScroller = ({ onNavigate }) => {
  const [categories, setCategories] = useState([]);
  const [activeId, setActiveId] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.getCategories()
      .then(res => {
        if (res.success && res.categories?.length > 0) {
          // Merge with fallback, keeping "All" + "Gaming" pinned
          const apiCats = res.categories.slice(0, 7).map(c => ({
            id: c.id || c.slug,
            name: c.name,
            slug: c.slug || '',
            emoji: c.emoji || '●',
            isGaming: false
          }));
          setCategories([
            FALLBACK_CATEGORIES[0],
            ...apiCats,
            FALLBACK_CATEGORIES.find(c => c.isGaming)
          ]);
        } else {
          setCategories(FALLBACK_CATEGORIES);
        }
      })
      .catch(() => setCategories(FALLBACK_CATEGORIES))
      .finally(() => setIsLoading(false));
  }, []);

  const handleCategoryClick = (cat) => {
    setActiveId(cat.id);
    if (cat.isGaming) {
      onNavigate('gaming');
    } else if (cat.id === 'all') {
      onNavigate('products', {});
    } else {
      onNavigate('products', { category: cat.slug || cat.id });
    }
  };

  if (isLoading) {
    return (
      <div className="px-4 pb-4 animate-fade-in-up animate-fade-in-up-delay-2">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="skeleton-dark shrink-0 h-9 rounded-full"
              style={{ width: `${60 + (i % 3) * 20}px` }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pb-4 animate-fade-in-up animate-fade-in-up-delay-2">
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {categories.map((cat) => {
          const isActive = activeId === cat.id;
          const isGaming = cat.isGaming;

          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat)}
              className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer press-feedback transition-all ${
                isGaming ? 'gaming-glow' : ''
              } ${isActive ? 'category-active-glow' : ''}`}
              style={{
                background: isActive
                  ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)'
                  : isGaming
                  ? 'rgba(139, 92, 246, 0.15)'
                  : 'rgba(255,255,255,0.07)',
                border: isActive
                  ? 'none'
                  : isGaming
                  ? '1px solid rgba(139,92,246,0.4)'
                  : '1px solid rgba(255,255,255,0.08)',
                color: isActive ? '#ffffff' : isGaming ? '#a78bfa' : 'rgba(203,213,225,0.85)'
              }}
              aria-pressed={isActive}
            >
              <span>{cat.emoji || cat.name[0]}</span>
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
