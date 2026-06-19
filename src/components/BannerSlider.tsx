import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { BannerConfig } from '../firebaseService';

interface BannerSliderProps {
  banner: BannerConfig;
  title?: string;
}

export default function BannerSlider({ banner, title = 'Banner' }: BannerSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number>(0);
  const [touchEndX, setTouchEndX] = useState<number>(0);
  const [naturalAspect, setNaturalAspect] = useState<number | null>(null);

  const firstUrl = (banner.urls && banner.urls.length > 0) ? banner.urls[0] : '';

  // Reset the responsive fluid aspect ratio state whenever the first image/asset URL changes
  useEffect(() => {
    if (banner.aspectRatioNum) {
      setNaturalAspect(banner.aspectRatioNum);
    } else {
      setNaturalAspect(null);
    }
  }, [firstUrl, banner.type, banner.aspectRatioNum]);

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
    const intervalMs = (banner.duration || 5) * 1000;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % banner.urls.length);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [banner.urls, banner.duration, banner.type]);

  if (banner.type === 'None') {
    return null;
  }

  const hasMultiple = (banner.type === 'Image' || banner.type === 'Video') && banner.urls && banner.urls.length > 1;
  const currentUrl = (banner.urls && banner.urls.length > 0) ? banner.urls[activeIndex] : '';

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!banner.urls || banner.urls.length === 0) return;
    setActiveIndex((prev) => (prev - 1 + banner.urls.length) % banner.urls.length);
  };

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!banner.urls || banner.urls.length === 0) return;
    setActiveIndex((prev) => (prev + 1) % banner.urls.length);
  };

  // Touch gestural sweep control managers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!hasMultiple) return;
    setTouchStartX(e.targetTouches[0].clientX);
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!hasMultiple) return;
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!hasMultiple) return;
    const threshold = 50; // minimum touch offset in pixels
    const diff = touchStartX - touchEndX;
    if (diff > threshold) {
      // Swiped finger leftwards -> Next photo
      handleNext();
    } else if (diff < -threshold) {
      // Swiped finger rightwards -> Previous photo
      handlePrev();
    }
  };

  // Dynamically calculate aspect ratios from loaded HTML Image or Video elements
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    if (naturalWidth && naturalHeight && !banner.aspectRatioNum) {
      setNaturalAspect(naturalWidth / naturalHeight);
    }
  };

  const handleVideoLoad = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const { videoWidth, videoHeight } = e.currentTarget;
    if (videoWidth && videoHeight && !banner.aspectRatioNum) {
      setNaturalAspect(videoWidth / videoHeight);
    }
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
  const textTag = banner.textTag || 'h3';
  const alignClass = 
    banner.alignment === 'center' 
      ? 'text-center justify-center items-center' 
      : banner.alignment === 'right' 
        ? 'text-right justify-end items-end' 
        : 'text-left justify-start items-start';

  if (banner.type === 'Text') {
    const isMarquee = !!banner.marqueeEnabled;
    const direction = banner.marqueeDirection || 'rtl';

    const flexAlignClass = 
      banner.alignment === 'center' 
        ? 'justify-center animate-fadeIn' 
        : banner.alignment === 'right' 
          ? 'justify-end animate-fadeIn' 
          : 'justify-start animate-fadeIn';
    
    const textAlignClass = 
      banner.alignment === 'center' 
        ? 'text-center' 
        : banner.alignment === 'right' 
          ? 'text-right' 
          : 'text-left';

    return (
      <div 
        id={`home-banner-text-${title.toLowerCase().replace(' ', '-')}`}
        className={`w-full py-1.5 sm:py-2.5 flex ${isMarquee ? 'w-full overflow-hidden' : flexAlignClass} bg-transparent select-none`}
      >
        {isMarquee && (
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes marquee-rtl-25 {
              0% { transform: translate3d(0, 0, 0); }
              100% { transform: translate3d(-20%, 0, 0); }
            }
            @keyframes marquee-ltr-25 {
              0% { transform: translate3d(-20%, 0, 0); }
              100% { transform: translate3d(0, 0, 0); }
            }
          `}} />
        )}
        <div 
          className={isMarquee
            ? "relative w-full overflow-hidden border border-[var(--theme-border)] shadow-2xs py-3 sm:py-4 flex items-center"
            : `px-6 py-4 sm:px-10 sm:py-6 border border-[var(--theme-border)] shadow-xs w-auto max-w-full ${textAlignClass}`}
          style={{ backgroundColor: banner.bgColor || 'rgba(250, 249, 245, 0.95)' }}
        >
          {isMarquee ? (
            <div 
              className="flex items-center gap-16 whitespace-nowrap"
              style={{
                animation: `marquee-${direction}-25 25s linear infinite`,
                width: 'max-content',
                display: 'flex',
              }}
            >
              {[1, 2, 3, 4, 5].map((idx) => (
                <div key={idx} className="flex items-center gap-16 select-none shrink-0">
                  {React.createElement(
                    textTag,
                    {
                      className: `${textClass} font-sans leading-relaxed tracking-[0.2em] uppercase font-bold`,
                      style: { color: banner.textColor || 'var(--theme-text-primary)' }
                    },
                    banner.text
                  )}
                  <span style={{ color: banner.textColor || 'var(--theme-text-primary)' }} className="text-sm font-bold opacity-40">✦</span>
                </div>
              ))}
            </div>
          ) : (
            React.createElement(
              textTag,
              {
                className: `${textClass} font-sans leading-relaxed tracking-wide font-semibold`,
                style: { color: banner.textColor || 'var(--theme-text-primary)' }
              },
              banner.text
            )
          )}
        </div>
      </div>
    );
  }

  return (
    <div 
      id={`home-banner-slider-${title.toLowerCase().replace(' ', '-')}`}
      className="relative w-full overflow-hidden bg-white group select-none shadow-xs border border-[var(--theme-border)] cursor-grab active:cursor-grabbing"
      style={{ 
        aspectRatio: banner.aspectRatioNum ? `${banner.aspectRatioNum}` : (naturalAspect ? `${naturalAspect}` : '21/9')
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Visual Rendering */}
      {banner.type === 'Image' && banner.urls && banner.urls.length > 0 && (
        <div className="absolute inset-0 w-full h-full overflow-hidden bg-white">
          {banner.urls.map((url, idx) => (
            <img 
              key={url}
              src={url} 
              alt={`${title} Slide ${idx + 1}`} 
              onLoad={idx === 0 ? handleImageLoad : undefined}
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out hover:scale-[1.01] ${
                idx === activeIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
              }`}
              referrerPolicy="no-referrer"
            />
          ))}
        </div>
      )}

      {banner.type === 'Video' && banner.urls && banner.urls.length > 0 && (
        <div className="absolute inset-0 w-full h-full overflow-hidden bg-white">
          {banner.urls.map((url, idx) => (
            <video 
              key={url}
              src={url}
              onLoadedMetadata={idx === 0 ? handleVideoLoad : undefined}
              autoPlay 
              loop 
              muted 
              playsInline 
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out ${
                idx === activeIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            />
          ))}
        </div>
      )}

      {/* Semi-transparent black gradient overlay for crisp high-contrast text rendering ONLY if banner contains text */}
      {banner.text && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none z-5" />
      )}

      {/* Absolute text overlay with custom alignment */}
      {banner.text && (
        <div className={`absolute inset-0 p-4 sm:p-6 md:p-8 lg:p-12 z-10 pointer-events-none flex flex-col ${alignClass}`}>
          <div className="max-w-7xl w-full flex flex-col justify-end h-full">
            <div className={`w-full flex ${banner.alignment === 'center' ? 'justify-center' : banner.alignment === 'right' ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-xl md:max-w-2xl lg:max-w-3xl">
                {React.createElement(
                  textTag,
                  {
                    className: `${textClass} transition-all duration-300 transform translate-y-0 text-shadow-md font-sans font-semibold tracking-wide leading-tight`,
                    style: { color: banner.textColor || '#ffffff' }
                  },
                  banner.text
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Left/Right Carousel slide toggles */}
      {hasMultiple && (
        <>
          <button 
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/80 text-white rounded-none border border-white/10 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 z-20 cursor-pointer text-xs hidden md:block"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/80 text-white rounded-none border border-white/10 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 z-20 cursor-pointer text-xs hidden md:block"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
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
                  activeIndex === idx ? 'bg-[var(--theme-accent)] w-4' : 'bg-stone-300 hover:bg-stone-500'
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
