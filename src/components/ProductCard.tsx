import {Eye, Plus, ShoppingBag, Heart} from 'lucide-react';
import {useState, useEffect, useRef} from 'react';

export interface Product {
  id: string | number;
  name: string;
  category: string;
  priceInINR: number;
  mrp?: number;
  sp?: number;
  description: string;
  image: string;
  hasCustomQty?: boolean;
  qtyVal?: number;
  qtyUnit?: string;
  inStock?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
  onAddToCart?: (product: Product, e: React.MouseEvent) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (productId: string | number) => void;
}

export function formatCustomQuantity(qtyVal: number | undefined, qtyUnit: string | undefined): string {
  if (qtyVal === undefined || qtyVal === null || !qtyUnit) return '';
  const unitClean = qtyUnit.trim();
  const unitLower = unitClean.toLowerCase();
  
  let formattedUnit = unitClean;
  if (unitLower.length === 1) {
    if (unitLower === 'g') {
      formattedUnit = qtyVal > 1 ? 'Grams' : 'Gram';
    } else if (unitLower === 'l') {
      formattedUnit = qtyVal > 1 ? 'Litres' : 'Litre';
    } else {
      formattedUnit = unitClean.toUpperCase();
    }
  } else if (unitLower.length === 2) {
    formattedUnit = unitLower;
  } else {
    formattedUnit = unitClean.charAt(0).toUpperCase() + unitClean.slice(1).toLowerCase();
  }
  
  return `${qtyVal} ${formattedUnit}`;
}

