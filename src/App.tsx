import {useState, useEffect} from 'react';
import Navbar from './components/Navbar.tsx';
import ProductCatalog from './components/ProductCatalog.tsx';
import AdminPortal from './components/AdminPortal.tsx';
import {Product} from './components/ProductCard.tsx';
import {Heart} from 'lucide-react';
import {subscribeToProducts, dbAddProduct, dbUpdateProduct, dbDeleteProduct, SettingsConfig, subscribeToBanners, DEFAULT_SETTINGS} from './firebaseService.ts';

export default function App() {
  const [currentView, setView] = useState<'catalog' | 'admin'>('catalog');
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [settings, setSettings] = useState<SettingsConfig>(DEFAULT_SETTINGS);

  // Set up real-time connection and active synchronization subscription
  useEffect(() => {
    const unsubscribe = subscribeToProducts((prodList) => {
      setProducts(prodList || []);
      setIsLoading(false);
    }, (error) => {
      console.error('Real-time sync error:', error);
      setIsLoading(false);
    });

    const unsubscribeBanners = subscribeToBanners((bannerSettings) => {
      setSettings(bannerSettings);
    }, (error) => {
      console.error('Banner sync error:', error);
    });

    return () => {
      unsubscribe?.();
      unsubscribeBanners?.();
    };
  }, []);

  // CRUD handlers calling Firebase Firestore
  const handleAddProduct = async (newProduct: Omit<Product, 'id'>) => {
    await dbAddProduct(newProduct);
  };

  const handleUpdateProduct = async (updatedProduct: Product) => {
    await dbUpdateProduct(updatedProduct);
  };

  const handleDeleteProduct = async (productId: string | number) => {
    await dbDeleteProduct(productId);
  };

  // Helper scroll down handler
  const handleScrollToCatalog = () => {
    setView('catalog');
    setTimeout(() => {
      const catalogEl = document.getElementById('catalog-section');
      if (catalogEl) {
        catalogEl.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <div className="bg-[var(--theme-bg)] min-h-screen text-[var(--theme-text-primary)] selection:bg-[var(--theme-accent-glow)] selection:text-[var(--theme-accent)]">
      {/* Premium Top Navigation header */}
      <Navbar 
        currentView={currentView}
        setView={setView}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        onNavigateToCatalog={handleScrollToCatalog}
      />

      {/* Main rendering area */}
      {currentView === 'catalog' ? (
        /* Public interactive catalog lists */
        <ProductCatalog products={products} isLoading={isLoading} settings={settings} />
      ) : (
        /* Administration Guarded Screen space */
        <AdminPortal 
          products={products}
          onAddProduct={handleAddProduct}
          onUpdateProduct={handleUpdateProduct}
          onDeleteProduct={handleDeleteProduct}
          settings={settings}
        />
      )}

      {/* Shared Premium footer section */}
      <footer id="riya-footer" className="bg-[#FAF9F5] py-8 border-t border-[var(--theme-border)] text-center">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col items-center gap-4">
          <span className="text-sm font-bold uppercase tracking-[0.3em] text-[var(--theme-text-primary)]">
            Riya <span className="font-serif italic text-[var(--theme-accent)]">Cosmetics</span>
          </span>
          <p className="text-xs text-[var(--theme-text-secondary)] max-w-lg font-medium leading-relaxed">
            Designed for retail indexing only. Direct purchases are not hosted here. Authenticated luxury styling solutions are available through salon counters.
          </p>
          <div className="border-t border-[var(--theme-border)] mt-4 pt-4 w-full flex flex-col md:flex-row items-center justify-between text-[10px] text-[var(--theme-text-muted)] font-mono tracking-widest uppercase">
            <span>© 2026 RIYA COSMETICS INC. ALL RIGHTS RESERVED.</span>
            <span className="flex items-center gap-1.5 mt-2 md:mt-0">
              Made with <Heart className="w-3 h-3 text-[var(--theme-accent)] animate-pulse" /> for Elegance
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
