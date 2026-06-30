import {useState, useMemo, useEffect, useRef} from 'react';
import ProductCard, {Product, formatCustomQuantity} from './ProductCard.tsx';
import {
  Search, SlidersHorizontal, ArrowUpDown, X, Sparkles, CheckCircle2, ShieldAlert,
  Palette, Droplet, Scissors, Heart, Baby, Gem, Grid, Smile, Boxes,
  ShoppingCart, Plus, Minus, Trash2, User, ShoppingBag, Phone, MapPin, MessageSquare, Check, ArrowLeft, ArrowRight
} from 'lucide-react';
import { SettingsConfig, dbAddOrder } from '../firebaseService';
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
  cart: { product: Product; quantity: number }[];
  onAddToCart: (product: Product) => void;
  onUpdateCartQuantity: (productId: string | number, quantity: number) => void;
  onRemoveFromCart: (productId: string | number) => void;
  onClearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
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
    case 'Others':
      return <Boxes className="w-4 h-4 shadow-xs text-indigo-500" />;
    default:
      return <Grid className="w-4 h-4 shadow-xs" />;
  }
};

export default function ProductCatalog({
  products, 
  isLoading = false, 
  settings,
  cart,
  onAddToCart,
  onUpdateCartQuantity,
  onRemoveFromCart,
  onClearCart,
  isCartOpen,
  setIsCartOpen
}: ProductCatalogProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('default');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [visibleCount, setVisibleCount] = useState<number>(6);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Checkout-related local states
  const [isCheckoutStep, setIsCheckoutStep] = useState<boolean>(false);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerAddress, setCustomerAddress] = useState<string>('');
  const [isPlacingOrder, setIsPlacingOrder] = useState<boolean>(false);
  const [orderSuccessId, setOrderSuccessId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string>('');

  const [placedOrderItems, setPlacedOrderItems] = useState<{ name: string; quantity: number; price: number; qtyVal?: string | number; qtyUnit?: string }[]>([]);
  const [placedTotal, setPlacedTotal] = useState<number>(0);

  const cartSubtotal = useMemo(() => {
    return cart.reduce((total, item) => {
      const itemPrice = item.product.sp !== undefined ? item.product.sp : (item.product.priceInINR || 0);
      return total + (itemPrice * item.quantity);
    }, 0);
  }, [cart]);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!customerName.trim() || !customerPhone.trim() || !customerAddress.trim()) {
      setFormError('कृपया सभी आवश्यक जानकारी भरें। / Please fill all required fields.');
      return;
    }

    setIsPlacingOrder(true);
    try {
      const orderItems = cart.map(item => {
        const orderItem: any = {
          productId: String(item.product.id),
          name: item.product.name,
          orderedQty: item.quantity,
          price: item.product.sp !== undefined ? item.product.sp : (item.product.priceInINR || 0)
        };
        if (item.product.qtyVal !== undefined && item.product.qtyVal !== null && !isNaN(Number(item.product.qtyVal))) {
          orderItem.qtyVal = Number(item.product.qtyVal);
        }
        if (item.product.qtyUnit) {
          orderItem.qtyUnit = item.product.qtyUnit;
        }
        return orderItem;
      });

      // Cache order items & total for WhatsApp message before clearing cart
      const orderItemsCopy = cart.map(item => {
        const itemCopy: any = {
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.sp !== undefined ? item.product.sp : (item.product.priceInINR || 0)
        };
        if (item.product.qtyVal !== undefined && item.product.qtyVal !== null) {
          itemCopy.qtyVal = item.product.qtyVal;
        }
        if (item.product.qtyUnit) {
          itemCopy.qtyUnit = item.product.qtyUnit;
        }
        return itemCopy;
      });
      setPlacedOrderItems(orderItemsCopy);
      setPlacedTotal(cartSubtotal);

      const newOrderId = await dbAddOrder({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerAddress: customerAddress.trim(),
        items: orderItems,
        totalAmount: cartSubtotal,
        status: 'Pending',
        createdAt: new Date().toISOString()
      });

      setOrderSuccessId(newOrderId);
      onClearCart();
    } catch (err: any) {
      console.error('Failed to book order:', err);
      setFormError('Failed to book order. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handleSendWhatsApp = () => {
    if (!orderSuccessId) return;
    
    const itemsList = placedOrderItems.map(item => {
      const spec = item.qtyVal ? ` (${item.qtyVal} ${item.qtyUnit})` : '';
      return `- ${item.name}${spec}: ${item.quantity} x ₹${item.price.toLocaleString('en-IN')}`;
    }).join('\n');

    const orderLink = `${window.location.origin}/#/invoice/${orderSuccessId}`;
    
    const message = `*New Order - Riya Cosmetics*\n\n` +
      `Order ID: *${orderSuccessId}*\n` +
      `Customer Name: *${customerName}*\n` +
      `WhatsApp Number: *${customerPhone}*\n` +
      `Address: *${customerAddress}*\n\n` +
      `*Items List:*\n${itemsList}\n\n` +
      `Total Amount: *₹${placedTotal.toLocaleString('en-IN')}*\n\n` +
      `Click here to view your digital bill:\n${orderLink}\n\n` +
      `Please accept my order! 🙏✨`;

    const encodedMsg = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/91${customerPhone.replace(/[^0-9]/g, '')}?text=${encodedMsg}`;
    window.open(whatsappUrl, '_blank');
  };

  const categories = ['All', 'Makeup', 'Skin Care', 'Hair Care', 'Body Care', 'Undergarments', 'Baby Care', 'Bangles & Ornaments', 'Others'];

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

  // Reset checkout step to false whenever the cart drawer opens
  useEffect(() => {
    if (isCartOpen) {
      setIsCheckoutStep(false);
    }
  }, [isCartOpen]);

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
                className="w-full pl-10 pr-10 py-1.5 sm:py-2 bg-white border border-[var(--theme-border)] text-sm text-[var(--theme-text-primary)] placeholder-stone-400 rounded-none focus:outline-none focus:border-[var(--theme-accent)] transition-all"
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
            Shop By Categories
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4 animate-pulse">
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
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4 transition-opacity duration-300">
              {visibleProducts.map((p) => (
                <ProductCard 
                  key={p.id} 
                  product={p} 
                  onViewDetails={setSelectedProduct} 
                  onAddToCart={onAddToCart}
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

                  {/* Modal Add to Cart Integration Section */}
                  <div className="mt-8 pt-6 border-t border-[var(--theme-border)]/60">
                    {selectedProduct.inStock !== false ? (
                      (() => {
                        const inCart = cart.find(item => item.product.id === selectedProduct.id);
                        if (inCart) {
                          return (
                            <div className="text-center py-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 animate-fade-in">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 animate-bounce" />
                              Added to Cart
                            </div>
                          );
                        }
                        return (
                          <button
                            id="modal-add-to-cart-btn"
                            onClick={() => {
                              onAddToCart(selectedProduct);
                            }}
                            className="w-full py-3 bg-[#ff0052] text-white font-bold text-xs tracking-widest uppercase hover:bg-[#ff0052]/90 transition-all duration-300 flex items-center justify-center gap-2 rounded-none cursor-pointer"
                          >
                            <Plus className="w-4 h-4" /> Add to Cart (₹{(selectedProduct.sp || selectedProduct.priceInINR || 0).toLocaleString('en-IN')})
                          </button>
                        );
                      })()
                    ) : (
                      <div className="text-center py-2.5 bg-red-50 border border-red-100 text-red-600 text-xs font-bold uppercase tracking-wider">
                        Out of Stock / अनुपलब्ध
                      </div>
                    )}
                  </div>

                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cart Drawer sliding sidebar overlay */}
        {isCartOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in" id="cart-drawer-container">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity duration-500 ease-out" 
              onClick={() => setIsCartOpen(false)}
            />

            <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
              <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-stone-200">
                
                {/* Cart Drawer Header */}
                <div className="p-5 border-b border-stone-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-[var(--theme-accent)]" />
                    <span className="text-sm font-extrabold uppercase tracking-widest text-stone-900">
                      {isCheckoutStep ? 'Checkout Form' : 'Your Shopping Bag'}
                    </span>
                    <span className="bg-stone-100 text-stone-800 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {cart.reduce((a, c) => a + c.quantity, 0)} Items
                    </span>
                  </div>
                  
                  <button 
                    onClick={() => {
                      setIsCartOpen(false);
                      if (orderSuccessId) {
                        setOrderSuccessId(null);
                        setIsCheckoutStep(false);
                        setCustomerName('');
                        setCustomerPhone('');
                        setCustomerAddress('');
                      }
                    }}
                    className="p-1.5 text-stone-400 hover:text-stone-900 transition-colors cursor-pointer outline-none"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Interactive Visual Step Tracker */}
                <div className="px-5 py-4 bg-stone-50 border-b border-stone-100 flex items-center justify-between text-xs select-none">
                  {/* Step 1: Cart */}
                  <button
                    disabled={!!orderSuccessId}
                    onClick={() => {
                      if (!orderSuccessId) {
                        setIsCheckoutStep(false);
                      }
                    }}
                    className={`flex items-center gap-2 font-mono uppercase text-[10px] font-bold tracking-wider transition-all duration-300 ${
                      orderSuccessId 
                        ? 'text-stone-300 cursor-not-allowed'
                        : !isCheckoutStep 
                          ? 'text-[var(--theme-accent)] scale-105' 
                          : 'text-stone-500 hover:text-stone-900 cursor-pointer'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center border font-mono text-[9px] ${
                      !isCheckoutStep && !orderSuccessId
                        ? 'bg-[var(--theme-accent)] text-white border-[var(--theme-accent)]'
                        : orderSuccessId
                          ? 'bg-stone-100 text-stone-300 border-stone-200'
                          : 'bg-white text-stone-600 border-stone-300'
                    }`}>
                      1
                    </span>
                    Cart
                  </button>

                  {/* Divider Line 1 */}
                  <div className={`flex-1 h-[1px] mx-3 transition-colors duration-500 ${
                    isCheckoutStep || orderSuccessId ? 'bg-[var(--theme-accent)]' : 'bg-stone-200'
                  }`} />

                  {/* Step 2: Address */}
                  <button
                    disabled={!!orderSuccessId || cart.length === 0}
                    onClick={() => {
                      if (!orderSuccessId && cart.length > 0) {
                        setIsCheckoutStep(true);
                      }
                    }}
                    className={`flex items-center gap-2 font-mono uppercase text-[10px] font-bold tracking-wider transition-all duration-300 ${
                      orderSuccessId 
                        ? 'text-stone-300 cursor-not-allowed'
                        : isCheckoutStep 
                          ? 'text-[var(--theme-accent)] scale-105' 
                          : cart.length === 0
                            ? 'text-stone-300 cursor-not-allowed'
                            : 'text-stone-500 hover:text-stone-900 cursor-pointer'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center border font-mono text-[9px] ${
                      isCheckoutStep && !orderSuccessId
                        ? 'bg-[var(--theme-accent)] text-white border-[var(--theme-accent)]'
                        : orderSuccessId
                          ? 'bg-stone-100 text-stone-300 border-stone-200'
                          : 'bg-white text-stone-600 border-stone-300'
                    }`}>
                      2
                    </span>
                    Address
                  </button>

                  {/* Divider Line 2 */}
                  <div className={`flex-1 h-[1px] mx-3 transition-colors duration-500 ${
                    orderSuccessId ? 'bg-[var(--theme-accent)]' : 'bg-stone-200'
                  }`} />

                  {/* Step 3: Receipt */}
                  <div
                    className={`flex items-center gap-2 font-mono uppercase text-[10px] font-bold tracking-wider transition-all duration-300 ${
                      orderSuccessId 
                        ? 'text-[var(--theme-accent)] scale-105' 
                        : 'text-stone-300'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center border font-mono text-[9px] ${
                      orderSuccessId
                        ? 'bg-[var(--theme-accent)] text-white border-[var(--theme-accent)]'
                        : 'bg-white text-stone-300 border-stone-200'
                    }`}>
                      3
                    </span>
                    Receipt
                  </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-grow overflow-y-auto p-5">
                  {orderSuccessId ? (
                    /* Order Placed Success View */
                    <div className="text-center py-8 px-4 flex flex-col items-center justify-center h-full">
                      <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mb-6 border border-emerald-100 animate-bounce">
                        <Check className="w-8 h-8" />
                      </div>
                      <h3 className="text-lg font-extrabold uppercase tracking-wider text-stone-900 mb-2">
                        Order Placed Successfully!
                      </h3>
                      <p className="text-xs text-stone-500 mb-6 max-w-xs font-medium leading-relaxed">
                        Your order has been booked successfully in our real-time database. You can now view your digital bill or send it to us via WhatsApp.
                      </p>
                      
                      <div className="bg-stone-50 border border-stone-200/60 p-4 w-full mb-8 rounded-sm text-left">
                        <div className="text-[10px] uppercase font-mono tracking-widest text-stone-400 mb-1">Generated Order ID</div>
                        <div className="text-sm font-bold text-stone-900 font-mono select-all select-text">{orderSuccessId}</div>
                      </div>

                      <div className="space-y-3.5 w-full">
                        <button
                          onClick={handleSendWhatsApp}
                          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 rounded-none cursor-pointer shadow-sm"
                        >
                          <MessageSquare className="w-4 h-4" /> Send Order via WhatsApp
                        </button>
                        
                        <a
                          href={`#/invoice/${orderSuccessId}`}
                          onClick={() => setIsCartOpen(false)}
                          className="w-full py-3 border border-stone-900 text-stone-900 hover:bg-stone-50 font-extrabold text-[11px] uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 rounded-none cursor-pointer text-center"
                        >
                          View Digital Invoice
                        </a>

                        <button
                          onClick={() => {
                            setOrderSuccessId(null);
                            setIsCheckoutStep(false);
                            setCustomerName('');
                            setCustomerPhone('');
                            setCustomerAddress('');
                            setIsCartOpen(false);
                          }}
                          className="w-full py-2.5 text-stone-400 hover:text-stone-600 text-[10px] uppercase tracking-wider font-semibold"
                        >
                          Continue Shopping
                        </button>
                      </div>
                    </div>
                  ) : isCheckoutStep ? (
                    /* Checkout Form View */
                    (() => {
                      const isNameValid = customerName.trim().length >= 3;
                      const isPhoneValid = customerPhone.replace(/[^0-9]/g, '').length === 10;
                      const isAddressValid = customerAddress.trim().length >= 3;

                      return (
                        <form 
                          onSubmit={async (e) => {
                            e.preventDefault();
                            if (!isNameValid || !isPhoneValid || !isAddressValid) {
                              setFormError('Please fill in all information correctly. (Name >= 3 chars, Phone = 10 digits, Address >= 3 chars)');
                              return;
                            }
                            await handlePlaceOrder(e);
                          }} 
                          className="space-y-4"
                        >
                          <div>
                            <div className="flex justify-between items-center mb-1.5">
                              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#282828]">
                                Customer Name <span className="text-red-500">*</span>
                              </label>
                              {customerName.trim().length > 0 && (
                                <span className={`text-[9px] font-bold uppercase tracking-wider ${isNameValid ? 'text-emerald-600' : 'text-amber-500'}`}>
                                  {isNameValid ? 'Valid' : 'Min 3 characters required'}
                                </span>
                              )}
                            </div>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                              <input
                                type="text"
                                required
                                placeholder="e.g. Riya Sharma"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                className={`w-full pl-10 pr-10 py-2.5 bg-stone-50 border rounded-none focus:outline-none text-xs text-stone-900 font-medium transition-all ${
                                  customerName.trim().length === 0 ? 'border-stone-200/85 focus:border-stone-950' :
                                  isNameValid ? 'border-emerald-500/80 focus:border-emerald-600' : 'border-amber-500/80 focus:border-amber-600'
                                }`}
                              />
                              {isNameValid && (
                                <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600 animate-pulse" />
                              )}
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between items-center mb-1.5">
                              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#282828]">
                                WhatsApp Number <span className="text-red-500">*</span>
                              </label>
                              {customerPhone.trim().length > 0 && (
                                <span className={`text-[9px] font-bold uppercase tracking-wider ${isPhoneValid ? 'text-emerald-600' : 'text-amber-500'}`}>
                                  {isPhoneValid ? 'Valid' : '10 digits required'}
                                </span>
                              )}
                            </div>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                              <input
                                type="tel"
                                required
                                placeholder="e.g. 9876543210"
                                value={customerPhone}
                                onChange={(e) => {
                                  // Allow only digits
                                  const val = e.target.value.replace(/[^0-9]/g, '');
                                  if (val.length <= 10) {
                                    setCustomerPhone(val);
                                  }
                                }}
                                className={`w-full pl-10 pr-10 py-2.5 bg-stone-50 border rounded-none focus:outline-none text-xs text-stone-900 font-medium font-mono transition-all ${
                                  customerPhone.trim().length === 0 ? 'border-stone-200/85 focus:border-stone-950' :
                                  isPhoneValid ? 'border-emerald-500/80 focus:border-emerald-600' : 'border-amber-500/80 focus:border-amber-600'
                                }`}
                              />
                              {isPhoneValid && (
                                <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600 animate-pulse" />
                              )}
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between items-center mb-1.5">
                              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#282828]">
                                Delivery Address <span className="text-red-500">*</span>
                              </label>
                              {customerAddress.trim().length > 0 && (
                                <span className={`text-[9px] font-bold uppercase tracking-wider ${isAddressValid ? 'text-emerald-600' : 'text-amber-500'}`}>
                                  {isAddressValid ? 'Valid' : 'Min 3 characters'}
                                </span>
                              )}
                            </div>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-3 w-4 h-4 text-stone-400" />
                              <textarea
                                required
                                rows={3}
                                placeholder="House no., Street, City, Pincode"
                                value={customerAddress}
                                onChange={(e) => setCustomerAddress(e.target.value)}
                                className={`w-full pl-10 pr-10 py-2.5 bg-stone-50 border rounded-none focus:outline-none text-xs text-stone-900 font-medium resize-none transition-all ${
                                  customerAddress.trim().length === 0 ? 'border-stone-200/85 focus:border-stone-950' :
                                  isAddressValid ? 'border-emerald-500/80 focus:border-emerald-600' : 'border-amber-500/80 focus:border-amber-600'
                                }`}
                              />
                              {isAddressValid && (
                                <Check className="absolute right-3 top-3 w-4 h-4 text-emerald-600 animate-pulse" />
                              )}
                            </div>
                          </div>

                          {/* Itemized Order Summary Detail */}
                          <div className="border border-stone-200/80 p-3.5 bg-stone-50/50 space-y-2.5">
                            <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#282828] border-b border-stone-200 pb-2">
                              Order Summary
                            </h4>
                            <div className="max-h-[160px] overflow-y-auto divide-y divide-stone-100 pr-1">
                              {cart.map((item) => {
                                const currentPrice = item.product.sp !== undefined ? item.product.sp : (item.product.priceInINR || 0);
                                const itemTotal = currentPrice * item.quantity;
                                return (
                                  <div key={item.product.id} className="flex justify-between items-start text-xs py-2 first:pt-0 last:pb-0">
                                    <div className="space-y-0.5 max-w-[70%]">
                                      <p className="font-bold text-[11px] text-black leading-snug">
                                        {item.product.name}
                                      </p>
                                      <p className="text-[10px] text-black font-medium font-mono">
                                        Qty: {item.quantity} × ₹{currentPrice.toLocaleString('en-IN')}
                                      </p>
                                    </div>
                                    <span className="font-bold text-[11px] text-stone-900 font-mono shrink-0">
                                      ₹{itemTotal.toLocaleString('en-IN')}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {formError && (
                            <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-[11px] font-bold uppercase tracking-wider rounded-sm">
                              {formError}
                            </div>
                          )}

                          <div className="bg-stone-50 p-4 border border-stone-100 mt-4 space-y-1.5">
                            <div className="flex justify-between text-xs font-semibold text-stone-500">
                              <span>Items Subtotal:</span>
                              <span>₹{cartSubtotal.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between text-xs font-semibold text-stone-500">
                              <span>Shipping Charge:</span>
                              <span className="text-emerald-600">FREE</span>
                            </div>
                            <div className="flex justify-between text-sm font-black text-stone-900 border-t border-stone-200/50 pt-2">
                              <span className="text-black">Grand Total:</span>
                              <span>₹{cartSubtotal.toLocaleString('en-IN')}</span>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setIsCheckoutStep(false)}
                              className="w-1/2 py-3.5 bg-[#ff0052] hover:bg-[#ff0052]/90 text-white font-extrabold text-[10px] uppercase tracking-widest transition-all duration-300 flex items-center justify-center rounded-none cursor-pointer"
                            >
                              Back to Cart
                            </button>
                            <button
                              type="submit"
                              disabled={isPlacingOrder || !isNameValid || !isPhoneValid || !isAddressValid}
                              className={`w-1/2 py-3.5 font-extrabold text-[10px] uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 rounded-none cursor-pointer ${
                                isPlacingOrder ? 'bg-stone-400 text-stone-200 cursor-not-allowed' :
                                (isNameValid && isPhoneValid && isAddressValid)
                                  ? 'bg-[#ff0052] hover:bg-[#ff0052]/90 text-white hover:scale-[1.01] active:scale-[0.99]'
                                  : 'bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-300'
                              }`}
                            >
                              {isPlacingOrder ? 'Booking...' : 'Book Order'}
                            </button>
                          </div>
                        </form>
                      );
                    })()
                  ) : cart.length === 0 ? (
                    /* Empty Cart State */
                    <div className="text-center py-20 flex flex-col items-center justify-center h-full">
                      <ShoppingBag className="w-12 h-12 text-stone-300 mb-4 animate-pulse" />
                      <h4 className="text-sm font-bold uppercase tracking-widest text-stone-900 mb-1">Your Cart is Empty</h4>
                      <p className="text-xs text-stone-400 font-medium max-w-[200px] leading-relaxed mx-auto">
                        Add standard luxury cosmetics from our catalogue lookup to checkout items.
                      </p>
                    </div>
                  ) : (
                    /* Cart Items List */
                    <div className="space-y-4">
                      {cart.map((item) => {
                        const itemPrice = item.product.sp !== undefined ? item.product.sp : (item.product.priceInINR || 0);
                        return (
                          <div 
                            key={item.product.id}
                            className="flex gap-3 pb-4 border-b border-stone-100"
                          >
                            <div className="w-16 h-16 bg-stone-50 border border-stone-200/50 flex items-center justify-center shrink-0 p-1">
                              <img 
                                src={item.product.image} 
                                alt={item.product.name} 
                                className="w-full h-full object-contain"
                              />
                            </div>
                            
                            <div className="flex-grow min-w-0 flex flex-col justify-between">
                              <div>
                                <h4 className="text-xs font-bold text-stone-900 truncate leading-snug">{item.product.name}</h4>
                                <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--theme-accent)] block mb-1">
                                  {item.product.category}
                                </span>
                                {item.product.hasCustomQty && item.product.qtyVal && (
                                  <span className="text-[10px] text-stone-400 font-medium block">
                                    Spec: {item.product.qtyVal} {item.product.qtyUnit}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center justify-between mt-1.5">
                                <span className="text-xs font-bold text-stone-950">
                                  ₹{itemPrice.toLocaleString('en-IN')}
                                </span>
                                
                                <div className="flex items-center gap-2">
                                  {/* Quantity Increment/Decrement controls */}
                                  <div className="flex items-center border border-stone-200 rounded-none bg-white">
                                    <button
                                      onClick={() => onUpdateCartQuantity(item.product.id, item.quantity - 1)}
                                      className="p-1 text-stone-500 hover:bg-stone-50 transition-colors cursor-pointer"
                                    >
                                      {item.quantity === 1 ? <Trash2 className="w-3 h-3 text-red-500" /> : <Minus className="w-3 h-3" />}
                                    </button>
                                    <span className="px-2 text-[11px] font-black font-mono text-stone-900">
                                      {item.quantity}
                                    </span>
                                    <button
                                      onClick={() => onUpdateCartQuantity(item.product.id, item.quantity + 1)}
                                      className="p-1 text-stone-500 hover:bg-stone-50 transition-colors cursor-pointer"
                                    >
                                      <Plus className="w-3 h-3" />
                                    </button>
                                  </div>

                                  {/* Dedicated Remove/Delete from Cart option */}
                                  <button
                                    onClick={() => onUpdateCartQuantity(item.product.id, 0)}
                                    className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 border border-stone-100 hover:border-red-200 transition-all cursor-pointer"
                                    title="Remove from Cart"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Footer calculations and submit buttons */}
                {!orderSuccessId && cart.length > 0 && (
                  <div className="p-5 border-t border-stone-100 bg-stone-50">
                    {!isCheckoutStep ? (
                      <>
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-xs uppercase font-extrabold tracking-widest text-stone-500">Subtotal:</span>
                          <span className="text-lg font-black text-stone-950">₹{cartSubtotal.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setIsCartOpen(false)}
                            className="w-1/2 py-3.5 bg-[#ff0052] hover:bg-[#ff0052]/90 text-white font-extrabold text-[10px] uppercase tracking-widest transition-all duration-300 flex items-center justify-center rounded-none cursor-pointer"
                          >
                            Continue Shopping
                          </button>
                          <button
                            onClick={() => setIsCheckoutStep(true)}
                            className="w-1/2 py-3.5 bg-[#ff0052] hover:bg-[#ff0052]/90 text-white font-extrabold text-[10px] uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-1.5 rounded-none cursor-pointer shadow-sm"
                          >
                            Proceed to Order <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </>
                    ) : null}
                  </div>
                )}

              </div>
            </div>
          </div>
        )}

        {/* Floating sticky checkout cart launcher in lower-right of viewport */}
        {cart.length > 0 && !isCartOpen && (
          <button
            onClick={() => setIsCartOpen(true)}
            className="fixed bottom-6 right-6 z-40 bg-[var(--theme-accent)] text-white p-4 rounded-full shadow-2xl hover:bg-[var(--theme-accent-hover)] transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center border border-white cursor-pointer"
            id="floating-cart-launcher-btn"
          >
            <ShoppingBag className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 bg-stone-900 text-white font-mono text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border border-white">
              {cart.reduce((a, c) => a + c.quantity, 0)}
            </span>
          </button>
        )}

      </div>
    </div>
  );
}
