import {useState, useMemo, useEffect, useRef} from 'react';
import ProductCard, {Product, formatCustomQuantity} from './ProductCard.tsx';
import {
  Search, SlidersHorizontal, ArrowUpDown, X, Sparkles, CheckCircle2, ShieldAlert,
  Palette, Droplet, Scissors, Heart, Baby, Gem, Grid, Smile
} from 'lucide-react';
import { SettingsConfig } from '../firebaseService';
import BannerSlider from './BannerSlider';

function ProductCardSkeleton() {
  return (
    <div className="editorial-card bg-white border border-[var(--theme-border)]/70 rounded-[2px] overflow-hidden flex flex-col justify-between shadow-xs animate-pulse">
      {/* Product Image Section Skeleton */}
      <div className="relative aspect-square bg-stone-100 flex items-center justify-center">
        <div className="text-center px-4">
          <span className="text-[9px] uppercase tracking-widest text-stone-300 font-mono">Curating...</span>
        </div>
      </div>

      {/* Content Section Skeleton */}
      <div className="p-3 md:p-4 flex flex-col flex-grow justify-between min-h-0 md:min-h-32 bg-white">
        <div className="space-y-2 mb-2">
          {/* Category */}
          <div className="h-2 bg-stone-200/60 w-1/4 rounded-[2px]" />
          {/* Title */}
          <div className="h-4 bg-stone-200 w-3/4 rounded-[2px]" />
          {/* Specs */}
          <div className="h-2.5 bg-stone-100 w-1/2 rounded-[2px]" />
        </div>

        {/* Price & Action Button */}
        <div className="mt-auto pt-2 border-t border-[var(--theme-border)]/40 flex items-center justify-between">
          <div className="h-4 bg-stone-200 w-12 rounded-[2px]" />
          <div className="h-3 bg-stone-200 w-10 rounded-[2px]" />
        </div>
      </div>
    </div>
  );
}

interface ProductCatalogProps {
  products: Product[];
  isLoading?: boolean;
  settings?: SettingsConfig | null;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Makeup':
      return <Palette className="w-4 h-4 shadow-xs" />;
    case 'Skin Care':
      return <Droplet className="w-4 h-4 shadow-xs" />;
    case 'Hair Care':
      return <Scissors className="w-4 h-4 shadow-xs text-amber-600" />;
    case 'Body Care':
      return <Smile className="w-4 h-4 shadow-xs text-emerald-600" />;
    case 'Undergarments':
      return <Heart className="w-4 h-4 shadow-xs text-rose-500" />;
    case 'Baby Care':
      return <Baby className="w-4 h-4 shadow-xs text-sky-500" />;
    case 'Bangles & Ornaments':
      return <Gem className="w-4 h-4 shadow-xs text-purple-600" />;
    default:
      return <Grid className="w-4 h-4 shadow-xs" />;
  }
};

