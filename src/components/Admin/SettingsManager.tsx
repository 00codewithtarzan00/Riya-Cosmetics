import React, { useState, useEffect, useRef } from 'react';
import { subscribeToConfig, updateConfig } from '../../services/dataService';
import { StoreConfig } from '../../types';
import { Save, Image as ImageIcon, Upload, ChevronDown, ChevronUp } from 'lucide-react';

export default function SettingsManager() {
  const [config, setConfig] = useState<StoreConfig>({
    logoUrl: '',
    heroImageUrl: '',
    aboutText: '',
    categoryImages: {},
    allCategoriesImageUrl: '',
    categories: []
  });
  const [loading, setLoading] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [saved, setSaved] = useState(false);
  const [showCategorySettings, setShowCategorySettings] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const isDirtyRef = useRef(false);
  
  const setDirty = (val: boolean) => {
    setIsDirty(val);
    isDirtyRef.current = val;
  };
  
  const logoFileRef = useRef<HTMLInputElement>(null);
  const heroFileRef = useRef<HTMLInputElement>(null);
  const allCatFileRef = useRef<HTMLInputElement>(null);
  const categoryFileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const [newCategoryName, setNewCategoryName] = useState('');
  
  useEffect(() => {
    const unsubConfig = subscribeToConfig((data) => {
      // Use the ref to check the absolute latest dirty status
      // even if the snapshot arrives between render cycles
      if (!isDirtyRef.current) {
        setConfig({
          ...data,
          categories: data.categories || [],
          categoryImages: data.categoryImages || {}
        });
        setLoadingConfig(false);
      }
    });

    return () => {
      unsubConfig();
    };
  }, []); // Only subscribe once

  const addCategory = () => {
    if (loadingConfig) return;
    const trimmedName = newCategoryName.trim();
    if (trimmedName) {
      setConfig(prev => {
        const categories = prev.categories || [];
        if (categories.includes(trimmedName)) return prev;
        return {
          ...prev,
          categories: [...categories, trimmedName]
        };
      });
      setNewCategoryName('');
      setDirty(true);
    }
  };

  const removeCategory = (cat: string) => {
    if (window.confirm(`Delete "${cat}" category? Products already in this category will move to "Uncategorized" until edited.`)) {
      setConfig(prev => {
        const updatedCategories = (prev.categories || []).filter(c => c !== cat);
        const updatedImages = { ...(prev.categoryImages || {}) };
        delete updatedImages[cat];
        return {
          ...prev,
          categories: updatedCategories,
          categoryImages: updatedImages
        };
      });
      setDirty(true);
    }
  };

  const [uploading, setUploading] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: string, isCategory: boolean = false) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1000000) { 
        alert("Image quality is too high! Please use an image smaller than 1MB for fast loading.");
        return;
      }
      
      setUploading(field);
      const reader = new FileReader();
      
      reader.onloadend = () => {
        const result = reader.result as string;
        if (isCategory) {
          setConfig(prev => ({
            ...prev,
            categoryImages: {
              ...(prev.categoryImages || {}),
              [field]: result
            }
          }));
        } else {
          setConfig(prev => ({ ...prev, [field]: result }));
        }
        setDirty(true);
        setUploading(null);
        e.target.value = '';
      };

      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    try {
      await updateConfig(config);
      setSaved(true);
      setDirty(false);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <header className="mb-8 border-b border-brand-border pb-4">
        <h1 className="text-3xl font-display font-bold text-brand-accent">Global Settings</h1>
        <p className="text-sm text-brand-muted mt-1">Customize your storefront branding and message.</p>
      </header>

      <form onSubmit={handleSave} className="bg-white editorial-card overflow-hidden max-w-2xl relative">
        {loadingConfig && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] z-20 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-brand-accent border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Loading Settings...</p>
            </div>
          </div>
        )}
        <div className="p-8 space-y-6">
          <div className="space-y-6">
            <h3 className="text-xs uppercase font-bold tracking-widest text-brand-muted mb-4 pb-1">
              Store Branding
            </h3>

            <div className="space-y-3">
              <label className="text-xs font-bold flex items-center gap-2">
                <ImageIcon className="w-3.5 h-3.5" /> Logo Appearance
              </label>
              <div className="flex gap-4 items-start">
                {/* Preview Box */}
                <div className="w-12 h-12 bg-gray-50 border border-brand-border rounded flex-shrink-0 overflow-hidden flex items-center justify-center">
                  {config.logoUrl ? (
                    <img src={config.logoUrl} alt="Logo Preview" className="w-full h-full object-contain" />
                  ) : (
                    <ImageIcon className="w-4 h-4 text-gray-300" />
                  )}
                </div>
                
                <div className="flex-1 space-y-1">
                  <div className="flex gap-2">
                    <input
                      className="editorial-input h-10"
                      placeholder="Paste Link or Upload"
                      value={config.logoUrl || ''}
                      onChange={e => {
                        const val = e.target.value;
                        setConfig(prev => ({ ...prev, logoUrl: val }));
                        setIsDirty(true);
                      }}
                    />
                    <button 
                      type="button" 
                      disabled={uploading === 'logoUrl'}
                      onClick={() => logoFileRef.current?.click()}
                      className="editorial-btn-secondary h-10 px-3 flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
                    >
                      <Upload className={`w-4 h-4 ${uploading === 'logoUrl' ? 'animate-bounce' : ''}`} /> 
                      <span className="text-[10px] hidden md:inline">
                        {uploading === 'logoUrl' ? 'Reading...' : 'Upload'}
                      </span>
                    </button>
                  </div>
                  <input 
                    type="file" 
                    ref={logoFileRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={(e) => handleFileUpload(e, 'logoUrl')} 
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-3 pt-2">
              <label className="text-xs font-bold flex items-center gap-2">
                <ImageIcon className="w-3.5 h-3.5" /> Home Page Background
              </label>
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 bg-gray-50 border border-brand-border rounded flex-shrink-0 overflow-hidden flex items-center justify-center">
                  {config.heroImageUrl ? (
                    <img src={config.heroImageUrl} alt="Bg Preview" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-4 h-4 text-gray-300" />
                  )}
                </div>
                
                <div className="flex-1 space-y-1">
                  <div className="flex gap-2">
                    <input
                      className="editorial-input h-10"
                      placeholder="Background Image URL"
                      value={config.heroImageUrl || ''}
                      onChange={e => {
                        const val = e.target.value;
                        setConfig(prev => ({ ...prev, heroImageUrl: val }));
                        setIsDirty(true);
                      }}
                    />
                    <button 
                      type="button" 
                      disabled={uploading === 'heroImageUrl'}
                      onClick={() => heroFileRef.current?.click()}
                      className="editorial-btn-secondary h-10 px-3 flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
                    >
                      <Upload className={`w-4 h-4 ${uploading === 'heroImageUrl' ? 'animate-bounce' : ''}`} /> 
                      <span className="text-[10px] hidden md:inline">
                        {uploading === 'heroImageUrl' ? 'Reading...' : 'Upload'}
                      </span>
                    </button>
                  </div>
                  <input 
                    type="file" 
                    ref={heroFileRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={(e) => handleFileUpload(e, 'heroImageUrl')} 
                  />
                  <p className="text-[10px] text-brand-muted italic leading-none">
                    This image will appear blurred behind the category filters.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3 pt-4 border-t border-brand-border">
              <label className="text-xs font-bold flex items-center gap-2">
                <Save className="w-3.5 h-3.5" /> About Your Store
              </label>
              <textarea
                className="editorial-input min-h-[120px] py-4"
                placeholder="Riya Cosmetics is your premier destination for..."
                value={config.aboutText || ''}
                onChange={e => {
                  const val = e.target.value;
                  setConfig(prev => ({ ...prev, aboutText: val }));
                  setIsDirty(true);
                }}
              />
              <p className="text-[10px] text-brand-muted italic leading-none">
                This text appears in the "About" section of your website.
              </p>
            </div>

            <div className="pt-4 border-t border-brand-border">
              <button 
                type="button"
                onClick={() => setShowCategorySettings(!showCategorySettings)}
                className="flex items-center justify-between w-full py-2 hover:bg-gray-50 transition-colors rounded px-2 -mx-2"
              >
                <h3 className="text-xs uppercase font-bold tracking-widest text-brand-muted flex items-center gap-2">
                  <ImageIcon className="w-3.5 h-3.5" /> Category Icons
                </h3>
                {showCategorySettings ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showCategorySettings && (
                <div className="mt-6 space-y-6">
                  {/* All Items Category */}
                  <div className="p-4 bg-brand-accent/5 border border-brand-accent/20 rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-brand-accent uppercase tracking-tight">
                        All Items (Sab Saaman)
                      </label>
                    </div>
                    
                    <div className="flex gap-4 items-center">
                      <div className="w-16 h-16 bg-white border border-brand-accent rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center p-0.5 shadow-sm">
                        {config.allCategoriesImageUrl ? (
                          <img src={config.allCategoriesImageUrl} alt="All Items" className="w-full h-full object-cover rounded-full" />
                        ) : (
                          <div className="text-[10px] text-gray-300 font-bold text-center">No Image</div>
                        )}
                      </div>

                      <div className="flex-1 space-y-2">
                        <div className="flex gap-2">
                          <input
                            className="editorial-input h-9 px-3 text-[11px]"
                            placeholder="Image URL"
                            value={config.allCategoriesImageUrl || ''}
                            onChange={e => {
                              setConfig(prev => ({ ...prev, allCategoriesImageUrl: e.target.value }));
                              setIsDirty(true);
                            }}
                          />
                          <button 
                            type="button"
                            onClick={() => allCatFileRef.current?.click()}
                            disabled={uploading === 'allCategoriesImageUrl'}
                            className="editorial-btn-secondary h-9 px-3 flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
                          >
                            <Upload className={`w-3.5 h-3.5 ${uploading === 'allCategoriesImageUrl' ? 'animate-bounce' : ''}`} />
                          </button>
                        </div>
                        <input 
                          type="file" 
                          ref={allCatFileRef}
                          className="hidden" 
                          accept="image/*" 
                          onChange={(e) => handleFileUpload(e, 'allCategoriesImageUrl')} 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-brand-border my-4" />

                  {/* Add New Category */}
                  <div className="p-4 bg-gray-50 border border-brand-border border-dashed rounded-lg">
                    <h4 className="text-[10px] uppercase font-bold text-brand-muted mb-3">Add New Category</h4>
                    <div className="flex gap-2">
                       <input 
                         className="editorial-input h-10 px-4 text-sm"
                         placeholder="Category Name (e.g. Lips, Eyes, Organic)"
                         value={newCategoryName}
                         onChange={e => setNewCategoryName(e.target.value)}
                         onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCategory())}
                       />
                       <button 
                         type="button" 
                         onClick={addCategory}
                         className="editorial-btn-primary px-6 h-10 flex items-center justify-center rounded-md"
                       >
                         Add
                       </button>
                    </div>
                  </div>

                  {(config.categories || []).map((cat) => (
                    <div key={cat} className="p-4 bg-gray-50 border border-brand-border rounded-lg space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-brand-accent uppercase tracking-tight truncate max-w-[70%]">
                          {cat}
                        </label>
                        <button 
                          type="button" 
                          onClick={() => removeCategory(cat)}
                          className="text-[10px] text-red-500 font-bold hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                      
                      <div className="flex gap-4 items-center">
                        <div className="w-16 h-16 bg-white border border-brand-border rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center p-0.5 shadow-sm">
                          {config.categoryImages?.[cat] ? (
                            <img src={config.categoryImages[cat]} alt={cat} className="w-full h-full object-cover rounded-full" />
                          ) : (
                            <div className="text-[10px] text-gray-300 font-bold text-center">No Image</div>
                          )}
                        </div>

                        <div className="flex-1 space-y-2">
                          <div className="flex gap-2">
                            <input
                              className="editorial-input h-9 px-3 text-[11px]"
                              placeholder="Image URL"
                              value={config.categoryImages?.[cat] || ''}
                              onChange={e => {
                                setConfig(prev => ({
                                  ...prev,
                                  categoryImages: {
                                    ...(prev.categoryImages || {}),
                                    [cat]: e.target.value
                                  }
                                }));
                                setIsDirty(true);
                              }}
                            />
                            <button 
                              type="button"
                              onClick={() => categoryFileRefs.current[cat]?.click()}
                              disabled={uploading === cat}
                              className="editorial-btn-secondary h-9 px-3 flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
                            >
                              <Upload className={`w-3.5 h-3.5 ${uploading === cat ? 'animate-bounce' : ''}`} />
                            </button>
                          </div>
                          <input 
                            type="file" 
                            ref={el => { categoryFileRefs.current[cat] = el; }}
                            className="hidden" 
                            accept="image/*" 
                            onChange={(e) => handleFileUpload(e, cat, true)} 
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-6 flex flex-col md:flex-row items-center justify-between border-t gap-4">
          <div className="flex-1">
            {isDirty && (
              <div className="flex items-center gap-2 text-brand-accent animate-pulse">
                <div className="w-2 h-2 bg-brand-accent rounded-full"></div>
                <span className="text-[10px] font-bold uppercase tracking-widest">You have unsaved changes</span>
              </div>
            )}
            {!isDirty && saved && (
              <span className="text-[10px] font-bold uppercase tracking-widest text-green-600">All changes saved successfully</span>
            )}
          </div>
          <button
            type="submit"
            disabled={loading || uploading !== null}
            className={`flex items-center gap-2 editorial-btn-primary min-w-[160px] justify-center ${saved ? 'bg-green-600' : ''} disabled:opacity-50 transition-all duration-300`}
          >
            <Save className="w-4 h-4" />
            {loading ? 'Saving...' : uploading ? 'Wait for upload...' : saved ? 'Saved!' : 'Save All Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
