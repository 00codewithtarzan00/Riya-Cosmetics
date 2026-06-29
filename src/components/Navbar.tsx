import {Compass, Shield, ArrowLeft, Layers, ShoppingBag} from 'lucide-react';

interface NavbarProps {
  currentView: 'catalog' | 'admin' | 'invoice';
  setView: (view: 'catalog' | 'admin' | 'invoice') => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  onNavigateToCatalog: () => void;
  cartCount?: number;
  onOpenCart?: () => void;
}

export default function Navbar({
  currentView,
  setView,
  selectedCategory,
  setSelectedCategory,
  onNavigateToCatalog,
  cartCount = 0,
  onOpenCart,
}: NavbarProps) {

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white/90 border-b border-[var(--theme-border)] backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
        
        {/* Brand Identity / Logo */}
        <button 
          id="navbar-logo"
          onClick={() => {
            setView('catalog');
            setSelectedCategory('All');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-1.5 xs:gap-2.5 cursor-pointer outline-none text-left group animate-fade-in max-w-[65%] sm:max-w-none"
        >
          <div className="w-[30px] h-[30px] rounded-full overflow-hidden border border-stone-300 bg-white flex items-center justify-center shrink-0">
            <img 
              src="https://lh3.googleusercontent.com/d/12xYSkAXMKVlTokEcoAtfPifcmc9VzXmu=s400" 
              alt="Riya Cosmetics" 
              className="w-[18px] h-[18px] object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-medium text-[var(--theme-text-primary)] uppercase tracking-[0.1em] xs:tracking-[0.2em] md:tracking-[0.25em] truncate">
            Riya <span className="font-serif italic text-[var(--theme-accent)] font-light">Cosmetics</span>
          </span>
        </button>

        {/* Action Button: Admin Portal Toggle */}
        <div className="flex items-center gap-3 sm:gap-4">
          {currentView === 'catalog' ? (
            <button
              id="admin-portal-open-btn"
              onClick={() => setView('admin')}
              className="group flex items-center justify-center p-3 bg-[var(--theme-bg)] border border-[var(--theme-border)] text-[var(--theme-text-primary)] hover:border-[var(--theme-accent)] transition-all duration-300 cursor-pointer"
              title="Admin Portal"
            >
              <Shield className="w-4 h-4 text-[var(--theme-accent)] transition-transform duration-300 group-hover:scale-110" />
            </button>
          ) : (
            <button
              id="public-catalog-return-btn"
              onClick={() => setView('catalog')}
              className="group flex items-center justify-center p-3 bg-[var(--theme-accent)] hover:bg-[var(--theme-accent-hover)] text-white transition-all duration-300 cursor-pointer"
              title="Return to Catalog"
            >
              <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
            </button>
          )}
        </div>

      </div>
    </nav>
  );
}
