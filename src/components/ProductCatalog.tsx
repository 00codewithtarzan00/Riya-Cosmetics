import {useState, useMemo, useEffect, useRef} from 'react';
import ProductCard, {Product} from './ProductCard.tsx';
import {Search, SlidersHorizontal, ArrowUpDown, X, Sparkles, CheckCircle2, ShieldAlert} from 'lucide-react';

function ProductCardSkeleton() {
  return (
    <div className="bg-white border border-[var(--theme-border)] rounded-none overflow-hidden flex flex-col justify-between shadow-xs animate-pulse">
      {/* Product Image Section Skeleton */}
      <div className="relative aspect-[4/3] bg-stone-100 flex items-center justify-center">
        <div className="text-center px-4">
          <span className="text-[9px] uppercase tracking-widest text-stone-300 font-mono">Curating...</span>
        </div>
      </div>

      {/* Content Section Skeleton */}
      <div className="p-2 sm:p-3 flex flex-col flex-grow justify-between space-y-2">
        <div className="space-y-1">
          {/* Title */}
          <div className="h-3 bg-stone-200 w-3/4 rounded-none" />
        </div>

        {/* Price & Action Button */}
        <div className="mt-2 pt-2 border-t border-[var(--theme-border)] flex items-center justify-between">
          <div className="h-4 bg-stone-200 w-12 rounded-none" />
          <div className="h-3 bg-stone-200 w-10 rounded-none" />
        </div>
      </div>
    </div>
  );
}

interface ProductCatalogProps {
  products: Product[];
  isLoading?: boolean;
}

