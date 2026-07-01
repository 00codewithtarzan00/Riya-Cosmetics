import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBWJn6CeCHbEIp-vW7irr4Q1VKXbjxgu6U",
  authDomain: "riya-cosmetics-c6ee0.firebaseapp.com",
  projectId: "riya-cosmetics-c6ee0",
  storageBucket: "riya-cosmetics-c6ee0.firebasestorage.app",
  messagingSenderId: "129164780778",
  appId: "1:129164780778:web:336e0aa528bcaedd79e393"
};

const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  useFetchStreams: false,
  ignoreUndefinedProperties: true,
});
export const auth = getAuth();

