import { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../firebase';
import { Product } from '../components/ProductCard';
import { FALLBACK_PRODUCTS } from '../fallbackData';

export function useRealtimeProducts() {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const cached = localStorage.getItem('riya_cosmetics_products_cache');
      return cached ? JSON.parse(cached) : FALLBACK_PRODUCTS;
    } catch {
      return FALLBACK_PRODUCTS;
    }
  });

  const [isLoading, setIsLoading] = useState<boolean>(() => {
    try {
      const cached = localStorage.getItem('riya_cosmetics_products_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        return parsed.length === 0;
      }
      return true;
    } catch {
      return true;
    }
  });

  const [error, setError] = useState<string | null>(null);

  // useMemo to instantiate and hold the Web Worker instance, preventing recreation on each render
  const workerInstance = useMemo(() => {
    if (typeof window === 'undefined' || typeof Worker === 'undefined') {
      return null;
    }
    try {
      const blob = new Blob([`
        self.onmessage = function(e) {
          const { rawDocs } = e.data;
          if (!rawDocs) return;
          try {
            const processed = rawDocs.map(function(item) {
              const data = item.data;
              const priceInINR = typeof data.priceInINR === 'number' ? data.priceInINR : Number(data.priceInINR || 0);
              const mrp = typeof data.mrp === 'number' ? data.mrp : Number(data.mrp || 0);
              const sp = typeof data.sp === 'number' ? data.sp : Number(data.sp || 0);
              return {
                id: item.id,
                name: data.name || '',
                category: data.category || '',
                priceInINR: priceInINR,
                mrp: mrp,
                sp: sp,
                description: data.description || '',
                image: data.image || '',
                hasCustomQty: !!data.hasCustomQty,
                qtyVal: typeof data.qtyVal === 'number' ? data.qtyVal : (data.qtyVal ? Number(data.qtyVal) : undefined),
                qtyUnit: data.qtyUnit || '',
                inStock: data.inStock !== false,
                createdAt: data.createdAt || '',
                updatedAt: data.updatedAt || '',
              };
            });
            self.postMessage({ success: true, products: processed });
          } catch (err) {
            self.postMessage({ success: false, error: err.message });
          }
        };
      `], { type: 'application/javascript' });
      return new Worker(URL.createObjectURL(blob));
    } catch (err) {
      console.warn("Failed to create Web Worker, will fallback to main thread:", err);
      return null;
    }
  }, []);

  // useMemo to define the memoized subscribe/data-retrieval function
  const subscribe = useMemo(() => {
    return (
      onUpdate: (prodList: Product[]) => void,
      onError: (err: any) => void
    ) => {
      const productsRef = collection(db, 'products');
      const q = query(productsRef);

      return onSnapshot(
        q,
        (snapshot) => {
          // Extract only raw JSON data from Firestore snapshots to allow posting to worker (since Firestore snapshot classes can't be sent)
          const rawDocs = snapshot.docs.map((doc) => ({
            id: doc.id,
            data: doc.data(),
          }));

          if (workerInstance) {
            // Processing offloaded to the Web Worker
            const handleWorkerMessage = (e: MessageEvent) => {
              if (e.data.success) {
                onUpdate(e.data.products);
              } else {
                console.error("Worker processing failed, running fallback on main thread:", e.data.error);
                // Fallback to main thread mapping
                const fallbackMapped = rawDocs.map(({ id, data }) => ({
                  id,
                  name: data.name || '',
                  category: data.category || '',
                  priceInINR: typeof data.priceInINR === 'number' ? data.priceInINR : Number(data.priceInINR || 0),
                  mrp: typeof data.mrp === 'number' ? data.mrp : Number(data.mrp || 0),
                  sp: typeof data.sp === 'number' ? data.sp : Number(data.sp || 0),
                  description: data.description || '',
                  image: data.image || '',
                  hasCustomQty: !!data.hasCustomQty,
                  qtyVal: typeof data.qtyVal === 'number' ? data.qtyVal : (data.qtyVal ? Number(data.qtyVal) : undefined),
                  qtyUnit: data.qtyUnit || '',
                  inStock: data.inStock !== false,
                  createdAt: data.createdAt || '',
                  updatedAt: data.updatedAt || '',
                }));
                onUpdate(fallbackMapped);
              }
            };

            workerInstance.onmessage = handleWorkerMessage;
            workerInstance.postMessage({ rawDocs });
          } else {
            // Direct processing on main thread if worker is unavailable
            const processed = rawDocs.map(({ id, data }) => ({
              id: doc.id, // Or docId
              name: data.name || '',
              category: data.category || '',
              priceInINR: typeof data.priceInINR === 'number' ? data.priceInINR : Number(data.priceInINR || 0),
              mrp: typeof data.mrp === 'number' ? data.mrp : Number(data.mrp || 0),
              sp: typeof data.sp === 'number' ? data.sp : Number(data.sp || 0),
              description: data.description || '',
              image: data.image || '',
              hasCustomQty: !!data.hasCustomQty,
              qtyVal: typeof data.qtyVal === 'number' ? data.qtyVal : (data.qtyVal ? Number(data.qtyVal) : undefined),
              qtyUnit: data.qtyUnit || '',
              inStock: data.inStock !== false,
              createdAt: data.createdAt || '',
              updatedAt: data.updatedAt || '',
            }));
            onUpdate(processed);
          }
        },
        (err) => {
          onError(err);
        }
      );
    };
  }, [workerInstance]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    try {
      unsubscribe = subscribe(
        (prodList) => {
          const finalProducts = (!prodList || prodList.length === 0) ? FALLBACK_PRODUCTS : prodList;
          setProducts(finalProducts);
          try {
            localStorage.setItem('riya_cosmetics_products_cache', JSON.stringify(finalProducts));
          } catch (e) {
            console.error('Failed to cache products:', e);
          }
          setIsLoading(false);
        },
        (err) => {
          console.error('Real-time sync error:', err);
          setError(err?.message || String(err));
          setProducts(FALLBACK_PRODUCTS);
          setIsLoading(false);
        }
      );
    } catch (err: any) {
      console.error('Failed to subscribe to products:', err);
      setError(err?.message || String(err));
      setProducts(FALLBACK_PRODUCTS);
      setIsLoading(false);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [subscribe]);

  // Cleanup Web Worker on unmount
  useEffect(() => {
    return () => {
      if (workerInstance) {
        workerInstance.terminate();
      }
    };
  }, [workerInstance]);

  return { products, isLoading, error };
}
