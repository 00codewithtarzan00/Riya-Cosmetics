import {useState, useEffect} from 'react';
import Navbar from './components/Navbar.tsx';
import ProductCatalog from './components/ProductCatalog.tsx';
import AdminPortal from './components/AdminPortal.tsx';
import {Product} from './components/ProductCard.tsx';
import {Sparkles, ShieldCheck, Heart} from 'lucide-react';


const INITIAL_6_COSMETICS: Product[] = [
  {
    id: 1,
    name: 'Riya Velvet Finish Liquid Lip Color (Rose Absolute)',
    category: 'Makeup',
    priceInINR: 1250,
    mrp: 1499,
    sp: 1250,
    description: 'A luxurious liquid lipstick delivering weightless, full-coverage matte intensity that keeps lips hydrated for up to 12 hours.',
    image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 2,
    name: 'Riya Restorative Marine Pure Hydration Serum',
    category: 'Skin Care',
    priceInINR: 2100,
    mrp: 2499,
    sp: 2100,
    description: 'Enriched with premium low-molecular hyaluronic moisture factors and brown sea-kelp botanicals to plump fatigue and boost elastic health.',
    image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 3,
    name: 'Riya Nourishing Argan Infusion Hair Serum',
    category: 'Hair Care',
    priceInINR: 1450,
    mrp: 1999,
    sp: 1450,
    description: 'Formulated with cold-pressed Moroccan argan oil and silk protein extracts, this lightweight elixir restores dry, damaged strands for supreme shine.',
    image: 'https://images.unsplash.com/photo-1527799822367-a05eb5747737?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 4,
    name: 'Riya Sandalwood & Shea Butter Body Lotion',
    category: 'Body Care',
    priceInINR: 950,
    mrp: 1199,
    sp: 950,
    description: 'A creamy herbal body moisturizer containing premium sandalwood oil and raw African shea butter to replenish parched skin cells.',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 5,
    name: 'Riya Seamless Comfort Satin Lounge Underwear',
    category: 'Undergarments',
    priceInINR: 1850,
    mrp: 2200,
    sp: 1850,
    description: 'Crafted from breathable, hypoallergenic ultra-fine micro-satin with supportive cup liners, ensuring tagless luxury and a flawless fit under any outfit.',
    image: 'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 6,
    name: 'Riya Gentle Calendula Tear-Free Baby Bath Wash',
    category: 'Baby Care',
    priceInINR: 750,
    mrp: 899,
    sp: 750,
    description: 'Dermatologist-tested tear-free wash infused with organic calendula flower extract and chamomile to gently soothe baby’s delicate hair and body.',
    image: 'https://images.unsplash.com/photo-1515488042361-404e9250afef?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 7,
    name: 'Riya Kundan Royal Filigree Kada Bangles',
    category: 'Bangles & Ornaments',
    priceInINR: 4500,
    mrp: 5999,
    sp: 4500,
    description: 'An exquisite pair of hand-crafted gold-plated Kada bangles set with premium uncut Kundan gemstones and detailed floral filigree work.',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=600'
  }
];

export default function App() {
  const [currentView, setView] = useState<'catalog' | 'admin'>('catalog');
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Load products from localStorage or initialize with 7 default mockups
  useEffect(() => {
    const cachedProducts = localStorage.getItem('riya_products_catalog_v3');
    if (cachedProducts) {
      try {
        setProducts(JSON.parse(cachedProducts));
      } catch (err) {
        console.error('Failed to parse cached cosmetics, resetting.', err);
        setProducts(INITIAL_6_COSMETICS);
        localStorage.setItem('riya_products_catalog_v3', JSON.stringify(INITIAL_6_COSMETICS));
      }
    } else {
      setProducts(INITIAL_6_COSMETICS);
      localStorage.setItem('riya_products_catalog_v3', JSON.stringify(INITIAL_6_COSMETICS));
    }
  }, []);

  // Save changes helper
  const saveProductsToStorage = (updatedList: Product[]) => {
    setProducts(updatedList);
    localStorage.setItem('riya_products_catalog_v3', JSON.stringify(updatedList));
  };

  // CRUD handlers
  const handleAddProduct = (newProduct: Omit<Product, 'id'>) => {
    const productWithId: Product = {
      ...newProduct,
      id: Date.now() // Unique incremental lookup
    };
    const updated = [productWithId, ...products];
    saveProductsToStorage(updated);
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    const updated = products.map((p) => (p.id === updatedProduct.id ? updatedProduct : p));
    saveProductsToStorage(updated);
  };

  const handleDeleteProduct = (productId: string | number) => {
    const updated = products.filter((p) => p.id.toString() !== productId.toString());
    saveProductsToStorage(updated);
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
        <ProductCatalog products={products} />
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
          <span className="text-sm font-light uppercase tracking-[0.3em] text-[var(--theme-text-primary)]">
            Riya <span className="font-serif italic text-[var(--theme-accent)]">Cosmetics</span>
          </span>
          <p className="text-xs text-[var(--theme-text-secondary)] max-w-lg font-light leading-relaxed">
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
