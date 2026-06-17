import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query,
  setDoc
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { Product } from './components/ProductCard';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const COLLECTION_NAME = 'products';

// Sync/subscribe to products listing in real-time
export function subscribeToProducts(
  onUpdate: (products: Product[]) => void,
  onError?: (error: Error) => void
) {
  try {
    const productsRef = collection(db, COLLECTION_NAME);
    const q = query(productsRef);
    
    return onSnapshot(
      q, 
      (snapshot) => {
        const prodList: Product[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          prodList.push({
            id: doc.id,
            name: data.name || '',
            category: data.category || '',
            priceInINR: typeof data.priceInINR === 'number' ? data.priceInINR : Number(data.priceInINR || 0),
            mrp: typeof data.mrp === 'number' ? data.mrp : Number(data.mrp || 0),
            sp: typeof data.sp === 'number' ? data.sp : Number(data.sp || 0),
            description: data.description || '',
            image: data.image || '',
            hasCustomQty: data.hasCustomQty || false,
            qtyVal: typeof data.qtyVal === 'number' ? data.qtyVal : undefined,
            qtyUnit: data.qtyUnit || '',
            inStock: data.inStock !== false,
            createdAt: data.createdAt || '',
            updatedAt: data.updatedAt || '',
          });
        });
        onUpdate(prodList);
      },
      (error) => {
        if (onError) {
          onError(error);
        } else {
          handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
        }
      }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, COLLECTION_NAME);
  }
}

// Add a product to Firestore
export async function dbAddProduct(newProduct: Omit<Product, 'id'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      name: newProduct.name,
      category: newProduct.category,
      priceInINR: Number(newProduct.priceInINR),
      mrp: Number(newProduct.mrp || newProduct.priceInINR),
      sp: Number(newProduct.sp || newProduct.priceInINR),
      description: newProduct.description,
      image: newProduct.image,
      hasCustomQty: newProduct.hasCustomQty || false,
      qtyVal: newProduct.qtyVal !== undefined ? Number(newProduct.qtyVal) : null,
      qtyUnit: newProduct.qtyUnit || '',
      inStock: newProduct.inStock !== false,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, COLLECTION_NAME);
    return '';
  }
}

