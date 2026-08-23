import React, { useState, useEffect } from 'react';
import { 
  LayoutGrid, 
  List, 
  ChevronDown, 
  SlidersHorizontal, 
  X, 
  Search,
  Sparkles,
  ArrowUpDown
} from 'lucide-react';
import { ProductGrid } from '../components/product/ProductGrid';
import { FilterSidebar } from '../components/product/FilterSidebar';
import { api } from '../services/api';

export const ProductListingPage = ({ routeParams = {}, onNavigate }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState('grid');
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  // Filters State
  const [filters, setFilters] = useState({
    search: routeParams.search || '',
    category: routeParams.category || '',
    brand: routeParams.brand || '',
    minPrice: routeParams.minPrice || '',
    maxPrice: routeParams.maxPrice || '',
    minRating: routeParams.minRating || '',
    minDiscount: routeParams.minDiscount || '',
    inStock: routeParams.inStock || '',
    featured: routeParams.featured || '',
    trending: routeParams.trending || '',
    bestSeller: routeParams.bestSeller || '',
    newArrival: routeParams.newArrival || '',
    sort: 'relevance'
  });

  // Sync routeParams into filters when navigating
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      search: routeParams.search || '',
      category: routeParams.category || '',
      brand: routeParams.brand || '',
      minPrice: routeParams.minPrice || '',
      maxPrice: routeParams.maxPrice || '',
      minRating: routeParams.minRating || '',
      minDiscount: routeParams.minDiscount || '',
      inStock: routeParams.inStock || '',
      featured: routeParams.featured || '',
      trending: routeParams.trending || '',
      bestSeller: routeParams.bestSeller || '',
      newArrival: routeParams.newArrival || ''
    }));
    setPage(1);
  }, [routeParams]);

  // Load Categories & Brands
  useEffect(() => {
    api.getCategories().then(res => {
      if (res.success) setCategories(res.categories || []);
    }).catch(() => {});

    api.getBrands().then(res => {
      if (res.success) setBrands(res.brands || []);
    }).catch(() => {});
  }, []);

  // Fetch Products based on current filters
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setIsLoading(true);
        const res = await api.getProducts({
          ...filters,
          page,
          limit: 20
        });

        if (res.success) {
          setProducts(res.products || []);
          setTotal(res.total || 0);
          setTotalPages(res.totalPages || 1);
        }
      } catch (err) {
        console.error('Catalog fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCatalog();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [filters, page]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      category: '',
      brand: '',
      minPrice: '',
      maxPrice: '',
      minRating: '',
      minDiscount: '',
      inStock: '',
      featured: '',
      trending: '',
      bestSeller: '',
      newArrival: '',
      sort: 'relevance'
    });
    setPage(1);
  };

  // Find active category title if filtered
  const activeCategoryObj = categories.find(c => c.id === filters.category || c.slug === filters.category);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Breadcrumb & Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
            <span onClick={() => onNavigate('home')} className="hover:text-indigo-600 cursor-pointer">Home</span>
            <span>/</span>
            <span className="text-slate-700">Catalog</span>
            {activeCategoryObj && (
              <>
                <span>/</span>
                <span className="text-indigo-600 font-bold">{activeCategoryObj.name}</span>
              </>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {filters.search 
              ? `Search Results for "${filters.search}"`
              : activeCategoryObj 
                ? activeCategoryObj.name
                : 'Marketplace Products'
            }
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Showing {products.length} of {total} verified marketplace listings</p>
        </div>

        {/* View mode & Sorting controls */}
        <div className="flex items-center gap-3">
          
          {/* Mobile Filter Button Trigger */}
          <button
            onClick={() => setShowMobileFilter(true)}
            className="lg:hidden flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-sm"
          >
            <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
            <span>Filters</span>
          </button>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer"
            >
              <option value="relevance">Sort: Featured & Relevant</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Customer Rating</option>
              <option value="discount">Discount Percentage</option>
              <option value="newest">Newest Arrivals</option>
            </select>
          </div>

          {/* Grid vs List View toggle */}
          <div className="hidden sm:flex items-center bg-slate-200/70 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* Active Filter Pills Bar */}
      {(filters.search || filters.category || filters.minPrice || filters.maxPrice || filters.minRating || filters.minDiscount || filters.inStock) && (
        <div className="flex flex-wrap items-center gap-2 bg-slate-100/70 p-2.5 rounded-2xl">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider pl-1">Active Filters:</span>
          
          {filters.search && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800">
              <span>Query: "{filters.search}"</span>
              <X className="w-3.5 h-3.5 text-slate-400 hover:text-slate-700 cursor-pointer" onClick={() => handleFilterChange('search', '')} />
            </span>
          )}

          {activeCategoryObj && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 border border-indigo-200 rounded-lg text-xs font-semibold text-indigo-700">
              <span>Department: {activeCategoryObj.name}</span>
              <X className="w-3.5 h-3.5 text-indigo-400 hover:text-indigo-700 cursor-pointer" onClick={() => handleFilterChange('category', '')} />
            </span>
          )}

          {(filters.minPrice || filters.maxPrice) && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800">
              <span>Price: ${filters.minPrice || '0'} - ${filters.maxPrice || 'Any'}</span>
              <X className="w-3.5 h-3.5 text-slate-400 hover:text-slate-700 cursor-pointer" onClick={() => { handleFilterChange('minPrice', ''); handleFilterChange('maxPrice', ''); }} />
            </span>
          )}

          {filters.minRating && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-lg text-xs font-semibold text-amber-800">
              <span>{filters.minRating}★ & Up</span>
              <X className="w-3.5 h-3.5 text-amber-500 hover:text-amber-800 cursor-pointer" onClick={() => handleFilterChange('minRating', '')} />
            </span>
          )}

          {filters.minDiscount && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 border border-rose-200 rounded-lg text-xs font-semibold text-rose-800">
              <span>{filters.minDiscount}%+ Off</span>
              <X className="w-3.5 h-3.5 text-rose-500 hover:text-rose-800 cursor-pointer" onClick={() => handleFilterChange('minDiscount', '')} />
            </span>
          )}

          {filters.inStock && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-800">
              <span>In Stock Only</span>
              <X className="w-3.5 h-3.5 text-emerald-500 hover:text-emerald-800 cursor-pointer" onClick={() => handleFilterChange('inStock', '')} />
            </span>
          )}

          <button
            onClick={handleResetFilters}
            className="text-xs font-bold text-rose-600 hover:underline ml-auto pl-2"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Main Content Layout: Sidebar + Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Desktop Filter Sidebar */}
        <div className="hidden lg:block lg:col-span-1 sticky top-36">
          <FilterSidebar
            categories={categories}
            brands={brands}
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            totalResults={total}
          />
        </div>

        {/* Product Grid / List Section */}
        <div className="lg:col-span-3 space-y-8">
          <ProductGrid
            products={products}
            isLoading={isLoading}
            onNavigate={onNavigate}
            layout={viewMode}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6 border-t border-slate-200">
              <button
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                disabled={page <= 1}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 disabled:opacity-40"
              >
                Previous
              </button>

              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-9 h-9 rounded-xl text-xs font-bold transition-colors ${
                      page === pageNum
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                disabled={page >= totalPages}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Mobile Filters Drawer */}
      {showMobileFilter && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex justify-end">
          <div className="bg-white w-full max-w-sm h-full overflow-y-auto p-6 space-y-6 animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="font-extrabold text-base text-slate-900">Filters & Department</div>
              <button onClick={() => setShowMobileFilter(false)} className="p-1 rounded-lg text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <FilterSidebar
              categories={categories}
              brands={brands}
              filters={filters}
              onFilterChange={handleFilterChange}
              onResetFilters={handleResetFilters}
              totalResults={total}
            />

            <button
              onClick={() => setShowMobileFilter(false)}
              className="w-full py-3.5 bg-indigo-600 text-white font-bold text-xs rounded-2xl uppercase tracking-wider"
            >
              Show {total} Results
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
