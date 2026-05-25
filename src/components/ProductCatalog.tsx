import {useState, useMemo} from 'react';
import ProductCard, {Product} from './ProductCard.tsx';
import {Search, SlidersHorizontal, ArrowUpDown, X, Sparkles, CheckCircle2, ShieldAlert} from 'lucide-react';

interface ProductCatalogProps {
  products: Product[];
}

export default function ProductCatalog({products}: ProductCatalogProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('default');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

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

  return (
    <div id="catalog-section" className="pt-28 pb-20 bg-[var(--theme-bg)] min-h-screen">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
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
        {filteredAndSortedProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAndSortedProducts.map((p) => (
              <ProductCard 
                key={p.id} 
                product={p} 
                onViewDetails={setSelectedProduct} 
              />
            ))}
          </div>
        ) : (
          <div className="py-24 text-center border border-[var(--theme-border)] bg-white max-w-xl mx-auto">
            <Sparkles className="w-10 h-10 text-stone-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[var(--theme-text-primary)] mb-2">No items match your criteria</h3>
            <p className="text-xs text-[var(--theme-text-secondary)] px-6 font-light">
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
              className="relative w-full max-w-4xl bg-white border border-[var(--theme-border)] text-left outline-none overflow-hidden max-h-[90vh] flex flex-col md:flex-row shadow-2xl rounded-none"
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

              {/* Modal Left Column: Large Image */}
              <div className="w-full md:w-1/2 aspect-square md:aspect-auto md:h-full bg-[var(--theme-bg)] relative max-h-[40vh] md:max-h-full">
                <img 
                  src={selectedProduct.image} 
                  alt={selectedProduct.name} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 bg-[var(--theme-accent)] text-white px-3 py-1 text-[10px] tracking-widest uppercase font-bold">
                  {selectedProduct.category}
                </div>
              </div>

              {/* Modal Right Column: Deep Product Details */}
              <div className="w-full md:w-1/2 p-8 md:p-12 overflow-y-auto flex flex-col justify-between max-h-[50vh] md:max-h-full">
                <div>
                  <div className="flex items-center gap-2 mb-2 text-[var(--theme-accent)]">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-[10px] tracking-[0.25em] font-bold uppercase">Riya Signature Formula</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-light text-[var(--theme-text-primary)] uppercase tracking-wide leading-tight mb-4">
                    {selectedProduct.name}
                  </h3>
                  
                  {/* Absolute Price Listing */}
                  <div className="mb-6 pb-4 border-b border-[var(--theme-border)]">
                    <div className="flex items-center gap-3 flex-wrap">
                      {(() => {
                        const mrpVal = selectedProduct.mrp || selectedProduct.priceInINR || 0;
                        const spVal = selectedProduct.sp || selectedProduct.priceInINR || 0;
                        const discountPercent = (mrpVal > 0 && mrpVal > spVal) ? Math.round(((mrpVal - spVal) / mrpVal) * 100) : 0;

                        return (
                          <div className="flex flex-col">
                            {discountPercent > 0 && (
                              <div className="flex items-center gap-2 mb-1.5">
                                <span className="text-sm text-[var(--theme-text-muted)] line-through">
                                  MRP: ₹{mrpVal.toLocaleString('en-IN')}
                                </span>
                                <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 font-bold uppercase tracking-wider rounded-none">
                                  {discountPercent}% OFF
                                </span>
                              </div>
                            )}
                            <span className="text-3xl font-bold text-[var(--theme-text-primary)] tracking-wide">
                              ₹{spVal.toLocaleString('en-IN')}
                            </span>
                          </div>
                        );
                      })()}
                    </div>
                    <span className="block mt-2.5 text-xs text-[var(--theme-text-muted)] font-light italic">
                      (Inclusive of all taxes - Curated lookbook value)
                    </span>
                  </div>

                  {/* Product Narrative */}
                  <div className="space-y-4 mb-8">
                    <div>
                      <h4 className="text-xs font-semibold text-[var(--theme-text-muted)] uppercase tracking-widest mb-1">Description</h4>
                      <p className="text-sm text-[var(--theme-text-secondary)] font-light leading-relaxed">
                        {selectedProduct.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div>
                        <h4 className="text-xs font-semibold text-[var(--theme-text-muted)] uppercase tracking-widest mb-1.5">Best Suited For</h4>
                        <div className="flex items-center gap-1.5 text-xs text-[var(--theme-text-secondary)] font-light">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[var(--theme-accent)]" /> All Skin Types
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-[var(--theme-text-muted)] uppercase tracking-widest mb-1.5">Application</h4>
                        <div className="flex items-center gap-1.5 text-xs text-[var(--theme-text-secondary)] font-light">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[var(--theme-accent)]" /> Smooth professional finish
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footnote Warning regarding Non-Ecommerce constraint */}
                <div className="pt-6 border-t border-[var(--theme-border)] flex gap-3 items-start bg-[var(--theme-accent-glow)] p-3.5 border-l-2 border-[var(--theme-accent)]">
                  <ShieldAlert className="w-4 h-4 text-[var(--theme-accent)] shrink-0 mt-0.5" />
                  <p className="text-[11px] text-[var(--theme-text-primary)] leading-normal font-light">
                    <strong>Exclusive Catalog Mode:</strong> Booking or direct e-commerce shopping is deactivated. To obtain this item, visit an authorized Riya Cosmetics brick-and-mortar luxury salon.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
