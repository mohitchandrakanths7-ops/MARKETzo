import React, { useState, useEffect } from 'react';
import { 
  LayoutGrid, 
  List, 
  ChevronDown, 
  SlidersHorizontal, 
  X, 
  Search,
  Sparkles,
  ArrowUpDown,
  ArrowLeft
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
    hotDeals: routeParams.hotDeals || '',
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
      hotDeals: routeParams.hotDeals || '',
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
      hotDeals: '',
      trending: '',
      bestSeller: '',
      newArrival: '',
      sort: 'relevance'
    });
    setPage(1);
  };

  const activeCategoryObj = categories.find(c => c.id === filters.category || c.slug === filters.category);

  return (
    <div className="min-h-screen bg-[#080c14] md:bg-transparent text-white md:text-slate-900 pb-28 md:pb-16 transition-colors">
      
      {/* Mobile Top Navigation Bar */}
      <div className="md:hidden sticky top-0 z-30 bg-[#080c14]/95 backdrop-blur-xl border-b border-white/10 px-3.5 py-2.5 flex items-center justify-between shadow-md">
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#111827] text-slate-300 hover:text-white border border-white/10 cursor-pointer press-feedback text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4 text-blue-400" />
          <span>Home</span>
        </button>

        <span className="text-xs font-bold text-white truncate max-w-[170px]">
          {filters.search 
            ? `"${filters.search}"`
            : activeCategoryObj 
              ? activeCategoryObj.name 
              : 'All Categories'
          }
        </span>

        <button
          onClick={() => setShowMobileFilter(true)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#111827] text-blue-400 border border-white/10 text-xs font-bold"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Filter</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
        
        {/* Breadcrumb & Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[rgba(100,149,237,0.22)]">
          <div>
            <div className="hidden sm:flex text-xs font-semibold text-slate-400 mb-1 items-center gap-1.5">
              <span onClick={() => onNavigate('home')} className="hover:text-blue-400 cursor-pointer">Home</span>
              <span>/</span>
              <span className="text-slate-400">Catalog</span>
              {activeCategoryObj && (
                <>
                  <span>/</span>
                  <span className="text-blue-400 font-bold">{activeCategoryObj.name}</span>
                </>
              )}
            </div>
            <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight">
              {filters.search 
                ? `Search: "${filters.search}"`
                : filters.hotDeals === 'true'
                  ? '🔥 Flash Deals & Hot Offers'
                  : filters.featured === 'true'
                    ? '⭐ Featured Products'
                    : filters.trending === 'true'
                      ? '📈 Trending Products'
                      : filters.bestSeller === 'true'
                        ? '🏆 Best Sellers'
                        : filters.newArrival === 'true'
                          ? '✨ New Arrivals'
                          : activeCategoryObj 
                            ? activeCategoryObj.name
                            : 'All Marketplace Products'
              }
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">Showing {products.length} of {total} verified products</p>
          </div>

          {/* Controls: Sorting & Filter */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
            
            {/* Filter Trigger Button */}
            <button
              onClick={() => setShowMobileFilter(true)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-2xl bg-[#0B1427] border border-[rgba(100,149,237,0.22)] text-xs font-bold text-white shadow-md hover:border-[#2583FF] cursor-pointer press-feedback min-h-[40px] transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#00C8FF]" />
              <span>Filters</span>
            </button>

            {/* Sort Selector Dropdown */}
            <div className="flex-1 sm:flex-initial flex items-center gap-2 bg-[#0B1427] px-3 py-2 rounded-2xl border border-[rgba(100,149,237,0.22)] hover:border-[#2583FF] shadow-md min-h-[40px] transition-colors">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#00C8FF] shrink-0" />
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="w-full bg-transparent text-xs font-bold text-white outline-none cursor-pointer"
                aria-label="Sort products by"
              >
                <option value="relevance" className="bg-[#0B1427] text-white">Sort: Relevance</option>
                <option value="price-low" className="bg-[#0B1427] text-white">Price: Low to High</option>
                <option value="price-high" className="bg-[#0B1427] text-white">Price: High to Low</option>
                <option value="rating" className="bg-[#0B1427] text-white">Top Rated</option>
                <option value="discount" className="bg-[#0B1427] text-white">Highest Discount</option>
                <option value="newest" className="bg-[#0B1427] text-white">Newest</option>
              </select>
            </div>

            {/* Grid vs List View toggle (Desktop) */}
            <div className="hidden sm:flex items-center bg-[#0B1427] p-1 rounded-xl border border-[rgba(100,149,237,0.22)]">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'grid' ? 'bg-gradient-to-r from-[#2583FF] to-[#702EFF] text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'list' ? 'bg-gradient-to-r from-[#2583FF] to-[#702EFF] text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Active Filter Pills Bar */}
        {(filters.search || filters.category || filters.minPrice || filters.maxPrice || filters.minRating || filters.minDiscount || filters.inStock || filters.hotDeals || filters.featured) && (
          <div className="flex flex-wrap items-center gap-2 bg-[#0B1427] p-2.5 rounded-2xl border border-[rgba(100,149,237,0.22)]">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Active Filters:</span>
            
            {filters.search && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#101B32] border border-[rgba(100,149,237,0.3)] rounded-lg text-xs font-semibold text-white">
                <span>"{filters.search}"</span>
                <X className="w-3.5 h-3.5 text-slate-400 hover:text-white cursor-pointer" onClick={() => handleFilterChange('search', '')} />
              </span>
            )}

            {activeCategoryObj && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-950/80 border border-blue-800/80 rounded-lg text-xs font-semibold text-blue-300">
                <span>{activeCategoryObj.name}</span>
                <X className="w-3.5 h-3.5 text-blue-400 hover:text-white cursor-pointer" onClick={() => handleFilterChange('category', '')} />
              </span>
            )}

            {filters.hotDeals === 'true' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-950/80 border border-rose-800/80 rounded-lg text-xs font-semibold text-rose-300">
                <span>🔥 Flash Deals</span>
                <X className="w-3.5 h-3.5 text-rose-400 hover:text-white cursor-pointer" onClick={() => handleFilterChange('hotDeals', '')} />
              </span>
            )}

            {filters.featured === 'true' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-950/80 border border-purple-800/80 rounded-lg text-xs font-semibold text-purple-300">
                <span>⭐ Featured</span>
                <X className="w-3.5 h-3.5 text-purple-400 hover:text-white cursor-pointer" onClick={() => handleFilterChange('featured', '')} />
              </span>
            )}

            {(filters.minPrice || filters.maxPrice) && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#101B32] border border-[rgba(100,149,237,0.3)] rounded-lg text-xs font-semibold text-white">
                <span>₹{filters.minPrice || '0'} - ₹{filters.maxPrice || 'Any'}</span>
                <X className="w-3.5 h-3.5 text-slate-400 hover:text-white cursor-pointer" onClick={() => { handleFilterChange('minPrice', ''); handleFilterChange('maxPrice', ''); }} />
              </span>
            )}

            <button
              onClick={handleResetFilters}
              className="text-xs font-bold text-rose-400 hover:underline ml-auto pl-2 cursor-pointer"
            >
              Clear All
            </button>
          </div>
        )}

        {/* Main Content Layout: Sidebar + Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8 items-start">
          
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
          <div className="lg:col-span-3 space-y-6 sm:space-y-8">
            <ProductGrid
              products={products}
              isLoading={isLoading}
              onNavigate={onNavigate}
              layout={viewMode}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6 border-t border-white/10 md:border-slate-200">
                <button
                  onClick={() => setPage(prev => Math.max(1, prev - 1))}
                  disabled={page <= 1}
                  className="px-4 py-2 rounded-xl border border-white/10 md:border-slate-200 bg-[#111827] md:bg-white text-xs font-bold text-white md:text-slate-700 disabled:opacity-40 cursor-pointer"
                >
                  Previous
                </button>

                {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        page === pageNum
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                          : 'bg-[#111827] md:bg-white border border-white/10 md:border-slate-200 text-slate-300 md:text-slate-700 hover:bg-[#1a233a]'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={page >= totalPages}
                  className="px-4 py-2 rounded-xl border border-white/10 md:border-slate-200 bg-[#111827] md:bg-white text-xs font-bold text-white md:text-slate-700 disabled:opacity-40 cursor-pointer"
                >
                  Next
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Mobile Filters Drawer */}
        {showMobileFilter && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end">
            <div className="bg-[#111827] text-white w-full max-w-sm h-full overflow-y-auto p-6 space-y-6 border-l border-white/10 animate-in slide-in-from-right duration-300">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="font-black text-base text-white">Filters & Departments</div>
                <button onClick={() => setShowMobileFilter(false)} className="p-1 rounded-lg text-slate-400 hover:text-white">
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
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-black text-xs rounded-2xl uppercase tracking-wider shadow-lg cursor-pointer"
              >
                Show {total} Results
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
