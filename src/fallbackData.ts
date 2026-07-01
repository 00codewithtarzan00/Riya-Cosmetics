import { Product } from './components/ProductCard';

export const FALLBACK_PRODUCTS: Product[] = [
  {
    id: "fb_1",
    name: "Luxury Matte Lipstick (Ruby Red)",
    category: "Makeup",
    priceInINR: 499,
    mrp: 799,
    sp: 499,
    description: "Highly pigmented, transfer-proof matte lipstick with a velvety texture that stays for up to 12 hours. Enriched with skin-conditioning Vitamin E.",
    image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=600",
    inStock: true,
    hasCustomQty: true,
    qtyVal: 4,
    qtyUnit: "g",
    createdAt: new Date().toISOString()
  },
  {
    id: "fb_2",
    name: "Premium Plumping Lip Gloss (Rose Petal)",
    category: "Makeup",
    priceInINR: 349,
    mrp: 499,
    sp: 349,
    description: "Hydrating high-shine lip gloss that gives a plump, luscious look with a non-sticky finish. Infused with rich jojoba oil and shea butter.",
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=600",
    inStock: true,
    hasCustomQty: true,
    qtyVal: 6,
    qtyUnit: "ml",
    createdAt: new Date().toISOString()
  },
  {
    id: "fb_3",
    name: "Vitamin C Brightening Serum",
    category: "Skin Care",
    priceInINR: 599,
    mrp: 899,
    sp: 599,
    description: "Advanced brightening serum formulated with 15% active Vitamin C, Ferulic Acid, and Hyaluronic Acid to fade dark spots and restore natural radiance.",
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=600",
    inStock: true,
    hasCustomQty: true,
    qtyVal: 30,
    qtyUnit: "ml",
    createdAt: new Date().toISOString()
  },
  {
    id: "fb_4",
    name: "Organic Argan Hair Nourishing Oil",
    category: "Hair Care",
    priceInINR: 450,
    mrp: 650,
    sp: 450,
    description: "Premium Moroccan argan oil blend to repair split ends, eliminate stubborn frizz, and provide deep hair nourishment from roots to tips.",
    image: "https://images.unsplash.com/photo-1608248597481-496100c80836?auto=format&fit=crop&q=80&w=600",
    inStock: true,
    hasCustomQty: true,
    qtyVal: 100,
    qtyUnit: "ml",
    createdAt: new Date().toISOString()
  },
  {
    id: "fb_5",
    name: "Waterproof Ultra-Black Eyeliner",
    category: "Makeup",
    priceInINR: 299,
    mrp: 399,
    sp: 299,
    description: "Ultra-precise, intense black liquid eyeliner that is 100% waterproof and smudge-proof for a bold, perfect winged look that lasts all day.",
    image: "https://images.unsplash.com/photo-1625093742435-6fa192b6fb10?auto=format&fit=crop&q=80&w=600",
    inStock: true,
    hasCustomQty: true,
    qtyVal: 5,
    qtyUnit: "ml",
    createdAt: new Date().toISOString()
  },
  {
    id: "fb_6",
    name: "Bridal Golden Bangles & Kada Set",
    category: "Bangles & Ornaments",
    priceInINR: 1250,
    mrp: 1999,
    sp: 1250,
    description: "Exquisite gold-plated traditional bridal bangles crafted with precision and sparkling stone-work for a majestic, timeless look.",
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=600",
    inStock: true,
    hasCustomQty: false,
    createdAt: new Date().toISOString()
  }
];

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
