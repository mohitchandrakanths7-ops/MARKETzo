import React, { useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';

export const MobileSearchBar = ({ onNavigate }) => {
  const [query, setQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onNavigate('products', { search: query.trim() });
    }
  };

  const handleFilter = () => {
    onNavigate('products', {});
  };

  return (
    <div className="px-4 pb-3 animate-fade-in-up animate-fade-in-up-delay-1">
      <form onSubmit={handleSearch} className="flex items-center gap-2">
        {/* Search input */}
        <div
          className="flex-1 flex items-center gap-3 px-4 py-3 rounded-2xl"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1.5px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <Search className="w-4 h-4 shrink-0" style={{ color: 'rgba(148,163,184,0.7)' }} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, brands & more..."
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: '#f1f5f9', caretColor: '#3b82f6' }}
            aria-label="Search products"
          />
        </div>

        {/* Filter button */}
        <button
          type="button"
          onClick={handleFilter}
          className="w-12 h-12 flex items-center justify-center rounded-2xl shrink-0 cursor-pointer press-feedback"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1.5px solid rgba(255,255,255,0.08)'
          }}
          aria-label="Filter products"
        >
          <SlidersHorizontal className="w-4 h-4" style={{ color: 'rgba(148,163,184,0.8)' }} />
        </button>
      </form>
    </div>
  );
};