export default function ProductCatalog({products, isLoading = false}: ProductCatalogProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('default');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [visibleCount, setVisibleCount] = useState<number>(6);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const categories = ['All', 'Makeup', 'Skin Care', 'Hair Care', 'Body Care', 'Undergarments', 'Baby Care', 'Bangles & Ornaments'];

  // Handle product sorting and filtering
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    // Category Filter
    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Search Query Filter
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }

    // Sort operations
    if (sortBy === 'price-low-high') {
      result.sort((a, b) => {
        const aPrice = a.sp !== undefined ? a.sp : a.priceInINR;
        const bPrice = b.sp !== undefined ? b.sp : b.priceInINR;
        return aPrice - bPrice;
      });
    } else if (sortBy === 'price-high-low') {
      result.sort((a, b) => {
        const aPrice = a.sp !== undefined ? a.sp : a.priceInINR;
        const bPrice = b.sp !== undefined ? b.sp : b.priceInINR;
        return bPrice - aPrice;
      });
    } else if (sortBy === 'name-asc') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [products, selectedCategory, searchQuery, sortBy]);

  // Highlight only sliced subset of loaded items
  const visibleProducts = useMemo(() => {
    return filteredAndSortedProducts.slice(0, visibleCount);
  }, [filteredAndSortedProducts, visibleCount]);

  // Reset pagination state when filters or categories shift
  useEffect(() => {
    setVisibleCount(6);
    setIsLoadingMore(false);
  }, [selectedCategory, searchQuery, sortBy]);

  // Infinite Scroll dynamic triggers
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && visibleCount < filteredAndSortedProducts.length) {
          setIsLoadingMore(true);
          const timer = setTimeout(() => {
            setVisibleCount((prev) => Math.min(prev + 6, filteredAndSortedProducts.length));
            setIsLoadingMore(false);
          }, 600);
          return () => clearTimeout(timer);
        }
      },
      {
        rootMargin: '120px', // start fetching prior to page-end collision
      }
    );

    observer.observe(sentinel);
    return () => {
      observer.unobserve(sentinel);
    };
  }, [sentinelRef.current, visibleCount, filteredAndSortedProducts.length]);

  return (
    <div id="catalog-section" className="pt-28 pb-20 bg-[var(--theme-bg)] min-h-screen">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-12">
        
        {/* Searching, Sorting, and Category Controls Group */}
        <div className="space-y-6 mb-12">
          {/* Top Control Bar: Search and Sort */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 border border-[var(--theme-border)]">
            {/* Search Input */}
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                id="catalog-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search catalog... (e.g. lipstick, hair oil, ornaments)"
                className="w-full pl-10 pr-4 py-2 bg-[var(--theme-bg)] border border-[var(--theme-border)] text-sm text-[var(--theme-text-primary)] placeholder-stone-400 rounded-none focus:outline-none focus:border-[var(--theme-accent)] transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[var(--theme-text-primary)]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2.5 w-full md:w-auto self-stretch select-none">
              <ArrowUpDown className="w-4 h-4 text-stone-400 shrink-0" />
              <select
                id="catalog-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full md:w-52 px-3 py-2 bg-[var(--theme-bg)] border border-[var(--theme-border)] text-sm text-[var(--theme-text-primary)] rounded-none focus:outline-none focus:border-[var(--theme-accent)] transition-all cursor-pointer"
              >
                <option value="default">Featured</option>
                <option value="price-low-high">Price: Low to High</option>
                <option value="price-high-low">Price: High to Low</option>
                <option value="name-asc">Alphabetical: A-Z</option>
              </select>
            </div>
          </div>

          {/* Categorization Tabs */}
          <div className="flex items-center gap-2 border-b border-[var(--theme-border)] pb-4 overflow-x-auto scrollbar-none -mx-6 px-6 md:mx-0 md:px-0 md:flex-wrap">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--theme-accent)] mr-2 shrink-0 hidden md:block" />
            <div className="flex items-center gap-2 overflow-visible md:flex-wrap pb-0.5 md:pb-0">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    id={`cat-tab-${cat.toLowerCase()}`}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 sm:px-5 py-2 text-xs font-semibold tracking-wider uppercase transition-all duration-300 rounded-none cursor-pointer border whitespace-nowrap ${
                      isActive 
                        ? 'bg-[var(--theme-accent)] text-white border-[var(--theme-accent)]' 
                        : 'bg-transparent text-[var(--theme-text-secondary)] border-transparent hover:text-[var(--theme-text-primary)] hover:border-[var(--theme-border)]'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3.5 animate-pulse">
            {Array.from({ length: 6 }).map((_, index) => (
              <ProductCardSkeleton key={`initial-skeleton-${index}`} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-24 text-center border border-[var(--theme-border)] bg-white max-w-xl mx-auto px-6">
            <Sparkles className="w-10 h-10 text-[var(--theme-accent)] mx-auto mb-5 animate-pulse" />
            <h3 className="text-xl font-light text-[var(--theme-text-primary)] uppercase tracking-widest mb-3">Live Lookbook Empty</h3>
            <p className="text-sm text-[var(--theme-text-secondary)] font-medium leading-relaxed max-w-md mx-auto">
              No product formulas are currently registered in our live catalogue database. As an authorized administrator, please navigate to the Admin Portal to curate and publish your luxury cosmetics list.
            </p>
          </div>
        ) : filteredAndSortedProducts.length > 0 ? (
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3.5 transition-opacity duration-300">
              {visibleProducts.map((p) => (
                <ProductCard 
                  key={p.id} 
                  product={p} 
                  onViewDetails={setSelectedProduct} 
                />
              ))}

              {/* Keep the product boxes placeholder grid alive while loading more */}
              {isLoadingMore && (
                Array.from({ length: 6 }).map((_, index) => (
                  <ProductCardSkeleton key={`lookbook-skeleton-${index}`} />
                ))
              )}
            </div>

            {/* sentinel element for triggering infinite scrolling */}
            <div ref={sentinelRef} className="h-6 mt-4" />

            {/* Premium Loading Spinner feedback */}
            {isLoadingMore && (
              <div id="infinite-scroll-spinner" className="py-8 text-center flex flex-col items-center justify-center gap-2.5 animate-pulse">
                <div className="flex items-center gap-1.5 justify-center">
                  <div className="w-2.5 h-2.5 bg-[var(--theme-accent)] rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-2.5 h-2.5 bg-[var(--theme-accent)] rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-2.5 h-2.5 bg-[var(--theme-accent)] rounded-full animate-bounce" />
                </div>
                <span className="text-[10px] uppercase tracking-[0.25em] text-stone-400 font-mono font-bold">
                  Curating cosmetic formulas...
                </span>
              </div>
            )}

            {/* Optional Safe Manual Toggle */}
            {!isLoadingMore && visibleCount < filteredAndSortedProducts.length && (
              <div className="text-center mt-6">
                <button
                  id="btn-load-more"
                  onClick={() => {
                    setIsLoadingMore(true);
                    setTimeout(() => {
                      setVisibleCount((prev) => Math.min(prev + 6, filteredAndSortedProducts.length));
                      setIsLoadingMore(false);
                    }, 500);
                  }}
                  className="px-8 py-3 bg-stone-900 text-white font-semibold text-xs tracking-widest uppercase transition-all duration-300 hover:bg-[var(--theme-accent)] cursor-pointer hover:text-white"
                >
                  Load More Items
                </button>
              </div>
            )}

            {/* Ended message */}
            {visibleCount >= filteredAndSortedProducts.length && filteredAndSortedProducts.length > 6 && (
              <div className="py-12 text-center border-t border-[var(--theme-border)] mt-12 animate-fade-in">
                <p className="text-[10px] uppercase font-mono tracking-[0.3em] text-[var(--theme-text-muted)] font-medium">
                  ✦ You have viewed all curated formulations ✦
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="py-24 text-center border border-[var(--theme-border)] bg-white max-w-xl mx-auto">
            <Sparkles className="w-10 h-10 text-stone-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[var(--theme-text-primary)] mb-2">No items match your criteria</h3>
            <p className="text-xs text-[var(--theme-text-secondary)] px-6 font-medium">
              We couldn't find any premium formulas matches. Try resetting your search term or filtering categories.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
                setSortBy('default');
              }}
              className="mt-6 px-5 py-2 bg-[var(--theme-accent)] text-white font-semibold text-xs tracking-wider uppercase hover:bg-[var(--theme-accent-hover)] transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Dynamic Detail Modal Panel */}
        {selectedProduct && (
          <div 
            id="product-details-modal"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-md animate-fade-in"
          >
            <div 
              className="relative w-full max-w-2xl bg-white border border-[var(--theme-border)] text-left outline-none overflow-hidden max-h-[90vh] flex flex-col md:flex-row shadow-2xl rounded-none"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button 
                id="close-details-modal"
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-[var(--theme-bg)] text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Left Column: Static & Smaller Image Box */}
              <div className="w-full md:w-64 h-64 md:h-auto shrink-0 bg-[var(--theme-bg)] relative overflow-hidden flex items-center justify-center p-4">
                <img 
                  src={selectedProduct.image} 
                  alt={selectedProduct.name} 
                  className="w-full h-full object-contain object-center"
                />
                <div className="absolute top-4 left-4 bg-[var(--theme-accent)] text-white px-3 py-1 text-[10px] tracking-widest uppercase font-bold">
                  {selectedProduct.category}
                </div>
              </div>

              {/* Modal Right Column: Deep Product Details */}
              <div className="w-full md:flex-1 p-4 sm:p-5 md:p-6 overflow-y-auto flex flex-col justify-between max-h-[50vh] md:max-h-full">
                <div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-light text-[var(--theme-text-primary)] uppercase tracking-wide leading-tight mb-2">
                    {selectedProduct.name}
                  </h3>
                  
                  {/* Absolute Price Listing */}
                  <div className="mb-3.5 pb-2.5 border-b border-[var(--theme-border)]">
                    <div className="flex items-center gap-2 flex-wrap">
                      {(() => {
                        const mrpVal = selectedProduct.mrp || selectedProduct.priceInINR || 0;
                        const spVal = selectedProduct.sp || selectedProduct.priceInINR || 0;
                        const discountPercent = (mrpVal > 0 && mrpVal > spVal) ? Math.round(((mrpVal - spVal) / mrpVal) * 100) : 0;

                        return (
                          <div className="flex flex-col">
                            {discountPercent > 0 && (
                              <div className="flex items-center gap-1.5 mb-1">
                                <span className="text-xs text-[var(--theme-text-muted)] line-through">
                                  MRP: ₹{mrpVal.toLocaleString('en-IN')}
                                </span>
                                <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 font-bold uppercase tracking-wider rounded-none">
                                  {discountPercent}% OFF
                                </span>
                              </div>
                            )}
                            <span className="text-2xl font-bold text-[var(--theme-text-primary)] tracking-wide">
                              ₹{spVal.toLocaleString('en-IN')}
                            </span>
                          </div>
                        );
                      })()}
                    </div>
                    <span className="block mt-1 text-[10px] text-[var(--theme-text-muted)] font-light italic">
                      (Inclusive of all taxes - Curated lookbook value)
                    </span>
                  </div>

                  {/* Product Narrative */}
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-[10px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-widest mb-1">Description</h4>
                      <p className="text-xs sm:text-sm text-[var(--theme-text-secondary)] font-medium leading-relaxed">
                        {selectedProduct.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
