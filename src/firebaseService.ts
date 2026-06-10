import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query 
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
