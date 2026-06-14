import {Eye} from 'lucide-react';
import {useState} from 'react';

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
}

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
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

export default function ProductCard({product, onViewDetails}: ProductCardProps) {
  const mrpVal = product.mrp || product.priceInINR || 0;
  const spVal = product.sp || product.priceInINR || 0;
  const discountPercent = (mrpVal > 0 && mrpVal > spVal) ? Math.round(((mrpVal - spVal) / mrpVal) * 100) : 0;
  
  const [imageLoaded, setImageLoaded] = useState(false);

  const getQtyAndSpecs = () => {
    if (product.hasCustomQty && product.qtyVal !== undefined) {
      return formatCustomQuantity(product.qtyVal, product.qtyUnit);
    }
    return '';
  };

  return (
    <div 
      id={`product-card-${product.id}`}
      onClick={() => onViewDetails(product)}
      className="editorial-card fade-in group relative bg-white border border-[var(--theme-border)]/70 rounded-[2px] overflow-hidden transition-all duration-300 hover:border-[var(--theme-accent)] hover:shadow-sm flex flex-col justify-between cursor-pointer"
    >
      {/* Upper Media Section */}
      <div className="relative overflow-hidden aspect-square bg-stone-50 flex items-center justify-center border-b border-[var(--theme-border)]/40">
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
      </div>

      {/* Lower Text & Price Section */}
      <div className="p-3 md:p-3.5 flex flex-col flex-grow justify-between min-h-0 md:min-h-[105px] bg-white text-left font-sans">
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
            <div className="text-[10px] sm:text-xs text-[var(--theme-text-muted)] font-medium whitespace-nowrap mb-1">
              {getQtyAndSpecs()}
            </div>
          )}
        </div>

        {/* Footer Panel (Prices) */}
        <div className="mt-auto pt-1.5 flex items-center justify-between gap-2 border-t border-[var(--theme-border)]/40">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-lg md:text-xl font-bold text-[var(--theme-text-primary)] tracking-tight">
              ₹{spVal.toLocaleString('en-IN')}
            </span>
            {discountPercent > 0 && (
              <span className="text-xs text-[var(--theme-text-muted)] line-through decoration-red-500/30">
                ₹{mrpVal.toLocaleString('en-IN')}
              </span>
            )}
          </div>
          
          <button
            id={`view-details-btn-${product.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(product);
            }}
            className="text-[10px] tracking-wider text-[var(--theme-accent)] hover:text-[var(--theme-text-primary)] uppercase font-bold transition-colors duration-300 flex items-center gap-0.5 cursor-pointer"
          >
            Details 
            <span className="transform translate-x-0 group-hover:translate-x-0.5 transition-transform duration-300">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
