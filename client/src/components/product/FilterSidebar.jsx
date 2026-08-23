import React from 'react';
import { Star, X, RotateCcw, Check, SlidersHorizontal } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';

export const FilterSidebar = ({
  categories = [],
  brands = [],
  filters,
  onFilterChange,
  onResetFilters,
  totalResults = 0
}) => {
  const { currentCurrency, activeCurrencyInfo, formatPrice } = useCurrency();
  return (
    <aside className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2 font-extrabold text-sm text-slate-900 uppercase tracking-wider">
          <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
          <span>Filters ({totalResults})</span>
        </div>
        <button
          onClick={onResetFilters}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Category Filter */}
      <div>
        <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-3">Departments</h4>
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          <label className="flex items-center gap-2 text-xs font-medium text-slate-700 hover:text-indigo-600 cursor-pointer p-1 rounded-lg hover:bg-slate-50">
            <input
              type="radio"
              name="category"
              checked={!filters.category || filters.category === 'all'}
              onChange={() => onFilterChange('category', '')}
              className="accent-indigo-600 w-3.5 h-3.5"
            />
            <span>All Categories</span>
          </label>
          {categories.map(cat => (
            <label
              key={cat.id}
              className="flex items-center justify-between text-xs font-medium text-slate-700 hover:text-indigo-600 cursor-pointer p-1 rounded-lg hover:bg-slate-50"
            >
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="category"
                  checked={filters.category === cat.slug || filters.category === cat.id}
                  onChange={() => onFilterChange('category', cat.slug || cat.id)}
                  className="accent-indigo-600 w-3.5 h-3.5"
                />
                <span>{cat.name}</span>
              </div>
              {cat.productCount !== undefined && (
                <span className="text-[11px] text-slate-400">({cat.productCount})</span>
              )}
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="pt-4 border-t border-slate-100">
        <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-3">
          Price Range ({currentCurrency} {activeCurrencyInfo?.symbol})
        </h4>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min ($)"
            value={filters.minPrice || ''}
            onChange={(e) => onFilterChange('minPrice', e.target.value)}
            className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600 bg-slate-50"
          />
          <span className="text-slate-400 text-xs">-</span>
          <input
            type="number"
            placeholder="Max ($)"
            value={filters.maxPrice || ''}
            onChange={(e) => onFilterChange('maxPrice', e.target.value)}
            className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600 bg-slate-50"
          />
        </div>
        
        {/* Quick price chips */}
        <div className="flex flex-wrap gap-1.5 mt-2.5">
          <button
            onClick={() => { onFilterChange('minPrice', 0); onFilterChange('maxPrice', 100); }}
            className="px-2 py-1 bg-slate-100 hover:bg-indigo-50 text-[11px] font-semibold text-slate-600 rounded-lg cursor-pointer"
          >
            Under {formatPrice(100)}
          </button>
          <button
            onClick={() => { onFilterChange('minPrice', 100); onFilterChange('maxPrice', 500); }}
            className="px-2 py-1 bg-slate-100 hover:bg-indigo-50 text-[11px] font-semibold text-slate-600 rounded-lg cursor-pointer"
          >
            {formatPrice(100)} - {formatPrice(500)}
          </button>
          <button
            onClick={() => { onFilterChange('minPrice', 500); onFilterChange('maxPrice', ''); }}
            className="px-2 py-1 bg-slate-100 hover:bg-indigo-50 text-[11px] font-semibold text-slate-600 rounded-lg cursor-pointer"
          >
            {formatPrice(500)}+
          </button>
        </div>
      </div>

      {/* Customer Rating */}
      <div className="pt-4 border-t border-slate-100">
        <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-3">Customer Rating</h4>
        <div className="space-y-1.5">
          {[4, 3, 2].map(rating => (
            <button
              key={rating}
              onClick={() => onFilterChange('minRating', filters.minRating === rating ? '' : rating)}
              className={`w-full flex items-center gap-2 p-1.5 rounded-xl text-xs font-semibold text-left transition-colors ${
                filters.minRating === rating ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200 fill-slate-200'}`}
                  />
                ))}
              </div>
              <span>{rating} Stars & Up</span>
            </button>
          ))}
        </div>
      </div>

      {/* Discount Filter */}
      <div className="pt-4 border-t border-slate-100">
        <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-3">Discount</h4>
        <div className="space-y-1">
          {[10, 20, 30].map(disc => (
            <label key={disc} className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer p-1 rounded-lg hover:bg-slate-50">
              <input
                type="radio"
                name="discount"
                checked={parseInt(filters.minDiscount) === disc}
                onChange={() => onFilterChange('minDiscount', disc)}
                className="accent-indigo-600 w-3.5 h-3.5"
              />
              <span>{disc}% or More Off</span>
            </label>
          ))}
        </div>
      </div>

      {/* In Stock & Fast Shipping */}
      <div className="pt-4 border-t border-slate-100 space-y-2">
        <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-800 cursor-pointer p-1">
          <input
            type="checkbox"
            checked={!!filters.inStock}
            onChange={(e) => onFilterChange('inStock', e.target.checked ? true : '')}
            className="accent-indigo-600 w-4 h-4 rounded"
          />
          <span>Exclude Out of Stock</span>
        </label>
      </div>

    </aside>
  );
};
