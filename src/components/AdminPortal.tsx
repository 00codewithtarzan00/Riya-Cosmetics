import {useState, useEffect, useMemo} from 'react';
import {Product} from './ProductCard.tsx';
import {
  Lock, Eye, EyeOff, LayoutDashboard, Plus, Pencil, Trash2, 
  Settings, LogOut, Check, Info, Coins, BarChart3, Tag, Package
} from 'lucide-react';

interface AdminPortalProps {
  products: Product[];
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: string | number) => void;
}

export default function AdminPortal({
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
}: AdminPortalProps) {
  // Authentication local states
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  // Form modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Deletion confirmation state
  const [deleteProductInfo, setDeleteProductInfo] = useState<{ id: string | number; name: string } | null>(null);

  // Form Fields State
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Makeup');
  const [formMrp, setFormMrp] = useState('');
  const [formSp, setFormSp] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formError, setFormError] = useState('');

  // Default images presets by category to make testing incredibly pleasant
  const categoryImagePresets: Record<string, string> = {
    'Makeup': 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=600',
    'Skin Care': 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&q=80&w=600',
    'Hair Care': 'https://images.unsplash.com/photo-1527799822367-a05eb5747737?auto=format&fit=crop&q=80&w=600',
    'Body Care': 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=600',
    'Undergarments': 'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&q=80&w=600',
    'Baby Care': 'https://images.unsplash.com/photo-1515488042361-404e9250afef?auto=format&fit=crop&q=80&w=600',
    'Bangles & Ornaments': 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=600',
  };

  // Synchronise sessions through sessionStorage
  useEffect(() => {
    const token = sessionStorage.getItem('riya_admin_auth');
    if (token === 'authenticated') {
      setIsAuthenticated(true);
    }
  }, []);

  // Handle Authentication Password Check
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'adm_raj%7979') {
      sessionStorage.setItem('riya_admin_auth', 'authenticated');
      setIsAuthenticated(true);
      setAuthError('');
      setPassword('');
    } else {
      setAuthError('Incorrect Administration Secret Password.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('riya_admin_auth');
    setIsAuthenticated(false);
  };

  // Compute Metrics dynamically
  const metrics = useMemo(() => {
    const totalCount = products.length;
    
    const averagePrice = totalCount > 0 
      ? Math.round(products.reduce((acc, p) => acc + (p.sp || p.priceInINR || 0), 0) / totalCount) 
      : 0;
      
    const categoriesDistribution = products.reduce((acc: Record<string, number>, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    }, {});

    return { totalCount, averagePrice, categoriesDistribution };
  }, [products]);

  // Handle opening modal for Add or Edit
  const openModal = (product: Product | null = null) => {
    setFormError('');
    if (product) {
      // Editing Mode
      setEditingProduct(product);
      setFormName(product.name);
      setFormCategory(product.category);
      setFormMrp((product.mrp || product.priceInINR || '').toString());
      setFormSp((product.sp || product.priceInINR || '').toString());
      setFormDescription(product.description);
      setFormImage(product.image);
    } else {
      // Create Mode
      setEditingProduct(null);
      setFormName('');
      setFormCategory('Makeup');
      setFormMrp('');
      setFormSp('');
      setFormDescription('');
      setFormImage('');
    }
    setIsModalOpen(true);
  };

  // Handle CRUD Form submission
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Pre-validation
    if (!formName.trim() || !formMrp.trim() || !formSp.trim() || !formDescription.trim()) {
      setFormError('Please fill in all core fields (Name, MRP, Selling Price, and Description).');
      return;
    }

    const mrpNum = parseFloat(formMrp);
    const spNum = parseFloat(formSp);
    if (isNaN(mrpNum) || mrpNum <= 0) {
      setFormError('Please enter a valid MRP higher than ₹0.');
      return;
    }
    if (isNaN(spNum) || spNum <= 0) {
      setFormError('Please enter a valid Selling Price higher than ₹0.');
      return;
    }
    if (spNum > mrpNum) {
      setFormError('Selling Price (SP) cannot be greater than Maximum Retail Price (MRP).');
      return;
    }

    // Auto assign image preset if field is empty
    const imageToSave = formImage.trim() !== '' 
      ? formImage.trim() 
      : (categoryImagePresets[formCategory] || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=600');

    if (editingProduct) {
      // Edit logic
      onUpdateProduct({
        id: editingProduct.id,
        name: formName.trim(),
        category: formCategory,
        priceInINR: spNum, // keep for compatibility
        mrp: mrpNum,
        sp: spNum,
        description: formDescription.trim(),
        image: imageToSave
      });
    } else {
      // Create logic
      onAddProduct({
        name: formName.trim(),
        category: formCategory,
        priceInINR: spNum, // keep for compatibility
        mrp: mrpNum,
        sp: spNum,
        description: formDescription.trim(),
        image: imageToSave
      });
    }

    setIsModalOpen(false);
  };

  // Safe Deletion with custom modal confirmation
  const handleDeleteCheck = (id: string | number, name: string) => {
    setDeleteProductInfo({ id, name });
  };

  // If NOT Authenticated, show sleek password entry
  if (!isAuthenticated) {
    return (
      <div id="admin-login-screen" className="pt-32 pb-24 min-h-screen bg-[var(--theme-bg)] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white border border-[var(--theme-border)] p-8 md:p-10 shadow-lg relative">
          
          {/* Aesthetic Muted Border accent */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-[var(--theme-accent)]"></div>
          
          <div className="text-center mb-8">
            <div className="mx-auto w-12 h-12 bg-[var(--theme-bg)] text-[var(--theme-accent)] flex items-center justify-center rounded-none mb-4 border border-[var(--theme-border)]">
              <Lock className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-light uppercase text-[var(--theme-text-primary)] tracking-widest">
              Secured Admin Portal
            </h2>
            <p className="text-xs text-[var(--theme-text-secondary)] mt-2 font-light">
              Enter administration system key to manage pricing lookbook
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] tracking-widest uppercase font-bold text-[var(--theme-text-muted)] mb-2">
                Secret Access Key
              </label>
              <div className="relative">
                <input
                  id="admin-password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter secret passcode..."
                  className="w-full pl-4 pr-10 py-3 bg-[var(--theme-bg)] border border-[var(--theme-border)] text-sm text-[var(--theme-text-primary)] rounded-none focus:outline-none focus:border-[var(--theme-accent)] tracking-wider transition-colors"
                  required
                />
                <button
                  type="button"
                  id="toggle-password-visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[var(--theme-text-primary)]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {authError && (
              <p className="text-xs text-red-800 font-light bg-red-50 py-2.5 px-3 border-l-2 border-red-500">
                {authError}
              </p>
            )}

            <button
              id="admin-login-submit-btn"
              type="submit"
              className="w-full py-3 bg-[var(--theme-accent)] text-white font-semibold text-xs tracking-[0.2em] uppercase hover:bg-[var(--theme-accent-hover)] transition-all cursor-pointer"
            >
              Sign In
            </button>
          </form>

          {/* Prompt info */}
          <div className="mt-8 pt-6 border-t border-[var(--theme-border)] text-center">
            <p className="text-[11px] text-stone-500 leading-relaxed font-mono">
              Demo bypass password reference:<br/>
              <span className="text-stone-700 bg-stone-100 px-1 py-0.5 rounded-none select-all font-semibold">adm_raj%7979</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Once Authenticated: Show Portal Dashboard
  return (
    <div id="admin-dashboard-screen" className="pt-32 pb-24 bg-[var(--theme-bg)] min-h-screen">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Dashboard Title & Actions Container */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 pb-6 border-b border-[var(--theme-border)] gap-4">
          <div>
            <div className="flex items-center gap-2 text-[var(--theme-accent)] text-[10px] tracking-[0.3em] font-bold uppercase mb-2">
              <LayoutDashboard className="w-4 h-4" />
              Administrative Workspace
            </div>
            <h2 className="text-3xl font-light text-[var(--theme-text-primary)] uppercase tracking-wider">
              Control Panel
            </h2>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {/* New Catalog Product Trigger */}
            <button
              id="admin-add-product-btn"
              onClick={() => openModal(null)}
              className="flex items-center gap-2 px-6 py-3 bg-[var(--theme-accent)] text-white text-xs font-bold tracking-widest uppercase transition-colors hover:bg-[var(--theme-accent-hover)] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add New Formula
            </button>
            {/* Log out */}
            <button
              id="admin-logout-btn"
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-3 bg-white border border-[#ff4e4e]/40 text-[#ff4e4e] hover:bg-[#ff4e4e] hover:text-white text-xs font-medium tracking-wider uppercase transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Dashboard Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Total Product Inventory */}
          <div className="bg-white border border-[var(--theme-border)] p-6 flex items-center justify-between shadow-xs">
            <div className="space-y-1">
              <span className="text-[10px] tracking-widest uppercase font-bold text-[var(--theme-text-muted)]">Inventory Listed</span>
              <p className="text-3xl font-bold text-[var(--theme-text-primary)] tracking-tight">{metrics.totalCount} Products</p>
            </div>
            <div className="p-3.5 bg-[var(--theme-accent-glow)] text-[var(--theme-accent)] border border-[var(--theme-accent)]/20">
              <Package className="w-5 h-5" />
            </div>
          </div>
          {/* Average Catalogue Price */}
          <div className="bg-white border border-[var(--theme-border)] p-6 flex items-center justify-between shadow-xs">
            <div className="space-y-1">
              <span className="text-[10px] tracking-widest uppercase font-bold text-[var(--theme-text-muted)]">Average Unit Value</span>
              <p className="text-3xl font-bold text-[var(--theme-text-primary)] tracking-tight">₹{metrics.averagePrice.toLocaleString('en-IN')}</p>
            </div>
            <div className="p-3.5 bg-[var(--theme-accent-glow)] text-[var(--theme-accent)] border border-[var(--theme-accent)]/20">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          {/* Category Spread */}
          <div className="bg-white border border-[var(--theme-border)] p-6 flex items-center justify-between shadow-xs">
            <div className="space-y-1 w-full mr-2">
              <span className="text-[10px] tracking-widest uppercase font-bold text-[var(--theme-text-muted)]">Category Spread</span>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {Object.entries(metrics.categoriesDistribution).map(([cat, count]) => (
                  <span key={cat} className="text-[9px] bg-[var(--theme-bg)] border border-[var(--theme-border)] text-[var(--theme-accent)] px-2 py-0.5 rounded-none font-bold uppercase tracking-wider">
                    {cat}: {count}
                  </span>
                ))}
                {Object.keys(metrics.categoriesDistribution).length === 0 && (
                  <span className="text-xs text-stone-400 font-light">None set</span>
                )}
              </div>
            </div>
            <div className="p-3.5 bg-[var(--theme-accent-glow)] text-[var(--theme-accent)] border border-[var(--theme-accent)]/20 shrink-0 self-center">
              <BarChart3 className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Catalog Administration Inventory Table */}
        <div className="bg-white border border-[var(--theme-border)] shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[var(--theme-border)] flex items-center justify-between">
            <h3 className="text-md uppercase tracking-widest font-semibold text-[var(--theme-text-primary)]">
              Catalogue Management Matrix
            </h3>
            <span className="text-xs font-mono text-[var(--theme-accent)] font-semibold">Live Lookbook Sync enabled</span>
          </div>

          <div className="w-full">
            {products.length > 0 ? (
              <>
                {/* Desktop and Tablet Table Mode */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[var(--theme-border)] text-xs text-[var(--theme-text-muted)] tracking-wider uppercase font-semibold">
                        <th className="py-4 px-6 font-bold">Image</th>
                        <th className="py-4 px-6 font-bold">Product Information</th>
                        <th className="py-4 px-6 font-bold">Category</th>
                        <th className="py-4 px-6 font-bold">Pricing Details (MRP / SP)</th>
                        <th className="py-4 px-6 font-bold text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--theme-border)] text-sm text-[var(--theme-text-secondary)]">
                      {products.map((p) => (
                        <tr key={p.id} id={`admin-row-${p.id}`} className="hover:bg-[#FAF9F5] transition-colors">
                          {/* Product Image preview */}
                          <td className="py-4 px-6">
                            <div className="w-12 h-14 bg-[var(--theme-bg)] border border-[var(--theme-border)] overflow-hidden">
                              <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                            </div>
                          </td>
                          {/* Name / Description */}
                          <td className="py-4 px-6">
                            <div>
                              <p id={`admin-p-name-${p.id}`} className="font-semibold text-[var(--theme-text-primary)] tracking-wide">{p.name}</p>
                              <p className="text-xs text-[var(--theme-text-muted)] line-clamp-1 max-w-sm font-light mt-0.5">{p.description}</p>
                            </div>
                          </td>
                          {/* Category Tag */}
                          <td className="py-4 px-6">
                            <span className="text-[10px] tracking-wider uppercase bg-[var(--theme-bg)] border border-[var(--theme-border)] text-[var(--theme-accent)] px-2 py-1 font-bold whitespace-nowrap">
                              {p.category}
                            </span>
                          </td>
                          {/* Pricing Details */}
                          <td className="py-4 px-6">
                            {(() => {
                              const mrpVal = p.mrp || p.priceInINR || 0;
                              const spVal = p.sp || p.priceInINR || 0;
                              const discountPercent = (mrpVal > 0 && mrpVal > spVal) ? Math.round(((mrpVal - spVal) / mrpVal) * 100) : 0;
                              return (
                                <div className="flex flex-col">
                                  {discountPercent > 0 ? (
                                    <>
                                      <div className="flex items-center gap-1.5 text-xs text-[var(--theme-text-muted)]">
                                        <span className="line-through">₹{mrpVal.toLocaleString('en-IN')}</span>
                                        <span className="text-red-600 font-bold text-[9px] bg-red-50 px-1 py-0.5 rounded-none animate-pulse">-{discountPercent}%</span>
                                      </div>
                                      <span className="font-semibold text-[var(--theme-text-primary)] text-sm">₹{spVal.toLocaleString('en-IN')}</span>
                                    </>
                                  ) : (
                                    <span className="font-semibold text-[var(--theme-text-primary)] text-sm">₹{spVal.toLocaleString('en-IN')}</span>
                                  )}
                                </div>
                              );
                            })()}
                          </td>
                          {/* Custom action icons */}
                          <td className="py-4 px-6">
                            <div className="flex gap-2 justify-center items-center">
                              <button
                                id={`admin-edit-btn-${p.id}`}
                                onClick={() => openModal(p)}
                                title="Edit"
                                className="p-2 bg-[var(--theme-bg)] hover:bg-[var(--theme-accent)] hover:text-white border border-[var(--theme-border)] text-[var(--theme-text-primary)] transition-colors cursor-pointer"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                id={`admin-delete-btn-${p.id}`}
                                onClick={() => handleDeleteCheck(p.id, p.name)}
                                title="Delete"
                                className="p-2 bg-[var(--theme-bg)] hover:bg-red-600 hover:text-white border border-[var(--theme-border)] text-red-600 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Responsive Stack Mode */}
                <div className="block md:hidden divide-y divide-[var(--theme-border)]">
                  {products.map((p) => {
                    const mrpVal = p.mrp || p.priceInINR || 0;
                    const spVal = p.sp || p.priceInINR || 0;
                    const discountPercent = (mrpVal > 0 && mrpVal > spVal) ? Math.round(((mrpVal - spVal) / mrpVal) * 100) : 0;
                    
                    return (
                      <div key={p.id} id={`admin-card-mobile-${p.id}`} className="p-4 flex flex-col gap-3.5 bg-white hover:bg-[#FAF9F5] transition-colors">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-14 bg-[var(--theme-bg)] border border-[var(--theme-border)] overflow-hidden shrink-0">
                            <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-[9px] tracking-wider uppercase bg-[var(--theme-bg)] border border-[var(--theme-border)] text-[var(--theme-accent)] px-2 py-0.5 font-bold inline-block mb-1">
                              {p.category}
                            </span>
                            <p id={`admin-mobile-p-name-${p.id}`} className="font-semibold text-sm text-[var(--theme-text-primary)] tracking-wide line-clamp-2 leading-tight">{p.name}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-[var(--theme-border)]/60">
                          <div>
                            {discountPercent > 0 ? (
                              <div className="flex flex-col">
                                <span className="text-[10px] text-[var(--theme-text-muted)] line-through">₹{mrpVal.toLocaleString('en-IN')}</span>
                                <span className="font-semibold text-stone-900 text-sm flex items-center gap-1.5 leading-none">
                                  ₹{spVal.toLocaleString('en-IN')}
                                  <span className="text-red-600 font-bold text-[9px] bg-red-50 px-1 py-0.5 rounded-none">-{discountPercent}%</span>
                                </span>
                              </div>
                            ) : (
                              <span className="font-semibold text-stone-900 text-sm">₹{spVal.toLocaleString('en-IN')}</span>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <button
                              id={`admin-edit-mobile-btn-${p.id}`}
                              onClick={() => openModal(p)}
                              title="Edit"
                              className="p-2.5 bg-[var(--theme-bg)] hover:bg-[var(--theme-accent)] hover:text-white border border-[var(--theme-border)] text-[var(--theme-text-primary)] transition-colors cursor-pointer"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              id={`admin-delete-mobile-btn-${p.id}`}
                              onClick={() => handleDeleteCheck(p.id, p.name)}
                              title="Delete"
                              className="p-2.5 bg-[var(--theme-bg)] hover:bg-red-600 hover:text-white border border-[var(--theme-border)] text-red-600 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="py-16 text-center text-stone-400 text-xs font-light">
                No cosmetics registered in this catalog lookup. Start by clicking "Add New Formula" above.
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Modal Entry (Covers both ADD and EDIT fields setup) */}
        {isModalOpen && (
          <div 
            id="admin-form-modal"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-md"
          >
            <div 
              className="bg-white border border-[var(--theme-border)] w-full max-w-lg rounded-none p-6 md:p-8 relative shadow-2xl overflow-y-auto max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Icon */}
              <button
                id="close-admin-form-modal"
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-stone-400 hover:text-[var(--theme-text-primary)] p-1 cursor-pointer font-medium text-xs tracking-wider uppercase"
              >
                Cancel
              </button>

              <h3 className="text-xl font-light uppercase text-[var(--theme-text-primary)] tracking-widest mb-6 pb-2 border-b border-[var(--theme-border)]">
                {editingProduct ? 'Edit Formula Details' : 'Add New Cosmetic Formula'}
              </h3>

              <form onSubmit={handleSaveProduct} className="space-y-5">
                {/* Product Name */}
                <div>
                  <label className="block text-[10px] tracking-widest uppercase font-bold text-[var(--theme-text-muted)] mb-2">
                    Product Title *
                  </label>
                  <input
                    id="form-product-name"
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Riya Velvet Liquid Eyeshadow"
                    className="w-full px-4 py-2.5 bg-[var(--theme-bg)] border border-[var(--theme-border)] text-sm text-[var(--theme-text-primary)] rounded-none focus:outline-none focus:border-[var(--theme-accent)]"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Category Selection */}
                  <div>
                    <label className="block text-[10px] tracking-widest uppercase font-bold text-[var(--theme-text-muted)] mb-2">
                      Product Lookup Category
                    </label>
                    <select
                      id="form-product-category"
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[var(--theme-bg)] border border-[var(--theme-border)] text-sm text-[var(--theme-text-primary)] rounded-none focus:outline-none focus:border-[var(--theme-accent)] cursor-pointer"
                    >
                      <option value="Makeup">Makeup</option>
                      <option value="Skin Care">Skin Care</option>
                      <option value="Hair Care">Hair Care</option>
                      <option value="Body Care">Body Care</option>
                      <option value="Undergarments">Undergarments</option>
                      <option value="Baby Care">Baby Care</option>
                      <option value="Bangles & Ornaments">Bangles & Ornaments</option>
                    </select>
                  </div>

                  {/* MRP (INR) */}
                  <div>
                    <label className="block text-[10px] tracking-widest uppercase font-bold text-[var(--theme-text-muted)] mb-2">
                      Max Retail Price (MRP) *
                    </label>
                    <input
                      id="form-product-mrp"
                      type="number"
                      value={formMrp}
                      onChange={(e) => setFormMrp(e.target.value)}
                      placeholder="e.g. 1500"
                      className="w-full px-4 py-2.5 bg-[var(--theme-bg)] border border-[var(--theme-border)] text-sm text-[var(--theme-text-primary)] rounded-none focus:outline-none focus:border-[var(--theme-accent)]"
                      required
                      min="1"
                    />
                  </div>

                  {/* SP (INR) */}
                  <div>
                    <label className="block text-[10px] tracking-widest uppercase font-bold text-[var(--theme-text-muted)] mb-2">
                      Selling Price (SP) *
                    </label>
                    <input
                      id="form-product-sp"
                      type="number"
                      value={formSp}
                      onChange={(e) => setFormSp(e.target.value)}
                      placeholder="e.g. 1250"
                      className="w-full px-4 py-2.5 bg-[var(--theme-bg)] border border-[var(--theme-border)] text-sm text-[var(--theme-text-primary)] rounded-none focus:outline-none focus:border-[var(--theme-accent)]"
                      required
                      min="1"
                    />
                  </div>
                </div>

                {/* Narrative description */}
                <div>
                  <label className="block text-[10px] tracking-widest uppercase font-bold text-[var(--theme-text-muted)] mb-2">
                    Details / Formula Description *
                  </label>
                  <textarea
                    id="form-product-description"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Briefly describe formula highlights, finish type, and wear time..."
                    rows={3}
                    className="w-full px-4 py-2.5 bg-[var(--theme-bg)] border border-[var(--theme-border)] text-sm text-[var(--theme-text-primary)] rounded-none focus:outline-none focus:border-[var(--theme-accent)] resize-none"
                    required
                  />
                </div>

                {/* Unsplash custom url option */}
                <div>
                  <label className="block text-[10px] tracking-widest uppercase font-bold text-[var(--theme-text-muted)] mb-1.5">
                    Unsplash Image URL
                  </label>
                  <span className="block text-[10px] text-stone-400 mb-2 font-light">
                    Leaving this empty will auto-assign a high-resolution beauty template for "{formCategory}"
                  </span>
                  <input
                    id="form-product-image"
                    type="url"
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full px-4 py-2.5 bg-[var(--theme-bg)] border border-[var(--theme-border)] text-sm text-[var(--theme-text-primary)] rounded-none focus:outline-none focus:border-[var(--theme-accent)]"
                  />
                </div>

                {formError && (
                  <p className="text-xs text-red-800 font-light bg-red-50 py-2.5 px-3 border-l-2 border-red-500">
                    {formError}
                  </p>
                )}

                <div className="flex gap-3 pt-4 border-t border-[var(--theme-border)]">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="w-1/2 py-3 bg-[var(--theme-bg)] border border-[var(--theme-border)] hover:border-stone-400 text-[var(--theme-text-primary)] font-semibold text-xs tracking-wider uppercase transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    id="form-product-save"
                    className="w-1/2 py-3 bg-[var(--theme-accent)] text-white font-semibold text-xs tracking-wider uppercase hover:bg-[var(--theme-accent-hover)] transition-colors cursor-pointer"
                  >
                    {editingProduct ? 'Save Changes' : 'Create Item'}
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

        {/* Custom Confirmation Modal for Deleting Products */}
        {deleteProductInfo && (
          <div 
            id="admin-delete-confirm-modal"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-md animate-fade-in"
          >
            <div 
              className="bg-white border border-[var(--theme-border)] w-full max-w-md rounded-none p-6 md:p-8 relative shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold uppercase text-[var(--theme-text-primary)] tracking-wider mb-2">
                Confirm Deletion
              </h3>
              <p className="text-sm text-[var(--theme-text-secondary)] font-light leading-relaxed mb-6">
                Are you absolutely sure you want to remove <strong className="font-semibold text-red-600">"{deleteProductInfo.name}"</strong> from the luxury cosmetics catalogue? This action cannot be undone.
              </p>

              <div className="flex gap-3">
                <button
                  type="button"
                  id="cancel-delete-btn"
                  onClick={() => setDeleteProductInfo(null)}
                  className="w-1/2 py-2.5 bg-white border border-[var(--theme-border)] text-stone-700 font-semibold text-xs tracking-wider uppercase hover:border-stone-400 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  id="confirm-delete-btn"
                  onClick={() => {
                    onDeleteProduct(deleteProductInfo.id);
                    setDeleteProductInfo(null);
                  }}
                  className="w-1/2 py-2.5 bg-red-600 text-white font-semibold text-xs tracking-wider uppercase hover:bg-red-700 transition-colors cursor-pointer"
                >
                  Delete Item
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
