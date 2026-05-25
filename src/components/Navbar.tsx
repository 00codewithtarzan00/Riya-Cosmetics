import {Compass, Shield, ArrowLeft, Layers} from 'lucide-react';

interface NavbarProps {
  currentView: 'catalog' | 'admin';
  setView: (view: 'catalog' | 'admin') => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  onNavigateToCatalog: () => void;
}

export default function Navbar({
  currentView,
  setView,
  selectedCategory,
  setSelectedCategory,
  onNavigateToCatalog,
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
          <div className="w-5 h-5 md:w-6 md:h-6 rounded-full overflow-hidden border border-stone-300 bg-white flex items-center justify-center shrink-0">
            <img 
              src="https://lh3.googleusercontent.com/d/12xYSkAXMKVlTokEcoAtfPifcmc9VzXmu=s400" 
              alt="Riya Cosmetics" 
              className="w-full h-full object-cover rounded-full"
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="text-base xs:text-lg sm:text-xl md:text-2xl font-light text-[var(--theme-text-primary)] uppercase tracking-[0.1em] xs:tracking-[0.2em] md:tracking-[0.25em] truncate">
            Riya <span className="font-serif italic text-[var(--theme-accent)]">Cosmetics</span>
          </span>
        </button>

        {/* Action Button: Admin Portal Toggle */}
        <div className="flex items-center gap-4">
          {currentView === 'catalog' ? (
            <button
              id="admin-portal-open-btn"
              onClick={() => setView('admin')}
              className="group flex items-center gap-2 px-4 py-2 bg-[var(--theme-bg)] border border-[var(--theme-border)] text-[var(--theme-text-primary)] text-xs tracking-wider uppercase font-medium hover:border-[var(--theme-accent)] transition-all duration-300 cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5 text-[var(--theme-accent)] transition-transform duration-300 group-hover:scale-110" />
              Admin Portal
            </button>
          ) : (
            <button
              id="public-catalog-return-btn"
              onClick={() => setView('catalog')}
              className="group flex items-center gap-2 px-4 py-2 bg-[var(--theme-accent)] hover:bg-[var(--theme-accent-hover)] text-white text-xs tracking-wider uppercase font-bold transition-all duration-300 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-300 group-hover:-translate-x-1" />
              Return To Catalog
            </button>
          )}
        </div>

      </div>
    </nav>
  );
}
