import React, { useState } from 'react';
import {
  ChevronRight,
  Headphones,
  Smartphone,
  Laptop,
  Shirt,
  Gem,
  Home,
  Sparkles,
  Activity,
  Leaf,
  Watch,
  BookOpen,
  Gamepad2,
  Trophy,
  Layers
} from 'lucide-react';

const CATEGORIES_LIST = [
  { id: '1', name: 'Electronics & Audio', slug: 'electronics-audio', icon: Headphones },
  { id: '2', name: 'Mobiles & Tablets', slug: 'mobiles-tablets', icon: Smartphone },
  { id: '3', name: 'Laptops & Computers', slug: 'laptops-computers', icon: Laptop },
  { id: '4', name: 'Fashion & Apparel', slug: 'fashion-apparel', icon: Shirt },
  { id: '5', name: 'Jewellery & Watches', slug: 'jewellery-watches', icon: Gem },
  { id: '6', name: 'Home & Kitchen', slug: 'home-kitchen', icon: Home },
  { id: '7', name: 'Beauty & Skincare', slug: 'beauty-skincare', icon: Sparkles },
  { id: '8', name: 'Sports & Fitness', slug: 'sports-fitness', icon: Activity },
  { id: '9', name: 'Gourmet & Organic', slug: 'gourmet-organic', icon: Leaf },
  { id: '10', name: 'Smart Accessories', slug: 'smart-accessories', icon: Watch },
  { id: '11', name: 'Books & Literature', slug: 'books-literature', icon: BookOpen },
  { id: '12', name: 'Toys & Gaming', slug: 'toys-gaming', icon: Gamepad2 },
  { id: '13', name: 'Gaming & Esports', slug: 'gaming-esports', icon: Trophy }
];

export const DesktopCategorySidebar = ({ onNavigate }) => {
  const [hovered, setHovered] = useState(null);

  return (
    <div
      className="flex flex-col h-full rounded-2xl overflow-hidden shadow-xl"
      style={{
        background: '#0B1427',
        border: '1px solid rgba(100, 149, 237, 0.22)',
        minHeight: '520px'
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-3.5 border-b flex items-center gap-2"
        style={{ borderColor: 'rgba(100, 149, 237, 0.15)', background: '#081225' }}
      >
        <div className="p-1.5 rounded-lg bg-[#2583FF]/15 text-[#00C8FF]">
          <Layers className="w-4 h-4" />
        </div>
        <span className="text-xs font-black uppercase tracking-wider text-white">
          CATEGORIES
        </span>
      </div>

      {/* 13 Categories List */}
      <div className="flex-1 overflow-y-auto no-scrollbar py-1 divide-y divide-[rgba(100,149,237,0.06)]">
        {CATEGORIES_LIST.map((cat) => {
          const Icon = cat.icon;
          const isHovered = hovered === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onNavigate('products', { category: cat.slug })}
              onMouseEnter={() => setHovered(cat.id)}
              onMouseLeave={() => setHovered(null)}
              className="w-full flex items-center justify-between px-4 py-2.5 text-left transition-all duration-200 cursor-pointer group"
              style={{
                background: isHovered
                  ? 'linear-gradient(90deg, rgba(37,131,255,0.18) 0%, rgba(112,46,255,0.08) 100%)'
                  : 'transparent',
                borderLeft: isHovered ? '3px solid #00C8FF' : '3px solid transparent'
              }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon
                  className="w-4 h-4 shrink-0 transition-colors"
                  style={{ color: isHovered ? '#00C8FF' : '#A8B5CC' }}
                />
                <span
                  className="text-xs font-semibold truncate transition-colors"
                  style={{ color: isHovered ? '#FFFFFF' : '#A8B5CC' }}
                >
                  {cat.name}
                </span>
              </div>
              <ChevronRight
                className="w-3.5 h-3.5 shrink-0 transition-transform group-hover:translate-x-0.5"
                style={{ color: isHovered ? '#00C8FF' : '#475569' }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};
