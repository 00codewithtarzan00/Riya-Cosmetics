import { collection, onSnapshot, query, orderBy, limit, where, addDoc, updateDoc, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Product, Notice, StoreConfig } from '../types';

// Mock Data
const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Luxury Velvet Matte Lipstick',
    price: 899,
    mrp: 1200,
    description: 'Long-lasting, weightless matte formula with a rich velvet finish. Infused with Vitamin E.',
    category: 'Makeup & Beauty',
    imageUrl: 'https://images.unsplash.com/photo-1586776977607-310e9c725c37?auto=format&fit=crop&q=80&w=800',
    available: true,
    isSpecial: true,
    createdAt: Date.now()
  },
  {
    id: '2',
    name: 'Hydrating Glow Serum',
    price: 1450,
    mrp: 1800,
    description: 'Advanced hydration with hyaluronic acid and niacinamide for a radiant, dewy complexion.',
    category: 'Skincare Essentials',
    imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800',
    available: true,
    isSpecial: true,
    createdAt: Date.now() - 10000
  },
  {
    id: '3',
    name: 'Professional Eyeshadow Palette',
    price: 2100,
    mrp: 2500,
    description: '18 highly pigmented shades ranging from soft neutrals to bold glitters.',
    category: 'Makeup & Beauty',
    imageUrl: 'https://images.unsplash.com/photo-1512496011212-323a784629c9?auto=format&fit=crop&q=80&w=800',
    available: true,
    createdAt: Date.now() - 20000
  },
  {
    id: '4',
    name: 'Argan Oil Hair Mask',
    price: 650,
    mrp: 750,
    description: 'Deep conditioning treatment for silky, smooth, and nourished hair.',
    category: 'Haircare Products',
    imageUrl: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&q=80&w=800',
    available: true,
    createdAt: Date.now() - 30000
  }
];

const MOCK_NOTICES: Notice[] = [
  {
    id: '1',
    title: 'New Bridal Collection Launch',
    content: 'Discover our exclusive range of bridal makeup and accessories available now!',
    createdAt: Date.now()
  }
];

const MOCK_CONFIG: StoreConfig = {
    logoUrl: '',
    heroImageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?q=80&w=1600&auto=format&fit=crop',
    aboutText: 'Riya Cosmetics is your premier destination for luxury beauty, authentic skincare, and professional makeup. We bring you the world\'s finest brands with guaranteed authenticity.',
    categories: ['Makeup & Beauty', 'Skincare Essentials', 'Fragrance & Scents', 'Haircare Products', 'Body & Bath', 'Nail Artistry'],
    categoryImages: {
        'Makeup & Beauty': 'https://images.unsplash.com/photo-1522335789203-aabd1956bb92?q=80&w=400&auto=format&fit=crop',
        'Skincare Essentials': 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=400&auto=format&fit=crop',
        'Fragrance & Scents': 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=400&auto=format&fit=crop',
        'Haircare Products': 'https://images.unsplash.com/photo-1527799822344-42ad9938b8e8?q=80&w=400&auto=format&fit=crop',
        'Body & Bath': 'https://images.unsplash.com/photo-1552046122-03184de85e08?q=80&w=400&auto=format&fit=crop',
        'Nail Artistry': 'https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=400&auto=format&fit=crop'
    },
    allCategoriesImageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?q=80&w=400&auto=format&fit=crop'
};

// Persistence Helpers
const LOCAL_STORAGE_KEYS = {
    PRODUCTS: 'riya_cosmetics_products',
    NOTICES: 'riya_cosmetics_notices',
    CONFIG: 'riya_cosmetics_config'
};

function getLocalData<T>(key: string, fallback: T): T {
    const data = localStorage.getItem(key);
    if (!data) return fallback;
    try {
        return JSON.parse(data);
    } catch {
        return fallback;
    }
}

function setLocalData<T>(key: string, data: T) {
    localStorage.setItem(key, JSON.stringify(data));
}

// Initial Mock Seed
if (!localStorage.getItem(LOCAL_STORAGE_KEYS.PRODUCTS)) {
    setLocalData(LOCAL_STORAGE_KEYS.PRODUCTS, MOCK_PRODUCTS);
}
if (!localStorage.getItem(LOCAL_STORAGE_KEYS.NOTICES)) {
    setLocalData(LOCAL_STORAGE_KEYS.NOTICES, MOCK_NOTICES);
}
if (!localStorage.getItem(LOCAL_STORAGE_KEYS.CONFIG)) {
    setLocalData(LOCAL_STORAGE_KEYS.CONFIG, MOCK_CONFIG);
}

export function subscribeToProducts(callback: (products: Product[]) => void, category?: string | null) {
  if (!db) {
    const update = () => {
        const allProds = getLocalData<Product[]>(LOCAL_STORAGE_KEYS.PRODUCTS, MOCK_PRODUCTS);
        let filtered = allProds;
        if (category) {
          filtered = allProds.filter(p => p.category === category);
        }
        callback(filtered);
    };

    update();
    window.addEventListener('storage', update);
    return () => window.removeEventListener('storage', update);
  }

  let q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
  if (category) {
    q = query(collection(db, 'products'), where('category', '==', category), orderBy('createdAt', 'desc'));
  }

  return onSnapshot(q, (snapshot) => {
    const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
    callback(products);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, 'products');
  });
}

export function subscribeToNotices(callback: (notices: Notice[]) => void) {
  if (!db) {
    const update = () => {
        callback(getLocalData<Notice[]>(LOCAL_STORAGE_KEYS.NOTICES, MOCK_NOTICES));
    };
    update();
    window.addEventListener('storage', update);
    return () => window.removeEventListener('storage', update);
  }

  const q = query(collection(db, 'notices'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const notices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notice));
    callback(notices);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, 'notices');
  });
}

export function subscribeToConfig(callback: (config: StoreConfig) => void) {
  if (!db) {
    const update = () => {
        callback(getLocalData<StoreConfig>(LOCAL_STORAGE_KEYS.CONFIG, MOCK_CONFIG));
    };
    update();
    window.addEventListener('storage', update);
    return () => window.removeEventListener('storage', update);
  }

  return onSnapshot(doc(db, 'config', 'global'), (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data() as StoreConfig;
      callback({
        ...MOCK_CONFIG, // Use mock as base for defaults
        ...data,
        categories: data.categories || MOCK_CONFIG.categories,
        categoryImages: data.categoryImages || MOCK_CONFIG.categoryImages
      });
    } else {
      callback(MOCK_CONFIG);
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, 'config/global');
  });
}

// Write Operations
export async function addProduct(product: Omit<Product, 'id'>) {
    try {
        const docRef = await addDoc(collection(db, 'products'), product);
        return docRef.id;
    } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, 'products');
    }
}

export async function updateProduct(id: string, updates: Partial<Product>) {
    try {
        await updateDoc(doc(db, 'products', id), updates);
    } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `products/${id}`);
    }
}

export async function deleteProduct(id: string) {
    try {
        await deleteDoc(doc(db, 'products', id));
    } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `products/${id}`);
    }
}

export async function updateConfig(updates: Partial<StoreConfig>) {
    try {
        await setDoc(doc(db, 'config', 'global'), updates, { merge: true });
    } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, 'config/global');
    }
}

export async function addNotice(notice: Omit<Notice, 'id'>) {
    try {
        const docRef = await addDoc(collection(db, 'notices'), notice);
        return docRef.id;
    } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, 'notices');
    }
}

export async function deleteNotice(id: string) {
    try {
        await deleteDoc(doc(db, 'notices', id));
    } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `notices/${id}`);
    }
}
