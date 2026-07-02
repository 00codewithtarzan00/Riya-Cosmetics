import {Compass, Shield, ArrowLeft, Layers, ShoppingBag, Heart} from 'lucide-react';

interface NavbarProps {
  currentView: 'catalog' | 'admin' | 'invoice';
  setView: (view: 'catalog' | 'admin' | 'invoice') => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  onNavigateToCatalog: () => void;
  cartCount?: number;
  onOpenCart?: () => void;
  user?: any;
  onLogin?: () => void;
  onLogout?: () => void;
  onOpenMyOrders?: () => void;
  wishlistCount?: number;
}

export default function Navbar({
  currentView,
  setView,
  selectedCategory,
  setSelectedCategory,
  onNavigateToCatalog,
  cartCount = 0,
  onOpenCart,
  user,
  onLogin,
  onLogout,
  onOpenMyOrders,
  wishlistCount = 0,
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

        {/* Action Button: Return to Catalog & Customer Auth Status */}
        <div className="flex items-center gap-2 xs:gap-3 md:gap-4 shrink-0">
          
          {/* My Favorites Button */}
          {currentView === 'catalog' && (
            <button
              id="navbar-favorites-btn"
              onClick={() => {
                setSelectedCategory('Favorites');
                onNavigateToCatalog();
              }}
              className={`flex items-center gap-1.5 px-2 py-1.5 sm:px-3 sm:py-2 border transition-all duration-300 text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded-none cursor-pointer ${
                selectedCategory === 'Favorites'
                  ? 'bg-rose-50 border-[#ff0052] text-[#ff0052]'
                  : 'bg-white border-stone-200 hover:border-[#ff0052] text-stone-700 hover:text-[#ff0052]'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${selectedCategory === 'Favorites' ? 'fill-[#ff0052] text-[#ff0052]' : 'text-stone-500 hover:text-[#ff0052]'}`} />
              <span className="hidden md:inline">My Favorites</span>
              {wishlistCount > 0 && (
                <span className={`font-mono text-[9px] sm:text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${
                  selectedCategory === 'Favorites' ? 'bg-[#ff0052] text-white' : 'bg-stone-100 text-stone-800'
                }`}>
                  {wishlistCount}
                </span>
              )}
            </button>
          )}

          {/* User Auth Info or Login button */}
          {currentView === 'catalog' && (
            user ? (
              <div className="flex items-center gap-2 sm:gap-3 animate-fade-in">
                {/* Unified "My Orders" button styled exactly like Google login button */}
                {onOpenMyOrders && (
                  <button
                    id="navbar-my-orders-btn"
                    onClick={onOpenMyOrders}
                    className="flex items-center gap-2 sm:gap-2.5 px-2.5 sm:px-4 py-2 bg-[#ff0052] hover:bg-[#ff0052]/90 text-white hover:text-white text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all duration-300 rounded-none cursor-pointer border border-[#ff0052]"
                  >
                    <div className="w-[18px] h-[18px] rounded-full overflow-hidden border border-white/20 bg-white flex items-center justify-center shrink-0">
                      {user.photoURL ? (
                        <img 
                          src={user.photoURL} 
                          alt={user.displayName || 'User'} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="text-[10px] font-extrabold text-stone-950">
                          {(user.displayName || user.email || 'U').charAt(0)}
                        </span>
                      )}
                    </div>
                    <span>My Orders</span>
                  </button>
                )}

                {/* Logout option next to it */}
                {onLogout && (
                  <button
                    id="navbar-google-logout-btn"
                    onClick={onLogout}
                    className="text-[10px] text-stone-400 hover:text-red-500 font-bold uppercase tracking-wider transition-all cursor-pointer px-1 py-2"
                    title="Logout"
                  >
                    Logout
                  </button>
                )}
              </div>
            ) : (
              onLogin && (
                <button
                  id="navbar-google-login-btn"
                  onClick={onLogin}
                  className="flex items-center gap-2 sm:gap-2.5 px-2.5 sm:px-4 py-2 bg-[#ff0052] hover:bg-[#ff0052]/90 text-white hover:text-white text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all duration-300 rounded-none cursor-pointer border border-[#ff0052]"
                >
                  <div className="w-[18px] h-[18px] bg-white rounded-full flex items-center justify-center shrink-0">
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" 
                      alt="Google" 
                      className="w-[11px] h-[11px] object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <span className="hidden sm:inline">Login with Google</span>
                  <span className="inline sm:hidden">Login</span>
                </button>
              )
            )
          )}

          {currentView === 'admin' && (
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
