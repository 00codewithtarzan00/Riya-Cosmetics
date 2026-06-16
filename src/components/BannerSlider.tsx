import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { BannerConfig } from '../firebaseService';

interface BannerSliderProps {
  banner: BannerConfig;
  title?: string;
}

export default function BannerSlider({ banner, title = 'Banner' }: BannerSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto-slide effect for carousels with multiple items
  useEffect(() => {
    if (
      banner.type === 'None' || 
      banner.type === 'Text' || 
      !banner.urls || 
      banner.urls.length <= 1
    ) {
      return;
    }
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % banner.urls.length);
    }, 5000); // 5 seconds rotation

    return () => clearInterval(timer);
  }, [banner]);

  if (banner.type === 'None') {
    return null;
  }

  const hasMultiple = (banner.type === 'Image' || banner.type === 'Video') && banner.urls && banner.urls.length > 1;
  const currentUrl = (banner.urls && banner.urls.length > 0) ? banner.urls[activeIndex] : '';

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!banner.urls || banner.urls.length === 0) return;
    setActiveIndex((prev) => (prev - 1 + banner.urls.length) % banner.urls.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!banner.urls || banner.urls.length === 0) return;
    setActiveIndex((prev) => (prev + 1) % banner.urls.length);
  };

  // Map database sizes (xs to 3xl) to responsive Tailwind text classes
  const sizeClasses: Record<string, string> = {
    'xs': 'text-[11px] sm:text-xs tracking-widest uppercase font-mono font-medium',
    'sm': 'text-xs sm:text-sm tracking-wider uppercase font-medium',
    'md': 'text-sm sm:text-base tracking-normal font-sans font-medium',
    'lg': 'text-base sm:text-lg md:text-xl font-light tracking-wide',
    'xl': 'text-lg sm:text-xl md:text-2xl font-light uppercase tracking-wider',
    '2xl': 'text-xl sm:text-2xl md:text-3xl font-serif italic tracking-wide',
    '3xl': 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extralight tracking-widest uppercase'
  };

  const textClass = sizeClasses[banner.textSize] || sizeClasses['2xl'];

  return (
    <div 
      id={`home-banner-slider-${title.toLowerCase().replace(' ', '-')}`}
      className="relative w-full overflow-hidden min-h-[130px] sm:min-h-[180px] md:min-h-[240px] h-[130px] sm:h-[180px] md:h-[260px] lg:h-[340px] bg-neutral-900 flex items-center justify-center group select-none shadow-[inset_0_-2px_8px_rgba(0,0,0,0.1)]"
    >
      {/* Background Visual Rendering */}
      {banner.type === 'Image' && currentUrl ? (
        <img 
          src={currentUrl} 
          alt={`${title} Slide ${activeIndex + 1}`} 
          className="w-full h-full object-cover object-center transition-all duration-700 ease-in-out scale-100 hover:scale-102"
          referrerPolicy="no-referrer"
        />
      ) : banner.type === 'Video' && currentUrl ? (
        <video 
          key={currentUrl} // Key forces video source change recreate and play
          src={currentUrl}
          autoPlay 
          loop 
          muted 
          playsInline 
          className="w-full h-full object-cover transition-opacity duration-500 ease-in-out"
        />
      ) : (
        /* Text only Banner background: Luxury cosmetics gradient */
        <div className="absolute inset-0 bg-gradient-to-tr from-[#1c1917] via-[#2d2521] to-[#141211] w-full h-full" />
      )}

      {/* Semi-transparent black gradient overlay for crisp high-contrast text rendering */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none" />

      {/* Decorative label indicating active premium zone */}
      <div className="absolute top-4 left-6 z-10 bg-white/10 backdrop-blur-md px-3 py-1 text-[8px] sm:text-[9px] font-mono tracking-widest text-[#e4e1db] uppercase border border-white/10 rounded-xs select-none">
        RIYA {title}
      </div>

      {/* Absolute text overlay at the bottom */}
      {banner.text && (
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8 z-10 pointer-events-none text-center sm:text-left">
          <div className="max-w-7xl mx-auto flex flex-col justify-end h-full">
            <h3 
              className={`${textClass} transition-all duration-300 transform translate-y-0 text-shadow-sm font-sans`}
              style={{ color: banner.textColor }}
            >
              {banner.text}
            </h3>
          </div>
        </div>
      )}

      {/* Left/Right Carousel slide toggles */}
      {hasMultiple && (
        <>
          <button 
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 bg-black/40 hover:bg-black/80 text-white rounded-none border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 cursor-pointer text-xs"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button 
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 bg-black/40 hover:bg-black/80 text-white rounded-none border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 cursor-pointer text-xs"
            aria-label="Next slide"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Dots Indicator dashboard */}
          <div className="absolute bottom-4 right-6 z-20 flex gap-2">
            {banner.urls.map((_, idx) => (
              <button 
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIndex(idx);
                }}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  activeIndex === idx ? 'bg-[var(--theme-accent)] w-4' : 'bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
