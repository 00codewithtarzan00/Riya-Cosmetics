import {useState, useEffect} from 'react';
import Navbar from './components/Navbar.tsx';
import ProductCatalog from './components/ProductCatalog.tsx';
import AdminPortal from './components/AdminPortal.tsx';
import InvoicePage from './components/InvoicePage.tsx';
import {Product} from './components/ProductCard.tsx';
import {Heart} from 'lucide-react';
import {subscribeToProducts, dbAddProduct, dbUpdateProduct, dbDeleteProduct, SettingsConfig, subscribeToBanners, DEFAULT_SETTINGS} from './firebaseService.ts';

export default function App() {
  const [currentView, setView] = useState<'catalog' | 'admin' | 'invoice'>('catalog');
  const [invoiceOrderId, setInvoiceOrderId] = useState<string>('');
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [settings, setSettings] = useState<SettingsConfig>(DEFAULT_SETTINGS);

  // Cart state initialized from localStorage
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>(() => {
    try {
      const saved = localStorage.getItem('riya_cosmetics_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Track if cart should slide open initially on catalog load
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Synchronize cart with localStorage
  useEffect(() => {
    localStorage.setItem('riya_cosmetics_cart', JSON.stringify(cart));
  }, [cart]);

  // Scroll to the top of the page whenever the view changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentView]);

  // Setup hash-routing listener for invoices and views
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/invoice/')) {
        const orderId = hash.replace('#/invoice/', '');
        setInvoiceOrderId(orderId);
        setView('invoice');
      } else if (hash === '#/admin') {
        setView('admin');
      } else {
        setView('catalog');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

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

  // Cart action helpers
  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    // Open cart drawer immediately for intuitive visual feedback
    setIsCartOpen(true);
  };

  const handleUpdateCartQuantity = (productId: string | number, quantity: number) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(item => item.product.id !== productId));
    } else {
      setCart(prev => prev.map(item => 
        item.product.id === productId ? { ...item, quantity } : item
      ));
    }
  };

  const handleRemoveFromCart = (productId: string | number) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

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
    window.location.hash = '';
    setTimeout(() => {
      const catalogEl = document.getElementById('catalog-section');
      if (catalogEl) {
        catalogEl.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleBackToShop = () => {
    setView('catalog');
    window.location.hash = '';
  };

  // Calculate cart badge count
  const cartCount = cart.reduce((acc, curr) => acc + curr.quantity, 0);

  return (
    <div className="bg-[var(--theme-bg)] min-h-screen text-[var(--theme-text-primary)] selection:bg-[var(--theme-accent-glow)] selection:text-[var(--theme-accent)]">
      {/* Premium Top Navigation header */}
      <Navbar 
        currentView={currentView}
        setView={(v) => {
          setView(v);
          if (v === 'admin') window.location.hash = '#/admin';
          if (v === 'catalog') window.location.hash = '';
        }}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        onNavigateToCatalog={handleScrollToCatalog}
        cartCount={cartCount}
        onOpenCart={() => {
          setView('catalog');
          window.location.hash = '';
          setIsCartOpen(true);
        }}
      />

      {/* Main rendering area */}
      {currentView === 'catalog' ? (
        /* Public interactive catalog lists */
        <ProductCatalog 
          products={products} 
          isLoading={isLoading} 
          settings={settings} 
          cart={cart}
          onAddToCart={handleAddToCart}
          onUpdateCartQuantity={handleUpdateCartQuantity}
          onRemoveFromCart={handleRemoveFromCart}
          onClearCart={handleClearCart}
          isCartOpen={isCartOpen}
          setIsCartOpen={setIsCartOpen}
        />
      ) : currentView === 'invoice' ? (
        /* Digital Printable Invoice and Billing screen */
        <InvoicePage 
          orderId={invoiceOrderId} 
          onBackToShop={handleBackToShop} 
        />
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
            Designed for secure automated cosmetics and beauty products billing operations. Customer invoice summaries are synced in real-time.
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
