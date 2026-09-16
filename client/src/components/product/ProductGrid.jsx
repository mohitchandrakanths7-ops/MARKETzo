import React from 'react';
import { ProductCard } from './ProductCard';
import { PackageOpen } from 'lucide-react';

export const ProductGrid = ({ products = [], isLoading = false, onNavigate, layout = 'grid' }) => {
  if (isLoading) {
    return (
      <div className={`grid ${layout === 'list' ? 'grid-cols-1 gap-3.5' : 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4'}`}>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-3 sm:p-4 animate-pulse space-y-3 shadow-2xs">
            <div className="aspect-square bg-slate-100 rounded-xl sm:rounded-2xl w-full" />
            <div className="h-3.5 bg-slate-100 rounded w-3/4" />
            <div className="h-3.5 bg-slate-100 rounded w-1/2" />
            <div className="h-8 bg-slate-100 rounded-xl w-full mt-2" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center max-w-lg mx-auto shadow-sm my-6">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
          <PackageOpen className="w-8 h-8" />
        </div>
        <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">No products found</h3>
        <p className="text-xs text-slate-500 mb-6">We couldn't find any items matching your exact filter combination. Try resetting your search or broadening categories.</p>
        <button
          onClick={() => onNavigate('products', {})}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
        >
          View All Products
        </button>
      </div>
    );
  }

  return (
    <div className={`grid ${layout === 'list' ? 'grid-cols-1 gap-3.5' : 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4'}`}>
      {products.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          onNavigate={onNavigate}
          layout={layout}
        />
      ))}
    </div>
  );
};
