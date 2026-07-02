import { Product } from './components/ProductCard';

export const FALLBACK_PRODUCTS: Product[] = [];

export const FIRESTORE_RULES_TEXT = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Global default safety net - deny by default
    match /{document=**} {
      allow read, write: if false;
    }

    // Products Collection Rules
    match /products/{productId} {
      allow read: if true;
      allow create, update, delete: if true;
    }

    // Settings Collection Rules
    match /settings/{settingId} {
      allow read: if true;
      allow write: if true;
    }

    // Orders Collection Rules
    match /orders/{orderId} {
      allow read, delete: if true;
      allow create, update: if true;
    }

    // User Profile Rules
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}`;
