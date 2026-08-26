import React, { useState, useEffect } from 'react';
import {
  ChevronRight, Headphones, Smartphone, Laptop, Tv, Volume2,
  Camera, Shirt, Sparkles, Home, Armchair, Activity, Car,
  Gamepad2, BookOpen, Heart, Store, Gem
} from 'lucide-react';
import { api } from '../../services/api';

const FALLBACK_CATEGORIES = [
  { id: 'electronics', name: 'Electronics', slug: 'electronics-audio', icon: Headphones },
  { id: 'mobiles', name: 'Mobiles & Tablets', slug: 'mobiles-tablets', icon: Smartphone },
  { id: 'laptops', name: 'Laptops & Computers', slug: 'laptops-computers', icon: Laptop },
  { id: 'tv', name: 'TV & Home Appliances', slug: 'tv-appliances', icon: Tv },
  { id: 'audio', name: 'Audio', slug: 'audio', icon: Volume2 },
  { id: 'cameras', name: 'Cameras', slug: 'cameras', icon: Camera },
  { id: 'fashion', name: 'Fashion & Apparel', slug: 'fashion-apparel', icon: Shirt },
  { id: 'beauty', name: 'Beauty & Personal Care', slug: 'beauty-skincare', icon: Sparkles },
  { id: 'home', name: 'Home & Kitchen', slug: 'home-kitchen', icon: Home },
  { id: 'furniture', name: 'Furniture', slug: 'furniture', icon: Armchair },
  { id: 'sports', name: 'Sports & Outdoor', slug: 'sports-fitness', icon: Activity },
  { id: 'auto', name: 'Automotive', slug: 'automotive', icon: Car },
  { id: 'toys', name: 'Toys & Games', slug: 'toys-games', icon: Gamepad2 },
  { id: 'books', name: 'Books & Stationery', slug: 'books-stationery', icon: BookOpen },
  { id: 'health', name: 'Health & Wellness', slug: 'health-wellness', icon: Heart },
];

const ICON_FALLBACK = Store;

export const DesktopCategorySidebar = ({ onNavigate }) => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    api.getCategories()
      .then(res => {
        if (res.success && res.categories?.length > 0) {
          setCategories(res.categories.slice(0, 15));
        } else {
          setCategories(FALLBACK_CATEGORIES);
        }
      })
      .catch(() => setCategories(FALLBACK_CATEGORIES))
      .finally(() => setIsLoading(false));
  }, []);

  const getIcon = (cat) => {
    const found = FALLBACK_CATEGORIES.find(f =>
      cat.name?.toLowerCase().includes(f.name.split(' ')[0].toLowerCase()) ||
      cat.slug?.includes(f.slug?.split('-')[0])
    );
    return found?.icon || ICON_FALLBACK;
  };

  return (
    <div
      className="flex flex-col h-full rounded-2xl overflow-hidden"
      style={{
        background: '#101522',
        border: '1px solid rgba(255,255,255,0.07)',
        minHeight: '520px'
      }}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
        <span className="text-xs font-black uppercase tracking-widest" style={{ color: '#9CA3AF' }}>
          Categories
        </span>
      </div>

      {/* Category list */}
      <div className="flex-1 overflow-y-auto no-scrollbar py-1">
        {isLoading
          ? [...Array(10)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                <div className="skeleton-dark w-5 h-5 rounded" />
                <div className="skeleton-dark h-3 flex-1 rounded" />
              </div>
            ))
          : categories.map((cat) => {
              const Icon = getIcon(cat);
              const isHovered = hovered === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => onNavigate('products', { category: cat.slug || cat.id })}
                  onMouseEnter={() => setHovered(cat.id)}
                  onMouseLeave={() => setHovered(null)}
                  className="w-full flex items-center justify-between px-4 py-2.5 text-left transition-all cursor-pointer press-feedback group"
                  style={{
                    background: isHovered ? 'rgba(99,102,241,0.1)' : 'transparent',
                    borderLeft: isHovered ? '2px solid #6366f1' : '2px solid transparent'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className="w-4 h-4 shrink-0 transition-colors"
                      style={{ color: isHovered ? '#818cf8' : '#6B7280' }}
                    />
                    <span
                      className="text-xs font-medium transition-colors"
                      style={{ color: isHovered ? '#e2e8f0' : '#9CA3AF' }}
                    >
                      {cat.name}
                    </span>
                  </div>
                  <ChevronRight
                    className="w-3.5 h-3.5 transition-colors"
                    style={{ color: isHovered ? '#818cf8' : '#374151' }}
                  />
                </button>
              );
            })}

        {/* View All */}
        <button
          onClick={() => onNavigate('products', {})}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-xs font-bold transition-all cursor-pointer press-feedback mt-1"
          style={{ color: '#818cf8', borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <span>View All Categories</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Sell on MARKETZO CTA */}
      <div
        className="m-3 mt-0 p-4 rounded-xl"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
          border: '1px solid rgba(99,102,241,0.25)'
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Store className="w-4 h-4" style={{ color: '#818cf8' }} />
          <span className="text-xs font-black text-white">Sell on MARKETZO</span>
        </div>
        <p className="text-[10px] mb-3" style={{ color: '#9CA3AF' }}>
          Start your business journey today.
        </p>
        <button
          onClick={() => onNavigate('seller')}
          className="w-full py-2 rounded-lg text-[11px] font-black text-white cursor-pointer press-feedback"
          style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
        >
          Become a Seller
        </button>
      </div>
    </div>
  );
};
