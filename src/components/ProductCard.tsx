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
}

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
}

export default function ProductCard({product, onViewDetails}: ProductCardProps) {
  const mrpVal = product.mrp || product.priceInINR || 0;
  const spVal = product.sp || product.priceInINR || 0;
  const discountPercent = (mrpVal > 0 && mrpVal > spVal) ? Math.round(((mrpVal - spVal) / mrpVal) * 100) : 0;
  
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div 
      id={`product-card-${product.id}`}
      onClick={() => onViewDetails(product)}
      className="group relative bg-white border border-[var(--theme-border)] rounded-none overflow-hidden transition-all duration-500 hover:border-[var(--theme-accent)] flex flex-col justify-between shadow-xs cursor-pointer"
    >
      {/* Product Image Section */}
      <div className="relative overflow-hidden aspect-[4/3] bg-stone-50 flex items-center justify-center p-2 border-b border-[var(--theme-border)]/50">
        <img 
          src={product.image} 
          alt={product.name}
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-contain transition-all duration-1000 ease-out group-hover:scale-105 ${
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
        {/* Dynamic Discount Sticker Stamp */}
        {discountPercent > 0 && (
          <div className="absolute top-1 left-1 bg-red-600 text-white text-[8px] sm:text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 shadow-md z-10 animate-pulse">
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

      {/* Content Section */}
      <div className="p-2 sm:p-2.5 flex flex-col flex-grow justify-between bg-white text-left">
        <div className="space-y-0.5">
          {/* Title */}
          <h3 className="text-xs sm:text-[13px] font-semibold text-[var(--theme-text-primary)] tracking-wide group-hover:text-[var(--theme-accent)] transition-colors duration-300 line-clamp-2 min-h-[2rem] leading-tight">
            {product.name}
          </h3>
        </div>

        {/* Pricing & Primary Action */}
        <div className="mt-1.5 pt-1.5 border-t border-[var(--theme-border)]/60 flex flex-wrap items-center justify-between gap-1">
          <div className="flex flex-col items-start leading-none">
            {discountPercent > 0 && (
              <span className="text-[8px] sm:text-[9px] text-[var(--theme-text-muted)] line-through decoration-red-500/40 mb-0.5">
                ₹{mrpVal.toLocaleString('en-IN')}
              </span>
            )}
            <span className="text-xs sm:text-[13px] font-extrabold text-[var(--theme-text-primary)] tracking-wide">
              ₹{spVal.toLocaleString('en-IN')}
            </span>
          </div>
          <button
            id={`view-details-btn-${product.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(product);
            }}
            className="text-[9px] sm:text-[10px] tracking-wider text-[var(--theme-accent)] hover:text-[var(--theme-text-primary)] uppercase font-bold transition-colors duration-300 flex items-center gap-0.5 cursor-pointer"
          >
            Details 
            <span className="transform translate-x-0 group-hover:translate-x-0.5 transition-transform duration-300">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
