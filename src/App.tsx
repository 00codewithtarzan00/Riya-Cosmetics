import {useState, useEffect} from 'react';
import Navbar from './components/Navbar.tsx';
import ProductCatalog from './components/ProductCatalog.tsx';
import AdminPortal from './components/AdminPortal.tsx';
import {Product} from './components/ProductCard.tsx';
import {Heart} from 'lucide-react';
import { subscribeToProducts, dbAddProduct, dbUpdateProduct, dbDeleteProduct } from './firebaseService.ts';

const FALLBACK_PRODUCTS: Product[] = [
  {
    id: 'offline-pink-lipstick',
    name: 'Matte Rose Velvet Lipstick',
    category: 'Makeup',
    priceInINR: 699,
    mrp: 999,
    sp: 699,
    description: 'A luxurious deep pink liquid matte lipstick that provides a rich velvet finish and long-lasting hydration control. Curated for premium professional styling.',
    image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'offline-glow-serum',
    name: 'Vitamin-C Radiant Glow Serum',
    category: 'Skin Care',
    priceInINR: 899,
    mrp: 1299,
    sp: 899,
    description: 'Enriched with natural Kakadu plum extracts, this lightweight active face serum brightens skin complexion and locks in glowing moisture.',
    image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'offline-onion-oil',
    name: 'Red Onion Professional Hair Revitalizer',
    category: 'Hair Care',
    priceInINR: 499,
    mrp: 699,
    sp: 499,
    description: 'Infused with Red Onion extracts and nourishing Black Seed oil, this non-sticky tonic revitalizes roots and brings absolute sleek silkiness to your hair.',
    image: 'https://images.unsplash.com/photo-1527799822367-a05eb5747737?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'offline-body-butter',
    name: 'Creamy Shea Butter Intense Body Lotion',
    category: 'Body Care',
    priceInINR: 399,
    mrp: 599,
    sp: 399,
    description: 'Pamper your skin with authentic rich African Shea Butter. Deeply hydrates extremely dry skin during active days, leaving a divine subtle coconut aroma.',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'offline-baby-powder',
    name: 'Gentle Care Natural Baby Powder',
    category: 'Baby Care',
    priceInINR: 249,
    mrp: 349,
    sp: 249,
    description: "Talcum-free ultra-soft formula made with organic cornstarch and therapeutic lavender oil. Protects your baby's delicate skin folds with smooth love.",
    image: 'https://images.unsplash.com/photo-1515488042361-404e9250afef?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'offline-gold-bangles',
    name: 'Kundan Embedded Designer Gold Bangles',
    category: 'Bangles & Ornaments',
    priceInINR: 1899,
    mrp: 2999,
    sp: 1899,
    description: 'Exquisite heavy gold plated bangle set styled with fine Kundan work and premium rubies. Perfect matching ornament for Indian bridal wear and luxury celebrations.',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=600'
  }
];

export default function App() {
  const [currentView, setView] = useState<'catalog' | 'admin'>('catalog');
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Set up real-time connection and active synchronization subscription
  useEffect(() => {
    const unsubscribe = subscribeToProducts((prodList) => {
      if (prodList && prodList.length > 0) {
        setProducts(prodList);
      } else {
        // Fallback if the collection is empty/offline
        setProducts(FALLBACK_PRODUCTS);
      }
      setIsLoading(false);
    }, (error) => {
      console.error('Real-time sync error:', error);
      setProducts(FALLBACK_PRODUCTS);
      setIsLoading(false);
    });

    return () => {
      unsubscribe?.();
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
        <ProductCatalog products={products} isLoading={isLoading} />
      ) : (
        /* Administration Guarded Screen space */
        <AdminPortal 
          products={products}
          onAddProduct={handleAddProduct}
          onUpdateProduct={handleUpdateProduct}
          onDeleteProduct={handleDeleteProduct}
        />
      )}

      {/* Shared Premium footer section */}
      <footer id="riya-footer" className="bg-[#FAF9F5] py-12 border-t border-[var(--theme-border)] text-center">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col items-center gap-6">
          <span className="text-sm font-bold uppercase tracking-[0.3em] text-[var(--theme-text-primary)]">
            Riya <span className="font-serif italic text-[var(--theme-accent)]">Cosmetics</span>
          </span>
          <p className="text-xs text-[var(--theme-text-secondary)] max-w-lg font-medium leading-relaxed">
            Designed for retail indexing only. Direct purchases are not hosted here. Authenticated luxury styling solutions are available through salon counters.
          </p>
          <div className="border-t border-[var(--theme-border)] mt-8 pt-8 w-full flex flex-col md:flex-row items-center justify-between text-[10px] text-[var(--theme-text-muted)] font-mono tracking-widest uppercase">
            <span>© 2026 RIYA COSMETICS INC. ALL RIGHTS RESERVED.</span>
            <span className="flex items-center gap-1.5 mt-4 md:mt-0">
              Made with <Heart className="w-3 h-3 text-[var(--theme-accent)] animate-pulse" /> for Elegance
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