export default function ProductCatalog({products, isLoading = false, settings}: ProductCatalogProps) {
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
    if (sortBy === 'default') {
      result.sort((a, b) => {
        const timeA = a.createdAt || '';
        const timeB = b.createdAt || '';
        if (timeA && timeB) {
          return new Date(timeB).getTime() - new Date(timeA).getTime();
        }
        if (timeA) return -1;
        if (timeB) return 1;

        const updateA = a.updatedAt || '';
        const updateB = b.updatedAt || '';
        if (updateA && updateB) {
          return new Date(updateB).getTime() - new Date(updateA).getTime();
        }
        if (updateA) return -1;
        if (updateB) return 1;

        return String(b.id || '').localeCompare(String(a.id || ''));
      });
    } else if (sortBy === 'price-low-high') {
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
    <div id="catalog-section" className="pt-22 pb-6 bg-[var(--theme-bg)] min-h-screen">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-12">
        
        {/* Searching, Sorting, and Category Controls Group */}
        <div className="mb-3">
          {/* Top Control Bar: Search and Sort */}
          <div className="flex flex-row gap-2.5 items-center bg-transparent p-0">
            {/* Search Input (Takes maximum space) */}
            <div className="relative flex-grow">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                id="catalog-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search catalog... (e.g. lipstick, hair oil, ornaments)"
                className="w-full pl-10 pr-10 py-2 sm:py-2.5 bg-white border border-[var(--theme-border)] text-sm text-[var(--theme-text-primary)] placeholder-stone-400 rounded-none focus:outline-none focus:border-[var(--theme-accent)] transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[var(--theme-text-primary)] p-1 z-10"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Elegant Small Sort Dropdown Button (Overlapping Hidden Select) */}
            <div className="relative shrink-0 select-none">
              <button 
                type="button"
                className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 bg-white border border-[var(--theme-border)] hover:border-[var(--theme-accent)] transition-all text-stone-600 hover:text-[var(--theme-text-primary)]"
                aria-label="Sort options"
              >
                <ArrowUpDown className="w-4.5 h-4.5" />
              </button>
              <select
                id="catalog-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                title="Sort items"
              >
                <option value="default">Newest First</option>
                <option value="price-low-high">Price: Low to High</option>
                <option value="price-high-low">Price: High to Low</option>
                <option value="name-asc">Alphabetical: A-Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Premium Banner 1 Slider System (Below Search Bar) */}
        {settings?.banner1 && settings.banner1.type !== 'None' && (
          <div 
            id="catalog-home-banner-1" 
            className="w-full mb-3 overflow-hidden"
          >
            <BannerSlider banner={settings.banner1} title="Banner 1" />
          </div>
        )}

        {/* Categorization Title */}
        <div className="flex items-center justify-between mb-3.5 select-none mt-2">
          <h2 className="text-[10px] tracking-[0.22em] font-extrabold text-[#1A1A1A] uppercase flex items-center gap-2 font-sans">
            <Sparkles className="w-3.5 h-3.5 text-[var(--theme-accent)] animate-pulse" />
            Shop By Categories / श्रेणियाँ
          </h2>
          <span className="text-[9px] font-mono text-stone-400 uppercase tracking-widest hidden sm:inline">
            Choose to filter products
          </span>
        </div>

        {/* Categorization Tabs - Prominent Eye-Catching Rectangular Boxes with Icons */}
        <div 
          className={`sticky top-[80px] z-30 py-3 border-y border-[var(--theme-border)]/90 flex items-center gap-2.5 overflow-x-auto scrollbar-none -mx-6 px-6 md:mx-0 md:px-0 md:flex-wrap backdrop-blur-md shadow-[0_2px_12px_rgba(0,0,0,0.03)] transition-all ${
            settings?.banner2 && settings.banner2.type !== 'None' ? 'mb-4' : 'mb-6'
          }`}
          style={{ backgroundColor: 'rgba(250, 249, 245, 0.98)' }}
        >
          <div className="flex items-center gap-3 overflow-visible md:flex-wrap pb-1 md:pb-0 w-full">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  id={`cat-tab-${cat.toLowerCase()}`}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex items-center gap-2.5 px-5 py-3 text-xs font-bold tracking-wider capitalize cursor-pointer border-[2px] transition-all duration-300 rounded-none whitespace-nowrap group select-none active:scale-95 ${
                    isActive 
                      ? 'bg-[var(--theme-accent)] text-white border-[var(--theme-accent)] shadow-[3px_3px_0px_0px_rgba(255,0,82,0.18)] scale-[1.03]' 
                      : 'bg-white text-stone-800 border-stone-400 hover:text-[var(--theme-accent)] hover:border-[var(--theme-accent)] hover:bg-[var(--theme-accent-glow)] hover:shadow-[3px_3px_0px_0px_rgba(255,0,82,0.12)]'
                  }`}
                >
                  <span className={`transition-transform duration-300 group-hover:scale-120 ${isActive ? 'text-white' : 'text-stone-500 group-hover:text-[var(--theme-accent)]'}`}>
                    {getCategoryIcon(cat)}
                  </span>
                  <span className="font-sans text-[11.5px] font-bold tracking-wide">{cat}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Premium Banner 2 Slider System (Below Category Bar) */}
        {settings?.banner2 && settings.banner2.type !== 'None' && (
          <div 
            id="catalog-home-banner-2" 
            className="w-full mb-4 overflow-hidden"
          >
            <BannerSlider banner={settings.banner2} title="Banner 2" />
          </div>
        )}

        {/* Product Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 animate-pulse">
            {Array.from({ length: 8 }).map((_, index) => (
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
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 transition-opacity duration-300">
              {visibleProducts.map((p) => (
                <ProductCard 
                  key={p.id} 
                  product={p} 
                  onViewDetails={setSelectedProduct} 
                />
              ))}

              {/* Keep the product boxes placeholder grid alive while loading more */}
              {isLoadingMore && (
                Array.from({ length: 4 }).map((_, index) => (
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
              <div className="py-6 text-center border-t border-[var(--theme-border)] mt-6 animate-fade-in">
                <p className="text-[10px] uppercase font-mono tracking-[0.3em] text-[var(--theme-text-muted)] font-medium">
                  ✦ You have viewed all curated formulations ✦
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="py-12 text-center border border-[var(--theme-border)] bg-white max-w-xl mx-auto">
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in"
            onClick={() => setSelectedProduct(null)}
          >
            <div 
              className="relative w-full max-w-4xl bg-white border border-[var(--theme-border)] text-left outline-none overflow-hidden max-h-[95vh] md:max-h-[90vh] flex flex-col md:flex-row shadow-2xl rounded-none"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button 
                id="close-details-modal"
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 z-30 p-2 bg-white/90 text-stone-600 hover:text-stone-900 transition-colors cursor-pointer rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.1)] hover:bg-stone-50"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Left Column: Large Premium Image Viewer */}
              <div className="w-full md:w-1/2 h-[300px] sm:h-[400px] md:h-[520px] shrink-0 bg-white relative overflow-hidden flex items-center justify-center p-6 md:p-10 border-b md:border-b-0 md:border-r border-[var(--theme-border)]/65">
                <div className="absolute inset-0 bg-[radial-gradient(#f1f0ea_1px,transparent_1px)] [background-size:16px_16px] opacity-50 pointer-events-none" />
                <img 
                  src={selectedProduct.image} 
                  alt={selectedProduct.name} 
                  className="w-full h-full object-contain object-center transition-all duration-700 ease-out hover:scale-[1.05] relative z-10"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4 bg-[var(--theme-accent)] text-white px-3 py-1 text-[9px] tracking-widest uppercase font-extrabold z-20 shadow-xs">
                  {selectedProduct.category}
                </div>
              </div>

              {/* Modal Right Column: Deep Product Details */}
              <div className="w-full md:w-1/2 p-5 sm:p-6 md:p-8 overflow-y-auto flex flex-col justify-between max-h-[45vh] md:max-h-[520px]">
                <div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-[var(--theme-text-primary)] tracking-wide leading-tight mb-2">
                    {selectedProduct.name}
                  </h3>
                  
                  <div className="flex gap-2 items-center mb-2 flex-wrap">
                    <span className={`inline-block px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-sm border ${
                      selectedProduct.inStock !== false 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {selectedProduct.inStock !== false ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                  
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
                  <div className="space-y-3 mt-4">
                    {selectedProduct.hasCustomQty && selectedProduct.qtyVal !== undefined && (
                      <div>
                        <h4 className="text-[10px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-widest mb-1">Specifications / Quantity</h4>
                        <p className="text-xs sm:text-sm text-[var(--theme-text-secondary)] font-medium leading-relaxed">
                          {formatCustomQuantity(selectedProduct.qtyVal, selectedProduct.qtyUnit)}
                        </p>
                      </div>
                    )}

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
