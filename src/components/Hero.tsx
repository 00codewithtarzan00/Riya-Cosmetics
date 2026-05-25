
interface HeroProps {
  onExploreClick: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function Hero({onExploreClick}: HeroProps) {
  return (
    <div id="hero-section" className="relative h-screen bg-[var(--theme-bg)] flex items-center justify-center overflow-hidden mt-20">
      {/* Background Sophisticated Image Panel with Light Vogue Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=1920" 
          alt="Premium Cosmetics Background" 
          className="w-full h-full object-cover opacity-25 scale-105 pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-[var(--theme-bg)]/80 to-[var(--theme-bg)]"></div>
      </div>

      {/* Editorial Title/Brand Focus */}
      <div className="relative z-10 max-w-4xl px-6 md:px-12 text-center flex flex-col items-center">
        {/* Subtle Brand Slogan */}
        <span className="text-xs md:text-sm tracking-[0.4em] text-[var(--theme-accent)] uppercase font-bold animate-[fadeIn_1.2s_ease-out_forwards]">
          Aesthetics of Elegance
        </span>
        
        {/* Editorial Headline */}
        <h1 className="mt-6 text-4xl md:text-7xl font-light text-[var(--theme-text-primary)] tracking-tight leading-none uppercase">
          Riya <span className="font-serif italic font-light text-[var(--theme-accent)]">Cosmetics</span>
        </h1>
        
        <p className="mt-6 text-sm md:text-lg text-[var(--theme-text-secondary)] font-light max-w-2xl tracking-wide leading-relaxed">
          Discover a curated symphony of luxury aesthetics. Expertly developed price lookup catalog featuring high-pigment lips, flawlessly calibrated face profiles, and nourishing skincare essentials.
        </p>
      </div>

      {/* Decorative vertical lines on margins (Editorial Style) */}
      <div className="hidden lg:block absolute left-12 bottom-12 z-10 text-[var(--theme-text-muted)]">
        <div className="text-[10px] tracking-[0.3em] font-mono [writing-mode:vertical-lr] uppercase">
          ESTABLISHED 2026
        </div>
        <div className="w-[1px] h-12 bg-[var(--theme-border)] mt-4 mx-auto"></div>
      </div>
      <div className="hidden lg:block absolute right-12 bottom-12 z-10 text-[var(--theme-text-muted)]">
        <div className="text-[10px] tracking-[0.3em] font-mono [writing-mode:vertical-lr] uppercase">
          RIYA COSMETICS CO.
        </div>
        <div className="w-[1px] h-12 bg-[var(--theme-border)] mt-4 mx-auto"></div>
      </div>
    </div>
  );
}
