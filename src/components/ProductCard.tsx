import {Eye} from 'lucide-react';

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

  return (
    <div 
      id={`product-card-${product.id}`}
      onClick={() => onViewDetails(product)}
      className="group relative bg-white border border-[var(--theme-border)] rounded-none overflow-hidden transition-all duration-500 hover:border-[var(--theme-accent)] flex flex-col justify-between shadow-xs cursor-pointer"
    >
      {/* Product Image Section */}
      <div className="relative overflow-hidden aspect-[4/5] bg-[var(--theme-bg)]">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />
        {/* Dynamic Discount Sticker Stamp */}
        {discountPercent > 0 && (
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-red-600 text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 sm:px-2.5 sm:py-1 shadow-md z-10 animate-pulse">
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
            className="flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-white font-medium text-xs tracking-wider uppercase transition-all duration-300 hover:bg-[var(--theme-accent)] hover:text-white cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            Quick View
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-3 sm:p-5 flex flex-col flex-grow justify-between">
        <div className="space-y-1 sm:space-y-2">
          {/* Category */}
          <span className="text-[9px] sm:text-[10px] tracking-[0.18em] sm:tracking-[0.25em] text-[var(--theme-accent)] uppercase font-bold">
            {product.category}
          </span>
          {/* Title */}
          <h3 className="text-xs sm:text-sm font-semibold text-[var(--theme-text-primary)] tracking-wide group-hover:text-[var(--theme-accent)] transition-colors duration-300 line-clamp-2">
            {product.name}
          </h3>
          {/* Limit description and keep it compact */}
          <p className="text-[11px] sm:text-xs text-[var(--theme-text-secondary)] font-light line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Pricing & Primary Action */}
        <div className="mt-3 sm:mt-5 pt-3 sm:pt-4 border-t border-[var(--theme-border)] flex flex-wrap items-center justify-between gap-1.5">
          <div className="flex flex-col items-start leading-none gap-0.5">
            {discountPercent > 0 && (
              <span className="text-[10px] sm:text-xs text-[var(--theme-text-muted)] line-through decoration-red-500/40">
                ₹{mrpVal.toLocaleString('en-IN')}
              </span>
            )}
            <span className="text-sm sm:text-base font-bold text-[var(--theme-text-primary)] tracking-wide">
              ₹{spVal.toLocaleString('en-IN')}
            </span>
          </div>
          <button
            id={`view-details-btn-${product.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(product);
            }}
            className="text-[10px] sm:text-xs tracking-wider sm:tracking-widest text-[var(--theme-accent)] hover:text-[var(--theme-text-primary)] uppercase font-bold transition-colors duration-300 flex items-center gap-0.5 sm:gap-1 cursor-pointer"
          >
            Details 
            <span className="transform translate-x-0 group-hover:translate-x-1 transition-transform duration-300">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
