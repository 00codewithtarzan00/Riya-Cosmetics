import { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../firebase';
import { Product } from '../components/ProductCard';
import { FALLBACK_PRODUCTS } from '../fallbackData';

export function useRealtimeProducts() {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const cached = localStorage.getItem('riya_cosmetics_products_cache');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
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
          const processed = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
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
            };
          });
          onUpdate(processed);
        },
        (err) => {
          onError(err);
        }
      );
    };
  }, []);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    try {
      unsubscribe = subscribe(
        (prodList) => {
          setProducts(prodList);
          try {
            localStorage.setItem('riya_cosmetics_products_cache', JSON.stringify(prodList));
          } catch (e) {
            console.error('Failed to cache products:', e);
          }
          setIsLoading(false);
        },
        (err) => {
          console.error('Real-time sync error:', err);
          setError(err?.message || String(err));
          setProducts([]);
          setIsLoading(false);
        }
      );
    } catch (err: any) {
      console.error('Failed to subscribe to products:', err);
      setError(err?.message || String(err));
      setProducts([]);
      setIsLoading(false);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [subscribe]);

  return { products, isLoading, error };
}