export default function ProductCard({
  product,
  onViewDetails,
  onAddToCart,
  isWishlisted = false,
  onToggleWishlist,
}: ProductCardProps) {
  const mrpVal = product.mrp || product.priceInINR || 0;
  const spVal = product.sp || product.priceInINR || 0;
  const discountPercent = (mrpVal > 0 && mrpVal > spVal) ? Math.round(((mrpVal - spVal) / mrpVal) * 100) : 0;
  
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '100px', // start loading slightly before entering viewport
        threshold: 0.01,
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const getQtyAndSpecs = () => {
    if (product.hasCustomQty && product.qtyVal !== undefined) {
      return formatCustomQuantity(product.qtyVal, product.qtyUnit);
    }
    return '';
  };

  return (
    <div 
      ref={cardRef}
      id={`product-card-${product.id}`}
      onClick={() => onViewDetails(product)}
      className="editorial-card fade-in group relative bg-white border border-[var(--theme-border)]/70 rounded-[2px] overflow-hidden transition-all duration-300 hover:border-[var(--theme-accent)] hover:shadow-sm flex flex-col justify-between cursor-pointer"
    >
      {/* Upper Media Section */}
      <div className="relative overflow-hidden aspect-square bg-stone-50 flex items-center justify-center border-b border-[var(--theme-border)]/40">
        {isInView ? (
          <>
            <img 
              src={product.image} 
              alt={product.name}
              onLoad={() => setImageLoaded(true)}
              className={`w-full h-full object-contain p-2 transition-transform duration-500 ease-out group-hover:scale-105 ${
                imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}
              loading="lazy"
            />
            {/* Elegant Shimmer Skeleton Overlay when loading */}
            {!imageLoaded && (
              <div className="absolute inset-0 bg-stone-100 animate-pulse flex items-center justify-center">
                <span className="text-[9px] uppercase tracking-widest text-stone-400 font-mono">Formula loading...</span>
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 bg-stone-100 animate-pulse flex items-center justify-center">
            <span className="text-[9px] uppercase tracking-widest text-stone-400 font-mono">Formula loading...</span>
          </div>
        )}
        
        {/* Floating status badge anchored in upper right-corner */}
        <div className={`absolute top-2 right-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm z-10 shadow-xs border ${
          product.inStock !== false 
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
            : 'bg-red-50 text-red-700 border-red-200'
        }`}>
          {product.inStock !== false ? 'In Stock' : 'Out of Stock'}
        </div>

        {/* Dynamic Discount Sticker Stamp */}
        {discountPercent > 0 && (
          <div className="absolute top-2 left-2 bg-red-600 text-white text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 shadow-md z-10">
            {discountPercent}% OFF
          </div>
        )}

        {/* Glamour Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <button
            id={`view-details-hover-${product.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(product);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 text-white font-medium text-[10px] tracking-wider uppercase transition-all duration-300 hover:bg-[var(--theme-accent)] hover:text-white cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            Quick View
          </button>
        </div>

        {/* Wishlist Heart Button */}
        <button
          id={`wishlist-toggle-${product.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist?.(product.id);
          }}
          className="absolute bottom-2 right-2 z-20 p-1.5 rounded-full bg-white/95 border border-stone-200/80 shadow-xs hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer flex items-center justify-center"
          title={isWishlisted ? "Remove from Favorites" : "Add to Favorites"}
        >
          <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-[#ff0052] text-[#ff0052]' : 'text-stone-500 hover:text-[#ff0052]'}`} />
        </button>
      </div>

      {/* Lower Text & Price Section */}
      <div className="p-2.5 sm:p-3 md:p-3.5 flex flex-col flex-grow justify-between min-h-0 md:min-h-[145px] bg-white text-left font-sans">
        <div className="space-y-0.5 mb-1">
          {/* Category Line */}
          <div className="truncate">
            <span className="text-[9px] sm:text-[10px] uppercase tracking-wider font-semibold text-[var(--theme-accent)]">
              {product.category}
            </span>
          </div>
          
          {/* Product Title (Name) */}
          <h3 className="text-sm md:text-base font-medium text-[var(--theme-text-primary)] tracking-tight leading-tight line-clamp-2 mb-0.5 group-hover:text-[var(--theme-accent)] transition-colors duration-300">
            {product.name}
          </h3>

          {/* Quantity Badge Line */}
          {getQtyAndSpecs() && (
            <div className="text-[10px] sm:text-xs text-[var(--theme-text-muted)] font-medium truncate block mb-1">
              {getQtyAndSpecs()}
            </div>
          )}
        </div>

        {/* Footer Panel (Prices) */}
        <div className="mt-auto pt-1.5 flex items-center justify-between gap-1 xs:gap-2 border-t border-[var(--theme-border)]/40">
          <div className="flex items-baseline gap-1 flex-wrap min-w-0">
            <span className="text-[15px] sm:text-lg md:text-xl font-bold text-[var(--theme-text-primary)] tracking-tight truncate">
              ₹{spVal.toLocaleString('en-IN')}
            </span>
            {discountPercent > 0 && (
              <span className="text-[10px] sm:text-xs text-[var(--theme-text-muted)] line-through decoration-red-500/30 truncate">
                ₹{mrpVal.toLocaleString('en-IN')}
              </span>
            )}
          </div>
          
          {onAddToCart ? (
            <button
              id={`view-details-btn-${product.id}`}
              disabled={product.inStock === false}
              onClick={(e) => {
                e.stopPropagation();
                if (product.inStock !== false) {
                  onAddToCart(product, e);
                }
              }}
              className={`px-1.5 py-1 sm:px-2.5 sm:py-1.5 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider border transition-all duration-300 flex items-center justify-center gap-0.5 sm:gap-1 rounded-none cursor-pointer shrink-0 ${
                product.inStock !== false
                  ? 'bg-[#ff0052] border-[#ff0052] text-white hover:bg-stone-900 hover:border-stone-900'
                  : 'bg-stone-50 border-stone-200 text-stone-400 cursor-not-allowed'
              }`}
            >
              <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
              <span className="hidden sm:inline">
                {product.inStock !== false ? 'Add to Cart' : 'Out of Stock'}
              </span>
              <span className="inline sm:hidden">
                {product.inStock !== false ? 'Add' : 'Out'}
              </span>
            </button>
          ) : (
            <button
              id={`view-details-btn-${product.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(product);
              }}
              className="text-[9px] sm:text-[10px] tracking-wider text-[var(--theme-accent)] hover:text-[var(--theme-text-primary)] uppercase font-bold transition-colors duration-300 flex items-center gap-0.5 cursor-pointer shrink-0"
            >
              Details 
              <span className="transform translate-x-0 group-hover:translate-x-0.5 transition-transform duration-300">→</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