// Update an existing product
export async function dbUpdateProduct(updatedProduct: Product): Promise<void> {
  const docPath = `${COLLECTION_NAME}/${updatedProduct.id}`;
  try {
    const docRef = doc(db, COLLECTION_NAME, String(updatedProduct.id));
    await updateDoc(docRef, {
      name: updatedProduct.name,
      category: updatedProduct.category,
      priceInINR: Number(updatedProduct.priceInINR),
      mrp: Number(updatedProduct.mrp || updatedProduct.priceInINR),
      sp: Number(updatedProduct.sp || updatedProduct.priceInINR),
      description: updatedProduct.description,
      image: updatedProduct.image,
      hasCustomQty: updatedProduct.hasCustomQty || false,
      qtyVal: updatedProduct.qtyVal !== undefined ? Number(updatedProduct.qtyVal) : null,
      qtyUnit: updatedProduct.qtyUnit || '',
      inStock: updatedProduct.inStock !== false,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
  }
}

// Delete an item
export async function dbDeleteProduct(productId: string | number): Promise<void> {
  const docPath = `${COLLECTION_NAME}/${productId}`;
  try {
    const docRef = doc(db, COLLECTION_NAME, String(productId));
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

// Dynamics Banners Types and Firestore Integration
export interface BannerConfig {
  type: 'None' | 'Image' | 'Video' | 'Text';
  urls: string[];
  text: string;
  textColor: string;
  textSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  duration?: number;
  textTag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  alignment?: 'left' | 'center' | 'right';
  bgColor?: string;
  marqueeEnabled?: boolean;
  marqueeDirection?: 'ltr' | 'rtl';
}

export interface SettingsConfig {
  banner1: BannerConfig;
  banner2: BannerConfig;
}

export const DEFAULT_SETTINGS: SettingsConfig = {
  banner1: {
    type: 'Image',
    urls: [
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=1200'
    ],
    text: 'FLAWLESS SKINCARE COUTURE',
    textColor: '#ffffff',
    textSize: '2xl',
    duration: 5,
    textTag: 'h2',
    alignment: 'left',
    bgColor: '#1c1917',
    marqueeEnabled: false,
    marqueeDirection: 'rtl'
  },
  banner2: {
    type: 'Image',
    urls: [
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&q=80&w=1200'
    ],
    text: 'LUXURY MAKEUP SELECTION',
    textColor: '#ffffff',
    textSize: '3xl',
    duration: 5,
    textTag: 'h3',
    alignment: 'left',
    bgColor: '#141211',
    marqueeEnabled: false,
    marqueeDirection: 'rtl'
  }
};

const SETTINGS_COLLECTION = 'settings';
const BANNERS_DOC_NAME = 'banners';

// Subscribe to banner settings document
export function subscribeToBanners(
  onUpdate: (settings: SettingsConfig) => void,
  onError?: (error: Error) => void
) {
  const docRef = doc(db, SETTINGS_COLLECTION, BANNERS_DOC_NAME);
  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const settings: SettingsConfig = {
          banner1: {
            type: data.banner1?.type || 'None',
            urls: Array.isArray(data.banner1?.urls) ? data.banner1.urls : [],
            text: data.banner1?.text || '',
            textColor: data.banner1?.textColor || '#ffffff',
            textSize: data.banner1?.textSize || '2xl',
            duration: typeof data.banner1?.duration === 'number' ? data.banner1.duration : 5,
            textTag: data.banner1?.textTag || 'h2',
            alignment: data.banner1?.alignment || 'left',
            bgColor: data.banner1?.bgColor || '#1c1917',
            marqueeEnabled: data.banner1?.marqueeEnabled || false,
            marqueeDirection: data.banner1?.marqueeDirection || 'rtl',
          },
          banner2: {
            type: data.banner2?.type || 'None',
            urls: Array.isArray(data.banner2?.urls) ? data.banner2.urls : [],
            text: data.banner2?.text || '',
            textColor: data.banner2?.textColor || '#ffffff',
            textSize: data.banner2?.textSize || '2xl',
            duration: typeof data.banner2?.duration === 'number' ? data.banner2.duration : 5,
            textTag: data.banner2?.textTag || 'h3',
            alignment: data.banner2?.alignment || 'left',
            bgColor: data.banner2?.bgColor || '#141211',
            marqueeEnabled: data.banner2?.marqueeEnabled || false,
            marqueeDirection: data.banner2?.marqueeDirection || 'rtl',
          }
        };
        onUpdate(settings);
      } else {
        // Document doesn't exist, return default preset
        onUpdate(DEFAULT_SETTINGS);
      }
    },
    (error) => {
      if (onError) {
        onError(error);
      } else {
        handleFirestoreError(error, OperationType.GET, `${SETTINGS_COLLECTION}/${BANNERS_DOC_NAME}`);
      }
    }
  );
}

// Update settings document in firestore
export async function dbUpdateBanners(settings: SettingsConfig): Promise<void> {
  const docRef = doc(db, SETTINGS_COLLECTION, BANNERS_DOC_NAME);
  try {
    await setDoc(docRef, {
      banner1: {
        type: settings.banner1.type,
        urls: settings.banner1.urls,
        text: settings.banner1.text,
        textColor: settings.banner1.textColor,
        textSize: settings.banner1.textSize,
        duration: settings.banner1.duration || 5,
        textTag: settings.banner1.textTag || 'h2',
        alignment: settings.banner1.alignment || 'left',
        bgColor: settings.banner1.bgColor || '#1c1917',
        marqueeEnabled: settings.banner1.marqueeEnabled || false,
        marqueeDirection: settings.banner1.marqueeDirection || 'rtl'
      },
      banner2: {
        type: settings.banner2.type,
        urls: settings.banner2.urls,
        text: settings.banner2.text,
        textColor: settings.banner2.textColor,
        textSize: settings.banner2.textSize,
        duration: settings.banner2.duration || 5,
        textTag: settings.banner2.textTag || 'h3',
        alignment: settings.banner2.alignment || 'left',
        bgColor: settings.banner2.bgColor || '#141211',
        marqueeEnabled: settings.banner2.marqueeEnabled || false,
        marqueeDirection: settings.banner2.marqueeDirection || 'rtl'
      }
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${SETTINGS_COLLECTION}/${BANNERS_DOC_NAME}`);
  }
}
